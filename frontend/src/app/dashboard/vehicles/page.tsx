"use client";

import { useEffect, useState } from "react";
import { getVehicles, createVehicle, deleteVehicle } from "@/app/actions/trip";
import { Bus, Trash2, Plus } from "lucide-react";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [licensePlate, setLicensePlate] = useState("");
  const [totalSeats, setTotalSeats] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    const res = await getVehicles();
    if (res.success && res.vehicles) setVehicles(res.vehicles);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Tự động sinh seat_map mẫu dựa trên số ghế (ví dụ: A01, A02...)
    const cols = 4;
    let seatMap = "";
    for(let i=1; i<=totalSeats; i++) {
      seatMap += `A${i.toString().padStart(2, '0')}`;
      if (i % cols === 0) seatMap += "\n";
      else seatMap += ",";
    }

    await createVehicle(licensePlate, totalSeats, seatMap);
    setLicensePlate("");
    setTotalSeats(30);
    await fetchVehicles();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Xóa xe này?")) {
      await deleteVehicle(id);
      await fetchVehicles();
    }
  }

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bus className="text-orange-500 w-6 h-6" /> Quản lý Xe Khách
          </h1>
          <p className="text-gray-500 text-sm mt-1">Khai báo danh sách xe và thiết lập số lượng ghế ngồi.</p>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Thêm xe mới</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Biển số xe</label>
            <input required value={licensePlate} onChange={e => setLicensePlate(e.target.value)} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all uppercase" placeholder="VD: 51B-123.45" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Số ghế</label>
            <input required type="number" min="10" max="60" value={totalSeats} onChange={e => setTotalSeats(Number(e.target.value))} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" />
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Biển số</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Số ghế</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-24 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vehicles.map(v => (
              <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-medium text-gray-800 uppercase">{v.license_plate}</td>
                <td className="px-6 py-4 text-gray-500">{v.total_seats} ghế</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleDelete(v.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                  <Bus className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                  Chưa có xe nào được khai báo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
