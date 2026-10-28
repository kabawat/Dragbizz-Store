import { NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin",
  "/onboarding",
];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const hasAuth =
    request.cookies.get("logged_in")?.value === "true" ||
    request.cookies.get("rt")?.value ||
    request.cookies.get("at")?.value;

  if (isProtected && !hasAuth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "redirect",
      pathname + (request.nextUrl.search || "")
    );
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive, nosnippet"
  );
  return response;
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public/|manifest.json).*)",
  ],
};
