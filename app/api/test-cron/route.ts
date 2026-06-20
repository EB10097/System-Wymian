/**
 * ENDPOINT TESTOWY — tylko do weryfikacji działania crona.
 * Usuń ten plik po zakończeniu testów.
 *
 * POST /api/test-cron  { secret, action }
 *   action: "run"    — tworzy scenariusz testowy i uruchamia crona
 *   action: "reset"  — przywraca ogłoszenie testowe do statusu active
 */

import { NextRequest } from 'next/server';
import supabase from '@/lib/db';
import { zamknijPrzeterminowane } from '@/lib/cron';

const TEST_SECRET = process.env.TEST_CRON_SECRET ?? 'test-cron-2026';
const TEST_OG_ID = 6; // id ogłoszenia użytego w teście

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    if (body.secret !== TEST_SECRET) {
        return Response.json({ error: 'Brak dostępu.' }, { status: 403 });
    }

    // Reset — przywróć ogłoszenie testowe
    if (body.action === 'reset') {
        const za30dni = new Date();
        za30dni.setDate(za30dni.getDate() + 30);
        await supabase
            .from('ogloszenie')
            .update({ status: 'active', powod_zamkniecia: null, data_zamkniecia: za30dni.toISOString() })
            .eq('id', TEST_OG_ID);
        const { data } = await supabase.from('ogloszenie').select('id,status,powod_zamkniecia,data_zamkniecia').eq('id', TEST_OG_ID).single();
        return Response.json({ reset: true, stan: data });
    }

    // Run — pełny test
    const raport: Record<string, unknown> = {};

    const { data: aktywne } = await supabase
        .from('ogloszenie')
        .select('id, nazwa, status, data_zamkniecia, powod_zamkniecia')
        .eq('status', 'active')
        .limit(1)
        .single();

    if (!aktywne) return Response.json({ error: 'Brak aktywnych ogłoszeń do testu.' }, { status: 404 });

    raport.krok1_znalezione_ogloszenie = { id: aktywne.id, nazwa: aktywne.nazwa, status_przed: aktywne.status, data_zamkniecia_przed: aktywne.data_zamkniecia };

    const wczoraj = new Date();
    wczoraj.setDate(wczoraj.getDate() - 1);
    await supabase.from('ogloszenie').update({ data_zamkniecia: wczoraj.toISOString() }).eq('id', aktywne.id);
    raport.krok2_data_ustawiona_na = wczoraj.toISOString();

    const { zamkniete, error: cronError } = await zamknijPrzeterminowane();
    raport.krok3_wynik_crona = { zamkniete_ids: zamkniete, error: cronError ?? null };

    const { data: po } = await supabase.from('ogloszenie').select('id, nazwa, status, data_zamkniecia, powod_zamkniecia').eq('id', aktywne.id).single();
    raport.krok4_stan_po_cronie = po;

    const ok = po?.status === 'closed' && po?.powod_zamkniecia === 'closed_by_cron' && zamkniete.includes(aktywne.id);
    raport.krok5_weryfikacja = {
        status_closed: po?.status === 'closed',
        powod_closed_by_cron: po?.powod_zamkniecia === 'closed_by_cron',
        id_w_liscie: zamkniete.includes(aktywne.id),
        TEST_ZALICZONY: ok,
    };

    return Response.json(raport, { status: ok ? 200 : 500 });
}
