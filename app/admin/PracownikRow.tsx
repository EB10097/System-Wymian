'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Pracownik = {
    id: number;
    nazwa_uzytkownika: string;
    email: string;
    numer_telefonu: string;
    poziom_uprawnien: 'moderator' | 'admin';
};

export default function PracownikRow({
    pracownik: p,
    currentAdminId,
}: {
    pracownik: Pracownik;
    currentAdminId: number;
}) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isSelf = p.id === currentAdminId;

    async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const body: Record<string, string> = {};
        for (const [key, val] of form.entries()) {
            if (val) body[key] = val as string;
        }

        const res = await fetch(`/api/admin/pracownicy/${p.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const json = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(json.error);
            return;
        }

        setEditing(false);
        router.refresh();
    }

    async function handleDelete() {
        if (!confirm(`Czy na pewno usunąć konto "${p.nazwa_uzytkownika}"?`)) return;
        setLoading(true);
        const res = await fetch(`/api/admin/pracownicy/${p.id}`, { method: 'DELETE' });
        const json = await res.json();
        setLoading(false);
        if (!res.ok) { setError(json.error); return; }
        router.refresh();
    }

    if (editing) {
        return (
            <tr className="bg-blue-50">
                <td colSpan={5} className="px-6 py-4">
                    <form onSubmit={handleEdit} className="space-y-3">
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div>
                                <label className="block text-xs font-medium text-black mb-1">Nazwa użytkownika</label>
                                <input
                                    name="nazwa_uzytkownika"
                                    defaultValue={p.nazwa_uzytkownika}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-black mb-1">E-mail</label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={p.email}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-black mb-1">Telefon</label>
                                <input
                                    name="numer_telefonu"
                                    defaultValue={p.numer_telefonu}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-black mb-1">Nowe hasło</label>
                                <input
                                    name="haslo"
                                    type="password"
                                    placeholder="Zostaw puste"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div>
                                <label className="block text-xs font-medium text-black mb-1">Rola</label>
                                <select
                                    name="poziom_uprawnien"
                                    defaultValue={p.poziom_uprawnien}
                                    disabled={isSelf}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    <option value="moderator">Moderator</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Zapisuję...' : 'Zapisz'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setEditing(false); setError(''); }}
                                    className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-black hover:bg-gray-100 transition-colors"
                                >
                                    Anuluj
                                </button>
                            </div>
                        </div>
                    </form>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 font-medium text-black">{p.nazwa_uzytkownika}</td>
            <td className="px-6 py-4 text-black">{p.email}</td>
            <td className="px-6 py-4 text-black">{p.numer_telefonu}</td>
            <td className="px-6 py-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    p.poziom_uprawnien === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                }`}>
                    {p.poziom_uprawnien === 'admin' ? 'Administrator' : 'Moderator'}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    {error && <span className="text-xs text-red-600">{error}</span>}
                    <button
                        onClick={() => setEditing(true)}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-black hover:bg-gray-100 transition-colors"
                    >
                        Edytuj
                    </button>
                    {!isSelf && (
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                            Usuń
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
