import { NextRequest } from 'next/server';
import { zamknijPrzeterminowane } from '@/lib/cron';

export async function GET(req: NextRequest) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: 'Brak dostępu.' }, { status: 401 });
    }

    const { zamkniete, error } = await zamknijPrzeterminowane();
    if (error) {
        return Response.json({ ok: false, error }, { status: 500 });
    }

    return Response.json({ ok: true, zamkniete: zamkniete.length, ids: zamkniete });
}
