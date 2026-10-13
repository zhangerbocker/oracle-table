// Vercel serverless function: POST /api/prophecy
import { handleProphecy } from "../lib/prophecy.js";

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { status, body } = await handleProphecy(await request.text(), ip);
  return Response.json(body, { status });
}
