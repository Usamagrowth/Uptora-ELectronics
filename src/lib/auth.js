export function getAuthUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return undefined;
}

export function getAuthConfigStatus() {
  return {
    hasSecret: Boolean(process.env.NEXTAUTH_SECRET),
    hasGoogleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    hasGoogleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    hasPaystackSecret: Boolean(process.env.PAYSTACK_SECRET_KEY),
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    authUrl: getAuthUrl() || null,
  };
}

export function assertAuthConfig() {
  const status = getAuthConfigStatus();
  const missing = [];

  if (!status.hasSecret) missing.push("NEXTAUTH_SECRET");
  if (!status.hasGoogleClientId) missing.push("GOOGLE_CLIENT_ID");
  if (!status.hasGoogleClientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  if (process.env.NODE_ENV === "production" && !status.hasMongoUri) {
    missing.push("MONGODB_URI");
  }

  if (missing.length > 0) {
    throw new Error(`Missing auth environment variables: ${missing.join(", ")}`);
  }

  return status;
}
