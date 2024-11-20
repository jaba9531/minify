import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('spotify-token')?.value;
  const url = request.nextUrl.clone();
  if (!token && url.pathname !== '/login') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (token && url.pathname === '/login') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Define the paths the middleware applies to
export const config = {
  matcher: ['/', '/login'],
};
