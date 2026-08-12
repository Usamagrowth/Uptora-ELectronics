import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import "../index.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import { ProductsProvider, useProductsContext } from "../context/ProductsContext";
import Navbar from "../components/Navbar";
import CartSidebar from "../components/CartSidebar";
import Footer from "../components/Footer";
import WhatsAppChat from "../components/WhatsAppChat";

function AppShell({ Component, pageProps }) {
  const { cart, cartCount, removeFromCart, cartTotal } = useProductsContext();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  // Hide footer on dashboard, checkout, and auth pages
  const hideFooter = router.pathname === '/dashboard' || 
                     router.pathname === '/checkout' ||
                     router.pathname === '/admin' ||
                     router.pathname.startsWith('/auth');

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f5] text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
        onSearchToggle={() => setIsSearchOpen((open) => !open)}
        isSearchOpen={isSearchOpen}
      />
      <CartSidebar
        cart={cart}
        onRemove={removeFromCart}
        cartTotal={cartTotal}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
      <main className="flex-1">
        <Component {...pageProps} isSearchOpen={isSearchOpen} />
      </main>
      <WhatsAppChat />
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Uptora Electronics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <AuthProvider>
          <ProductsProvider>
            <AppShell Component={Component} pageProps={pageProps} />
          </ProductsProvider>
        </AuthProvider>
      </SessionProvider>
    </>
  );
}