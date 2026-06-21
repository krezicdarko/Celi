# CELI Official — Analiza i preporuke

> Audit web stranice iz perspektive **modnog dizajnera** i **web dizajnera**, s
> konkretnim planom kako CELI pretvoriti u vrhunsku web trgovinu za haljine.
> Dokument opisuje (1) zatečeno stanje, (2) što je već implementirano u ovom
> ažuriranju, i (3) prioritizirani plan svih daljnjih izmjena.

---

## 1. Sažetak

CELI već ima **čvrst temelj**: profinjenu krem/zlatnu paletu, dobru tipografiju
(Cormorant Garamond + Pinyon Script + Jost), funkcionalnu košaricu, brzi pregled,
checkout s više načina plaćanja i WhatsApp narudžbu. Stranica je brza, statična i
bez build koraka.

Da bi postala **najbolja stranica za haljine**, tri stvari nose najviše:

1. **Konzistentna, profesionalna fotografija** — trenutno je to najslabija karika.
2. **Bogatije iskustvo proizvoda** — više slika, 360°/3D pregled, vodič za veličine,
   detalji o materijalu i kroju. *(Velik dio je već dodan u ovom ažuriranju.)*
3. **Povjerenje i konverzija** — recenzije, jasna politika povrata, stranice proizvoda
   za SEO, pravi sustav plaćanja.

---

## 2. Analiza zatečenog stanja

### 2.1 Modni dizajner — vizualni dojam i brendiranje

| Područje | Nalaz | Ocjena |
|---|---|---|
| Paleta i osjećaj | Krem + zlato + tamna tinta — elegantno, "boutique" dojam | ✅ Vrlo dobro |
| Tipografija | Serif za naslove + script logo + sans za tekst — sklad | ✅ Vrlo dobro |
| **Fotografije** | **Nekonzistentne**: dio na krojačkoj lutki u radionici, dio studijski s manekenkom; različiti vodeni žigovi (Pinterest pin, YouTube play, tuđi logo); niska rezolucija (434 px); raznoliko kadriranje/pozadina | ❌ Najveći problem |
| Konzistentnost brenda | Miješanje identiteta: `celi.officiel` (IG), `info@celi.ba`, ali na slici p7 stoji `celi-essentiel.com` | ⚠️ Uskladiti |
| Hero sekcija | Lijepa tipografija, ali bez prave fotografije — gradient pozadina djeluje "prazno" za modni brend | ⚠️ Dodati editorial fotku |
| Prikaz proizvoda | Bila je samo jedna slika po haljini, bez detalja tkanine, leđa, pokreta | ⚠️ Riješeno (galerija/3D spremni) |

**Ključno za modu:** kupac haljinu kupuje "očima". Bez konzistentne, kvalitetne
vizualne priče (ista pozadina, isto svjetlo, ista poza, više kadrova + detalji +
pokret) percepcija vrijednosti pada bez obzira na to koliko je sama haljina lijepa.

### 2.2 Web dizajner — UX, tehnika, konverzija

**Dobro:**
- Čist, responzivan layout; sticky header; mobilni izbornik; drawer košarica.
- `localStorage` košarica, filteri i pretraga u stvarnom vremenu.
- Checkout s validacijom, EUR/BAM konverzijom, PayPal/pouzeće/transfer + WhatsApp.

**Za poboljšati (prije ovog ažuriranja):**
- Samo jedna fotografija po proizvodu; bez zooma, galerije, 360° ili 3D.
- Bez vodiča za veličine — kod haljina to je #1 uzrok povrata i nesigurnosti.
- Bez liste želja (wishlist) i bez recenzija/social proofa.
- Bez stranica proizvoda → slab SEO; bez strukturiranih podataka (schema.org),
  bez Open Graph/Twitter kartica.
- Modal bez `aria-modal`/upravljanja fokusom (pristupačnost).
- Slike nisu optimirane (JPEG, bez `srcset`/WebP/AVIF, niska rezolucija).
- Newsletter i narudžbe nemaju backend (forma se ne šalje nigdje).

---

## 3. Što je implementirano u ovom ažuriranju

> Sve radi bez build koraka i gracefully degradira (radi i offline; 3D koristi CDN
> komponentu koja se učitava tek na zahtjev).

