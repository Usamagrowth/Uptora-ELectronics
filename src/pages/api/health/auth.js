import { getAuthConfigStatus } from "../../../lib/auth";
import { getPaystackConfigStatus } from "../../../lib/paystack-config";

export default function handler(_req, res) {
  const status = getAuthConfigStatus();
  const paystack = getPaystackConfigStatus();
  const ready =
    status.hasSecret &&
    status.hasGoogleClientId &&
    status.hasGoogleClientSecret &&
    paystack.ready;

  res.status(ready ? 200 : 503).json({
    ready,
    ...status,
    paystack,
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    googleRedirectUri: status.authUrl ? `${status.authUrl}/api/auth/callback/google` : null,
    paystackWebhookUrl: status.authUrl ? `${status.authUrl}/api/webhook/paystack` : null,
  });
}
