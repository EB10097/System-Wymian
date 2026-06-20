import Link from 'next/link';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';
import OgloszeniaFilters from './OgloszeniaFilters';
import Navbar from '@/components/Navbar';

type SearchParams = { nazwa?: string; kategoria_id?: string; wojewodztwo?: string; sort?: string; order?: string };

export default async function OgloszeniaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const session = await getSession();
    const params = await searchParams;

    const { nazwa = '', kategoria_id, wojewodztwo, sort = 'data_dodania', order = 'desc' } = params;

    let query = supabase
        .from('ogloszenie')
        .select(`id, nazwa, wartosc, data_dodania, wojewodztwo, kategoria:kategoria_id(nazwa), zdjecia:zdjecie(sciezka, glowne)`)
        .eq('status', 'active');

    if (nazwa) query = query.ilike('nazwa', `%${nazwa}%`);
    if (kategoria_id) query = query.eq('kategoria_id', kategoria_id);
    if (wojewodztwo) query = query.eq('wojewodztwo', wojewodztwo);

    const allowedSort = ['wartosc', 'data_dodania'];
    const sortCol = allowedSort.includes(sort) ? sort : 'data_dodania';
    query = query.order(sortCol, { ascending: order === 'asc' });

    const { data: ogloszenia } = await query;
    const { data: kategorie } = await supabase.from('kategoria').select('id, nazwa').order('nazwa');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar session={session} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-black">Ogłoszenia</h1>
                    {session?.role === 'user' && (
                        <Link
                            href="/ogloszenia/nowe"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                            + Dodaj ogłoszenie
                        </Link>
                    )}
                </div>

                <OgloszeniaFilters kategorie={kategorie ?? []} />

                {!ogloszenia?.length ? (
                    <p className="text-center text-black py-16">Brak ogłoszeń spełniających kryteria.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {ogloszenia.map((og: any) => {
                            const glowne = og.zdjecia?.find((z: any) => z.glowne) ?? og.zdjecia?.[0];
                            return (
                                <Link
                                    key={og.id}
                                    href={`/ogloszenia/${og.id}`}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {glowne ? (
                                            <img src={glowne.sciezka} alt={og.nazwa} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-black text-sm">Brak zdjęcia</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-blue-600 font-medium mb-1">
                                            {(og.kategoria as any)?.nazwa}
                                        </p>
                                        <h2 className="font-semibold text-black truncate">{og.nazwa}</h2>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-sm text-black">
                                                Wartość: <span className="font-medium text-black">{og.wartosc} zł</span>
                                            </p>
                                            {og.wojewodztwo && (
                                                <span className="text-xs text-black">📍 {og.wojewodztwo}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
