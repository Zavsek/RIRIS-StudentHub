# SignalR za dogodke v živo (WebSockets)

## Context and Problem Statement

Nekateri dogodki morajo biti uporabniku vidni takoj: novi odgovori v Q&A temi in obvestilo avtorju, ko tutor spremeni status gradiva. Klasični REST polling bi bil počasen in neučinkovit. Kako omogočiti potiskanje dogodkov od strežnika do brskalnika znotraj izbranega .NET stacka?

## Considered Options

* SignalR (WebSockets) znotraj ASP.NET Core
* Klasični HTTP polling (periodični GET)
* Ločena realtime storitev (npr. Socket.IO, Ably, Pusher)

## Decision Outcome

Chosen option: "SignalR (WebSockets) znotraj ASP.NET Core", because je naravno vgrajen v ekosistem ASP.NET Core Minimal API, zahteva veljaven JWT in ne uvaja dodatnega strežnika ali zunanjega SaaS za osnovne realtime potrebe projekta.

### Consequences

* Good, because - dogodki (Q&A, status gradiva) pridejo do odjemalca brez polling zakasnitev.
* Good, because - en tehnološki sklad (.NET) poenostavi avtentikacijo in gostovanje (isti monolit).
* Good, because - SignalR sam upravlja povezave in fallback mehanizme.
* Bad, because - strežnik mora vzdrževati odprte povezave (več spomina/stanja kot pri čistem REST).
* Bad, because - testiranje in odpravljanje napak realtime toka je zahtevnejše od navadnih HTTP klicev.
