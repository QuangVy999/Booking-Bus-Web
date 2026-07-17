import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getCurrentStudent } from "@/lib/auth/session";
import { logoutAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Booking Bus Web",
  description: "Ứng dụng đặt vé xe",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentStudent();

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <header className="bg-orange-500 text-white py-4 px-6 shadow-md flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-bold text-xl tracking-tight">VÉ XE RẺ</span>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm">{user.name}</span>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="text-sm opacity-80 hover:opacity-100 transition">
                  Đăng xuất
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-sm font-medium">
              <a href="/login" className="hover:underline">Đăng nhập</a>
              <a href="/register" className="bg-white text-orange-600 px-3 py-1.5 rounded hover:bg-orange-50 transition">Đăng ký</a>
            </div>
          )}
        </header>
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
