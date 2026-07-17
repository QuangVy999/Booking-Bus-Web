'use client';

import React, { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import SeatMap from '@/components/booking/SeatMap';
import CheckoutForm from '@/components/booking/CheckoutForm';
import { createBookingAction } from '@/app/actions/booking';
import { toast, Toaster } from 'sonner';
import { Bus, User, Mail, Phone, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Seat {
  seatNumber: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  bookingId?: string;
}

interface BookingPageClientProps {
  initialSeats: Seat[];
  tripId: string;
  trip?: any;
}

const initialState = {
  success: false,
  message: '',
  bookingId: '',
  bookingCode: '',
  status: '',
  expiryTimestamp: 0
};

export default function BookingPageClient({ initialSeats, tripId, trip }: BookingPageClientProps) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // useActionState for form handling
  const [state, formAction, isPending] = useActionState<any, FormData>(
    async (prevState: any, formData: FormData) => {
      setErrorMsg('');

      if (selectedSeats.length === 0) {
        setErrorMsg('Vui lòng chọn ít nhất 1 ghế.');
        toast.error('Vui lòng chọn ít nhất 1 ghế.');
        return { success: false, message: 'Vui lòng chọn ít nhất 1 ghế.' };
      }

      try {
        const res = await createBookingAction(prevState, formData);
        if (res.success) {
          toast.success('Khóa ghế thành công! Đang chuyển đến trang thanh toán...');
          setTimeout(() => {
            router.push(`/booking/confirmation/${res.bookingId}`);
          }, 1500);
          return res;
        } else {
          setErrorMsg(res.message || 'Thao tác giữ chỗ thất bại.');
          toast.error(res.message || 'Giữ chỗ thất bại.');
          return res;
        }
      } catch (err: any) {
        const msg = err.message || 'Lỗi hệ thống gRPC.';
        setErrorMsg(msg);
        toast.error(msg);
        return { success: false, message: msg };
      }
    },
    initialState
  );

  const handleToggleSeat = (seatNumber: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      }
      return [...prev, seatNumber];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Toaster position="top-right" richColors />

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Navigation & Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
            <span>&larr; Quay lại trang chủ</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
            {trip ? `Chuyến xe ${trip.route.origin} → ${trip.route.destination}` : `Chuyến xe ${tripId}`}
          </h1>
        </div>
        <form action={formAction} className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-start">
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="seatNumbers" value={selectedSeats.join(',')} />

          {/* Left Column (Seat Map + Form + Terms) */}
          <div className="space-y-6">
            {/* Seat Map Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-black uppercase text-slate-700 border-b border-slate-100 pb-2">Chọn ghế</h2>
              <SeatMap
                seats={initialSeats}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
              />
            </div>

            {/* Passenger Info & Terms Container */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <h2 className="text-sm font-black uppercase text-slate-700 border-b border-slate-100 pb-2">Thông tin khách hàng</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Input Fields */}
                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500" htmlFor="passengerName">Họ và tên *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="passengerName"
                        name="passengerName"
                        type="text"
                        required
                        placeholder="Trần Lê Gia Huy"
                        disabled={isPending}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-700 font-bold outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500" htmlFor="passengerPhone">Số điện thoại *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="passengerPhone"
                        name="passengerPhone"
                        type="tel"
                        required
                        placeholder="0944707759"
                        disabled={isPending}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-700 font-bold outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-555" htmlFor="passengerEmail">Email *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="passengerEmail"
                        name="passengerEmail"
                        type="email"
                        required
                        placeholder="tranlegiahuy@gmail.com"
                        disabled={isPending}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-700 font-bold outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Terms & Notes */}
                <div className="space-y-4 text-[11px] text-slate-550 leading-relaxed border-l border-slate-100 pl-0 md:pl-6">
                  <h4 className="font-bold text-orange-600 uppercase tracking-wider">Điều khoản & Lưu ý</h4>
                  <p className="font-semibold text-orange-500">Hệ thống đặt vé xe thử nghiệm phục vụ cho mục đích học tập và báo cáo đồ án môn học.</p>
                  <p>(*) Mọi thông tin thanh toán, vé xe và giao dịch trên trang này đều là **mô phỏng** và không có giá trị giao dịch thực tế.</p>
                  <p>(*) Ghế bạn chọn sẽ được khóa giữ chỗ tạm thời trong vòng **5 phút** trên Redis. Sau thời gian này ghế sẽ tự động giải phóng.</p>
                  <p>(*) Sau khi hoàn tất đặt vé và thanh toán mô phỏng thành công, thông tin vé điện tử sẽ được gửi về địa chỉ Email đăng ký.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Trip Summary + Price + Action) */}
          <div className="sticky top-6">
            <CheckoutForm
              tripId={tripId}
              selectedSeats={selectedSeats}
              isPending={isPending}
              errorMessage={errorMsg}
              trip={trip}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
