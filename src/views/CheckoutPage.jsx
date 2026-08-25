import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useForm, validateShipping } from "../hooks/useForm";
import { useProductsContext } from "../context/ProductsContext";
import { useSession, signIn } from "next-auth/react";
import FormField from "../components/FormField";
import usePaystackCheckout, {
  clearPendingPaymentRef,
  getPendingPaymentRef,
} from "../hooks/usePaystackCheckout";
import { Lock, ShieldCheck, Loader2, BadgeCheck, Truck, Headphones } from "lucide-react";

const INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
};

function formatPrice(amount) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SectionHeading({ num, title, note }) {
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-5">
      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-900/50 text-brand-400 text-xs sm:text-sm font-bold flex items-center justify-center shrink-0">
        {num}
      </span>
      <h2 className="font-bold text-gray-100 text-base sm:text-lg flex-1">{title}</h2>
      {note && <span className="text-xs text-gray-500 shrink-0">{note}</span>}
    </div>
  );
}

const trustItems = [
  {image: "/securebg.png", label: "Secure Payments"},
  {image:"/genuinebg.png", label: "Genuine Products"},
  {image:"/deliverybg.png", label: "Fast Delivery"},
  {image:"/warrantybg.png", label: "Warranty Support"},
  {image:"/customer-servicesbg.png", label: "24/7 Customer Service"},
  ];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useProductsContext();
  const { data: session, status } = useSession();
  const { startCheckout, loading: paystackLoading, error: paystackError, setError: setPaystackError } = usePaystackCheckout();
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verifiedTotal, setVerifiedTotal] = useState(null);

  const {
    values,
    setValues,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
    errors,
  } = useForm(INITIAL, validateShipping);

  useEffect(() => {
    if (session?.user?.email) {
      setValues((prev) => ({
        ...prev,
        email: session.user.email,
        firstName: prev.firstName || session.user.name?.split(" ")[0] || "",
        lastName: prev.lastName || session.user.name?.split(" ").slice(1).join(" ") || "",
      }));
    }
  }, [session?.user?.email, session?.user?.name, setValues]);

  // Only after Paystack redirects back — never on initial page load
  useEffect(() => {
    if (!router.isReady) return;

    const { reference, trxref } = router.query;
    const paymentRef =
      typeof reference === "string"
        ? reference
        : typeof trxref === "string"
        ? trxref
        : null;

    if (!paymentRef || paymentRef.startsWith("UPTORA-DEMO-")) return;

    const pendingRef = getPendingPaymentRef();
    const returnedFromPaystack = Boolean(trxref) || pendingRef === paymentRef;

    if (!returnedFromPaystack) {
      router.replace("/checkout", undefined, { shallow: true });
      return;
    }

    let cancelled = false;

    async function verifyPayment() {
      setVerifyingPayment(true);
      setCheckoutError("");

      try {
        const response = await fetch(
          `/api/checkout/verify?reference=${encodeURIComponent(paymentRef)}`
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Payment could not be verified.");
        }

        if (!cancelled) {
          clearPendingPaymentRef();
          setVerifiedTotal(payload.order?.totalAmount ?? cartTotal);
          setPaymentSuccess(true);
          clearCart();
          router.replace("/checkout", undefined, { shallow: true });
        }
      } catch (err) {
        if (!cancelled) {
          clearPendingPaymentRef();
          setCheckoutError(
            err.message || "Payment not confirmed. Complete payment on Paystack or try again."
          );
          router.replace("/checkout", undefined, { shallow: true });
        }
      } finally {
        if (!cancelled) setVerifyingPayment(false);
      }
    }

    verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.query, clearCart, router, cartTotal]);

  async function finalizeDemoOrder(reference) {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        items: cart,
        address: values.address,
        city: values.city,
        phone: values.phone,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not complete the order.");
    return payload.order;
  }

  async function onSubmit() {
    if (status !== "authenticated") {
      signIn("google", { callbackUrl: "/checkout", prompt: "select_account" });
      throw new Error("Sign in to complete checkout.");
    }

    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      throw new Error("Empty cart");
    }

    setCheckoutError("");
    setPaystackError("");

    const result = await startCheckout({
      items: cart,
      address: values.address,
      city: values.city,
      phone: values.phone,
    });

    if (result?.demo) {
      const order = await finalizeDemoOrder(result.reference);
      setVerifiedTotal(order.total ?? cartTotal);
      setPaymentSuccess(true);
      clearCart();
      return { skipSuccess: true };
    }

    // Live Paystack — redirecting; success only after verify on return
    return { skipSuccess: true };
  }

  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <h2 className="text-xl font-bold text-gray-100">Verifying your payment…</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Please wait while we confirm your payment with Paystack.
        </p>
      </div>
    );
  }

  if (cart.length === 0 && !paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-5xl">🛒</p>
        <h2 className="text-xl font-bold text-gray-200">Your cart is empty</h2>
        <Link href="/" className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen w-full object-cover bg-gray-950 flex flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="w-20 h-20 bg-green-900/40 rounded-full flex items-center justify-center text-4xl animate-bounce">✓</div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Your order is confirmed. A receipt has been sent to your email.
          </p>
        </div>
        <div className="bg-green-950/40 border border-green-900 rounded-2xl p-4 sm:p-5 max-w-xs w-full">
          <p className="text-green-400 font-semibold">
            Total: {formatPrice(verifiedTotal ?? cartTotal)}
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-brand-500 hover:text-brand-600 underline underline-offset-2">
          View your orders →
        </Link>
      </div>
    );
  }

  const submitting = isSubmitting || paystackLoading;

  return (
    <>
      <Head>
        <title>Checkout — Uptora Electronics</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen overflow-x-hidden bg-gray-950 transition-colors">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link href="/" className="text-xs sm:text-sm text-gray-400 hover:text-brand-500 transition-colors shrink-0">
            ← Products
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Secure Checkout</h1>
        </div>

        <div className="grid w-full items-start gap-6 sm:gap-8 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full min-w-0 space-y-4 sm:space-y-5">
              {(checkoutError || paystackError || errors.submit) && (
                <div className="rounded-2xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">
                  {checkoutError || paystackError || errors.submit}
                </div>
              )}

              <div className="bg-gray-900 rounded-2xl  border border-gray-800 p-4 sm:p-6">
                <SectionHeading num="1" title="Personal Information" />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="First Name" name="firstName" value={values.firstName} onChange={handleChange} onBlur={handleBlur} error={getFieldError("firstName")} placeholder="Adewale" />
                    <FormField label="Last Name" name="lastName" value={values.lastName} onChange={handleChange} onBlur={handleBlur} error={getFieldError("lastName")} placeholder="Hassan" />
                  </div>
                  <FormField label="Email" name="email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={getFieldError("email")} placeholder="hassan@example.com" />
                  <FormField label="Phone" name="phone" type="tel" value={values.phone} onChange={handleChange} onBlur={handleBlur} error={getFieldError("phone")} placeholder="09024988998" inputMode="tel" />
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 sm:p-6">
                <SectionHeading num="2" title="Delivery Address" />
                <div className="space-y-4">
                  <FormField label="Street Address" name="address" value={values.address} onChange={handleChange} onBlur={handleBlur} error={getFieldError("address")} placeholder="12 Victoria Island, Lagos" />
                  <FormField label="City" name="city" value={values.city} onChange={handleChange} onBlur={handleBlur} error={getFieldError("city")} placeholder="Lagos" />
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 sm:p-6">
                <SectionHeading num="3" title="Payment" note="🔒 Paystack" />
                <div className="flex items-start gap-3 rounded-xl border border-brand-900 bg-brand-950/40 p-3.5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <p className="text-xs leading-relaxed text-brand-200">
                    Secure payment via Paystack. Pay with your <strong>debit or credit card</strong>, <strong>USSD</strong>, or <strong>online banking</strong> — all Nigerian banks accepted. Your order is confirmed only after payment succeeds.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base transition-all active:scale-95 ${
                  submitting
                    ? "bg-brand-300 cursor-not-allowed text-white"
                    : "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-200 dark:shadow-brand-900/40"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Redirecting to Paystack…
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Pay {formatPrice(cartTotal)} securely
                  </span>
                )}
              </button>
            </form>

            {/* Trust Section */}
          <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
          {trustItems.map((trust, index) => (
            <div key={index} className="flex flex-col items-center justify-center gap-2 rounded-lg">
              <img src={trust.image} alt={trust.label} className="w-full h-full object-contain" />
              <span className="text-xs text-gray-400 text-center">{trust.label}</span>
             </div>
          ))}
         </div>

          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 sm:p-5 lg:sticky lg:top-24">
              <h2 className="font-bold text-gray-100 mb-4">Order Summary</h2>
              <div className="max-h-[22rem] space-y-3 overflow-y-auto pr-1">
                {cart && cart.length > 0 ? cart.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-lg border border-gray-800/70 bg-gray-950/40 p-2.5">
                    <img src={item.image} alt={item.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white break-words">{item.name}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm">No items in cart</p>
                )}
              </div>
              <div className="border-t text-white border-gray-800 mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-brand-500">{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
