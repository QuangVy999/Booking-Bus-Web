import React from 'react';
import { getSeatInventoryAction } from '@/app/actions/booking';
import { getSavedPassengersAction } from '@/app/actions/user';
import { getCurrentStudent } from '@/lib/auth/session';
import BookingPageClient from './BookingPageClient';
import { graphqlRequest } from '@/lib/graphql/client';
import { GET_TRIP_DETAIL_QUERY } from '@/lib/graphql/documents';

interface PageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { tripId } = await params;

  const student = await getCurrentStudent();

  // Fetch seat inventory and trip details in parallel
  const [res, tripData, savedPassengersRes] = await Promise.all([
    getSeatInventoryAction(tripId),
    graphqlRequest<{ tripDetail: any }, any>({
      query: GET_TRIP_DETAIL_QUERY,
      variables: { id: tripId },
    }).catch((err) => {
      console.error("Failed to query trip detail for checkout page:", err);
      return null;
    }),
    student ? getSavedPassengersAction().catch(() => ({ success: false, passengers: [] })) : Promise.resolve({ success: false, passengers: [] })
  ]);

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

  const trip = tripData?.tripDetail || null;
  const savedPassengers = savedPassengersRes.success ? savedPassengersRes.passengers : [];

  return (
    <div className="w-full py-6">
      <BookingPageClient initialSeats={res.seats} tripId={tripId} trip={trip} savedPassengers={savedPassengers} isLoggedIn={!!student} />
    </div>
  );
}
