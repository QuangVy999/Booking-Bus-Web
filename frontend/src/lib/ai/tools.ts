import { tool } from "ai";
import { z } from "zod";

const graphqlUrl =
  process.env.BACKEND_GRAPHQL_URL || "http://127.0.0.1:4000/graphql";
async function graphQL(query: string, variables: Record<string, unknown>) {
  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (!response.ok || body.errors)
    throw new Error(
      body.errors?.[0]?.message || "Không thể kết nối dữ liệu đặt vé",
    );
  return body.data;
}

export const busTools = {
  searchTrips: tool({
    description:
      "Tìm chuyến xe từ dữ liệu nội bộ. Dùng khi người dùng nêu điểm đi và điểm đến.",
    inputSchema: z.object({
      origin: z.string().describe("Điểm đi"),
      destination: z.string().describe("Điểm đến"),
      date: z.string().optional().describe("Ngày đi YYYY-MM-DD"),
    }),
    execute: async ({ origin, destination, date }) => {
      fetch(
        `${process.env.ANALYTICS_SERVICE_URL || "http://127.0.0.1:4010"}/events/search`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ origin, destination, date }),
        },
      ).catch(() => undefined);
      const data = await graphQL(
        "query($origin:String!,$destination:String!,$date:String){searchTrips(origin:$origin,destination:$destination,date:$date){id route { origin destination } departureTime price availableSeats}}",
        { origin, destination, date },
      );
      return {
        ok: true,
        source: "Dữ liệu chuyến xe nội bộ",
        trips: data.searchTrips,
      };
    },
  }),
  getBookingStatus: tool({
    description:
      "Tra cứu trạng thái booking. Chỉ gọi khi người dùng cung cấp cả mã booking và email đặt vé.",
    inputSchema: z.object({
      bookingCode: z.string(),
      email: z.string().email(),
    }),
    execute: async ({ bookingCode, email }) => {
      const data = await graphQL(
        "query($bookingCode:String!,$email:String!){bookingStatus(bookingCode:$bookingCode,email:$email){bookingCode tripId status seatNumbers}}",
        { bookingCode, email },
      );
      return {
        ok: true,
        source: "Booking service (đã xác thực email)",
        booking: data.bookingStatus,
      };
    },
  }),
  getCancellationPolicy: tool({
    description: "Lấy chính sách hủy/đổi vé nội bộ.",
    inputSchema: z.object({}),
    execute: async () => ({
      source: "bus://policy/cancellation",
      policy: "Hủy trước 24 giờ: hoàn 100%. Hủy trước 12 giờ: hoàn 50%.",
    }),
  }),
};
