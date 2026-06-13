import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // SameSite must be "lax" (not "strict") so the OAuth challenge cookie is
    // included on cross-site top-level navigations (Google → Neon Auth → our app).
    // Without this, needsSessionVerification() always returns false and the
    // OAuth token exchange never completes.
    sameSite: 'lax',
    // sessionDataTtl: 300, // optional session_data cache TTL in seconds (default: 300)
  },
  // logLevel: 'silent', // disable Neon Auth logging
  // logLevel: 'debug',  // verbose proxy/upstream logging
});