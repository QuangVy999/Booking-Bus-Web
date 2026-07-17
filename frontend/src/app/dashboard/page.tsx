import { getCurrentStudent } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { TrendingUp, Search, Percent, MapPin, Ticket } from "lucide-react";

const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4010';

async function readAnalytics(path: string) {
  try {
    const response = await fetch(`${analyticsUrl}${path}`, { cache: 'no-store' });
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const student = await getCurrentStudent();

  if (!student) redirect('/login');
  if (student.role !== 'Admin') redirect('/');

  const [revenue, routes, popular, conversion] = await Promise.all([
    readAnalytics('/analytics/revenue?days=30'),
    readAnalytics('/analytics/bookings-by-route'),
    readAnalytics('/analytics/popular-routes'),
    readAnalytics('/analytics/conversion')
  ]);

  const totalRevenue = revenue?.data?.reduce((sum: number, row: { revenue: string }) => sum + Number(row.revenue), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thống kê Tổng quan</h1>
        <p className="mt-2 text-sm text-gray-500">
          Chào mừng <span className="font-semibold text-orange-600">{student.name}</span>. Dữ liệu báo cáo được cập nhật thời gian thực từ Kafka & Analytics Service.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/30 rounded-2xl border border-orange-100 relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-700/80 mb-2">Doanh thu 30 ngày</p>
              <h3 className="text-2xl font-black text-slate-800 font-mono">
                {totalRevenue.toLocaleString('vi-VN')} đ
              </h3>
            </div>
            <div className="p-3 bg-orange-500 rounded-xl text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-orange-600/80 font-medium">Doanh thu thực nhận từ thanh toán vé</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-2xl border border-blue-100 relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700/80 mb-2">Tổng lượt tìm kiếm</p>
              <h3 className="text-2xl font-black text-slate-800 font-mono">
                {conversion?.searches ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl text-white">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-blue-600/80 font-medium">Lượt khách tra cứu trên thanh công cụ</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-2xl border border-emerald-100 relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/80 mb-2">Tỷ lệ chuyển đổi</p>
              <h3 className="text-2xl font-black text-slate-800 font-mono">
                {((conversion?.conversionRate ?? 0) * 100).toFixed(1)}%
              </h3>
            </div>
            <div className="p-3 bg-emerald-500 rounded-xl text-white">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-600/80 font-medium">Tỷ lệ đặt giữ chỗ / Tìm kiếm chuyến xe</div>
        </div>
      </div>

      {/* Analytics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel 
          title="Doanh số đặt vé theo tuyến" 
          rows={routes?.data} 
          valueKey="bookings" 
          unit=" vé"
          icon={<Ticket className="w-4 h-4 text-orange-500" />}
        />
        <Panel 
          title="Tuyến được tìm kiếm nhiều nhất" 
          rows={popular?.data} 
          valueKey="searches" 
          unit=" lượt"
          icon={<MapPin className="w-4 h-4 text-blue-500" />}
        />
      </div>
    </div>
  );
}

interface PanelProps {
  title: string;
  rows?: Array<Record<string, string | number>>;
  valueKey: string;
  unit: string;
  icon: React.ReactNode;
}

function Panel({ title, rows, valueKey, unit, icon }: PanelProps) {
  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
        {icon}
        <span>{title}</span>
      </h2>
      {rows && rows.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <li key={`${row.route}-${index}`} className="flex justify-between items-center py-3 text-sm">
              <span className="font-semibold text-slate-650">{row.route}</span>
              <span className="font-mono font-bold text-slate-800">
                {row[valueKey]}{unit}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400 font-medium">
          Chưa nhận được dữ liệu sự kiện từ hệ thống.
        </div>
      )}
    </div>
  );
}
