import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CONSTANTS } from './app/utils/constants/constants';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get(CONSTANTS.AUTH_TOKEN_KEY)?.value;
    const publicRoutes = ['/login'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (!isPublicRoute && pathname !== '/' && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isPublicRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
};