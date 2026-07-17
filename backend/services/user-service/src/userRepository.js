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
    }
  };
}
