import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
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
        <title>Forgot Password — Uptora Electronics</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <ForgotPasswordForm
              onBack={() => window.location.href = "/"}
              onSuccess={() => {
                // Success message is shown by the form component
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
