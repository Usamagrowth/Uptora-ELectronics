import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-options";
import { validateAndPriceCart } from "../../../../lib/cart";
import { ensureDbIndexes } from "../../../../lib/db/init";
import { isDemoPaystackMode, validatePaystackKeys } from "../../../../lib/paystack-config";
import { initializePaystackTransaction } from "../../../../lib/paystack-server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await ensureDbIndexes();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sign in to complete checkout." }, { status: 401 });
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: "User account not linked. Sign out and sign in again to sync your profile." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { items, address, city, phone } = body;

    if (!address?.trim() || !city?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Complete your delivery details." }, { status: 400 });
    }

   const { validatedItems, totalAmount } = await validateAndPriceCart(items);

    if (isDemoPaystackMode()) {
      const reference = `UPTORA-DEMO-${Date.now()}`;
      return NextResponse.json({
        demo: true,
        reference,
        totalAmount,
        items: validatedItems,
      });
    }

    const { mode } = validatePaystackKeys();

    const paystack = await initializePaystackTransaction({
      email: session.user.email,
      amount: totalAmount,
      userId: session.user.id,
      metadata: {
        customerName: session.user.name || "Customer",
        cart: JSON.stringify(validatedItems.map(({ id, quantity }) => ({ id, quantity }))),
        shippingAddress: address.trim(),
        shippingCity: city.trim(),
        shippingPhone: phone.trim(),
        totalAmount: String(totalAmount),
      },
    });

    return NextResponse.json({
      mode,
      authorizationUrl: paystack.authorizationUrl,
      reference: paystack.reference,
      totalAmount,
      channels: paystack.channels,
    });
  } catch (error) {
    console.error("[checkout/paystack]", error);
    return NextResponse.json(
      { error: error.message || "Checkout initialization failed." },
      { status: 400 }
    );
  }
}
