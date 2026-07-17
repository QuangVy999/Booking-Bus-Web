export async function up(knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS saved_passengers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex) {
  await knex.raw(`DROP TABLE IF EXISTS saved_passengers;`);
}
