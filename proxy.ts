import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/', '/login', '/register', '/ogloszenia'];

const MODERATOR_PATHS = ['/moderator'];
const ADMIN_PATHS = ['/admin'];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // api samo sprawdza tokeny, middleware nie musi tego robić
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    const isPublicPage = PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith('/ogloszenia/');

    if (isPublicPage) {
        return NextResponse.next();
    }

    const token = req.cookies.get('token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && session.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (MODERATOR_PATHS.some((p) => pathname.startsWith(p)) && !['moderator', 'admin'].includes(session.role)) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public/|uploads/).*)'],
};
