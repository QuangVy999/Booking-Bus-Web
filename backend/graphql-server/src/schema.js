export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type BookingStatus { bookingCode: String!, tripId: String!, status: String!, seatNumbers: [String!]! }
  type AnalyticsPoint { label: String!, value: Float! }

  type Route {
    id: ID!
    origin: String!
    destination: String!
    distance: Float
    duration: String
  }

  type Vehicle {
    id: ID!
    plateNumber: String!
    type: String!
    capacity: Int!
  }

  type Trip {
    id: ID!
    route: Route!
    vehicle: Vehicle!
    origin: String
    destination: String
    departureTime: String!
    arrivalTime: String!
    price: Float!
    status: String!
    busCompany: String!
    availableSeats: Int!
  }

  type Query {
    me: User
    searchTrips(origin: String!, destination: String!, date: String): [Trip!]!
    trip(id: ID!): Trip
    tripDetail(id: ID!): Trip
    bookingStatus(bookingCode: String!, email: String!): BookingStatus
    revenueSummary(days: Int): [AnalyticsPoint!]!
    popularRoutes: [AnalyticsPoint!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createRoute(origin: String!, destination: String!, distance: Float!, duration: String!): Route!
    createVehicle(plateNumber: String!, type: String!, capacity: Int!): Vehicle!
    createTrip(routeId: ID!, vehicleId: ID!, departureTime: String!, arrivalTime: String!, price: Float!, busCompany: String!): Trip!
  }
`;
