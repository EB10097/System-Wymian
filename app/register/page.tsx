'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const data = {
            nazwa_uzytkownika: form.get('nazwa_uzytkownika'),
            email: form.get('email'),
            haslo: form.get('haslo'),
            numer_telefonu: form.get('numer_telefonu'),
        };

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const json = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(json.error);
            return;
        }

        router.push('/');
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
                <h1 className="text-2xl font-bold text-black mb-6">Rejestracja</h1>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Nazwa użytkownika
                        </label>
                        <input
                            name="nazwa_uzytkownika"
                            type="text"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Adres e-mail
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Numer telefonu
                        </label>
                        <input
                            name="numer_telefonu"
                            type="tel"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Hasło
                        </label>
                        <input
                            name="haslo"
                            type="password"
                            required
                            minLength={8}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-black">Minimum 8 znaków</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Rejestrowanie...' : 'Zarejestruj się'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-black">
                    Masz już konto?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </div>
    );
}
