import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import supabase from '@/lib/db';
import NoweOgloszenieForm from './NoweOgloszenieForm';
import Navbar from '@/components/Navbar';

export default async function NoweOgloszeniePage() {
    const session = await getSession();
    if (!session || session.role !== 'user') redirect('/login');

    const { data: kategorie } = await supabase.from('kategoria').select('id, nazwa').order('nazwa');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar session={session} />
            <div className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold text-black mb-8">Dodaj ogłoszenie</h1>
                <NoweOgloszenieForm kategorie={kategorie ?? []} />
            </div>
        </div>
    );
}
