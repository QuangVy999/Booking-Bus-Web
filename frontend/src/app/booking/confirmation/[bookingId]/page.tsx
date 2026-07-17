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
      <div className="w-full flex items-center justify-center py-12">
        <div className="bg-rose-50 border border-rose-250 rounded-2xl p-6 text-center max-w-md w-full shadow-sm">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Không tìm thấy vé</h2>
          <p className="text-sm text-rose-700/80 mb-6">{res.error || 'Vui lòng kiểm tra lại mã vé hoặc đường dẫn.'}</p>
          <a href="/" className="inline-block bg-slate-800 hover:bg-slate-750 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
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
    <div className="w-full flex items-center justify-center py-6">
      <ConfirmationPageClient booking={bookingData} />
    </div>
  );
}
