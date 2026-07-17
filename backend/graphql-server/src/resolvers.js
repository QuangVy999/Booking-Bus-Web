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
    getStops: async () => {
      try {
        const response = await callUnary(grpcClients.trip, 'GetStops', {});
        return response.stops || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get stops'); }
    },
    getRoutes: async () => {
      try {
        const response = await callUnary(grpcClients.trip, 'GetRoutes', {});
        return response.routes || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get routes'); }
    },
    getVehicles: async () => {
      try {
        const response = await callUnary(grpcClients.trip, 'GetVehicles', {});
        return response.vehicles || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get vehicles'); }
    },
    getTrips: async (_, { route_id, status }) => {
      try {
        const response = await callUnary(grpcClients.trip, 'GetTrips', { route_id, status });
        return response.trips || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get trips'); }
    },
    getBookingsByTrip: async (_, { trip_id }) => {
      try {
        const response = await callUnary(grpcClients.booking, 'GetBookingsByTrip', { trip_id });
        return response.bookings || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get bookings'); }
    }
  },
  Mutation: {
    register: async (_, { name, email, password, role }) => {
      try {
        const response = await callUnary(grpcClients.user, 'Register', { name, email, password, role });
        const loginResponse = await callUnary(grpcClients.user, 'Login', { email, password });
        return loginResponse;
      } catch (error) { throw toGraphQLError(error, 'Cannot register user'); }
    },
    login: async (_, { email, password }) => {
      try {
        const response = await callUnary(grpcClients.user, 'Login', { email, password });
        return response;
      } catch (error) { throw toGraphQLError(error, 'Cannot login'); }
    },

    createStop: async (_, args) => {
      try { return await callUnary(grpcClients.trip, 'CreateStop', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateStop: async (_, args) => {
      try { return await callUnary(grpcClients.trip, 'UpdateStop', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    deleteStop: async (_, { id }) => {
      try { return await callUnary(grpcClients.trip, 'DeleteStop', { id }); }
      catch (error) { throw toGraphQLError(error); }
    },

    createRoute: async (_, args) => {
      try { return await callUnary(grpcClients.trip, 'CreateRoute', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateRoute: async (_, args) => {
      try { return await callUnary(grpcClients.trip, 'UpdateRoute', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    deleteRoute: async (_, { id }) => {
      try { return await callUnary(grpcClients.trip, 'DeleteRoute', { id }); }
      catch (error) { throw toGraphQLError(error); }
    },

    createVehicle: async (_, args) => {
      try { return await callUnary(grpcClients.trip, 'CreateVehicle', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateVehicle: async (_, args) => {
      try { return await callUnary(grpcClients.trip, 'UpdateVehicle', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    deleteVehicle: async (_, { id }) => {
      try { return await callUnary(grpcClients.trip, 'DeleteVehicle', { id }); }
      catch (error) { throw toGraphQLError(error); }
    },

    createTrip: async (_, args) => {
      try { return await callUnary(grpcClients.trip, 'CreateTrip', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateTrip: async (_, args) => {
      try { return await callUnary(grpcClients.trip, 'UpdateTrip', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateTripStatus: async (_, args) => {
      try { return await callUnary(grpcClients.trip, 'UpdateTripStatus', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    deleteTrip: async (_, { id }) => {
      try { return await callUnary(grpcClients.trip, 'DeleteTrip', { id }); }
      catch (error) { throw toGraphQLError(error); }
    },

    checkInBooking: async (_, { booking_code }) => {
      try { return await callUnary(grpcClients.booking, 'CheckInBooking', { booking_code }); }
      catch (error) { throw toGraphQLError(error); }
    },
    blockSeats: async (_, { trip_id, seat_numbers }) => {
      try { return await callUnary(grpcClients.seat, 'BlockSeats', { trip_id, seat_numbers }); }
      catch (error) { throw toGraphQLError(error); }
    }
  }
};
