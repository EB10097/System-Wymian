const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Preferuj IPv4 — Supabase zwraca IPv6, ale Node.js pg nie zawsze obsługuje
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function migrate() {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('🔌 Łączenie z bazą danych...');
    const client = await pool.connect();

    try {
        console.log('📦 Uruchamianie migracji...');
        await client.query(sql);
        console.log('✅ Schemat bazy danych utworzony pomyślnie!');
        console.log('✅ Kategorie (Elektronika, Odzież, Książki) dodane.');
    } catch (err) {
        console.error('❌ Błąd migracji:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
