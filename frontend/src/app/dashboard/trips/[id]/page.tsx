"use client";

import { useEffect, useState } from "react";
import { getBookingsByTrip, checkInBooking, blockSeats } from "@/app/actions/trip";
import { getSeatInventory } from "@/app/actions/booking";
import { Ticket, CheckCircle, ShieldAlert } from "lucide-react";

export default function TripDetailsPage({ params }: { params: { id: string } }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [bookingCode, setBookingCode] = useState("");
  const [checkInMsg, setCheckInMsg] = useState("");
  
  // Seat blocking
  const [seatToBlock, setSeatToBlock] = useState("");
  const [blockMsg, setBlockMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    const [bRes, sRes] = await Promise.all([
      getBookingsByTrip(params.id),
      getSeatInventory(params.id)
    ]);
    if (bRes.success && bRes.bookings) setBookings(bRes.bookings);
    if (sRes.success && sRes.seats) setSeats(sRes.seats);
  }

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setCheckInMsg("Đang xử lý...");
    const res = await checkInBooking(bookingCode);
    if (res.success) {
      setCheckInMsg(`✅ ${res.message}`);
      setBookingCode("");
      fetchData();
    } else {
      setCheckInMsg(`❌ Lỗi: ${res.error || res.message}`);
    }
  }

  async function handleBlockSeat(e: React.FormEvent) {
    e.preventDefault();
    setBlockMsg("Đang xử lý...");
    const res = await blockSeats(params.id, [seatToBlock]);
    if (res.success) {
      setBlockMsg(`✅ Đã khóa ghế ${seatToBlock}`);
      setSeatToBlock("");
      fetchData();
    } else {
      setBlockMsg(`❌ Lỗi: ${res.error || res.message}`);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <Ticket className="text-orange-500" /> Chi tiết chuyến xe
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-in Card */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" /> Check-in Hành Khách
          </h2>
          <form onSubmit={handleCheckIn} className="flex gap-2">
            <input 
              required 
              value={bookingCode} 
              onChange={e => setBookingCode(e.target.value)} 
              placeholder="Nhập mã vé (VD: BKGA1B2C3)" 
              className="flex-1 border rounded px-3 py-2" 
            />
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
              Check-in
            </button>
          </form>
          {checkInMsg && <p className="mt-2 text-sm font-medium">{checkInMsg}</p>}
        </div>

        {/* Block Seats Card */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Khóa ghế (Không bán)
          </h2>
          <form onSubmit={handleBlockSeat} className="flex gap-2">
            <input 
              required 
              value={seatToBlock} 
              onChange={e => setSeatToBlock(e.target.value)} 
              placeholder="Mã ghế (VD: A01)" 
              className="flex-1 border rounded px-3 py-2" 
            />
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium">
              Khóa ghế
            </button>
          </form>
          {blockMsg && <p className="mt-2 text-sm font-medium">{blockMsg}</p>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách Booking</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Mã vé</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Hành khách</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Ghế</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map(b => (
                <tr key={b.booking_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{b.booking_code}</td>
                  <td className="px-4 py-3">{b.passenger_name}</td>
                  <td className="px-4 py-3 text-gray-600">{b.passenger_email}</td>
                  <td className="px-4 py-3 font-medium text-orange-600">{b.seat_numbers.join(", ")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      b.status === "PAID" ? "bg-blue-100 text-blue-700" :
                      b.status === "CHECKED_IN" ? "bg-green-100 text-green-700" :
                      b.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Chưa có lượt đặt vé nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
