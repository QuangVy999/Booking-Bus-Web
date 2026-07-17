import { getCurrentStudent } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4010';
async function readAnalytics(path: string) {
  try { const response = await fetch(`${analyticsUrl}${path}`, { cache: 'no-store' }); return response.ok ? response.json() : null; } catch { return null; }
}
export default async function DashboardPage() {
  const student = await getCurrentStudent();
  if (!student) redirect('/login');
  if (student.role !== 'Admin') redirect('/');
  const [revenue, routes, popular, conversion] = await Promise.all([readAnalytics('/analytics/revenue?days=30'), readAnalytics('/analytics/bookings-by-route'), readAnalytics('/analytics/popular-routes'), readAnalytics('/analytics/conversion')]);
  const totalRevenue = revenue?.data?.reduce((sum: number, row: { revenue: string }) => sum + Number(row.revenue), 0) || 0;
  return <div className="mx-auto max-w-6xl px-4 py-12"><h1 className="text-3xl font-bold text-orange-600">Admin Analytics</h1><p className="mt-2 text-gray-600">Dữ liệu được tổng hợp từ Kafka bởi Analytics Consumer.</p>
    <div className="mt-8 grid gap-4 md:grid-cols-3"><Metric label="Doanh thu 30 ngày" value={`${totalRevenue.toLocaleString('vi-VN')} đ`} /><Metric label="Lượt tìm kiếm" value={String(conversion?.searches ?? 0)} /><Metric label="Tỷ lệ booking / tìm kiếm" value={`${((conversion?.conversionRate ?? 0) * 100).toFixed(1)}%`} /></div>
    <div className="mt-8 grid gap-6 md:grid-cols-2"><Panel title="Số vé theo tuyến" rows={routes?.data} valueKey="bookings" /><Panel title="Tuyến được tìm nhiều" rows={popular?.data} valueKey="searches" /></div>
  </div>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>; }
function Panel({ title, rows, valueKey }: { title: string; rows?: Array<Record<string, string | number>>; valueKey: string }) { return <section className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="font-semibold">{title}</h2>{rows?.length ? <ul className="mt-3 space-y-2">{rows.map((row, index) => <li key={`${row.route}-${index}`} className="flex justify-between border-b pb-2 text-sm"><span>{row.route}</span><strong>{row[valueKey]}</strong></li>)}</ul> : <p className="mt-3 text-sm text-gray-500">Chưa có dữ liệu event.</p>}</section>; }
