CREATE TABLE IF NOT EXISTS uporabnik (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    geslo_hash TEXT NOT NULL,
    ime TEXT NOT NULL,
    vloga TEXT NOT NULL,
    CONSTRAINT uporabnik_email_key UNIQUE (email),
    CONSTRAINT uporabnik_vloga_check CHECK (vloga IN ('Student', 'Moderator', 'Admin'))
);

CREATE TABLE IF NOT EXISTS osvezitveni_zeton (
    id UUID PRIMARY KEY,
    uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    zeton_hash TEXT NOT NULL,
    potece TIMESTAMPTZ NOT NULL,
    preklican TIMESTAMPTZ NULL,
    zamenjan_z UUID NULL
);

CREATE INDEX IF NOT EXISTS osvezitveni_zeton_uporabnik_idx
    ON osvezitveni_zeton (uporabnik_id);
