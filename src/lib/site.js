/**
 * Site URL utility for consistent domain references
 * This ensures all canonical URLs, Open Graph tags, and email links
 * use the production domain: https://uptoraelectronics.com
 */

export function getSiteUrl() {
  // Priority: NEXT_PUBLIC_SITE_URL > NEXTAUTH_URL > VERCEL_URL > localhost
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000"
  );
}

export function getCanonicalUrl(path = "") {
  const baseUrl = getSiteUrl();
  // Remove trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  // Remove leading slash from path if present
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBaseUrl}${cleanPath}`;
}
