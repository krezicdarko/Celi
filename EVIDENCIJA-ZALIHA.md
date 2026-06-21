# Evidencija zaliha (inventar) — CELI

Sustav vođenja skladišta na razini **SKU = model × boja × veličina**, kakav
koriste velike trgovine. U ovom demu podaci se čuvaju u pregledniku
(`localStorage`), a model podataka je spreman za prijenos na pravi backend/bazu.

## Admin panel — `admin.html`

Otvorite **`admin.html`** (poveznica „Upravljanje zalihama" u podnožju trgovine).

Što nudi:

- **KPI nadzorna ploča:** broj modela, SKU varijanti, ukupno komada na stanju,
  **vrijednost zaliha (KM)**, broj varijanti s niskom zalihom i rasprodanih.
- **Upozorenja zaliha:** popis *rasprodanih* i *niska-zaliha* varijanti s brzim
  gumbima za zaprimanje robe (**+5 / +10**).
- **Tablica zaliha po artiklu:** za svaki model, mreža **boja × veličina** s
  poljima za unos količine. Promjena se **odmah sprema** i bilježi.
  Boje polja: žuto = niska zaliha, crveno = rasprodano.
- **Kretanje zaliha (log):** tko/kad/koliko — svaka izmjena i svaka prodaja.
- **Narudžbe:** popis zaprimljenih narudžbi (iz blagajne) s artiklima i iznosom.
- **Izvoz / uvoz (JSON)** i **vraćanje na zadano**.

## Kako je povezano s trgovinom

- Trgovina čita **stvarne zalihe**: rasprodane veličine su onemogućene, niska
  zaliha prikazuje „⚡ Još samo N kom", a rasprodani model dobiva oznaku.
- Pri **dovršetku narudžbe** (blagajna) zalihe se **automatski skidaju**
  (model × boja × veličina) i narudžba se zapisuje.
- **Back-in-stock**: kupac može ostaviti e-mail za obavijest kad varijanta stigne.

## Parametri (zadano)

| Parametar | Vrijednost | Gdje |
|---|---|---|
| Niska zaliha (low stock) | ≤ 3 kom | `js/inventory.js` → `LOW_STOCK` |
| Točka narudžbe (reorder point) | ≤ 5 kom | `js/inventory.js` → `REORDER_POINT` |
| Zadana početna količina | 4 kom | `js/inventory.js` → `DEFAULT_QTY` |

## Model podataka (SKU)

```
SKU            id  model     boja          veličina  qty
CELI-7-CRN-M   7   Notte     Crna          M         7
CELI-7-TAM-S   7   Notte     Tamno crvena  S         3
CELI-1-SVJ-XL  1   Azzurra   Svjetloplava  XL        0   (rasprodano)
```

Spremnik (`localStorage` ključ `celi_inventory_v1`):

```json
{
  "version": 1,
  "updatedAt": 0,
  "items": { "CELI-7-CRN-M": { "id":7, "model":"Notte", "color":"Crna", "size":"M", "qty":7, "price":189 } },
  "log":   [ { "ts":0, "sku":"CELI-7-CRN-M", "delta":-1, "reason":"Prodaja CELI-123456", "qty":7 } ]
}
```

## Prijelaz na produkciju (pravi backend)

Demo koristi `localStorage` (vrijedi po pregledniku/uređaju). Za stvarno
poslovanje s **jedinstvenim stanjem skladišta** za sve korisnike:

1. Iste funkcije iz `js/inventory.js` preslikati na REST API + bazu
   (npr. Postgres/MySQL ili gotov sustav: Shopify, Medusa, Snipcart…).
2. Skidanje sa stanja izvoditi **na serveru** pri plaćanju (atomarno, uz rezervaciju
   zaliha u košarici) kako bi se izbjegla dvostruka prodaja.
3. Dodati uloge/prijavu za admin panel, više skladišta/lokacija i POS/ERP sync.
4. Izvoz (JSON) iz admina koristiti za početni uvoz u bazu.
