import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

const authMiddleware = auth.middleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: "/login",
});

export default async function proxy(request: NextRequest) {
  // Allow Server Actions to proceed without middleware interception
  if (request.headers.has("next-action") || request.headers.has("Next-Action")) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;

  // Check if it's a protected dashboard route
  const isDashboard = pathname.startsWith("/dashboard");

  // Check if the URL has the neon_auth_session_verifier parameter
  const hasVerifier = searchParams.has("neon_auth_session_verifier");

  if (isDashboard || hasVerifier) {
    const response = await authMiddleware(request);

    // If we had a session verifier and the middleware returns a redirect response,
    // we want to redirect the user to /dashboard instead of / (root) to complete
    // the login experience after a successful OAuth token exchange.
    if (
      hasVerifier &&
      response &&
      (response.status === 307 || response.status === 302 || response.status === 303)
    ) {
      const location = response.headers.get("location");

      // Only intercept the redirect when the OAuth exchange SUCCEEDED.
      // A redirect to /login means the exchange failed (e.g. expired verifier or
      // missing challenge cookie) — in that case we let the login redirect stand
      // so the user is not bounced into a protected page they cannot access.
      const isLoginRedirect =
        location && new URL(location, request.url).pathname.startsWith("/login");

      if (!isLoginRedirect) {
        const nextResponse = NextResponse.redirect(new URL("/dashboard", request.url));

        // Use getSetCookie() to properly copy every Set-Cookie header individually.
        // headers.forEach() merges multiple Set-Cookie values into one comma-separated
        // string, which breaks cookie parsing in the browser.
        for (const cookie of response.headers.getSetCookie()) {
          nextResponse.headers.append("set-cookie", cookie);
        }

        return nextResponse;
      }
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization)
    // - favicon.ico (favicon file)
    // - all files with extensions in the public folder (e.g. vercel.svg)
    "/((?!api|_next/static|_next/image|.*\\..*|favicon.ico).*)",
  ],
};