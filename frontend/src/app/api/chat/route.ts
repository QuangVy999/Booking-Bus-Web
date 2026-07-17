import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { busTicketingChatModel } from "@/lib/ai/github-models";
import { BUS_ADVISOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { createBusAdvisorTools } from "@/lib/ai/tools";

export async function POST(req: Request) {
  // 1. Lấy tin nhắn và ép kiểu theo chuẩn UIMessage của phiên bản này
  const { messages }: { messages: UIMessage[] } = await req.json();

  // 2. Gọi AI xử lý
  const result = streamText({
    model: busTicketingChatModel,
    system: BUS_ADVISOR_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages), // Chuyển đổi định dạng tin nhắn
    tools: createBusAdvisorTools(),
    stopWhen: stepCountIs(5), // Thay thế cho maxSteps
  });

  // 3. Khởi tạo Stream theo chuẩn của tài liệu hướng dẫn
  const stream = toUIMessageStream({
    stream: result.stream,
    onError(error) {
      console.error("[bus-advisor]", error);
      return "Đã có lỗi khi xử lý yêu cầu AI Bus Advisor.";
    },
  });

  // 4. Trả về Response
  return createUIMessageStreamResponse({
    stream,
  });
}
