import { redis } from './redis.js';
import { grpcClients, callUnary } from './grpcClients.js';

export function createCatalogService(repository) {
  const CACHE_TTL_SECONDS = 60; // Cache search queries for 1 minute

  return {
    async searchTrips(origin, destination, date) {
      if (!origin || !destination || !date) {
        throw new Error('INVALID_ARGUMENT: origin, destination and date are required');
      }

      const cacheKey = `search:${origin}:${destination}:${date}`;

      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`[Cache Hit] Serving search results for ${origin} -> ${destination} on ${date}`);
          return JSON.parse(cachedData);
        }
      } catch (err) {
        console.error('Redis read error:', err);
      }

      console.log(`[Cache Miss] Querying trip-service for ${origin} -> ${destination} on ${date}`);
      
      // Get all routes and filter by origin and destination
      const routesRes = await callUnary(grpcClients.trip, 'GetRoutes', {});
      const targetRoutes = routesRes.routes.filter(r => 
        r.name.includes(origin) && r.name.includes(destination)
      );
      
      // If no route matches, we can still fall back to all trips and filter if the route name format doesn't match
      const tripsRes = await callUnary(grpcClients.trip, 'GetTrips', {});
      const allTrips = tripsRes.trips;
      
      // Get vehicles
      const vehiclesRes = await callUnary(grpcClients.trip, 'GetVehicles', {});
      const vehiclesMap = new Map();
      vehiclesRes.vehicles.forEach(v => vehiclesMap.set(v.id, v));
      
      const routesMap = new Map();
      routesRes.routes.forEach(r => routesMap.set(r.id, r));

      const trips = [];
      const targetDate = new Date(date).toISOString().split('T')[0];

      for (const t of allTrips) {
        const tripDate = new Date(t.departure_time).toISOString().split('T')[0];
        const route = routesMap.get(t.route_id);
        if (!route) continue;
        
        // Simple filter based on origin/dest if they were extracted, or string matching
        // In tripRepository.js, origin and destination are saved in DB but not in proto.
        // We'll match against route name (which contains origin and destination typically)
        if (!route.name.includes(origin) || !route.name.includes(destination)) continue;
        if (tripDate !== targetDate) continue;

        const vehicle = vehiclesMap.get(t.vehicle_id);
        
        // Get bookings to calculate available seats
        const bookingsRes = await callUnary(grpcClients.booking, 'GetBookingsByTrip', { trip_id: t.id });
        let bookedCount = 0;
        bookingsRes.bookings?.forEach(b => {
          if (['PAID', 'PENDING_PAYMENT', 'TICKET_ISSUED'].includes(b.status)) {
            bookedCount += b.seat_numbers.length;
          }
        });
        
        const capacity = vehicle ? vehicle.total_seats : 40;
        const availableSeats = Math.max(0, capacity - bookedCount);

        trips.push({
          id: t.id,
          route: {
            id: route.id,
            origin: origin,
            destination: destination,
            distance: 300,
            duration: "6 giờ"
          },
          vehicle: {
            id: vehicle?.id || t.vehicle_id,
            plate_number: vehicle?.license_plate || '',
            type: vehicle ? (vehicle.total_seats === 20 ? "Limousine 20 chỗ" : "Giường nằm 40 chỗ") : "",
            capacity: capacity
          },
          departure_time: new Date(t.departure_time).toISOString(),
          arrival_time: new Date(t.arrival_time).toISOString(),
          price: t.price,
          status: t.status,
          bus_company: "Phương Trang Demo", // Hardcoded as in DB
          available_seats: availableSeats
        });
      }

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

      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`[Cache Hit] Serving trip details for ${tripId}`);
          return JSON.parse(cachedData);
        }
      } catch (err) {
        console.error('Redis read error:', err);
      }

      console.log(`[Cache Miss] Querying trip-service for trip ${tripId}`);
      
      const tripsRes = await callUnary(grpcClients.trip, 'GetTrips', {});
      const t = tripsRes.trips.find(x => x.id === tripId);
      if (!t) {
        throw new Error(`NOT_FOUND: Trip with ID ${tripId} not found`);
      }

      const routesRes = await callUnary(grpcClients.trip, 'GetRoutes', {});
      const route = routesRes.routes.find(r => r.id === t.route_id);

      const vehiclesRes = await callUnary(grpcClients.trip, 'GetVehicles', {});
      const vehicle = vehiclesRes.vehicles.find(v => v.id === t.vehicle_id);

      const bookingsRes = await callUnary(grpcClients.booking, 'GetBookingsByTrip', { trip_id: tripId });
      let bookedCount = 0;
      bookingsRes.bookings?.forEach(b => {
        if (['PAID', 'PENDING_PAYMENT', 'TICKET_ISSUED'].includes(b.status)) {
          bookedCount += b.seat_numbers.length;
        }
      });

      const capacity = vehicle ? vehicle.total_seats : 40;
      const availableSeats = Math.max(0, capacity - bookedCount);

      const trip = {
        id: t.id,
        route: {
          id: route?.id || t.route_id,
          origin: "TP.HCM",
          destination: "Đà Lạt",
          distance: 300,
          duration: "6 giờ"
        },
        vehicle: {
          id: vehicle?.id || t.vehicle_id,
          plate_number: vehicle?.license_plate || '',
          type: vehicle ? (vehicle.total_seats === 20 ? "Limousine 20 chỗ" : "Giường nằm 40 chỗ") : "",
          capacity: capacity
        },
        departure_time: new Date(t.departure_time).toISOString(),
        arrival_time: new Date(t.arrival_time).toISOString(),
        price: t.price,
        status: t.status,
        bus_company: "Phương Trang Demo",
        available_seats: availableSeats
      };

      try {
        await redis.set(cacheKey, JSON.stringify(trip), 'EX', CACHE_TTL_SECONDS);
      } catch (err) {
        console.error('Redis write error:', err);
      }

      return trip;
    },

    // Not used anymore as trip-service handles creation
    async createRoute(origin, destination, distance, duration) { return null; },
    async getRoutes() { return []; },
    async createVehicle(plateNumber, type, capacity) { return null; },
    async getVehicles() { return []; },
    async createTrip(routeId, vehicleId, departureTime, arrivalTime, price, busCompany) { return null; }
  };
}
