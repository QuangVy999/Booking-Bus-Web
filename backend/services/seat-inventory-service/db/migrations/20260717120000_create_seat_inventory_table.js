export async function up(knex) {
  await knex.schema.createTable('seat_inventory', (table) => {
    table.string('id').primary(); // We can use tripId + '_' + seatNumber as ID
    table.string('trip_id').notNullable();
    table.string('seat_number').notNullable();
    table.string('status').notNullable().defaultTo('AVAILABLE'); // AVAILABLE, BOOKED, BLOCKED
    table.timestamps(true, true);
    table.unique(['trip_id', 'seat_number']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('seat_inventory');
}
