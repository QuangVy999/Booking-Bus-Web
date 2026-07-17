export const ME_QUERY = `
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = `
  mutation Register($name: String!, $email: String!, $password: String!, $role: String) {
    register(name: $name, email: $email, password: $password, role: $role) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const SEARCH_TRIPS_QUERY = `
  query SearchTrips($origin: String!, $destination: String!, $date: String!) {
    searchTrips(origin: $origin, destination: $destination, date: $date) {
      id
      departureTime
      arrivalTime
      price
      status
      busCompany
      availableSeats
      route {
        id
        origin
        destination
        distance
        duration
      }
      vehicle {
        id
        plateNumber
        type
        capacity
      }
    }
  }
`;

export const GET_TRIP_DETAIL_QUERY = `
  query GetTripDetail($id: ID!) {
    tripDetail(id: $id) {
      id
      departureTime
      arrivalTime
      price
      status
      busCompany
      availableSeats
      route {
        id
        origin
        destination
        distance
        duration
      }
      vehicle {
        id
        plateNumber
        type
        capacity
      }
    }
  }
`;
