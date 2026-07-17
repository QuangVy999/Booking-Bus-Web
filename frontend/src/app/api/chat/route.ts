import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { busAdvisorChatModel } from "@/lib/ai/github-models";
import { busTools } from "@/lib/ai/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: busAdvisorChatModel,
      system:
        "Bạn là AI Bus Advisor cho cổng đặt vé xe. Luôn trả lời bằng tiếng Việt rõ ràng, thân thiện, ngắn gọn nhưng đủ ý. Chỉ tư vấn dựa trên dữ liệu học phần, tool result được cung cấp.",
      messages: await convertToModelMessages(messages),
      tools: busTools,
      // Áp dụng cơ chế dừng giống tài liệu hướng dẫn
      stopWhen: stepCountIs(5),
    });

    const stream = toUIMessageStream({
      stream: result.stream,
      onError(error) {
        console.error("[bus-advisor]", error);
        return "Đã có lỗi khi xử lý yêu cầu AI Bus Advisor.";
      },
    });

    return createUIMessageStreamResponse({
      stream,
    });
  } catch (error) {
    console.error("Lỗi API Chat:", error);
    return new Response("Lỗi hệ thống Chatbot", { status: 500 });
  }
}
