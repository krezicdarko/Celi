/* ===== CELI — product data (real photos from CELI Instagram) ===== */

/* Fallback stylised dress illustration (used only if a photo is missing) */
function dressSVG(opts){
  const { bg1="#efe6dc", bg2="#d7c4ad", dress="#cdb799", shade="#a98f6c", style="gown", sheen="rgba(255,255,255,.3)" } = opts||{};
  const gid="g"+Math.random().toString(36).slice(2,8);
  const gown="M118,86 C118,78 126,72 132,70 C140,62 160,62 168,70 C174,72 182,78 182,86 C180,112 172,132 166,150 C190,232 198,300 196,346 L104,346 C102,300 110,232 134,150 C128,132 120,112 118,86 Z";
  return `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="bg${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient><linearGradient id="dr${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sheen}"/><stop offset=".35" stop-color="${dress}"/><stop offset="1" stop-color="${shade}"/></linearGradient></defs><rect width="300" height="400" fill="url(#bg${gid})"/><path d="${gown}" fill="url(#dr${gid})"/></svg>`;
}

/* Gallery images for a product (falls back to the single `img`) */
function productImages(p){
  if(p && Array.isArray(p.images) && p.images.length) return p.images;
  if(p && p.img) return [p.img];
  return [];
}

/* Single media element for thumbnails (cards, cart, summary) */
function productMedia(p){
  const imgs = productImages(p);
  if(imgs.length) return `<img src="${imgs[0]}" alt="${p.name} — CELI" loading="lazy" decoding="async" onerror="this.outerHTML=dressSVG({})" />`;
  return dressSVG(p&&p.colors?p.colors:{});
}

/* 360° niz sličica za Viola (generirano: tools/make_spin.py) */
const VIOLA_SPIN = Array.from({length:24}, (_,i)=>
  `assets/spin/viola/frame_${String(i).padStart(2,"0")}.png`);

