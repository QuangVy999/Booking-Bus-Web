import grpc from '@grpc/grpc-js';

function toGrpcError(error) {
  const message = error.message || 'Unknown booking service error';
  
  if (message.startsWith('INVALID_ARGUMENT')) {
    return {
      code: grpc.status.INVALID_ARGUMENT,
      message: message
    };
  }
  if (message.startsWith('NOT_FOUND')) {
    return {
      code: grpc.status.NOT_FOUND,
      message: message
    };
  }
  if (message.startsWith('FAILED_PRECONDITION')) {
    return {
      code: grpc.status.FAILED_PRECONDITION,
      message: message
    };
  }

  return {
    code: grpc.status.INTERNAL,
    message: message
  };
}

export function createBookingGrpcHandlers(bookingService) {
  return {
    async createBooking(call, callback) {
      try {
        const { trip_id, seat_numbers, passenger_name, passenger_email, passenger_phone } = call.request;
        const result = await bookingService.createBooking({
          tripId: trip_id,
          seatNumbers: seat_numbers,
          name: passenger_name,
          email: passenger_email,
          phone: passenger_phone
        });
        
        callback(null, {
          booking_id: result.bookingId,
          booking_code: result.bookingCode,
          status: result.status,
          expiry_timestamp: result.expiryTimestamp
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async confirmPayment(call, callback) {
      try {
        const { booking_id } = call.request;
        const result = await bookingService.confirmPayment(booking_id);
        
        callback(null, {
          success: result.success,
          status: result.status
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async cancelBooking(call, callback) {
      try {
        const { booking_id } = call.request;
        const result = await bookingService.cancelBooking(booking_id);
        
        callback(null, {
          success: result.success,
          status: result.status
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async getBooking(call, callback) {
      try {
        const { booking_id, booking_code, passenger_email } = call.request;
        const result = await bookingService.getBooking({
          bookingId: booking_id,
          bookingCode: booking_code,
          passengerEmail: passenger_email
        });
        
        callback(null, {
          booking_id: result.id,
          booking_code: result.booking_code,
          trip_id: result.trip_id,
          seat_numbers: result.seatNumbers,
          passenger_name: result.passenger_name,
          passenger_email: result.passenger_email,
          status: result.status
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async getBookingsByTrip(call, callback) {
      try {
        const { trip_id } = call.request;
        const result = await bookingService.getBookingsByTrip(trip_id);
        
        callback(null, {
          bookings: result.map(b => ({
            booking_id: b.id,
            booking_code: b.booking_code,
            trip_id: b.trip_id,
            seat_numbers: b.seatNumbers,
            passenger_name: b.passenger_name,
            passenger_email: b.passenger_email,
            status: b.status
          }))
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async getBookingsByEmail(call, callback) {
      try {
        const { email } = call.request;
        const result = await bookingService.getBookingsByEmail(email);
        
        callback(null, {
          bookings: result.map(b => ({
            booking_id: b.id,
            booking_code: b.booking_code,
            trip_id: b.trip_id,
            seat_numbers: b.seatNumbers,
            passenger_name: b.passenger_name,
            passenger_email: b.passenger_email,
            status: b.status
          }))
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async checkInBooking(call, callback) {
      try {
        const { booking_code } = call.request;
        const result = await bookingService.checkInBooking(booking_code);
        
        callback(null, {
          success: result.success,
          message: result.message,
          new_status: result.newStatus
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    }
  };
}
