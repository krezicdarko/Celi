# Istraživanje konkurencije — najbolje web trgovine za haljine

> Analiza najboljih svjetskih modnih web trgovina i prijenos njihovih najboljih
> praksi na CELI. Fokus: stranica proizvoda, varijante (boja/veličina), zalihe i
> povjerenje. Na kraju je popis **što je implementirano** u CELI.

## Tko postavlja standard

| Brend | Po čemu je najbolji |
|---|---|
| **Net-a-Porter / Farfetch** | Luksuzni PDP, bogata galerija, detalji tkanine, "size & fit", urednička priča |
| **Revolve** | Recenzije s ocjenama i fotografijama kupaca, "model nosi veličinu", brzo filtriranje |
| **Reformation** | Minimalan dizajn, bold fotografija, vrlo detaljan PDP, lookbook/"Stories" |
| **House of CB** | Fokus na pripijene haljine, jasan size guide, fit video, urgentnost zaliha |
| **Zara / ASOS** | Brzo pretraživanje, filtri po dostupnosti veličine/boje, 360°/video, čist mobilni UX |
| **Lulus** | Recenzije po veličini ("true to size"), "back in stock" obavijesti |

## Što rade bolje (i što smo preuzeli)

### 1. Stranica proizvoda (PDP)
- **Galerija + zoom + video/360°/3D** — više kadrova, detalj tkanine, pokret.
  → CELI: viewer **Foto / 360° / 3D·AR**, zoom na pomak, galerija sa sličicama.
- **Swatch za boje, ne padajući izbornik** — boje vidljive na prvi pogled.
  → CELI: swatch odabir boje u modalu + točkice boja na karticama.
- **Dostupnost po veličini** — nedostupne veličine *prekrižene/onemogućene*, ne skrivene.
  → CELI: rasprodane veličine onemogućene i prekrižene, vezane na stvarne zalihe.
- **Recenzije s ocjenama** kao social proof.
  → CELI: ocjene (★) na karticama i u modalu + tekstualne recenzije.
- **Size guide + "model nosi veličinu"**.
  → CELI: vodič za veličine (tablica mjera) + napomena o kroju/manekenki.

### 2. Urgentnost i dostupnost (bez manipulacije)
- **"Još 2 u veličini M"** — istinita oskudica potiče odluku.
  → CELI: prikaz „⚡ Još samo N kom" kad je zaliha niska (≤3).
- **Rana transparentnost zaliha** (ne tek na blagajni).
  → CELI: stanje vidljivo odmah u modalu i na kartici (oznaka „Rasprodano").
- **Back-in-stock obavijest** za rasprodano (sekundarni CTA).
  → CELI: forma „Obavijesti me kad bude dostupno".

### 3. Konverzija i povjerenje
- **Besplatna dostava — progres bar** ("još X KM").
  → CELI: traka napretka do besplatne dostave u košarici.
- **Nedavno pregledano** i **lista želja**.
  → CELI: sekcija „Nedavno pregledano" + wishlist s filterom.
- **Filtri i sortiranje** (boja, cijena, ocjena, novo).
  → CELI: filter po boji + sortiranje (cijena/ocjena/novo).
- **Pravne stranice** (dostava, povrat, privatnost, uvjeti).
  → CELI: `info.html` + poveznice u podnožju.
- **Strukturirani podaci + dijeljive poveznice**.
  → CELI: JSON-LD `Product` s ocjenama; `#p=ID` otvara proizvod (dijeljenje).

### 4. Skladišno poslovanje (kao velike firme)
Veliki trgovci vode zalihe na razini **SKU = model × boja × veličina**, s
**niskim-zaliha upozorenjima**, **točkom narudžbe (reorder point)**, **kretanjem
zaliha** i automatskim **skidanjem sa stanja pri prodaji**.
→ CELI: cijeli **inventar sustav** (vidi `EVIDENCIJA-ZALIHA.md`).

## Što još (roadmap, nije nužno za demo)
- Pravi backend/baza za zalihe i narudžbe (više korisnika, više lokacija/skladišta).
- Recenzije koje pišu kupci (uz moderaciju) + "true to size" glasovanje.
- Po-boji različite fotografije i 360°/3D po varijanti.
- AI/virtualna proba ("na meni"), preporuke "kompletiraj izgled".
- Povezivanje s POS-om i kurirskim/ERP sustavima (omnichannel sync).

---

*Izvori istraživanja:* Shopify Enterprise (best fashion ecommerce), Vervaunt
(luxury ecommerce), MobiLoud i VWO (PDP best practices), Econsultancy (stock
urgency), Shopify (SKU/stock keeping unit guides).
