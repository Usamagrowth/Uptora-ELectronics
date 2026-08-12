import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useProductsContext } from "../context/ProductsContext";
import ProductCard from "../components/ProductCard";
import { BadgeCheck, Truck, LockKeyhole, ShieldCheck, Headphones } from "lucide-react";

function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useProductsContext();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const qtyRef = useRef(null);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return [];
  }, [product]);

  const trustItems = [
  {image: "/secure.png"},
  {image:"/genuine.png"},
  {image:"/delivery.png"},
  {image:"/warranty.png"},
  {image:"/customer-services.png"},
  ];

  useEffect(() => {
    if (!router.isReady || !id) return;

    setLoading(true);
    setProduct(null);
    setQuantity(1);
    setAdded(false);
    setSelectedImage(0);

    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${id}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: Product not found`);
        }
        
        const foundProduct = await response.json();
        
        if (!foundProduct || !foundProduct.id) {
          throw new Error("Invalid product data received");
        }
        
        setProduct(foundProduct);
        
        // Add to recent products
        setRecentProducts(prev => {
          const filtered = prev.filter(p => p.id !== foundProduct.id);
          return [foundProduct, ...filtered].slice(0, 6);
        });
        
        // Set default option if available
        if (foundProduct.options && foundProduct.options.length > 0) {
          setSelectedOption(foundProduct.options[0]);
        }
        
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [router.isReady, id]);

  // Load recent products from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentProducts');
    if (saved) {
      try {
        setRecentProducts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent products', e);
      }
    }
  }, []);

  // Save recent products to localStorage when they change
  useEffect(() => {
    if (recentProducts.length > 0) {
      localStorage.setItem('recentProducts', JSON.stringify(recentProducts));
    }
  }, [recentProducts]);

  useEffect(() => {
    if (product && qtyRef.current) {
      qtyRef.current.focus();
    }
  }, [product]);

  function handleAddToCart() {
    const productToAdd = selectedOption ? { ...product, selectedOption, price: selectedOption.price } : product;
    for (let i = 0; i < quantity; i++) addToCart(productToAdd);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function renderStars(r) {
    return "★".repeat(Math.floor(r)) + (r % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(r));
  }

  function handleBack() {
    const category = typeof router.query.category === "string" && router.query.category
      ? router.query.category
      : product?.category;

    if (category) {
      router.push({ pathname: "/products", query: { category } });
      return;
    }

    router.push("/products");
  }

  if (!router.isReady || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-5xl">😕</p>
        <h2 className="text-xl font-bold text-gray-800">Product not found</h2>
        <p className="text-gray-500 text-sm">No product with ID "{id}" exists.</p>
        <Link href="/products" className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-brand-500 transition-colors mb-6 sm:mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
        </button>

        {/* Product card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-2">

            {/* Image Gallery */}
            <div className="flex flex-col">
              <div className="aspect-square bg-gray-50 overflow-hidden">
                <img
                  src={product.images ? product.images[selectedImage] : product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-4 bg-gray-50">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? 'border-brand-500' : 'border-white'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-5 sm:p-8 flex flex-col gap-4 sm:gap-5">
              <div>
                <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">
                  {product.category}
                </span>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 leading-tight">
                  {product.name}
                </h1>
              </div>

             

              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>

              <p className="text-2xl sm:text-3xl font-bold text-brand-500">
                ₦{(selectedOption ? selectedOption.price : product.price).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>

              {product.options && product.options.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Select Option:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedOption(option)}
                        className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition ${
                          selectedOption === option
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {option.name} - ₦{option.price.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.inStock ? (
                <div className="space-y-3 sm:space-y-4">
                  {/* Qty — useRef attached here */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700">Qty:</label>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm font-bold transition-colors"
                      >−</button>
                      <input
                        ref={qtyRef}
                        type="number"
                        min="1" max="10"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(0, Math.min(10, Number(e.target.value))))}
                        className="w-12 text-center py-2 bg-white text-gray-900 text-sm font-semibold focus:outline-none border-x border-gray-200"
                      />
                      <button
                        onClick={() => setQuantity(q => Math.min(12, q + 1))}
                        className="px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm font-bold transition-colors"
                      >+</button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all active:scale-95 ${
                      added
                        ? "bg-green-500 text-white"
                        : "bg-brand-500 hover:bg-brand-600 text-white"
                    }`}
                  >
                    {added ? `✓ ${quantity} item${quantity > 1 ? "s" : ""} added!` : `Add ${quantity > 1 ? quantity + "× " : ""}to Cart`}
                  </button>

                  <Link
                    href="/checkout"
                    className="block w-full text-center py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base border-2 border-brand-500 text-brand-500 hover:bg-brand-50 transition-colors"
                  >
                    Buy Now →
                  </Link>
                </div>
              ) : (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-200">
                  ⚠ This product is currently out of stock.
                </div>
              )}

              {/* Stock badge */}
              <div className="flex items-center gap-2 pt-2">
                <span className={`w-2 h-2 rounded-full ${product.inStock ? "bg-green-400" : "bg-red-400"}`} />
                <span className="text-xs text-gray-400">
                  {product.inStock ? "In stock — ready to ship" : "Currently unavailable"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <section className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
          {trustItems.map((trust) => (
            <div key={trust} className="justify-center w-full h-full gap-2 rounded-lg">
              <img src={trust.image} alt="trust" className=" w-full h-full" />
             </div>
          ))}
        </section>

        {/* Recent Products Section */}
        {recentProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recentProducts.map((recentProduct) => (
                <div key={recentProduct.id} className="relative flex-shrink-0 w-48 sm:w-56">
                  <ProductCard
                    product={recentProduct}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;