CREATE TABLE IF NOT EXISTS predmet_termin (
    id SERIAL PRIMARY KEY,
    predmet_id INTEGER NOT NULL REFERENCES predmet (id) ON DELETE CASCADE,
    naziv TEXT NOT NULL,
    tip TEXT NOT NULL DEFAULT 'Predavanja',
    skupina TEXT NULL,
    dan_v_tednu INTEGER NOT NULL CHECK (dan_v_tednu BETWEEN 1 AND 7),
    ura_od TIME NOT NULL,
    ura_do TIME NOT NULL,
    lokacija TEXT NULL,
    ustvaril_uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    ustvarjeno_dne TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT predmet_termin_cas_check CHECK (ura_do > ura_od)
);

CREATE TABLE IF NOT EXISTS urnik_termin (
    id SERIAL PRIMARY KEY,
    uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    predmet_termin_id INTEGER NULL REFERENCES predmet_termin (id) ON DELETE SET NULL,
    naziv TEXT NOT NULL,
    dan_v_tednu INTEGER NOT NULL CHECK (dan_v_tednu BETWEEN 1 AND 7),
    ura_od TIME NOT NULL,
    ura_do TIME NOT NULL,
    lokacija TEXT NULL,
    ustvarjeno_dne TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT urnik_termin_cas_check CHECK (ura_do > ura_od)
);

CREATE INDEX IF NOT EXISTS predmet_termin_predmet_idx ON predmet_termin (predmet_id);
CREATE INDEX IF NOT EXISTS urnik_termin_uporabnik_dan_idx ON urnik_termin (uporabnik_id, dan_v_tednu);
