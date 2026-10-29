import { useState, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import "../index.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import { ProductsProvider, useProductsContext } from "../context/ProductsContext";
import Navbar from "../components/Navbar";
import CartSidebar from "../components/CartSidebar";
import Footer from "../components/Footer";
import WhatsAppChat from "../components/WhatsAppChat";
import AIAssistant from "../components/ai/AIAssistant";
import { trackPageView } from "../lib/analytics";

// Define your IDs
const GA_MEASUREMENT_ID = "G-JMNCP6621E";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

function AppShell({ Component, pageProps }) {
  const { cart, cartCount, removeFromCart, cartTotal } = useProductsContext();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  // Register service worker for PWA (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Track pageviews on SPA route changes for GA4 & Meta Pixel
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Track GA4 Pageview
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
      // Track Meta Pixel PageView
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Hide footer on dashboard, checkout, and auth pages
  const hideFooter = router.pathname === '/dashboard' ||
                     router.pathname === '/checkout' ||
                     router.pathname === '/admin' ||
                     router.pathname.startsWith('/auth') ||
                     router.pathname === '/404';

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f5] text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
      />
      <CartSidebar
        cart={cart}
        onRemove={removeFromCart}
        cartTotal={cartTotal}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
      <WhatsAppChat />
      <AIAssistant />
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* 1. Google Analytics 4 Scripts */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      {/* 2. Meta Pixel Script */}
      {META_PIXEL_ID && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      <Head>
        <title>Uptora Electronics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="application-name" content="Uptora Electronics" />
        <meta name="author" content="Uptora Electronics" />
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