### ✨ 3D / AR pregled haljine
- Integriran Google **`<model-viewer>`** web component: rotacija mišem/prstom,
  auto-rotacija, te **AR pregled** ("pogledaj u svom prostoru") na mobitelu
  (iOS Quick Look / Android Scene Viewer).
- Učitava se **lijeno** (tek kad korisnik otvori 3D karticu); ako nije dostupan,
  graciozno pada na fotografiju.
- Priložen je **stvaran, lagan 3D model** (`assets/models/celi-3d-demo.glb`,
  generiran skriptom `tools/make_gown_glb.py`) kao demonstracija na haljini *Azzurra*.
  Kartica i modal nose oznaku **„3D · AR".**

### 🔄 Galerija + 360° + zoom
- Novi **viewer** u brzom pregledu s karticama **Foto / 360° / 3D**
  (kartica se pojavljuje samo ako proizvod ima te podatke).
- **Zoom na pomak miša** preko glavne fotografije.
- **Galerija sa sličicama** (spremno za više fotografija po proizvodu).
- **360° spin** povlačenjem (spremno; treba samo niz sličica `spin[]`).

### 📏 Vodič za veličine
- Modal s tablicom mjera (XS–XL: poprsje/struk/bokovi u cm) + "Kako izmjeriti"
  i poziv na WhatsApp savjetovanje. Dostupan iz svakog proizvoda.

### 🤍 Lista želja (wishlist)
- Srce na svakoj kartici i u modalu, brojač u headeru, filter **„♡ Favoriti"**,
  trajno spremanje u `localStorage`.

### 🔎 SEO i pristupačnost
- **Open Graph** + **Twitter** kartice, `canonical`, `theme-color`.
- **JSON-LD** (schema.org `Product`/`ItemList`) generiran iz kataloga → bogatiji
  prikaz u Google rezultatima.
- `role="dialog"` + `aria-modal` na modalima; **Escape** zatvara samo gornji sloj.

### 🧵 Bogatiji podaci o proizvodu
- Po haljini: boja (sa swatch točkom), **materijal**, **kroj/fit**, **održavanje**
  — prikazani u modalu.

---

## 4. Prioritizirani plan daljnjih izmjena

Legenda učinka/truda: 🔴 visok · 🟡 srednji · 🟢 nizak

### Faza 1 — Temelj kvalitete (najveći učinak)

1. **🔴 Profesionalna, konzistentna fotografija** *(trud: 🟡)*
   - Iste pozadine, svjetlo i kadar za sve haljine; isti odnos stranica (npr. 4:5).
   - Po haljini min. 4 kadra: cijela naprijed, leđa, detalj tkanine, pokret/sjedeća.
   - Ukloniti tuđe vodene žigove (Pinterest/YouTube/strani logo) — koristiti
     isključivo izvorne, čiste fotografije u visokoj rezoluciji (≥1600 px).
   - Smjernice za snimanje: vidi **§6**.

2. **🔴 Uskladiti identitet brenda** *(trud: 🟢)*
   - Jedna domena, jedan IG handle, jedan e-mail svuda (uključujući žigove na slikama).

3. **🟡 Optimizacija slika** *(trud: 🟡)*
   - WebP/AVIF + `srcset`/`sizes`, lijeno učitavanje (već postoji `loading="lazy"`),
     `width`/`height` da se izbjegne "layout shift".

### Faza 2 — Stranice i konverzija

4. **🔴 Prave stranice proizvoda** (`/haljina/azzurra`) *(trud: 🔴)*
   - Vlastiti URL po haljini → SEO, dijeljenje, povezani proizvodi, recenzije.
   - Viewer (galerija/360°/3D) već je modularan i može se ponovno upotrijebiti.

5. **🔴 Recenzije i social proof** *(trud: 🟡)*
   - Zvjezdice + fotografije kupaca, "viđeno na Instagramu", oznake "Bestseller".

6. **🟡 Dostupnost po veličini i stanje zaliha** *(trud: 🟡)*
   - "Još 2 komada", "Rasprodano" po veličini; lista čekanja (back-in-stock e-mail).

7. **🟡 Filtri: boja, cijena, veličina, dužina** *(trud: 🟡)*
   - Swatch filtri po boji; raspon cijene; "dostupno u mojoj veličini".

### Faza 3 — Pravi e-commerce backend

