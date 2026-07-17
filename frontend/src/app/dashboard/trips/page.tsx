"use client";

import { useEffect, useState } from "react";
import { getTrips, getRoutes, getVehicles, createTrip, updateTripStatus, deleteTrip, getStops } from "@/app/actions/trip";
import Link from "next/link";
import { Map, Eye, Trash2, Plus, ArrowRight } from "lucide-react";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stops, setStops] = useState<any[]>([]);

  const [routeId, setRouteId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [tRes, rRes, vRes, sRes] = await Promise.all([getTrips(), getRoutes(), getVehicles(), getStops()]);
    if (tRes.success && tRes.trips) setTrips(tRes.trips);
    if (rRes.success && rRes.routes) setRoutes(rRes.routes);
    if (vRes.success && vRes.vehicles) setVehicles(vRes.vehicles);
    if (sRes.success && sRes.stops) setStops(sRes.stops);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await createTrip(routeId, vehicleId, new Date(departureTime).toISOString(), new Date(arrivalTime).toISOString(), price);
    setRouteId(""); setVehicleId(""); setDepartureTime(""); setArrivalTime(""); setPrice(0);
    await fetchData();
    setLoading(false);
  }

  async function handleStatus(id: string, newStatus: string) {
    await updateTripStatus(id, newStatus);
    await fetchData();
  }

  async function handleDelete(id: string) {
    if (confirm("Xóa chuyến xe này?")) {
      await deleteTrip(id);
      await fetchData();
    }
  }

  const getStopName = (id: string) => stops.find(s => s.id === id)?.name || id;
  
  const getRouteName = (r_id: string) => {
    const r = routes.find(x => x.id === r_id);
    if (!r) return r_id;
    return `${getStopName(r.start_stop_id)} - ${getStopName(r.end_stop_id)}`;
  };
  
  const getVehicleName = (v_id: string) => vehicles.find(x => x.id === v_id)?.license_plate || v_id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-700 border-green-200";
      case "DEPARTED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "COMPLETED": return "bg-gray-100 text-gray-700 border-gray-200";
      case "LOCKED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Map className="text-orange-500 w-6 h-6" /> Quản lý Chuyến Xe
          </h1>
          <p className="text-gray-500 text-sm mt-1">Lên lịch và theo dõi các chuyến xe hoạt động.</p>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Tạo chuyến mới</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tuyến</label>
            <select required value={routeId} onChange={e => setRouteId(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white">
              <option value="">-- Chọn --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{getRouteName(r.id)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Xe</label>
            <select required value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white uppercase">
              <option value="">-- Chọn --</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giờ đi</label>
            <input required type="datetime-local" value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giờ đến</label>
            <input required type="datetime-local" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá vé (VNĐ)</label>
            <input required type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
          </div>
          <div className="md:col-span-2 lg:col-span-6 flex justify-end mt-2">
            <button disabled={loading} className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all">
              <Plus className="w-5 h-5" /> Tạo chuyến xe
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left bg-white text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-4 py-4 font-semibold text-gray-600">Tuyến & Thời gian</th>
              <th className="px-4 py-4 font-semibold text-gray-600">Xe</th>
              <th className="px-4 py-4 font-semibold text-gray-600">Giá vé</th>
              <th className="px-4 py-4 font-semibold text-gray-600 text-center">Trạng thái</th>
              <th className="px-4 py-4 font-semibold text-gray-600 text-center">Đổi TT</th>
              <th className="px-4 py-4 font-semibold text-gray-600 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {trips.map(t => (
              <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-4 py-4">
                  <div className="font-semibold text-gray-900 mb-1">{getRouteName(t.route_id)}</div>
                  <div className="text-gray-500 text-xs flex items-center gap-1.5">
                    {new Date(t.departure_time).toLocaleString("vi-VN")} 
                    <ArrowRight className="w-3 h-3" /> 
                    {new Date(t.arrival_time).toLocaleString("vi-VN")}
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-gray-700 uppercase">{getVehicleName(t.vehicle_id)}</td>
                <td className="px-4 py-4 font-medium text-orange-600">{t.price.toLocaleString("vi-VN")}đ</td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getStatusColor(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <select 
                    value={t.status} 
                    onChange={e => handleStatus(t.id, e.target.value)}
                    className="text-xs border rounded-md px-2 py-1 bg-white outline-none focus:border-orange-400"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DEPARTED">DEPARTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="LOCKED">LOCKED</option>
                  </select>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/dashboard/trips/${t.id}`} className="text-gray-400 hover:text-orange-500 p-2 rounded-lg hover:bg-orange-50 transition-colors" title="Chi tiết & Check-in">
                      <Eye className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100" title="Xóa">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {trips.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  <Map className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                  Chưa có chuyến xe nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
