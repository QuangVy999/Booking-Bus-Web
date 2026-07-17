'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { confirmPaymentAction } from '@/app/actions/booking';
import { toast, Toaster } from 'sonner';
import { CreditCard, XCircle, CheckCircle, Clock, Calendar, Mail, User, Bus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BookingInfo {
  bookingId: string;
  bookingCode: string;
  tripId: string;
  seatNumbers: string[];
  passengerName: string;
  passengerEmail: string;
  status: string;
}

interface ConfirmationPageClientProps {
  booking: BookingInfo;
}

export default function ConfirmationPageClient({ booking }: ConfirmationPageClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('05:00');

  useEffect(() => {
    if (booking.status !== 'PENDING_PAYMENT') return;

    let seconds = 300;
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(timer);
        setTimeLeft('Hết hạn');
        toast.error('Giao dịch giữ chỗ đã hết hạn. Hãy đặt lại vé.');
        router.refresh();
      } else {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking.status, router]);

  const handleConfirmPayment = async () => {
    setIsPending(true);
    toast.info('Đang xử lý thanh toán mô phỏng...');
    try {
      const res = await confirmPaymentAction(booking.bookingId);
      if (res.success) {
        toast.success('Thanh toán thành công! Vé của bạn đã được xuất.');
        router.refresh();
      } else {
        toast.error(`Thanh toán thất bại: ${res.message}`);
      }
    } catch (err: any) {
      toast.error('Có lỗi xảy ra khi gọi API thanh toán.');
    } finally {
      setIsPending(false);
    }
  };

  const totalAmount = booking.seatNumbers.length * 250000;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-slate-700">
      <Toaster position="top-right" richColors />

      {/* State banner */}
      <div className="text-center space-y-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        {booking.status === 'PENDING_PAYMENT' && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-full text-xs font-bold animate-pulse">
            <Clock className="w-4 h-4" />
            <span>Chờ thanh toán: {timeLeft}</span>
          </div>
        )}
        {booking.status === 'PAID' && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-full text-xs font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Đặt chỗ & Thanh toán thành công</span>
          </div>
        )}
        {booking.status === 'CANCELLED' && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-full text-xs font-bold">
            <XCircle className="w-4 h-4" />
            <span>Vé đã bị hủy / hết hạn</span>
          </div>
        )}

        <h1 className="text-2xl font-black text-slate-800">Xác nhận thanh toán vé xe</h1>
        <p className="text-slate-500 text-xs font-semibold">
          Mã đặt vé: <span className="font-mono text-orange-500 font-bold">{booking.bookingCode}</span>
        </p>
      </div>

      {/* Main Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">Chi tiết đặt vé</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Bus className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold">Tuyến xe</span>
                <p className="text-sm font-bold text-slate-850">TP. Hồ Chí Minh → Đà Lạt</p>
                <p className="text-[11px] text-slate-500">Mã chuyến: {booking.tripId}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold">Ghế đã giữ</span>
                <p className="text-sm font-bold font-mono text-orange-500">{booking.seatNumbers.join(', ')}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold">Hành khách</span>
                <p className="text-sm font-bold text-slate-850">{booking.passengerName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold">Email nhận vé</span>
                <p className="text-sm font-bold text-slate-800">{booking.passengerEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing info */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">Tổng cộng chi phí:</span>
          <span className="text-lg font-black text-emerald-600 font-mono">{totalAmount.toLocaleString('vi-VN')} đ</span>
        </div>

        {/* State Machine visual flow */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Quy trình xử lý vé</span>
          <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-150 rounded-xl text-[10px] font-bold text-slate-500">
            <span className={cn(booking.status === 'PENDING_PAYMENT' ? "text-amber-500 font-bold" : "text-slate-400")}>1. Giữ chỗ (5p)</span>
            <span className="text-slate-300">→</span>
            <span className={cn(booking.status === 'PAID' ? "text-emerald-500 font-bold" : "text-slate-400")}>2. Đã thanh toán</span>
            <span className="text-slate-300">→</span>
            <span className={cn(booking.status === 'PAID' ? "text-emerald-500 font-bold" : "text-slate-400")}>3. Đã xuất vé</span>
          </div>
        </div>
      </div>

      {/* Action buttons (only show if PENDING_PAYMENT) */}
      {booking.status === 'PENDING_PAYMENT' && (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirmPayment}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-orange-500/10 transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm uppercase tracking-wider"
          >
            <CreditCard className="w-4.5 h-4.5" />
            <span>Thanh toán thành công (Simulate)</span>
          </button>
        </div>
      )}

      {/* Final note or Back button */}
      <div className="text-center">
        <Link href={`/booking/${booking.tripId}`} className="text-slate-400 hover:text-slate-600 text-xs font-bold hover:underline transition-all">
          Quay lại sơ đồ xe khách
        </Link>
      </div>
    </div>
  );
}
