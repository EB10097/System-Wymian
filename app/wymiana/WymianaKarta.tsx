'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_LABEL: Record<string, string> = {
    pending: 'Oczekuje',
    accepted: 'Zaakceptowana',
    rejected: 'Odrzucona',
};

const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

type Prosba = {
    id: number;
    status: string;
    data_wyslania: string;
    data_odpowiedzi: string | null;
    // przychodzaca
    nadawca?: { id: number; nazwa_uzytkownika: string; numer_telefonu: string };
    cel: { id: number; nazwa: string; wartosc: number; uzytkownik?: { id: number; nazwa_uzytkownika: string; numer_telefonu: string }; zdjecia: { sciezka: string; glowne: boolean }[] };
    oferta: { id: number; nazwa: string; wartosc: number; zdjecia: { sciezka: string; glowne: boolean }[] };
};

function Miniatura({ ogloszenie }: { ogloszenie: { nazwa: string; wartosc: number; zdjecia: { sciezka: string; glowne: boolean }[] } }) {
    const glowne = ogloszenie.zdjecia?.find((z) => z.glowne) ?? ogloszenie.zdjecia?.[0];
    return (
        <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {glowne && <img src={glowne.sciezka} alt={ogloszenie.nazwa} className="w-full h-full object-cover" />}
            </div>
            <div>
                <p className="text-sm font-medium text-black line-clamp-1">{ogloszenie.nazwa}</p>
                <p className="text-xs text-black">{ogloszenie.wartosc} zł</p>
            </div>
        </div>
    );
}

export default function WymianaKarta({ prosba: p, typ }: { prosba: Prosba; typ: 'przychodzaca' | 'wychodzaca' }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function odpowiedz(akcja: 'akceptuj' | 'odrzuc') {
        setLoading(true);
        await fetch(`/api/wymiana/${p.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ akcja }),
        });
        setLoading(false);
        router.refresh();
    }

    const drugaStrona = typ === 'przychodzaca' ? p.nadawca : p.cel?.uzytkownik;
    const telefonWidoczny = p.status === 'accepted' && drugaStrona?.numer_telefonu;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5">
                {/* Nagłówek */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-black">
                        {typ === 'przychodzaca' ? (
                            <span>Od: <span className="font-medium text-black">{p.nadawca?.nazwa_uzytkownika}</span></span>
                        ) : (
                            <span>Do: <span className="font-medium text-black">{p.cel?.uzytkownik?.nazwa_uzytkownika}</span></span>
                        )}
                        <span className="mx-2">·</span>
                        <span>{new Date(p.data_wyslania).toLocaleDateString('pl-PL')}</span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                    </span>
                </div>

                {/* Podgląd wymiany */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div>
                        <p className="text-xs text-black mb-1">
                            {typ === 'przychodzaca' ? 'Chce Twoje' : 'Chcesz'}
                        </p>
                        {p.status === 'accepted' ? (
                            <Miniatura ogloszenie={p.cel} />
                        ) : (
                            <Link href={`/ogloszenia/${p.cel?.id}`}>
                                <Miniatura ogloszenie={p.cel} />
                            </Link>
                        )}
                    </div>
                    <div className="text-black text-lg font-light">⇄</div>
                    <div>
                        <p className="text-xs text-black mb-1">
                            {typ === 'przychodzaca' ? 'Oferuje' : 'Oferujesz'}
                        </p>
                        {p.status === 'accepted' ? (
                            <Miniatura ogloszenie={p.oferta} />
                        ) : (
                            <Link href={`/ogloszenia/${p.oferta?.id}`}>
                                <Miniatura ogloszenie={p.oferta} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Telefon po akceptacji */}
                {telefonWidoczny && (
                    <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                        <p className="text-xs font-semibold text-green-700 mb-0.5">Wymiana zaakceptowana — kontakt:</p>
                        <p className="text-sm font-mono text-green-800">{drugaStrona.numer_telefonu}</p>
                        <p className="text-xs text-green-600 mt-1">Skontaktuj się, aby ustalić szczegóły wymiany.</p>
                    </div>
                )}
            </div>

            {/* Akcje dla przychodzących w stanie pending */}
            {typ === 'przychodzaca' && p.status === 'pending' && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 flex gap-2">
                    <button
                        onClick={() => odpowiedz('akceptuj')}
                        disabled={loading}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        Akceptuj
                    </button>
                    <button
                        onClick={() => odpowiedz('odrzuc')}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-black hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        Odrzuć
                    </button>
                </div>
            )}
        </div>
    );
}
