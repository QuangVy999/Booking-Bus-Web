import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const graphqlUrl = process.env.BACKEND_GRAPHQL_URL || 'http://localhost:4000/graphql';
const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4010';

async function graphQL(query: string, variables: Record<string, unknown>) {
  const response = await fetch(graphqlUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, variables }) });
  const body = await response.json();
  if (!response.ok || body.errors) throw new Error(body.errors?.[0]?.message || 'Backend is unavailable');
  return body.data;
}
async function analytics(path: string) {
  const response = await fetch(`${analyticsUrl}${path}`);
  if (!response.ok) throw new Error('Analytics service is unavailable');
  return response.json();
}
const text = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] });

const server = new Server({ name: 'bus-portal', version: '1.1.0' }, { capabilities: { tools: {}, resources: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [
  { name: 'search_trips', description: 'Tìm chuyến xe theo điểm đi, điểm đến và ngày.', inputSchema: { type: 'object', properties: { origin: { type: 'string' }, destination: { type: 'string' }, date: { type: 'string', description: 'YYYY-MM-DD' } }, required: ['origin', 'destination'] } },
  { name: 'get_trip_detail', description: 'Lấy chi tiết một chuyến xe.', inputSchema: { type: 'object', properties: { tripId: { type: 'string' } }, required: ['tripId'] } },
  { name: 'get_booking_status', description: 'Tra cứu trạng thái vé. Bắt buộc có mã booking và email đã dùng đặt vé.', inputSchema: { type: 'object', properties: { bookingCode: { type: 'string' }, email: { type: 'string' } }, required: ['bookingCode', 'email'] } },
  { name: 'get_revenue_summary', description: 'Lấy doanh thu tổng hợp cho admin.', inputSchema: { type: 'object', properties: { days: { type: 'number', minimum: 1, maximum: 365 } } } },
  { name: 'get_popular_routes', description: 'Lấy các tuyến được tìm kiếm nhiều.', inputSchema: { type: 'object', properties: {} } },
] }));

server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
  const args = params.arguments as Record<string, string | number> || {};
  if (params.name === 'search_trips') return text((await graphQL('query($origin:String!,$destination:String!,$date:String){searchTrips(origin:$origin,destination:$destination,date:$date){id route origin destination departureTime price availableSeats}}', args)).searchTrips);
  if (params.name === 'get_trip_detail') {
    return text((await graphQL('query($id:ID!){trip(id:$id){id route origin destination departureTime price availableSeats}}', { id: args.tripId })).trip || { error: 'Trip not found' });
  }
  if (params.name === 'get_booking_status') return text((await graphQL('query($bookingCode:String!,$email:String!){bookingStatus(bookingCode:$bookingCode,email:$email){bookingCode tripId status seatNumbers}}', args)).bookingStatus);
  if (params.name === 'get_revenue_summary') return text(await analytics(`/analytics/revenue?days=${args.days || 30}`));
  if (params.name === 'get_popular_routes') return text(await analytics('/analytics/popular-routes'));
  throw new Error('Unknown tool');
});

const resources: Record<string, string> = {
  'bus://policy/cancellation': 'Chính sách hủy vé: hủy trước 24 giờ được hoàn 100%; trước 12 giờ được hoàn 50%.',
  'bus://policy/checkin': 'Hướng dẫn check-in: có mặt trước giờ khởi hành 30 phút, xuất trình mã QR và giấy tờ tùy thân.',
  'bus://routes/popular': 'Danh sách này được cập nhật từ tool get_popular_routes.',
  'bus://system/health': 'Dịch vụ demo: GraphQL, booking service, analytics service và Kafka phải hoạt động để dữ liệu đầy đủ.',
};
server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: Object.entries(resources).map(([uri, value]) => ({ uri, name: uri, mimeType: 'text/plain', description: value })) }));
server.setRequestHandler(ReadResourceRequestSchema, async ({ params }) => {
  const value = resources[params.uri];
  if (!value) throw new Error('Resource not found');
  return { contents: [{ uri: params.uri, mimeType: 'text/plain', text: value }] };
});

await server.connect(new StdioServerTransport());
console.error('bus-portal MCP server is ready');
