-- schemat bazy danych dla platformy wymiany przedmiotów

-- kategorie ogłoszeń
CREATE TABLE IF NOT EXISTS kategoria (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL UNIQUE
);

-- użytkownicy portalu
CREATE TABLE IF NOT EXISTS uzytkownik (
    id SERIAL PRIMARY KEY,
    nazwa_uzytkownika VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    haslo_hash VARCHAR(255) NOT NULL,
    numer_telefonu VARCHAR(20) NOT NULL,
    data_rejestracji TIMESTAMP NOT NULL DEFAULT NOW(),
    aktywny BOOLEAN NOT NULL DEFAULT TRUE
);

-- pracownicy - moderatorzy i admin
CREATE TABLE IF NOT EXISTS pracownik (
    id SERIAL PRIMARY KEY,
    nazwa_uzytkownika VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    haslo_hash VARCHAR(255) NOT NULL,
    numer_telefonu VARCHAR(20) NOT NULL,
    poziom_uprawnien VARCHAR(20) NOT NULL CHECK (poziom_uprawnien IN ('moderator', 'admin'))
);

-- główna tabela z ogłoszeniami
CREATE TABLE IF NOT EXISTS ogloszenie (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(200) NOT NULL,
    opis TEXT NOT NULL,
    wartosc NUMERIC(10, 2) NOT NULL CHECK (wartosc >= 0),
    data_dodania TIMESTAMP NOT NULL DEFAULT NOW(),
    data_zamkniecia TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'closed', 'rejected')),
    kategoria_id INTEGER NOT NULL REFERENCES kategoria(id) ON DELETE RESTRICT,
    uzytkownik_id INTEGER NOT NULL REFERENCES uzytkownik(id) ON DELETE CASCADE,
    oczekiwania TEXT,
    wojewodztwo VARCHAR(100),
    powod_zamkniecia VARCHAR(50)
);

-- zdjęcia przypisane do ogłoszeń
CREATE TABLE IF NOT EXISTS zdjecie (
    id SERIAL PRIMARY KEY,
    sciezka VARCHAR(500) NOT NULL,
    glowne BOOLEAN NOT NULL DEFAULT FALSE,
    ogloszenie_id INTEGER NOT NULL REFERENCES ogloszenie(id) ON DELETE CASCADE
);

-- propozycje wymiany między użytkownikami
CREATE TABLE IF NOT EXISTS prosba_wymiany (
    id SERIAL PRIMARY KEY,
    data_wyslania TIMESTAMP NOT NULL DEFAULT NOW(),
    data_odpowiedzi TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected')),
    uzytkownik_id INTEGER NOT NULL REFERENCES uzytkownik(id) ON DELETE CASCADE,
    ogloszenie_id INTEGER NOT NULL REFERENCES ogloszenie(id) ON DELETE CASCADE,  -- cel wymiany (ogłoszenie B)
    ogloszenie_id2 INTEGER NOT NULL REFERENCES ogloszenie(id) ON DELETE CASCADE, -- oferta wysyłającego (ogłoszenie A)
    CONSTRAINT rozne_ogloszenia CHECK (ogloszenie_id <> ogloszenie_id2)
);

-- logi moderacji - kto i kiedy zaakceptował/odrzucił ogłoszenie
CREATE TABLE IF NOT EXISTS log_weryfikacji (
    id SERIAL PRIMARY KEY,
    data_weryfikacji TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('accepted', 'rejected')),
    opis_decyzji TEXT,
    pracownik_id INTEGER NOT NULL REFERENCES pracownik(id) ON DELETE RESTRICT,
    ogloszenie_id INTEGER NOT NULL REFERENCES ogloszenie(id) ON DELETE CASCADE
);


