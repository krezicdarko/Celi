/* ===== CELI — product data + SVG illustration generator ===== */

/* Stylised dress illustration (no external images needed) */
function dressSVG(opts){
  const { bg1, bg2, dress, shade, style = "gown", sheen = "rgba(255,255,255,.28)" } = opts;
  const gid = "g" + Math.random().toString(36).slice(2,8);
  const gown = "M118,86 C118,78 126,72 132,70 C140,62 160,62 168,70 C174,72 182,78 182,86 "+
    "C180,112 172,132 166,150 C190,232 198,300 196,346 L104,346 "+
    "C102,300 110,232 134,150 C128,132 120,112 118,86 Z";
  const mini = "M116,86 C116,78 124,72 130,70 C140,62 160,62 170,70 C176,72 184,78 184,86 "+
    "C181,116 176,138 172,152 C180,186 186,214 188,236 L112,236 "+
    "C114,214 120,186 128,152 C124,138 119,116 116,86 Z";
  const set  = "M118,86 C118,78 126,72 132,70 C140,62 160,62 168,70 C174,72 182,78 182,86 "+
    "C179,112 172,128 168,140 L132,140 C128,128 121,112 118,86 Z "+
    "M126,158 L174,158 C182,196 186,220 188,250 L112,250 C114,220 118,196 126,158 Z";
  const path = style === "mini" ? mini : style === "set" ? set : gown;
  return `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
      </linearGradient>
      <linearGradient id="dr${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${sheen}"/><stop offset=".35" stop-color="${dress}"/>
        <stop offset="1" stop-color="${shade}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#bg${gid})"/>
    <circle cx="150" cy="55" r="22" fill="#000" opacity="0.06"/>
    <ellipse cx="150" cy="372" rx="78" ry="12" fill="#000" opacity="0.08"/>
    <path d="${path}" fill="url(#dr${gid})" stroke="${shade}" stroke-width="1" stroke-opacity=".5"/>
    <path d="M150,72 L150,${style==='gown'?'342':style==='set'?'246':'232'}" stroke="${sheen}" stroke-width="2" stroke-opacity=".5"/>
  </svg>`;
}

const PRODUCTS = [
  { id:1, name:"Azzurra", cat:"svecane", tags:["maxi"], price:289, badge:"Novo",
    style:"gown", colors:{bg1:"#dfe7ee",bg2:"#c2cfdd",dress:"#7f9bb6",shade:"#5b7894"},
    desc:"Duga svečana haljina od draperiranog šifona s elegantnim prorezom. Savršena za vjenčanja i svečane prilike." },
  { id:2, name:"Perla", cat:"svecane", tags:[], price:349, oldPrice:399, badge:"Bestseller",
    style:"gown", colors:{bg1:"#f3ede2",bg2:"#e2d6c2",dress:"#f7f1e6",shade:"#d8cab2",sheen:"rgba(255,255,255,.6)"},
    desc:"Haljina dugih rukava ručno ukrašena perlicama i biserima. Profinjen sjaj za nezaboravne trenutke." },
  { id:3, name:"Limone", cat:"dnevne", tags:[], price:189,
    style:"set", colors:{bg1:"#f6f1d9",bg2:"#ece2b4",dress:"#ecdf9a",shade:"#cdbd6e"},
    desc:"Tweed haljina-blazer u nježnoj žutoj nijansi. Sofisticiran dnevni komad s elegantnim dugmadima." },
  { id:4, name:"Viola", cat:"koktel", tags:[], price:229, badge:"Novo",
    style:"mini", colors:{bg1:"#ece2ee",bg2:"#d6c2dd",dress:"#9b6fb0",shade:"#7a4f90",sheen:"rgba(255,255,255,.45)"},
    desc:"Mini koktel haljina prekrivena šljokicama. Blista pod svjetlima — idealna za izlaske i proslave." },
  { id:5, name:"Bianca", cat:"koktel", tags:[], price:199,
    style:"set", colors:{bg1:"#f7f4ef",bg2:"#e8e1d6",dress:"#fbfaf7",shade:"#ded6c8",sheen:"rgba(255,255,255,.6)"},
    desc:"Bijeli dvodijelni set — top i suknja čistih linija. Moderno i prozračno za svaku priliku." },
  { id:6, name:"Aria", cat:"koktel", tags:[], price:179,
    style:"mini", colors:{bg1:"#f4f1ec",bg2:"#e6ddd0",dress:"#fbfaf8",shade:"#dcd2c2",sheen:"rgba(255,255,255,.6)"},
    desc:"Asimetrična mini haljina na jedno rame. Minimalistički kroj koji naglašava liniju tijela." },
  { id:7, name:"Notte", cat:"koktel", tags:[], price:169, badge:"Bestseller",
    style:"mini", colors:{bg1:"#e9e6e2",bg2:"#cdc7c1",dress:"#2a2622",shade:"#100e0c"},
    desc:"Mala crna haljina — bezvremenski klasik. Pripijeni kroj koji uvijek ostavlja dojam." },
  { id:8, name:"Sabbia", cat:"dnevne", tags:[], price:159,
    style:"set", colors:{bg1:"#f1ebe1",bg2:"#e0d3bf",dress:"#cdb799",shade:"#a98f6c"},
    desc:"Bež set u tonu pijeska — top i mini suknja. Topla neutralna nijansa za elegantan dnevni izgled." },
  { id:9, name:"Cioccolato", cat:"svecane", tags:["maxi"], price:269,
    style:"gown", colors:{bg1:"#efe6dc",bg2:"#d7c4ad",dress:"#7a5436",shade:"#553620",sheen:"rgba(255,235,210,.4)"},
    desc:"Satenska maxi haljina u bogatoj čokoladnoj nijansi. Tečan pad tkanine za rasksošan dojam." },
  { id:10, name:"Avorio", cat:"svecane", tags:["maxi"], price:299, badge:"Novo",
    style:"gown", colors:{bg1:"#f6f2eb",bg2:"#e6dccd",dress:"#f4ece0",shade:"#d6c7b1",sheen:"rgba(255,255,255,.6)"},
    desc:"Draperirana satenska maxi haljina boje slonovače. Bezvremenska elegancija za posebne večeri." },
  { id:11, name:"Eclisse", cat:"svecane", tags:["maxi"], price:259,
    style:"gown", colors:{bg1:"#e8e6e3",bg2:"#c9c4be",dress:"#23201d",shade:"#0d0b09"},
    desc:"Duga crna večernja haljina profinjenih linija. Diskretna raskoš za najformalnije prilike." },
  { id:12, name:"Rosa", cat:"koktel", tags:[], price:189, oldPrice:219,
    style:"mini", colors:{bg1:"#f6ebe9",bg2:"#e7cdc9",dress:"#d99fa3",shade:"#bb7a80"},
    desc:"Romantična koktel haljina u puder roza tonu. Nježna ženstvenost za proljetne proslave." },
];
