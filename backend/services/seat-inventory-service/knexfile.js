import 'dotenv/config';

export default {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 15433,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'seat_inventory_db'
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};
