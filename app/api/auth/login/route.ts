import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import supabase from '@/lib/db';
import { signToken, cookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, haslo } = body;

    if (!email || !haslo) {
        return Response.json({ error: 'E-mail i hasło są wymagane.' }, { status: 400 });
    }

    // najpierw szukamy w tabeli użytkowników
    const { data: user } = await supabase
        .from('uzytkownik')
        .select('id, email, nazwa_uzytkownika, haslo_hash, aktywny')
        .eq('email', email)
        .maybeSingle();

    if (user) {
        if (!user.aktywny) {
            return Response.json({ error: 'Konto jest nieaktywne.' }, { status: 403 });
        }

        const ok = await bcrypt.compare(haslo, user.haslo_hash);
        if (ok) {
            const token = signToken({ id: user.id, email: user.email, nazwa_uzytkownika: user.nazwa_uzytkownika, role: 'user' });
            const cookieStore = await cookies();
            cookieStore.set(cookieOptions(token));
            return Response.json({ user: { id: user.id, email: user.email, nazwa_uzytkownika: user.nazwa_uzytkownika, role: 'user' } });
        }

        return Response.json({ error: 'Nieprawidłowe hasło.' }, { status: 401 });
    }

    // nie znaleziono w uzytkownik, może to pracownik/moderator
    const { data: pracownik } = await supabase
        .from('pracownik')
        .select('id, email, nazwa_uzytkownika, haslo_hash, poziom_uprawnien')
        .eq('email', email)
        .maybeSingle();

    if (pracownik) {
        const ok = await bcrypt.compare(haslo, pracownik.haslo_hash);
        if (ok) {
            const role = pracownik.poziom_uprawnien as 'moderator' | 'admin';
            const token = signToken({ id: pracownik.id, email: pracownik.email, nazwa_uzytkownika: pracownik.nazwa_uzytkownika, role });
            const cookieStore = await cookies();
            cookieStore.set(cookieOptions(token));
            return Response.json({ user: { id: pracownik.id, email: pracownik.email, nazwa_uzytkownika: pracownik.nazwa_uzytkownika, role } });
        }

        return Response.json({ error: 'Nieprawidłowe hasło.' }, { status: 401 });
    }

    return Response.json({ error: 'Nieprawidłowy adres e-mail.' }, { status: 401 });
}
