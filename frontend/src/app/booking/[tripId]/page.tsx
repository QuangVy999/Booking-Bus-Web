import React from 'react';
import { getSeatInventoryAction } from '@/app/actions/booking';
import BookingPageClient from './BookingPageClient';

interface PageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { tripId } = await params;

  // Fetch initial seat inventory on server side
  const res = await getSeatInventoryAction(tripId);

  if (!res.success) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="bg-rose-50 border border-rose-250 rounded-2xl p-6 text-center max-w-md w-full shadow-sm">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-sm text-rose-700/80 mb-6">{res.error || 'Không thể kết nối gRPC tới Seat Inventory Service.'}</p>
          <a href="/" className="inline-block bg-slate-800 hover:bg-slate-750 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <BookingPageClient initialSeats={res.seats} tripId={tripId} />
    </div>
  );
}
