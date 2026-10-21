# Izbira PostgreSQL kot glavne podatkovne baze

## Context and Problem Statement

Aplikacija temelji na močno povezanih podatkih: uporabniki, predmeti, gradiva, rokovniki, vloge in ocenjevanja. Potrebujemo trajno hrambo z jasnim relacijskim modelom (glej `03-podatkovni-model.md`). Katero podatkovno shrambo uporabiti, da ohranimo integriteto in podpremo poizvedbe po povezanih entitetah?

## Considered Options

* PostgreSQL (relacijska baza)
* MongoDB (dokumentna baza)
* SQLite (vgrajena datotečna baza)

## Decision Outcome

Chosen option: "PostgreSQL (relacijska baza)", because - tuji ključi in transakcije zagotavljajo konsistentnost med uporabniki, predmeti in gradivi. Okolje je dobro poznano, baza pa je industrijsko zanesljiva in primerna za Docker lokalni zagon.

### Consequences

* Good, because - podatkovna integriteta je zagotovljena na ravni sheme (FK, omejitve).
* Good, because - kompleksne poizvedbe po povezanih entitetah so naravne (JOIN).
* Good, because - poznavanje orodja zmanjšuje tveganje in čas učenja.
* Bad, because - spremembe sheme zahtevajo migracije in načrtovanje.
* Bad, because - fleksibilnost sheme je manjša kot pri dokumentnih bazah.
