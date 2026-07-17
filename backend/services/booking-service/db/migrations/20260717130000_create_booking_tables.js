export async function up(knex) {
  await knex.schema.createTable('bookings', (table) => {
    table.string('id').primary();
    table.string('booking_code').notNullable().unique();
    table.string('trip_id').notNullable();
    table.string('passenger_name').notNullable();
    table.string('passenger_email').notNullable();
    table.string('passenger_phone').notNullable();
    table.string('status').notNullable().defaultTo('DRAFT'); // DRAFT, PENDING_PAYMENT, PAID, CANCELLED, EXPIRED
    table.timestamps(true, true);
  });

  await knex.schema.createTable('booking_seats', (table) => {
    table.increments('id').primary();
    table.string('booking_id').notNullable()
      .references('id').inTable('bookings')
      .onDelete('CASCADE');
    table.string('seat_number').notNullable();
    table.unique(['booking_id', 'seat_number']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('booking_seats');
  await knex.schema.dropTableIfExists('bookings');
}
