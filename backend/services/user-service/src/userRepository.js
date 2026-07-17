export function createUserRepository(db) {
  return {
    async create(user) {
      const [inserted] = await db('users').insert(user).returning('*');
      return inserted;
    },
    async findByEmail(email) {
      return db('users').where({ email }).first();
    },
    async findById(id) {
      return db('users').where({ id }).first();
    },
    async addSavedPassenger(passenger) {
      const [inserted] = await db('saved_passengers').insert(passenger).returning('*');
      return inserted;
    },
    async getSavedPassengers(userId) {
      return db('saved_passengers').where({ user_id: userId }).orderBy('id', 'asc');
    },
    async deleteSavedPassenger(id) {
      return db('saved_passengers').where({ id }).del();
    }
  };
}
