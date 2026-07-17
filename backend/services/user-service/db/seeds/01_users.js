import bcrypt from 'bcryptjs';

export async function seed(knex) {
  await knex('users').del();
  
  const passwordHash = bcrypt.hashSync('123456', 10);
  
  await knex('users').insert([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'Admin'
    },
    {
      id: 2,
      name: 'Test Student',
      email: 'student@example.com',
      password: passwordHash,
      role: 'Registered'
    }
  ]);
};
