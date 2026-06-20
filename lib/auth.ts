import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // tydzień

export type JwtPayload = {
    id: number;
    email: string;
    nazwa_uzytkownika: string;
    role: 'user' | 'moderator' | 'admin';
};

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<JwtPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
}

export function cookieOptions(token: string) {
    return {
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    };
}

export function clearCookieOptions() {
    return {
        name: COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 0,
        path: '/',
    };
}
