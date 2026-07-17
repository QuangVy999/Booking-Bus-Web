"use server";

import { graphqlRequest } from "@/lib/graphql/client";
import { getAuthToken } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getStops() {
  const token = await getAuthToken();
  const query = `
    query GetStops {
      getStops {
        id
        name
        address
      }
    }
  `;
  try {
    const data = await graphqlRequest<{ getStops: any[] }>({ query, token });
    return { success: true, stops: data.getStops };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createStop(name: string, address: string) {
  const token = await getAuthToken();
  const query = `
    mutation CreateStop($name: String!, $address: String!) {
      createStop(name: $name, address: $address) {
        id
        name
        address
      }
    }
  `;
  try {
    await graphqlRequest({ query, variables: { name, address }, token });
    revalidatePath("/dashboard/stops");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateStop(id: string, name: string, address: string) {
  const token = await getAuthToken();
  const query = `
    mutation UpdateStop($id: ID!, $name: String!, $address: String!) {
      updateStop(id: $id, name: $name, address: $address) {
        id
      }
    }
  `;
  try {
    await graphqlRequest({ query, variables: { id, name, address }, token });
    revalidatePath("/dashboard/stops");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStop(id: string) {
  const token = await getAuthToken();
  const query = `
    mutation DeleteStop($id: ID!) {
      deleteStop(id: $id) {
        success
      }
    }
  `;
  try {
    await graphqlRequest({ query, variables: { id }, token });
    revalidatePath("/dashboard/stops");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Routes
export async function getRoutes() {
  const token = await getAuthToken();
  const query = `
    query GetRoutes {
      getRoutes { id name start_stop_id end_stop_id }
    }
  `;
  try {
    const data = await graphqlRequest<{ getRoutes: any[] }>({ query, token });
    return { success: true, routes: data.getRoutes };
  } catch (err: any) { return { success: false, error: err.message }; }
}
export async function createRoute(name: string, start_stop_id: string, end_stop_id: string) {
  const token = await getAuthToken();
  const query = `mutation CreateRoute($name: String!, $start_stop_id: String!, $end_stop_id: String!) { createRoute(name: $name, start_stop_id: $start_stop_id, end_stop_id: $end_stop_id) { id } }`;
  try { await graphqlRequest({ query, variables: { name, start_stop_id, end_stop_id }, token }); revalidatePath("/dashboard/routes"); return { success: true }; }
  catch (err: any) { return { success: false, error: err.message }; }
}
export async function deleteRoute(id: string) {
  const token = await getAuthToken();
  const query = `mutation DeleteRoute($id: ID!) { deleteRoute(id: $id) { success } }`;
  try { await graphqlRequest({ query, variables: { id }, token }); revalidatePath("/dashboard/routes"); return { success: true }; }
  catch (err: any) { return { success: false, error: err.message }; }
}

// Vehicles
export async function getVehicles() {
  const token = await getAuthToken();
  const query = `query GetVehicles { getVehicles { id license_plate total_seats seat_map } }`;
  try {
    const data = await graphqlRequest<{ getVehicles: any[] }>({ query, token });
    return { success: true, vehicles: data.getVehicles };
  } catch (err: any) { return { success: false, error: err.message }; }
}
export async function createVehicle(license_plate: string, total_seats: number, seat_map: string) {
  const token = await getAuthToken();
  const query = `mutation CreateVehicle($license_plate: String!, $total_seats: Int!, $seat_map: String!) { createVehicle(license_plate: $license_plate, total_seats: $total_seats, seat_map: $seat_map) { id } }`;
  try { await graphqlRequest({ query, variables: { license_plate, total_seats, seat_map }, token }); revalidatePath("/dashboard/vehicles"); return { success: true }; }
  catch (err: any) { return { success: false, error: err.message }; }
}
export async function deleteVehicle(id: string) {
  const token = await getAuthToken();
  const query = `mutation DeleteVehicle($id: ID!) { deleteVehicle(id: $id) { success } }`;
  try { await graphqlRequest({ query, variables: { id }, token }); revalidatePath("/dashboard/vehicles"); return { success: true }; }
  catch (err: any) { return { success: false, error: err.message }; }
}

// Trips
export async function getTrips(route_id?: string, status?: string) {
  const token = await getAuthToken();
  const query = `query GetTrips($route_id: String, $status: String) { getTrips(route_id: $route_id, status: $status) { id route_id vehicle_id departure_time arrival_time price status } }`;
  try {
    const data = await graphqlRequest<{ getTrips: any[] }>({ query, variables: { route_id, status }, token });
    return { success: true, trips: data.getTrips };
  } catch (err: any) { return { success: false, error: err.message }; }
}
export async function createTrip(route_id: string, vehicle_id: string, departure_time: string, arrival_time: string, price: number) {
  const token = await getAuthToken();
  const query = `mutation CreateTrip($route_id: String!, $vehicle_id: String!, $departure_time: String!, $arrival_time: String!, $price: Int!) { createTrip(route_id: $route_id, vehicle_id: $vehicle_id, departure_time: $departure_time, arrival_time: $arrival_time, price: $price) { id } }`;
  try { await graphqlRequest({ query, variables: { route_id, vehicle_id, departure_time, arrival_time, price }, token }); revalidatePath("/dashboard/trips"); return { success: true }; }
  catch (err: any) { return { success: false, error: err.message }; }
}
export async function updateTripStatus(id: string, status: string) {
  const token = await getAuthToken();
  const query = `mutation UpdateTripStatus($id: ID!, $status: String!) { updateTripStatus(id: $id, status: $status) { id } }`;
  try { await graphqlRequest({ query, variables: { id, status }, token }); revalidatePath("/dashboard/trips"); return { success: true }; }
  catch (err: any) { return { success: false, error: err.message }; }
}

// Bookings & Seats
export async function getBookingsByTrip(trip_id: string) {
  const token = await getAuthToken();
  const query = `query GetBookingsByTrip($trip_id: String!) { getBookingsByTrip(trip_id: $trip_id) { booking_id booking_code seat_numbers passenger_name passenger_email status } }`;
  try {
    const data = await graphqlRequest<{ getBookingsByTrip: any[] }>({ query, variables: { trip_id }, token });
    return { success: true, bookings: data.getBookingsByTrip };
  } catch (err: any) { return { success: false, error: err.message }; }
}
export async function checkInBooking(booking_code: string) {
  const token = await getAuthToken();
  const query = `mutation CheckInBooking($booking_code: String!) { checkInBooking(booking_code: $booking_code) { success message new_status } }`;
  try {
    const data = await graphqlRequest<{ checkInBooking: any }>({ query, variables: { booking_code }, token });
    revalidatePath("/dashboard/trips");
    return { success: data.checkInBooking.success, message: data.checkInBooking.message, new_status: data.checkInBooking.new_status };
  } catch (err: any) { return { success: false, error: err.message }; }
}
export async function blockSeats(trip_id: string, seat_numbers: string[]) {
  const token = await getAuthToken();
  const query = `mutation BlockSeats($trip_id: String!, $seat_numbers: [String!]!) { blockSeats(trip_id: $trip_id, seat_numbers: $seat_numbers) { success message } }`;
  try {
    const data = await graphqlRequest<{ blockSeats: any }>({ query, variables: { trip_id, seat_numbers }, token });
    return { success: data.blockSeats.success, message: data.blockSeats.message };
  } catch (err: any) { return { success: false, error: err.message }; }
}
