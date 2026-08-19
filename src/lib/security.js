/**
 * Security utilities for input validation and sanitization
 */

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

/**
 * Validate price
 */
export function isValidPrice(price) {
  const num = parseFloat(price);
  return !isNaN(num) && num >= 0 && num <= 10000000; // Max 10 million
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Rate limiting in-memory store
 * For production, use Redis or similar
 */
const rateLimitStore = new Map();

export function checkRateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean old entries
  for (const [key, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    if (validRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validRequests);
    }
  }
  
  // Get current requests
  const requests = rateLimitStore.get(identifier) || [];
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(identifier, recentRequests);
  
  return true;
}

/**
 * CSRF token generation (simple implementation)
 * For production, use proper CSRF library
 */
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token, sessionToken) {
  return token === sessionToken;
}