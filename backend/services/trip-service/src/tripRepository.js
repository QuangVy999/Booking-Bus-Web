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
    const startStop = await db("stops").where({ id: data.start_stop_id }).first();
    const endStop = await db("stops").where({ id: data.end_stop_id }).first();
    const getCityName = (stopName) => {
      if (stopName.includes("TP.HCM")) return "TP.HCM";
      if (stopName.includes("Cần Thơ")) return "Cần Thơ";
      if (stopName.includes("Đà Lạt")) return "Đà Lạt";
      if (stopName.includes("Nha Trang")) return "Nha Trang";
      if (stopName.includes("Hà Nội")) return "Hà Nội";
      if (stopName.includes("Hải Phòng")) return "Hải Phòng";
      return stopName;
    };
    const origin = startStop ? getCityName(startStop.name) : "TP.HCM";
    const destination = endStop ? getCityName(endStop.name) : "Đà Lạt";
    const routeData = {
      ...data,
      origin,
      destination,
      distance: 300,
      duration: "6 giờ"
    };
    const [route] = await db("routes").insert(routeData).returning("*");
    return route;
  },
  async updateRoute(id, data) {
    const routeData = { ...data };
    if (data.start_stop_id || data.end_stop_id) {
      const startId = data.start_stop_id || (await db("routes").where({ id }).first())?.start_stop_id;
      const endId = data.end_stop_id || (await db("routes").where({ id }).first())?.end_stop_id;
      const startStop = await db("stops").where({ id: startId }).first();
      const endStop = await db("stops").where({ id: endId }).first();
      const getCityName = (stopName) => {
        if (stopName.includes("TP.HCM")) return "TP.HCM";
        if (stopName.includes("Cần Thơ")) return "Cần Thơ";
        if (stopName.includes("Đà Lạt")) return "Đà Lạt";
        if (stopName.includes("Nha Trang")) return "Nha Trang";
        if (stopName.includes("Hà Nội")) return "Hà Nội";
        if (stopName.includes("Hải Phòng")) return "Hải Phòng";
        return stopName;
      };
      if (startStop) routeData.origin = getCityName(startStop.name);
      if (endStop) routeData.destination = getCityName(endStop.name);
    }
    const [route] = await db("routes").where({ id }).update(routeData).returning("*");
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
    const vehicleData = {
      ...data,
      plate_number: data.license_plate,
      capacity: data.total_seats,
      type: data.total_seats === 20 ? "Limousine 20 chỗ" : data.total_seats === 40 ? "Giường nằm 40 chỗ" : "Ghế ngồi " + data.total_seats + " chỗ"
    };
    const [vehicle] = await db("vehicles").insert(vehicleData).returning("*");
    return vehicle;
  },
  async updateVehicle(id, data) {
    const vehicleData = { ...data };
    if (data.license_plate) vehicleData.plate_number = data.license_plate;
    if (data.total_seats) {
      vehicleData.capacity = data.total_seats;
      vehicleData.type = data.total_seats === 20 ? "Limousine 20 chỗ" : data.total_seats === 40 ? "Giường nằm 40 chỗ" : "Ghế ngồi " + data.total_seats + " chỗ";
    }
    const [vehicle] = await db("vehicles").where({ id }).update(vehicleData).returning("*");
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
    const tripData = {
      ...data,
      bus_company: "Phương Trang Demo"
    };
    const [trip] = await db("trips").insert(tripData).returning("*");
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
