const TABLE_NAME = 'seat_inventory';

export function createSeatInventoryRepository(db) {
  return {
    async findSeatsByNumbers(tripId, seatNumbers) {
      return db(TABLE_NAME)
        .where({ trip_id: tripId })
        .whereIn('seat_number', seatNumbers);
    },

    async updateSeatsStatus(tripId, seatNumbers, status) {
      const rows = seatNumbers.map(num => ({
        id: `${tripId}_${num}`,
        trip_id: tripId,
        seat_number: num,
        status: status,
        updated_at: new Date()
      }));

      return db(TABLE_NAME)
        .insert(rows)
        .onConflict('id')
        .merge(['status', 'updated_at']);
    },

    async getInventoryByTrip(tripId) {
      return db(TABLE_NAME).where({ trip_id: tripId });
    }
  };
}
