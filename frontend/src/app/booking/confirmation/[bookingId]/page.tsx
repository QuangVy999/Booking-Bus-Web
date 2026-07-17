import React from 'react';
import { getBookingAction } from '@/app/actions/booking';
import ConfirmationPageClient from './ConfirmationPageClient';

interface PageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { bookingId } = await params;

  // Fetch booking details on server side
  const res = await getBookingAction(bookingId);

  if (!res.success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6 text-center max-w-md w-full shadow-2xl">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Không tìm thấy vé</h2>
          <p className="text-sm text-slate-400 mb-6">{res.error || 'Vui lòng kiểm tra lại mã vé hoặc đường dẫn.'}</p>
          <a href="/" className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  const bookingData = {
    bookingId: res.bookingId,
    bookingCode: res.bookingCode,
    tripId: res.tripId,
    seatNumbers: res.seatNumbers,
    passengerName: res.passengerName,
    passengerEmail: res.passengerEmail,
    status: res.status
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 flex items-center justify-center p-4">
      <ConfirmationPageClient booking={bookingData} />
    </div>
  );
}
