'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') ?? '/';

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const data = {
            email: form.get('email'),
            haslo: form.get('haslo'),
        };

        const res = await fetch('/api/auth/login', {
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

        router.push(next);
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
                <h1 className="text-2xl font-bold text-black mb-6">Logowanie</h1>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Adres e-mail
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
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
                            autoComplete="current-password"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-black">
                    Nie masz konta?{' '}
                    <Link href="/register" className="text-blue-600 hover:underline font-medium">
                        Zarejestruj się
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
