/**
 * E-commerce Analytics Helper
 * Supports Google Analytics 4 (GA4) and Meta Pixel (Facebook Pixel)
 */

// GA4 Tracking ID
const GA4_MEASUREMENT_ID = "G-JMNCP6621E";

// Meta Pixel ID (will be loaded via environment or fallback)
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || null;

/**
 * Safe window.gtag wrapper
 */
function gtag(...args) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

/**
 * Safe window.fbq wrapper
 */
function fbq(...args) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

/**
 * Track page view (SPA navigation)
 */
export function trackPageView(pagePath, pageTitle) {
  if (typeof window === "undefined") return;

  // GA4 page view
  gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: pagePath,
    page_title: pageTitle,
  });

  // Meta Pixel page view
  fbq("track", "PageView");
}

/**
 * Track view content (product page)
 */
export function trackViewContent(product) {
  if (typeof window === "undefined" || !product) return;

  // GA4 view_item
  gtag("event", "view_item", {
    currency: "NGN",
    value: product.price || 0,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        category: product.category || "Uncategorized",
        price: product.price || 0,
        quantity: 1,
      },
    ],
  });

  // Meta Pixel ViewContent
  fbq("track", "ViewContent", {
    content_name: product.name,
    content_category: product.category || "Uncategorized",
    content_ids: [product.id],
    value: product.price || 0,
    currency: "NGN",
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(product, quantity = 1) {
  if (typeof window === "undefined" || !product) return;

  const value = (product.price || 0) * quantity;

  // GA4 add_to_cart
  gtag("event", "add_to_cart", {
    currency: "NGN",
    value: value,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        category: product.category || "Uncategorized",
        price: product.price || 0,
        quantity: quantity,
      },
    ],
  });

  // Meta Pixel AddToCart
  fbq("track", "AddToCart", {
    content_name: product.name,
    content_category: product.category || "Uncategorized",
    content_ids: [product.id],
    value: value,
    currency: "NGN",
  });
}

/**
 * Track initiate checkout
 */
export function trackInitiateCheckout(cart, cartTotal) {
  if (typeof window === "undefined" || !cart || cart.length === 0) return;

  const items = cart.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    category: item.category || "Uncategorized",
    price: item.price || 0,
    quantity: item.quantity || 1,
  }));

  // GA4 begin_checkout
  gtag("event", "begin_checkout", {
    currency: "NGN",
    value: cartTotal || 0,
    items: items,
  });

  // Meta Pixel InitiateCheckout
  fbq("track", "InitiateCheckout", {
    content_ids: cart.map((item) => item.id),
    value: cartTotal || 0,
    currency: "NGN",
    num_items: cart.length,
  });
}

/**
 * Track purchase
 */
export function trackPurchase(orderId, cart, cartTotal) {
  if (typeof window === "undefined" || !orderId) return;

  const items = cart.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    category: item.category || "Uncategorized",
    price: item.price || 0,
    quantity: item.quantity || 1,
  }));

  // GA4 purchase
  gtag("event", "purchase", {
    transaction_id: orderId,
    currency: "NGN",
    value: cartTotal || 0,
    items: items,
  });

  // Meta Pixel Purchase
  fbq("track", "Purchase", {
    content_ids: cart.map((item) => item.id),
    value: cartTotal || 0,
    currency: "NGN",
    num_items: cart.length,
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm) {
  if (typeof window === "undefined" || !searchTerm) return;

  // GA4 search
  gtag("event", "search", {
    search_term: searchTerm,
  });
}

/**
 * Initialize Meta Pixel (called once on page load)
 */
export function initMetaPixel() {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;

  // Meta Pixel initialization
  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}
