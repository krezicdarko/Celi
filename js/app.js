/* ===== CELI Official — webshop logic ===== */
(function(){
  "use strict";

  const WHATSAPP = "38763008800";       // CELI WhatsApp / phone
  const FREE_SHIP = 150;                 // KM
  const STORE_KEY = "celi_cart_v1";
  const WISH_KEY  = "celi_wish_v1";
  const SIZES = ["XS","S","M","L","XL"];
  const MODEL_VIEWER_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
  const money = n => n.toLocaleString("hr-HR") + " KM";
  const byId  = id => PRODUCTS.find(p=>p.id===id);

  let cart = load(STORE_KEY);
  let wish = load(WISH_KEY);
  let activeFilter = "all";
  let searchTerm = "";

  /* ---------- persistence ---------- */
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch{ return []; } }
  function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(cart)); }
  function saveWish(){ localStorage.setItem(WISH_KEY, JSON.stringify(wish)); }

  /* ---------- wishlist ---------- */
  function isWished(id){ return wish.includes(id); }
  function toggleWish(id){
    if(isWished(id)) wish = wish.filter(x=>x!==id);
    else { wish.push(id); toast(`${byId(id).name} dodano u favorite ♡`); }
    saveWish(); updateWishCount(); refreshWishUI(id);
    if(activeFilter==="wishlist") renderGrid();
  }
  function updateWishCount(){
    const el = $("#wishCount"); if(!el) return;
    el.textContent = wish.length;
    el.classList.toggle("is-empty", wish.length===0);
  }
  function refreshWishUI(id){
    $$(`[data-wish="${id}"]`).forEach(b=>b.classList.toggle("is-on", isWished(id)));
  }

  /* ---------- product grid ---------- */
  function matches(p){
    const okSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm) ||
      p.cat.toLowerCase().includes(searchTerm) ||
      (p.desc||"").toLowerCase().includes(searchTerm);
    if(activeFilter==="wishlist") return isWished(p.id) && okSearch;
    const okCat = activeFilter==="all" || p.cat===activeFilter || (p.tags||[]).includes(activeFilter);
    return okCat && okSearch;
  }

  function badges(p){
    const b = [];
    if(p.badge) b.push(`<span class="card__badge">${p.badge}</span>`);
    if(p.model) b.push(`<span class="card__badge card__badge--3d">3D · AR</span>`);
    return b.length ? `<div class="card__badges">${b.join("")}</div>` : "";
  }

  function renderGrid(){
    const grid = $("#productGrid");
    const list = PRODUCTS.filter(matches);
    const empty = $("#emptyState");
    empty.hidden = list.length>0;
    empty.textContent = activeFilter==="wishlist"
      ? "Vaša lista želja je prazna. Dodajte haljine klikom na ♡."
      : "Nema haljina koje odgovaraju pretrazi.";
    grid.innerHTML = list.map(p=>`
      <article class="card" data-id="${p.id}">
        <div class="card__media" data-quick="${p.id}">
          ${badges(p)}
          <button class="card__wish${isWished(p.id)?' is-on':''}" data-wish="${p.id}" aria-label="Dodaj u favorite" title="Dodaj u favorite">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 20s-7-4.6-9.3-9.2C1.2 7.9 2.6 5 5.5 5c1.9 0 3.2 1.1 3.9 2.2L12 9l2.6-1.8C15.3 6.1 16.6 5 18.5 5c2.9 0 4.3 2.9 2.8 5.8C19 15.4 12 20 12 20z"/></svg>
          </button>
          ${productMedia(p)}
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

  // wishlist header button → show favourites
  $("#wishToggle").addEventListener("click", ()=>{
    setFilter("wishlist");
    document.getElementById("shop").scrollIntoView({behavior:"smooth"});
  });

  /* ---------- product media viewer (photo / 360° / 3D) ---------- */
  let mvPromise = null;
  function ensureModelViewer(){
    if(mvPromise) return mvPromise;
    mvPromise = new Promise((res,rej)=>{
      if(window.customElements && customElements.get("model-viewer")) return res();
      const s = document.createElement("script");
      s.type = "module"; s.src = MODEL_VIEWER_SRC;
      s.onload = ()=>res(); s.onerror = ()=>rej();
      document.head.appendChild(s);
    });
    return mvPromise;
  }

  function buildViewer(p, mount){
    const imgs = productImages(p);
    const hasSpin  = Array.isArray(p.spin) && p.spin.length>1;
    const hasModel = !!p.model;

    const modes = [{k:"photo",label:"Foto"}];
    if(hasSpin)  modes.push({k:"spin",label:"360°"});
    if(hasModel) modes.push({k:"3d",label:"3D · AR"});

    mount.innerHTML = `
      <div class="viewer">
        <div class="viewer__stage" id="vStage"></div>
        ${modes.length>1 ? `<div class="viewer__tabs">${modes.map((m,i)=>
          `<button class="vtab${i===0?' is-active':''}" data-mode="${m.k}">${m.label}</button>`).join("")}</div>`:""}
        ${imgs.length>1 ? `<div class="viewer__thumbs">${imgs.map((src,i)=>
          `<button class="vthumb${i===0?' is-active':''}" data-i="${i}"><img src="${src}" alt="" loading="lazy"></button>`).join("")}</div>`:""}
      </div>`;

    const stage = mount.querySelector("#vStage");
    let mainIndex = 0;

    function showPhoto(){
      stage.className = "viewer__stage is-zoomable";
      stage.innerHTML = imgs.length
        ? `<img class="viewer__img" id="vImg" src="${imgs[mainIndex]}" alt="${p.name} — CELI" draggable="false">`
        : dressSVG(p.colors||{});
      const img = stage.querySelector("#vImg");
      if(img) attachZoom(stage, img);
    }

    function attachZoom(stage, img){
      stage.addEventListener("mousemove", e=>{
        const r = stage.getBoundingClientRect();
        img.style.transformOrigin = `${((e.clientX-r.left)/r.width)*100}% ${((e.clientY-r.top)/r.height)*100}%`;
      });
      stage.addEventListener("mouseenter", ()=>stage.classList.add("is-zoom"));
      stage.addEventListener("mouseleave", ()=>{ stage.classList.remove("is-zoom"); img.style.transformOrigin="center"; });
    }

    function showSpin(){
      stage.className = "viewer__stage viewer__stage--spin";
      const frames = p.spin;
      let f = 0, dragging=false, startX=0, startF=0;
      stage.innerHTML = `<img class="viewer__img" id="vSpin" src="${frames[0]}" alt="${p.name} 360°" draggable="false"><span class="viewer__hint">↔ povucite za rotaciju</span>`;
      const img = stage.querySelector("#vSpin");
      const setF = n => { f = ((n%frames.length)+frames.length)%frames.length; img.src = frames[f]; };
      const px = e => e.touches ? e.touches[0].clientX : e.clientX;
      const down = e => { dragging=true; startX=px(e); startF=f; };
      const move = e => { if(!dragging) return;
        const step = Math.round((px(e)-startX) / (stage.clientWidth/frames.length));
        setF(startF - step); if(e.cancelable) e.preventDefault(); };
      const up = ()=> dragging=false;
      stage.addEventListener("mousedown", down); stage.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      stage.addEventListener("touchstart", down, {passive:true});
      stage.addEventListener("touchmove", move, {passive:false});
      stage.addEventListener("touchend", up);
    }

    function showModel(){
      stage.className = "viewer__stage viewer__stage--3d";
      stage.innerHTML = `<div class="viewer__loading">Učitavanje 3D prikaza…</div>`;
      ensureModelViewer().then(()=>{
        stage.innerHTML =
          `<model-viewer src="${p.model}" alt="3D prikaz: ${p.name}" camera-controls auto-rotate
             touch-action="pan-y" shadow-intensity="1" exposure="1.05" environment-image="neutral"
             ar ar-modes="webxr scene-viewer quick-look" poster="${imgs[0]||""}" reveal="auto"></model-viewer>
           <span class="viewer__hint">povucite za rotaciju · ⤢ AR na mobitelu</span>`;
      }).catch(()=>{
        stage.className = "viewer__stage";
        stage.innerHTML = imgs.length
          ? `<img class="viewer__img" src="${imgs[0]}" alt="${p.name}"><span class="viewer__hint">3D prikaz trenutno nije dostupan</span>`
          : dressSVG(p.colors||{});
      });
    }

    mount.querySelectorAll(".vtab").forEach(t=>t.onclick=()=>{
      mount.querySelectorAll(".vtab").forEach(x=>x.classList.toggle("is-active", x===t));
      const m = t.dataset.mode;
      m==="photo" ? showPhoto() : m==="spin" ? showSpin() : showModel();
    });
    mount.querySelectorAll(".vthumb").forEach(b=>b.onclick=()=>{
      mainIndex = +b.dataset.i;
      mount.querySelectorAll(".vthumb").forEach(x=>x.classList.toggle("is-active", x===b));
      mount.querySelectorAll(".vtab").forEach(x=>x.classList.toggle("is-active", x.dataset.mode==="photo"));
      showPhoto();
    });

    showPhoto();
  }

  /* ---------- quick view modal ---------- */
  const modal = $("#modal");
  let modalSize = null;

  function detailRow(label, val){ return val ? `<div class="details__row"><span>${label}</span><p>${val}</p></div>` : ""; }

  function openModal(id){
    const p = byId(id); if(!p) return;
    modalSize = "M";
    $("#modalBox").innerHTML = `
      <div class="modal__media" id="modalMedia"></div>
      <div class="modal__info">
        <button class="icon-btn modal__close" id="modalClose" aria-label="Zatvori">✕</button>
        <p class="modal__cat">${catLabel(p.cat)}</p>
        <h2 class="modal__name">${p.name}</h2>
        <p class="modal__price">${money(p.price)}${p.oldPrice?`<del>${money(p.oldPrice)}</del>`:""}</p>
        <p class="modal__desc">${p.desc}</p>
        ${p.color?`<p class="modal__colorline"><span class="swatch" style="background:${p.color.hex}"></span>Boja: ${p.color.name}</p>`:""}
        <div class="modal__sizehead">
          <p class="modal__label">Veličina</p>
          <button class="sizeguide-link" id="openSizeGuide" type="button">Vodič za veličine</button>
        </div>
        <div class="sizes">${SIZES.map(s=>`<button class="size${s==='M'?' is-active':''}" data-size="${s}">${s}</button>`).join("")}</div>
        <div class="modal__actions">
          <button class="btn btn--gold" id="modalAdd">Dodaj u košaricu</button>
          <button class="icon-btn modal__wish${isWished(p.id)?' is-on':''}" id="modalWish" data-wish="${p.id}" aria-label="Dodaj u favorite">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 20s-7-4.6-9.3-9.2C1.2 7.9 2.6 5 5.5 5c1.9 0 3.2 1.1 3.9 2.2L12 9l2.6-1.8C15.3 6.1 16.6 5 18.5 5c2.9 0 4.3 2.9 2.8 5.8C19 15.4 12 20 12 20z"/></svg>
          </button>
        </div>
        <div class="details">
          ${detailRow("Materijal", p.fabric)}
          ${detailRow("Kroj", p.fit)}
          ${detailRow("Održavanje", p.care)}
        </div>
      </div>`;

    buildViewer(p, $("#modalMedia"));
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";

    $("#modalClose").onclick = closeModal;
    $("#openSizeGuide").onclick = openSizeGuide;
    $("#modalWish").onclick = ()=> toggleWish(p.id);
    $("#modalBox").querySelectorAll(".size").forEach(b=>{
      b.onclick = ()=>{ modalSize=b.dataset.size;
        $("#modalBox").querySelectorAll(".size").forEach(x=>x.classList.toggle("is-active",x===b)); };
    });
    $("#modalAdd").onclick = ()=>{ addToCart(p.id, modalSize); closeModal(); openCart(); };
  }
  function closeModal(){ modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); document.body.style.overflow=""; }
  $("#modalOverlay").onclick = closeModal;

  $("#productGrid").addEventListener("click", e=>{
    const w = e.target.closest("[data-wish]"); if(w){ toggleWish(+w.dataset.wish); return; }
    const q = e.target.closest("[data-quick]"); if(q) openModal(+q.dataset.quick);
  });

  /* ---------- size guide modal ---------- */
  const sizeModal = $("#sizeModal");
  function openSizeGuide(){ sizeModal.classList.add("open"); sizeModal.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
  function closeSizeGuide(){ sizeModal.classList.remove("open"); sizeModal.setAttribute("aria-hidden","true"); if(!modal.classList.contains("open")) document.body.style.overflow=""; }
  $("#sizeClose").onclick = closeSizeGuide;
  $("#sizeOverlay").onclick = closeSizeGuide;

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
          <div class="citem__img">${productMedia(p)}</div>
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

  /* ---------- checkout ---------- */
  $("#checkoutBtn").addEventListener("click", e=>{
    if(!cart.length){ e.preventDefault(); toast("Košarica je prazna"); }
  });

  $("#whatsappBtn").onclick = ()=>{
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

  /* ---------- SEO: Product structured data ---------- */
  function injectJsonLd(){
    try{
      const data = {
        "@context":"https://schema.org", "@type":"ItemList",
        itemListElement: PRODUCTS.map((p,i)=>({
          "@type":"ListItem", position:i+1,
          item:{
            "@type":"Product", name:p.name,
            image: new URL(productImages(p)[0]||"", location.href).href,
            description:p.desc, category:catLabel(p.cat),
            brand:{"@type":"Brand", name:"CELI Official"},
            offers:{"@type":"Offer", price:p.price, priceCurrency:"BAM",
              availability:"https://schema.org/InStock", url:location.href}
          }
        }))
      };
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    }catch{}
  }

  /* ---------- misc ---------- */
  document.addEventListener("keydown", e=>{
    if(e.key!=="Escape") return;
    if(sizeModal.classList.contains("open")){ closeSizeGuide(); return; }
    if(modal.classList.contains("open")){ closeModal(); return; }
    closeCart(); closeNav();
  });
  $("#year").textContent = new Date().getFullYear();

  // header shadow on scroll
  addEventListener("scroll", ()=>{
    $("#header").style.boxShadow = scrollY>20 ? "0 8px 24px -18px rgba(60,45,20,.5)" : "none";
  });

  /* ---------- init ---------- */
  renderGrid();
  renderCart();
  updateWishCount();
  injectJsonLd();
})();
