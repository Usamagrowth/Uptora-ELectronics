import { useForm } from "../hooks/useForm";

// ── VALIDATION FUNCTION ──────────────────────────────────
function validateCheckout(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = "Name must be at least 3 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[\d\s\-]{7,15}$/.test(values.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!values.address.trim()) {
    errors.address = "Delivery address is required.";
  }

  if (!values.city.trim()) {
    errors.city = "City is required.";
  }

  const cardDigits = values.cardNumber.replace(/\s/g, "");
  if (!cardDigits) {
    errors.cardNumber = "Card number is required.";
  } else if (!/^\d{16}$/.test(cardDigits)) {
    errors.cardNumber = "Card number must be 16 digits.";
  }

  if (!values.expiry.trim()) {
    errors.expiry = "Expiry date is required.";
  } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.expiry)) {
    errors.expiry = "Use MM/YY format (e.g. 08/26).";
  }

  if (!values.cvv.trim()) {
    errors.cvv = "CVV is required.";
  } else if (!/^\d{3,4}$/.test(values.cvv)) {
    errors.cvv = "CVV must be 3 or 4 digits.";
  }

  return errors;
}

// ── COMPONENT ─────────────────────────────────────────────
function CheckoutForm({ cartTotal, onOrderComplete }) {
  const {
    values,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
  } = useForm(
    {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
    validateCheckout
  );

  async function onSubmit(formValues) {
    // Simulates a real API call — 2 second delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Order placed:", formValues);
    onOrderComplete();
  }

  return (
    <div className="checkout-form-wrapper">

      {/* ── DELIVERY DETAILS ── */}
      <div className="form-section">
        <h3 className="form-section-title">📦 Delivery Details</h3>

        {/* Full Name
            FIX: the comment is now BETWEEN elements, not inside the <input> tag */}
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className={`form-input ${getFieldError("fullName") ? "form-input--error" : ""}`}
            placeholder="Ada Okonkwo"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {/* Error message: only visible when field is touched AND invalid */}
          {getFieldError("fullName") && (
            <p className="form-error">{getFieldError("fullName")}</p>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address *</label>
          <input
            id="email"
            name="email"
            type="email"
            className={`form-input ${getFieldError("email") ? "form-input--error" : ""}`}
            placeholder="ada@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {getFieldError("email") && (
            <p className="form-error">{getFieldError("email")}</p>
          )}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={`form-input ${getFieldError("phone") ? "form-input--error" : ""}`}
            placeholder="+234 800 000 0000"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {getFieldError("phone") && (
            <p className="form-error">{getFieldError("phone")}</p>
          )}
        </div>

        {/* Address */}
        <div className="form-group">
          <label className="form-label" htmlFor="address">Street Address *</label>
          <input
            id="address"
            name="address"
            type="text"
            className={`form-input ${getFieldError("address") ? "form-input--error" : ""}`}
            placeholder="12 Bode Thomas Street"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {getFieldError("address") && (
            <p className="form-error">{getFieldError("address")}</p>
          )}
        </div>

        {/* City */}
        <div className="form-group">
          <label className="form-label" htmlFor="city">City *</label>
          <input
            id="city"
            name="city"
            type="text"
            className={`form-input ${getFieldError("city") ? "form-input--error" : ""}`}
            placeholder="Lagos"
            value={values.city}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {getFieldError("city") && (
            <p className="form-error">{getFieldError("city")}</p>
          )}
        </div>
      </div>

      {/* ── PAYMENT INFORMATION ── */}
      <div className="form-section">
        <h3 className="form-section-title">💳 Payment Information</h3>

        {/* Card Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="cardNumber">Card Number *</label>
          <input
            id="cardNumber"
            name="cardNumber"
            type="text"
            maxLength={19}
            className={`form-input ${getFieldError("cardNumber") ? "form-input--error" : ""}`}
            placeholder="1234 5678 9012 3456"
            value={values.cardNumber}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {getFieldError("cardNumber") && (
            <p className="form-error">{getFieldError("cardNumber")}</p>
          )}
        </div>

        {/* Expiry + CVV side by side */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="expiry">Expiry Date *</label>
            <input
              id="expiry"
              name="expiry"
              type="text"
              maxLength={5}
              className={`form-input ${getFieldError("expiry") ? "form-input--error" : ""}`}
              placeholder="MM/YY"
              value={values.expiry}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {getFieldError("expiry") && (
              <p className="form-error">{getFieldError("expiry")}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cvv">CVV *</label>
            <input
              id="cvv"
              name="cvv"
              type="password"
              maxLength={4}
              className={`form-input ${getFieldError("cvv") ? "form-input--error" : ""}`}
              placeholder="123"
              value={values.cvv}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {getFieldError("cvv") && (
              <p className="form-error">{getFieldError("cvv")}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── ORDER TOTAL ── */}
      <div className="form-section">
        <div className="order-total-row">
          <span>Order Total:</span>
          <strong className="order-total-amount">${cartTotal.toFixed(2)}</strong>
        </div>
      </div>

      {/* ── SUBMIT ── */}
      <button
        className="submit-order-btn"
        onClick={() => handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Place Order →"}
      </button>

      <p className="form-note">
        * All fields are required. Your payment info is not stored.
      </p>
    </div>
  );
}

export default CheckoutForm;