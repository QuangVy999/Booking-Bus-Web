import { getCurrentStudent } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function StaffPage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4 py-12">
      <h1 className="text-3xl font-bold text-orange-600">Trang Nhân Viên (Check-in Staff)</h1>
      <p className="mt-2 text-gray-600">
        Xin chào <span className="font-medium text-orange-600">{student.name}</span>. Bạn có thể tra cứu vé và check-in hành khách tại đây.
      </p>

      <div className="mt-8 p-6 bg-white shadow rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Quản lý Check-in</h2>
        <p>Tính năng đang được phát triển...</p>
      </div>
    </div>
  );
}
