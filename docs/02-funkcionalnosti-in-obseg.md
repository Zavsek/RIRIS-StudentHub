# Funkcionalnosti in obseg

### Uporabniške vloge
1. Študent (Uporabnik): Lahko nalaga zapiske, piše vprašanja pod gradivi, spremlja rokovnik predmeta, si deli urnik s kolegi, meri čas učenja in ocenjuje vsebine. Nima pravice potrjevati uradnih statusov gradiv ali urejati rokov.

2. Moderator: Skrbi za red znotraj določenih predmetov, pregleduje naložena gradiva ter jim podeljuje status zanesljivosti. Vpisuje kolokvije, izpite in oddaje v predmetni rokovnik. Lahko briše neprimerne vsebine in komentarje.

3. Administrator (Sistemski upravitelj): Upravlja hierarhijo fakultet in predmetov, obravnava pritožbe nad tutorji ter upravlja sistemske nastavitve.

### Predvidene funkcionalnosti (Seznam 15 funkcionalnosti)
1. **Upravljanje študentskega profila in aktivnih predmetov** (izbira fakultete, smeri in aktivnih predmetov v tekočem semestru). *(MVP)*
2. **Drevesna navigacija po študijski strukturi** (pregled in iskanje predmetov po letnikih in semestrih). *(MVP)*
3. **Nalaganje in prenos študijskih gradiv** (nalaganje PDF skript in zapiskov z osnovnimi metapodatki). *(MVP)*
4. **Pisanje in upravljanje lastnih zapiskov** (možnost vodenja lastnih zapiskov, zapisanih v markdown formatu, ki so lahko zasebni ali javno objavljeni v mapi posameznega predmeta).
5. **moderacijski sistem** (pregledovanje naloženih gradiv in njihovo označevanje s statusi:, *Priporočeno* ali *Nepriporočeno*). *(MVP – domensko specifično)*
6. **Predmetni Q&A forum** (tematska vprašanja študentov in odgovori skupnosti ali tutorjev za razreševanje nejasnosti iz snovi). *(MVP – domensko specifično)*
7. **Predmetno usmerjen rokovnik obveznosti** (moderator vpiše kolokvije, izpite in oddaje z tipom in datumom; študenti jih samo spremljajo). *(MVP – domensko specifično)*
8. **Primerjanje prostega časa** (vnos osebnega tedenskega urnika predavanj in primerjavanje skupnega prostega časa dveh ali več uporabnikov). *(MVP – domensko specifično)*
9. **Ocenjevanje zapiskov in filtriranje** (sistem glasovanja in razvrščanja gradiv glede na njihovo kakovost in koristnost za izpit). *(MVP)*
10. **Interaktivni kvizi za preverjanje znanja** (ustvarjanje vprašanj s strani študentov, ki vsebujejo neposredne povezave na ustrezna poglavja v naloženih zapiskih).
11. **Sistem prijave in zamenjave neustreznih moderatorjev** (anonimni poročevalni mehanizem za študente v primeru neaktivnosti ali slabega delovanja moderatorja).
12. **Osnovna komunikacija in komentarji ob gradivih** (izmenjava kratkih sporočil ter opomb med uporabniki ob specifičnih nalogah ali datotekah).

### Kasnejše nadgradnje

1. **sinhronizacija rokov:** Možnost izvoza vnesenih kolokvijev, izpitov in rokov za oddajo nalog v zunanje koledarje (Google Calendar, Apple Calendar, Outlook) preko unikatne koledarske povezave.
2. **AI-pomočnik za povzetke:** Integracija zunanjega AI modela (npr. OpenAI API) za avtomatsko generiranje kratkih povzetkov iz naloženih skript na en klik.
3. **Mobilna aplikacija z obvestili:** Razvoj namenske mobilne aplikacije z lokalnimi potisnimi (push) obvestili za pravočasno opozarjanje na bližajoče se izpite in oddaje.
4. **Sistem točk in nagrajevanja ("Karma"):** Nagrajevanje študentov, ki redno prispevajo kvalitetna gradiva, urejajo vsebine ali aktivno odgovarjajo na vprašanja sošolcev v Q&A sekciji.
5. **Arhiv preteklih izpitov in statistika:** Posebna sekcija za zbiranje starejših izpitnih pol, rešenih nalog ter anonimnih anket o zahtevnosti izpitov preteklih generacij.


### Out of scope

* **Povezovanje z univerzitetnimi sistemi:** Aplikacija se ne bo povezovala z uradnimi univerzitetnimi informacijskimi sistemi za avtomatsko uvažanje ocen, uradnih urnikov ali preverjanje študentskega statusa.
* **Napredno urejanje PDF datotek:** Sistem ne bo vključeval orodij za kompleksno urejanje, risanje, podpisovanje ali direktno manipulacijo s PDF dokumenti v brskalniku (podprti sta le nalaganje in prenos datotek).
* **Finančne transakcije in tržnica:** Projekt ne bo vključeval plačilnih sistemov, denarnic ali tržnice za prodajo zapiskov in inštrukcij (vse vsebine in orodja na platformi so za študente popolnoma brezplačne).
* **Gostovanje videokonferenc:** Aplikacija ne bo omogočala gostovanja video predavanj, snemanja zaslona ali izvajanja spletnih videokonferenc v živo (za komunikacijo v živo se uporabljajo zunanja orodja, kot sta Zoom ali MS Teams).
* **Uradno izvajanje izpitov:** Aplikacija ne bo služila kot uradno okolje za izvajanje izpitov ali oddajo študijskih obveznosti v ocenjevanje profesorjem (ne nadomešča platform, kot je Moodle).