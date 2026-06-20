'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JwtPayload } from '@/lib/auth';

const DNI_PRZED_KONCEM = 7;

type Props = {
    ogloszenie: { id: number; status: string; uzytkownik_id: number; data_zamkniecia: string | null };
    session: JwtPayload | null;
};

export default function OgloszenieActions({ ogloszenie, session }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [komunikat, setKomunikat] = useState('');

    const isOwner = session?.role === 'user' && session.id === ogloszenie.uzytkownik_id;

    // Sprawdź czy przycisk przedłużenia powinien być widoczny
    const pokazPrzedluz = (() => {
        if (!isOwner || ogloszenie.status !== 'active' || !ogloszenie.data_zamkniecia) return false;
        const dniDoKonca = Math.ceil(
            (new Date(ogloszenie.data_zamkniecia).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return dniDoKonca <= DNI_PRZED_KONCEM;
    })();

    async function usun() {
        if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return;
        setLoading(true);
        await fetch(`/api/ogloszenia/${ogloszenie.id}`, { method: 'DELETE' });
        setLoading(false);
        router.push('/ogloszenia');
    }

    async function przedluz() {
        setLoading(true);
        setKomunikat('');
        const res = await fetch(`/api/ogloszenia/${ogloszenie.id}/przedluz`, { method: 'POST' });
        const json = await res.json();
        setLoading(false);
        if (!res.ok) {
            setKomunikat(json.error);
            return;
        }
        setKomunikat('Ogłoszenie zostało przedłużone o 30 dni.');
        router.refresh();
    }

    if (!session) return null;

    return (
        <div className="mt-8 space-y-3">
            {komunikat && (
                <p className={`text-sm px-4 py-2 rounded-lg ${
                    komunikat.startsWith('Ogłoszenie zostało')
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                }`}>
                    {komunikat}
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                {/* Przycisk wymiany */}
                {session.role === 'user' && !isOwner && ogloszenie.status === 'active' && (
                    <a
                        href={`/wymiana/nowa?ogloszenie=${ogloszenie.id}`}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                        Zaproponuj wymianę
                    </a>
                )}

                {/* Przedłużenie — widoczne 7 dni przed końcem */}
                {pokazPrzedluz && (
                    <button
                        onClick={przedluz}
                        disabled={loading}
                        className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                    >
                        Przedłuż o 30 dni
                    </button>
                )}

                {/* Usuń */}
                {(isOwner || session.role === 'admin') && ogloszenie.status !== 'closed' && (
                    <button
                        onClick={usun}
                        disabled={loading}
                        className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                        Usuń ogłoszenie
                    </button>
                )}
            </div>

            {/* Info o dacie wygaśnięcia */}
            {isOwner && ogloszenie.status === 'active' && ogloszenie.data_zamkniecia && (
                <p className="text-xs text-black">
                    Ogłoszenie aktywne do:{' '}
                    <span className={`font-medium ${pokazPrzedluz ? 'text-amber-600' : 'text-black'}`}>
                        {new Date(ogloszenie.data_zamkniecia).toLocaleDateString('pl-PL')}
                    </span>
                    {pokazPrzedluz && ' — wygaśnie wkrótce!'}
                </p>
            )}
        </div>
    );
}
