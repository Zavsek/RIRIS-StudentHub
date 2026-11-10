CREATE TABLE IF NOT EXISTS gradivo (
    id SERIAL PRIMARY KEY,
    predmet_id INTEGER NOT NULL REFERENCES predmet (id) ON DELETE CASCADE,
    uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    naslov TEXT NOT NULL,
    opis TEXT NULL,
    ime_datoteke TEXT NOT NULL,
    supabase_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Cakanje',
    ustvarjeno_dne TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gradivo_predmet_idx ON gradivo (predmet_id);
CREATE INDEX IF NOT EXISTS gradivo_uporabnik_idx ON gradivo (uporabnik_id);
