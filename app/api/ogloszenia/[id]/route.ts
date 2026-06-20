import { NextRequest } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';

// pojedyncze ogłoszenie po id
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/ogloszenia/[id]'>) {
    const { id } = await ctx.params;

    const { data, error } = await supabase
        .from('ogloszenie')
        .select(`
            id, nazwa, opis, wartosc, data_dodania, data_zamkniecia, status, oczekiwania,
            kategoria:kategoria_id(id, nazwa),
            uzytkownik:uzytkownik_id(id, nazwa_uzytkownika),
            zdjecia:zdjecie(id, sciezka, glowne)
        `)
        .eq('id', id)
        .single();

    if (error || !data) return Response.json({ error: 'Nie znaleziono ogłoszenia.' }, { status: 404 });

    return Response.json({ ogloszenie: data });
}

// usuwanie ogłoszenia - właściciel lub admin/moderator
export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/ogloszenia/[id]'>) {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Brak dostępu.' }, { status: 401 });

    const { id } = await ctx.params;

    const { data: ogloszenie } = await supabase
        .from('ogloszenie')
        .select('id, uzytkownik_id, status, zdjecie(sciezka)')
        .eq('id', id)
        .single();

    if (!ogloszenie) return Response.json({ error: 'Nie znaleziono.' }, { status: 404 });

    if (ogloszenie.status === 'closed') {
        return Response.json({ error: 'Nie można usunąć zamkniętego ogłoszenia.' }, { status: 400 });
    }

    const isOwner = session.role === 'user' && ogloszenie.uzytkownik_id === session.id;
    const isStaff = session.role === 'admin' || session.role === 'moderator';

    if (!isOwner && !isStaff) {
        return Response.json({ error: 'Brak uprawnień.' }, { status: 403 });
    }

    // usuwamy też zdjęcia żeby nie zaśmiecać serwera
    const zdjecia = (ogloszenie.zdjecie ?? []) as { sciezka: string }[];
    for (const z of zdjecia) {
        const filepath = path.join(process.cwd(), 'public', z.sciezka);
        await unlink(filepath).catch(() => null);
    }

    await supabase.from('ogloszenie').delete().eq('id', id);

    return Response.json({ ok: true });
}

// ręczne zamknięcie ogłoszenia przez właściciela
export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/ogloszenia/[id]'>) {
    const session = await getSession();
    if (!session || session.role !== 'user') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 401 });
    }

    const { id } = await ctx.params;

    const { data: ogloszenie } = await supabase
        .from('ogloszenie')
        .select('id, uzytkownik_id, status')
        .eq('id', id)
        .single();

    if (!ogloszenie) return Response.json({ error: 'Nie znaleziono.' }, { status: 404 });
    if (ogloszenie.uzytkownik_id !== session.id) return Response.json({ error: 'Brak uprawnień.' }, { status: 403 });
    if (ogloszenie.status !== 'active') return Response.json({ error: 'Można zamknąć tylko aktywne ogłoszenie.' }, { status: 400 });

    await supabase
        .from('ogloszenie')
        .update({ status: 'closed', powod_zamkniecia: 'closed_by_user' })
        .eq('id', id);

    return Response.json({ ok: true });
}
