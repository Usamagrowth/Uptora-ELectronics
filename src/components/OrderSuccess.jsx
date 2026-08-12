// ============================================================
// ✅ components/OrderSuccess.jsx  — FIXED VERSION
// ============================================================
// FIX: The second useEffect called onClearCart() with an empty
// dependency array [], but onClearCart was not in the deps.
// This caused a React strict-mode warning AND a potential
// stale closure bug.
//
// SOLUTION: Call onClearCart() directly at the start of the
// first useEffect (on mount), no separate effect needed.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

function OrderSuccess({ onClearCart }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // useRef: stores the interval ID.
  // Does NOT cause a re-render when changed — that's why we use
  // useRef instead of useState here.
  const intervalRef = useRef(null);

  useEffect(() => {
    // Clear the cart as soon as this screen appears
    // We call it here inside the single mount effect instead of
    // a separate useEffect — avoids the stale closure problem.
    onClearCart();

    // Start the countdown
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup: stop the interval if component unmounts early
    return () => clearInterval(intervalRef.current);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount only

  return (
    <div className="order-success">
      <div className="success-icon">✅</div>
      <h2 className="success-title">Order Placed Successfully!</h2>
      <p className="success-text">
        Thank you for your purchase. Your order is being processed.
      </p>
      <p className="success-text">
        A confirmation will be sent to your email shortly.
      </p>
      <div className="redirect-notice">
        Redirecting to home in{" "}
        <strong>{countdown}</strong>{" "}
        second{countdown !== 1 ? "s" : ""}...
      </div>
      <button className="go-home-btn" onClick={() => router.push("/")}> 
        Go Home Now
      </button>
    </div>
  );
}

export default OrderSuccess;