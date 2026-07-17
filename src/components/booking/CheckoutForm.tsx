'use client';

import React from 'react';
import { Ticket, Info } from 'lucide-react';

interface CheckoutFormProps {
  tripId: string;
  selectedSeats: string[];
  isPending: boolean;
  errorMessage?: string;
}

export default function CheckoutForm({ tripId, selectedSeats, isPending, errorMessage }: CheckoutFormProps) {
  const pricePerSeat = 250000;
  const totalAmount = selectedSeats.length * pricePerSeat;

  return (
    <div className="space-y-6">
      {/* Outbound Trip Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Thông tin chuyến đi</h3>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">Tuyến xe:</span>
            <span className="font-semibold text-slate-700">An Sương → Phan Rang</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Thời gian xuất bến:</span>
            <span className="font-semibold text-emerald-600 font-mono">08:00 27/07/2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Số lượng ghế:</span>
            <span className="font-semibold text-slate-700">{selectedSeats.length} Ghế</span>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex justify-between items-start">
              <span className="text-slate-400">Số ghế:</span>
              <span className="font-mono text-orange-500 font-bold text-right max-w-[150px] break-words">
                {selectedSeats.join(', ')}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
            <span className="text-slate-700">Tổng tiền lượt đi:</span>
            <span className="text-emerald-600 font-mono text-sm">{totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
            <span>Chi tiết giá</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </h3>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">Giá vé lượt đi:</span>
            <span className="font-mono text-slate-700">{totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Phí thanh toán:</span>
            <span className="font-mono text-slate-700">0 đ</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-100 text-sm font-bold">
            <span className="text-slate-800">Tổng tiền:</span>
            <span className="text-orange-500 font-mono text-base">{totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-250 rounded-xl p-3 text-xs text-rose-600 font-bold">
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || selectedSeats.length === 0}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-orange-500/10 transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm uppercase tracking-wider"
      >
        {isPending ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Ticket className="w-4.5 h-4.5" />
            <span>Tiến hành giữ chỗ</span>
          </>
        )}
      </button>
    </div>
  );
}
