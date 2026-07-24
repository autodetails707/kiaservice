/* =====================================================================
   KIA SERVICE — Premium interactive features
   Vehicle selector · Price calculator · VIN search · Theme toggle ·
   Preloader · Mobile nav · Blog article modal
   Depends on: main.js (SITE, waLink, tgLink, toast, openModal)
   ===================================================================== */
'use strict';

/* ---------- 0. Preloader ---------- */
window.addEventListener('load',()=>{
    const p=document.getElementById('preloader');
    if(p){p.classList.add('done');setTimeout(()=>p.remove(),700);}
});

/* ---------- 1. Dark / Light theme ---------- */
(function theme(){
    const root=document.documentElement;
    const saved=localStorage.getItem('kia_theme');
    if(saved==='light')root.classList.add('light');
    document.addEventListener('click',e=>{
        if(!e.target.closest('#themeToggle'))return;
        root.classList.toggle('light');
        localStorage.setItem('kia_theme',root.classList.contains('light')?'light':'dark');
    });
})();

/* ---------- 2. Mobile bottom nav active state ---------- */
(function bottomNav(){
    const nav=document.querySelector('.bottom-nav'); if(!nav)return;
    const secs=[...document.querySelectorAll('section[id]')];
    const links=[...nav.querySelectorAll('a[data-target]')];
    if(!secs.length)return;
    addEventListener('scroll',()=>{
        let cur=''; const y=scrollY+140;
        secs.forEach(s=>{if(y>=s.offsetTop)cur=s.id;});
        links.forEach(l=>l.classList.toggle('active',l.dataset.target===cur));
    },{passive:true});
})();

