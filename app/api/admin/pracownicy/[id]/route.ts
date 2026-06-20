import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';

// PATCH /api/admin/pracownicy/[id] — edytuj pracownika
export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/admin/pracownicy/[id]'>) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const { nazwa_uzytkownika, email, haslo, numer_telefonu, poziom_uprawnien } = body;

    if (poziom_uprawnien && !['moderator', 'admin'].includes(poziom_uprawnien)) {
        return Response.json({ error: 'Nieprawidłowy poziom uprawnień.' }, { status: 400 });
    }

    const updates: Record<string, string> = {};
    if (nazwa_uzytkownika) updates.nazwa_uzytkownika = nazwa_uzytkownika;
    if (email) updates.email = email;
    if (numer_telefonu) updates.numer_telefonu = numer_telefonu;
    if (poziom_uprawnien) updates.poziom_uprawnien = poziom_uprawnien;
    if (haslo) {
        if (haslo.length < 8) {
            return Response.json({ error: 'Hasło musi mieć co najmniej 8 znaków.' }, { status: 400 });
        }
        updates.haslo_hash = await bcrypt.hash(haslo, 12);
    }

    if (!Object.keys(updates).length) {
        return Response.json({ error: 'Brak danych do aktualizacji.' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('pracownik')
        .update(updates)
        .eq('id', id)
        .select('id, nazwa_uzytkownika, email, numer_telefonu, poziom_uprawnien')
        .single();

    if (error || !data) {
        return Response.json({ error: 'Nie znaleziono pracownika.' }, { status: 404 });
    }

    return Response.json({ pracownik: data });
}

// DELETE /api/admin/pracownicy/[id]
export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/pracownicy/[id]'>) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 403 });
    }

    const { id } = await ctx.params;

    // Admin nie może usunąć sam siebie
    if (parseInt(id) === session.id) {
        return Response.json({ error: 'Nie możesz usunąć własnego konta.' }, { status: 400 });
    }

    const { error } = await supabase.from('pracownik').delete().eq('id', id);

    if (error) return Response.json({ error: 'Błąd usuwania pracownika.' }, { status: 500 });

    return Response.json({ ok: true });
}
