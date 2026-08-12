import { validateAndPriceCart } from "../cart";
import { createOrder, findOrderByPaymentReference } from "../db/orders";
import { sendOrderEmails } from "../email";

function parseMetadataCart(metadata = {}) {
  try {
    if (typeof metadata.cart === "string") {
      return JSON.parse(metadata.cart);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Idempotent order fulfillment after Paystack charge.success.
 * Used by the webhook and the post-checkout verify endpoint.
 */
export async function fulfillPaystackPayment({ data }) {
  const paymentReference = data.reference;
  const metadata = data.metadata || {};

  const existing = await findOrderByPaymentReference(paymentReference);
  if (existing) {
    return { order: existing, duplicate: true };
  }

  const cartPayload = parseMetadataCart(metadata);
  const { validatedItems, totalAmount } = validateAndPriceCart(cartPayload);

  const paidAmount = data.amount / 100;
  if (Math.abs(paidAmount - totalAmount) > 0.01) {
    throw new Error(`Payment amount mismatch for ${paymentReference}`);
  }

  const customerEmail =
    data.customer?.email || metadata.customerEmail || metadata.email || "";
  const customerName = metadata.customerName || "Customer";

  const order = await createOrder({
    userId: metadata.userId ? String(metadata.userId) : null,
    customerName,
    customerEmail,
    items: validatedItems,
    totalAmount,
    paymentReference,
    status: "Paid",
    deliveryStatus: "Pending",
    address: metadata.shippingAddress || "",
    city: metadata.shippingCity || "",
    phone: metadata.shippingPhone || "",
  });

  await sendOrderEmails({ order, customerEmail, customerName });

  return { order, duplicate: false };
}
