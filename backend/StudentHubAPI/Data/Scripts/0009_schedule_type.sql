ALTER TABLE urnik_termin ADD COLUMN IF NOT EXISTS tip TEXT NOT NULL DEFAULT 'Predavanja';

UPDATE urnik_termin ut
SET tip = pt.tip
FROM predmet_termin pt
WHERE ut.predmet_termin_id = pt.id;
