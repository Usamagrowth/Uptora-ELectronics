// ============================================================
// 🪝 hooks/useForm.js — CUSTOM FORM HANDLING HOOK
// ============================================================
// WHAT IS FORM HANDLING IN REACT?
// In plain HTML, forms manage their own data inside the browser.
// In React, WE manage the form data using state.
// This is called "controlled components" — React is in control.
//
// WHY BUILD A CUSTOM HOOK FOR FORMS?
// Every form in our app needs the same things:
//  - Store the current value of each field
//  - Validate each field (is it empty? is the email valid?)
//  - Show error messages
//  - Handle form submission
//
// Instead of repeating this logic in every form component,
// we put it in ONE hook and reuse it everywhere.
// That's called the DRY principle: Don't Repeat Yourself.
//
// 🧠 ANALOGY: It's like a form template at a bank.
// Every branch uses the same template but fills in different fields.
// Our useForm hook is the template — each form fills in its own fields.
// ============================================================

import { useState, useCallback } from "react";

/**
 * @param {Object} initialValues  — the starting values for all fields
 * @param {Function} validate     — a function that checks values and returns errors
 */
export function useForm(initialValues, validate) {
  // ── State 1: The form field values ──────────────────────
  // This object holds the current value of every input field.
  // e.g., { firstName: "John", email: "john@email.com", cardNumber: "" }
  const [values, setValues] = useState(initialValues);

  // ── State 2: Validation error messages ──────────────────
  // This object holds error messages for fields that failed validation.
  // e.g., { email: "Please enter a valid email", cardNumber: "Required" }
  const [errors, setErrors] = useState({});

  // ── State 3: Track which fields the user has visited ────
  // "Touched" means the user clicked into a field and then left it.
  // We only show errors for touched fields — not immediately on load.
  // Nobody wants to see "This field is required" before they even start.
  const [touched, setTouched] = useState({});

  // ── State 4: Is the form currently submitting? ───────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── State 5: Was the form successfully submitted? ────────
  const [isSuccess, setIsSuccess] = useState(false);

  // ─────────────────────────────────────────────────────────
  // handleChange: Called every time a field value changes
  // It updates the values object for the changed field.
  // ─────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // name comes from the <input name="email"> attribute
    // value is what the user typed

    setValues((prev) => ({
      ...prev,       // keep all other field values unchanged
      [name]: value, // update only the field that changed
      // [name] is computed property — it uses the variable name as the key
    }));

    // If there's already an error for this field, clear it as they type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // ─────────────────────────────────────────────────────────
  // handleBlur: Called when a field loses focus (user clicks away)
  // This is when we mark a field as "touched" and show its error.
  // ─────────────────────────────────────────────────────────
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Run validation immediately when user leaves a field
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, validate]);

  // ─────────────────────────────────────────────────────────
  // handleSubmit: Called when the form's submit button is clicked
  // It prevents the default page reload, validates everything,
  // then calls the onSubmit callback if everything is valid.
  // ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e.preventDefault(); // STOP the browser from reloading the page!
    // 🔑 KEY POINT: In React, we always prevent the default form submit
    //    because we handle everything ourselves in JavaScript.

    // Mark ALL fields as touched so all errors become visible
    const allTouched = Object.keys(initialValues).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Run full validation
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);

    // If any errors exist, stop here — don't submit
    const hasErrors = Object.values(validationErrors).some((err) => err !== "");
    if (hasErrors) return;

    // All valid! Submit the form data
    setIsSubmitting(true);
    try {
      const result = await onSubmit(values);
      // Allow handlers to skip success (e.g. redirect to external payment)
      if (result?.skipSuccess) return;
      setIsSuccess(true);
      setValues(initialValues);
      setTouched({});
    } catch (err) {
      setErrors({ submit: err.message || "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, initialValues]);

  // Helper: should we show the error for a field?
  // Only show if the field has been touched AND has an error message
  const getFieldError = useCallback((name) => {
    return touched[name] && errors[name] ? errors[name] : "";
  }, [touched, errors]);

  return {
    values,
    setValues,
    errors,
    touched,
    isSubmitting,
    isSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
    setIsSuccess,
  };
}

// ─────────────────────────────────────────────────────────────
// 🧪 VALIDATION FUNCTIONS (used by the checkout form)
// These are pure functions — they take values and return errors.
// ─────────────────────────────────────────────────────────────

export function validateShipping(values) {
  const errors = {};

  if (!values.firstName?.trim()) errors.firstName = "First name is required.";
  if (!values.lastName?.trim()) errors.lastName = "Last name is required.";

  if (!values.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.phone?.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10,}$/.test(values.phone.replace(/\D/g, ""))) {
    errors.phone = "Enter a valid phone number (at least 10 digits).";
  }

  if (!values.address?.trim()) errors.address = "Delivery address is required.";
  if (!values.city?.trim()) errors.city = "City is required.";

  return errors;
}

export function validateCheckout(values) {
  const errors = {};

  // First name
  if (!values.firstName || !values.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  // Last name
  if (!values.lastName || !values.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  // Email — must match basic email pattern
  if (!values.email || !values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  // Phone — must be at least 10 digits
  if (!values.phone || !values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10,}$/.test(values.phone.replace(/\D/g, ""))) {
    errors.phone = "Enter a valid phone number (at least 10 digits).";
  }

  // Address
  if (!values.address || !values.address.trim()) {
    errors.address = "Delivery address is required.";
  }

  // City
  if (!values.city || !values.city.trim()) {
    errors.city = "City is required.";
  }

  // Card number — must be 16 digits
  if (!values.cardNumber || !values.cardNumber.trim()) {
    errors.cardNumber = "Card number is required.";
  } else if (values.cardNumber.replace(/\s/g, "").length !== 16) {
    errors.cardNumber = "Card number must be 16 digits.";
  }

  // Expiry — must match MM/YY format
  if (!values.expiry || !values.expiry.trim()) {
    errors.expiry = "Expiry date is required.";
  } else if (!/^\d{2}\/\d{2}$/.test(values.expiry)) {
    errors.expiry = "Use MM/YY format (e.g. 08/27).";
  }

  // CVV — 3 or 4 digits
  if (!values.cvv || !values.cvv.trim()) {
    errors.cvv = "CVV is required.";
  } else if (!/^\d{3,4}$/.test(values.cvv)) {
    errors.cvv = "CVV must be 3 or 4 digits.";
  }

  return errors;
}