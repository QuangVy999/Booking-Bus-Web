import { GraphQLError } from 'graphql';
import { grpcClients, callUnary } from './grpcClients.js';

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
    searchTrips: (_, { origin, destination }) => trips.filter((trip) =>
      trip.origin.toLocaleLowerCase('vi').includes(origin.toLocaleLowerCase('vi')) &&
      trip.destination.toLocaleLowerCase('vi').includes(destination.toLocaleLowerCase('vi'))),
    trip: (_, { id }) => trips.find((trip) => trip.id === id) || null,
    bookingStatus: async (_, { bookingCode, email }) => {
      if (!email) throw new GraphQLError('Email is required to protect booking information', { extensions: { code: 'BAD_USER_INPUT' } });
      try {
        const booking = await callUnary(grpcClients.booking, 'GetBooking', { booking_code: bookingCode, passenger_email: email });
        return { bookingCode: booking.booking_code, tripId: booking.trip_id, status: booking.status, seatNumbers: booking.seat_numbers };
      } catch (error) { throw toGraphQLError(error, 'Cannot retrieve booking'); }
    },
    revenueSummary: async (_, { days = 30 }) => {
      const response = await fetch(`${analyticsUrl}/analytics/revenue?days=${days}`);
      if (!response.ok) return [];
      const body = await response.json();
      return body.data.map((row) => ({ label: row.day, value: Number(row.revenue) }));
    },
    popularRoutes: async () => {
      const response = await fetch(`${analyticsUrl}/analytics/popular-routes`);
      if (!response.ok) return [];
      const body = await response.json();
      return body.data.map((row) => ({ label: row.route, value: Number(row.searches) }));
    },
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
    }
  }
};
