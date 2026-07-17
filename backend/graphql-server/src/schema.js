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
    departureTime: String!
    arrivalTime: String!
    price: Float!
    status: String!
    busCompany: String!
    availableSeats: Int!
  }

  type Query {
    me: User
    searchTrips(origin: String!, destination: String!, date: String!): [Trip!]!
    tripDetail(id: ID!): Trip
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createRoute(origin: String!, destination: String!, distance: Float!, duration: String!): Route!
    createVehicle(plateNumber: String!, type: String!, capacity: Int!): Vehicle!
    createTrip(routeId: ID!, vehicleId: ID!, departureTime: String!, arrivalTime: String!, price: Float!, busCompany: String!): Trip!
  }
`;
