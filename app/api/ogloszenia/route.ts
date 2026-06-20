import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';
import { WOJEWODZTWA } from '@/lib/wojewodztwa';

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// zwraca listę ogłoszeń, można filtrować po nazwie, kategorii i województwie
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const nazwa = searchParams.get('nazwa') ?? '';
    const kategoria_id = searchParams.get('kategoria_id');
    const wojewodztwo = searchParams.get('wojewodztwo');
    const sort = searchParams.get('sort') ?? 'data_dodania';
    const order = searchParams.get('order') === 'asc' ? true : false;

    let query = supabase
        .from('ogloszenie')
        .select(`
            id, nazwa, opis, wartosc, data_dodania, status, oczekiwania, wojewodztwo,
            kategoria:kategoria_id(id, nazwa),
            zdjecia:zdjecie(id, sciezka, glowne)
        `)
        .eq('status', 'active');

    if (nazwa) query = query.ilike('nazwa', `%${nazwa}%`);
    if (kategoria_id) query = query.eq('kategoria_id', kategoria_id);
    if (wojewodztwo) query = query.eq('wojewodztwo', wojewodztwo);

    const allowedSort = ['wartosc', 'data_dodania'];
    const sortCol = allowedSort.includes(sort) ? sort : 'data_dodania';
    query = query.order(sortCol, { ascending: order });

    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ ogloszenia: data });
}

// dodawanie nowego ogłoszenia wraz ze zdjęciami
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'user') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 401 });
    }

    const formData = await req.formData();
    const nazwa = formData.get('nazwa') as string;
    const opis = formData.get('opis') as string;
    const wartosc = formData.get('wartosc') as string;
    const kategoria_id = formData.get('kategoria_id') as string;
    const oczekiwania = formData.get('oczekiwania') as string;
    const wojewodztwo = formData.get('wojewodztwo') as string;
    const files = formData.getAll('zdjecia') as File[];

    if (!nazwa || !opis || !wartosc || !kategoria_id || !wojewodztwo) {
        return Response.json({ error: 'Wymagane pola: nazwa, opis, wartość, kategoria, województwo.' }, { status: 400 });
    }

    if (!(WOJEWODZTWA as readonly string[]).includes(wojewodztwo)) {
        return Response.json({ error: 'Nieprawidłowe województwo.' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
        return Response.json({ error: `Maksymalnie ${MAX_FILES} zdjęć.` }, { status: 400 });
    }

    for (const file of files) {
        if (file.size > MAX_SIZE) {
            return Response.json({ error: `Plik "${file.name}" przekracza 5 MB.` }, { status: 400 });
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            return Response.json({ error: `Niedozwolony typ pliku: ${file.type}.` }, { status: 400 });
        }
    }

    const { data: ogloszenie, error: ogErr } = await supabase
        .from('ogloszenie')
        .insert({
            nazwa,
            opis,
            wartosc: parseFloat(wartosc),
            kategoria_id: parseInt(kategoria_id),
            uzytkownik_id: session.id,
            oczekiwania: oczekiwania || null,
            wojewodztwo,
            status: 'pending',
        })
        .select('id')
        .single();

    if (ogErr || !ogloszenie) {
        return Response.json({ error: 'Błąd zapisu ogłoszenia.' }, { status: 500 });
    }

    const zdjeciaInsert = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size === 0) continue;

        const ext = file.name.split('.').pop();
        const filename = `${randomUUID()}.${ext}`;

        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabase.storage
            .from('zdjecia')
            .upload(filename, buffer, { contentType: file.type });

        if (uploadError) {
            return Response.json({ error: `Błąd uploadu zdjęcia: ${uploadError.message}` }, { status: 500 });
        }

        const { data: urlData } = supabase.storage.from('zdjecia').getPublicUrl(filename);

        zdjeciaInsert.push({
            sciezka: urlData.publicUrl,
            glowne: i === 0,
            ogloszenie_id: ogloszenie.id,
        });
    }

    if (zdjeciaInsert.length > 0) {
        await supabase.from('zdjecie').insert(zdjeciaInsert);
    }

    return Response.json({ id: ogloszenie.id }, { status: 201 });
}
