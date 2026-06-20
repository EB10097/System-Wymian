import { cookies } from 'next/headers';
import { clearCookieOptions } from '@/lib/auth';

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.set(clearCookieOptions());
    return Response.json({ ok: true });
}
