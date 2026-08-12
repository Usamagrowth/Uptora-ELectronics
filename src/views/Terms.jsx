import Head from "next/head";
import Link from "next/link";

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service - Uptora Electronics</title>
      </Head>
      <div className="min-h-screen bg-[#f7f8f5] px-4 py-12 sm:px-6 lg:px-8 text-gray-900">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          
          {/* Header */}
          <div className="border-b border-gray-100 pb-6">
            <Link href="/" className="text-sm font-medium text-brand-500 hover:underline">
              ← Back to Shop
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-gray-500">Last Updated: June 2026</p>
          </div>

          {/* Content */}
          <div className="mt-8 space-y-8 text-gray-600 leading-relaxed">
            <p>
              Welcome to <strong>Uptora Electronics</strong>. By accessing our website and purchasing our items, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">1. Product Availability & Pricing</h2>
              <p>
                We sell smartphones, laptops, and premium electronics materials. While we strive for 100% accuracy, prices and stock availability are subject to change based on market supply conditions. If an item you ordered is out of stock, we will contact you immediately to issue a full refund or provide an alternative option.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">2. Payment Terms</h2>
              <p>
                All online payments must be completed securely via our integrated Paystack gateway channel before delivery arrangements are initiated. We do not support cash or payment-on-delivery for high-value tech devices unless explicitly authorized by our management.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">3. Delivery and Risk</h2>
              <p>
                Delivery timeframes are estimates. Once a package is handed over to our delivery partners and dispatch tracking details are sent to you via phone or WhatsApp, transit responsibility transitions to the carrier. We will, however, actively assist you in resolving any shipment issues.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">4. Returns and Warranty</h2>
              <p>
                Because we deal exclusively in authentic tech hardware, items come with standard manufacturer warranties. If an item arrives structurally defective or dead-on-arrival, you must report it within 24 hours of delivery to qualify for an immediate swap. We do not accept returns or refunds for a change-of-mind once a retail product box seal is broken.
              </p>
            </section>
          </div>

        </div>
      </div>
    </>
  );
}