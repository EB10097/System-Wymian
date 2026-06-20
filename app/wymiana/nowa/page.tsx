import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';
import Navbar from '@/components/Navbar';
import NowaWymianaForm from './NowaWymianaForm';

export default async function NowaWymianaPage({
    searchParams,
}: {
    searchParams: Promise<{ ogloszenie?: string }>;
}) {
    const session = await getSession();
    if (!session || session.role !== 'user') redirect('/login');

    const { ogloszenie: ogloszenieId } = await searchParams;
    if (!ogloszenieId) notFound();

    // Ogłoszenie docelowe
    const { data: cel } = await supabase
        .from('ogloszenie')
        .select('id, nazwa, wartosc, uzytkownik:uzytkownik_id(nazwa_uzytkownika), zdjecia:zdjecie(sciezka, glowne)')
        .eq('id', ogloszenieId)
        .eq('status', 'active')
        .single();

    if (!cel) notFound();

    // Własne aktywne ogłoszenia użytkownika
    const { data: mojeOgloszenia } = await supabase
        .from('ogloszenie')
        .select('id, nazwa, wartosc, zdjecia:zdjecie(sciezka, glowne)')
        .eq('uzytkownik_id', session.id)
        .eq('status', 'active');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar session={session} />
            <div className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold text-black mb-2">Zaproponuj wymianę</h1>
                <p className="text-sm text-black mb-8">
                    Wybierz swoje ogłoszenie, które chcesz zaoferować w zamian.
                </p>

                {/* Ogłoszenie docelowe */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <p className="text-xs font-semibold text-black uppercase mb-2">Chcesz otrzymać</p>
                    <OgloszeniePreview ogloszenie={cel as any} />
                </div>

                {!mojeOgloszenia?.length ? (
                    <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-6 text-center text-sm text-yellow-700">
                        Nie masz żadnych aktywnych ogłoszeń. Najpierw{' '}
                        <a href="/ogloszenia/nowe" className="underline font-medium">dodaj ogłoszenie</a>.
                    </div>
                ) : (
                    <NowaWymianaForm
                        ogloszenieId={parseInt(ogloszenieId)}
                        mojeOgloszenia={mojeOgloszenia as any}
                    />
                )}
            </div>
        </div>
    );
}

function OgloszeniePreview({ ogloszenie }: { ogloszenie: any }) {
    const glowne = ogloszenie.zdjecia?.find((z: any) => z.glowne) ?? ogloszenie.zdjecia?.[0];
    return (
        <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {glowne ? (
                    <img src={glowne.sciezka} alt={ogloszenie.nazwa} className="w-full h-full object-cover" />
                ) : null}
            </div>
            <div>
                <p className="font-semibold text-black">{ogloszenie.nazwa}</p>
                <p className="text-sm text-black">
                    {ogloszenie.wartosc} zł · {ogloszenie.uzytkownik?.nazwa_uzytkownika}
                </p>
            </div>
        </div>
    );
}
