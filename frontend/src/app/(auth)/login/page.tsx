import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào hệ thống",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const registered = searchParams.registered === "1";

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-3xl font-bold">Đăng nhập</h1>
      <p className="mt-2 text-gray-500">Sử dụng tài khoản của bạn để đăng nhập.</p>

      {registered && (
        <div className="mt-6 bg-green-100 text-green-800 p-3 rounded text-sm">
          Tạo tài khoản thành công. Vui lòng đăng nhập.
        </div>
      )}

      <LoginForm />
    </div>
  );
}
