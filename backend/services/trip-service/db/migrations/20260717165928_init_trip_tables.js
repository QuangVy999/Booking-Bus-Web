/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  // STOPS
  await knex.schema.createTable('stops', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('address').notNullable();
    table.timestamps(true, true);
  });

  // ROUTES
  await knex.schema.createTable('routes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.uuid('start_stop_id').references('id').inTable('stops').onDelete('CASCADE');
    table.uuid('end_stop_id').references('id').inTable('stops').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // VEHICLES
  await knex.schema.createTable('vehicles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('license_plate').notNullable().unique();
    table.integer('total_seats').notNullable();
    table.text('seat_map').notNullable(); // JSON string representation of seats
    table.timestamps(true, true);
  });

  // TRIPS
  await knex.schema.createTable('trips', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('route_id').references('id').inTable('routes').onDelete('CASCADE');
    table.uuid('vehicle_id').references('id').inTable('vehicles').onDelete('CASCADE');
    table.timestamp('departure_time').notNullable();
    table.timestamp('arrival_time').notNullable();
    table.integer('price').notNullable();
    table.string('status').notNullable().defaultTo('PENDING'); // PENDING, ACTIVE, LOCKED, DEPARTED, COMPLETED
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  await knex.schema.dropTableIfExists('trips');
  await knex.schema.dropTableIfExists('vehicles');
  await knex.schema.dropTableIfExists('routes');
  await knex.schema.dropTableIfExists('stops');
};
