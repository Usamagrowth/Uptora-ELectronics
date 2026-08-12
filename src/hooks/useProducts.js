// ============================================================
// 🪝 hooks/useProducts.js — DATABASE VERSION
// ============================================================
// UPDATED: Now fetches products from MongoDB API instead of static data
// Maintains all existing functionality while using database as data source
// ============================================================

import { useState, useMemo, useEffect } from "react";

export function useProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [minRating, setMinRating] = useState(0);

  const [cart, setCart] = useState([]);
  const [cartReady, setCartReady] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("reactmart-cart");
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
    setCartReady(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!cartReady) return;
    localStorage.setItem("reactmart-cart", JSON.stringify(cart));
  }, [cart, cartReady]);

  // Fetch products from API with retry logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        
        console.log("[useProducts] Fetching products from /api/products...");
        const response = await fetch("/api/products", {
          cache: 'no-store'
        });
        
        console.log("[useProducts] Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("[useProducts] API Error Response:", errorData);
          
          const errorMessage = errorData.message || `HTTP ${response.status}: Failed to fetch products`;
          const errorDetails = errorData.details || errorData.error;
          
          // Provide helpful error message for MongoDB connection issues
          if (errorMessage.includes("MongoDB") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("connection")) {
            const fullError = `Database connection failed: ${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`;
            console.error("[useProducts] MongoDB Connection Error:", fullError);
            throw new Error(fullError);
          }
          
          console.error("[useProducts] API Error:", errorMessage, errorDetails);
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log("[useProducts] API Response data received, products count:", data.products?.length);
        
        if (!data.products || !Array.isArray(data.products)) {
          console.error("[useProducts] Invalid response format:", data);
          throw new Error("Invalid response format from API");
        }
        
        setProducts(data.products);
        
        // Extract categories from products
        const uniqueCategories = [...new Set(data.products.map(p => p.category).filter(Boolean))];
        setCategories(["All", ...uniqueCategories.sort()]);
        
        console.log("[useProducts] Products loaded successfully:", data.products.length);
        
      } catch (err) {
        console.error("[useProducts] Error fetching products:", err);
        console.error("[useProducts] Error details:", err.message, err.stack);
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`[useProducts] Retrying... (${retryCount}/${maxRetries})`);
          setTimeout(fetchProducts, 1000 * retryCount);
          return;
        }
        
        setError(err.message || "Failed to load products. Please check your connection.");
        setProducts([]);
        setCategories(["All"]);
      } finally {
        if (retryCount >= maxRetries) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
  }, []);

  // Filter products based on search, category, rating, and sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    if (sortOrder === "low-to-high") {
      result = result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "high-to-low") {
      result = result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortOrder, minRating]);

  function addToCart(product, quantity = 1) {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);

      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevCart, { ...product, quantity }];
    });
  }

  function removeFromCart(productId) {
    setCart(cart.filter((item) => item.id !== productId));
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    products,
    filteredProducts,
    categories,
    cart,
    cartCount,
    cartTotal,
    searchQuery,
    selectedCategory,
    sortOrder,
    minRating,
    loading,
    error,
    setSearchQuery,
    setSelectedCategory,
    setSortOrder,
    setMinRating,
    addToCart,
    removeFromCart,
    clearCart,
  };
}