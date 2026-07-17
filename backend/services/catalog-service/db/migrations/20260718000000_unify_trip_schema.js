export async function up(knex) {
  // Create stops table
  const hasStops = await knex.schema.hasTable('stops');
  if (!hasStops) {
    await knex.schema.createTable('stops', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('address').notNullable();
      table.timestamps(true, true);
    });
  }

  // Alter routes table to add stops references and name
  await knex.schema.alterTable('routes', (table) => {
    table.string('name').nullable();
    table.string('start_stop_id').nullable()
      .references('id').inTable('stops')
      .onDelete('CASCADE');
    table.string('end_stop_id').nullable()
      .references('id').inTable('stops')
      .onDelete('CASCADE');
  });

  // Alter vehicles table to add admin fields
  await knex.schema.alterTable('vehicles', (table) => {
    table.string('license_plate').nullable();
    table.integer('total_seats').nullable();
    table.text('seat_map').nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('vehicles', (table) => {
    table.dropColumn('license_plate');
    table.dropColumn('total_seats');
    table.dropColumn('seat_map');
  });

  await knex.schema.alterTable('routes', (table) => {
    table.dropColumn('name');
    table.dropForeignKey(['start_stop_id']);
    table.dropColumn('start_stop_id');
    table.dropForeignKey(['end_stop_id']);
    table.dropColumn('end_stop_id');
  });

  await knex.schema.dropTableIfExists('stops');
}
