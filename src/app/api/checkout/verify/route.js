import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-options";
import { ensureDbIndexes } from "../../../../lib/db/init";
import { fulfillPaystackPayment } from "../../../../lib/orders/fulfillPayment";
import { verifyPaystackTransaction } from "../../../../lib/paystack-server";

export const runtime = "nodejs";

/**
 * Fallback verification when the customer returns from Paystack
 * before the webhook fires. Idempotent — safe to call multiple times.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
    }

    if (reference.startsWith("UPTORA-DEMO-")) {
      return NextResponse.json({ error: "Demo payments cannot be verified." }, { status: 400 });
    }

    await ensureDbIndexes();

    const verification = await verifyPaystackTransaction(reference);

    if (!verification.status || verification.data?.status !== "success") {
      return NextResponse.json({ error: "Payment not completed." }, { status: 400 });
    }

    const result = await fulfillPaystackPayment({ data: verification.data });

    return NextResponse.json({
      success: true,
      duplicate: result.duplicate,
      order: result.order,
    });
  } catch (error) {
    console.error("[checkout/verify]", error);
    return NextResponse.json(
      { error: error.message || "Verification failed." },
      { status: 500 }
    );
  }
}
