"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/app/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.message ? (
        <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="student@example.com"
          autoComplete="email"
          required
          className="w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">Mật khẩu</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          className="w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white p-2 rounded transition-colors font-medium" disabled={isPending}>
        {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium underline text-orange-500 hover:text-orange-600">
          Đăng ký tại đây
        </Link>
      </p>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Hoặc</span>
        </div>
      </div>

      <Link href="/" className="flex w-full justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded transition-colors font-medium border border-gray-300">
        Tiếp tục với tư cách khách
      </Link>
    </form>
  );
}
