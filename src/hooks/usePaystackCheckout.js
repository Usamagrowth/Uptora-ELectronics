import { useState, useCallback } from "react";

const PENDING_KEY = "uptora_paystack_pending";

export function getPendingPaymentRef() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PENDING_KEY);
}

export function clearPendingPaymentRef() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_KEY);
}

/**
 * Server initializes Paystack → browser redirects to hosted checkout.
 */
export function usePaystackCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startCheckout = useCallback(async ({ items, address, city, phone }) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, address, city, phone }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not start checkout.");
      }

      if (payload.demo) {
        return { demo: true, ...payload };
      }

      if (!payload.authorizationUrl || !payload.reference) {
        throw new Error("Paystack did not return a checkout URL. Check your live API keys on Vercel.");
      }

      sessionStorage.setItem(PENDING_KEY, payload.reference);
      window.location.assign(payload.authorizationUrl);
      return { skipSuccess: true, ...payload };
    } catch (err) {
      const message = err.message || "Checkout failed.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { startCheckout, loading, error, setError };
}

export default usePaystackCheckout;
