# StudentHub

Centralizirano spletno vozlišče za študente in moderatorje. StudentHub na enem mestu združuje deljenje in ocenjevanje študijskih gradiv, predmetni rokovnik obveznosti, vprašanja in odgovore (Q&A) v realnem času preko SignalR ter tedenski urnik z orodjem za iskanje skupnega prostega časa pri skupinskih projektih.

---

## Ključne funkcionalnosti

- **Gradiva in zapiski**: Pregledovanje, nalaganje in prenos PDF gradiv, interaktivno ocenjevanje z zvezdicami (1–5) ter razvrščanje (najnovejša, najbolj ocenjena, najvišja ocena).
- **Moderiranje vsebin**: Dodeljevanje predmetov moderatorjem, pregled in odobritev ali zavrnitev oddanih študijskih gradiv z opombami.
- **Q&A forum v realnem času**: Predmetno usmerjena vprašanja in odgovori z instantnim posodabljanjem prek SignalR (WebSockets).
- **Predmetni rokovnik**: Koledarski in seznamni pregled kolokvijev, izpitov in oddaj za posamezen predmet ali zbirno za vse vpisane predmete.
- **Tedenski urnik in primerjava prostega časa**: Enostaven vnos osebnega urnika, uvoz privzetih terminov vaj/predavanj z enim klikom ter primerjava prostih terminov (8:00–20:00) med študenti istega predmeta.

---

## Tehnološki sklad

