import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';
import Navbar from '@/components/Navbar';
import OgloszenieActions from './OgloszenieActions';

export default async function OgloszeniePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();

    const { data: og } = await supabase
        .from('ogloszenie')
        .select(`
            id, nazwa, opis, wartosc, data_dodania, data_zamkniecia, status, oczekiwania, wojewodztwo,
            kategoria:kategoria_id(id, nazwa),
            uzytkownik:uzytkownik_id(id, nazwa_uzytkownika),
            zdjecia:zdjecie(id, sciezka, glowne)
        `)
        .eq('id', id)
        .single();

    if (!og) notFound();

    // pending/closed widzi tylko właściciel albo moderator
    const isOwner = session?.role === 'user' && (og.uzytkownik as any)?.id === session.id;
    const isStaff = session?.role === 'moderator' || session?.role === 'admin';

    if (og.status !== 'active' && !isOwner && !isStaff) notFound();

    const zdjecia = (og.zdjecia as any[]) ?? [];
    const glowne = zdjecia.find((z) => z.glowne) ?? zdjecia[0];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar session={session} />

            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    {zdjecia.length > 0 && (
                        <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                            {zdjecia.map((z: any) => (
                                <img
                                    key={z.id}
                                    src={z.sciezka}
                                    alt={og.nazwa}
                                    className={`h-48 w-auto rounded-lg object-cover border-2 ${z.glowne ? 'border-blue-500' : 'border-transparent'}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    {(og.kategoria as any)?.nazwa}
                                </span>
                                <h1 className="text-2xl font-bold text-black mt-1">{og.nazwa}</h1>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-2xl font-bold text-black">{og.wartosc} zł</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    og.status === 'active' ? 'bg-green-100 text-green-700' :
                                    og.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-black'
                                }`}>
                                    {og.status === 'active' ? 'Aktywne' :
                                     og.status === 'pending' ? 'Oczekuje na moderację' :
                                     og.status === 'closed' ? 'Zamknięte' : 'Odrzucone'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black">
                            <span>Dodane przez <span className="font-medium text-black">{(og.uzytkownik as any)?.nazwa_uzytkownika}</span></span>
                            <span>·</span>
                            <span>{new Date(og.data_dodania).toLocaleDateString('pl-PL')}</span>
                            {og.wojewodztwo && (
                                <>
                                    <span>·</span>
                                    <span>📍 {og.wojewodztwo}</span>
                                </>
                            )}
                        </div>

                        <div className="mt-6">
                            <h2 className="text-sm font-semibold text-black mb-2">Opis</h2>
                            <p className="text-black leading-relaxed whitespace-pre-wrap">{og.opis}</p>
                        </div>

                        {og.oczekiwania && (
                            <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
                                <h2 className="text-sm font-semibold text-blue-700 mb-1">Oczekiwania co do wymiany</h2>
                                <p className="text-blue-600 text-sm">{og.oczekiwania}</p>
                            </div>
                        )}

                        <OgloszenieActions
                            ogloszenie={{
                                id: og.id,
                                status: og.status,
                                uzytkownik_id: (og.uzytkownik as any)?.id,
                                data_zamkniecia: og.data_zamkniecia,
                            }}
                            session={session}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
