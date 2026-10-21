import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Generate a secure 6-digit OTP
 */
export function generateOTP() {
  // Generate a random 6-digit number (100000 to 999999)
  const otp = crypto.randomInt(100000, 1000000).toString();
  return otp;
}

/**
 * Hash an OTP for secure storage
 */
export async function hashOTP(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

/**
 * Verify an OTP against a hash
 */
export async function verifyOTP(otp, hash) {
  return bcrypt.compare(otp, hash);
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiryDate) {
  return Date.now() > expiryDate;
}

/**
 * Generate OTP expiry time (default 24 hours)
 */
export function getOTPExpiry(hours = 24) {
  return Date.now() + hours * 60 * 60 * 1000;
}
