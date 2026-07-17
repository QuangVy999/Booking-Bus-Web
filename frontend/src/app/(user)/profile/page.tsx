import { getCurrentStudent } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default async function ProfilePage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-orange-600">Thông tin cá nhân</h1>
      
      <div className="p-6 bg-white shadow rounded-lg border space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Họ tên</h3>
          <p className="text-lg">{student.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="text-lg">{student.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Vai trò</h3>
          <p className="text-lg">{student.role}</p>
        </div>
      </div>
    </div>
  );
}
