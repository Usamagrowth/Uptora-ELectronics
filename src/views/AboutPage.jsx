import Link from "next/link";
import Head from "next/head";
import { BadgeCheck, Headphones, LockKeyhole, Package, ShieldCheck, Truck, Zap, MapPin, Phone, Mail } from "lucide-react";

const pillars = [
  {
    icon: BadgeCheck,
    title: "Genuine electronics",
    desc: "Phones, appliances and accessories are presented with clear stock status and practical product guidance.",
  },
  {
    icon: LockKeyhole,
    title: "Secure checkout",
    desc: "Orders are paid through Paystack, giving shoppers familiar Nigerian payment options and transaction protection.",
  },
  {
    icon: Truck,
    title: "Delivery support",
    desc: "We help customers confirm dispatch options, delivery fees and timelines before or after checkout.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty guidance",
    desc: "Warranty expectations and after-sales support are handled clearly so customers can buy with confidence.",
  },
  {
    icon: Headphones,
    title: "Reachable service",
    desc: "WhatsApp and email support make it easy to ask product questions before placing an order.",
  },
  {
    icon: Package,
    title: "Careful fulfillment",
    desc: "Orders are prepared with attention to item condition, packaging and customer confirmation.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us — Uptora Electronics Ibadan</title>
        <meta name="description" content="Learn about Uptora Electronics, Ibadan's trusted source for genuine electronics, solar solutions, and home appliances with warranty support." />
        <link rel="canonical" href="https://uptora-electronics.vercel.app/about" />
      </Head>
      <div className=" bg-white text-black">
      {/* Hero Section with Brand Colors */}
      <section>
        <div className="max-w-4xl mx-auto pt-5 px-6 sm:px-6 lg:px-8 sm:pt-6">
        <Link
          href="/"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors mb-8 inline-block"
        >
          ← Back to products
        </Link>

        <p className="text-sm font-semibold text-brand-500 uppercase tracking-wide mb-3">About Uptora</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">
          Smart electronics for everyday life
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-6 max-w-2xl leading-relaxed">
          Uptora is a modern electronics store built around comfort and convenience. Whether you are upgrading your
          desk, your living room, or your on-the-go kit, we bring together dependable products and a calm shopping
          experience—so you spend less time comparing and more time enjoying what you buy.
        </p>
        <p className="text-gray-500 text-sm sm:text-base mb-12 max-w-2xl leading-relaxed border-l-4 border-brand-500 pl-4">
          Our catalog spans the categories you use daily—from laptops and audio to accessories that complete the setup.
          Every listing is chosen to balance performance, value, and the details that matter once the box is open.
        </p>
     </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 pt-5 sm:px-6 lg:px-8">
        {/* Mission Section */}
        <section className="mb-16">
          <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <div className="flex flex-col items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To provide Nigerians with access to genuine electronics at fair prices, backed by reliable support and transparent information. We believe shopping for technology should be simple, trustworthy, and accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Pillars */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Uptora?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-brand-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>
       {/* CTA Section */}
        <section className="grid gap-7 pb-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600 mb-2">
              Delivery Information
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Built around real customer questions</h2>
            <p className="text-gray-600 leading-relaxed">
              Customers can confirm stock, delivery route, item condition and warranty details before buying. Checkout
              remains simple, while WhatsApp support helps shoppers who need human confirmation.
            </p>
          </div>
          <div className="rounded-2xl bg-brand-500 p-8 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-3">Ready to shop?</h2>
            <p className="text-brand-50 leading-relaxed mb-6">
              Browse Uptora products, compare categories and complete payment securely.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50 w-full sm:w-auto"
            >
              Shop Uptora
            </Link>
          </div>
        </section>
      </main>
    </div>
    </>
  );
}
