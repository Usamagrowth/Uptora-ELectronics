import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useProductsContext } from "../context/ProductsContext";
import { signOut } from "next-auth/react";
import { Menu, ShoppingCart, X, Search, User, Package, BadgeCheck, Phone, LockKeyhole, Truck } from "lucide-react";
import SearchBar from "./SearchBar";
import AuthModal from "./auth/AuthModal";
import { useSession } from "next-auth/react";


function Navbar({ cartCount, onCartOpen }) {
  const router = useRouter();
  const pathname = router.pathname;
  const { user, isAdmin } = useAuth();
  const { searchQuery, setSearchQuery } = useProductsContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { data: session } = useSession();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

useEffect(() => {
  if (session && authModalOpen) {
    setAuthModalOpen(false);
  }
}, [session, authModalOpen]);

  const linkCls = (path) =>
    `text-sm font-bold transition-colors whitespace-nowrap ${
      pathname === path
        ? "text-brand-600"
        : "text-gray-700 hover:text-brand-600"
    }`;

  const handleCategoryQuickFilter = (category) => {
    setSearchQuery("");
    setSearchOpen(false);
    router.push("/?category=" + encodeURIComponent(category));
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="w-full bg-brand-600 text-white overflow-hidden" style={{ height: '36px' }}>
        <div className="flex items-center h-full animate-marquee whitespace-nowrap">
          <span className="text-xs font-medium px-8">
            <Package className="inline-block w-4 h-4 mr-1" /> Free delivery on orders above ₦200,000 &nbsp;&nbsp;|&nbsp;&nbsp; 
            <BadgeCheck className="inline-block w-4 h-4 mr-1" /> 100% Genuine Products &nbsp;&nbsp;|&nbsp;&nbsp; 
            <Phone className="inline-block w-4 h-4 mr-1" /> Call: 09024988998 &nbsp;&nbsp;|&nbsp;&nbsp; 
            <LockKeyhole className="inline-block w-4 h-4 mr-1" /> Secure Payment via Paystack &nbsp;&nbsp;|&nbsp;&nbsp; 
            <Package className="inline-block w-4 h-4 mr-1" /> Free delivery on orders above ₦200,000 &nbsp;&nbsp;|&nbsp;&nbsp; 
            <BadgeCheck className="inline-block w-4 h-4 mr-1" /> 100% Genuine Products &nbsp;&nbsp;|&nbsp;&nbsp; 
            <Phone className="inline-block w-4 h-4 mr-1" /> Call: 09024988998 &nbsp;&nbsp;|&nbsp;&nbsp; 
            <LockKeyhole className="inline-block w-4 h-4 mr-1" /> Secure Payment via Paystack &nbsp;&nbsp;|&nbsp;&nbsp; 
            <Truck className="inline-block w-4 h-4 mr-1" /> Currently deliver to only ibadan
          </span>
        </div>
      </div>

      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-1 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex" onClick={() => setSearchOpen(false)}>
              <img src="/logo.png" alt="Uptora Electronics" className="md:h-full md:w-full lg:h-full lg:w-full w-32 h-32" />
            </Link>

            <div className="hidden items-center px-4 gap-4 lg:gap-6 md:flex overflow-x-auto">
              <Link href="/" className={linkCls("/")} onClick={() => setSearchQuery("")}>Shop</Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/?category=${encodeURIComponent(category.name)}`}
                  className={linkCls(`/?category=${encodeURIComponent(category.name)}`)}
                >
                  {category.name}
                </Link>
              ))}
              <Link href="/about" className={linkCls("/about")}>About</Link>
              <Link href="/dashboard" className={linkCls("/dashboard")}>Dashboard</Link>
              {isAdmin && <Link href="/admin" className={linkCls("/admin")}>Admin</Link>}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={onCartOpen}
                aria-label="Open cart"
                className="relative inline-flex h-10 items-center gap-2 rounded-md bg-brand-500 px-3 text-sm font-black text-white transition hover:bg-brand-600 active:scale-95 sm:px-4"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-black text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-100 md:inline-flex"
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="h-6 w-6 rounded-full" />
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] text-brand-600">U</span>
                  )}
                  <span>Sign out</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden rounded-md border border-brand-500 px-3 py-2 text-xs font-black text-brand-600 transition hover:bg-brand-50 md:inline-flex"
                >
                  Login
                </button>
              )}

              {!user && (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 md:hidden"
                  aria-label="Login"
                >
                  <User className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 md:hidden"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onClose={() => setSearchOpen(false)} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-gray-500">Quick filters:</span>
                  <button onClick={() => handleCategoryQuickFilter('Phones & Tablets')} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Phones & Tablets</button>
                  <button onClick={() => handleCategoryQuickFilter('Inverter & Battery')} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Inverter & Battery</button>
                  <button onClick={() => handleCategoryQuickFilter('Air Conditioners')} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Air Conditioners</button>
                  <button onClick={() => handleCategoryQuickFilter('Audio & Accessories')} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Audio & Accessories</button>
                  <button onClick={() => handleCategoryQuickFilter('Televisions')} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Televisions</button>
                  <button onClick={() => handleCategoryQuickFilter('Washing Machines')} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Washing Machines</button>
                  <button onClick={() => handleCategoryQuickFilter('Kitchen Appliances')} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Kitchen Appliances</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className={`fixed inset-0 z-[9999] bg-white transition-all duration-300 md:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-1">
            <Link href="/" className="w-32 h-32" onClick={() => {setMenuOpen(false); setSearchOpen(false);}}>
              <img src="/logo.png" alt="Uptora Electronics" className="w-full h-full" />
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto flex-1 px-6">
            <Link href="/" className={linkCls("/")} onClick={() => {setMenuOpen(false); setSearchOpen(false);}}>Shop</Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${encodeURIComponent(category.name)}`}
                className={linkCls(`/?category=${encodeURIComponent(category.name)}`)}
                onClick={() => setMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link href="/about" className={linkCls("/about")} onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/dashboard" className={linkCls("/dashboard")} onClick={() => setMenuOpen(false)}>Dashboard</Link>
            {isAdmin && <Link href="/admin" className={linkCls("/admin")} onClick={() => setMenuOpen(false)}>Admin</Link>}
          </div>
          <div className="pt-4 border-t border-gray-100 px-6">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                      {user.name?.[0] || "U"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="w-full flex items-center gap-2 text-left text-sm font-bold text-gray-700 py-2 hover:bg-gray-50 rounded px-2"
                >
                  <User className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => {setMenuOpen(false); setAuthModalOpen(true);}}
                className="w-full flex items-center gap-2 text-left text-sm font-black text-brand-600 py-2 hover:bg-gray-50 rounded px-2"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

export default Navbar;