'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Armchair } from 'lucide-react';

interface Seat {
  seatNumber: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  bookingId?: string;
}

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  onToggleSeat: (seatNumber: string) => void;
}

export default function SeatMap({ seats, selectedSeats, onToggleSeat }: SeatMapProps) {
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');

  const lowerSeats = seats.filter(s => s.seatNumber.startsWith('A'));
  const upperSeats = seats.filter(s => s.seatNumber.startsWith('B'));

  const renderDeckGrid = (deckSeats: Seat[]) => {
    // 3 columns of seats: Left Column, Middle Column, Right Column
    const rows: Seat[][] = [];
    for (let i = 0; i < deckSeats.length; i += 3) {
      rows.push(deckSeats.slice(i, i + 3));
    }

    return (
      <div className="space-y-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
        {/* Front of bus indicator */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phía trước xe</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] text-slate-600 font-bold uppercase">
            Tài xế
          </div>
        </div>

        {/* Seat rows with aisles */}
        <div className="grid gap-3.5 mt-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-between items-center">
              {/* Left Seat */}
              {row[0] && renderSeatButton(row[0])}
              
              {/* Left Aisle */}
              <div className="w-6 text-center text-[9px] text-slate-350 font-bold uppercase tracking-wider pointer-events-none">Lối đi</div>

              {/* Middle Seat */}
              {row[1] && renderSeatButton(row[1])}

              {/* Right Aisle */}
              <div className="w-6 text-center text-[9px] text-slate-350 font-bold uppercase tracking-wider pointer-events-none">Lối đi</div>

              {/* Right Seat */}
              {row[2] && renderSeatButton(row[2])}
            </div>
          ))}
        </div>
        
        <div className="pt-3 border-t border-slate-100 flex justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Phía sau xe
        </div>
      </div>
    );
  };

  const renderSeatButton = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.seatNumber);
    const isAvailable = seat.status === 'AVAILABLE';
    const isHeld = seat.status === 'HELD';
    const isBooked = seat.status === 'BOOKED';
    const isBlocked = seat.status === 'BLOCKED';

    return (
      <button
        key={seat.seatNumber}
        type="button"
        disabled={!isAvailable}
        onClick={() => onToggleSeat(seat.seatNumber)}
        className={cn(
          "w-12 h-12 rounded-lg flex flex-col justify-center items-center gap-0.5 border text-xs font-bold transition-all duration-200 outline-none active:scale-95",
          // Available (Light blue border, white bg)
          isAvailable && !isSelected && "bg-sky-50/20 border-sky-200 hover:border-orange-500 hover:bg-orange-50/30 text-sky-600",
          // Selected (Orange bg, orange border)
          isAvailable && isSelected && "bg-orange-100 border-orange-500 text-orange-600",
          // Held (Light amber bg, amber border)
          isHeld && "bg-amber-50/50 border-amber-300 text-amber-500 cursor-not-allowed",
          // Booked (Grey bg, disabled)
          isBooked && "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
          // Blocked
          isBlocked && "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed"
        )}
      >
        <Armchair className="w-4.5 h-4.5" />
        <span className="text-[10px] font-mono leading-none">{seat.seatNumber}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Deck Selector Tabs */}
      <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg max-w-xs mx-auto shadow-inner">
        <button
          type="button"
          onClick={() => setActiveDeck('lower')}
          className={cn(
            "flex-1 text-center py-2 rounded-md text-xs font-bold transition-all duration-200",
            activeDeck === 'lower' 
              ? "bg-white text-slate-900 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          Tầng dưới (A01-A15)
        </button>
        <button
          type="button"
          onClick={() => setActiveDeck('upper')}
          className={cn(
            "flex-1 text-center py-2 rounded-md text-xs font-bold transition-all duration-200",
            activeDeck === 'upper' 
              ? "bg-white text-slate-900 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          Tầng trên (B01-B15)
        </button>
      </div>

      {/* Render selected deck grid */}
      {activeDeck === 'lower' ? renderDeckGrid(lowerSeats) : renderDeckGrid(upperSeats)}

      {/* Legend / Status indicators */}
      <div className="flex gap-5 justify-center py-2 px-3 bg-slate-50 border border-slate-150 rounded-lg text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-slate-200 bg-slate-100"></div>
          <span>Đã bán</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-sky-200 bg-white"></div>
          <span>Còn trống</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-orange-500 bg-orange-100"></div>
          <span>Đang chọn</span>
        </div>
      </div>
    </div>
  );
}
