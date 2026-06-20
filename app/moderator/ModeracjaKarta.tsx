'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Ogloszenie = {
    id: number;
    nazwa: string;
    opis: string;
    wartosc: number;
    data_dodania: string;
    oczekiwania: string | null;
    kategoria: { nazwa: string };
    uzytkownik: { id: number; nazwa_uzytkownika: string; email: string };
    zdjecia: { sciezka: string; glowne: boolean }[];
};

export default function ModeracjaKarta({ ogloszenie: og }: { ogloszenie: Ogloszenie }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showOdrzuc, setShowOdrzuc] = useState(false);
    const [powod, setPowod] = useState('');
    const [error, setError] = useState('');

    const glowne = og.zdjecia?.find((z) => z.glowne) ?? og.zdjecia?.[0];

    async function akcja(typ: 'akceptuj' | 'odrzuc') {
        if (typ === 'odrzuc' && !powod.trim()) {
            setError('Podaj powód odrzucenia.');
            return;
        }
        setLoading(true);
        setError('');

        const res = await fetch(`/api/moderator/${og.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ akcja: typ, powod }),
        });

        const json = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(json.error);
            return;
        }

        router.refresh();
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex gap-4 p-5">
                {/* Zdjęcie */}
                <div className="w-28 h-28 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {glowne ? (
                        <img src={glowne.sciezka} alt={og.nazwa} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs text-black">Brak zdjęcia</span>
                    )}
                </div>

                {/* Treść */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <span className="text-xs font-medium text-blue-600">{og.kategoria?.nazwa}</span>
                            <h2 className="text-lg font-semibold text-black">{og.nazwa}</h2>
                            <p className="text-sm text-black">
                                {og.uzytkownik?.nazwa_uzytkownika} · {og.wartosc} zł ·{' '}
                                {new Date(og.data_dodania).toLocaleDateString('pl-PL')}
                            </p>
                        </div>
                    </div>

                    <p className="mt-2 text-sm text-black line-clamp-3">{og.opis}</p>

                    {og.oczekiwania && (
                        <p className="mt-1 text-xs text-blue-600 italic">Oczekiwania: {og.oczekiwania}</p>
                    )}

                    {og.zdjecia?.length > 1 && (
                        <div className="mt-2 flex gap-1.5 overflow-x-auto">
                            {og.zdjecia.slice(1).map((z, i) => (
                                <img
                                    key={i}
                                    src={z.sciezka}
                                    alt=""
                                    className="h-12 w-12 rounded object-cover border border-gray-200 shrink-0"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Akcje */}
            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                {error && (
                    <p className="mb-3 text-sm text-red-600">{error}</p>
                )}

                {showOdrzuc ? (
                    <div className="space-y-3">
                        <textarea
                            value={powod}
                            onChange={(e) => setPowod(e.target.value)}
                            placeholder="Podaj powód odrzucenia ogłoszenia..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => akcja('odrzuc')}
                                disabled={loading}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Wysyłanie...' : 'Odrzuć z powodem'}
                            </button>
                            <button
                                onClick={() => { setShowOdrzuc(false); setError(''); }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => akcja('akceptuj')}
                            disabled={loading}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? '...' : 'Akceptuj'}
                        </button>
                        <button
                            onClick={() => setShowOdrzuc(true)}
                            disabled={loading}
                            className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                        >
                            Odrzuć
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
