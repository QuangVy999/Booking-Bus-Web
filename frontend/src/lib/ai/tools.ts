import { tool } from "ai";
import { z } from "zod";

export const busTools = {
  searchTrips: tool({
    description:
      "Tìm kiếm các chuyến xe đang mở bán. Dùng khi khách hàng có nhu cầu tìm chuyến đi.",
    inputSchema: z.object({
      origin: z.string().optional().describe("Điểm khởi hành"),
      destination: z.string().optional().describe("Điểm đến"),
    }),
    execute: async ({ origin, destination }) => {
      // Giả lập gọi API như trong GraphQL Client
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        ok: true,
        trips: [
          {
            id: "TRIP-001",
            route: `${origin || "Sài Gòn"} - ${destination || "Đà Lạt"}`,
            status: "OPEN",
            departureTime: new Date(Date.now() + 86400000).toISOString(),
            price: 250000,
            busCompany: "Phương Trang",
            totalSeats: 40,
            bookedSeats: 15,
          },
        ],
        message: "Đã tìm thấy chuyến xe",
      };
    },
  }),
};
