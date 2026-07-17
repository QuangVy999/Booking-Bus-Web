import { getCurrentStudent } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getBookingsByEmailAction } from "@/app/actions/booking";
import Link from "next/link";
import { Ticket, Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

export default async function ProfilePage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/login");
  }

  const res = await getBookingsByEmailAction(student.email);
  const bookings = res.success ? res.bookings : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col px-4 py-12 gap-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-slate-500 mt-2 font-medium">Quản lý thông tin và lịch sử đặt vé của bạn.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {/* Profile Info */}
        <div className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow rounded-3xl border border-slate-100 space-y-5 h-fit">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-xl font-black uppercase">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{student.name}</h3>
              <p className="text-sm text-slate-400 font-semibold">{student.role}</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email liên hệ</h4>
            <p className="text-slate-700 font-medium mt-1">{student.email}</p>
          </div>
        </div>

        {/* Booking History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-500" />
              Lịch sử đặt vé
            </h2>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center text-slate-500">
              <Ticket className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="font-medium">Bạn chưa có chuyến đi nào.</p>
              <Link href="/" className="inline-block mt-4 text-orange-600 font-bold hover:underline">
                Đặt vé ngay &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div key={booking.bookingId} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:border-orange-200 transition-colors flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-orange-50 text-orange-600 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {booking.bookingCode}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        booking.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                        booking.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {booking.status === 'PAID' ? 'ĐÃ THANH TOÁN' : booking.status === 'CANCELLED' ? 'ĐÃ HỦY' : booking.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Chuyến {booking.tripId}</span>
                      <span className="flex items-center gap-1.5"><Ticket className="w-4 h-4 text-slate-400" /> {booking.seatNumbers.length} vé ({booking.seatNumbers.join(", ")})</span>
                    </div>
                  </div>

                  <Link href={`/booking/confirmation/${booking.bookingId}`} className="text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
                    Xem chi tiết <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
