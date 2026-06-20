import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';

// PATCH /api/admin/uzytkownicy/[id] — zmień status aktywny/nieaktywny
export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/admin/uzytkownicy/[id]'>) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return Response.json({ error: 'Brak dostępu.' }, { status: 403 });
    }

    const { id } = await ctx.params;

    const { data: uzytkownik } = await supabase
        .from('uzytkownik')
        .select('id, aktywny')
        .eq('id', id)
        .single();

    if (!uzytkownik) return Response.json({ error: 'Nie znaleziono użytkownika.' }, { status: 404 });

    const { data, error } = await supabase
        .from('uzytkownik')
        .update({ aktywny: !uzytkownik.aktywny })
        .eq('id', id)
        .select('id, aktywny')
        .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ aktywny: data.aktywny });
}
