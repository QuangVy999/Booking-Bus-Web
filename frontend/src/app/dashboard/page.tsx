import { getCurrentStudent } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4 py-12">
      <h1 className="text-3xl font-bold text-orange-600">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Xin chào <span className="font-medium text-orange-600">{student.name}</span>, bạn đang ở trang quản trị.
      </p>

      <div className="mt-8 p-6 bg-white shadow rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Thông tin hệ thống</h2>
        <p>Dashboard này được bảo vệ bởi middleware, chỉ dành cho Admin.</p>
        <p className="mt-2">Bạn có Role là: <strong>{student.role}</strong></p>
      </div>
    </div>
  );
}
