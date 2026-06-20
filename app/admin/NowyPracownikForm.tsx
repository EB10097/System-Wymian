'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NowyPracownikForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const body = {
            nazwa_uzytkownika: form.get('nazwa_uzytkownika'),
            email: form.get('email'),
            haslo: form.get('haslo'),
            numer_telefonu: form.get('numer_telefonu'),
            poziom_uprawnien: form.get('poziom_uprawnien'),
        };

        const res = await fetch('/api/admin/pracownicy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const json = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(json.error);
            return;
        }

        setSuccess(`Konto "${json.pracownik.nazwa_uzytkownika}" zostało utworzone.`);
        (e.target as HTMLFormElement).reset();
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-black mb-1">Nazwa użytkownika *</label>
                    <input
                        name="nazwa_uzytkownika"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">E-mail *</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">Numer telefonu *</label>
                    <input
                        name="numer_telefonu"
                        type="tel"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">Hasło * (min. 8 znaków)</label>
                    <input
                        name="haslo"
                        type="password"
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">Rola *</label>
                    <select
                        name="poziom_uprawnien"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="moderator">Moderator</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {loading ? 'Tworzę...' : 'Utwórz konto pracownika'}
            </button>
        </form>
    );
}
