"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Clock, ShieldCheck, Bus, MapPin, AlertCircle, RefreshCw } from "lucide-react";

interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  capacity: number;
}

interface Trip {
  id: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  status: string;
  busCompany: string;
  availableSeats: number;
  route: Route;
  vehicle: Vehicle;
}

interface TripSearchResultsProps {
  trips: Trip[];
  origin: string;
  destination: string;
  date: string;
}

export default function TripSearchResults({ trips, origin, destination, date }: TripSearchResultsProps) {
  // Filters
  const [timeFilter, setTimeFilter] = useState({
    morning: false,   // 00:00 - 12:00
    afternoon: false, // 12:00 - 18:00
    night: false,     // 18:00 - 24:00
  });
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Sorting
  const [sortBy, setSortBy] = useState<"price" | "time" | "duration">("price");

  // Get unique companies and vehicle types in the search results
  const companies = useMemo(() => Array.from(new Set(trips.map((t) => t.busCompany))), [trips]);
  const vehicleTypes = useMemo(() => Array.from(new Set(trips.map((t) => t.vehicle.type))), [trips]);

  // Convert duration string (e.g. "6 giờ", "3.5 giờ") to minutes for sorting
  const getDurationInMinutes = (durationStr: string): number => {
    const hours = parseFloat(durationStr.replace(/[^0-9.]/g, ""));
    return isNaN(hours) ? 0 : Math.round(hours * 60);
  };

  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // 1. Time filter
    if (timeFilter.morning || timeFilter.afternoon || timeFilter.night) {
      result = result.filter((t) => {
        const hour = new Date(t.departureTime).getUTCHours();
        if (timeFilter.morning && hour >= 0 && hour < 12) return true;
        if (timeFilter.afternoon && hour >= 12 && hour < 18) return true;
        if (timeFilter.night && hour >= 18 && hour < 24) return true;
        return false;
      });
    }

    // 2. Company filter
    if (selectedCompanies.length > 0) {
      result = result.filter((t) => selectedCompanies.includes(t.busCompany));
    }

    // 3. Vehicle type filter
    if (selectedTypes.length > 0) {
      result = result.filter((t) => selectedTypes.includes(t.vehicle.type));
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === "price") {
        return a.price - b.price;
      }
      if (sortBy === "time") {
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      }
      if (sortBy === "duration") {
        return getDurationInMinutes(a.route.duration) - getDurationInMinutes(b.route.duration);
      }
      return 0;
    });

    return result;
  }, [trips, timeFilter, selectedCompanies, selectedTypes, sortBy]);

  const toggleCompany = (comp: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-8 items-start">
      {/* Sidebar Filters */}
      <aside className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
            Giờ đi
          </h3>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-semibold selection:bg-transparent">
              <input
                type="checkbox"
                checked={timeFilter.morning}
                onChange={() => setTimeFilter((prev) => ({ ...prev, morning: !prev.morning }))}
                className="rounded border-slate-350 text-orange-500 focus:ring-orange-500 w-4.5 h-4.5"
              />
              <span>Sáng sớm (00:00 - 12:00)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-semibold selection:bg-transparent">
              <input
                type="checkbox"
                checked={timeFilter.afternoon}
                onChange={() => setTimeFilter((prev) => ({ ...prev, afternoon: !prev.afternoon }))}
                className="rounded border-slate-350 text-orange-500 focus:ring-orange-500 w-4.5 h-4.5"
              />
              <span>Chiều (12:00 - 18:00)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-semibold selection:bg-transparent">
              <input
                type="checkbox"
                checked={timeFilter.night}
                onChange={() => setTimeFilter((prev) => ({ ...prev, night: !prev.night }))}
                className="rounded border-slate-350 text-orange-500 focus:ring-orange-500 w-4.5 h-4.5"
              />
              <span>Tối & Đêm (18:00 - 24:00)</span>
            </label>
          </div>
        </div>

        {companies.length > 0 && (
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
              Nhà xe
            </h3>
            <div className="flex flex-col gap-2.5">
              {companies.map((comp) => (
                <label key={comp} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-semibold selection:bg-transparent">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(comp)}
                    onChange={() => toggleCompany(comp)}
                    className="rounded border-slate-350 text-orange-500 focus:ring-orange-500 w-4.5 h-4.5"
                  />
                  <span>{comp}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {vehicleTypes.length > 0 && (
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
              Loại xe
            </h3>
            <div className="flex flex-col gap-2.5">
              {vehicleTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-semibold selection:bg-transparent">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="rounded border-slate-350 text-orange-500 focus:ring-orange-500 w-4.5 h-4.5"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Results Column */}
      <div className="space-y-4">
        {/* Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-sm text-slate-500 font-semibold">
            Tìm thấy <strong className="text-slate-800">{filteredAndSortedTrips.length}</strong> chuyến xe phù hợp
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="text-slate-400">Sắp xếp:</span>
            <button
              onClick={() => setSortBy("price")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                sortBy === "price"
                  ? "bg-orange-50 border-orange-200 text-orange-600 font-black"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Giá rẻ nhất
            </button>
            <button
              onClick={() => setSortBy("time")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                sortBy === "time"
                  ? "bg-orange-50 border-orange-200 text-orange-600 font-black"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Giờ đi sớm nhất
            </button>
            <button
              onClick={() => setSortBy("duration")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                sortBy === "duration"
                  ? "bg-orange-50 border-orange-200 text-orange-600 font-black"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Thời gian ngắn nhất
            </button>
          </div>
        </div>

        {/* Trips List */}
        {filteredAndSortedTrips.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white border border-slate-100 hover:border-orange-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6 items-center"
              >
                {/* Trip Details */}
                <div className="space-y-4">
                  {/* Company & Vehicle Type */}
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-50 text-orange-600 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">
                      {trip.busCompany}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5" />
                      {trip.vehicle.type}
                    </span>
                  </div>

                  {/* Departure/Arrival Timeline */}
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-xl font-black text-slate-800">
                        {formatTime(trip.departureTime)}
                      </div>
                      <div className="text-xs text-slate-400 font-bold mt-0.5">{trip.route.origin}</div>
                    </div>

                    {/* Timeline line */}
                    <div className="flex-1 flex flex-col items-center max-w-[120px]">
                      <span className="text-[10px] text-orange-500 font-extrabold tracking-wider uppercase">
                        {trip.route.duration}
                      </span>
                      <div className="w-full h-0.5 bg-orange-100 relative my-1">
                        <div className="absolute w-2 h-2 rounded-full bg-orange-500 left-0 top-1/2 -translate-y-1/2"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-orange-500 right-0 top-1/2 -translate-y-1/2"></div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {trip.route.distance} km
                      </span>
                    </div>

                    <div>
                      <div className="text-xl font-black text-slate-800">
                        {formatTime(trip.arrivalTime)}
                      </div>
                      <div className="text-xs text-slate-400 font-bold mt-0.5">{trip.route.destination}</div>
                    </div>
                  </div>

                  {/* Safety Policy */}
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50 w-fit">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hủy vé không mất phí trước 24 giờ</span>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex flex-col items-start md:items-end justify-between h-full md:border-l md:border-slate-100 md:pl-6 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider text-left md:text-right">
                      Giá vé từ
                    </div>
                    <div className="text-2xl font-black text-orange-500 mt-0.5">
                      {formatPrice(trip.price)}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mt-1 text-left md:text-right">
                      Còn <strong className="text-orange-600">{trip.availableSeats}</strong> ghế trống
                    </div>
                  </div>

                  <Link
                    href={`/booking/${trip.id}`}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-bold px-6 py-3 rounded-2xl shadow-md hover:shadow-orange-200 transition-all text-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Chọn chuyến</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty View with seed date suggestion */
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm space-y-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Không tìm thấy chuyến xe nào phù hợp</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Rất tiếc, tuyến xe từ <strong>{origin}</strong> đi <strong>{destination}</strong> vào ngày <strong>{formatDate(date)}</strong> hiện không có chuyến hoạt động.
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3">
              <div className="flex items-start gap-2.5 text-orange-800 text-xs font-bold uppercase tracking-wide">
                <span>💡 Gợi ý kiểm thử:</span>
              </div>
              <p className="text-xs text-orange-700 leading-relaxed font-semibold">
                Dữ liệu mẫu (Database Seed) được thiết lập cho tuyến xe này khởi hành vào ngày **27/07/2026**. Bạn có thể chọn ngày này để test luồng đặt vé đầy đủ!
              </p>
              <Link
                href={`/?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=2026-07-27`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử ngày 27/07/2026</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
