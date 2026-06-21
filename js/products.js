/* ===== CELI — product data (real photos from CELI Instagram) ===== */

/* Fallback stylised dress illustration (used only if a photo is missing) */
function dressSVG(opts){
  const { bg1="#efe6dc", bg2="#d7c4ad", dress="#cdb799", shade="#a98f6c", style="gown", sheen="rgba(255,255,255,.3)" } = opts||{};
  const gid="g"+Math.random().toString(36).slice(2,8);
  const gown="M118,86 C118,78 126,72 132,70 C140,62 160,62 168,70 C174,72 182,78 182,86 C180,112 172,132 166,150 C190,232 198,300 196,346 L104,346 C102,300 110,232 134,150 C128,132 120,112 118,86 Z";
  return `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="bg${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient><linearGradient id="dr${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sheen}"/><stop offset=".35" stop-color="${dress}"/><stop offset="1" stop-color="${shade}"/></linearGradient></defs><rect width="300" height="400" fill="url(#bg${gid})"/><path d="${gown}" fill="url(#dr${gid})"/></svg>`;
}

/* Media helper — returns an <img> for a product (falls back to SVG) */
function productMedia(p){
  if(p && p.img) return `<img src="${p.img}" alt="${p.name} — CELI" loading="lazy" decoding="async" onerror="this.outerHTML=dressSVG({})" />`;
  return dressSVG(p&&p.colors?p.colors:{});
}

const PRODUCTS = [
  { id:1, name:"Azzurra", cat:"svecane", tags:["maxi"], price:329, badge:"Novo",
    img:"assets/products/p1.jpg",
    desc:"Duga svečana haljina od svjetloplavih šljokica, asimetrična na jedno rame s profinjenim prorezom i strukom na preklop. Blistav izbor za vjenčanja i svečane prilike." },
  { id:2, name:"Fiore", cat:"svecane", tags:[], price:359, badge:"Bestseller",
    img:"assets/products/p2.jpg",
    desc:"Haljina dugih rukava od cvjetne čipke u nude tonu, s 3D cvjetnim aplikacijama. Romantična elegancija za nezaboravne trenutke." },
  { id:3, name:"Limone", cat:"svecane", tags:["maxi"], price:339,
    img:"assets/products/p3.jpg",
    desc:"Duga haljina od pastelno žutih šljokica s dubokim V izrezom, naglašenim ramenima i cvjetnim detaljem u struku. Glamur s dozom svježine." },
  { id:4, name:"Viola", cat:"koktel", tags:[], price:229, badge:"Novo",
    img:"assets/products/p4.jpg",
    desc:"Mini koktel haljina bez naramenica, u potpunosti prekrivena lila šljokicama, sa srcolikim izrezom. Blista pod svjetlima — idealna za proslave." },
  { id:5, name:"Avorio", cat:"svecane", tags:["maxi"], price:299,
    img:"assets/products/p5.jpg",
    desc:"Bijela čipkasta maxi haljina dugih rukava s dolčevita izrezom. Profinjena, ženstvena i bezvremenska — za posebne večeri." },
  { id:6, name:"Bianca", cat:"koktel", tags:[], price:199,
    img:"assets/products/p6.jpg",
    desc:"Bijela mini haljina strukturiranog kroja s bandeau gornjim dijelom. Moderan, skulpturalan komad čistih linija." },
  { id:7, name:"Notte", cat:"koktel", tags:[], price:189, badge:"Bestseller",
    img:"assets/products/p7.jpg",
    desc:"Mala crna haljina skulpturalnog kroja — bezvremenski klasik koji uvijek ostavlja dojam." },
  { id:8, name:"Sabbia", cat:"dnevne", tags:[], price:179,
    img:"assets/products/p8.jpg",
    desc:"Mini haljina u toploj taupe nijansi s bandeau gornjim dijelom i strukturiranom suknjom. Elegantan izbor za dan i večer." },
  { id:9, name:"Seta", cat:"svecane", tags:["maxi"], price:349, badge:"Novo",
    img:"assets/products/p9.jpg",
    desc:"Bijela satenska maxi haljina bez naramenica s draperiranim korzetom i tečnim padom tkanine. Raskošna elegancija za vjenčanja i svečanosti." },
];
