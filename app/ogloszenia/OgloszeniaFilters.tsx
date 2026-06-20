'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { WOJEWODZTWA } from '@/lib/wojewodztwa';

type Kategoria = { id: number; nazwa: string };

export default function OgloszeniaFilters({ kategorie }: { kategorie: Kategoria[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const update = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) params.set(key, value);
            else params.delete(key);
            router.push(`/ogloszenia?${params.toString()}`);
        },
        [router, searchParams]
    );

    return (
        <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-4">
            <input
                type="text"
                placeholder="Szukaj po nazwie..."
                defaultValue={searchParams.get('nazwa') ?? ''}
                onChange={(e) => update('nazwa', e.target.value)}
                className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
                defaultValue={searchParams.get('kategoria_id') ?? ''}
                onChange={(e) => update('kategoria_id', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Wszystkie kategorie</option>
                {kategorie.map((k) => (
                    <option key={k.id} value={k.id}>{k.nazwa}</option>
                ))}
            </select>

            <select
                defaultValue={searchParams.get('wojewodztwo') ?? ''}
                onChange={(e) => update('wojewodztwo', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Wszystkie województwa</option>
                {WOJEWODZTWA.map((w) => (
                    <option key={w} value={w}>{w}</option>
                ))}
            </select>

            <select
                defaultValue={`${searchParams.get('sort') ?? 'data_dodania'}_${searchParams.get('order') ?? 'desc'}`}
                onChange={(e) => {
                    const parts = e.target.value.split('_');
                    const order = parts.pop()!;       // ostatni segment: 'asc' | 'desc'
                    const sort = parts.join('_');     // reszta: 'data_dodania' | 'wartosc'
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('sort', sort);
                    params.set('order', order);
                    router.push(`/ogloszenia?${params.toString()}`);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="data_dodania_desc">Najnowsze</option>
                <option value="data_dodania_asc">Najstarsze</option>
                <option value="wartosc_asc">Wartość: rosnąco</option>
                <option value="wartosc_desc">Wartość: malejąco</option>
            </select>
        </div>
    );
}
