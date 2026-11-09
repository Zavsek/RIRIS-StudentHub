

### US-01 — Upravljanje profila in aktivnih predmetov
**Funkcionalnost:** 1. Upravljanje študentskega profila in aktivnih predmetov  
**Vloga:** Študent  

Kot študent želim izbrati fakulteto, smer in aktivne predmete, da v aplikaciji vidim le vsebine, ki so relevantne za moj semester.

**Acceptance criteria:**
- Po registraciji lahko študent izbere eno fakulteto in smer s seznama.
- Študent lahko označi več aktivnih predmetov izbrane smeri za tekoči semester.
- Aktivne predmete lahko kasneje doda ali odstrani.
- Na domačem pogledu se prikažejo le aktivni predmeti.
- Študent ne more izbrati predmeta, ki ne spada v njegovo smer.

---

### US-02 — Drevesna navigacija
**Funkcionalnost:** 2. Drevesna navigacija po študijski strukturi  
**Vloga:** Študent  

Kot študent želim brskati po fakultetah, smereh in predmetih, da hitro najdem mapo želenega predmeta.

**Acceptance criteria:**
- Navigacija prikaže hierarhijo Fakulteta → Smer → Predmet.
- Predmete je mogoče filtrirati po letniku in semestru.
- Iskanje po nazivu predmeta vrne rezultate ob vnosu vsaj treh znakov.
- Klik na predmet odpre stran predmeta z gradivi, Q&A in rokovnikom.
- Če ni zadetkov, sistem prikaže sporočilo »Ni rezultatov«.

---

### US-03 — Nalaganje študijskih gradiv
**Funkcionalnost:** 3. Nalaganje in prenos študijskih gradiv  
**Vloga:** Študent  

Kot študent želim naložiti PDF skripto v mapo predmeta, da jo lahko delim s sošolci.

**Acceptance criteria:**
- Študent lahko naloži datoteko PDF z naslovom in kratkim opisom.
- Naloženo javno gradivo dobi status »Čakanje na pregled«.
- Gradivo je vidno v seznamu predmeta takoj po nalaganju.
- Sistem zavrne datoteke, ki niso PDF, z jasnim sporočilom o napaki.
- Avtor lahko izbriše lastno gradivo.

---

### US-04 — Prenos študijskih gradiv
**Funkcionalnost:** 3. Nalaganje in prenos študijskih gradiv  
**Vloga:** Študent  

Kot študent želim prenesti naloženo gradivo, da ga uporabim za učenje brez povezave.

**Acceptance criteria:**
- Ob javnem PDF gradivu je na voljo gumb za prenos.
- Prenos začne prenos datoteke z originalnim imenom.
- Če datoteka na strežniku ne obstaja, sistem vrne napako 404 z razumljivim sporočilom.

---

### US-05 — Lastni zapiski v markdownu
**Funkcionalnost:** 4. Pisanje in upravljanje lastnih zapiskov  
**Vloga:** Študent  

Kot študent želim pisati lastne zapiske v markdownu, da jih imam zbrane pri predmetu in jih po želji delim.

**Acceptance criteria:**
- Študent lahko ustvari, uredi in izbriše zapisek z naslovom in markdown vsebino.
- Zapisek lahko označi kot zaseben ali javen.
- Zasebni zapisek vidi samo avtor.
- Javni zapisek se pojavi v mapi predmeta in čaka na moderatorski pregled.
- Predogled prikaže oblikovano markdown vsebino.

---

### US-06 — Moderacijski statusi gradiv
**Funkcionalnost:** 5. Moderacijski sistem  
**Vloga:** Moderator  

Kot moderator želim gradivom v dodeljenih predmetih podeliti status zanesljivosti, da študenti vedo, kateri materiali so primerni za učenje.

**Acceptance criteria:**
- Moderator vidi seznam gradiv  samo za dodeljene predmete.
- Moderator lahko nastavi status gradiva na »Priporočeno« ali »Nepriporočeno«.
- Nov status je takoj viden v seznamu gradiv predmeta.
- Moderator ne more spreminjati statusa gradiv pri predmetih, ki mu niso dodeljeni.

---

### US-07 — Brisanje neprimernih vsebin
**Funkcionalnost:** 5. Moderacijski sistem  
**Vloga:** Moderator  

Kot moderator želim izbrisati neprimerno gradivo ali odgovor, da ohranim kakovost predmetne mape.

**Acceptance criteria:**
- Moderator lahko izbriše javno gradivo v dodeljenem predmetu.
- Moderator lahko izbriše odgovor v Q&A dodeljenega predmeta.
- Po brisanju vsebina ni več vidna v seznamu.
- Brisanje zabeleži, kateri moderator je vsebino odstranil.
- Študent ne more brisati tujih vsebin.

---

### US-08 — Predmetni Q&A forum
**Funkcionalnost:** 6. Predmetni Q&A forum  
**Vloga:** Študent  

Kot študent želim objaviti vprašanje pri predmetu, da dobim pojasnilo od sošolcev ali moderatorja.

**Acceptance criteria:**
- Študent lahko pri predmetu ustvari vprašanje z naslovom in vsebino.
- Vprašanje lahko opcijsko poveže z obstoječim gradivom.
- Vprašanje se takoj prikaže v seznamu Q&A predmeta.
- Drugi prijavljeni uporabniki lahko dodajo odgovor.
- Nov odgovor se v odprti temi prikaže v živo (WebSocket).

