import { redis } from './redis.js';

export function createCatalogService(repository) {
  const CACHE_TTL_SECONDS = 60; // Cache search queries for 1 minute

  return {
    async searchTrips(origin, destination, date) {
      if (!origin || !destination || !date) {
        throw new Error('INVALID_ARGUMENT: origin, destination and date are required');
      }

      const cacheKey = `search:${origin}:${destination}:${date}`;

      // 1. Try to get from Redis cache
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`[Cache Hit] Serving search results for ${origin} -> ${destination} on ${date}`);
          return JSON.parse(cachedData);
        }
      } catch (err) {
        console.error('Redis read error:', err);
      }

      // 2. Fetch from database
      console.log(`[Cache Miss] Querying database for ${origin} -> ${destination} on ${date}`);
      const dbTrips = await repository.findTrips(origin, destination, date);

      const trips = [];
      for (const t of dbTrips) {
        const bookedCount = await repository.getBookedSeatsCount(t.trip_id);
        const availableSeats = Math.max(0, t.capacity - bookedCount);

        trips.push({
          id: t.trip_id,
          route: {
            id: t.route_id,
            origin: t.origin,
            destination: t.destination,
            distance: t.distance,
            duration: t.duration
          },
          vehicle: {
            id: t.vehicle_id,
            plate_number: t.plate_number,
            type: t.type,
            capacity: t.capacity
          },
          departure_time: new Date(t.departure_time).toISOString(),
          arrival_time: new Date(t.arrival_time).toISOString(),
          price: t.price,
          status: t.status,
          bus_company: t.bus_company,
          available_seats: availableSeats
        });
      }

      // 3. Save to Redis cache
      try {
        await redis.set(cacheKey, JSON.stringify(trips), 'EX', CACHE_TTL_SECONDS);
      } catch (err) {
        console.error('Redis write error:', err);
      }

      return trips;
    },

    async getTripDetail(tripId) {
      if (!tripId) {
        throw new Error('INVALID_ARGUMENT: tripId is required');
      }

      const cacheKey = `trip:${tripId}`;

      // 1. Try to get from Redis cache
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`[Cache Hit] Serving trip details for ${tripId}`);
          return JSON.parse(cachedData);
        }
      } catch (err) {
        console.error('Redis read error:', err);
      }

      // 2. Fetch from database
      console.log(`[Cache Miss] Querying database for trip ${tripId}`);
      const t = await repository.getTripById(tripId);
      if (!t) {
        throw new Error(`NOT_FOUND: Trip with ID ${tripId} not found`);
      }

      const bookedCount = await repository.getBookedSeatsCount(t.trip_id);
      const availableSeats = Math.max(0, t.capacity - bookedCount);

      const trip = {
        id: t.trip_id,
        route: {
          id: t.route_id,
          origin: t.origin,
          destination: t.destination,
          distance: t.distance,
          duration: t.duration
        },
        vehicle: {
          id: t.vehicle_id,
          plate_number: t.plate_number,
          type: t.type,
          capacity: t.capacity
        },
        departure_time: new Date(t.departure_time).toISOString(),
        arrival_time: new Date(t.arrival_time).toISOString(),
        price: t.price,
        status: t.status,
        bus_company: t.bus_company,
        available_seats: availableSeats
      };

      // 3. Save to Redis cache
      try {
        await redis.set(cacheKey, JSON.stringify(trip), 'EX', CACHE_TTL_SECONDS);
      } catch (err) {
        console.error('Redis write error:', err);
      }

      return trip;
    },

    async createRoute(origin, destination, distance, duration) {
      const id = `route_${origin.toLowerCase().replace(/[^a-z0-9]/g, '')}_${destination.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      return repository.createRoute({ id, origin, destination, distance, duration });
    },

    async getRoutes() {
      return repository.getAllRoutes();
    },

    async createVehicle(plateNumber, type, capacity) {
      const id = `vehicle_${plateNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      return repository.createVehicle({ id, plate_number: plateNumber, type, capacity });
    },

    async getVehicles() {
      return repository.getAllVehicles();
    },

    async createTrip(routeId, vehicleId, departureTime, arrivalTime, price, busCompany) {
      const id = `trip_${Date.now()}`;
      return repository.createTrip({
        id,
        route_id: routeId,
        vehicle_id: vehicleId,
        departure_time: departureTime,
        arrival_time: arrivalTime,
        price,
        bus_company: busCompany,
        status: 'OPEN'
      });
    }
  };
}
