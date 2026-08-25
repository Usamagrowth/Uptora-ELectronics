import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useSession } from "next-auth/react";
import {
  Package,
  ShoppingBag,
  User,
  Clock,
  ChevronRight,
  Loader2,
  Lock,
  Save,
} from "lucide-react";
import AuthModal from "../components/auth/AuthModal";

function formatNaira(amount) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatusBadge({ status }) {
  const styles = {
    Delivered: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Pending: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
    Processing: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}

function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (status === "loading" || !session) return;

    async function fetchOrders() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/orders");
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load orders.");
        setOrders(payload.orders || []);
      } catch (err) {
        setError(err.message || "Unable to load order history.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [session, status]);

useEffect(() => {
  if (session && authModalOpen) {
    setAuthModalOpen(false);
  }
}, [session, authModalOpen]);

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const delivered = orders.filter((o) => o.deliveryStatus === "Delivered").length;
    const pending = orders.filter((o) => o.deliveryStatus === "Pending" || o.deliveryStatus === "Processing").length;
    return { totalSpent, delivered, pending, count: orders.length };
  }, [orders]);

  const tabs = [
    { key: "orders", label: "Order History", icon: Package },
    { key: "profile", label: "My Profile", icon: User },
  ];

  if (status === "loading") {
    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
          <User className="w-8 h-8 text-brand-500" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Sign in to your account</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track orders, manage your profile, and more.</p>
        </div>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition shadow-lg shadow-brand-200 dark:shadow-brand-900/30"
        >
          Sign in
        </button>
      </div>
       <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
   </>
    );
  }

  return (
    <>
      <Head>
        <title>My Orders — Uptora Electronics</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-500 font-semibold mb-1">My Account</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your orders and account details in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.count, icon: ShoppingBag, color: "text-brand-500 bg-brand-50 dark:bg-brand-900/30" },
            { label: "Total Spent", value: formatNaira(stats.totalSpent), icon: Package, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" },
            { label: "Delivered", value: stats.delivered, icon: Package, color: "text-green-600 bg-green-50 dark:bg-green-900/30" },
            { label: "In Progress", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} className="w-12 h-12 rounded-full ring-2 ring-brand-100 dark:ring-brand-900" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 font-bold text-lg">
                    {session.user.name?.[0] || "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{session.user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? "bg-brand-500 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <Link
              href="/"
              className="flex items-center justify-between rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 px-4 py-3 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
            >
              Continue Shopping
              <ChevronRight className="w-4 h-4" />
            </Link>
          </aside>

          {/* Main content */}
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            {activeTab === "profile" ? (
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Profile Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your account information linked via Google.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{session.user.name}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{session.user.email}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Need help with an order? Contact us at{" "}
                    <span className="font-semibold text-brand-600 dark:text-brand-400">uptoraelectronics@gmail.com</span>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Order History</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">All your past purchases and delivery status.</p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="p-6 sm:p-8">
                    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-600 dark:text-red-300">
                      {error}
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">No orders yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">Start shopping to see your orders here.</p>
                    <Link
                      href="/"
                      className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <tr>
                          <th className="py-3.5 px-6 font-semibold">Order ID</th>
                          <th className="py-3.5 px-6 font-semibold">Date</th>
                          <th className="py-3.5 px-6 font-semibold">Total</th>
                          <th className="py-3.5 px-6 font-semibold">Payment Ref</th>
                          <th className="py-3.5 px-6 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                            <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">{order.id}</td>
                            <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{order.date}</td>
                            <td className="py-4 px-6 font-semibold text-brand-600 dark:text-brand-400">{formatNaira(order.total)}</td>
                            <td className="py-4 px-6 font-mono text-xs text-gray-500 dark:text-gray-400">{order.paymentRef}</td>
                            <td className="py-4 px-6">
                              <StatusBadge status={order.deliveryStatus} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

       </main>
    </div>
     {/* Auth Modal */}
    <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

export default DashboardPage;