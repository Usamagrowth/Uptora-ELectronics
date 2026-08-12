import { NextResponse } from "next/server";
import { getPaystackConfigStatus } from "../../../../lib/paystack-config";

export const runtime = "nodejs";

export async function GET() {
  const status = getPaystackConfigStatus();
  return NextResponse.json(status, { status: status.ready ? 200 : 503 });
}
