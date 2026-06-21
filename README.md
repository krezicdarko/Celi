# CELI Official — Webshop

Moderni webshop za butik elegantnih haljina **CELI** (Mostar, BiH).
Statička stranica — HTML / CSS / vanilla JavaScript, bez build koraka i bez vanjskih ovisnosti.

## Značajke

- **Elegantan dizajn** prilagođen CELI brendu — svijetla krem paleta, zlatni *script* logotip, profinjena tipografija (Cormorant Garamond + Pinyon Script + Jost).
- **Katalog haljina** s kategorijama: svečane, koktel, dnevne, maxi.
- **Filteri i pretraga** u stvarnom vremenu + filter **Favoriti**.
- **Interaktivni pregled proizvoda** — kartice **Foto / 360° / 3D**:
  - **3D + AR** preko `<model-viewer>` (rotacija i „pogledaj u svom prostoru" na mobitelu),
  - **galerija** sa sličicama i **zoom** na pomak miša,
  - **360° spin** povlačenjem (spremno za niz sličica).
- **Vodič za veličine** (tablica mjera + kako izmjeriti).
- **Lista želja (wishlist)** s trajnim spremanjem i brojačem.
- **Brzi pregled** (quick view) s odabirom veličine i detaljima (materijal, kroj, održavanje).
- **Košarica** s trajnim spremanjem (`localStorage`) — količine, uklanjanje, ukupna cijena.
- **Checkout** — kartica/PayPal, pouzeće, bankovni transfer + WhatsApp narudžba.
- **Varijante boja** — swatch odabir boje + točkice boja na karticama.
- **Stvarne zalihe** — dostupnost po veličini (rasprodano = onemogućeno), urgentnost
  „⚡ Još samo N kom", oznaka „Rasprodano", te **back-in-stock** obavijest.
- **Recenzije i ocjene** (★) na karticama i u modalu.
- **Filtri po boji + sortiranje** (cijena, ocjena, novo).
- **Besplatna dostava — progres bar** i **Nedavno pregledano**.
- **Evidencija zaliha (admin panel)** — `admin.html`: SKU = model × boja × veličina,
  KPI, upozorenja, izmjena količina, kretanje zaliha, narudžbe, izvoz/uvoz.
- **Automatsko skidanje sa zalihe** pri narudžbi + zapis narudžbe.
- **Info/pravne stranice** — `info.html` (dostava, povrat, privatnost, uvjeti).
- **SEO** — Open Graph/Twitter kartice i strukturirani podaci (schema.org `Product` + ocjene).
- **Potpuno responzivno** (mobitel, tablet, desktop) s mobilnim izbornikom.
- **Otporno na offline** — ako 3D komponenta ili fotografija nisu dostupne, viewer
  graciozno pada na fotografiju/SVG ilustraciju.

> 📄 Dokumentacija:
> **[ANALIZA-I-PREPORUKE.md](ANALIZA-I-PREPORUKE.md)** (audit i plan) ·
> **[ISTRAZIVANJE-KONKURENCIJE.md](ISTRAZIVANJE-KONKURENCIJE.md)** (najbolje prakse) ·
> **[EVIDENCIJA-ZALIHA.md](EVIDENCIJA-ZALIHA.md)** (skladište/inventar).

## Pokretanje

Samo otvorite `index.html` u pregledniku. Ili lokalni server:

```bash
python3 -m http.server 8000
# pa otvorite http://localhost:8000
```

## Struktura

```
index.html               – trgovina i sve sekcije
checkout.html            – stranica plaćanja
admin.html               – panel za evidenciju zaliha (skladište)
info.html                – dostava / povrat / privatnost / uvjeti
css/styles.css           – kompletan stil i responsive
js/products.js           – podaci o haljinama (boje, recenzije, zalihe) + media helperi
js/inventory.js          – inventar (SKU = model × boja × veličina), zajednički modul
js/app.js                – trgovina: filteri, viewer, košarica, wishlist, zalihe, SEO
js/checkout.js           – checkout, plaćanje, skidanje zaliha, zapis narudžbe
js/admin.js              – admin panel za zalihe
assets/products/         – fotografije haljina
assets/models/           – 3D modeli (.glb) za interaktivni / AR pregled
assets/spin/             – sličice za 360° pregled
tools/make_gown_glb.py   – generator demo 3D modela (bez vanjskih biblioteka)
tools/make_spin.py       – generator 360° sličica (softverski render)
ANALIZA-I-PREPORUKE.md   – audit i plan razvoja (modni + web dizajn)
ISTRAZIVANJE-KONKURENCIJE.md – najbolje prakse konkurencije
EVIDENCIJA-ZALIHA.md     – upute za inventar/skladište
```

## 3D / AR pregled

Haljina dobiva interaktivni 3D + AR pregled dodavanjem `.glb` modela:

```js
// js/products.js
{ id: 1, name: "Azzurra", /* … */, model: "assets/models/celi-3d-demo.glb" }
```

Demo model generira se s:

```bash
python3 tools/make_gown_glb.py   # -> assets/models/celi-3d-demo.glb
```

Za 360° pregled umjesto 3D-a dodajte niz sličica: `spin: ["...01.jpg", "...02.jpg", …]`.

## Prilagodba

- **Proizvodi:** uredite polje `PRODUCTS` u `js/products.js` (naziv, kategorija, cijena, boje, opis).
- **Kontakt / WhatsApp:** broj se mijenja u `js/app.js` (`WHATSAPP`) i u `index.html` (footer).
- **Prag besplatne dostave:** `FREE_SHIP` u `js/app.js`.
- **Prave fotografije:** zamijenite `dressSVG(...)` poziv `<img>` tagom sa stvarnim slikama proizvoda.

## Napomena

Ilustracije haljina su stilizirani SVG placeholderi jer Instagram fotografije nisu
javno dostupne za preuzimanje. Za produkciju ih zamijenite stvarnim fotografijama iz kolekcije.
