import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('uzytkownik')
        .select('id, nazwa_uzytkownika, email, numer_telefonu, data_rejestracji, aktywny')
        .order('data_rejestracji', { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ uzytkownicy: data });
}
