export async function up(knex) {
  await knex.schema.createTable('routes', (table) => {
    table.string('id').primary();
    table.string('origin').notNullable();
    table.string('destination').notNullable();
    table.double('distance');
    table.string('duration');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('vehicles', (table) => {
    table.string('id').primary();
    table.string('plate_number').notNullable().unique();
    table.string('type').notNullable(); // e.g. Limousine, Sleeper, Regular
    table.integer('capacity').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('trips', (table) => {
    table.string('id').primary();
    table.string('route_id').notNullable()
      .references('id').inTable('routes')
      .onDelete('CASCADE');
    table.string('vehicle_id').notNullable()
      .references('id').inTable('vehicles')
      .onDelete('CASCADE');
    table.timestamp('departure_time').notNullable();
    table.timestamp('arrival_time').notNullable();
    table.double('price').notNullable();
    table.string('status').notNullable().defaultTo('OPEN'); // OPEN, DEPARTED, COMPLETED, CANCELLED
    table.string('bus_company').notNullable().defaultTo('Phương Trang Demo');
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('trips');
  await knex.schema.dropTableIfExists('vehicles');
  await knex.schema.dropTableIfExists('routes');
}
