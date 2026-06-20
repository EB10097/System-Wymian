import Link from 'next/link';
import { JwtPayload } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default function Navbar({ session }: { session: JwtPayload | null }) {
    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <Link href="/" className="text-lg font-bold text-black">
                    Wymiana Przedmiotów
                </Link>
                <Link href="/ogloszenia" className="text-sm text-black hover:text-black">
                    Ogłoszenia
                </Link>
            </div>

            <div className="flex items-center gap-4 text-sm">
                {session ? (
                    <>
                        {session.role === 'user' && (
                            <>
                                <Link href="/moje-ogloszenia" className="text-black hover:text-black">
                                    Moje ogłoszenia
                                </Link>
                                <Link href="/wymiana" className="text-black hover:text-black">
                                    Wymiany
                                </Link>
                            </>
                        )}
                        {(session.role === 'moderator' || session.role === 'admin') && (
                            <Link href="/moderator" className="text-blue-600 hover:underline">
                                Panel moderatora
                            </Link>
                        )}
                        {session.role === 'admin' && (
                            <Link href="/admin" className="text-blue-600 hover:underline">
                                Panel admina
                            </Link>
                        )}
                        <span className="flex items-center gap-2 border-l border-gray-200 pl-4 text-black">
                            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold uppercase">
                                {session.nazwa_uzytkownika[0]}
                            </span>
                            <span className="font-medium text-black">{session.nazwa_uzytkownika}</span>
                        </span>
                        <LogoutButton />
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-black hover:text-black">
                            Zaloguj się
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-lg bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700 transition-colors"
                        >
                            Zarejestruj się
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
