import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';

const DNI_PRZED_KONCEM = 7;

// przedłużenie ogłoszenia o 30 dni, dostępne tylko w ostatnim tygodniu
export async function POST(_req: NextRequest, ctx: RouteContext<'/api/ogloszenia/[id]/przedluz'>) {
    const session = await getSession();
    if (!session || session.role !== 'user') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 401 });
    }

    const { id } = await ctx.params;

    const { data: ogloszenie } = await supabase
        .from('ogloszenie')
        .select('id, uzytkownik_id, status, data_zamkniecia')
        .eq('id', id)
        .single();

    if (!ogloszenie) return Response.json({ error: 'Nie znaleziono ogłoszenia.' }, { status: 404 });
    if (ogloszenie.uzytkownik_id !== session.id) return Response.json({ error: 'Brak uprawnień.' }, { status: 403 });
    if (ogloszenie.status !== 'active') return Response.json({ error: 'Można przedłużyć tylko aktywne ogłoszenie.' }, { status: 400 });

    // przedłużenie możliwe tylko jeśli zostało mniej niż 7 dni
    const dataZamkniecia = new Date(ogloszenie.data_zamkniecia);
    const teraz = new Date();
    const dniDoKonca = Math.ceil((dataZamkniecia.getTime() - teraz.getTime()) / (1000 * 60 * 60 * 24));

    if (dniDoKonca > DNI_PRZED_KONCEM) {
        return Response.json(
            { error: `Przedłużenie możliwe dopiero gdy zostanie mniej niż ${DNI_PRZED_KONCEM} dni do końca.` },
            { status: 400 }
        );
    }

    // liczymy od starej daty żeby nie gubić dni
    const nowaData = new Date(dataZamkniecia);
    nowaData.setDate(nowaData.getDate() + 30);

    await supabase
        .from('ogloszenie')
        .update({ data_zamkniecia: nowaData.toISOString() })
        .eq('id', id);

    return Response.json({ ok: true, data_zamkniecia: nowaData.toISOString() });
}
