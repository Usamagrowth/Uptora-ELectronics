import { NextResponse } from "next/server";
import { ensureDbIndexes } from "../../../../lib/db/init";
import { fulfillPaystackPayment } from "../../../../lib/orders/fulfillPayment";
import { verifyPaystackSignature } from "../../../../lib/paystack-server";

export const runtime = "nodejs";

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true, skipped: event.event });
  }

  try {
    await ensureDbIndexes();
    const result = await fulfillPaystackPayment({ data: event.data });
    return NextResponse.json({
      received: true,
      duplicate: result.duplicate,
      orderId: result.order.id,
    });
  } catch (error) {
    console.error("[webhook/paystack]", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed." },
      { status: 500 }
    );
  }
}
