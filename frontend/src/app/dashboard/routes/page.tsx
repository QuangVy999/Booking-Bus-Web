"use client";

import { useEffect, useState } from "react";
import { getRoutes, createRoute, deleteRoute, getStops } from "@/app/actions/trip";
import { Route as RouteIcon, Trash2, Plus } from "lucide-react";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [stops, setStops] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [startStopId, setStartStopId] = useState("");
  const [endStopId, setEndStopId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [routesRes, stopsRes] = await Promise.all([getRoutes(), getStops()]);
    if (routesRes.success && routesRes.routes) setRoutes(routesRes.routes);
    if (stopsRes.success && stopsRes.stops) setStops(stopsRes.stops);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (startStopId === endStopId) return alert("Điểm đầu và điểm cuối không được trùng nhau");
    
    setLoading(true);
    await createRoute(name, startStopId, endStopId);
    setName("");
    setStartStopId("");
    setEndStopId("");
    await fetchData();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Xóa tuyến xe này?")) {
      await deleteRoute(id);
      await fetchData();
    }
  }

  const getStopName = (id: string) => stops.find(s => s.id === id)?.name || id;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <RouteIcon className="text-orange-500" /> Quản lý Tuyến Xe
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Thêm tuyến mới</h2>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Tên tuyến</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="VD: TP.HCM - Đà Lạt" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Điểm đi</label>
            <select required value={startStopId} onChange={e => setStartStopId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white">
              <option value="">-- Chọn --</option>
              {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Điểm đến</label>
            <select required value={endStopId} onChange={e => setEndStopId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white">
              <option value="">-- Chọn --</option>
              {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2">
            <Plus className="w-5 h-5" /> Thêm
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">Tên tuyến</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Điểm đi</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Điểm đến</th>
              <th className="px-6 py-3 font-semibold text-gray-600 w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {routes.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{r.name}</td>
                <td className="px-6 py-4 text-gray-600">{getStopName(r.start_stop_id)}</td>
                <td className="px-6 py-4 text-gray-600">{getStopName(r.end_stop_id)}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có tuyến xe nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
