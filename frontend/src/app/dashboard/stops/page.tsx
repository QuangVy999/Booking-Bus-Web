"use client";

import { useEffect, useState } from "react";
import { getStops, createStop, deleteStop } from "@/app/actions/trip";
import { MapPin, Trash2, Plus } from "lucide-react";

export default function StopsPage() {
  const [stops, setStops] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStops();
  }, []);

  async function fetchStops() {
    const res = await getStops();
    if (res.success && res.stops) setStops(res.stops);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await createStop(name, address);
    setName("");
    setAddress("");
    await fetchStops();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Xóa điểm dừng này?")) {
      await deleteStop(id);
      await fetchStops();
    }
  }

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="text-orange-500 w-6 h-6" /> Quản lý Điểm Dừng
          </h1>
          <p className="text-gray-500 text-sm mt-1">Thêm và quản lý các bến xe, trạm đón trả khách.</p>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Thêm điểm dừng mới</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên bến/điểm</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="VD: Bến xe Miền Đông" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ</label>
            <input required value={address} onChange={e => setAddress(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="VD: 292 Đinh Bộ Lĩnh..." />
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tên điểm dừng</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Địa chỉ</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-24 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {stops.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-medium text-gray-800">{s.name}</td>
                <td className="px-6 py-4 text-gray-500">{s.address}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {stops.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                  Chưa có điểm dừng nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
