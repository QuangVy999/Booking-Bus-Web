import { GraphQLError } from 'graphql';
import { grpcClients, callUnary } from './grpcClients.js';
import { pubsub } from './pubsub.js';

const trips = [
  { id: 'TRIP-001', origin: 'Sài Gòn', destination: 'Đà Lạt', route: 'Sài Gòn → Đà Lạt', departureTime: '2026-07-18T07:00:00+07:00', price: 250000, availableSeats: 25 },
  { id: 'TRIP-002', origin: 'Sài Gòn', destination: 'Nha Trang', route: 'Sài Gòn → Nha Trang', departureTime: '2026-07-18T08:30:00+07:00', price: 310000, availableSeats: 18 },
];
const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4010';

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

function requireRole(context, allowedRoles) {
  if (!context.currentUser) {
    throw new GraphQLError('Bạn cần đăng nhập để thực hiện thao tác này', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  if (!allowedRoles.includes(context.currentUser.role)) {
    throw new GraphQLError('Bạn không có quyền thực hiện thao tác này', {
      extensions: { code: 'FORBIDDEN' }
    });
  }
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

    getStops: async (_, __, context) => {
      requireRole(context, ['Admin', 'Check-in Staff']);
      try {
        const response = await callUnary(grpcClients.trip, 'GetStops', {});
        return response.stops || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get stops'); }
    },
    getRoutes: async (_, __, context) => {
      requireRole(context, ['Admin']);
      try {
        const response = await callUnary(grpcClients.trip, 'GetRoutes', {});
        return response.routes || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get routes'); }
    },
    getVehicles: async (_, __, context) => {
      requireRole(context, ['Admin']);
      try {
        const response = await callUnary(grpcClients.trip, 'GetVehicles', {});
        return response.vehicles || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get vehicles'); }
    },
    getTrips: async (_, { route_id, status }, context) => {
      requireRole(context, ['Admin', 'Check-in Staff']);
      try {
        const response = await callUnary(grpcClients.trip, 'GetTrips', { route_id, status });
        return response.trips || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get trips'); }
    },
    getBookingsByTrip: async (_, { trip_id }, context) => {
      requireRole(context, ['Admin', 'Check-in Staff']);
      try {
        const response = await callUnary(grpcClients.booking, 'GetBookingsByTrip', { trip_id });
        return response.bookings || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get bookings'); }
    },
    searchTrips: async (_, { origin, destination, date }) => {
      try {
        const searchDate = date || new Date().toISOString().split('T')[0];
        const response = await callUnary(grpcClients.catalog, 'SearchTrips', { origin, destination, date: searchDate });
        return {
          trips: (response.trips || []).map(mapTrip),
          suggestedDate: response.suggested_date || null
        };
      } catch (error) {
        throw toGraphQLError(error, 'Failed to search trips');
      }
    },
    trip: async (_, { id }) => {
      try {
        const response = await callUnary(grpcClients.catalog, 'GetTripDetail', { trip_id: id });
        return mapTrip(response.trip);
      } catch (error) {
        throw toGraphQLError(error, 'Failed to retrieve trip');
      }
    },
    tripDetail: async (_, { id }) => {
      try {
        const response = await callUnary(grpcClients.catalog, 'GetTripDetail', { trip_id: id });
        return mapTrip(response.trip);
      } catch (error) {
        throw toGraphQLError(error, 'Failed to retrieve trip details');
      }
    },
    bookingStatus: async (_, { bookingCode, email }) => {
      if (!email) throw new GraphQLError('Email is required to protect booking information', { extensions: { code: 'BAD_USER_INPUT' } });
      try {
        const booking = await callUnary(grpcClients.booking, 'GetBooking', { booking_code: bookingCode, passenger_email: email });
        return { bookingCode: booking.booking_code, tripId: booking.trip_id, status: booking.status, seatNumbers: booking.seat_numbers };
      } catch (error) { throw toGraphQLError(error, 'Cannot retrieve booking'); }
    },
    revenueSummary: async (_, { days = 30 }, context) => {
      requireRole(context, ['Admin']);
      const response = await fetch(`${analyticsUrl}/analytics/revenue?days=${days}`);
      if (!response.ok) return [];
      const body = await response.json();
      return body.data.map((row) => ({ label: row.day, value: Number(row.revenue) }));
    },
    popularRoutes: async (_, __, context) => {
      requireRole(context, ['Admin']);
      const response = await fetch(`${analyticsUrl}/analytics/popular-routes`);
      if (!response.ok) return [];
      const body = await response.json();
      return body.data.map((row) => ({ label: row.route, value: Number(row.searches) }));
    },
    savedPassengers: async (_, __, context) => {
      requireRole(context, ['Registered Customer', 'Admin']);
      try {
        const response = await callUnary(grpcClients.user, 'GetSavedPassengers', { user_id: context.currentUser.sub });
        return response.passengers || [];
      } catch (error) { throw toGraphQLError(error, 'Cannot get saved passengers'); }
    }
  },
  Mutation: {
    register: async (_, { name, email, password }) => {
      try {
        const defaultCustomerRole = "Registered Customer";
        const response = await callUnary(grpcClients.user, 'Register', { name, email, password, role: defaultCustomerRole });
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
    
    addSavedPassenger: async (_, { name, email, phone }, context) => {
      requireRole(context, ['Registered Customer', 'Admin']);
      try {
        const response = await callUnary(grpcClients.user, 'AddSavedPassenger', { 
          user_id: context.currentUser.sub,
          name, 
          email, 
          phone 
        });
        return response.passenger;
      } catch (error) { throw toGraphQLError(error, 'Cannot add passenger'); }
    },

    deleteSavedPassenger: async (_, { id }, context) => {
      requireRole(context, ['Registered Customer', 'Admin']);
      try {
        const response = await callUnary(grpcClients.user, 'DeleteSavedPassenger', { id });
        return { success: response.success };
      } catch (error) { throw toGraphQLError(error, 'Cannot delete passenger'); }
    },

    createStop: async (_, args, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'CreateStop', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateStop: async (_, args, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'UpdateStop', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    deleteStop: async (_, { id }, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'DeleteStop', { id }); }
      catch (error) { throw toGraphQLError(error); }
    },

    createAdminRoute: async (_, args, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'CreateRoute', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateAdminRoute: async (_, args, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'UpdateRoute', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    deleteAdminRoute: async (_, { id }, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'DeleteRoute', { id }); }
      catch (error) { throw toGraphQLError(error); }
    },

    createAdminVehicle: async (_, args, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'CreateVehicle', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateAdminVehicle: async (_, args, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'UpdateVehicle', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    deleteAdminVehicle: async (_, { id }, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'DeleteVehicle', { id }); }
      catch (error) { throw toGraphQLError(error); }
    },

    createAdminTrip: async (_, args, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'CreateTrip', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateAdminTrip: async (_, args, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'UpdateTrip', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    updateTripStatus: async (_, args, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'UpdateTripStatus', args); }
      catch (error) { throw toGraphQLError(error); }
    },
    deleteAdminTrip: async (_, { id }, context) => {
      requireRole(context, ['Admin']);
      try { return await callUnary(grpcClients.trip, 'DeleteTrip', { id }); }
      catch (error) { throw toGraphQLError(error); }
    },

    checkInBooking: async (_, { booking_code }, context) => {
      requireRole(context, ['Admin', 'Check-in Staff']);
      try { return await callUnary(grpcClients.booking, 'CheckInBooking', { booking_code }); }
      catch (error) { throw toGraphQLError(error); }
    },
    blockSeats: async (_, { trip_id, seat_numbers }, context) => {
      requireRole(context, ['Admin', 'Check-in Staff']);
      try { return await callUnary(grpcClients.seat, 'BlockSeats', { trip_id, seat_numbers }); }
      catch (error) { throw toGraphQLError(error); }
    },
    unblockSeats: async (_, { trip_id, seat_numbers }, context) => {
      requireRole(context, ['Admin', 'Check-in Staff']);
      try { return await callUnary(grpcClients.seat, 'UnblockSeats', { trip_id, seat_numbers }); }
      catch (error) { throw toGraphQLError(error); }
    },

    createRoute: async (_, { origin, destination, distance, duration }, context) => {
      requireRole(context, ['Admin']);
      try {
        const response = await callUnary(grpcClients.catalog, 'CreateRoute', { origin, destination, distance, duration });
        return mapRoute(response.route);
      } catch (error) {
        throw toGraphQLError(error, 'Failed to create route');
      }
    },
    createVehicle: async (_, { plateNumber, type, capacity }, context) => {
      requireRole(context, ['Admin']);
      try {
        const response = await callUnary(grpcClients.catalog, 'CreateVehicle', { plate_number: plateNumber, type, capacity });
        return mapVehicle(response.vehicle);
      } catch (error) {
        throw toGraphQLError(error, 'Failed to create vehicle');
      }
    },
    createTrip: async (_, { routeId, vehicleId, departureTime, arrivalTime, price, busCompany }, context) => {
      requireRole(context, ['Admin']);
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
  },
  Subscription: {
    seatUpdated: {
      subscribe: () => pubsub.asyncIterableIterator(['SEAT_UPDATED'])
    }
  }
};

