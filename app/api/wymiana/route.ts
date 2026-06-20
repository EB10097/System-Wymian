import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';

// POST /api/wymiana — złóż propozycję wymiany
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'user') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 401 });
    }

    const { ogloszenie_id, ogloszenie_id2 } = await req.json();

    if (!ogloszenie_id || !ogloszenie_id2) {
        return Response.json({ error: 'Podaj oba ogłoszenia.' }, { status: 400 });
    }

    if (ogloszenie_id === ogloszenie_id2) {
        return Response.json({ error: 'Nie możesz wymienić ogłoszenia z samym sobą.' }, { status: 400 });
    }

    // Ogłoszenie docelowe (użytkownika B) musi być aktywne
    const { data: cel } = await supabase
        .from('ogloszenie')
        .select('id, uzytkownik_id, status')
        .eq('id', ogloszenie_id)
        .single();

    if (!cel || cel.status !== 'active') {
        return Response.json({ error: 'Ogłoszenie docelowe nie jest aktywne.' }, { status: 400 });
    }

    if (cel.uzytkownik_id === session.id) {
        return Response.json({ error: 'Nie możesz zaproponować wymiany na własne ogłoszenie.' }, { status: 400 });
    }

    // Ogłoszenie oferowane (użytkownika A) musi być jego aktywne
    const { data: oferta } = await supabase
        .from('ogloszenie')
        .select('id, uzytkownik_id, status')
        .eq('id', ogloszenie_id2)
        .single();

    if (!oferta || oferta.status !== 'active') {
        return Response.json({ error: 'Twoje ogłoszenie musi być aktywne.' }, { status: 400 });
    }

    if (oferta.uzytkownik_id !== session.id) {
        return Response.json({ error: 'To nie jest Twoje ogłoszenie.' }, { status: 403 });
    }

    // Sprawdź czy propozycja już istnieje
    const { data: istniejaca } = await supabase
        .from('prosba_wymiany')
        .select('id')
        .eq('uzytkownik_id', session.id)
        .eq('ogloszenie_id', ogloszenie_id)
        .eq('ogloszenie_id2', ogloszenie_id2)
        .eq('status', 'pending')
        .maybeSingle();

    if (istniejaca) {
        return Response.json({ error: 'Już wysłałeś propozycję wymiany tego ogłoszenia.' }, { status: 409 });
    }

    const { data, error } = await supabase
        .from('prosba_wymiany')
        .insert({
            uzytkownik_id: session.id,
            ogloszenie_id,
            ogloszenie_id2,
            status: 'pending',
        })
        .select('id')
        .single();

    if (error || !data) {
        return Response.json({ error: 'Błąd zapisu propozycji.' }, { status: 500 });
    }

    return Response.json({ id: data.id }, { status: 201 });
}
