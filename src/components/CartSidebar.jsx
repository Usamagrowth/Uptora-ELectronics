import Link from "next/link";
import { ShoppingBag, Trash2, X } from "lucide-react";

function formatPrice(amount) {
  return `NGN ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function CartSidebar({ cart, onRemove, cartTotal, isOpen, onClose }) {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-950 sm:w-96 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-black text-gray-950 dark:text-gray-100">Your Cart</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <p className="font-black text-gray-700 dark:text-gray-300">Your cart is empty</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Browse products and add something you love.</p>
            <Link href="/" onClick={onClose} 
              className="mt-3 rounded-md bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-800">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-md bg-gray-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold leading-snug text-gray-800 dark:text-gray-200">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-black text-brand-600 dark:text-brand-400">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                    title="Remove"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="shrink-0 space-y-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900/60">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Total</span>
                <span className="text-xl font-black text-brand-600 dark:text-brand-400">{formatPrice(cartTotal)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full rounded-md bg-brand-500 py-3.5 text-center text-sm font-black text-white transition hover:bg-brand-600 active:scale-95 sm:text-base"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={onClose}
                className="block w-full py-1 text-center text-sm font-bold text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CartSidebar;