/*
  Polja po proizvodu:
    id, name, cat, tags[], price, oldPrice?, badge?, desc
    img        – glavna fotografija (obavezno)
    images[]   – galerija (opcionalno; ako nema, koristi se [img])
    spin[]     – sličice za 360° pregled (opcionalno)
    model      – .glb datoteka za interaktivni 3D / AR pregled (opcionalno)
    color      – {name, hex} prikaz boje
    fabric, care, fit – detalji za karticu proizvoda
    rating, reviewsCount, reviews[] – recenzije (social proof)
    stock      – {XS,S,M,L,XL} dostupnost po veličini (0 = rasprodano)
*/
const PRODUCTS = [
  { id:1, name:"Azzurra", cat:"svecane", tags:["maxi"], price:329, badge:"Novo",
    img:"assets/products/p1.jpg",
    model:"assets/models/celi-3d-demo.glb",            // interaktivni 3D + AR demo
    color:{name:"Svjetloplava", hex:"#9fc3df"},
    fabric:"Elastične šljokice na podlozi od mesha",
    care:"Kemijsko čišćenje. Ne ribati šljokice.",
    fit:"Pripijeni kroj uz tijelo — za međuveličine preporučujemo veći broj.",
    rating:4.9, reviewsCount:27, stock:{XS:3,S:5,M:4,L:2,XL:0},
    reviews:[
      {name:"Ivana M.", rating:5, text:"Haljina je prelijepa uživo, šljokice blistaju savršeno. Dobila sam hrpu komplimenata!"},
      {name:"Lana K.", rating:5, text:"Materijal kvalitetan, kroj naglašava figuru. 3D pregled mi je puno pomogao pri odabiru."}
    ],
    desc:"Duga svečana haljina od svjetloplavih šljokica, asimetrična na jedno rame s profinjenim prorezom i strukom na preklop. Blistav izbor za vjenčanja i svečane prilike." },
  { id:2, name:"Fiore", cat:"svecane", tags:[], price:359, badge:"Bestseller",
    img:"assets/products/p2.jpg",
    color:{name:"Nude / cvjetna", hex:"#cdb79a"},
    fabric:"Čipka s 3D cvjetnim aplikacijama, podstava",
    care:"Kemijsko čišćenje.",
    fit:"Klasičan kroj, prati liniju tijela.",
    rating:5.0, reviewsCount:41, stock:{XS:2,S:6,M:6,L:3,XL:1},
    reviews:[
      {name:"Marija P.", rating:5, text:"Najljepša haljina koju sam ikad obukla. Čipka i cvjetni detalji su božanstveni."},
      {name:"Anja T.", rating:5, text:"Stigla brzo, izgleda još bolje nego na slici. Preporučujem!"}
    ],
    desc:"Haljina dugih rukava od cvjetne čipke u nude tonu, s 3D cvjetnim aplikacijama. Romantična elegancija za nezaboravne trenutke." },
  { id:3, name:"Limone", cat:"svecane", tags:["maxi"], price:339,
    img:"assets/products/p3.jpg",
    color:{name:"Pastelno žuta", hex:"#ecd98b"},
    fabric:"Elastične šljokice na mesh podlozi",
    care:"Kemijsko čišćenje.",
    fit:"Pripijeni kroj s naglašenim ramenima.",
    rating:4.7, reviewsCount:14, stock:{XS:1,S:3,M:3,L:2,XL:2},
    reviews:[
      {name:"Petra V.", rating:5, text:"Boja je predivna, savršena za ljetne svečanosti."},
      {name:"Dora S.", rating:4, text:"Lijepa haljina, ramena su nešto strukturiranija nego što sam očekivala — ali odlično stoji."}
    ],
    desc:"Duga haljina od pastelno žutih šljokica s dubokim V izrezom, naglašenim ramenima i cvjetnim detaljem u struku. Glamur s dozom svježine." },
  { id:4, name:"Viola", cat:"koktel", tags:[], price:229, badge:"Novo",
    img:"assets/products/p4.jpg",
    spin:VIOLA_SPIN,                                   // interaktivni 360° pregled
    color:{name:"Lila", hex:"#9a86c4"},
    fabric:"Ručno šivene šljokice, strukturirana podloga",
    care:"Kemijsko čišćenje.",
    fit:"Mini kroj, pripijen — naglašava struk.",
    rating:4.8, reviewsCount:19, stock:{XS:4,S:5,M:5,L:3,XL:2},
    reviews:[
      {name:"Klara B.", rating:5, text:"Blista nevjerojatno pod svjetlima! 360° pregled mi je odmah prodao haljinu."},
      {name:"Nina R.", rating:5, text:"Savršena za izlazak, struk je fantastično naglašen."}
    ],
    desc:"Mini koktel haljina bez naramenica, u potpunosti prekrivena lila šljokicama, sa srcolikim izrezom. Blista pod svjetlima — idealna za proslave." },
  { id:5, name:"Avorio", cat:"svecane", tags:["maxi"], price:299,
    img:"assets/products/p5.jpg",
    color:{name:"Bijela", hex:"#f3efe7"},
    fabric:"Čipka, podstava",
    care:"Kemijsko čišćenje.",
    fit:"Ženstveni kroj uz tijelo, dolčevita izrez.",
    rating:4.6, reviewsCount:9, stock:{XS:0,S:2,M:3,L:2,XL:1},
    reviews:[
      {name:"Helena Đ.", rating:5, text:"Bezvremenska elegancija, čipka je prekrasna. Idealna za vjenčanje."}
    ],
    desc:"Bijela čipkasta maxi haljina dugih rukava s dolčevita izrezom. Profinjena, ženstvena i bezvremenska — za posebne večeri." },
  { id:6, name:"Bianca", cat:"koktel", tags:[], price:199, oldPrice:239,
    img:"assets/products/p6.jpg",
    color:{name:"Bijela", hex:"#f5f2ec"},
    colors:[{name:"Bijela", hex:"#f5f2ec"},{name:"Crna", hex:"#1d1b19"}],
    fabric:"Strukturirani krep",
    care:"Kemijsko čišćenje ili ručno pranje na 30°C.",
    fit:"Skulpturalan, strukturiran kroj.",
    rating:4.5, reviewsCount:11, stock:{XS:3,S:4,M:4,L:3,XL:2},
    reviews:[
      {name:"Tea M.", rating:4, text:"Moderan kroj, čvrst materijal koji lijepo drži liniju."},
      {name:"Sara L.", rating:5, text:"Bijela boja je čista i elegantna, super za koktele."}
    ],
    desc:"Bijela mini haljina strukturiranog kroja s bandeau gornjim dijelom. Moderan, skulpturalan komad čistih linija." },
  { id:7, name:"Notte", cat:"koktel", tags:[], price:189, badge:"Bestseller",
    img:"assets/products/p7.jpg",
    color:{name:"Crna", hex:"#1d1b19"},
    colors:[{name:"Crna", hex:"#1d1b19"},{name:"Tamno crvena", hex:"#6e1320"},{name:"Smaragdna", hex:"#10503a"}],
    fabric:"Strukturirani krep",
    care:"Kemijsko čišćenje.",
    fit:"Skulpturalan mini kroj. Manekenka nosi veličinu S.",
    rating:4.9, reviewsCount:53, stock:{XS:5,S:8,M:7,L:5,XL:3},
    reviews:[
      {name:"Ema J.", rating:5, text:"Mala crna koja uvijek pali. Kvaliteta vrhunska, nosit ću je godinama."},
      {name:"Iva C.", rating:5, text:"Savršen kroj, izgleda skupocjeno. Najbolja kupnja ove godine."}
    ],
    desc:"Mala crna haljina skulpturalnog kroja — bezvremenski klasik koji uvijek ostavlja dojam." },
  { id:8, name:"Sabbia", cat:"dnevne", tags:[], price:179,
    img:"assets/products/p8.jpg",
    color:{name:"Taupe", hex:"#b7a890"},
    colors:[{name:"Taupe", hex:"#b7a890"},{name:"Maslinasta", hex:"#6b6b3a"}],
    fabric:"Strukturirani krep",
    care:"Ručno pranje na 30°C.",
    fit:"Pripijeni mini kroj.",
    rating:4.4, reviewsCount:7, stock:{XS:2,S:3,M:3,L:2,XL:1},
    reviews:[
      {name:"Lucija K.", rating:4, text:"Lijepa neutralna boja koja ide uz sve. Udobna za cijeli dan."}
    ],
    desc:"Mini haljina u toploj taupe nijansi s bandeau gornjim dijelom i strukturiranom suknjom. Elegantan izbor za dan i večer." },
  { id:9, name:"Seta", cat:"svecane", tags:["maxi"], price:349, badge:"Novo",
    img:"assets/products/p9.jpg",
    color:{name:"Bijela", hex:"#f4f1ea"},
    fabric:"Saten, draperirani korzet",
    care:"Kemijsko čišćenje.",
    fit:"Pripijeni kroj s tečnim padom. Manekenka nosi veličinu S.",
    rating:5.0, reviewsCount:22, stock:{XS:2,S:4,M:4,L:3,XL:1},
    reviews:[
      {name:"Mia F.", rating:5, text:"Satenska bajka. Draperija na korzetu je savršeno izvedena."},
      {name:"Karla N.", rating:5, text:"Nosila sam je na vjenčanju, osjećala sam se kao princeza."}
    ],
    desc:"Bijela satenska maxi haljina bez naramenica s draperiranim korzetom i tečnim padom tkanine. Raskošna elegancija za vjenčanja i svečanosti." },
];
