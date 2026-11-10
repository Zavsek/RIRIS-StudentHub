CREATE TABLE IF NOT EXISTS moderator_predmet (
    uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    predmet_id INTEGER NOT NULL REFERENCES predmet (id) ON DELETE CASCADE,
    dodeljeno_dne TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (uporabnik_id, predmet_id)
);

CREATE INDEX IF NOT EXISTS moderator_predmet_uporabnik_idx ON moderator_predmet (uporabnik_id);
CREATE INDEX IF NOT EXISTS moderator_predmet_predmet_idx ON moderator_predmet (predmet_id);

ALTER TABLE gradivo ADD COLUMN IF NOT EXISTS pregledal_id INTEGER NULL REFERENCES uporabnik (id) ON DELETE SET NULL;
