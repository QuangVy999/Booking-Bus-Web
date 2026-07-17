"use client";

import React, { useState } from "react";
import { getBookingByCodeAction } from "@/app/actions/booking";
import { checkInBooking } from "@/app/actions/trip";
import { 
  Ticket as TicketIcon, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Search, 
  LogOut,
  Sparkles
} from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";

interface StaffPageClientProps {
  initialTrips: any[];
  student: {
    name: string;
    role: string;
  };
}

export default function StaffPageClient({ initialTrips, student }: StaffPageClientProps) {
  const [selectedTripId, setSelectedTripId] = useState<string>(initialTrips[0]?.id || "");
  const [bookingCode, setBookingCode] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchedBooking, setSearchedBooking] = useState<any | null>(null);
  const [checkInLoading, setCheckInLoading] = useState<boolean>(false);

  const selectedTrip = initialTrips.find(t => t.id === selectedTripId);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim()) {
      toast.error("Vui lòng nhập mã vé!");
      return;
    }

    setSearchLoading(true);
    setSearchedBooking(null);
    try {
      const res = await getBookingByCodeAction(bookingCode.trim().toUpperCase());
      if (res.success) {
        setSearchedBooking(res);
        toast.success("Đã tìm thấy thông tin vé!");
      } else {
        toast.error(res.error || "Không tìm thấy vé. Vui lòng kiểm tra lại mã vé!");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi tìm kiếm vé.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!searchedBooking) return;
    
    // Check if ticket matches selected trip
    if (searchedBooking.tripId !== selectedTripId) {
      toast.error("Vé không thuộc chuyến xe đang soát!");
      return;
    }

    setCheckInLoading(true);
    try {
      const res = await checkInBooking(searchedBooking.bookingCode);
      if (res.success) {
        toast.success(res.message || "Check-in thành công!");
        // Refresh ticket status
        setSearchedBooking({
          ...searchedBooking,
          status: "CHECKED_IN"
        });
      } else {
        toast.error(res.error || res.message || "Check-in thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra trong quá trình check-in.");
    } finally {
      setCheckInLoading(false);
    }
  };

  // Check ticket matching status
  const isTripMatching = searchedBooking ? searchedBooking.tripId === selectedTripId : false;
  const canCheckIn = searchedBooking && searchedBooking.status === "PAID" && isTripMatching;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-slate-700">
      <Toaster position="top-right" richColors />

      {/* Staff Info Banner */}
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Check-in Staff Portal</span>
          </span>
          <h2 className="text-xl font-bold text-slate-800">Xin chào, {student.name}</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Vai trò: Trực cổng kiểm soát vé</p>
        </div>
        <Link 
          href="/api/auth/logout" 
          prefetch={false}
          className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-rose-50 border border-slate-100 hover:border-rose-100 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Left Side: Setup & Search Controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Trip Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Chuyến xe đang soát</span>
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Chọn chuyến kiểm soát</label>
              <select
                value={selectedTripId}
                onChange={(e) => {
                  setSelectedTripId(e.target.value);
                  // Clear previous ticket details to force re-verification
                  setSearchedBooking(null);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-sm outline-none focus:border-orange-500 transition-all"
              >
                {initialTrips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.id.substring(0, 8)}... (Giá: {trip.price.toLocaleString("vi-VN")}đ)
                  </option>
                ))}
              </select>
            </div>
            {selectedTrip && (
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Giá vé:</span>
                  <span>{selectedTrip.price.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trạng thái chuyến:</span>
                  <span className="text-emerald-600 uppercase font-bold">{selectedTrip.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Lookup */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-orange-500" />
              <span>Tra cứu vé</span>
            </h3>
            <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Mã vé / Mã QR</label>
                <input
                  required
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  placeholder="Nhập mã đặt vé (VD: BKG...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 font-mono font-bold text-sm outline-none focus:border-orange-500 focus:bg-white transition-all uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="w-full bg-slate-800 hover:bg-slate-750 disabled:bg-slate-200 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {searchLoading ? "Đang tra cứu..." : "Tìm vé"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Ticket Visual & Actions */}
        <div className="md:col-span-3">
          {searchedBooking ? (
            <div className="space-y-6">
              
              {/* Retro Physical-style Ticket */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
                {/* Visual punch hole left */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 border border-slate-200 rounded-full z-10 hidden md:block"></div>
                {/* Visual punch hole right */}
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 border border-slate-200 rounded-full z-10 hidden md:block"></div>

                <div className="p-6 border-b border-dashed border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase text-orange-500">
                      <TicketIcon className="w-4.5 h-4.5" />
                      <span>Thông tin vé xe</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      searchedBooking.status === "PAID" 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : searchedBooking.status === "CHECKED_IN"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}>
                      {searchedBooking.status === "PAID" 
                        ? "Đã thanh toán (Chờ lên xe)"
                        : searchedBooking.status === "CHECKED_IN"
                        ? "Đã lên xe (Checked In)"
                        : searchedBooking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Hành khách</span>
                      <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{searchedBooking.passengerName}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Mã đặt vé</span>
                      <p className="text-sm font-mono font-black text-orange-500 mt-0.5">{searchedBooking.bookingCode}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Số ghế</span>
                      <p className="text-sm font-black text-slate-800 mt-0.5">{searchedBooking.seatNumbers.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{searchedBooking.passengerEmail}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Ticket segment */}
                <div className="p-6 bg-slate-50 space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Mã chuyến xe liên kết</span>
                    <p className="text-xs font-mono font-bold text-slate-700">{searchedBooking.tripId}</p>
                  </div>

                  {/* Verification checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-150">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">1. Đối chiếu chuyến kiểm soát:</span>
                      {isTripMatching ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Trùng khớp
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" /> Sai chuyến!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">2. Trạng thái thanh toán:</span>
                      {searchedBooking.status === "PAID" || searchedBooking.status === "CHECKED_IN" ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Hợp lệ
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Chưa thanh toán
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons based on verification */}
              {!isTripMatching && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Vé không thuộc chuyến xe này!</h4>
                    <p className="text-xs mt-1 text-rose-600/90 font-medium">
                      Vé này được đặt cho chuyến đi <strong className="font-mono">{searchedBooking.tripId.substring(0, 8)}...</strong>, không trùng khớp với chuyến đang chọn để kiểm soát vé (<strong className="font-mono">{selectedTripId.substring(0, 8)}...</strong>). Vui lòng đổi chuyến soát vé trên thanh điều khiển.
                    </p>
                  </div>
                </div>
              )}

              {isTripMatching && searchedBooking.status === "CHECKED_IN" && (
                <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Vé đã soát trước đó!</h4>
                    <p className="text-xs mt-1 text-blue-600/90 font-medium">
                      Hành khách của vé này đã được check-in lên xe thành công. Không cần check-in lại.
                    </p>
                  </div>
                </div>
              )}

              {canCheckIn && (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={checkInLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-emerald-500/10 active:scale-98 transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer uppercase tracking-wider text-sm"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Xác nhận Check-in cho khách</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400 font-semibold text-xs flex flex-col items-center justify-center gap-3">
              <TicketIcon className="w-12 h-12 text-slate-300" />
              <span>Nhập mã đặt vé của khách để thực hiện tra cứu thông tin & check-in.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
