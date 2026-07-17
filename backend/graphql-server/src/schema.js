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
  type Trip { id: ID!, route: String!, origin: String!, destination: String!, departureTime: String!, price: Int!, availableSeats: Int! }
  type BookingStatus { bookingCode: String!, tripId: String!, status: String!, seatNumbers: [String!]! }
  type AnalyticsPoint { label: String!, value: Float! }

  type Query {
    me: User
    searchTrips(origin: String!, destination: String!, date: String): [Trip!]!
    trip(id: ID!): Trip
    bookingStatus(bookingCode: String!, email: String!): BookingStatus
    revenueSummary(days: Int): [AnalyticsPoint!]!
    popularRoutes: [AnalyticsPoint!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;
