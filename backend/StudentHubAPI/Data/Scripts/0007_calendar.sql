CREATE TABLE IF NOT EXISTS obveznost (
    id SERIAL PRIMARY KEY,
    predmet_id INTEGER NOT NULL REFERENCES predmet (id) ON DELETE CASCADE,
    uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    naslov TEXT NOT NULL,
    tip TEXT NOT NULL,
    datum TIMESTAMPTZ NOT NULL,
    opis TEXT NULL,
    ustvarjeno_dne TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT obveznost_tip_check CHECK (tip IN ('Kolokvij', 'Izpit', 'Oddaja'))
);

CREATE INDEX IF NOT EXISTS obveznost_predmet_idx ON obveznost (predmet_id);
CREATE INDEX IF NOT EXISTS obveznost_datum_idx ON obveznost (datum);
