import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';
import Navbar from '@/components/Navbar';
import ModeracjaKarta from './ModeracjaKarta';

export default async function ModeratorPage() {
    const session = await getSession();
    if (!session || !['moderator', 'admin'].includes(session.role)) redirect('/');

    const { data: oczekujace } = await supabase
        .from('ogloszenie')
        .select(`
            id, nazwa, opis, wartosc, data_dodania, oczekiwania,
            kategoria:kategoria_id(nazwa),
            uzytkownik:uzytkownik_id(id, nazwa_uzytkownika, email),
            zdjecia:zdjecie(sciezka, glowne)
        `)
        .eq('status', 'pending')
        .order('data_dodania', { ascending: true });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar session={session} />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-black">Panel moderatora</h1>
                    <p className="text-sm text-black mt-1">
                        Ogłoszenia oczekujące na akceptację:{' '}
                        <span className="font-semibold text-black">{oczekujace?.length ?? 0}</span>
                    </p>
                </div>

                {!oczekujace?.length ? (
                    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-12 text-center text-black">
                        Brak ogłoszeń oczekujących na moderację.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {oczekujace.map((og: any) => (
                            <ModeracjaKarta key={og.id} ogloszenie={og} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
