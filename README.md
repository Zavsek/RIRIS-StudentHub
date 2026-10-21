# StudentHub

Študentska aplikacija, ki na enem mestu združuje gradiva, predmetne rokovnike, Q&A razprave in usklajevanje prostega časa za skupinske projekte.

Študenti lahko brskajo po predmetih, nalagajo in ocenjujejo skripte, spremljajo datume kolokvijev in izpitov ter iščejo skupni prosti čas s kolegi. Moderatorji skrbijo za kakovost gradiv in predmetni koledar.

## Tehnologije

| Del | Tehnologija |
| --- | --- |
| Frontend | React, Vite |
| Backend | ASP.NET Core Minimal API (C#) |
| Podatkovna baza | PostgreSQL |
| Avtentikacija | JWT |
| Realtime | SignalR (WebSockets) |
| Datoteke | Object Storage (Supabase) |
| Lokalni razvoj | Docker, npm, dotnet CLI |

## Struktura projekta

```
SUA-StudentHub/
├── README.md
├── .gitignore
├── frontend/          # React + Vite
├── backend/           # ASP.NET Core Minimal API
└── docs/              # Projektna dokumentacija
```

## Dokumentacija

Celotna projektna dokumentacija je v mapi [`docs/`](docs/):

| Dokument | Vsebina |
| --- | --- |
| [01 – Zasnova rešitve](docs/01-zasnova-resitve.md) | Namen, ciljni uporabniki, potek dela |
| [02 – Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md) | Obseg projekta |
| [03 – Podatkovni model](docs/03-podatkovni-model.md) | Entitete in povezave |
| [04 – Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md) | Arhitektura, tehnologije, odločitve |
| [05 – Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md) | User stories |
| [06 – Wireframes](docs/06-wireframe.md) | Žični modeli zaslonov |

## Lokalni zagon

Navodila za zagon bodo dodana, ko bosta `frontend/` in `backend/` vzpostavljena (Docker).
