import Link from "next/link";
import { Bus, MapPin, Route as RouteIcon, Map, LayoutDashboard } from "lucide-react";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  let isAdmin = false;

  if (token) {
    try {
      const payload: any = jwtDecode(token);
      if (payload.role === "Admin") {
        isAdmin = true;
      }
    } catch (e) {}
  }

  if (!isAdmin) {
    return (
      <main className="w-full min-w-0 bg-slate-50 min-h-screen p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6 md:p-8 min-h-[500px]">
          {children}
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full relative min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Sidebar as a floating rounded card */}
      <aside className="w-full md:w-72 shrink-0">
        <div className="bg-white rounded-3xl shadow-lg border border-orange-100/50 overflow-hidden sticky top-8">
          <div className="p-6 relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400">
            {/* Abstract shapes inside sidebar header */}
            <div className="absolute right-0 top-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
            <div className="absolute left-0 bottom-0 -mb-4 -ml-4 w-24 h-24 rounded-full bg-white/20 blur-lg"></div>
            <h2 className="relative text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7" />
              Admin Portal
            </h2>
          </div>
          
          <nav className="p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm transition-all duration-300 font-bold group">
              <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
              <span>Tổng quan</span>
            </Link>
            <Link href="/dashboard/stops" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm transition-all duration-300 font-bold group">
              <MapPin className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
              <span>Điểm Dừng</span>
            </Link>
            <Link href="/dashboard/routes" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm transition-all duration-300 font-bold group">
              <RouteIcon className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
              <span>Tuyến Xe</span>
            </Link>
            <Link href="/dashboard/vehicles" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm transition-all duration-300 font-bold group">
              <Bus className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
              <span>Xe Khách</span>
            </Link>
            <Link href="/dashboard/trips" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm transition-all duration-300 font-bold group">
              <Map className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
              <span>Chuyến Xe</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0">
        <div className="bg-white rounded-3xl shadow-lg border border-orange-100/50 p-6 md:p-10 min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
