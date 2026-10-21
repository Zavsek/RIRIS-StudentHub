# Uporaba monolitnega backenda namesto mikroservisov

## Context and Problem Statement

StudentHub ima jasen in omejen obseg (gradiva, rokovniki, Q&A, usklajevanje prostega časa). Backend mora izpostaviti REST API, preverjati pravice in hraniti poslovno logiko. Kako naj organiziramo strežniško plast – kot en monolitni servis ali kot več mikroservisov?

## Considered Options

* Monolitni backend (en ASP.NET Core Minimal API)
* Mikroservisna arhitektura (ločeni servisi po domenah)
* Modularni monolit z ločenimi moduli znotraj ene aplikacije

## Decision Outcome

Chosen option: "Monolitni backend (en ASP.NET Core Minimal API)", because: obseg projekta ne upravičuje kompleksnosti mikroservisov. Ena aplikacija omogoča hitrejši razvoj, enostavnejše testiranje in krajše postavitvene cikle.

### Consequences

* Good, because - vsa poslovna logika in preverjanje pravic sta na enem mestu.
* Good, because - lokalni zagon in odpravljanje napak sta preprostejša.
* Good, because - lažja vzpostovitev delujočega sistema v določenem času.
* Bad, because - kasnejša ločitev na mikroservise zahteva refaktoriranje meja domen.
* Bad, because - skaliranje je možno le za celotno aplikacijo, ne po posameznih funkcionalnostih.
