export const contentPolicy = "default-src 'none'; script-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'; upgrade-insecure-requests";

// Apply these at the CDN; frame-ancestors is not supported in a CSP meta tag.
export const responseHeaders = {
  'Content-Security-Policy': `${contentPolicy}; frame-ancestors 'none'`,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000',
};
