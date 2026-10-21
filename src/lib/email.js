import { Resend } from "resend";
import { getSiteUrl } from "./site";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "uptoraelectronics@gmail.com";
const FROM_EMAIL = process.env.EMAIL_FROM || "Uptora Electronics <onboarding@resend.dev>";

/**
 * Send delivery OTP to customer
 */
export async function sendDeliveryOTP({ to, customerName, orderId, otp }) {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not configured — delivery OTP email skipped");
    return { skipped: true, reason: "API key not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Delivery Verification Code — Order #${orderId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;">
          <h2 style="color:#1B9810;">Delivery Verification Code</h2>
          <p>Hi ${customerName || "there"},</p>
          <p>Your order <strong>#${orderId}</strong> is ready for delivery.</p>
          <p>Please provide the following verification code to the delivery person:</p>
          <p style="margin:24px 0;">
            <span style="background:#1B9810;color:#fff;padding:16px 32px;font-size:24px;font-weight:bold;letter-spacing:4px;border-radius:8px;display:inline-block;">
              ${otp}
            </span>
          </p>
          <p style="font-size:13px;color:#666;">
            This code will expire in 24 hours. If you didn't request this delivery, please contact us immediately.
          </p>
          <p style="margin-top:20px;color:#666;font-size:13px;">
            <strong>Important:</strong> Never share this code with anyone except the delivery person.
          </p>
          <p style="margin-top:20px;color:#666;font-size:13px;">Uptora Electronics</p>
        </div>
      `,
    });

    console.log("[Email] Delivery OTP email sent successfully to:", to);
    return { success: true, result };
  } catch (error) {
    console.error("[Email] Failed to send delivery OTP email:", error);
    console.error("[Email] Error details:", {
      to,
      from: FROM_EMAIL,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });
    return { success: false, error: error.message, code: error.code };
  }
}

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildItemsHtml(items = []) {
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatNaira(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not set — skipping email delivery.");
    console.warn("[Email] Please set RESEND_API_KEY in your environment variables.");
    return null;
  }

  // Log configuration (without exposing the actual key)
  console.log("[Email] Resend client configured");
  console.log("[Email] FROM_EMAIL:", FROM_EMAIL);

  return new Resend(apiKey);
}

export async function sendCustomerOrderConfirmation({ to, customerName, order }) {
  const resend = getResendClient();
  if (!resend) return { skipped: true };

  const itemsHtml = buildItemsHtml(order.items);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Order Confirmed — ${order.paymentReference}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;">
        <h2 style="color:#1B9810;">Thank you for your order!</h2>
        <p>Hi ${customerName || "there"},</p>
        <p>Your payment was received successfully. Here is your receipt:</p>
        <p><strong>Reference:</strong> ${order.paymentReference}</p>
        <p><strong>Total paid:</strong> ${formatNaira(order.totalAmount)}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px;text-align:left;">Item</th>
              <th style="padding:8px;text-align:center;">Qty</th>
              <th style="padding:8px;text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin-top:20px;color:#666;font-size:13px;">Uptora Electronics — we'll notify you when your order ships.</p>
      </div>
    `,
  });
}

export async function sendAdminNewOrderAlert({ order, customerEmail }) {
  const resend = getResendClient();
  if (!resend) return { skipped: true };

  const itemsHtml = buildItemsHtml(order.items);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Order Placed! — ${formatNaira(order.totalAmount)}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;">
        <h2 style="color:#1B9810;">New Order Placed!</h2>
        <p><strong>Customer:</strong> ${order.customerName} (${customerEmail})</p>
        <p><strong>Reference:</strong> ${order.paymentReference}</p>
        <p><strong>Total:</strong> ${formatNaira(order.totalAmount)}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px;text-align:left;">Item</th>
              <th style="padding:8px;text-align:center;">Qty</th>
              <th style="padding:8px;text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>
    `,
  });
}

export async function sendOrderEmails({ order, customerEmail, customerName }) {
  return Promise.all([
    sendCustomerOrderConfirmation({ to: customerEmail, customerName, order }),
    sendAdminNewOrderAlert({ order: { ...order, customerName }, customerEmail }),
  ]);
}

export async function sendPasswordResetEmail({ to, resetToken }) {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not configured — password reset email skipped");
    return { skipped: true, reason: "API key not configured" };
  }

  const siteUrl = getSiteUrl() || 'http://localhost:3000';
  const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken}`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Reset Your Password — Uptora Electronics",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;">
          <h2 style="color:#1B9810;">Password Reset Request</h2>
          <p>Hi there,</p>
          <p>We received a request to reset your password for your Uptora Electronics account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="margin:24px 0;">
            <a href="${resetUrl}" style="background:#1B9810;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">
              Reset Password
            </a>
          </p>
          <p style="font-size:13px;color:#666;">
            Or copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color:#1B9810;">${resetUrl}</a>
          </p>
          <p style="margin-top:20px;color:#666;font-size:13px;">
            This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.
          </p>
          <p style="margin-top:20px;color:#666;font-size:13px;">Uptora Electronics</p>
        </div>
      `,
    });

    console.log("[Email] Password reset email sent successfully to:", to);
    return { success: true, result };
  } catch (error) {
    console.error("[Email] Failed to send password reset email:", error);
    console.error("[Email] Error details:", {
      to,
      from: FROM_EMAIL,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });
    return { success: false, error: error.message, code: error.code };
  }
}
