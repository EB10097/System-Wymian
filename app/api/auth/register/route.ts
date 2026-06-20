import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import supabase from '@/lib/db';
import { signToken, cookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { nazwa_uzytkownika, email, haslo, numer_telefonu } = body;

    if (!nazwa_uzytkownika || !email || !haslo || !numer_telefonu) {
        return Response.json({ error: 'Wszystkie pola są wymagane.' }, { status: 400 });
    }

    if (haslo.length < 8) {
        return Response.json({ error: 'Hasło musi mieć co najmniej 8 znaków.' }, { status: 400 });
    }

    // czy ktoś już ma taki email albo nazwę
    const { data: existing } = await supabase
        .from('uzytkownik')
        .select('id')
        .or(`email.eq.${email},nazwa_uzytkownika.eq.${nazwa_uzytkownika}`)
        .maybeSingle();

    if (existing) {
        return Response.json({ error: 'Użytkownik z tym e-mailem lub nazwą już istnieje.' }, { status: 409 });
    }

    const haslo_hash = await bcrypt.hash(haslo, 12);

    const { data: user, error } = await supabase
        .from('uzytkownik')
        .insert({ nazwa_uzytkownika, email, haslo_hash, numer_telefonu })
        .select('id, email, nazwa_uzytkownika')
        .single();

    if (error || !user) {
        return Response.json({ error: 'Błąd podczas tworzenia konta.' }, { status: 500 });
    }

    const token = signToken({ id: user.id, email: user.email, nazwa_uzytkownika: user.nazwa_uzytkownika, role: 'user' });
    const cookieStore = await cookies();
    cookieStore.set(cookieOptions(token));

    return Response.json({ user: { id: user.id, email: user.email, nazwa_uzytkownika: user.nazwa_uzytkownika } }, { status: 201 });
}
