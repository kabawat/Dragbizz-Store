import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/settings",
    "/admin",
    "/onboarding",
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get auth status from cookies
  const authToken = request.cookies.get("logged_in")?.value;

  // If protected route and no auth token → redirect to external login
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which paths the proxy should run on
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public/|manifest.json).*)",
  ],
};
