/* ===== CELI Official — checkout & payment ===== */
(function(){
  "use strict";

  /* ===========================================================
     CONFIG — replace these for live payments
     -----------------------------------------------------------
     PAYPAL_CLIENT_ID : your PayPal REST app Client ID (sb/live).
       "test" = PayPal demo mode (buttons render, simulated flow).
       Get yours at https://developer.paypal.com → Apps & Credentials.
     =========================================================== */
  const PAYPAL_CLIENT_ID = "test";       // <-- paste your live PayPal Client ID
  const WHATSAPP   = "38763008800";
  const FREE_SHIP  = 150;                 // KM
  const SHIP_COST  = 7;                   // KM
  const EUR_RATE   = 1.95583;             // BAM pegged to EUR
  const STORE_KEY  = "celi_cart_v1";

  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
  const money = n => n.toLocaleString("hr-HR") + " KM";
  const eur   = n => (n/EUR_RATE).toFixed(2);
  const byId  = id => PRODUCTS.find(p=>p.id===id);

  let cart = load();
  function load(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY))||[]; }catch{ return []; } }
  function clearCart(){ localStorage.removeItem(STORE_KEY); cart=[]; }

  function subtotal(){ return cart.reduce((s,i)=>s+byId(i.id).price*i.qty,0); }
  function shipping(){ return cart.length===0 ? 0 : (subtotal()>=FREE_SHIP ? 0 : SHIP_COST); }
  function total(){ return subtotal()+shipping(); }
  const catLabel = c => ({svecane:"Svečana",koktel:"Koktel",dnevne:"Dnevna"}[c]||c);

  /* ---------- render summary ---------- */
  function renderSummary(){
    const box = $("#summaryItems");
    if(!cart.length){
      box.innerHTML = `<p class="sum-empty">Vaša košarica je prazna. <a href="index.html">Natrag u trgovinu →</a></p>`;
      $("#sumSubtotal").textContent = money(0);
      $("#sumShip").textContent = "—";
      $("#sumTotal").textContent = money(0);
      $("#sumEur").textContent = "";
      return;
    }
    box.innerHTML = cart.map(i=>{
      const p = byId(i.id);
      return `<div class="sum-item">
        <div class="sum-item__img">${productMedia(p)}<span class="sum-item__q">${i.qty}</span></div>
        <div class="sum-item__info"><p class="sum-item__name">${p.name}</p><p class="sum-item__meta">${catLabel(p.cat)} · ${i.size}</p></div>
        <div class="sum-item__price">${money(p.price*i.qty)}</div>
      </div>`;
    }).join("");
    $("#sumSubtotal").textContent = money(subtotal());
    $("#sumShip").textContent = shipping()===0 ? "Besplatno" : money(shipping());
    $("#sumTotal").textContent = money(total());
    $("#sumEur").textContent = `≈ ${eur(total())} EUR (za kartično plaćanje)`;
  }

  /* ---------- payment method switch ---------- */
  $$(".pay__opt").forEach(opt=>{
    opt.addEventListener("click", ()=>{
      $$(".pay__opt").forEach(o=>o.classList.remove("is-active"));
      opt.classList.add("is-active");
      opt.querySelector("input").checked = true;
      const v = opt.querySelector("input").value;
      $("#panel-card").hidden = v!=="card";
      $("#panel-cod").hidden  = v!=="cod";
      $("#panel-bank").hidden = v!=="bank";
    });
  });

  /* ---------- validation ---------- */
  function validForm(){
    const f = $("#shipForm");
    const required = ["ime","prezime","email","telefon","adresa","grad","posta"];
    for(const name of required){
      const el = f.elements[name];
      if(!el.value.trim()){ el.focus(); toast("Molimo popunite obavezna polja"); el.classList.add("err"); return false; }
      el.classList.remove("err");
    }
    if(!/^\S+@\S+\.\S+$/.test(f.elements.email.value)){ f.elements.email.focus(); toast("Unesite ispravnu e-mail adresu"); return false; }
    if(!cart.length){ toast("Košarica je prazna"); return false; }
    return true;
  }

  function customer(){
    const f = $("#shipForm");
    return {
      ime:f.elements.ime.value, prezime:f.elements.prezime.value,
      email:f.elements.email.value, telefon:f.elements.telefon.value,
      adresa:f.elements.adresa.value, grad:f.elements.grad.value,
      posta:f.elements.posta.value, drzava:f.elements.drzava.value,
      napomena:f.elements.napomena.value
    };
  }

  function orderId(){ return "CELI-" + Date.now().toString().slice(-6); }

  /* ---------- complete order ---------- */
  function complete(method, oid){
    const labels = { card:"Plaćanje karticom uspješno je obrađeno.",
                     cod:"Narudžba je zaprimljena — platit ćete pouzećem pri dostavi.",
                     bank:"Narudžba je zaprimljena — predračun s podacima za uplatu poslat ćemo na vaš e-mail." };
    $("#confirmMsg").textContent = labels[method] || "Narudžba je zaprimljena.";
    $("#orderId").textContent = oid;
    clearCart();
    $("#coGrid").style.display = "none";
    $(".co__title").style.display = "none";
    $("#confirm").hidden = false;
    window.scrollTo({top:0, behavior:"smooth"});
  }

  $("#placeCod").addEventListener("click", ()=>{ if(validForm()) complete("cod", orderId()); });
  $("#placeBank").addEventListener("click", ()=>{
    if(!validForm()) return;
    const oid = orderId();
    $("#bankRef").textContent = oid.replace(/\D/g,"");
    complete("bank", oid);
  });

  /* ---------- WhatsApp ---------- */
  $("#coWhatsapp").addEventListener("click", ()=>{
    if(!cart.length){ toast("Košarica je prazna"); return; }
    const c = customer();
    let msg = "Pozdrav CELI! Želim naručiti:%0A%0A";
    cart.forEach(i=>{ const p=byId(i.id); msg+=`• ${p.name} (${i.size}) ×${i.qty} — ${money(p.price*i.qty)}%0A`; });
    msg += `%0AUkupno: ${money(total())}%0A`;
    if(c.ime||c.adresa) msg += `%0AIme: ${c.ime} ${c.prezime}%0AAdresa: ${c.adresa}, ${c.posta} ${c.grad}%0ATelefon: ${c.telefon}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
  });

  /* ---------- PayPal ---------- */
  function loadPayPal(){
    if(!cart.length) return;
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=EUR&intent=capture`;
    s.onload = renderPayPal;
    s.onerror = ()=>{ $("#paypalFallback").hidden = false; };
    document.head.appendChild(s);
  }

  function renderPayPal(){
    if(!window.paypal || !paypal.Buttons){ $("#paypalFallback").hidden=false; return; }
    if(PAYPAL_CLIENT_ID==="test") $("#paypalFallback").hidden = false; // demo notice
    try{
      paypal.Buttons({
        style:{ layout:"vertical", color:"black", shape:"rect", label:"pay", height:48 },
        onClick:(d,actions)=>{ if(!validForm()) return actions.reject(); },
        createOrder:(data, actions)=> actions.order.create({
          purchase_units:[{
            description:"CELI Official — narudžba haljina",
            amount:{ value: eur(total()), currency_code:"EUR" }
          }]
        }),
        onApprove:(data, actions)=> actions.order.capture().then(()=> complete("card", orderId())),
        onError:()=> toast("Plaćanje nije uspjelo. Pokušajte ponovno ili odaberite drugi način.")
      }).render("#paypal-buttons").catch(()=>{ $("#paypalFallback").hidden=false; });
    }catch(e){ $("#paypalFallback").hidden = false; }
  }

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show");
    clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2600); }

  /* ---------- init ---------- */
  $("#year").textContent = new Date().getFullYear();
  renderSummary();
  loadPayPal();
})();
