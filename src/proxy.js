import { NextResponse } from "next/server";
import { checkSubdomainPublicRedirect, getDomainInfo } from "@dragorbit/core/domain";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin",
  "/onboarding",
];

export function proxy(request) {
  const redirectCheck = checkSubdomainPublicRedirect(request);
  if (redirectCheck.shouldRedirect) {
    return NextResponse.redirect(redirectCheck.targetUrl, redirectCheck.statusCode);
  }

  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const hasAuth =
    request.cookies.get("logged_in")?.value === "true" ||
    request.cookies.get("rt")?.value ||
    request.cookies.get("at")?.value;

  if (isProtected && !hasAuth) {
    const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "") || "http";
    const { apexHost } = getDomainInfo(request);
    const loginUrl = new URL(`${proto}://${apexHost}/login`);
    loginUrl.searchParams.set("redirect", pathname + (request.nextUrl.search || ""));
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public/|manifest.json).*)",
  ],
};

