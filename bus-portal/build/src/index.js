"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
// Khởi tạo MCP Server
const server = new index_js_1.Server({
    name: "bus-portal",
    version: "1.0.0",
}, {
    capabilities: { tools: {} },
});
// 1. Khai báo danh sách các Tools cho AI
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
// 2. Lắng nghe và xử lý khi AI gọi Tool
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    if (request.params.name === "search_trips") {
        const query = request.params.arguments?.query;
        // Tạm thời trả về dữ liệu Mock. Sau này sẽ gọi qua GraphQL Gateway của Phần 1
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
// 3. Khởi động Server qua giao thức Stdio (Giao tiếp tiêu chuẩn của MCP)
async function run() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 MCP Server 'bus-portal' đã khởi động và sẵn sàng nhận lệnh từ AI...");
}
run().catch(console.error);
//# sourceMappingURL=index.js.map