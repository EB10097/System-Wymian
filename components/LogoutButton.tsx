'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    }

    return (
        <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
        >
            Wyloguj
        </button>
    );
}
