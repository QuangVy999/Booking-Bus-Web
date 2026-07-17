"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createStudent, loginStudent } from "@/lib/api/auth";
import { getReadableGraphQLError } from "@/lib/graphql/errors";

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "access_token";

export type AuthActionState = {
  message?: string;
};

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

const registerSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự."),
  email: z.string().email("Email không hợp lệ."),
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
    .regex(/[A-Z]/, "Ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Ít nhất 1 số")
    .regex(/[^A-Za-z0-9]/, "Ít nhất 1 ký tự đặc biệt"),
  role: z.string().optional(),
});

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Dữ liệu đăng nhập không hợp lệ.",
    };
  }

  let token: string;
  try {
    const authPayload = await loginStudent(parsed.data);
    token = authPayload.token;
  } catch (error) {
    return {
      message: getReadableGraphQLError(error),
    };
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/dashboard");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: formData.get("role") ? String(formData.get("role")) : undefined,
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Dữ liệu đăng ký không hợp lệ.",
    };
  }

  try {
    await createStudent(parsed.data);
  } catch (error) {
    return {
      message: getReadableGraphQLError(error),
    };
  }

  redirect("/login?registered=1");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect("/login");
}
