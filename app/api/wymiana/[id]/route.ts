import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';

// POST /api/wymiana/[id] — akceptuj lub odrzuć propozycję
export async function POST(req: NextRequest, ctx: RouteContext<'/api/wymiana/[id]'>) {
    const session = await getSession();
    if (!session || session.role !== 'user') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const { akcja } = await req.json();

    if (!['akceptuj', 'odrzuc'].includes(akcja)) {
        return Response.json({ error: 'Nieprawidłowa akcja.' }, { status: 400 });
    }

    const { data: prosba } = await supabase
        .from('prosba_wymiany')
        .select(`
            id, status, uzytkownik_id, ogloszenie_id, ogloszenie_id2,
            ogloszenie:ogloszenie_id(id, uzytkownik_id)
        `)
        .eq('id', id)
        .single();

    if (!prosba) return Response.json({ error: 'Nie znaleziono propozycji.' }, { status: 404 });
    if (prosba.status !== 'pending') return Response.json({ error: 'Propozycja już została rozpatrzona.' }, { status: 400 });

    // Tylko właściciel ogłoszenia docelowego może odpowiadać
    const celOgloszenie = prosba.ogloszenie as unknown as { id: number; uzytkownik_id: number };
    if (celOgloszenie.uzytkownik_id !== session.id) {
        return Response.json({ error: 'Brak uprawnień.' }, { status: 403 });
    }

    const nowyStatus = akcja === 'akceptuj' ? 'accepted' : 'rejected';
    const teraz = new Date().toISOString();

    await supabase
        .from('prosba_wymiany')
        .update({ status: nowyStatus, data_odpowiedzi: teraz })
        .eq('id', id);

    if (akcja === 'akceptuj') {
        // Zamknij oba ogłoszenia uczestniczące w wymianie
        await supabase
            .from('ogloszenie')
            .update({ status: 'closed' })
            .in('id', [prosba.ogloszenie_id, prosba.ogloszenie_id2]);

        // Odrzuć wszystkie inne oczekujące propozycje na te dwa ogłoszenia
        await supabase
            .from('prosba_wymiany')
            .update({ status: 'rejected', data_odpowiedzi: teraz })
            .neq('id', prosba.id)
            .eq('status', 'pending')
            .or(
                `ogloszenie_id.eq.${prosba.ogloszenie_id},ogloszenie_id2.eq.${prosba.ogloszenie_id},ogloszenie_id.eq.${prosba.ogloszenie_id2},ogloszenie_id2.eq.${prosba.ogloszenie_id2}`
            );
    }

    return Response.json({ ok: true, status: nowyStatus });
}
