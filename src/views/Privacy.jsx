import Head from "next/head";
import Link from "next/link";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Uptora Electronics</title>
      </Head>
      <div className="min-h-screen bg-[#f7f8f5] px-4 py-12 sm:px-6 lg:px-8 text-gray-900">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          
          {/* Header */}
          <div className="border-b border-gray-100 pb-6">
            <Link href="/" className="text-sm font-medium text-brand-500 hover:underline">
              ← Back to Shop
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-gray-500">Last Updated: June 2026</p>
          </div>

          {/* Content */}
          <div className="mt-8 space-y-8 text-gray-600 leading-relaxed">
            <p>
              At <strong>Uptora Electronics</strong>, we respect your privacy and are committed to protecting your personal data. This policy explains how we handle your information when you visit our store or make a purchase.
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
              <p>
                When you buy from us or create an account, we collect your name, email address, delivery address, phone number, and order details necessary to fulfill your request.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
              <p>
                We use your data strictly to process your orders, arrange delivery to your location (including Ibadan, Osun, and nationwide delivery partners), send payment receipts via Paystack, and provide customer support via WhatsApp.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">3. Secure Payments</h2>
              <p>
                Your payment details (Card information, Bank Transfer tokens, or USSD codes) are processed securely by our payment gateway partner, <strong className="text-gray-950">Paystack</strong>. Uptora Electronics does not see or store your full financial details on our servers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">4. Third-Party Sharing</h2>
              <p>
                We only share your address and phone number with our verified logistics and delivery partners to ensure your electronics package reaches your doorstep securely. We never sell your data to third-party advertisers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">5. Contact Us</h2>
              <p>
                If you have any questions about your data or wish to request its deletion, please contact us directly via our official WhatsApp Support channel linked on our homepage.
              </p>
            </section>
          </div>

        </div>
      </div>
    </>
  );
}