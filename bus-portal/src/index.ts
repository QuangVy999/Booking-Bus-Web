import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Khởi tạo MCP Server
const server = new Server(
  {
    name: "bus-portal",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_trips",
        description: "Tìm kiếm các chuyến xe đang mở bán",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Từ khóa điểm đi/đến" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_booking_status",
        description: "Tra cứu trạng thái của một mã vé",
        inputSchema: {
          type: "object",
          properties: {
            bookingId: { type: "string" },
          },
          required: ["bookingId"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "search_trips") {
    const query = request.params.arguments?.query;
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            message: `Đã tìm kiếm chuyến xe với từ khóa: ${query}`,
            status: "success",
          }),
        },
      ],
    };
  }

  if (request.params.name === "get_booking_status") {
    const bookingId = request.params.arguments?.bookingId;
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            bookingId,
            status: "PAID",
            message: "Vé đã được thanh toán",
          }),
        },
      ],
    };
  }

  throw new Error("Tool không tồn tại trên hệ thống");
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "bus://policy",
        name: "Chính sách nhà xe",
        mimeType: "text/plain",
        description: "Các quy định về hủy vé, hoàn tiền và hành lý",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "bus://policy") {
    return {
      contents: [
        {
          uri: "bus://policy",
          mimeType: "text/plain",
          text: "CHÍNH SÁCH NHÀ XE:\n1. Hủy vé trước 24h: Hoàn 100% tiền.\n2. Hủy vé trước 12h: Hoàn 50% tiền.\n3. Hành lý mang theo không vượt quá 20kg.\n4. Hành khách phải có mặt trước 30 phút để check-in.",
        },
      ],
    };
  }
  throw new Error("Resource không tồn tại trên hệ thống");
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    "🚀 MCP Server 'bus-portal' đã khởi động và sẵn sàng nhận lệnh từ AI...",
  );
}

run().catch(console.error);
