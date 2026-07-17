import { tripRepository } from "./tripRepository.js";

function convertISOString(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}

export const tripService = {
  // STOPS
  async createStop(call, callback) {
    try {
      const stop = await tripRepository.createStop(call.request);
      callback(null, stop);
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async updateStop(call, callback) {
    try {
      const { id, ...data } = call.request;
      const stop = await tripRepository.updateStop(id, data);
      callback(null, stop);
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async deleteStop(call, callback) {
    try {
      const success = await tripRepository.deleteStop(call.request.id);
      callback(null, { success, message: success ? "Deleted" : "Not found" });
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async getStops(call, callback) {
    try {
      const stops = await tripRepository.getStops();
      callback(null, { stops });
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },

  // ROUTES
  async createRoute(call, callback) {
    try {
      const route = await tripRepository.createRoute(call.request);
      callback(null, route);
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async updateRoute(call, callback) {
    try {
      const { id, ...data } = call.request;
      const route = await tripRepository.updateRoute(id, data);
      callback(null, route);
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async deleteRoute(call, callback) {
    try {
      const success = await tripRepository.deleteRoute(call.request.id);
      callback(null, { success, message: success ? "Deleted" : "Not found" });
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async getRoutes(call, callback) {
    try {
      const routes = await tripRepository.getRoutes();
      callback(null, { routes });
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },

  // VEHICLES
  async createVehicle(call, callback) {
    try {
      const vehicle = await tripRepository.createVehicle(call.request);
      callback(null, vehicle);
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async updateVehicle(call, callback) {
    try {
      const { id, ...data } = call.request;
      const vehicle = await tripRepository.updateVehicle(id, data);
      callback(null, vehicle);
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async deleteVehicle(call, callback) {
    try {
      const success = await tripRepository.deleteVehicle(call.request.id);
      callback(null, { success, message: success ? "Deleted" : "Not found" });
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async getVehicles(call, callback) {
    try {
      const vehicles = await tripRepository.getVehicles();
      callback(null, { vehicles });
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },

  // TRIPS
  async createTrip(call, callback) {
    try {
      const trip = await tripRepository.createTrip(call.request);
      trip.departure_time = convertISOString(trip.departure_time);
      trip.arrival_time = convertISOString(trip.arrival_time);
      callback(null, trip);
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async updateTrip(call, callback) {
    try {
      const { id, ...data } = call.request;
      const trip = await tripRepository.updateTrip(id, data);
      trip.departure_time = convertISOString(trip.departure_time);
      trip.arrival_time = convertISOString(trip.arrival_time);
      callback(null, trip);
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async updateTripStatus(call, callback) {
    try {
      const trip = await tripRepository.updateTripStatus(call.request.id, call.request.status);
      trip.departure_time = convertISOString(trip.departure_time);
      trip.arrival_time = convertISOString(trip.arrival_time);
      callback(null, trip);
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async deleteTrip(call, callback) {
    try {
      const success = await tripRepository.deleteTrip(call.request.id);
      callback(null, { success, message: success ? "Deleted" : "Not found" });
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
  async getTrips(call, callback) {
    try {
      const trips = await tripRepository.getTrips(call.request.route_id, call.request.status);
      const formatted = trips.map(t => ({
        ...t,
        departure_time: convertISOString(t.departure_time),
        arrival_time: convertISOString(t.arrival_time)
      }));
      callback(null, { trips: formatted });
    } catch (err) {
      callback({ code: 13, message: err.message });
    }
  },
};
