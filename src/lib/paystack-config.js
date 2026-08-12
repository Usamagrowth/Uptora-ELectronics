/**
 * Central Paystack key validation — live/test keys must match.
 * Demo mode is ONLY enabled when ORDER_DEMO_MODE=true (never auto-detected).
 */

function sanitizeKey(value) {
  if (!value) return "";
  return String(value).replace(/^["']|["']$/g, "").trim();
}

export function isDemoPaystackMode() {
  return process.env.ORDER_DEMO_MODE === "true";
}

export function getPaystackPublicKey() {
  return sanitizeKey(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
}

export function getPaystackSecretKey() {
  return sanitizeKey(process.env.PAYSTACK_SECRET_KEY);
}

export function validatePaystackKeys() {
  if (isDemoPaystackMode()) {
    throw new Error("Paystack keys are not used in demo mode.");
  }

  const publicKey = getPaystackPublicKey();
  const secretKey = getPaystackSecretKey();

  if (!publicKey) {
    throw new Error(
      "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is missing. Add your live pk_live_... key in Vercel environment variables."
    );
  }
  if (!secretKey) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is missing. Add your live sk_live_... key in Vercel environment variables."
    );
  }

  const publicIsLive = publicKey.startsWith("pk_live_");
  const publicIsTest = publicKey.startsWith("pk_test_");
  const secretIsLive = secretKey.startsWith("sk_live_");
  const secretIsTest = secretKey.startsWith("sk_test_");

  if (!publicIsLive && !publicIsTest) {
    throw new Error("Invalid Paystack public key. It must start with pk_live_ or pk_test_.");
  }
  if (!secretIsLive && !secretIsTest) {
    throw new Error("Invalid Paystack secret key. It must start with sk_live_ or sk_test_.");
  }
  if (publicIsLive !== secretIsLive) {
    throw new Error(
      "Paystack key mismatch: public and secret keys must both be LIVE (pk_live_ + sk_live_) or both be TEST."
    );
  }

  return {
    publicKey,
    secretKey,
    mode: publicIsLive ? "live" : "test",
  };
}

export function getPaystackConfigStatus() {
  const publicKey = getPaystackPublicKey();
  const secretKey = getPaystackSecretKey();
  const publicIsLive = publicKey.startsWith("pk_live_");
  const publicIsTest = publicKey.startsWith("pk_test_");
  const secretIsLive = secretKey.startsWith("sk_live_");
  const secretIsTest = secretKey.startsWith("sk_test_");
  const keysMatchMode =
    publicKey && secretKey
      ? publicIsLive === secretIsLive && publicIsTest === secretIsTest
      : false;

  return {
    demoMode: isDemoPaystackMode(),
    hasPublicKey: Boolean(publicKey),
    hasSecretKey: Boolean(secretKey),
    publicKeyPrefix: publicKey ? `${publicKey.slice(0, 12)}...` : null,
    secretKeyPrefix: secretKey ? `${secretKey.slice(0, 12)}...` : null,
    keysMatchMode,
    mode:
      publicIsLive && secretIsLive
        ? "live"
        : publicIsTest && secretIsTest
        ? "test"
        : "invalid",
    ready:
      !isDemoPaystackMode() &&
      Boolean(publicKey) &&
      Boolean(secretKey) &&
      keysMatchMode,
  };
}