8. **🔴 Stvarno plaćanje + narudžbe** *(trud: 🔴)*
   - PayPal/Stripe s pravim Client ID-em (sad je `"test"`); spremanje narudžbi
     (Shopify/Snipcart/Medusa ili lagani backend); e-mail potvrde.

9. **🟡 Newsletter na pravi servis** *(trud: 🟢)*
   - Mailchimp/Brevo umjesto trenutne "lažne" potvrde.

10. **🟢 Pravne stranice** *(trud: 🟢)*
    - Uvjeti, privatnost (GDPR), politika povrata/zamjene, dostava — gradi povjerenje.

### Faza 4 — "Najbolji u klasi" doživljaji

11. **🟡 Pravi 3D modeli haljina** *(trud: 🔴)*
    - Zamijeniti demo `.glb` stvarnim modelima (3D sken / izvoz iz CLO3D, Browzwear
      ili Blender). Pipeline i polja već postoje (`product.model`).

12. **🟡 Virtualna proba / „na meni"** *(trud: 🔴)*
    - Foto-na-modelu po tipu figure ili AI virtual try-on (npr. usluge tipa
      Doris/Veesual) — snažno smanjuje povrate.

13. **🟢 „Naruči izgled" / styling** *(trud: 🟡)*
    - Preporuke dodataka, "kompletiraj outfit", lookbook editorial.

---

## 5. 3D / AR — kako proširiti

Komponenta i podaci su spremni. Da neka haljina dobije 3D:

```js
// js/products.js
{ id: 4, name: "Viola", /* … */,
  model: "assets/models/viola.glb" }   // .glb se automatski prikaže kao "3D · AR"
```

**Kako doći do .glb modela:**
- **3D sken** haljine (fotogrametrija ili skener) → izvoz u glTF/GLB.
- **CLO3D / Browzwear** (modni 3D softver) → izvoz GLB.
- **Blender** za ručno modeliranje/dotjerivanje (kao priloženi demo).
- Optimizacija: [`gltf-transform`](https://gltf-transform.dev) ili Draco kompresija
  za male datoteke (cilj < 3–5 MB po modelu).

**360° umjesto/uz 3D:** snimite 24–36 kadrova u krug i dodajte `spin: [ ... ]`
— viewer automatski nudi karticu **360°** (povlačenje za rotaciju).

> Napomena: `<model-viewer>` se učitava s Google CDN-a u pregledniku posjetitelja.
> U izoliranom dev-okruženju bez interneta 3D se ne učita i viewer pada na
> fotografiju — na javnom hostingu (npr. GitHub Pages) radi normalno.

---

## 6. Smjernice za fotografiju (za modni tim)

Da bi katalog izgledao kao kod vrhunskih brendova:

- **Jedna pozadina** za cijelu kolekciju (npr. topla bež ili čista bijela).
- **Jedno svjetlo**: meko, difuzno; izbjegavati tvrde sjene i žute tonove.
- **Jedan kadar**: ista visina kamere, isti zoom, haljina uvijek u istom dijelu okvira.
- **Odnos stranica 4:5** (portret) — najbolji za web i Instagram.
- **Po haljini**: (1) cijela sprijeda, (2) leđa, (3) makro detalj tkanine/veza,
  (4) pokret ili sjedeća poza.
- **Rezolucija** ≥ 1600 px šire stranice; isporuka u WebP/AVIF.
- **Bez tuđih žigova**; ako treba žig, samo diskretan CELI logo u kutu.
- Po mogućnosti **dosljedan model/figura** kako bi se vidio pad i kroj haljine.

---

## 7. Brze pobjede (ovaj tjedan)

- [ ] Zamijeniti slike s vodenim žigovima čistim, visokorezolucijskim verzijama.
- [ ] Uskladiti domenu/IG/e-mail svuda.
- [ ] Dodati 2–4 dodatne fotografije po haljini (`images: [...]`) → galerija oživi.
- [ ] Snimiti 360° za 1–2 bestselera (`spin: [...]`).
- [ ] Postaviti pravi PayPal/Stripe Client ID i newsletter servis.
- [ ] Dodati stranice: povrat/zamjena, dostava, privatnost.
```

> Sve gore navedeno u Fazi 1–4 ne zahtijeva mijenjanje postojeće arhitekture —
> stranica ostaje brza i statična, a nadogradnje se dodaju postupno.
