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
    <div className="space-y-8">
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RouteIcon className="text-orange-500 w-6 h-6" /> Quản lý Tuyến Xe
          </h1>
          <p className="text-gray-500 text-sm mt-1">Thiết lập các tuyến đường dựa trên các điểm dừng có sẵn.</p>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Thêm tuyến mới</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên tuyến</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="VD: TP.HCM - Đà Lạt" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Điểm đi</label>
            <select required value={startStopId} onChange={e => setStartStopId(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white">
              <option value="">-- Chọn --</option>
              {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Điểm đến</label>
            <select required value={endStopId} onChange={e => setEndStopId(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white">
              <option value="">-- Chọn --</option>
              {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button disabled={loading} className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all">
            <Plus className="w-5 h-5" /> Thêm
          </button>
        </form>
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left bg-white">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tên tuyến</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Điểm đi</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Điểm đến</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-24 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {routes.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-medium text-gray-800">{r.name}</td>
                <td className="px-6 py-4 text-gray-500">{getStopName(r.start_stop_id)}</td>
                <td className="px-6 py-4 text-gray-500">{getStopName(r.end_stop_id)}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  <RouteIcon className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                  Chưa có tuyến xe nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
