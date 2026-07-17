import { db } from "./db.js";

export const tripRepository = {
  // STOPS
  async createStop(data) {
    const [stop] = await db("stops").insert(data).returning("*");
    return stop;
  },
  async updateStop(id, data) {
    const [stop] = await db("stops").where({ id }).update(data).returning("*");
    return stop;
  },
  async deleteStop(id) {
    const count = await db("stops").where({ id }).del();
    return count > 0;
  },
  async getStops() {
    return db("stops").select("*");
  },

  // ROUTES
  async createRoute(data) {
    const [route] = await db("routes").insert(data).returning("*");
    return route;
  },
  async updateRoute(id, data) {
    const [route] = await db("routes").where({ id }).update(data).returning("*");
    return route;
  },
  async deleteRoute(id) {
    const count = await db("routes").where({ id }).del();
    return count > 0;
  },
  async getRoutes() {
    return db("routes").select("*");
  },

  // VEHICLES
  async createVehicle(data) {
    const [vehicle] = await db("vehicles").insert(data).returning("*");
    return vehicle;
  },
  async updateVehicle(id, data) {
    const [vehicle] = await db("vehicles").where({ id }).update(data).returning("*");
    return vehicle;
  },
  async deleteVehicle(id) {
    const count = await db("vehicles").where({ id }).del();
    return count > 0;
  },
  async getVehicles() {
    return db("vehicles").select("*");
  },

  // TRIPS
  async createTrip(data) {
    const [trip] = await db("trips").insert(data).returning("*");
    return trip;
  },
  async updateTrip(id, data) {
    const [trip] = await db("trips").where({ id }).update(data).returning("*");
    return trip;
  },
  async updateTripStatus(id, status) {
    const [trip] = await db("trips").where({ id }).update({ status }).returning("*");
    return trip;
  },
  async deleteTrip(id) {
    const count = await db("trips").where({ id }).del();
    return count > 0;
  },
  async getTrips(route_id, status) {
    const query = db("trips").select("*");
    if (route_id) query.where({ route_id });
    if (status) query.where({ status });
    return query;
  },
};
