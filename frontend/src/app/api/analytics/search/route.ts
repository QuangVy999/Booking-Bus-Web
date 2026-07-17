export async function POST(request: Request) {
  const body = await request.json();
  const baseUrl = process.env.ANALYTICS_SERVICE_URL || "http://127.0.0.1:4010";
  const response = await fetch(`${baseUrl}/events/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
