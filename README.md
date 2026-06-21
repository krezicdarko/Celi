# CELI Official — Webshop

Moderni webshop za butik elegantnih haljina **CELI** (Mostar, BiH).
Statička stranica — HTML / CSS / vanilla JavaScript, bez build koraka i bez vanjskih ovisnosti.

## Značajke

- **Elegantan dizajn** prilagođen CELI brendu — svijetla krem paleta, zlatni *script* logotip, profinjena tipografija (Cormorant Garamond + Pinyon Script + Jost).
- **Katalog haljina** s kategorijama: svečane, koktel, dnevne, maxi.
- **Filteri i pretraga** u stvarnom vremenu.
- **Brzi pregled** (quick view) s odabirom veličine.
- **Košarica** s trajnim spremanjem (`localStorage`) — količine, uklanjanje, ukupna cijena.
- **Naručivanje putem WhatsApp-a** — narudžba se automatski složi i pošalje na CELI broj.
- **Potpuno responzivno** (mobitel, tablet, desktop) s mobilnim izbornikom.
- **Bez vanjskih slika** — ilustracije haljina generiraju se kao SVG, pa stranica radi i offline.

## Pokretanje

Samo otvorite `index.html` u pregledniku. Ili lokalni server:

```bash
python3 -m http.server 8000
# pa otvorite http://localhost:8000
```

## Struktura

```
index.html        – stranica i sve sekcije
css/styles.css    – kompletan stil i responsive
js/products.js    – podaci o haljinama + SVG generator ilustracija
js/app.js         – logika: filteri, pretraga, košarica, modal, WhatsApp narudžba
assets/           – favicon i logo
```

## Prilagodba

- **Proizvodi:** uredite polje `PRODUCTS` u `js/products.js` (naziv, kategorija, cijena, boje, opis).
- **Kontakt / WhatsApp:** broj se mijenja u `js/app.js` (`WHATSAPP`) i u `index.html` (footer).
- **Prag besplatne dostave:** `FREE_SHIP` u `js/app.js`.
- **Prave fotografije:** zamijenite `dressSVG(...)` poziv `<img>` tagom sa stvarnim slikama proizvoda.

## Napomena

Ilustracije haljina su stilizirani SVG placeholderi jer Instagram fotografije nisu
javno dostupne za preuzimanje. Za produkciju ih zamijenite stvarnim fotografijama iz kolekcije.
