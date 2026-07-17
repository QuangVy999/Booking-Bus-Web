import grpc from '@grpc/grpc-js';

function toGrpcError(error) {
  const message = error.message || 'Unknown catalog service error';
  
  if (message.startsWith('INVALID_ARGUMENT')) {
    return {
      code: grpc.status.INVALID_ARGUMENT,
      message: message
    };
  }

  if (message.startsWith('NOT_FOUND')) {
    return {
      code: grpc.status.NOT_FOUND,
      message: message
    };
  }

  return {
    code: grpc.status.INTERNAL,
    message: message
  };
}

export function createCatalogGrpcHandlers(catalogService) {
  return {
    async searchTrips(call, callback) {
      try {
        const { origin, destination, date } = call.request;
        const result = await catalogService.searchTrips(origin, destination, date);
        
        callback(null, { 
          trips: result.trips,
          suggested_date: result.suggestedDate || ""
        });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async getTripDetail(call, callback) {
      try {
        const { trip_id } = call.request;
        const result = await catalogService.getTripDetail(trip_id);
        
        callback(null, { trip: result });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async createRoute(call, callback) {
      try {
        const { origin, destination, distance, duration } = call.request;
        const result = await catalogService.createRoute(origin, destination, distance, duration);
        
        callback(null, { route: result });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async getRoutes(call, callback) {
      try {
        const result = await catalogService.getRoutes();
        callback(null, { routes: result });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async createVehicle(call, callback) {
      try {
        const { plate_number, type, capacity } = call.request;
        const result = await catalogService.createVehicle(plate_number, type, capacity);
        
        callback(null, { vehicle: result });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async getVehicles(call, callback) {
      try {
        const result = await catalogService.getVehicles();
        callback(null, { vehicles: result });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async createTrip(call, callback) {
      try {
        const { route_id, vehicle_id, departure_time, arrival_time, price, bus_company } = call.request;
        const result = await catalogService.createTrip(route_id, vehicle_id, departure_time, arrival_time, price, bus_company);
        
        callback(null, { trip: result });
      } catch (error) {
        callback(toGrpcError(error));
      }
    }
  };
}
