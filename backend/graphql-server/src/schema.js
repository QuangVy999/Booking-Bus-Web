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

  type AdminStop {
    id: ID!
    name: String!
    address: String!
  }

  type AdminRoute {
    id: ID!
    name: String!
    start_stop_id: String!
    end_stop_id: String!
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

  type AdminVehicle {
    id: ID!
    license_plate: String!
    total_seats: Int!
    seat_map: String!
  }

  type Vehicle {
    id: ID!
    plateNumber: String!
    type: String!
    capacity: Int!
  }

  type AdminTrip {
    id: ID!
    route_id: String!
    vehicle_id: String!
    departure_time: String!
    arrival_time: String!
    price: Int!
    status: String!
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
    getStops: [AdminStop!]!
    getRoutes: [AdminRoute!]!
    getVehicles: [AdminVehicle!]!
    getTrips(route_id: String, status: String): [AdminTrip!]!
    getBookingsByTrip(trip_id: String!): [Booking!]!
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
    
    createStop(name: String!, address: String!): AdminStop!
    updateStop(id: ID!, name: String!, address: String!): AdminStop!
    deleteStop(id: ID!): GeneralResponse!

    createAdminRoute(name: String!, start_stop_id: String!, end_stop_id: String!): AdminRoute!
    updateAdminRoute(id: ID!, name: String!, start_stop_id: String!, end_stop_id: String!): AdminRoute!
    deleteAdminRoute(id: ID!): GeneralResponse!

    createAdminVehicle(license_plate: String!, total_seats: Int!, seat_map: String!): AdminVehicle!
    updateAdminVehicle(id: ID!, license_plate: String!, total_seats: Int!, seat_map: String!): AdminVehicle!
    deleteAdminVehicle(id: ID!): GeneralResponse!

    createAdminTrip(route_id: String!, vehicle_id: String!, departure_time: String!, arrival_time: String!, price: Int!): AdminTrip!
    updateAdminTrip(id: ID!, route_id: String!, vehicle_id: String!, departure_time: String!, arrival_time: String!, price: Int!, status: String!): AdminTrip!
    updateTripStatus(id: ID!, status: String!): AdminTrip!
    deleteAdminTrip(id: ID!): GeneralResponse!

    checkInBooking(booking_code: String!): CheckInResponse!
    blockSeats(trip_id: String!, seat_numbers: [String!]!): GeneralResponse!
    unblockSeats(trip_id: String!, seat_numbers: [String!]!): GeneralResponse!

    createRoute(origin: String!, destination: String!, distance: Float!, duration: String!): Route!
    createVehicle(plateNumber: String!, type: String!, capacity: Int!): Vehicle!
    createTrip(routeId: ID!, vehicleId: ID!, departureTime: String!, arrivalTime: String!, price: Float!, busCompany: String!): Trip!
  }
`;
