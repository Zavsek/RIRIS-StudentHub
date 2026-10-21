# Podatkovni model

## Entitete

### Fakulteta
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| naziv | text | |
| kratica | text | unikatna |

### Smer
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| fakulteta_id | int | FK → Fakulteta |
| naziv | text | |

### Predmet
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| smer_id | int | FK → Smer |
| naziv | text | |
| letnik | int | |
| semester | int | 1 ali 2 |

### Uporabnik
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| email | text | unikaten |
| geslo_hash | text | |
| ime | text | |
| vloga | text | Student, Moderator, Admin |
| smer_id | int | FK → Smer, lahko prazno |

### UporabnikPredmet
Aktivni predmeti študenta v tekočem semestru.
| Polje | Tip | Opomba |
| --- | --- | --- |
| uporabnik_id | int | FK → Uporabnik |
| predmet_id | int | FK → Predmet |

### ModeratorPredmet
Predmeti, ki jih moderator moderira.
| Polje | Tip | Opomba |
| --- | --- | --- |
| uporabnik_id | int | FK → Uporabnik |
| predmet_id | int | FK → Predmet |

### Gradivo
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| predmet_id | int | FK → Predmet |
| avtor_id | int | FK → Uporabnik |
| naslov | text | |
| opis | text | metapodatki, lahko prazno |
| tip | text | Pdf ali Zapisek |
| pot_datoteke | text | pot ali ključ v Object Storage; samo za Pdf |
| vsebina_md | text | markdown besedilo; samo za Zapisek |
| javno | bool | zasebno ali javno |
| status | text | CakaNaPregled, Priporoceno, Pregledano, Nepriporoceno; velja samo za javno gradivo |
| pregledal_id | int | FK → Uporabnik (moderator), lahko prazno |
| ustvarjeno | datetime | |

### Ocena
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| gradivo_id | int | FK → Gradivo |
| uporabnik_id | int | FK → Uporabnik |
| vrednost | int | 1 do 5; par (gradivo, uporabnik) unikaten |

### KomentarGradiva
Kratka sporočila in opombe uporabnikov neposredno ob gradivu.
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| gradivo_id | int | FK → Gradivo |
| avtor_id | int | FK → Uporabnik |
| vsebina | text | |
| ustvarjeno | datetime | |

### Vprasanje
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| predmet_id | int | FK → Predmet |
| gradivo_id | int | FK → Gradivo, lahko prazno (vprašanje ob gradivu) |
| avtor_id | int | FK → Uporabnik |
| naslov | text | |
| vsebina | text | |
| ustvarjeno | datetime | |

### Odgovor
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| vprasanje_id | int | FK → Vprasanje |
| avtor_id | int | FK → Uporabnik |
| vsebina | text | |
| ustvarjeno | datetime | |

### Obveznost
Kolokvij, izpit ali oddaja pri predmetu. Vpiše jo moderator; študenti jo samo berejo.
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| predmet_id | int | FK → Predmet |
| avtor_id | int | FK → Uporabnik (moderator) |
| naslov | text | |
| tip | text | Kolokvij, Izpit, Oddaja |
| datum | date | |

### UrnikTermin
Zasedeni termini tedenskega urnika. Skupni prosti čas se izračuna, ni shranjen.
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| uporabnik_id | int | FK → Uporabnik |
| naziv | text | |
| dan_v_tednu | int | 1 do 5 |
| ura_od | time | |
| ura_do | time | |

### Kviz
Interaktivni kvizi za preverjanje znanja pri predmetu.
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| predmet_id | int | FK → Predmet |
| avtor_id | int | FK → Uporabnik |
| gradivo_id | int | FK → Gradivo, lahko prazno (povezava na zapiske) |
| naslov | text | |
| ustvarjeno | datetime | |

### KvizVprasanje
Vprašanja znotraj kviza z odgovori.
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| kviz_id | int | FK → Kviz |
| vprasanje | text | |
| pravilen_odgovor | text | |
| nepravilni_odgovori | text | ločeni z vejico ali JSON format |

### PrijavaModeratorja
Prijave študentov zoper neustrezno ali neaktivno delovanje moderatorja.
| Polje | Tip | Opomba |
| --- | --- | --- |
| id | int | PK |
| prijavitelj_id | int | FK → Uporabnik |
| moderator_id | int | FK → Uporabnik |
| razlog | text | |
| status | text | Caka, Obravnavano, Zavrnjeno |
| ustvarjeno | datetime | |

---

## Povezave

- **Fakulteta** ima več smeri, **Smer** ima več predmetov.
- **Uporabnik** pripada eni smeri.
- Študent ima več aktivnih predmetov, predmet ima več študentov (`UporabnikPredmet`).
- Moderator moderira več predmetov, predmet ima lahko več moderatorjev (`ModeratorPredmet`).
- **Predmet** ima več gradiv, vprašanj, obveznosti in kvizov; obveznosti vpiše moderator (`avtor_id`).
- **Gradivo** ima enega avtorja, več ocen in več komentarjev.
- **Vprašanje** pripada predmetu in lahko kaže na eno gradivo. Ima več odgovorov.
- **Kviz** pripada predmetu, lahko kaže na specifično gradivo (zapiske) in ima več kviz vprašanj.
- **PrijavaModeratorja** povezuje študenta (prijavitelja) in prijavljenega moderatorja.
- **Uporabnik** ima več terminov urnika.

---

## Osnutek relacij

**Študijska struktura**
- Fakulteta → Smer → Predmet

**Uporabniki**
- Smer → Uporabnik
- Uporabnik ↔ Predmet (`UporabnikPredmet`: aktivni predmeti)
- Uporabnik ↔ Predmet (`ModeratorPredmet`: moderirani predmeti)

**Gradiva in komentarji**
- Predmet → Gradivo → Uporabnik (avtor)
- Gradivo → Ocena → Uporabnik
- Gradivo → KomentarGradiva → Uporabnik

**Q&A**
- Predmet → Vprasanje → Odgovor
- Gradivo → Vprasanje (neobvezno)

**Kvizi**
- Predmet → Kviz → KvizVprasanje
- Gradivo → Kviz (neobvezno povezovanje)

**Roki in urnik**
- Predmet → Obveznost ← Moderator (avtor)
- Uporabnik → UrnikTermin

**Moderiranje in prijave**
- Uporabnik (študent) → PrijavaModeratorja → Uporabnik (moderator)

---

## Opombe

- Povezovalni tabeli `UporabnikPredmet` in `ModeratorPredmet` imata sestavljen primarni ključ `(uporabnik_id, predmet_id)`.
- Obvestila prek WebSocketa se ne shranjujejo; uporabnik, ki ni povezan, jih ne dobi v živo.
- Skupni prosti čas: izbrani uporabniki so študenti, njihovi termini se preberejo iz `UrnikTermin` ter se sproti izračuna prekrivanje.