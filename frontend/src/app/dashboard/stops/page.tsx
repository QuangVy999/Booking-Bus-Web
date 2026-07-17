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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="text-orange-500" /> Quản lý Điểm Dừng
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Thêm điểm dừng mới</h2>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Tên bến/điểm</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="VD: Bến xe Miền Đông" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
            <input required value={address} onChange={e => setAddress(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="VD: 292 Đinh Bộ Lĩnh..." />
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
              <th className="px-6 py-3 font-semibold text-gray-600">Tên điểm dừng</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Địa chỉ</th>
              <th className="px-6 py-3 font-semibold text-gray-600 w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stops.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4 text-gray-600">{s.address}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {stops.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Chưa có điểm dừng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
