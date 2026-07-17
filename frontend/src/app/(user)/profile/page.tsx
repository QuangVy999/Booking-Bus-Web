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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hồ sơ người dùng</h1>
        <form action={logoutAction}>
          <button type="submit" className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200">
            Đăng xuất
          </button>
        </form>
      </div>
      
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
