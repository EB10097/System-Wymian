import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';
import Navbar from '@/components/Navbar';
import WymianaKarta from './WymianaKarta';

export default async function WymianaPage() {
    const session = await getSession();
    if (!session || session.role !== 'user') redirect('/login');

    // Pobierz IDs własnych ogłoszeń użytkownika
    const { data: mojeIds } = await supabase
        .from('ogloszenie')
        .select('id')
        .eq('uzytkownik_id', session.id);

    const idList = (mojeIds ?? []).map((o: any) => o.id);

    // Przychodzące — ktoś chce coś od użytkownika
    const { data: przychodzace } = idList.length
        ? await supabase
            .from('prosba_wymiany')
            .select(`
                id, status, data_wyslania, data_odpowiedzi,
                nadawca:uzytkownik_id(id, nazwa_uzytkownika, numer_telefonu),
                cel:ogloszenie_id(id, nazwa, wartosc, zdjecia:zdjecie(sciezka, glowne)),
                oferta:ogloszenie_id2(id, nazwa, wartosc, zdjecia:zdjecie(sciezka, glowne))
            `)
            .in('ogloszenie_id', idList)
            .order('data_wyslania', { ascending: false })
        : { data: [] };

    // Wychodzące — użytkownik coś zaproponował
    const { data: wychodzace } = await supabase
        .from('prosba_wymiany')
        .select(`
            id, status, data_wyslania, data_odpowiedzi,
            cel:ogloszenie_id(id, nazwa, wartosc, uzytkownik:uzytkownik_id(id, nazwa_uzytkownika, numer_telefonu), zdjecia:zdjecie(sciezka, glowne)),
            oferta:ogloszenie_id2(id, nazwa, wartosc, zdjecia:zdjecie(sciezka, glowne))
        `)
        .eq('uzytkownik_id', session.id)
        .order('data_wyslania', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar session={session} />

            <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
                <section>
                    <h2 className="text-lg font-bold text-black mb-4">
                        Przychodzące propozycje{' '}
                        <span className="text-sm font-normal text-black">({przychodzace?.length ?? 0})</span>
                    </h2>
                    {!przychodzace?.length ? (
                        <p className="text-sm text-black bg-white rounded-xl border p-6 text-center">
                            Brak przychodzących propozycji wymiany.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {przychodzace.map((p: any) => (
                                <WymianaKarta key={p.id} prosba={p} typ="przychodzaca" />
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-bold text-black mb-4">
                        Moje propozycje{' '}
                        <span className="text-sm font-normal text-black">({wychodzace?.length ?? 0})</span>
                    </h2>
                    {!wychodzace?.length ? (
                        <p className="text-sm text-black bg-white rounded-xl border p-6 text-center">
                            Nie wysłałeś jeszcze żadnych propozycji.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {wychodzace.map((p: any) => (
                                <WymianaKarta key={p.id} prosba={p} typ="wychodzaca" />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
