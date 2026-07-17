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

  type Stop {
    id: ID!
    name: String!
    address: String!
  }

  type Route {
    id: ID!
    name: String!
    start_stop_id: String!
    end_stop_id: String!
  }

  type Vehicle {
    id: ID!
    license_plate: String!
    total_seats: Int!
    seat_map: String!
  }

  type Trip {
    id: ID!
    route_id: String!
    vehicle_id: String!
    departure_time: String!
    arrival_time: String!
    price: Int!
    status: String!
  }

  type Booking {
    booking_id: ID!
    booking_code: String!
    trip_id: String!
    seat_numbers: [String!]!
    passenger_name: String!
    passenger_email: String!
    status: String!
  }

  type GeneralResponse {
    success: Boolean!
    message: String
  }

  type CheckInResponse {
    success: Boolean!
    message: String
    new_status: String
  }

  type Query {
    me: User
    getStops: [Stop!]!
    getRoutes: [Route!]!
    getVehicles: [Vehicle!]!
    getTrips(route_id: String, status: String): [Trip!]!
    getBookingsByTrip(trip_id: String!): [Booking!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    createStop(name: String!, address: String!): Stop!
    updateStop(id: ID!, name: String!, address: String!): Stop!
    deleteStop(id: ID!): GeneralResponse!

    createRoute(name: String!, start_stop_id: String!, end_stop_id: String!): Route!
    updateRoute(id: ID!, name: String!, start_stop_id: String!, end_stop_id: String!): Route!
    deleteRoute(id: ID!): GeneralResponse!

    createVehicle(license_plate: String!, total_seats: Int!, seat_map: String!): Vehicle!
    updateVehicle(id: ID!, license_plate: String!, total_seats: Int!, seat_map: String!): Vehicle!
    deleteVehicle(id: ID!): GeneralResponse!

    createTrip(route_id: String!, vehicle_id: String!, departure_time: String!, arrival_time: String!, price: Int!): Trip!
    updateTrip(id: ID!, route_id: String!, vehicle_id: String!, departure_time: String!, arrival_time: String!, price: Int!, status: String!): Trip!
    updateTripStatus(id: ID!, status: String!): Trip!
    deleteTrip(id: ID!): GeneralResponse!

    checkInBooking(booking_code: String!): CheckInResponse!
    blockSeats(trip_id: String!, seat_numbers: [String!]!): GeneralResponse!
  }
`;
