import Link from "next/link";
import { useRouter } from "next/router";

const ERROR_MESSAGES = {
  Configuration: "Server auth is not configured. Set NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in Vercel.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign-in link is no longer valid.",
  OAuthSignin: "Could not start Google sign-in. Check your Google OAuth redirect URI matches your live domain.",
  OAuthCallback: "Google sign-in callback failed. Confirm the redirect URI in Google Cloud Console.",
  OAuthCreateAccount: "Could not create an account with this provider.",
  Callback: "Sign-in callback error. Try again.",
  Default: "Something went wrong during sign-in.",
};

export default function AuthErrorPage() {
  const router = useRouter();
  const code = typeof router.query.error === "string" ? router.query.error : "Default";
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-500 font-semibold mb-2">Sign-in error</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Could not sign in</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>
        {code !== "Default" && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 font-mono">Code: {code}</p>
        )}
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition"
          >
            Back to store
          </Link>
          <button
            type="button"
            onClick={() => router.reload()}
            className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
