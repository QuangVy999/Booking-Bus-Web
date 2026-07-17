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

    async updateBookingStatus(id, status, trx = null) {
      const executor = trx || db;
      await executor('bookings').where({ id }).update({
        status,
        updated_at: new Date()
      });
    },

    async getTransaction() {
      return db.transaction();
    }
  };
}
