import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

function ProductCard({ product, onAddToCart }) {
  const router = useRouter();
  const [showDescription, setShowDescription] = useState(false);
  const displayPrice = product.price.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const oldPrice = Math.round(product.price * 1.12);
  const isPremium = product.price >= 300000;
  
  // Calculate discount percentage if discountPrice exists
  const discountPercent = product.discountPrice && product.discountPrice < product.price
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null;
  const productHref =
    typeof router.query.category === "string" && router.query.category
      ? { pathname: `/product/${product.id}`, query: { category: router.query.category } }
      : { pathname: `/product/${product.id}` };

  function handleBuyNow() {
    if (!product.inStock) return;
    onAddToCart?.(product);
    router.push("/checkout");
  }

  function handleCardClick(e) {
    // Only toggle description if not clicking on buttons or links
    if (!e.target.closest('button') && !e.target.closest('a')) {
      setShowDescription(!showDescription);
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-gray-200/70 ${
        !product.inStock ? "opacity-60" : ""
      }`}
    >
      <Link href={productHref} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://placehold.co/300x300?text=No+Image";
          }}
        />
        
        {discountPercent && (
          <span className="absolute top-2 left-2 rounded-br-lg bg-[#dc2626] px-2 py-1 text-[10px] font-bold text-white">
            -{discountPercent}% OFF
          </span>
        )}
        
        {!product.inStock && (
          <span className="absolute top-2 right-2 rounded bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
            Out of Stock
          </span>
        )}
        <span className="absolute bottom-2 left-2 rounded bg-white/95 px-2 py-1 text-[10px] font-bold text-gray-700 shadow-sm">
          {product.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <Link
          href={productHref}
          className="line-clamp-2  text-sm font-bold leading-snug text-gray-950 transition-colors hover:text-brand-600 sm:text-base"
        >
          {product.name}
        </Link>

        <p className={`line-clamp-2 text-xs leading-relaxed text-gray-500 ${showDescription ? 'block' : 'hidden md:hidden'}`}>
          {product.description}
        </p>
        <div className="mt-auto border-t border-gray-100 pt-3">
          <div className="mb-3">
            <span className="block text-lg font-black text-[#1b9810] sm:text-xl">
              ₦{displayPrice}
            </span>
           </div>
          <div className="flex items-center ">
            <button
              type="button"
              onClick={() => onAddToCart?.(product)}
              disabled={!product.inStock}
              className={`flex min-h-10 w-full items-center justify-center gap-1.5 rounded-md px-4 text-xs font-bold transition-all active:scale-95 sm:text-sm ${
                product.inStock
                  ? "border border-gray-300 bg-white text-gray-900 hover:border-brand-500 hover:text-brand-600"
                  : "cursor-not-allowed bg-gray-100 text-gray-400"
              }`} 
            >
             Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
