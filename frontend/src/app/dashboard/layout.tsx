import Link from "next/link";
import { Bus, MapPin, Route as RouteIcon, Map, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b flex items-center justify-center">
          <h2 className="text-xl font-bold text-orange-600 tracking-tight">Admin Dashboard</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard/stops" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Quản lý Điểm Dừng</span>
          </Link>
          <Link href="/dashboard/routes" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <RouteIcon className="w-5 h-5" />
            <span className="font-medium">Quản lý Tuyến Xe</span>
          </Link>
          <Link href="/dashboard/vehicles" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <Bus className="w-5 h-5" />
            <span className="font-medium">Quản lý Xe</span>
          </Link>
          <Link href="/dashboard/trips" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <Map className="w-5 h-5" />
            <span className="font-medium">Quản lý Chuyến Xe</span>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Trở về trang chủ</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
