"use client";

import { useEffect, useState } from "react";
import { getBookingsByTrip, checkInBooking, blockSeats } from "@/app/actions/trip";
import { getSeatInventory } from "@/app/actions/booking";
import { Ticket, CheckCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-8">
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/trips" className="text-gray-400 hover:text-orange-500 transition-colors p-1.5 hover:bg-orange-50 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="text-orange-500 w-6 h-6" /> Chi tiết Chuyến xe
            </h1>
          </div>
          <p className="text-gray-500 text-sm pl-10">Quản lý đặt vé, soát vé và khóa ghế cho chuyến xe này.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-in Card */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500 w-5 h-5" /> Check-in Hành Khách
          </h2>
          <form onSubmit={handleCheckIn} className="flex gap-3">
            <input 
              required 
              value={bookingCode} 
              onChange={e => setBookingCode(e.target.value)} 
              placeholder="Nhập mã vé (VD: BK...)" 
              className="flex-1 border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all uppercase" 
            />
            <button className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-medium transition-all">
              Xác nhận
            </button>
          </form>
          {checkInMsg && <p className="mt-3 text-sm font-medium text-green-700 bg-green-50 p-3 rounded-xl border border-green-100">{checkInMsg}</p>}
        </div>

        {/* Block Seats Card */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldAlert className="text-red-500 w-5 h-5" /> Khóa ghế (Không bán)
          </h2>
          <form onSubmit={handleBlockSeat} className="flex gap-3">
            <input 
              required 
              value={seatToBlock} 
              onChange={e => setSeatToBlock(e.target.value)} 
              placeholder="Mã ghế (VD: A01)" 
              className="flex-1 border-gray-200 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all uppercase" 
            />
            <button className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-medium transition-all">
              Khóa ghế
            </button>
          </form>
          {blockMsg && <p className="mt-3 text-sm font-medium text-red-700 bg-red-50 p-3 rounded-xl border border-red-100">{blockMsg}</p>}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Danh sách Booking</h2>
        <div className="rounded-2xl overflow-hidden border border-gray-100">
          <table className="w-full text-left bg-white text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-semibold text-gray-600">Mã vé</th>
                <th className="px-5 py-4 font-semibold text-gray-600">Hành khách</th>
                <th className="px-5 py-4 font-semibold text-gray-600">Email</th>
                <th className="px-5 py-4 font-semibold text-gray-600">Ghế</th>
                <th className="px-5 py-4 font-semibold text-gray-600 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map(b => (
                <tr key={b.booking_id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-gray-800">{b.booking_code}</td>
                  <td className="px-5 py-4 font-medium text-gray-700">{b.passenger_name}</td>
                  <td className="px-5 py-4 text-gray-500">{b.passenger_email}</td>
                  <td className="px-5 py-4 font-bold text-orange-600">{b.seat_numbers.join(", ")}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold border ${
                      b.status === "PAID" ? "bg-blue-100 text-blue-700 border-blue-200" :
                      b.status === "CHECKED_IN" ? "bg-green-100 text-green-700 border-green-200" :
                      b.status === "CANCELLED" ? "bg-red-100 text-red-700 border-red-200" :
                      "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    <Ticket className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    Chưa có lượt đặt vé nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
