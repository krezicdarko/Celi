/* ===== CELI Official — webshop logic ===== */
(function(){
  "use strict";

  const WHATSAPP = "38763008800";       // CELI WhatsApp / phone
  const FREE_SHIP = 150;                 // KM
  const STORE_KEY = "celi_cart_v1";
  const SIZES = ["XS","S","M","L","XL"];

  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
  const money = n => n.toLocaleString("hr-HR") + " KM";
  const byId  = id => PRODUCTS.find(p=>p.id===id);

  let cart = load();
  let activeFilter = "all";
  let searchTerm = "";

  /* ---------- persistence ---------- */
  function load(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }catch{ return []; } }
  function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(cart)); }

  /* ---------- product grid ---------- */
  function matches(p){
    const okCat = activeFilter==="all" || p.cat===activeFilter || (p.tags||[]).includes(activeFilter);
    const okSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm) ||
      p.cat.toLowerCase().includes(searchTerm) ||
      (p.desc||"").toLowerCase().includes(searchTerm);
    return okCat && okSearch;
  }

  function renderGrid(){
    const grid = $("#productGrid");
    const list = PRODUCTS.filter(matches);
    $("#emptyState").hidden = list.length>0;
    grid.innerHTML = list.map(p=>`
      <article class="card" data-id="${p.id}">
        <div class="card__media" data-quick="${p.id}">
          ${p.badge?`<span class="card__badge">${p.badge}</span>`:""}
          ${dressSVG({style:p.style, ...p.colors})}
          <button class="card__quick" data-quick="${p.id}">Brzi pregled</button>
        </div>
        <div class="card__info">
          <h3 class="card__name">${p.name}</h3>
          <p class="card__cat">${catLabel(p.cat)}</p>
          <p class="card__price">${money(p.price)}${p.oldPrice?`<del>${money(p.oldPrice)}</del>`:""}</p>
        </div>
      </article>`).join("");
  }

  function catLabel(c){
    return {svecane:"Svečana haljina",koktel:"Koktel haljina",dnevne:"Dnevna haljina"}[c]||c;
  }

  /* ---------- filters & search ---------- */
  function setFilter(f){
    activeFilter = f;
    $$("#filters .chip").forEach(b=>b.classList.toggle("is-active", b.dataset.filter===f));
    renderGrid();
  }

  $("#filters").addEventListener("click", e=>{
    const b = e.target.closest(".chip"); if(b) setFilter(b.dataset.filter);
  });

  // nav + category tiles that point to a filter
  $$("[data-filter]").forEach(el=>{
    if(el.classList.contains("chip")) return;
    el.addEventListener("click", ()=>{ setFilter(el.dataset.filter); closeNav(); });
  });

  const searchInput = $("#searchInput");
  $("#searchToggle").addEventListener("click", ()=>{
    $("#searchbar").classList.toggle("open");
    if($("#searchbar").classList.contains("open")) searchInput.focus();
  });
  searchInput.addEventListener("input", e=>{ searchTerm = e.target.value.trim().toLowerCase(); renderGrid(); });

  /* ---------- quick view modal ---------- */
  const modal = $("#modal");
  let modalSize = null;

  function openModal(id){
    const p = byId(id); if(!p) return;
    modalSize = "M";
    $("#modalBox").innerHTML = `
      <div class="modal__media">${dressSVG({style:p.style, ...p.colors})}</div>
      <div class="modal__info">
        <button class="icon-btn modal__close" id="modalClose" aria-label="Zatvori">✕</button>
        <p class="modal__cat">${catLabel(p.cat)}</p>
        <h2 class="modal__name">${p.name}</h2>
        <p class="modal__price">${money(p.price)}${p.oldPrice?`<del>${money(p.oldPrice)}</del>`:""}</p>
        <p class="modal__desc">${p.desc}</p>
        <p class="modal__label">Veličina</p>
        <div class="sizes">${SIZES.map(s=>`<button class="size${s==='M'?' is-active':''}" data-size="${s}">${s}</button>`).join("")}</div>
        <button class="btn btn--gold btn--block" id="modalAdd">Dodaj u košaricu</button>
      </div>`;
    modal.classList.add("open");
    document.body.style.overflow="hidden";

    $("#modalClose").onclick = closeModal;
    $("#modalBox").querySelectorAll(".size").forEach(b=>{
      b.onclick = ()=>{ modalSize=b.dataset.size;
        $("#modalBox").querySelectorAll(".size").forEach(x=>x.classList.toggle("is-active",x===b)); };
    });
    $("#modalAdd").onclick = ()=>{ addToCart(p.id, modalSize); closeModal(); openCart(); };
  }
  function closeModal(){ modal.classList.remove("open"); document.body.style.overflow=""; }
  $("#modalOverlay").onclick = closeModal;

  $("#productGrid").addEventListener("click", e=>{
    const q = e.target.closest("[data-quick]"); if(q) openModal(+q.dataset.quick);
  });

  /* ---------- cart ---------- */
  function addToCart(id, size="M"){
    const line = cart.find(i=>i.id===id && i.size===size);
    if(line) line.qty++; else cart.push({id, size, qty:1});
    save(); renderCart(); bumpCount();
    const p = byId(id);
    toast(`${p.name} (${size}) dodano u košaricu`);
  }
  function changeQty(id,size,d){
    const line = cart.find(i=>i.id===id && i.size===size); if(!line) return;
    line.qty += d;
    if(line.qty<=0) cart = cart.filter(i=>i!==line);
    save(); renderCart();
  }
  function removeLine(id,size){ cart = cart.filter(i=>!(i.id===id&&i.size===size)); save(); renderCart(); }
  function cartTotal(){ return cart.reduce((s,i)=>s + byId(i.id).price*i.qty, 0); }
  function cartCount(){ return cart.reduce((s,i)=>s+i.qty,0); }

  function bumpCount(){
    const el = $("#cartCount"); el.textContent = cartCount();
    el.style.transform="scale(1.4)"; setTimeout(()=>el.style.transform="",180);
  }

  function renderCart(){
    const body = $("#cartBody");
    if(!cart.length){
      body.innerHTML = `<p class="cart__empty">Vaša košarica je prazna.<br/>Otkrijte našu kolekciju ✦</p>`;
    } else {
      body.innerHTML = cart.map(i=>{
        const p = byId(i.id);
        return `<div class="citem">
          <div class="citem__img">${dressSVG({style:p.style, ...p.colors})}</div>
          <div>
            <p class="citem__name">${p.name}</p>
            <p class="citem__meta">${catLabel(p.cat)} · ${i.size}</p>
            <div class="qty">
              <button data-act="dec" data-id="${i.id}" data-size="${i.size}">−</button>
              <span>${i.qty}</span>
              <button data-act="inc" data-id="${i.id}" data-size="${i.size}">+</button>
            </div>
            <br/><button class="citem__remove" data-act="rm" data-id="${i.id}" data-size="${i.size}">Ukloni</button>
          </div>
          <div class="citem__price">${money(p.price*i.qty)}</div>
        </div>`;
      }).join("");
    }
    const total = cartTotal();
    const ship = total>=FREE_SHIP || total===0 ? "" : ` (+ dostava)`;
    $("#cartTotal").textContent = money(total)+ship;
    $("#cartCount").textContent = cartCount();
  }

  $("#cartBody").addEventListener("click", e=>{
    const b = e.target.closest("[data-act]"); if(!b) return;
    const id=+b.dataset.id, size=b.dataset.size;
    if(b.dataset.act==="inc") changeQty(id,size,1);
    if(b.dataset.act==="dec") changeQty(id,size,-1);
    if(b.dataset.act==="rm")  removeLine(id,size);
  });

  /* ---------- cart drawer open/close ---------- */
  const overlay = $("#overlay");
  function openCart(){ $("#cart").classList.add("open"); overlay.classList.add("show"); document.body.style.overflow="hidden"; }
  function closeCart(){ $("#cart").classList.remove("open"); overlay.classList.remove("show"); document.body.style.overflow=""; }
  $("#cartToggle").onclick = openCart;
  $("#cartClose").onclick  = closeCart;
  overlay.onclick = ()=>{ closeCart(); closeNav(); };

  /* ---------- checkout via WhatsApp ---------- */
  $("#checkoutBtn").onclick = ()=>{
    if(!cart.length){ toast("Košarica je prazna"); return; }
    let msg = "Pozdrav CELI! Želim naručiti:%0A%0A";
    cart.forEach(i=>{
      const p = byId(i.id);
      msg += `• ${p.name} (${i.size}) ×${i.qty} — ${money(p.price*i.qty)}%0A`;
    });
    msg += `%0AUkupno: ${money(cartTotal())}%0A%0AMolim potvrdu dostupnosti i dostave. Hvala!`;
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
  };

  /* ---------- mobile nav ---------- */
  const nav = $("#nav");
  function openNav(){ nav.classList.add("open"); overlay.classList.add("show"); }
  function closeNav(){ nav.classList.remove("open"); if(!$("#cart").classList.contains("open")) overlay.classList.remove("show"); }
  $("#navToggle").onclick = ()=> nav.classList.contains("open") ? closeNav() : openNav();
  $$("#nav a").forEach(a=> a.addEventListener("click", closeNav));

  /* ---------- newsletter ---------- */
  $("#newsletterForm").addEventListener("submit", e=>{
    e.preventDefault(); e.target.reset();
    $("#newsletterMsg").hidden = false;
  });

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg){
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove("show"), 2400);
  }

  /* ---------- misc ---------- */
  document.addEventListener("keydown", e=>{ if(e.key==="Escape"){ closeModal(); closeCart(); closeNav(); } });
  $("#year").textContent = new Date().getFullYear();

  // header shadow on scroll
  addEventListener("scroll", ()=>{
    $("#header").style.boxShadow = scrollY>20 ? "0 8px 24px -18px rgba(60,45,20,.5)" : "none";
  });

  /* ---------- init ---------- */
  renderGrid();
  renderCart();
})();
