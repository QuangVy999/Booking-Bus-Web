export async function up(knex) {
  await knex.schema.table('bookings', (table) => {
    table.integer('total_amount').defaultTo(0);
  });
}

export async function down(knex) {
  await knex.schema.table('bookings', (table) => {
    table.dropColumn('total_amount');
  });
}
