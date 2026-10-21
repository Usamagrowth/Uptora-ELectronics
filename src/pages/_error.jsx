import Link from "next/link";
import Head from "next/head";
import { Home, ShoppingBag, ArrowLeft, Radio, Wifi } from "lucide-react";
import { useState, useEffect } from "react";

export default function Error({ statusCode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} — Error` : "Error — Uptora Electronics"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
         
          {/* Error Code Display */}
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-bold text-brand-500 tracking-tight">
              {statusCode || "Error"}
            </h1>
          </div>

          {/* Friendly Message */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {statusCode === 404
                ? "Oops! This page is out of signal"
                : "Something went wrong"}
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {statusCode === 404
                ? "We couldn't find the page you're looking for. It might have been moved, deleted, or there was a typo in the URL."
                : "An unexpected error occurred. Please try again or contact support if the problem persists."}
            </p>
          </div>

          {/* Visual Element - Electronics Theme */}
          <div className="mb-10 flex justify-center gap-4">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
              <Radio className="w-8 h-8 text-brand-500" />
            </div>
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
              <Wifi className="w-8 h-8 text-brand-500" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200 dark:shadow-brand-900/30 w-full sm:w-auto justify-center"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Products
            </Link>
          </div>

          {/* Secondary Links */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Sign In / Create Account
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-10 text-xs text-gray-500 dark:text-gray-500">
            Need help? Contact us at{" "}
            <a
              href="mailto:uptoraelectronics@gmail.com"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              uptoraelectronics@gmail.com
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
  