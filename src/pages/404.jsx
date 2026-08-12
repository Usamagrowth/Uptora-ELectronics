import Link from "next/link";

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-6xl">404</p>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Page not found</h2>
      <Link
        href="/"
        className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
