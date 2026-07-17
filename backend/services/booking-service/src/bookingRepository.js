export function createBookingRepository(db) {
  return {
    async createBooking(booking, seatNumbers, trx = null) {
      const executor = trx || db;
      
      await executor('bookings').insert(booking);
      
      const seatRows = seatNumbers.map(num => ({
        booking_id: booking.id,
        seat_number: num
      }));
      await executor('booking_seats').insert(seatRows);
      
      return this.getBookingById(booking.id, executor);
    },

    async getBookingById(id, executor = db) {
      const booking = await executor('bookings').where({ id }).first();
      if (!booking) return null;
      
      const seats = await executor('booking_seats').where({ booking_id: id }).select('seat_number');
      return {
        ...booking,
        seatNumbers: seats.map(s => s.seat_number)
      };
    },

    async getBookingByCode(bookingCode, executor = db) {
      const booking = await executor('bookings').where({ booking_code: bookingCode }).first();
      if (!booking) return null;
      
      const seats = await executor('booking_seats').where({ booking_id: booking.id }).select('seat_number');
      return {
        ...booking,
        seatNumbers: seats.map(s => s.seat_number)
      };
    },

    async getBookingsByTrip(tripId, executor = db) {
      const bookings = await executor('bookings').where({ trip_id: tripId });
      
      const enrichedBookings = await Promise.all(bookings.map(async b => {
        const seats = await executor('booking_seats').where({ booking_id: b.id }).select('seat_number');
        return {
          ...b,
          seatNumbers: seats.map(s => s.seat_number)
        };
      }));
      return enrichedBookings;
    },

    async updateBookingStatus(id, status, trx = null) {
      const executor = trx || db;
      await executor('bookings').where({ id }).update({
        status,
        updated_at: new Date()
      });
    },

    async getExpiredPendingBookings(minutes, executor = db) {
      const expirationTime = new Date(Date.now() - minutes * 60 * 1000);
      const bookings = await executor('bookings')
        .where('status', 'PENDING_PAYMENT')
        .where('created_at', '<', expirationTime);
        
      const enrichedBookings = await Promise.all(bookings.map(async b => {
        const seats = await executor('booking_seats').where({ booking_id: b.id }).select('seat_number');
        return {
          ...b,
          seatNumbers: seats.map(s => s.seat_number)
        };
      }));
      return enrichedBookings;
    },

    async getTransaction() {
      return db.transaction();
    }
  };
}
