"use client";

import { useEffect, useState } from "react";
import { getTrips, getRoutes, getVehicles, createTrip, updateTripStatus } from "@/app/actions/trip";
import { Map, Eye, Plus } from "lucide-react";
import Link from "next/link";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routeId, setRouteId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [tripsRes, routesRes, vehiclesRes] = await Promise.all([getTrips(), getRoutes(), getVehicles()]);
    if (tripsRes.success && tripsRes.trips) setTrips(tripsRes.trips);
    if (routesRes.success && routesRes.routes) setRoutes(routesRes.routes);
    if (vehiclesRes.success && vehiclesRes.vehicles) setVehicles(vehiclesRes.vehicles);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Ensure format is compatible. HTML datetime-local uses YYYY-MM-DDThh:mm
    const depDate = new Date(departureTime).toISOString();
    const arrDate = new Date(arrivalTime).toISOString();
    
    await createTrip(routeId, vehicleId, depDate, arrDate, Number(price));
    setRouteId("");
    setVehicleId("");
    setDepartureTime("");
    setArrivalTime("");
    setPrice("");
    await fetchData();
    setLoading(false);
  }

  async function handleStatusChange(id: string, status: string) {
    await updateTripStatus(id, status);
    await fetchData();
  }

  const getRouteName = (id: string) => routes.find(r => r.id === id)?.name || id;
  const getVehicleLicense = (id: string) => vehicles.find(v => v.id === id)?.license_plate || id;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Map className="text-orange-500" /> Quản lý Chuyến Xe
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Thêm chuyến xe mới</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Tuyến xe</label>
            <select required value={routeId} onChange={e => setRouteId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white">
              <option value="">-- Chọn tuyến --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Xe</label>
            <select required value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white">
              <option value="">-- Chọn xe --</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} - {v.total_seats} chỗ</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giá vé (VNĐ)</label>
            <input required type="number" min={0} value={price} onChange={e => setPrice(Number(e.target.value) || "")} className="w-full border rounded-md px-3 py-2" placeholder="VD: 150000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giờ khởi hành</label>
            <input required type="datetime-local" value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giờ đến dự kiến</label>
            <input required type="datetime-local" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} className="w-full border rounded-md px-3 py-2" />
          </div>
          <button disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium flex items-center justify-center gap-2 h-10">
            <Plus className="w-5 h-5" /> Thêm chuyến
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto border">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">Tuyến</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Xe</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Khởi hành</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Giá vé</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Trạng thái</th>
              <th className="px-6 py-3 font-semibold text-gray-600 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {trips.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{getRouteName(t.route_id)}</td>
                <td className="px-6 py-4 text-gray-600">{getVehicleLicense(t.vehicle_id)}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(t.departure_time).toLocaleString("vi-VN")}</td>
                <td className="px-6 py-4 text-gray-600">{t.price.toLocaleString("vi-VN")} đ</td>
                <td className="px-6 py-4">
                  <select 
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    className="border rounded text-sm px-2 py-1 bg-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LOCKED">LOCKED</option>
                    <option value="DEPARTED">DEPARTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <Link href={`/dashboard/trips/${t.id}`} className="text-blue-500 hover:text-blue-700 p-2 inline-block rounded hover:bg-blue-50">
                    <Eye className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
            {trips.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chưa có chuyến xe nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