---

### US-09 — Predmetni rokovnik
**Funkcionalnost:** 7. Predmetno usmerjen rokovnik obveznosti  
**Vloga:** Moderator  

Kot moderator želim vpisati kolokvije, izpite in oddaje za dodeljene predmete, da imajo študenti skupne in zanesljive roke na enem mestu.

**Acceptance criteria:**
- Moderator lahko pri dodeljenem predmetu doda obveznost z naslovom, tipom (Kolokvij, Izpit, Oddaja) in datumom.
- Seznam obveznosti predmeta je razvrščen po datumu naraščajoče.
- Moderator lahko uredi ali izbriše obveznost pri dodeljenem predmetu.
- Študenti z aktivnim predmetom vidijo rokovnik tega predmeta; ne morejo ga urejati.
- Sistem zavrne vnos brez datuma ali tipa; moderator ne more urejati rokov pri predmetih, ki mu niso dodeljeni.

---

### US-10 — Tedenski urnik
**Funkcionalnost:** 8. Primerjanje prostega časa  
**Vloga:** Študent  

Kot študent želim vnesti tedenski urnik predavanj, da sistem pozna moje zasedene termine.

**Acceptance criteria:**
- Študent lahko doda termin z dnem v tednu, uro od, uro do in nazivom.
- Sistem zavrne termin, kjer je ura do manjša ali enaka uri od.
- Termini se prikažejo v tedenskem pogledu.
- Študent lahko uredi ali izbriše lastni termin.
- Termini drugih uporabnikov niso vidni v osebnem urniku.

---

### US-11 — Primerjava prostega časa
**Funkcionalnost:** 8. Primerjanje prostega časa  
**Vloga:** Študent  

Kot študent želim primerjati prosti čas s kolegi istega predmeta, da lažje najdemo termin za skupinski projekt.

**Acceptance criteria:**
- Študent izbere vsaj dva uporabnika z aktivnim istim predmetom in dan v tednu.
- Sistem vrne proste intervale, ki jih ne pokriva noben izbrani urnik (med 8:00 in 20:00).
- Če skupnega prostega časa ni, sistem prikaže sporočilo »Ni skupnega prostega časa«.
- Rezultat se ne shrani v bazo.
- Študent ne more vključiti uporabnika, ki nima aktivnega izbranega predmeta.

---

### US-12 — Ocenjevanje in filtriranje gradiv
**Funkcionalnost:** 9. Ocenjevanje zapiskov in filtriranje  
**Vloga:** Študent  

Kot študent želim oceniti gradivo in razvrstiti seznam po oceni, da najprej vidim koristne materiale.

**Acceptance criteria:**
- Študent lahko oceni javno gradivo z zvezdico.
- En študent ima na enem gradivu samo eno oceno.
- Seznam gradiv prikaže povprečno oceno.
- Študent lahko razvrsti gradiva po največkrat ocenjenih.

---

### US-13 — Interaktivni kvizi
**Funkcionalnost:** 10. Interaktivni kvizi za preverjanje znanja  
**Vloga:** Študent  

Kot študent želim ustvariti kviz z vprašanji, povezanimi na poglavja v zapiskih, da lahko preverim znanje pred izpitom.

**Acceptance criteria:**
- Študent lahko pri predmetu ustvari kviz z naslovom in vsaj enim vprašanjem.
- Vsako vprašanje ima besedilo, pravilni odgovor in opcijsko povezavo na gradivo.
- Drugi študenti lahko rešijo kviz in takoj vidijo, kateri odgovori so pravilni.
- Ob napačnem odgovoru sistem prikaže povezavo na vezano gradivo, če obstaja.
- Avtor lahko uredi ali izbriše lastni kviz.

---

### US-14 — Prijava neustreznega moderatorja
**Funkcionalnost:** 11. Sistem prijave in zamenjave neustreznih moderatorjev  
**Vloga:** Študent  

Kot študent želim anonimno prijaviti neaktivnega ali neustreznega moderatorja, da administrator lahko ukrepa.

**Acceptance criteria:**
- Študent lahko odda prijavo z izbiro moderatorja, predmeta in razlogom (vsaj 20 znakov).
- Identiteta prijavitelja ni vidna moderatorju.
- Administrator vidi seznam odprtih prijav z razlogom, predmetom in moderatorjem.
- Administrator lahko prijavo označi kot rešeno ali zavrnjeno.
- Študent ne more oddati več kot ene odprte prijave za istega moderatorja pri istem predmetu.

---

### US-15 — Komentarji ob gradivih
**Funkcionalnost:** 12. Osnovna komunikacija in komentarji ob gradivih  
**Vloga:** Študent  

Kot študent želim pustiti kratek komentar ob gradivu, da postavim vprašanje ali opombo neposredno pri datoteki.

**Acceptance criteria:**
- Študent lahko ob javnem gradivu doda komentar z besedilom do 512 znakov.
- Komentarji se prikažejo kronološko pod gradivom.
- Avtor lahko izbriše lastni komentar.
- Moderator dodeljenega predmeta lahko izbriše kateri koli komentar pri tem predmetu.
- Prazen komentar sistem zavrne.
