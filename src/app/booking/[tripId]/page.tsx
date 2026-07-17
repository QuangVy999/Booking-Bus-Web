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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6 text-center max-w-md w-full shadow-2xl">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-sm text-slate-400 mb-6">{res.error || 'Không thể kết nối gRPC tới Seat Inventory Service.'}</p>
          <a href="/" className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-205 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      <BookingPageClient initialSeats={res.seats} tripId={tripId} />
    </div>
  );
}
