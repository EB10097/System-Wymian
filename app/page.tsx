import Link from 'next/link';
import { getSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export default async function HomePage() {
    const session = await getSession();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar session={session} />
            <main className="max-w-4xl mx-auto px-6 py-16 text-center">
                <h1 className="text-4xl font-bold text-black mb-4">
                    Wymień się z innymi
                </h1>
                <p className="text-lg text-black mb-8">
                    Dodaj ogłoszenie i znajdź kogoś chętnego do wymiany przedmiotów.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/ogloszenia"
                        className="rounded-xl border border-gray-300 bg-white px-8 py-3 font-semibold text-black hover:bg-gray-50 transition-colors"
                    >
                        Przeglądaj ogłoszenia
                    </Link>
                    {!session && (
                        <Link
                            href="/register"
                            className="rounded-xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Zacznij teraz
                        </Link>
                    )}
                    {session?.role === 'user' && (
                        <Link
                            href="/ogloszenia/nowe"
                            className="rounded-xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Dodaj ogłoszenie
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}
