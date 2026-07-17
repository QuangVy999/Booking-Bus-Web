"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, MapPin, Calendar, Search } from "lucide-react";

const POPULAR_LOCATIONS = ["TP.HCM", "Đà Lạt", "Nha Trang", "Cần Thơ", "Hà Nội", "Hải Phòng"];

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin") || "");
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");

  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Default date to tomorrow if not selected
  useEffect(() => {
    if (!date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split("T")[0]);
    }
  }, [date]);

  // Click outside to close suggestion dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim() || !date) return;
    
    const params = new URLSearchParams();
    params.set("origin", origin.trim());
    params.set("destination", destination.trim());
    params.set("date", date);

    router.push(`/?${params.toString()}`);
  };

  const filteredOriginSuggestions = POPULAR_LOCATIONS.filter(
    (loc) => loc.toLowerCase().includes(origin.toLowerCase()) && loc !== destination
  );

  const filteredDestSuggestions = POPULAR_LOCATIONS.filter(
    (loc) => loc.toLowerCase().includes(destination.toLowerCase()) && loc !== origin
  );

  return (
    <form
      onSubmit={handleSearch}
      className="w-full bg-white/95 backdrop-blur-md shadow-xl rounded-3xl p-6 md:p-8 border border-orange-100 flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_1fr] gap-4 items-center relative">
        {/* Origin Input */}
        <div className="relative" ref={originRef}>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
            Điểm đi
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
            <input
              type="text"
              placeholder="Chọn điểm đi..."
              value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                setShowOriginSuggestions(true);
              }}
              onFocus={() => setShowOriginSuggestions(true)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-2xl text-slate-800 font-semibold focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Autocomplete Suggestions */}
          {showOriginSuggestions && filteredOriginSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
              {filteredOriginSuggestions.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setOrigin(loc);
                    setShowOriginSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50 text-slate-700 font-semibold transition-colors flex items-center gap-2"
                >
                  <span className="text-orange-400">📍</span>
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center pt-5">
          <button
            type="button"
            onClick={handleSwap}
            className="p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 rounded-full transition-transform hover:rotate-180 duration-500 shadow-sm"
            title="Đổi chiều"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Input */}
        <div className="relative" ref={destRef}>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
            Điểm đến
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
            <input
              type="text"
              placeholder="Chọn điểm đến..."
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowDestSuggestions(true);
              }}
              onFocus={() => setShowDestSuggestions(true)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-2xl text-slate-800 font-semibold focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Autocomplete Suggestions */}
          {showDestSuggestions && filteredDestSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
              {filteredDestSuggestions.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setDestination(loc);
                    setShowDestSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50 text-slate-700 font-semibold transition-colors flex items-center gap-2"
                >
                  <span className="text-orange-400">📍</span>
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
            Ngày đi
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-2xl text-slate-800 font-semibold focus:outline-none transition-colors"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!origin || !destination || !date}
          className="w-full md:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          <span>TÌM CHUYẾN XE</span>
        </button>
      </div>
    </form>
  );
}
