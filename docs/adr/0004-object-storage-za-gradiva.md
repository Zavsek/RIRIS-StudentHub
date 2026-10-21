# Hramba PDF gradiv v Object Storage (Supabase)

## Context and Problem Statement

Študenti nalagajo in prenašajo PDF skripte ter gradiva. Datoteke so lahko velike; v bazi jih ne želimo shranjevati kot BLOBe. Kako hraniti binarne datoteke, da ostanejo ločene od metadatk, varne in enostavno skalabilne?

## Considered Options

* Object Storage (npr. Supabase Storage) – v bazi le URL/ključ
* Shranjevanje datotek neposredno v PostgreSQL (BYTEA / large object)
* Lokalni datotečni sistem na strežniku API-ja

## Decision Outcome

Chosen option: "Object Storage (npr. Supabase Storage) – v bazi le URL/ključ", because - zunanja objektna shramba omogoča varno, neodvisno in skalabilno hrambo PDF-jev, medtem ko PostgreSQL ostane odgovoren za metadata in povezave.

### Consequences

* Good, because - baza ostane vitka in velike datoteke ne obremenjujejo poizvedb.
* Good, because - shramba se skalira ločeno od API-ja in baze.
* Good, because - dostop do datotek lahko omejimo z žetoni/politikami shrambe.
* Bad, because - uvedemo dodatno zunanjo odvisnost (Supabase ali primerljiv ponudnik).
* Bad, because - usklajevanje metapodatkov v bazi z dejanskimi objekti zahteva dodatno logiko (brisanje, zamenjava).
