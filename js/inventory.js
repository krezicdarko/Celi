/* =========================================================================
   CELI — Inventory engine (evidencija skladišta)
   -------------------------------------------------------------------------
   Vodi stanje zaliha na razini SKU-a: MODEL × BOJA × VELIČINA, kao u velikim
   trgovinama. Pohranjuje se u localStorage (demo); spremno za prijenos na
   pravi backend (isti model podataka + REST/DB).

   API (window.CeliInventory):
     SIZES, LOW_STOCK, REORDER_POINT
     colorsOf(p)                 -> [{name,hex}]
     sku(id, color, size)        -> "CELI-1-SVJ-M"
     qty(id, color, size)        -> broj komada
     setQty(id,color,size,n,reason)
     adjust(id,color,size,delta,reason)
     decrementOrder(lines)       -> skida sa zalihe pri narudžbi
     productStock(id, color)     -> {XS,S,M,L,XL}
     productTotal(id)            -> ukupno komada modela
     status(id,color,size)       -> "in" | "low" | "out"
     totals()                    -> {skus,units,value,low,out,models}
     lowList(), outList()        -> popisi za upozorenja
     log()                       -> zapis kretanja zaliha
     all()                       -> sirovi zapis svih SKU-ova
     exportJSON(), importJSON(s), reset()
   ========================================================================= */
(function(){
  "use strict";
  const KEY = "celi_inventory_v1";
  const SIZES = ["XS","S","M","L","XL"];
  const LOW_STOCK = 3;        // ispod ili jednako => niska zaliha
  const REORDER_POINT = 5;    // preporuka za narudžbu
  const DEFAULT_QTY = 4;

  const slug = s => (s||"").toString()
    .replace(/č|ć/gi,"c").replace(/š/gi,"s").replace(/ž/gi,"z").replace(/đ/gi,"d")
    .replace(/[^a-z0-9]/gi,"").toUpperCase();

  function colorsOf(p){
    if(p && Array.isArray(p.colors) && p.colors.length) return p.colors;
    if(p && p.color) return [p.color];
    return [{name:"Standard", hex:"#cbb89a"}];
  }
  function colorCode(name){ return (slug(name).slice(0,3) || "STD"); }
  function sku(id, color, size){ return `CELI-${id}-${colorCode(color)}-${size}`; }

  const byId = id => (typeof PRODUCTS!=="undefined") ? PRODUCTS.find(p=>p.id===id) : null;

  /* Build default inventory from product catalogue */
  function defaults(){
    const items = {};
    if(typeof PRODUCTS==="undefined") return {version:1, updatedAt:Date.now(), items, log:[]};
    PRODUCTS.forEach(p=>{
      colorsOf(p).forEach(c=>{
        SIZES.forEach(s=>{
          const base = p.stock && (s in p.stock) ? p.stock[s] : DEFAULT_QTY;
          items[sku(p.id,c.name,s)] = { id:p.id, model:p.name, color:c.name, size:s, qty:base, price:p.price };
        });
      });
    });
    return { version:1, updatedAt:Date.now(), items, log:[] };
  }

  function read(){
    let inv;
    try{ inv = JSON.parse(localStorage.getItem(KEY)); }catch{ inv = null; }
    if(!inv || !inv.items){ inv = defaults(); write(inv); return inv; }
    // merge any newly added SKUs (new products/colors) without touching existing qty
    const def = defaults();
    let changed = false;
    for(const k in def.items){ if(!(k in inv.items)){ inv.items[k] = def.items[k]; changed = true; } }
    if(changed) write(inv);
    return inv;
  }
  function write(inv){ inv.updatedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(inv)); }

  function logMove(inv, sk, delta, reason){
    inv.log = inv.log || [];
    inv.log.unshift({ ts:Date.now(), sku:sk, delta, reason:reason||"", qty:inv.items[sk]?inv.items[sk].qty:0 });
    if(inv.log.length>200) inv.log.length = 200;
  }

  /* ---------- public reads ---------- */
  function qty(id,color,size){ const inv=read(); const it=inv.items[sku(id,color,size)]; return it?it.qty:0; }

  function productStock(id,color){
    const m={}; SIZES.forEach(s=> m[s]=qty(id,color,s)); return m;
  }
  function productTotal(id){
    const p=byId(id); if(!p) return 0;
    let t=0; colorsOf(p).forEach(c=>SIZES.forEach(s=> t+=qty(id,c.name,s))); return t;
  }
  function status(id,color,size){ const n=qty(id,color,size); return n<=0?"out":(n<=LOW_STOCK?"low":"in"); }

  /* ---------- public writes ---------- */
  function setQty(id,color,size,n,reason){
    const inv=read(); const sk=sku(id,color,size);
    if(!inv.items[sk]){ const p=byId(id); inv.items[sk]={id,model:p?p.name:"",color,size,qty:0,price:p?p.price:0}; }
    n=Math.max(0, Math.floor(+n||0));
    const delta = n - inv.items[sk].qty;
    inv.items[sk].qty = n;
    if(delta!==0) logMove(inv, sk, delta, reason||"Ručna izmjena");
    write(inv); return n;
  }
  function adjust(id,color,size,delta,reason){
    return setQty(id,color,size, qty(id,color,size)+ (+delta||0), reason);
  }
  function decrementOrder(lines, oid){
    const inv=read();
    (lines||[]).forEach(l=>{
      const c = l.color || (byId(l.id)? colorsOf(byId(l.id))[0].name : "Standard");
      const sk = sku(l.id, c, l.size);
      if(!inv.items[sk]) return;
      const before = inv.items[sk].qty;
      inv.items[sk].qty = Math.max(0, before - (l.qty||1));
      const delta = inv.items[sk].qty - before;
      if(delta!==0) logMove(inv, sk, delta, "Prodaja"+(oid?` ${oid}`:""));
    });
    write(inv);
  }

  /* ---------- analytics ---------- */
  function all(){ return read().items; }
  function lowList(){ const it=read().items; return Object.entries(it).filter(([,v])=>v.qty>0&&v.qty<=LOW_STOCK).map(([k,v])=>({sku:k,...v})); }
  function outList(){ const it=read().items; return Object.entries(it).filter(([,v])=>v.qty<=0).map(([k,v])=>({sku:k,...v})); }
  function totals(){
    const it=read().items; let units=0,value=0,low=0,out=0; const models=new Set();
    Object.values(it).forEach(v=>{ units+=v.qty; value+=v.qty*(v.price||0); models.add(v.id);
      if(v.qty<=0) out++; else if(v.qty<=LOW_STOCK) low++; });
    return { skus:Object.keys(it).length, units, value, low, out, models:models.size };
  }
  function log(){ return read().log || []; }

  function exportJSON(){ return JSON.stringify(read(), null, 2); }
  function importJSON(str){
    const inv = JSON.parse(str);
    if(!inv || !inv.items) throw new Error("Neispravan format");
    write(inv); return true;
  }
  function reset(){ const d=defaults(); write(d); return d; }

  window.CeliInventory = {
    SIZES, LOW_STOCK, REORDER_POINT,
    colorsOf, colorCode, sku,
    qty, productStock, productTotal, status,
    setQty, adjust, decrementOrder,
    all, lowList, outList, totals, log,
    exportJSON, importJSON, reset
  };
})();
