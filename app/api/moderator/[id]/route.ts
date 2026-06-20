import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';

// POST /api/moderator/[id] — akceptuj lub odrzuć ogłoszenie
export async function POST(req: NextRequest, ctx: RouteContext<'/api/moderator/[id]'>) {
    const session = await getSession();
    if (!session || !['moderator', 'admin'].includes(session.role)) {
        return Response.json({ error: 'Brak dostępu.' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const { akcja, powod } = await req.json();

    if (!['akceptuj', 'odrzuc'].includes(akcja)) {
        return Response.json({ error: 'Nieprawidłowa akcja.' }, { status: 400 });
    }

    if (akcja === 'odrzuc' && !powod?.trim()) {
        return Response.json({ error: 'Podaj powód odrzucenia.' }, { status: 400 });
    }

    const { data: ogloszenie } = await supabase
        .from('ogloszenie')
        .select('id, status')
        .eq('id', id)
        .single();

    if (!ogloszenie) return Response.json({ error: 'Nie znaleziono ogłoszenia.' }, { status: 404 });
    if (ogloszenie.status !== 'pending') {
        return Response.json({ error: 'Ogłoszenie nie oczekuje na moderację.' }, { status: 400 });
    }

    if (akcja === 'akceptuj') {
        const dataZamkniecia = new Date();
        dataZamkniecia.setDate(dataZamkniecia.getDate() + 30);

        await supabase
            .from('ogloszenie')
            .update({ status: 'active', data_zamkniecia: dataZamkniecia.toISOString() })
            .eq('id', id);

        await supabase.from('log_weryfikacji').insert({
            status: 'accepted',
            opis_decyzji: null,
            pracownik_id: session.id,
            ogloszenie_id: parseInt(id),
        });
    } else {
        await supabase
            .from('ogloszenie')
            .update({ status: 'rejected' })
            .eq('id', id);

        await supabase.from('log_weryfikacji').insert({
            status: 'rejected',
            opis_decyzji: powod.trim(),
            pracownik_id: session.id,
            ogloszenie_id: parseInt(id),
        });
    }

    return Response.json({ ok: true });
}
