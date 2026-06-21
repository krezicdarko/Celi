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

/*
  Polja po proizvodu:
    id, name, cat, tags[], price, oldPrice?, badge?, desc
    img        – glavna fotografija (obavezno)
    images[]   – galerija (opcionalno; ako nema, koristi se [img])
    spin[]     – sličice za 360° pregled (opcionalno)
    model      – .glb datoteka za interaktivni 3D / AR pregled (opcionalno)
    color      – {name, hex} prikaz boje
    fabric, care, fit – detalji za karticu proizvoda
*/
const PRODUCTS = [
  { id:1, name:"Azzurra", cat:"svecane", tags:["maxi"], price:329, badge:"Novo",
    img:"assets/products/p1.jpg",
    model:"assets/models/celi-3d-demo.glb",            // interaktivni 3D + AR demo
    color:{name:"Svjetloplava", hex:"#9fc3df"},
    fabric:"Elastične šljokice na podlozi od mesha",
    care:"Kemijsko čišćenje. Ne ribati šljokice.",
    fit:"Pripijeni kroj uz tijelo — za međuveličine preporučujemo veći broj.",
    desc:"Duga svečana haljina od svjetloplavih šljokica, asimetrična na jedno rame s profinjenim prorezom i strukom na preklop. Blistav izbor za vjenčanja i svečane prilike." },
  { id:2, name:"Fiore", cat:"svecane", tags:[], price:359, badge:"Bestseller",
    img:"assets/products/p2.jpg",
    color:{name:"Nude / cvjetna", hex:"#cdb79a"},
    fabric:"Čipka s 3D cvjetnim aplikacijama, podstava",
    care:"Kemijsko čišćenje.",
    fit:"Klasičan kroj, prati liniju tijela.",
    desc:"Haljina dugih rukava od cvjetne čipke u nude tonu, s 3D cvjetnim aplikacijama. Romantična elegancija za nezaboravne trenutke." },
  { id:3, name:"Limone", cat:"svecane", tags:["maxi"], price:339,
    img:"assets/products/p3.jpg",
    color:{name:"Pastelno žuta", hex:"#ecd98b"},
    fabric:"Elastične šljokice na mesh podlozi",
    care:"Kemijsko čišćenje.",
    fit:"Pripijeni kroj s naglašenim ramenima.",
    desc:"Duga haljina od pastelno žutih šljokica s dubokim V izrezom, naglašenim ramenima i cvjetnim detaljem u struku. Glamur s dozom svježine." },
  { id:4, name:"Viola", cat:"koktel", tags:[], price:229, badge:"Novo",
    img:"assets/products/p4.jpg",
    color:{name:"Lila", hex:"#9a86c4"},
    fabric:"Ručno šivene šljokice, strukturirana podloga",
    care:"Kemijsko čišćenje.",
    fit:"Mini kroj, pripijen — naglašava struk.",
    desc:"Mini koktel haljina bez naramenica, u potpunosti prekrivena lila šljokicama, sa srcolikim izrezom. Blista pod svjetlima — idealna za proslave." },
  { id:5, name:"Avorio", cat:"svecane", tags:["maxi"], price:299,
    img:"assets/products/p5.jpg",
    color:{name:"Bijela", hex:"#f3efe7"},
    fabric:"Čipka, podstava",
    care:"Kemijsko čišćenje.",
    fit:"Ženstveni kroj uz tijelo, dolčevita izrez.",
    desc:"Bijela čipkasta maxi haljina dugih rukava s dolčevita izrezom. Profinjena, ženstvena i bezvremenska — za posebne večeri." },
  { id:6, name:"Bianca", cat:"koktel", tags:[], price:199,
    img:"assets/products/p6.jpg",
    color:{name:"Bijela", hex:"#f5f2ec"},
    fabric:"Strukturirani krep",
    care:"Kemijsko čišćenje ili ručno pranje na 30°C.",
    fit:"Skulpturalan, strukturiran kroj.",
    desc:"Bijela mini haljina strukturiranog kroja s bandeau gornjim dijelom. Moderan, skulpturalan komad čistih linija." },
  { id:7, name:"Notte", cat:"koktel", tags:[], price:189, badge:"Bestseller",
    img:"assets/products/p7.jpg",
    color:{name:"Crna", hex:"#1d1b19"},
    fabric:"Strukturirani krep",
    care:"Kemijsko čišćenje.",
    fit:"Skulpturalan mini kroj. Manekenka nosi veličinu S.",
    desc:"Mala crna haljina skulpturalnog kroja — bezvremenski klasik koji uvijek ostavlja dojam." },
  { id:8, name:"Sabbia", cat:"dnevne", tags:[], price:179,
    img:"assets/products/p8.jpg",
    color:{name:"Taupe", hex:"#b7a890"},
    fabric:"Strukturirani krep",
    care:"Ručno pranje na 30°C.",
    fit:"Pripijeni mini kroj.",
    desc:"Mini haljina u toploj taupe nijansi s bandeau gornjim dijelom i strukturiranom suknjom. Elegantan izbor za dan i večer." },
  { id:9, name:"Seta", cat:"svecane", tags:["maxi"], price:349, badge:"Novo",
    img:"assets/products/p9.jpg",
    color:{name:"Bijela", hex:"#f4f1ea"},
    fabric:"Saten, draperirani korzet",
    care:"Kemijsko čišćenje.",
    fit:"Pripijeni kroj s tečnim padom. Manekenka nosi veličinu S.",
    desc:"Bijela satenska maxi haljina bez naramenica s draperiranim korzetom i tečnim padom tkanine. Raskošna elegancija za vjenčanja i svečanosti." },
];
