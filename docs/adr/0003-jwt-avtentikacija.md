# Lastna JWT avtentikacija namesto zunanjega ponudnika

## Context and Problem Statement

Uporabniki se prijavijo z e-pošto in geslom; API mora vedeti, kdo je klicatelj in kakšno vlogo ima (študent, tutor, administrator). Registrirajo se samo študenti, ostale vloge dodeli administrator. Kako izvesti avtentikacijo, da ohranimo nadzor nad uporabniki in se izognemo nepotrebnim zunanjim odvisnostim?

## Considered Options

* Lastna avtentikacija z JWT (gesla zgoščena v lastni bazi)
* Zunanji ponudnik (Auth0, Firebase Authentication)
* Seja na strežniku (cookie session)

## Decision Outcome

Chosen option: "Lastna avtentikacija z JWT (gesla zgoščena v lastni bazi)", because - odpravlja odvisnost od zunanjih ponudnikov, njihove omejitve in podvajanje uporabnikov v več sistemih. Podatki niso dovolj občutljivi, da bi zahtevali specializiran servis in se lahko vloge preverjanjo na API-ju pri vsakem zahtevku.

### Consequences

* Good, because - en vir resnice za uporabnike (naša baza), brez sinhronizacije z zunanjim servisom.
* Good, because - JWT omogoča statless API in enostavno uporabo z React frontendom.
* Good, because - ni omejitev brezplačnih paketov Auth0/Firebase.
* Bad, because - sami skrbimo za varno shranjevanje gesel, rotacijo žetonov in morebitni refresh flow.
* Bad, because - ni vgrajenih naprednih funkcij (MFA, social login), razen če jih dodamo sami.
