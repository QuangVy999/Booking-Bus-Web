"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai"; // Import Transport mới từ sdk
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, CircleDollarSign, Users, Bus } from "lucide-react";
import { Trip } from "@/lib/ai/types";

// Sử dụng kiểu any cho message hoặc ép sang cấu trúc đối tượng cụ thể phù hợp với UI JSON
function renderMessagePart(
  message: {
    content: string;
    parts?: Array<{
      type: string;
      text?: string;
      toolName?: string;
      result?: unknown;
    }>;
  },
  index: number,
) {
  if (!message.parts) {
    return (
      <span key={index} className="whitespace-pre-wrap">
        {message.content}
      </span>
    );
  }

  return (
    <div key={index} className="w-full space-y-1">
      {/* 2. Sửa tiếp 'part: any' thành cấu trúc object cụ thể */}
      {message.parts.map(
        (
          part: {
            type: string;
            text?: string;
            toolName?: string;
            result?: unknown;
          },
          pIdx: number,
        ) => {
          if (part.type === "text") {
            return (
              <span key={pIdx} className="whitespace-pre-wrap">
                {part.text}
              </span>
            );
          }

          if (part.type === "tool-result") {
            if (part.toolName === "searchTrips") {
              // 🛡️ LỚP BẢO VỆ 1: Nếu result chưa tải xong, hiển thị trạng thái chờ
              if (!part.result) {
                return (
                  <div
                    key={pIdx}
                    className="my-2 text-xs text-muted-foreground animate-pulse"
                  >
                    Đang xử lý kết quả tìm kiếm...
                  </div>
                );
              }

              // 🛡️ LỚP BẢO VỆ 2: Ép kiểu an toàn
              const result = part.result as {
                ok: boolean;
                trips?: Trip[];
                message?: string;
              };

              // Kiểm tra an toàn trước khi render
              if (
                !result.ok ||
                !Array.isArray(result.trips) ||
                result.trips.length === 0
              ) {
                return (
                  <div
                    key={pIdx}
                    className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md my-2 border border-amber-200"
                  >
                    ⚠️ Không tìm thấy chuyến xe nào phù hợp hoặc hệ thống đang
                    bận.
                  </div>
                );
              }

              return (
                <div
                  key={pIdx}
                  className="my-3 space-y-2 w-full text-foreground"
                >
                  <div className="text-xs font-semibold text-primary mb-1">
                    Kết quả tìm kiếm:
                  </div>
                  {result.trips.map((trip: Trip) => (
                    <div
                      key={trip.id}
                      className="p-3 bg-background rounded-lg border shadow-sm space-y-2"
                    >
                      <div className="flex justify-between items-start border-b pb-1.5">
                        <span className="font-bold text-sm flex items-center gap-1">
                          <Bus className="h-4 w-4 text-primary" /> {trip.route}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            trip.status === "OPEN"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {trip.status === "OPEN" ? "Còn vé" : "Hết vé"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(trip.departureTime).toLocaleDateString(
                            "vi-VN",
                          )}{" "}
                          -{" "}
                          {new Date(trip.departureTime).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                        <div className="flex items-center gap-1 justify-end font-semibold text-destructive">
                          <CircleDollarSign className="h-3.5 w-3.5 text-amber-500" />
                          {trip.price.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <Users className="h-3.5 w-3.5" />
                          Nhà xe:{" "}
                          <span className="font-medium text-foreground">
                            {trip.busCompany}
                          </span>
                          <span className="ml-auto text-[11px]">
                            Trống: {trip.totalSeats - trip.bookedSeats}/
                            {trip.totalSeats} ghế
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
          }
          return null;
        },
      )}
    </div>
  );
}

export function BusAdvisorChat() {
  // Bản SDK mới yêu cầu tự quản lý state input ở môi trường Client
  const [input, setInput] = useState("");

  // Cấu hình useChat sử dụng transport mới
  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <Card className="shadow-md max-w-2xl mx-auto">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-xl text-primary">AI Tư Vấn Đặt Vé</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="min-h-96 max-h-128 overflow-y-auto space-y-3 rounded-lg border bg-muted/10 p-4 flex flex-col">
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center mt-10 mx-auto">
              Xin chào! Mình là trợ lý ảo. Hãy thử hỏi: <br />
              <span className="italic font-medium text-primary">
                &quot;Tìm cho tôi xe đi Đà Lạt còn vé&quot;
              </span>
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground shadow-sm"
                  : "mr-auto max-w-[85%] w-full rounded-lg bg-muted px-4 py-2 text-sm text-foreground shadow-sm"
              }
            >
              <div className="mb-1 text-xs opacity-70 font-semibold">
                {message.role === "user" ? "Bạn" : "AI Advisor"}
              </div>
              <div>{renderMessagePart(message, 0)}</div>
            </div>
          ))}

          {isBusy ? (
            <div className="text-xs text-muted-foreground animate-pulse mt-1">
              AI đang gõ...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
              Lỗi kết nối. Vui lòng thử lại.
            </div>
          ) : null}
        </div>

        {/* Khung form submit mới gọi qua hành động sendMessage của SDK */}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const value = input.trim();
            if (!value) return;
            sendMessage({ text: value });
            setInput("");
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bạn muốn đi đâu?..."
            disabled={isBusy}
            className="flex-1"
          />
          {isBusy ? (
            <Button type="button" variant="destructive" onClick={() => stop()}>
              Dừng
            </Button>
          ) : (
            <Button type="submit">Gửi</Button>
          )}
          {error ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => regenerate()}
            >
              Thử lại
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
