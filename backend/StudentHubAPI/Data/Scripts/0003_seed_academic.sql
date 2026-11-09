-- Vstavljanje testnih podatkov za Univerzo v Mariboru
INSERT INTO fakulteta (id, ime, univerza, sedez, leto_ustanovitve)
VALUES 
    (1, 'Fakulteta za elektrotehniko, računalništvo in informatiko', 'Univerza v Mariboru', 'Maribor', 1959),
    (2, 'Ekonomsko-poslovna fakulteta', 'Univerza v Mariboru', 'Maribor', 1959),
    (3, 'Fakulteta za strojništvo', 'Univerza v Mariboru', 'Maribor', 1959)
ON CONFLICT (id) DO NOTHING;

INSERT INTO smer (id, ime, fakulteta_id, trajanje_let, stopnja)
VALUES 
    (1, 'Računalništvo in informacijske tehnologije (UNI)', 1, 3, 1),
    (2, 'Računalništvo in informacijske tehnologije (MAG)', 1, 2, 2),
    (3, 'Informatika in tehnologije komuniciranja (UNI)', 1, 3, 1),
    (4, 'E-poslovanje (UNI)', 2, 3, 1),
    (5, 'Mehatronika (UNI)', 3, 3, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO predmet (id, ime, smer_id, letnik, nosilec, ects, semester)
VALUES 
    (1, 'Osnove programiranja', 1, 1, 'dr. Milan Zorman', 6, 'Zimski'),
    (2, 'Arhitektura računalniških sistemov', 1, 1, 'dr. Aleš Holobar', 6, 'Zimski'),
    (3, 'Podatkovne baze', 1, 2, 'dr. Tatjana Welzer Družovec', 6, 'Zimski'),
    (4, 'Razvoj informacijskih sistemov', 2, 1, 'dr. Marjan Heričko', 6, 'Zimski'),
    (5, 'Strojno učenje', 2, 1, 'dr. Vili Podgorelec', 6, 'Poletni'),
    (6, 'Uvod v e-poslovanje', 4, 1, 'dr. Samo Bobek', 6, 'Zimski'),
    (7, 'Osnove mehatronike', 5, 1, 'dr. Uroš Župerl', 6, 'Zimski')
ON CONFLICT (id) DO NOTHING;

-- Ponastavitev sekvenc, da se nadaljujejo od največjega ID-ja
SELECT setval('fakulteta_id_seq', (SELECT MAX(id) FROM fakulteta));
SELECT setval('smer_id_seq', (SELECT MAX(id) FROM smer));
SELECT setval('predmet_id_seq', (SELECT MAX(id) FROM predmet));
