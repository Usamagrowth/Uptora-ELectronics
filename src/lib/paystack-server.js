import crypto from "crypto";
import { getAuthUrl } from "./auth";
import { getPaystackSecretKey, validatePaystackKeys } from "./paystack-config";

const PAYSTACK_BASE = "https://api.paystack.co";

/** Card, bank & USSD work from any Nigerian bank. bank_transfer omitted (single deposit account). */
export const PAYSTACK_CHANNELS = [
  "card",
  "bank",
  "ussd",
  "qr",
  "mobile_money",
  "bank_transfer",
];

function getPaymentChannels() {
  const fromEnv = process.env.PAYSTACK_CHANNELS;
  if (fromEnv?.trim()) {
    return fromEnv.split(",").map((c) => c.trim()).filter(Boolean);
  }
  return PAYSTACK_CHANNELS;
}

function getSecretKey() {
  const key = getPaystackSecretKey();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return key;
}

export function stringifyMetadata(metadata = {}) {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, value == null ? "" : String(value)])
  );
}

export function verifyPaystackSignature(rawBody, signature) {
  if (!signature) return false;
  const hash = crypto.createHmac("sha512", getSecretKey()).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function initializePaystackTransaction({
  email,
  amount,
  userId,
  metadata = {},
  callbackPath = "/checkout",
}) {
  validatePaystackKeys();

  const secretKey = getSecretKey();
  const baseUrl = getAuthUrl() || "http://localhost:3000";
  const reference = `UPTORA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      currency: "NGN",
      reference,
      channels: getPaymentChannels(),
      callback_url: `${baseUrl}${callbackPath}`,
      metadata: stringifyMetadata({
        userId: String(userId),
        customerEmail: email,
        ...metadata,
      }),
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.status) {
    const message = payload.message || "Failed to initialize Paystack transaction.";
    throw new Error(message);
  }

  if (!payload.data?.authorization_url || !payload.data?.access_code) {
    throw new Error("Paystack returned an incomplete checkout session.");
  }

  return {
    reference: payload.data.reference,
    authorizationUrl: payload.data.authorization_url,
    accessCode: payload.data.access_code,
    channels: getPaymentChannels(),
  };
}

export async function verifyPaystackTransaction(reference) {
  validatePaystackKeys();
  const secretKey = getSecretKey();

  const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Paystack verification failed");
  }

  return data;
}
