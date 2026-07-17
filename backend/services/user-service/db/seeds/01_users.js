import bcrypt from 'bcryptjs';

export async function seed(knex) {
  await knex('users').del();
  
  const adminHash = bcrypt.hashSync('admin@123', 10);
  const staffHash = bcrypt.hashSync('staff@123', 10);
  const userHash = bcrypt.hashSync('user@123', 10);
  
  await knex('users').insert([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: adminHash,
      role: 'Admin'
    },
    {
      id: 2,
      name: 'Check-in Staff',
      email: 'staff@gmail.com',
      password: staffHash,
      role: 'Check-in Staff'
    },
    {
      id: 3,
      name: 'Customer',
      email: 'customer@gmail.com',
      password: userHash,
      role: 'Registered Customer'
    }
  ]);
};
