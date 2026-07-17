import React from "react";
import { graphqlRequest } from "@/lib/graphql/client";
import { SEARCH_TRIPS_QUERY } from "@/lib/graphql/documents";
import SearchForm from "@/components/search/SearchForm";
import TripSearchResults from "@/components/search/TripSearchResults";
import { Compass, Shield, Award, HeartHandshake } from "lucide-react";

import { Metadata } from "next";

interface SearchParams {
  origin?: string;
  destination?: string;
  date?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { origin, destination, date } = await searchParams;
  if (origin && destination && date) {
    const formattedDate = new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    return {
      title: `Vé xe ${origin} đi ${destination} ngày ${formattedDate} | VÉ XE RẺ`,
      description: `Đặt vé xe khách ${origin} đi ${destination} khởi hành ngày ${formattedDate} giá rẻ nhất, uy tín chất lượng cao.`,
    };
  }
  return {
    title: "Đặt Vé Xe Khách Nhanh Chóng & An Toàn | VÉ XE RẺ",
    description: "Hệ thống đặt vé xe khách liên tỉnh chất lượng cao, sơ đồ chỗ ngồi thời gian thực tích hợp trợ lý AI.",
  };
}

const POPULAR_ROUTES = [
  {
    origin: "TP.HCM",
    destination: "Đà Lạt",
    distance: "310km",
    price: "250.000đ",
    duration: "6 giờ",
    image: "🏔️"
  },
  {
    origin: "TP.HCM",
    destination: "Nha Trang",
    distance: "430km",
    price: "280.000đ",
    duration: "8 giờ",
    image: "🏖️"
  },
  {
    origin: "TP.HCM",
    destination: "Cần Thơ",
    distance: "170km",
    price: "180.000đ",
    duration: "3.5 giờ",
    image: "🚣"
  },
  {
    origin: "Hà Nội",
    destination: "Hải Phòng",
    distance: "120km",
    price: "150.000đ",
    duration: "2 giờ",
    image: "⚓"
  }
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { origin, destination, date } = await searchParams;
  const isSearching = origin && destination && date;

  let trips = [];
  let errorMsg = "";

  if (isSearching) {
    // Log search event to Analytics Service (Kafka) in background
    fetch(`${process.env.ANALYTICS_SERVICE_URL || "http://localhost:4010"}/events/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, date })
    }).catch(() => {});

    try {
      const data = await graphqlRequest<{ searchTrips: any[] }, any>({
        query: SEARCH_TRIPS_QUERY,
        variables: {
          origin: origin as string,
          destination: destination as string,
          date: date as string,
        },
      });
      trips = data.searchTrips;
    } catch (err: any) {
      console.error("Failed to query trips:", err);
      errorMsg = "Có lỗi xảy ra khi kết nối tới hệ thống Gateway.";
    }
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Area */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 text-white rounded-3xl p-8 md:p-12 shadow-lg">
        {/* Abstract shapes */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute left-1/3 bottom-0 -mb-8 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>

        <div className="relative max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm">
            🚍 VÉ XE RẺ
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Đặt vé xe khách nhanh chóng & an toàn cùng AI
          </h1>
          <p className="text-sm md:text-base text-orange-50/90 leading-relaxed font-semibold">
            Tìm kiếm chuyến xe tốt nhất, sơ đồ giữ chỗ 5 phút, trợ lý AI tư vấn mọi tuyến đi và chính sách bến xe 24/7.
          </p>
        </div>
      </section>

      {/* Search Widget Container */}
      <section className="-mt-20 relative z-10 px-0 md:px-6 max-w-5xl mx-auto">
        <SearchForm />
      </section>

      {/* Conditional: Search Results or Default Landing Page */}
      {isSearching ? (
        <section className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold ml-2">
            <a href="/" className="hover:text-orange-500 transition-colors">Trang chủ</a>
            <span>/</span>
            <span className="text-slate-600 font-bold">Kết quả tìm kiếm</span>
          </div>

          {errorMsg ? (
            <div className="mt-6 p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-center font-semibold">
              {errorMsg}
            </div>
          ) : (
            <TripSearchResults
              trips={trips}
              origin={origin as string}
              destination={destination as string}
              date={date as string}
            />
          )}
        </section>
      ) : (
        /* Default Landing Sections (Popular Routes & Core Features) */
        <div className="space-y-12 max-w-6xl mx-auto">
          {/* Popular Routes */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tuyến xe khách phổ biến</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {POPULAR_ROUTES.map((route, i) => (
                <a
                  key={i}
                  href={`/?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}&date=2026-07-27`}
                  className="bg-white border border-slate-100 hover:border-orange-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="text-3xl">{route.image}</div>
                    <div className="font-extrabold text-slate-800 group-hover:text-orange-500 transition-colors">
                      {route.origin} &rarr; {route.destination}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold">
                      {route.distance} • {route.duration}
                    </div>
                    <div className="text-sm font-black text-orange-500 mt-1">
                      Từ {route.price}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Value Props / Features */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-100">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">Đặt chỗ an toàn</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cơ chế giữ ghế tạm thời trong 5 phút trên Redis đảm bảo không xảy ra đặt trùng chỗ giữa nhiều khách hàng.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">Hóa đơn điện tử PDF</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hệ thống tự động phát vé điện tử dạng PDF chuyên nghiệp gửi thẳng về địa chỉ email ngay sau khi thanh toán.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">Hỗ trợ AI 24/7</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Trợ lý AI Advisor tư vấn hành trình thông minh, kiểm tra thông tin vé, chính sách đổi trả vé chỉ qua chat tự nhiên.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
