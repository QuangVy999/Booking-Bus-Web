import { getCurrentStudent } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tổng quan</h1>
        <p className="mt-2 text-gray-500">
          Xin chào <span className="font-semibold text-orange-600">{student.name}</span>, chào mừng trở lại trang quản trị hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-100">
          <h2 className="text-lg font-semibold text-orange-800 mb-2">Vai trò hiện tại</h2>
          <div className="inline-flex px-3 py-1 bg-orange-500 text-white font-medium rounded-full text-sm">
            {student.role}
          </div>
          <p className="mt-3 text-sm text-orange-600/80">Bạn có toàn quyền truy cập các tính năng quản lý của hệ thống.</p>
        </div>
      </div>
    </div>
  );
}
