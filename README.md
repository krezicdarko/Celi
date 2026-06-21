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
- **SEO** — Open Graph/Twitter kartice i strukturirani podaci (schema.org `Product`).
- **Potpuno responzivno** (mobitel, tablet, desktop) s mobilnim izbornikom.
- **Otporno na offline** — ako 3D komponenta ili fotografija nisu dostupne, viewer
  graciozno pada na fotografiju/SVG ilustraciju.

> 📄 Detaljan audit i plan razvoja: vidi **[ANALIZA-I-PREPORUKE.md](ANALIZA-I-PREPORUKE.md)**.

## Pokretanje

Samo otvorite `index.html` u pregledniku. Ili lokalni server:

```bash
python3 -m http.server 8000
# pa otvorite http://localhost:8000
```

## Struktura

```
index.html              – stranica i sve sekcije
checkout.html           – stranica plaćanja
css/styles.css          – kompletan stil i responsive
js/products.js          – podaci o haljinama + media helperi (galerija/3D)
js/app.js               – logika: filteri, pretraga, košarica, viewer, wishlist, SEO
js/checkout.js          – checkout, plaćanje, sažetak narudžbe
assets/                 – favicon i logo
assets/products/        – fotografije haljina
assets/models/          – 3D modeli (.glb) za interaktivni / AR pregled
tools/make_gown_glb.py  – generator demo 3D modela haljine (bez vanjskih biblioteka)
ANALIZA-I-PREPORUKE.md  – audit i plan razvoja (modni + web dizajn)
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
