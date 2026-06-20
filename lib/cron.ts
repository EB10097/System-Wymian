import supabase from '@/lib/db';

export async function zamknijPrzeterminowane(): Promise<{ zamkniete: number[]; error?: string }> {
    const { data, error } = await supabase
        .from('ogloszenie')
        .update({ status: 'closed', powod_zamkniecia: 'closed_by_cron' })
        .eq('status', 'active')
        .lte('data_zamkniecia', new Date().toISOString())
        .select('id');

    if (error) return { zamkniete: [], error: error.message };
    return { zamkniete: (data ?? []).map((r: { id: number }) => r.id) };
}
