import { z } from "zod";
import { tool } from "ai";
import { Trip } from "./types";

const searchTripsSchema = z.object({
  query: z
    .string()
    .describe("Từ khóa tìm kiếm (VD: xe đi Đà Lạt, Sài Gòn Nha Trang)"),
  onlyOpen: z.boolean().optional().describe("Chỉ lấy các chuyến còn mở bán vé"),
});

export function createBusAdvisorTools() {
  return {
    searchTrips: tool({
      description:
        "Tìm kiếm chuyến xe khách dựa trên điểm đi, điểm đến hoặc ngày đi.",
      parameters: searchTripsSchema,
      // Bỏ phần khai báo kiểu trả về tường minh ": Promise<...>" để sửa triệt để lỗi Overload
      execute: async ({ query = "", onlyOpen }) => {
        try {
          console.log(`[Mock] AI đang tìm chuyến với từ khóa: ${query}`);

          const mockTrips: Trip[] = [
            {
              id: "TRIP-SG-DL-01",
              route: "Sài Gòn - Đà Lạt",
              departureTime: "2026-06-20T08:00:00",
              price: 250000,
              totalSeats: 34,
              bookedSeats: 12,
              status: "OPEN",
              busCompany: "Phương Trang Demo",
            },
            {
              id: "TRIP-SG-DL-02",
              route: "Sài Gòn - Đà Lạt",
              departureTime: "2026-06-20T22:00:00",
              price: 300000,
              totalSeats: 22,
              bookedSeats: 22,
              status: "CLOSED",
              busCompany: "Thành Bưởi Demo",
            },
          ];

          let filtered = mockTrips;

          // Chỉ lọc theo tuyến đường nếu AI thực sự truyền query vào
          if (query && query.trim() !== "") {
            filtered = filtered.filter((t) =>
              t.route
                .toLowerCase()
                .includes(query.toLowerCase().replace("xe đi ", "")),
            );
          }

          if (onlyOpen) {
            filtered = filtered.filter((t) => t.status === "OPEN");
          }

          return { ok: true, trips: filtered, message: "Thành công" };
        } catch (error) {
          console.error(error);
          return { ok: false, trips: [], message: "Lỗi khi tìm chuyến xe" };
        }
      },
    }),
  };
}
