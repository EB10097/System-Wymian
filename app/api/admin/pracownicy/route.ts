import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';

// GET /api/admin/pracownicy
export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('pracownik')
        .select('id, nazwa_uzytkownika, email, numer_telefonu, poziom_uprawnien')
        .order('id');

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ pracownicy: data });
}

// POST /api/admin/pracownicy — utwórz nowego pracownika
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 403 });
    }

    const { nazwa_uzytkownika, email, haslo, numer_telefonu, poziom_uprawnien } = await req.json();

    if (!nazwa_uzytkownika || !email || !haslo || !numer_telefonu || !poziom_uprawnien) {
        return Response.json({ error: 'Wszystkie pola są wymagane.' }, { status: 400 });
    }

    if (!['moderator', 'admin'].includes(poziom_uprawnien)) {
        return Response.json({ error: 'Nieprawidłowy poziom uprawnień.' }, { status: 400 });
    }

    if (haslo.length < 8) {
        return Response.json({ error: 'Hasło musi mieć co najmniej 8 znaków.' }, { status: 400 });
    }

    const { data: existing } = await supabase
        .from('pracownik')
        .select('id')
        .or(`email.eq.${email},nazwa_uzytkownika.eq.${nazwa_uzytkownika}`)
        .maybeSingle();

    if (existing) {
        return Response.json({ error: 'Pracownik z tym e-mailem lub nazwą już istnieje.' }, { status: 409 });
    }

    const haslo_hash = await bcrypt.hash(haslo, 12);

    const { data, error } = await supabase
        .from('pracownik')
        .insert({ nazwa_uzytkownika, email, haslo_hash, numer_telefonu, poziom_uprawnien })
        .select('id, nazwa_uzytkownika, email, poziom_uprawnien')
        .single();

    if (error || !data) {
        return Response.json({ error: 'Błąd tworzenia konta.' }, { status: 500 });
    }

    return Response.json({ pracownik: data }, { status: 201 });
}
