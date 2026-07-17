import { BusAdvisorChat } from "@/components/ui/ai/bus-advisor-chat";

export const metadata = {
  title: "AI Bus Advisor",
};

export default function AiAdvisorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trợ lý AI Đặt Vé</h1>
        <p className="text-muted-foreground mt-2">
          Hỗ trợ tìm kiếm chuyến xe, tra cứu thông tin đặt chỗ và giải đáp chính
          sách bằng ngôn ngữ tự nhiên.
        </p>
      </div>

      {/* Gọi Component Chatbot ra hiển thị */}
      <BusAdvisorChat />
    </div>
  );
}
