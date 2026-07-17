import Link from "next/link";
import { Bus, MapPin, Route as RouteIcon, Map, LogOut, LayoutDashboard } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full relative">
      {/* Sidebar as a floating rounded card */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-400">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6" />
              Admin
            </h2>
          </div>
          
          <nav className="p-3 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-medium">
              <LayoutDashboard className="w-5 h-5" />
              <span>Tổng quan</span>
            </Link>
            <Link href="/dashboard/stops" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-medium">
              <MapPin className="w-5 h-5" />
              <span>Điểm Dừng</span>
            </Link>
            <Link href="/dashboard/routes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-medium">
              <RouteIcon className="w-5 h-5" />
              <span>Tuyến Xe</span>
            </Link>
            <Link href="/dashboard/vehicles" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-medium">
              <Bus className="w-5 h-5" />
              <span>Xe Khách</span>
            </Link>
            <Link href="/dashboard/trips" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-medium">
              <Map className="w-5 h-5" />
              <span>Chuyến Xe</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
