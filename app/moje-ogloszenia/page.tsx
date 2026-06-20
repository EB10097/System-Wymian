import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';
import Navbar from '@/components/Navbar';

const STATUS_LABEL: Record<string, string> = {
    pending: 'Oczekuje na moderację',
    active: 'Aktywne',
    closed: 'Zamknięte',
    rejected: 'Odrzucone',
};

const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-black',
    rejected: 'bg-red-100 text-red-700',
};

export default async function MojeOgloszeniaPage() {
    const session = await getSession();
    if (!session || session.role !== 'user') redirect('/login');

    const { data: ogloszenia } = await supabase
        .from('ogloszenie')
        .select(`
            id, nazwa, wartosc, status, data_dodania, data_zamkniecia, powod_zamkniecia,
            kategoria:kategoria_id(nazwa),
            zdjecia:zdjecie(sciezka, glowne),
            logi:log_weryfikacji(status, opis_decyzji, data_weryfikacji)
        `)
        .eq('uzytkownik_id', session.id)
        .order('data_dodania', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar session={session} />

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-black">Moje ogłoszenia</h1>
                    <Link
                        href="/ogloszenia/nowe"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                        + Dodaj ogłoszenie
                    </Link>
                </div>

                {!ogloszenia?.length ? (
                    <div className="text-center py-16 text-black">
                        <p>Nie masz jeszcze żadnych ogłoszeń.</p>
                        <Link href="/ogloszenia/nowe" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
                            Dodaj pierwsze ogłoszenie
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ogloszenia.map((og: any) => {
                            const glowne = og.zdjecia?.find((z: any) => z.glowne) ?? og.zdjecia?.[0];
                            const logOdrzucenia = og.status === 'rejected'
                                ? og.logi?.find((l: any) => l.status === 'rejected')
                                : null;

                            return (
                                <div key={og.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <Link
                                        href={`/ogloszenia/${og.id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                            {glowne ? (
                                                <img src={glowne.sciezka} alt={og.nazwa} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-black text-xs">Brak</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="font-semibold text-black truncate">{og.nazwa}</h2>
                                            <p className="text-sm text-black">{(og.kategoria as any)?.nazwa} · {og.wartosc} zł</p>
                                            <p className="text-xs text-black">{new Date(og.data_dodania).toLocaleDateString('pl-PL')}</p>
                                        </div>
                                        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[og.status]}`}>
                                            {STATUS_LABEL[og.status]}
                                        </span>
                                    </Link>

                                    {/* Powiadomienie o odrzuceniu */}
                                    {logOdrzucenia?.opis_decyzji && (
                                        <div className="border-t border-red-100 bg-red-50 px-4 py-3">
                                            <p className="text-xs font-semibold text-red-700 mb-0.5">Powód odrzucenia:</p>
                                            <p className="text-sm text-red-600">{logOdrzucenia.opis_decyzji}</p>
                                        </div>
                                    )}

                                    {/* Powiadomienie o wygaśnięciu (tylko closed_by_cron) */}
                                    {og.powod_zamkniecia === 'closed_by_cron' && og.data_zamkniecia && (
                                        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                                            <p className="text-xs font-semibold text-black mb-0.5">Ogłoszenie wygasło:</p>
                                            <p className="text-sm text-black">
                                                Twoje ogłoszenie wygasło dnia{' '}
                                                {new Date(og.data_zamkniecia).toLocaleDateString('pl-PL')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
