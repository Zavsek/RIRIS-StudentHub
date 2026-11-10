CREATE TABLE IF NOT EXISTS vprasanje (
    id SERIAL PRIMARY KEY,
    predmet_id INTEGER NOT NULL REFERENCES predmet (id) ON DELETE CASCADE,
    gradivo_id INTEGER NULL REFERENCES gradivo (id) ON DELETE SET NULL,
    uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    naslov TEXT NOT NULL,
    vsebina TEXT NOT NULL,
    ustvarjeno_dne TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS odgovor (
    id SERIAL PRIMARY KEY,
    vprasanje_id INTEGER NOT NULL REFERENCES vprasanje (id) ON DELETE CASCADE,
    nadrejeni_odgovor_id INTEGER NULL REFERENCES odgovor (id) ON DELETE CASCADE,
    uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    vsebina TEXT NOT NULL,
    ustvarjeno_dne TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vprasanje_predmet_idx ON vprasanje (predmet_id);
CREATE INDEX IF NOT EXISTS vprasanje_gradivo_idx ON vprasanje (gradivo_id);
CREATE INDEX IF NOT EXISTS vprasanje_uporabnik_idx ON vprasanje (uporabnik_id);
CREATE INDEX IF NOT EXISTS odgovor_vprasanje_idx ON odgovor (vprasanje_id);
CREATE INDEX IF NOT EXISTS odgovor_nadrejeni_idx ON odgovor (nadrejeni_odgovor_id);
CREATE INDEX IF NOT EXISTS odgovor_uporabnik_idx ON odgovor (uporabnik_id);
