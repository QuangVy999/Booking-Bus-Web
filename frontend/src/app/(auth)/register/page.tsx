import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản",
  description: "Tạo tài khoản mới",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-3xl font-bold">Đăng ký tài khoản</h1>
      <p className="mt-2 text-gray-500">Tạo tài khoản để sử dụng hệ thống.</p>

      <RegisterForm />
    </div>
  );
}
