import { NextResponse } from 'next/server';
import ENV_CONFIG from './config/env.config';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin'
  ];

  // Define onboarding routes that require auth token
  const onboardingRoutes = [
    '/onboarding'
  ];

  // Define auth routes that should redirect if already authenticated
  const authRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is an onboarding route
  const isOnboardingRoute = onboardingRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get both tokens from cookies
  const authToken = request.cookies.get(ENV_CONFIG.AUTH.AUTH_TOKEN_KEY)?.value;
  const retailerToken = request.cookies.get(ENV_CONFIG.AUTH.RETAILER_TOKEN_KEY)?.value;


  // For protected routes, we need at least the auth token
  // Retailer token is optional and can be refreshed later
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For onboarding routes, we need auth token
  if (isOnboardingRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with auth token, redirect to dashboard
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
