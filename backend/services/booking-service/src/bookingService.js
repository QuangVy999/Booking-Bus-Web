import crypto from 'node:crypto';
import { publishBookingEvent } from './rabbitmq.js';
import { publishAnalyticsEvent } from './kafka.js';

export function createBookingService(repository, seatInventoryGateway, tripGateway) {
  return {
    async createBooking({ tripId, seatNumbers, name, email, phone }) {
      if (!tripId || !seatNumbers || seatNumbers.length === 0 || !name || !email || !phone) {
        throw new Error('INVALID_ARGUMENT: All fields (tripId, seatNumbers, name, email, phone) are required');
      }

      // Generate booking code BKG + 6 random upper chars/numbers
      const bookingCode = 'BKG' + crypto.randomBytes(3).toString('hex').toUpperCase();
      const bookingId = crypto.randomUUID();

      // Get trip price
      let tripPrice = 0;
      if (tripGateway) {
        try {
          const trip = await tripGateway.getTripById(tripId);
          if (trip) tripPrice = trip.price || 0;
        } catch (err) {
          console.warn(`Could not fetch trip price for trip ${tripId}:`, err.message);
        }
      }
      const totalAmount = tripPrice * seatNumbers.length;

      const bookingData = {
        id: bookingId,
        booking_code: bookingCode,
        trip_id: tripId,
        passenger_name: name,
        passenger_email: email,
        passenger_phone: phone,
        total_amount: totalAmount,
        status: 'DRAFT',
        created_at: new Date(),
        updated_at: new Date()
      };

      const trx = await repository.getTransaction();
      let createdBooking = null;

      try {
        // 1. Create booking in DRAFT state
        createdBooking = await repository.createBooking(bookingData, seatNumbers, trx);
        
        // 2. Request seat hold from Seat Inventory Service via gRPC
        const holdResult = await seatInventoryGateway.holdSeats(tripId, seatNumbers, bookingId);
        
        if (holdResult.success) {
          // 3. If hold succeeded, update status to PENDING_PAYMENT
          await repository.updateBookingStatus(bookingId, 'PENDING_PAYMENT', trx);
          await trx.commit();
          await publishAnalyticsEvent('booking-events', 'booking.created', {
            bookingId, tripId, seatCount: seatNumbers.length, route: tripId
          });
          
          return {
            bookingId: bookingId,
            bookingCode: bookingCode,
            status: 'PENDING_PAYMENT',
            expiryTimestamp: holdResult.expiryTimestamp
          };
        } else {
          // 4. If hold failed (seat already held/booked), rollback and throw error
          await trx.rollback();
          throw new Error(`FAILED_PRECONDITION: ${holdResult.message}`);
        }
      } catch (error) {
        if (!trx.isCompleted) {
          await trx.rollback();
        }
        throw error;
      }
    },

    async confirmPayment(bookingId) {
      if (!bookingId) {
        throw new Error('INVALID_ARGUMENT: booking_id is required');
      }

      const booking = await repository.getBookingById(bookingId);
      if (!booking) {
        throw new Error('NOT_FOUND: Booking not found');
      }

      if (booking.status === 'PAID') {
        return { success: true, status: 'PAID' };
      }

      if (booking.status !== 'PENDING_PAYMENT') {
        throw new Error(`FAILED_PRECONDITION: Cannot pay for a booking in status ${booking.status}`);
      }

      // 1. gRPC Call to confirm seats permanently in Seat Inventory Service
      const confirmResult = await seatInventoryGateway.confirmSeats(booking.trip_id, booking.seatNumbers, bookingId);
      
      if (!confirmResult.success) {
        throw new Error(`FAILED_PRECONDITION: Seat confirmation failed: ${confirmResult.message}`);
      }

      // 2. Update booking status to PAID in local database
      await repository.updateBookingStatus(bookingId, 'PAID');

      // 3. Publish paid booking event to RabbitMQ
      const eventMessage = {
        bookingId: booking.id,
        bookingCode: booking.booking_code,
        tripId: booking.trip_id,
        seatNumbers: booking.seatNumbers,
        passengerName: booking.passenger_name,
        passengerEmail: booking.passenger_email,
        passengerPhone: booking.passenger_phone,
        timestamp: Date.now()
      };

      await publishBookingEvent('booking.paid', eventMessage);
      await publishAnalyticsEvent('payment-events', 'payment.completed', {
        bookingId: booking.id, tripId: booking.trip_id, route: booking.trip_id,
        amount: Number(booking.total_amount || 0), currency: 'VND'
      });

      return {
        success: true,
        status: 'PAID'
      };
    },

    async cancelBooking(bookingId) {
      if (!bookingId) {
        throw new Error('INVALID_ARGUMENT: booking_id is required');
      }

      const booking = await repository.getBookingById(bookingId);
      if (!booking) {
        throw new Error('NOT_FOUND: Booking not found');
      }

      if (booking.status === 'CANCELLED') {
        return { success: true, status: 'CANCELLED' };
      }

      // 1. gRPC Call to release seats in Seat Inventory Service
      await seatInventoryGateway.releaseSeats(booking.trip_id, booking.seatNumbers, bookingId);

      // 2. Update local status to CANCELLED
      await repository.updateBookingStatus(bookingId, 'CANCELLED');

      return {
        success: true,
        status: 'CANCELLED'
      };
    },

    async getBooking({ bookingId, bookingCode, passengerEmail }) {
      if (bookingId) {
        const booking = await repository.getBookingById(bookingId);
        if (!booking) throw new Error('NOT_FOUND: Booking not found');
        return booking;
      }

      if (bookingCode) {
        const booking = await repository.getBookingByCode(bookingCode);
        if (!booking) throw new Error('NOT_FOUND: Booking not found');
        if (passengerEmail && booking.passenger_email.toLowerCase() !== passengerEmail.toLowerCase()) {
          throw new Error('NOT_FOUND: Booking code and email do not match');
        }
        return booking;
      }

      throw new Error('INVALID_ARGUMENT: Either bookingId or bookingCode is required');
    },

    async getBookingsByTrip(tripId) {
      if (!tripId) {
        throw new Error('INVALID_ARGUMENT: trip_id is required');
      }
      return repository.getBookingsByTrip(tripId);
    },

    async getBookingsByEmail(email) {
      if (!email) {
        throw new Error('INVALID_ARGUMENT: email is required');
      }
      return repository.getBookingsByEmail(email);
    },

    async checkInBooking(bookingCode) {
      if (!bookingCode) {
        throw new Error('INVALID_ARGUMENT: booking_code is required');
      }

      const booking = await repository.getBookingByCode(bookingCode);
      if (!booking) {
        throw new Error('NOT_FOUND: Booking not found');
      }

      if (booking.status !== 'PAID') {
        throw new Error(`FAILED_PRECONDITION: Cannot check-in a booking with status ${booking.status}`);
      }

      await repository.updateBookingStatus(booking.id, 'CHECKED_IN');

      const eventMessage = {
        bookingId: booking.id,
        bookingCode: booking.booking_code,
        tripId: booking.trip_id,
        timestamp: Date.now()
      };
      await publishBookingEvent('booking.checked_in', eventMessage);

      return {
        success: true,
        message: 'Check-in successful',
        newStatus: 'CHECKED_IN'
      };
    }
  };
}
