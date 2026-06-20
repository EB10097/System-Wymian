'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Uzytkownik = {
    id: number;
    nazwa_uzytkownika: string;
    email: string;
    numer_telefonu: string;
    data_rejestracji: string;
    aktywny: boolean;
};

export default function UzytkownikRow({ uzytkownik: u }: { uzytkownik: Uzytkownik }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function toggleStatus() {
        const akcja = u.aktywny ? 'dezaktywować' : 'aktywować';
        if (!confirm(`Czy na pewno chcesz ${akcja} konto "${u.nazwa_uzytkownika}"?`)) return;

        setLoading(true);
        setError('');

        const res = await fetch(`/api/admin/uzytkownicy/${u.id}`, { method: 'PATCH' });
        const json = await res.json();
        setLoading(false);

        if (!res.ok) { setError(json.error); return; }

        router.refresh();
    }

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 font-medium text-black">{u.nazwa_uzytkownika}</td>
            <td className="px-6 py-4 text-black">{u.email}</td>
            <td className="px-6 py-4 text-black">{u.numer_telefonu}</td>
            <td className="px-6 py-4 text-black text-sm">
                {new Date(u.data_rejestracji).toLocaleDateString('pl-PL')}
            </td>
            <td className="px-6 py-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    u.aktywny ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {u.aktywny ? 'Aktywny' : 'Nieaktywny'}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                {error && <span className="text-xs text-red-600 mr-2">{error}</span>}
                <button
                    onClick={toggleStatus}
                    disabled={loading}
                    className={`rounded-lg border px-3 py-1 text-xs font-medium disabled:opacity-50 transition-colors ${
                        u.aktywny
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                >
                    {loading ? '...' : u.aktywny ? 'Dezaktywuj' : 'Aktywuj'}
                </button>
            </td>
        </tr>
    );
}
