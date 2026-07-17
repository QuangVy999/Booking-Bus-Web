import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản",
  description: "Tạo tài khoản mới",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 mt-10 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-orange-600">Đăng ký tài khoản</h1>
        <p className="mt-2 text-gray-500">Tạo tài khoản để sử dụng hệ thống</p>
      </div>

      <RegisterForm />
    </div>
  );
}