/* ---------- 3. Smart Vehicle Selector ---------- */
(function vehicleSelector(){
    const box=document.getElementById('vehicle-selector'); if(!box)return;
    const MODELS={HYUNDAI:['Elantra'],KIA:['Forte']};
    const ADVICE={
        engine:{t:'Շարժիչի ախտորոշում և վերանորոգում',d:'Կկատարենք ամբողջական ախտորոշում և կվերացնենք շարժիչի խնդիրը՝ բնօրինակ պահեստամասերով։'},
        trans:{t:'Կորոբկայի սպասարկում',d:'Ավտոմատ/մեխանիկական տուփի ախտորոշում, յուղափոխ և վերանորոգում։'},
        oil:{t:'Յուղի ամբողջական սպասարկում',d:'Շարժիչի յուղի և ֆիլтրերի փոխարինում՝ արտադրողի ստանդարտով։'},
        filter:{t:'Ֆիլтրերի փոխարինում',d:'Օդի, վառելիքի, սալոնի և յուղի ֆիլтրերի սպասարկում։'},
        suspension:{t:'Կախոցքի աշխատանքներ',d:'Ամորтизатор-ների, шаровые-ի և կապերի ախտորոշում ու փոխարինում։'},
        check:{t:'Check Engine ախտորոշում',d:'Համակարգչային ախտորոշում՝ սխալ կոդերի ճշգրիт վերծանմամբ։'},
        other:{t:'Անհատական խորհրդատվություն',d:'Նկարագրեք խնդիրը, և մեր մասնագետը կառաջարկի լավագույն լուծումը։'}
    };
    const markSel=box.querySelector('[name=mark]'),modelSel=box.querySelector('[name=model]'),
          yearSel=box.querySelector('[name=year]'),problemSel=box.querySelector('[name=problem]'),
          result=box.querySelector('#vs-result');
    function fillModels(){
        modelSel.innerHTML=(MODELS[markSel.value]||[]).map(m=>`<option>${m}</option>`).join('');
    }
    markSel.addEventListener('change',fillModels); fillModels();
    box.querySelector('#vs-go').addEventListener('click',()=>{
        const a=ADVICE[problemSel.value]||ADVICE.other;
        const car=`${markSel.value} ${modelSel.value} ${yearSel.value}`;
        result.innerHTML=`<div class="vs-card glass">
            <span class="vs-badge">Առաջարկվող ծառայություն</span>
            <h3>${a.t}</h3>
            <p>${a.d}</p>
            <div class="vs-car">🚗 ${car}</div>
            <div class="vs-actions">
              <button class="btn btn-primary" data-open="bookingModal">Գրանցվել այս ծառայությանը</button>
              <a class="btn btn-wa" target="_blank" href="${waLink('Բարև 👋 '+car+' · Խնդիր՝ '+a.t)}">WhatsApp խորհրդատվություն</a>
            </div>
          </div>`;
        result.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
})();

/* ---------- 4. Service Price Calculator ---------- */
(async function calculator(){
    const box=document.getElementById('calculator'); if(!box)return;
    let data={cars:[],services:[]};
    try{ data=await (await fetch('data/prices.json',{cache:'no-store'})).json(); }catch(_){}
    const carSel=box.querySelector('[name=calcCar]'),svcSel=box.querySelector('[name=calcSvc]'),out=box.querySelector('#calc-out');
    carSel.innerHTML=data.cars.map(c=>`<option value="${c.factor}">${c.name}</option>`).join('');
    svcSel.innerHTML=data.services.map((s,i)=>`<option value="${i}">${s.name}</option>`).join('');
    const money=n=>Math.round(n/500)*500;
    function calc(){
        const f=parseFloat(carSel.value)||1, s=data.services[+svcSel.value];
        if(!s)return;
        const from=money(s.from*f), to=money(s.to*f);
        out.innerHTML=`<span class="calc-label">Մոտավոր արժեք</span>
            <div class="calc-price">${from.toLocaleString('en-US')} – ${to.toLocaleString('en-US')} <small>֏</small></div>
            <p class="calc-note">* Վերջնական գինը ճշտվում է ախտորոշումից հետո։</p>
            <a class="btn btn-primary" target="_blank" href="${waLink('Բարև 👋 Հետաքրքրում է '+s.name+'-ի գինը · '+carSel.options[carSel.selectedIndex].text)}">Ճշտել ճշգրիт գինը</a>`;
    }
    carSel.addEventListener('change',calc); svcSel.addEventListener('change',calc); calc();
})();

/* ---------- 5. VIN Parts Search (future API-ready) ---------- */
(function vinSearch(){
    const box=document.getElementById('vin-search'); if(!box)return;
    const input=box.querySelector('[name=vin]'),out=box.querySelector('#vin-out');
    box.querySelector('#vin-go').addEventListener('click',()=>{
        const vin=(input.value||'').trim().toUpperCase();
        if(vin.length<11){ out.innerHTML=`<div class="vin-msg err">Մուտքագրեք վավեր VIN կոդ (11–17 նիշ)։</div>`; return; }
        // Placeholder for future backend/API integration:
        //   fetch('/api/parts?vin='+vin).then(...)
        out.innerHTML=`<div class="vin-msg ok">
            ✅ VIN <b>${vin}</b> ընդունված է։<br>
            Մեր մասնագետը կճշտի համապատասխան պահեստամասերը և կկապվի Ձեզ հետ։
            <a class="btn btn-wa" style="margin-top:14px" target="_blank" href="${waLink('Բարև 👋 Պահեստամասի հարցում · VIN՝ '+vin)}">Ուղարկել WhatsApp</a>
          </div>`;
    });
})();

/* ---------- 6. Blog article modal ---------- */
window.openArticle=function(data){
    let m=document.getElementById('articleModal');
    if(!m){
        m=document.createElement('div'); m.id='articleModal'; m.className='modal-back';
        m.innerHTML=`<div class="modal modal-lg glass"><div class="modal-head">
            <div><h3 id="art-title"></h3><p id="art-meta"></p></div><button class="modal-close">✕</button></div>
            <div class="modal-body"><img id="art-img" style="width:100%;border-radius:14px;margin-bottom:16px" alt="">
            <div id="art-body" style="color:var(--muted);line-height:1.8"></div></div></div>`;
        document.body.appendChild(m);
    }
    m.querySelector('#art-title').textContent=data.title;
    m.querySelector('#art-meta').textContent=`${data.tag} · ${data.date}`;
    m.querySelector('#art-img').src=data.img;
    m.querySelector('#art-body').textContent=data.content;
    openModal('articleModal');
};
