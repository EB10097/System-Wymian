import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';
import Navbar from '@/components/Navbar';
import PracownikRow from './PracownikRow';
import NowyPracownikForm from './NowyPracownikForm';
import UzytkownikRow from './UzytkownikRow';

export default async function AdminPage() {
    const session = await getSession();
    if (!session || session.role !== 'admin') redirect('/');

    const [{ data: pracownicy }, { data: uzytkownicy }] = await Promise.all([
        supabase
            .from('pracownik')
            .select('id, nazwa_uzytkownika, email, numer_telefonu, poziom_uprawnien')
            .order('id'),
        supabase
            .from('uzytkownik')
            .select('id, nazwa_uzytkownika, email, numer_telefonu, data_rejestracji, aktywny')
            .order('data_rejestracji', { ascending: false }),
    ]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar session={session} />

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
                <h1 className="text-2xl font-bold text-black">Panel administratora</h1>

                {/* Zarządzanie użytkownikami */}
                <section>
                    <h2 className="text-lg font-bold text-black mb-4">
                        Użytkownicy{' '}
                        <span className="text-sm font-normal text-black">({uzytkownicy?.length ?? 0})</span>
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {!uzytkownicy?.length ? (
                            <p className="px-6 py-8 text-center text-sm text-black">Brak użytkowników w systemie.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Użytkownik</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">E-mail</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Telefon</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Rejestracja</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {uzytkownicy.map((u: any) => (
                                        <UzytkownikRow key={u.id} uzytkownik={u} />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                {/* Zarządzanie pracownikami */}
                <section>
                    <h2 className="text-lg font-bold text-black mb-4">
                        Pracownicy{' '}
                        <span className="text-sm font-normal text-black">({pracownicy?.length ?? 0})</span>
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {!pracownicy?.length ? (
                            <p className="px-6 py-8 text-center text-sm text-black">Brak pracowników w systemie.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Użytkownik</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">E-mail</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Telefon</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Rola</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pracownicy.map((p: any) => (
                                        <PracownikRow key={p.id} pracownik={p} currentAdminId={session.id} />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                {/* Formularz nowego pracownika */}
                <section>
                    <h2 className="text-lg font-bold text-black mb-4">Dodaj pracownika</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <NowyPracownikForm />
                    </div>
                </section>
            </div>
        </div>
    );
}
