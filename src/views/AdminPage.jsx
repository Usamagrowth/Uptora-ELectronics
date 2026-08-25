import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useAuth } from "../context/AuthContext";
import {
  Package,
  ShoppingCart,
  Clock,
  Loader2,
  Shield,
  Box,
  Truck,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import ProductForm from "../components/admin/ProductForm";
import ProductList from "../components/admin/ProductList";
import CategoryForm from "../components/admin/CategoryForm";
import AuthModal from "../components/auth/AuthModal";
import { FaNairaSign } from "react-icons/fa6";

function formatNaira(amount) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function OrderStatusBadge({ status }) {
  const styles = {
    Pending: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
    Paid: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
    Processing: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
    Shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Delivered: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}

function AdminPage() {
  const { data: session, status } = useSession();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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
        setError(err.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    }

    async function fetchProducts() {
      try {
        const response = await fetch("/api/products", {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to fetch products:", errorData.message || response.statusText);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }

    fetchOrders();
    fetchProducts();
    fetchCategories();
  }, [session, status]);

  async function fetchCategories() {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pending = orders.filter((o) => ["Pending", "Paid", "Processing"].includes(o.status)).length;
    const shipped = orders.filter((o) => o.status === "Shipped").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    return { revenue, pending, shipped, delivered, total: orders.length };
  }, [orders]);

  async function updateOrderStatus(orderId, nextStatus) {
    setUpdatingId(orderId);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: nextStatus }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update order.");
      setOrders((current) => current.map((order) => (order.id === payload.order.id ? payload.order : order)));
    } catch (err) {
      setError(err.message || "Unable to update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Product CRUD handlers
  async function handleSaveProduct(productData) {
    setProductLoading(true);
    setError("");
    try {
      const url = editingProduct ? `/api/products?id=${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save product.");
      
      // Refresh products list
      const productsResponse = await fetch("/api/products");
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setProductLoading(false);
    }
  }

  async function handleDeleteProduct(product) {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    
    setProductLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/products?id=${product.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Unable to delete product.");
      }
      
      setProducts((current) => current.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    } finally {
      setProductLoading(false);
    }
  }

  function handleEditProduct(product) {
    setEditingProduct(product);
    setShowProductForm(true);
  }

  function handleAddProduct() {
    setEditingProduct(null);
    setShowProductForm(true);
  }

  function handleCancelProductForm() {
    setShowProductForm(false);
    setEditingProduct(null);
  }

  // Category CRUD handlers
  async function handleSaveCategory(categoryData) {
    setCategoryLoading(true);
    setError("");
    try {
      const url = editingCategory ? `/api/categories?id=${editingCategory.id}` : "/api/categories";
      
      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save category.");
      
      await fetchCategories();
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (err) {
      setError(err.message || "Unable to save category.");
    } finally {
      setCategoryLoading(false);
    }
  }

  async function handleDeleteCategory(category) {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    
    setCategoryLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/categories?id=${category.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Unable to delete category.");
      }
      
      setCategories((current) => current.filter((c) => c.id !== category.id));
    } catch (err) {
      setError(err.message || "Unable to delete category.");
    } finally {
      setCategoryLoading(false);
    }
  }

  function handleEditCategory(category) {
    setEditingCategory(category);
    setShowCategoryForm(true);
  }

  function handleAddCategory() {
    setEditingCategory(null);
    setShowCategoryForm(true);
  }

  function handleCancelCategoryForm() {
    setShowCategoryForm(false);
    setEditingCategory(null);
  }

  function getNextAction(status) {
    if (status === "Pending" || status === "Paid" || status === "Processing") {
      return { label: "Mark Shipped", next: "Shipped", icon: Truck };
    }
    if (status === "Shipped") return { label: "Mark Delivered", next: "Delivered", icon: Package };
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
          <Shield className="w-8 h-8 text-brand-500" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin access required</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in with an admin account to continue.</p>
        </div>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition shadow-lg shadow-brand-200 dark:shadow-brand-900/30"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (!isAdmin && !session.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-20">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 shadow-lg text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-brand-500 font-semibold">Access Denied</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Admin access required</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Only authorized admin users can view this panel.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: FaNairaSign },
    { key: "orders", label: "Orders", icon: ShoppingCart },
    { key: "products", label: "Products", icon: Box },
    { key: "categories", label: "Categories", icon: Package },
  ];

  return (
    <>
      <Head>
        <title>Admin — Uptora Electronics</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs uppercase tracking-[0.25em] text-brand-500 font-semibold">Store Admin</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 dark:bg-brand-900/40 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300 uppercase">
                <Shield className="w-3 h-3" /> Admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage orders, track revenue, and monitor your product catalog.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: formatNaira(stats.revenue), icon: FaNairaSign, color: "text-brand-600 bg-brand-50 dark:bg-brand-900/30" },
            { label: "Total Orders", value: stats.total, icon: ShoppingCart, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30" },
            { label: "Delivered", value: stats.delivered, icon: Package, color: "text-green-600 bg-green-50 dark:bg-green-900/30" },
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

        {/* Tabs */}
        <div className="mb-6  flex overflow-x-auto gap-2 border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                activeTab === tab.key
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Key performance metrics and store statistics.</p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: formatNaira(stats.revenue), icon: FaNairaSign, color: "text-brand-600 bg-brand-50 dark:bg-brand-900/30" },
                  { label: "Total Orders", value: stats.total, icon: ShoppingCart, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
                  { label: "Pending Orders", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30" },
                  { label: "Products", value: products.length, icon: Box, color: "text-green-600 bg-green-50 dark:bg-green-900/30" },
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
            </div>
          </section>
        ) : activeTab === "orders" ? (
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Orders Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Review customer orders and update fulfillment status.</p>
            </div>

            {error && (
              <div className="mx-6 sm:mx-8 mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-semibold text-gray-900 dark:text-gray-100">No orders yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Orders will appear here once customers complete checkout.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">Order</th>
                      <th className="py-3.5 px-6 font-semibold">Customer</th>
                      <th className="py-3.5 px-6 font-semibold">Total</th>
                      <th className="py-3.5 px-6 font-semibold">Status</th>
                      <th className="py-3.5 px-6 font-semibold">Paystack Ref</th>
                      <th className="py-3.5 px-6 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.map((order) => {
                      const action = getNextAction(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">{order.id}</td>
                          <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{order.customerName}</td>
                          <td className="py-4 px-6 font-semibold text-brand-600 dark:text-brand-400">{formatNaira(order.total)}</td>
                          <td className="py-4 px-6">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="py-4 px-6 font-mono text-xs text-gray-500 dark:text-gray-400">{order.paymentRef}</td>
                          <td className="py-4 px-6">
                            {action ? (
                              <button
                                type="button"
                                disabled={updatingId === order.id}
                                onClick={() => updateOrderStatus(order.id, action.next)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {updatingId === order.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <action.icon className="w-3.5 h-3.5" />
                                )}
                                {action.label}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Complete</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : activeTab === "products" ? (
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            {error && (
              <div className="mx-6 sm:mx-8 mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            {productLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
              </div>
            ) : (
              <ProductList
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onAdd={handleAddProduct}
              />
            )}
          </section>
        ) : activeTab === "categories" ? (
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Categories Management</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage product categories and display order.</p>
              </div>
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {error && (
              <div className="mx-6 sm:mx-8 mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            {categoryLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-semibold text-gray-900 dark:text-gray-100">No categories yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create categories to organize your products.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">Name</th>
                      <th className="py-3.5 px-6 font-semibold">Slug</th>
                      <th className="py-3.5 px-6 font-semibold">Display Order</th>
                      <th className="py-3.5 px-6 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">{category.name}</td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{category.slug}</td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{category.displayOrder}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {/* Product Form Modal */}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={handleCancelProductForm}
          />
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <CategoryForm
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={handleCancelCategoryForm}
          />
        )}

        {/* Auth Modal */}
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </main>
    </div>
    </>
  );
}

export default AdminPage;
