CREATE TABLE IF NOT EXISTS fakulteta (
    id SERIAL PRIMARY KEY,
    ime TEXT NOT NULL,
    univerza TEXT NULL,
    sedez TEXT NULL,
    leto_ustanovitve INTEGER NULL
);

CREATE TABLE IF NOT EXISTS smer (
    id SERIAL PRIMARY KEY,
    ime TEXT NOT NULL,
    fakulteta_id INTEGER NOT NULL REFERENCES fakulteta (id) ON DELETE CASCADE,
    trajanje_let INTEGER NULL,
    stopnja INT NOT NULL 
);

CREATE TABLE IF NOT EXISTS predmet (
    id SERIAL PRIMARY KEY,
    ime TEXT NOT NULL,
    smer_id INTEGER REFERENCES smer (id) ON DELETE SET NULL,
    letnik INTEGER NULL,
    nosilec VARCHAR(128) NULL,
    ects INTEGER NULL,
    semester TEXT NULL
);

CREATE TABLE IF NOT EXISTS uporabnik_predmet (
    uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    predmet_id INTEGER NOT NULL REFERENCES predmet (id) ON DELETE CASCADE,
    PRIMARY KEY (uporabnik_id, predmet_id)
);

CREATE INDEX IF NOT EXISTS smer_fakulteta_idx ON smer (fakulteta_id);
CREATE INDEX IF NOT EXISTS predmet_smer_idx ON predmet (smer_id);
CREATE INDEX IF NOT EXISTS uporabnik_predmet_uporabnik_idx ON uporabnik_predmet (uporabnik_id);
