import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
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

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get the token from cookies
  const authToken = request.cookies.get('db_session_id')?.value;
  
  // Debug logging
  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Auth Token:', authToken ? 'Present' : 'Missing');
  console.log('Middleware - Is Protected Route:', isProtectedRoute);
  console.log('Middleware - Is Auth Route:', isAuthRoute);

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with a token, redirect to dashboard
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
