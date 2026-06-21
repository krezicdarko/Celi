/* ===== CELI — Admin / skladište (inventar) ===== */
(function(){
  "use strict";
  const INV = window.CeliInventory;
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
  const money = n => Math.round(n).toLocaleString("hr-HR") + " KM";
  const byId  = id => PRODUCTS.find(p=>p.id===id);
  const esc = s => (s||"").toString().replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));

  let filterText = "";
  let lowOnly = false;

  /* ---------- KPI ---------- */
  function renderStats(){
    const t = INV.totals();
    const cards = [
      ["Modeli", t.models, ""],
      ["SKU varijante", t.skus, ""],
      ["Komada na stanju", t.units, ""],
      ["Vrijednost zaliha", money(t.value), ""],
      ["Niska zaliha", t.low, t.low>0?"warn":""],
      ["Rasprodano", t.out, t.out>0?"bad":""],
    ];
    $("#stats").innerHTML = cards.map(([l,v,cls])=>
      `<div class="kpi ${cls}"><span class="kpi__val">${v}</span><span class="kpi__lbl">${l}</span></div>`).join("");
  }

  /* ---------- Alerts ---------- */
  function renderAlerts(){
    const out = INV.outList(), low = INV.lowList();
    if(!out.length && !low.length){
      $("#alerts").innerHTML = `<p class="alerts__ok">✓ Sve varijante su dovoljno na zalihi.</p>`;
      return;
    }
    const row = it => `<div class="alert ${it.qty<=0?'alert--out':'alert--low'}">
        <span class="alert__sku" title="${it.sku}">${esc(it.model)} · ${esc(it.color)} · ${it.size}</span>
        <span class="alert__qty">${it.qty} kom</span>
        <span class="alert__act">
          <button data-restock="5" data-id="${it.id}" data-color="${esc(it.color)}" data-size="${it.size}">+5</button>
          <button data-restock="10" data-id="${it.id}" data-color="${esc(it.color)}" data-size="${it.size}">+10</button>
        </span>
      </div>`;
    $("#alerts").innerHTML =
      (out.length?`<h3 class="alerts__h">Rasprodano (${out.length})</h3>`+out.map(row).join(""):"") +
      (low.length?`<h3 class="alerts__h">Niska zaliha (${low.length})</h3>`+low.map(row).join(""):"");
  }

  /* ---------- Inventory table ---------- */
  function rowMatches(p, color){
    if(!filterText) return true;
    const q = filterText.toLowerCase();
    return p.name.toLowerCase().includes(q) || color.toLowerCase().includes(q);
  }
  function colorHasAlert(id, color){
    return INV.SIZES.some(s=>{ const n=INV.qty(id,color,s); return n<=INV.LOW_STOCK; });
  }

  function renderTable(){
    let html = "";
    PRODUCTS.forEach(p=>{
      const cols = INV.colorsOf(p).filter(c=> rowMatches(p,c.name) && (!lowOnly || colorHasAlert(p.id,c.name)));
      if(!cols.length) return;
      html += `<div class="invcard">
        <div class="invcard__head">
          <div class="invcard__img">${imgTag(p)}</div>
          <div>
            <h3>${esc(p.name)}</h3>
            <p>${({svecane:"Svečana",koktel:"Koktel",dnevne:"Dnevna"}[p.cat]||p.cat)} · ${money(p.price)} · ukupno <strong>${INV.productTotal(p.id)}</strong> kom</p>
          </div>
        </div>
        <table class="invgrid">
          <thead><tr><th>Boja</th>${INV.SIZES.map(s=>`<th>${s}</th>`).join("")}<th>Σ</th></tr></thead>
          <tbody>
            ${cols.map(c=>{
              const sizes = INV.SIZES.map(s=>{
                const n = INV.qty(p.id,c.name,s);
                const st = INV.status(p.id,c.name,s);
                return `<td><input class="qcell ${st}" type="number" min="0" value="${n}"
                  data-id="${p.id}" data-color="${esc(c.name)}" data-size="${s}"
                  title="${esc(INV.sku(p.id,c.name,s))}" aria-label="${esc(c.name)} ${s}"></td>`;
              }).join("");
              const tot = INV.SIZES.reduce((a,s)=>a+INV.qty(p.id,c.name,s),0);
              return `<tr><th class="invgrid__color"><span class="dot" style="background:${c.hex}"></span>${esc(c.name)}</th>${sizes}<td class="invgrid__tot">${tot}</td></tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
    });
    $("#invTable").innerHTML = html || `<p class="alerts__ok">Nema rezultata za zadani filter.</p>`;
  }
  function imgTag(p){
    const src = (p.images&&p.images[0]) || p.img;
    return src ? `<img src="${src}" alt="${esc(p.name)}" loading="lazy">` : "";
  }

  /* ---------- Movement log ---------- */
  function renderLog(){
    const items = INV.log().slice(0,40);
    $("#log").innerHTML = items.length
      ? items.map(m=>`<div class="logrow">
          <span class="logrow__when">${new Date(m.ts).toLocaleString("hr-HR")}</span>
          <span class="logrow__sku">${esc(m.sku)}</span>
          <span class="logrow__delta ${m.delta<0?'neg':'pos'}">${m.delta>0?"+":""}${m.delta}</span>
          <span class="logrow__qty">→ ${m.qty}</span>
          <span class="logrow__why">${esc(m.reason)}</span>
        </div>`).join("")
      : `<p class="alerts__ok">Još nema promjena.</p>`;
  }

  /* ---------- Orders ---------- */
  function renderOrders(){
    let orders=[]; try{ orders=JSON.parse(localStorage.getItem("celi_orders_v1")||"[]"); }catch{}
    $("#orders").innerHTML = orders.length
      ? orders.slice(0,20).map(o=>`<div class="orderrow">
          <div class="orderrow__top"><strong>${esc(o.id)}</strong><span>${new Date(o.at).toLocaleString("hr-HR")}</span></div>
          <p class="orderrow__cust">${esc((o.customer&&(o.customer.ime+" "+o.customer.prezime))||"")} · ${esc(o.method||"")}</p>
          <ul>${(o.items||[]).map(it=>`<li>${esc(it.name)} (${esc(it.color)}, ${it.size}) ×${it.qty}</li>`).join("")}</ul>
          <p class="orderrow__total">${money(o.total||0)}</p>
        </div>`).join("")
      : `<p class="alerts__ok">Još nema narudžbi. Dovršite kupnju u trgovini za demo.</p>`;
  }

  function renderAll(){ renderStats(); renderAlerts(); renderTable(); renderLog(); renderOrders(); }

  /* ---------- events ---------- */
  $("#invTable").addEventListener("change", e=>{
    const inp = e.target.closest(".qcell"); if(!inp) return;
    INV.setQty(+inp.dataset.id, inp.dataset.color, inp.dataset.size, inp.value, "Ručna izmjena");
    renderStats(); renderAlerts(); renderLog();
    // refresh this cell's status colour + row total without full rebuild
    const st = INV.status(+inp.dataset.id, inp.dataset.color, inp.dataset.size);
    inp.className = "qcell "+st;
    const row = inp.closest("tr");
    const tot = INV.SIZES.reduce((a,s)=>a+INV.qty(+inp.dataset.id, inp.dataset.color, s),0);
    const totCell = row.querySelector(".invgrid__tot"); if(totCell) totCell.textContent = tot;
    toast("Spremljeno ✓");
  });

  $("#alerts").addEventListener("click", e=>{
    const b = e.target.closest("[data-restock]"); if(!b) return;
    INV.adjust(+b.dataset.id, b.dataset.color, b.dataset.size, +b.dataset.restock, "Zaprimanje robe");
    renderAll(); toast(`+${b.dataset.restock} kom`);
  });

  $("#search").addEventListener("input", e=>{ filterText=e.target.value.trim(); renderTable(); });
  $("#lowOnly").addEventListener("change", e=>{ lowOnly=e.target.checked; renderTable(); });

  $("#btnExport").addEventListener("click", ()=>{
    const blob = new Blob([INV.exportJSON()], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "celi-inventar-"+new Date().toISOString().slice(0,10)+".json";
    a.click(); URL.revokeObjectURL(a.href); toast("Izvezeno");
  });
  $("#fileImport").addEventListener("change", e=>{
    const f = e.target.files[0]; if(!f) return;
    const rd = new FileReader();
    rd.onload = ()=>{ try{ INV.importJSON(rd.result); renderAll(); toast("Uvezeno ✓"); }
      catch{ toast("Neispravna datoteka"); } };
    rd.readAsText(f); e.target.value="";
  });
  $("#btnReset").addEventListener("click", ()=>{
    if(confirm("Vratiti zalihe na zadane vrijednosti? Time se brišu sve ručne izmjene.")){
      INV.reset(); renderAll(); toast("Vraćeno na zadano");
    }
  });

  /* ---------- toast ---------- */
  let tT; function toast(m){ const t=$("#toast"); t.textContent=m; t.classList.add("show");
    clearTimeout(tT); tT=setTimeout(()=>t.classList.remove("show"),1800); }

  /* ---------- init ---------- */
  $("#lowThresh").textContent = INV.LOW_STOCK;
  $("#reorderPt").textContent = INV.REORDER_POINT;
  $("#year").textContent = new Date().getFullYear();
  renderAll();
})();