| Področje | Tehnologija | Opis |
| --- | --- | --- |
| **Frontend** | React 19, TypeScript, Vite | Hitra enostranska aplikacija (SPA) |
| **Stil & Ikone** | Tailwind CSS v4, Lucide React | Sodoben, čist in pregleden vmesnik |
| **Upravljanje stanja** | Zustand | Globalno stanje in API klici |
| **Backend** | .NET 9 (C#, ASP.NET Core) | Minimal API, Dapper, DbUp migracije |
| **Realtime** | SignalR (WebSockets) | Takojšnje posodabljanje Q&A razprav |
| **Baza podatkov** | PostgreSQL 16+ | Relacijska podatkovna baza (Docker) |
| **Shramba datotek** | Supabase Object Storage | Shramba PDF gradiv preko REST API |
| **Avtentikacija** | JWT (JSON Web Tokens) | Varno avtoriziranje sej in vlog |

---

## Struktura projekta

```
RIRIS-StudentHub/
├── backend/
│   └── StudentHubAPI/        # ASP.NET Core Minimal API
│       ├── Data/Scripts/     # SQL migracije in seed podatki (DbUp)
│       ├── Endpoints/        # Minimal API končne točke (Auth, Materials, Schedule...)
│       ├── Handlers/         # Poslovna logika in poizvedbe
│       ├── Hubs/             # SignalR WebSocket vozlišča (QaHub)
│       ├── Models/           # DTO modeli in entitete
│       ├── Services/         # JWT avtentikacija, gesla, shramba (Supabase)
│       └── appsettings.json.example # Predloga za lokalno konfiguracijo
├── frontend/                 # React + TypeScript + Vite aplikacija
│   ├── src/
│   │   ├── components/       # Modularne komponente (materials, schedule, qa...)
│   │   ├── models/           # TypeScript tipi in podatkovni modeli
│   │   ├── pages/            # Pogledi (Dashboard, CoursePage, SchedulePage...)
│   │   └── stores/           # Zustand trgovine (auth, material, schedule...)
├── docs/                     # Celotna projektna dokumentacija
├── docker-compose.yml        # PostgreSQL vsebnik za lokalni razvoj
└── README.md
```

---

## Predpogoji za zagon

Pred lokalnim zagonom se prepričajte, da imate nameščena naslednja orodja:

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (ali Docker Engine z Docker Compose)
2. **[.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)** (preverite z `dotnet --version`)
3. **[Node.js](https://nodejs.org/)** (različica 20 ali novejša, preverite z `node -v`)
4. **[pnpm](https://pnpm.io/)** (projekt uporablja `pnpm`; namestite z `npm install -g pnpm` ali omogočite s `corepack enable`)

---

## ⚡ Navodila za lokalni zagon

Za zagon aplikacije po korakih sledite spodnjemu postopku.

### 1. Kloniranje repozitorija
```bash
git clone https://github.com/Zavsek/RIRIS-StudentHub.git
cd RIRIS-StudentHub
```

### 2. Zagon podatkovne baze (Docker)
V korenski mapi projekta zaženite PostgreSQL vsebnik:
```bash
docker compose up -d
```
*Vsebnik `studenthub-postgres` se zažene na vratih `5433` (uporabnik: `studenthub`, geslo: `studenthub`, baza: `studenthub`).*

### 3. Konfiguracija zaledja (Backend & Supabase)
Zaradi varnosti konfiguracijska datoteka `appsettings.json` **ni del repozitorija**, saj vsebuje zasebne ključe, ki jih skenerji k kode ob objavi nemudoma prekličejo.

Ustvarite svojo lokalno konfiguracijo iz priložene predloge:

- **Linux / macOS**:
  ```bash
  cp backend/StudentHubAPI/appsettings.json.example backend/StudentHubAPI/appsettings.json
  ```
- **Windows PowerShell**:
  ```powershell
  Copy-Item backend\StudentHubAPI\appsettings.json.example backend\StudentHubAPI\appsettings.json
  ```

#### Nastavitev Supabase Object Storage (za PDF gradiva)
StudentHub uporablja Supabase Storage za varno shranjevanje in prenos PDF datotek študijskih gradiv.

1. Ustvarite brezplačen račun na [supabase.com](https://supabase.com) in kliknite **New project**.
2. Ko se projekt ustvari, v levem meniju izberite **Storage** ter kliknite **New bucket**:
   - Ime bucketa (Name): `Gradiva`
   - Bucket je lahko privaten (backend zanj uporablja `service_role` ključ).
3. V levem spodnjem kotu odprite **Project Settings** (ikona zobnika) ➔ **API**:
   - Kopirajte **Project URL** (npr. `https://abcdefghijkl.supabase.co`) in ga vpišite v `Supabase:Url`.
   - V razdelku **Project API keys** poiščite ključ `service_role` (skrivni ključ z administratorskim dostopom do shrambe) in ga vpišite v `Supabase:Key`.

> **VARNOSTNO OPOZORILO:**
> Zasebnega ključa `service_role` **nikoli ne objavljajte na GitHubu ali ga delite javno**! Datoteka `appsettings.json` je v `.gitignore`, zato poskrbite, da je ne dodate v sledenje gita.

> **Nasvet za hiter preizkus**:
> Če Supabase računa ne želite ustvariti takoj, lahko ključ v `appsettings.json` pustite takšen kot je v predlogi. Vse ostale funkcionalnosti (prijava, predmeti, urniki, Q&A forum, rokovnik) bodo nemoteno delovale, napako bo javil zgolj poskus nalaganja/prenosa dejanske PDF datoteke.

### 4. Zagon zaledja (Backend API)
V terminalu se pomaknite v mapo zaledja in zaženite API:
```bash
cd backend/StudentHubAPI
dotnet run
```
- **Samodejne migracije**: Ob prvem zagonu orodje DbUp avtomatsko ustvari vse potrebne tabele v PostgreSQL ter napolni začetne podatke (fakultete, smeri in predmete).
- Strežnik posluša na naslovu: `http://localhost:5024`.

### 5. Zagon spletnega vmesnika (Frontend)
Odprite nov terminal, se pomaknite v mapo `frontend` in namestite odvisnosti s `pnpm`:
```bash
cd frontend
pnpm install
pnpm dev
```
- Aplikacija je na voljo na naslovu: `http://localhost:5173`.
- Vite ima v `vite.config.ts` že konfiguriran proxy, ki vse klice na `/api` in `/hubs` samodejno preusmerja na lokalni backend (`http://localhost:5024`).

---

## Uporabniške vloge in testiranje

V aplikaciji so na voljo tri vloge: `Student`, `Moderator` in `Admin`.

1. **Registracija**:
   Na strani za prijavo (`/register`) ustvarite nov uporabniški račun. Privzeto vsak nov uporabnik prejme vlogo **Student**.

2. **Dodelitev vloge Moderator za testiranje**:
   Moderatorji lahko pregledujejo in potrjujejo oddana gradiva, dodajajo roke v predmetni rokovnik ter določajo privzete termine predavanj in vaj.
   
   Če želite svojemu uporabniku dodeliti vlogo moderatorja in mu dodeliti npr. predmet z ID `1` (*Osnove programiranja*), se povežite na bazo (preko DBeaver, pgAdmin ali ukazne vrstice):
   ```bash
   docker exec -it studenthub-postgres psql -U studenthub -d studenthub
   ```
   In izvedite SQL ukaze:
   ```sql
   -- 1. Povišaj uporabnika v moderatorja
   UPDATE uporabnik SET vloga = 'Moderator' WHERE email = 'vas-email@primer.si';

   -- 2. Dodeli moderatorju predmet z ID 1
   INSERT INTO moderator_predmet (uporabnik_id, predmet_id)
   SELECT id, 1 FROM uporabnik WHERE email = 'vas-email@primer.si'
   ON CONFLICT DO NOTHING;
   ```

3. **Dodelitev vloge Admin**:
   ```sql
   UPDATE uporabnik SET vloga = 'Admin' WHERE email = 'vas-email@primer.si';
   ```

---

## Projektna dokumentacija

Podrobna specifikacija projekta se nahaja v mapi [`docs/`](docs/):

- [01 – Zasnova rešitve](docs/01-zasnova-resitve.md) — Namen, cilji in scenariji uporabe
- [02 – Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md) — Funkcionalne in nefunkcionalne zahteve
- [03 – Podatkovni model](docs/03-podatkovni-model.md) — Relacijski diagram in opis tabel
- [04 – Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md) — Arhitekturni vzorci in izbire
- [05 – Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md) — Sprejemni kriteriji in scenariji
- [06 – Wireframes](docs/06-wireframe.md) — Žični modeli uporabniškega vmesnika
