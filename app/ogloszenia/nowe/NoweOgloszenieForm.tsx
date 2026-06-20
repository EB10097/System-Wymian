'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WOJEWODZTWA } from '@/lib/wojewodztwa';

type Kategoria = { id: number; nazwa: string };

export default function NoweOgloszenieForm({ kategorie }: { kategorie: Kategoria[] }) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        setPreviews(files.map((f) => URL.createObjectURL(f)));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const form = new FormData(e.currentTarget);

        const res = await fetch('/api/ogloszenia', {
            method: 'POST',
            body: form,
        });

        const json = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(json.error);
            return;
        }

        router.push('/moje-ogloszenia');
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-6">
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-black mb-1">Nazwa przedmiotu *</label>
                <input
                    name="nazwa"
                    type="text"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-1">Kategoria *</label>
                <select
                    name="kategoria_id"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Wybierz kategorię</option>
                    {kategorie.map((k) => (
                        <option key={k.id} value={k.id}>{k.nazwa}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-1">Opis przedmiotu *</label>
                <textarea
                    name="opis"
                    required
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-1">Szacowana wartość (zł) *</label>
                <input
                    name="wartosc"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-1">Województwo *</label>
                <select
                    name="wojewodztwo"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Wybierz województwo</option>
                    {WOJEWODZTWA.map((w) => (
                        <option key={w} value={w}>{w}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-1">Oczekiwania co do wymiany</label>
                <textarea
                    name="oczekiwania"
                    rows={2}
                    placeholder="Np. szukam czegoś z kategorii Elektronika..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-1">
                    Zdjęcia (max 10, każde do 5 MB)
                </label>
                <input
                    name="zdjecia"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="w-full text-sm text-black file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                {previews.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {previews.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt=""
                                className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                            />
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {loading ? 'Wysyłanie...' : 'Dodaj ogłoszenie'}
            </button>

            <p className="text-xs text-black text-center">
                Ogłoszenie trafi do moderacji przed opublikowaniem.
            </p>
        </form>
    );
}
