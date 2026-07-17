"use client";

import { useEffect, useState } from "react";
import { getVehicles, createVehicle, deleteVehicle } from "@/app/actions/trip";
import { Bus, Trash2, Plus } from "lucide-react";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [licensePlate, setLicensePlate] = useState("");
  const [totalSeats, setTotalSeats] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await getVehicles();
    if (res.success && res.vehicles) setVehicles(res.vehicles);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Auto-generate a dummy seat map for simplicity based on totalSeats
    const map = { rows: Math.ceil(Number(totalSeats) / 4), columns: 4 };
    
    await createVehicle(licensePlate, Number(totalSeats), JSON.stringify(map));
    setLicensePlate("");
    setTotalSeats("");
    await fetchData();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Xóa xe này?")) {
      await deleteVehicle(id);
      await fetchData();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Bus className="text-orange-500" /> Quản lý Xe
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Thêm xe mới</h2>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Biển số xe</label>
            <input required value={licensePlate} onChange={e => setLicensePlate(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="VD: 51B-123.45" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Tổng số ghế</label>
            <input required type="number" min={10} max={60} value={totalSeats} onChange={e => setTotalSeats(Number(e.target.value) || "")} className="w-full border rounded-md px-3 py-2" placeholder="VD: 34" />
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
              <th className="px-6 py-3 font-semibold text-gray-600">Biển số xe</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Tổng số ghế</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Sơ đồ ghế (JSON)</th>
              <th className="px-6 py-3 font-semibold text-gray-600 w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vehicles.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{v.license_plate}</td>
                <td className="px-6 py-4 text-gray-600">{v.total_seats}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{v.seat_map}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có xe nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
