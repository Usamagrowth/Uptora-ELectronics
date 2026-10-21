import { useState } from "react";
import { Shield, Loader2, Copy, Check, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";

export default function DeliveryOTPManager({ order, onOTPGenerated, onRegenerated, onMarkedDelivered }) {
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState("");
  const [copied, setCopied] = useState(false);

  async function generateOTP() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/delivery-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", orderId: order.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate OTP");
      setOtp(data.otp);
      setSuccess("OTP generated successfully! Send this to the customer.");
      if (onOTPGenerated) onOTPGenerated(data.order);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function regenerateOTP() {
    setRegenerating(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/delivery-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate", orderId: order.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to regenerate OTP");
      setOtp(data.otp);
      setSuccess("OTP regenerated successfully!");
      if (onRegenerated) onRegenerated(data.order);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  }

  async function markAsDelivered() {
    setMarkingDelivered(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/delivery-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-delivered", orderId: order.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to mark as delivered");
      setSuccess("Order marked as delivered!");
      setOtp(""); // Clear OTP after delivery
      if (onMarkedDelivered) onMarkedDelivered(data);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingDelivered(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isShipped = order.status === "Shipped";
  const isDelivered = order.status === "Delivered";
  const hasOTP = order.hasOTP;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-brand-600" />
        <h3 className="font-semibold text-gray-900">Delivery Verification</h3>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {isDelivered ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Order Delivered</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            This order has been successfully delivered and verified.
          </p>
        </div>
      ) : !isShipped ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Ship the order first to generate a delivery verification code.
          </p>
        </div>
      ) : otp ? (
        <div className="space-y-4">
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
            <p className="text-sm text-brand-700 mb-2">Delivery Verification Code:</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white border-2 border-brand-300 rounded-lg px-4 py-3">
                <span className="text-2xl font-bold tracking-widest text-brand-700">{otp}</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-brand-600 mt-2">
              Send this code to the customer via email or WhatsApp. Valid for 24 hours.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={regenerateOTP}
              disabled={regenerating}
              className="flex items-center gap-2 flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {regenerating ? "Regenerating..." : "Regenerate"}
            </button>
            <button
              onClick={markAsDelivered}
              disabled={markingDelivered}
              className="flex items-center gap-2 flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markingDelivered ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {markingDelivered ? "Marking..." : "Mark Delivered"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Generate a secure 6-digit verification code to confirm delivery with the customer.
          </p>
          <button
            onClick={generateOTP}
            disabled={loading}
            className="flex items-center gap-2 w-full bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate OTP"}
          </button>
        </div>
      )}
    </div>
  );
}
