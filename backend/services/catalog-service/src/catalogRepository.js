import { db } from './db.js';

export const catalogRepository = {
  async findTrips(origin, destination, dateStr) {
    // dateStr is 'YYYY-MM-DD'
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`).toISOString();
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`).toISOString();

    return db('trips')
      .join('routes', 'trips.route_id', 'routes.id')
      .join('vehicles', 'trips.vehicle_id', 'vehicles.id')
      .where('routes.origin', origin)
      .where('routes.destination', destination)
      .whereBetween('trips.departure_time', [startOfDay, endOfDay])
      .select(
        'trips.id as trip_id',
        'trips.departure_time',
        'trips.arrival_time',
        'trips.price',
        'trips.status',
        'trips.bus_company',
        'routes.id as route_id',
        'routes.origin',
        'routes.destination',
        'routes.distance',
        'routes.duration',
        'vehicles.id as vehicle_id',
        'vehicles.plate_number',
        'vehicles.type',
        'vehicles.capacity'
      );
  },

  async getTripById(tripId) {
    return db('trips')
      .join('routes', 'trips.route_id', 'routes.id')
      .join('vehicles', 'trips.vehicle_id', 'vehicles.id')
      .where('trips.id', tripId)
      .select(
        'trips.id as trip_id',
        'trips.departure_time',
        'trips.arrival_time',
        'trips.price',
        'trips.status',
        'trips.bus_company',
        'routes.id as route_id',
        'routes.origin',
        'routes.destination',
        'routes.distance',
        'routes.duration',
        'vehicles.id as vehicle_id',
        'vehicles.plate_number',
        'vehicles.type',
        'vehicles.capacity'
      )
      .first();
  },

  async getBookedSeatsCount(tripId) {
    const result = await db('booking_seats')
      .join('bookings', 'booking_seats.booking_id', 'bookings.id')
      .where('bookings.trip_id', tripId)
      .whereIn('bookings.status', ['PAID', 'PENDING_PAYMENT', 'TICKET_ISSUED'])
      .count('booking_seats.id as count')
      .first();
    return Number(result?.count || 0);
  },

  // Admin CRUD methods
  async createRoute(route) {
    const [saved] = await db('routes').insert(route).returning('*');
    return saved;
  },

  async getAllRoutes() {
    return db('routes').select('*');
  },

  async createVehicle(vehicle) {
    const [saved] = await db('vehicles').insert(vehicle).returning('*');
    return saved;
  },

  async getAllVehicles() {
    return db('vehicles').select('*');
  },

  async createTrip(trip) {
    const [saved] = await db('trips').insert(trip).returning('*');
    return saved;
  }
};
