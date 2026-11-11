CREATE TABLE IF NOT EXISTS ocena_gradiva (
    id SERIAL PRIMARY KEY,
    gradivo_id INTEGER NOT NULL REFERENCES gradivo (id) ON DELETE CASCADE,
    uporabnik_id INTEGER NOT NULL REFERENCES uporabnik (id) ON DELETE CASCADE,
    ocena INTEGER NOT NULL CHECK (ocena BETWEEN 1 AND 5),
    ustvarjeno_dne TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ocena_gradiva_unique_user UNIQUE (gradivo_id, uporabnik_id)
);

CREATE INDEX IF NOT EXISTS ocena_gradiva_gradivo_idx ON ocena_gradiva (gradivo_id);
CREATE INDEX IF NOT EXISTS ocena_gradiva_uporabnik_idx ON ocena_gradiva (uporabnik_id);
