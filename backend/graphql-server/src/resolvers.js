import { GraphQLError } from 'graphql';
import { grpcClients, callUnary } from './grpcClients.js';

function toGraphQLError(error, fallbackMessage = 'Internal server error') {
  if (error.code === 5) { // NOT_FOUND
    return new GraphQLError(error.details || 'Resource not found', {
      extensions: { code: 'NOT_FOUND' }
    });
  }
  if (error.code === 3) { // INVALID_ARGUMENT
    return new GraphQLError(error.details || 'Invalid argument', {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
  if (error.code === 6) { // ALREADY_EXISTS
    return new GraphQLError(error.details || 'Resource already exists', {
      extensions: { code: 'ALREADY_EXISTS' }
    });
  }
  if (error.code === 16) { // UNAUTHENTICATED
    return new GraphQLError(error.details || 'Unauthenticated', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return new GraphQLError(fallbackMessage, {
    extensions: { code: 'INTERNAL_SERVER_ERROR' }
  });
}

function mapRoute(route) {
  if (!route) return null;
  return {
    id: route.id,
    origin: route.origin,
    destination: route.destination,
    distance: route.distance,
    duration: route.duration
  };
}

function mapVehicle(vehicle) {
  if (!vehicle) return null;
  return {
    id: vehicle.id,
    plateNumber: vehicle.plate_number,
    type: vehicle.type,
    capacity: vehicle.capacity
  };
}

function mapTrip(trip) {
  if (!trip) return null;
  return {
    id: trip.id,
    route: mapRoute(trip.route),
    vehicle: mapVehicle(trip.vehicle),
    departureTime: trip.departure_time,
    arrivalTime: trip.arrival_time,
    price: trip.price,
    status: trip.status,
    busCompany: trip.bus_company,
    availableSeats: trip.available_seats
  };
}

export const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.currentUser) {
        return null;
      }
      try {
        const response = await callUnary(grpcClients.user, 'GetProfile', { id: context.currentUser.sub });
        return response.user;
      } catch (error) {
        return null;
      }
    },
    searchTrips: async (_, { origin, destination, date }) => {
      try {
        const response = await callUnary(grpcClients.catalog, 'SearchTrips', { origin, destination, date });
        return (response.trips || []).map(mapTrip);
      } catch (error) {
        throw toGraphQLError(error, 'Failed to search trips');
      }
    },
    tripDetail: async (_, { id }) => {
      try {
        const response = await callUnary(grpcClients.catalog, 'GetTripDetail', { trip_id: id });
        return mapTrip(response.trip);
      } catch (error) {
        throw toGraphQLError(error, 'Failed to retrieve trip details');
      }
    }
  },
  Mutation: {
    register: async (_, { name, email, password, role }) => {
      try {
        const response = await callUnary(grpcClients.user, 'Register', { name, email, password, role });
        // After register, we should probably login to get the token.
        // But our gRPC Register returns only User. Let's auto-login if needed,
        // or just throw if we can't get a token. Wait, the user.proto only returns User for Register.
        // I'll call Login right after Register to get the token.
        const loginResponse = await callUnary(grpcClients.user, 'Login', { email, password });
        return loginResponse;
      } catch (error) {
        throw toGraphQLError(error, 'Cannot register user');
      }
    },
    login: async (_, { email, password }) => {
      try {
        const response = await callUnary(grpcClients.user, 'Login', { email, password });
        return response;
      } catch (error) {
        throw toGraphQLError(error, 'Cannot login');
      }
    },
    createRoute: async (_, { origin, destination, distance, duration }) => {
      try {
        const response = await callUnary(grpcClients.catalog, 'CreateRoute', { origin, destination, distance, duration });
        return mapRoute(response.route);
      } catch (error) {
        throw toGraphQLError(error, 'Failed to create route');
      }
    },
    createVehicle: async (_, { plateNumber, type, capacity }) => {
      try {
        const response = await callUnary(grpcClients.catalog, 'CreateVehicle', { plate_number: plateNumber, type, capacity });
        return mapVehicle(response.vehicle);
      } catch (error) {
        throw toGraphQLError(error, 'Failed to create vehicle');
      }
    },
    createTrip: async (_, { routeId, vehicleId, departureTime, arrivalTime, price, busCompany }) => {
      try {
        const response = await callUnary(grpcClients.catalog, 'CreateTrip', {
          route_id: routeId,
          vehicle_id: vehicleId,
          departure_time: departureTime,
          arrival_time: arrivalTime,
          price,
          bus_company: busCompany
        });
        return mapTrip(response.trip);
      } catch (error) {
        throw toGraphQLError(error, 'Failed to create trip');
      }
    }
  }
};
