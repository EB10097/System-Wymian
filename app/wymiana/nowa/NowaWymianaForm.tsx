'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Ogloszenie = { id: number; nazwa: string; wartosc: number; zdjecia: { sciezka: string; glowne: boolean }[] };

export default function NowaWymianaForm({
    ogloszenieId,
    mojeOgloszenia,
}: {
    ogloszenieId: number;
    mojeOgloszenia: Ogloszenie[];
}) {
    const router = useRouter();
    const [wybrane, setWybrane] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit() {
        if (!wybrane) {
            setError('Wybierz ogłoszenie do wymiany.');
            return;
        }
        setLoading(true);
        setError('');

        const res = await fetch('/api/wymiana', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ogloszenie_id: ogloszenieId, ogloszenie_id2: wybrane }),
        });

        const json = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(json.error);
            return;
        }

        router.push('/wymiana');
        router.refresh();
    }

    return (
        <div className="space-y-4">
            <p className="text-xs font-semibold text-black uppercase">Oferujesz w zamian</p>

            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {mojeOgloszenia.map((og) => {
                    const glowne = og.zdjecia?.find((z) => z.glowne) ?? og.zdjecia?.[0];
                    const selected = wybrane === og.id;
                    return (
                        <button
                            key={og.id}
                            type="button"
                            onClick={() => setWybrane(og.id)}
                            className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                                selected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                {glowne ? (
                                    <img src={glowne.sciezka} alt={og.nazwa} className="w-full h-full object-cover" />
                                ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-black truncate">{og.nazwa}</p>
                                <p className="text-sm text-black">{og.wartosc} zł</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}>
                                {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading || !wybrane}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {loading ? 'Wysyłanie...' : 'Wyślij propozycję wymiany'}
            </button>
        </div>
    );
}
