import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "uptoraelectronics@gmail.com";
const FROM_EMAIL = process.env.EMAIL_FROM || "Uptora Electronics <onboarding@resend.dev>";

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
    return null;
  }
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
