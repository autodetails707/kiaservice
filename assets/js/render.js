/* =====================================================================
   KIA SERVICE — Data rendering (services, gallery, reviews, faq, team, video)
   Fetches /data/*.json, builds premium SVG image tiles (offline-safe).
   ===================================================================== */
'use strict';

/* ---------- fetch helper with graceful fallback ---------- */
async function loadJSON(path, fallback){
    try{ const r=await fetch(path,{cache:'no-store'}); if(!r.ok)throw 0; return await r.json(); }
    catch(_){ return fallback||[]; }
}

/* ---------- Inline SVG icon set ---------- */
const ICONS={
    scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3.5"/>',
    engine:'<path d="M6 9h3V6h4l2 3h3v4l-2 2v3H9v-3H6z"/><path d="M18 11h3"/>',
    chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    oil:'<path d="M4 14l4-4h5l3 3h4v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/><path d="M13 10l2-4h4"/>',
    gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    filter:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    timing:'<circle cx="8" cy="12" r="4"/><circle cx="18" cy="12" r="2.5"/><path d="M8 8V4M8 20v-4M12 12h4"/>',
    turbo:'<circle cx="12" cy="12" r="5"/><path d="M12 7a5 5 0 0 1 5 5M3 12h2M19 12h2"/>',
    inject:'<path d="M12 3v6M9 9h6l-1 10a2 2 0 0 1-4 0z"/>',
    overhaul:'<path d="M14 6l4 4-8 8H6v-4z"/><path d="M13 7l4 4"/>',
    auto:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8v8M12 8v8M16 8v8"/>',
    manual:'<circle cx="12" cy="6" r="2"/><path d="M12 8v10M6 18h12"/>',
    swap:'<path d="M7 7h10l-3-3M17 17H7l3 3"/>',
    suspension:'<path d="M6 4v16M18 4v16M6 8h12M6 12h12M6 16h12"/>',
    steering:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v6M6 15l4-2M18 15l-4-2"/>',
    brake:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>',
    bearing:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
    shock:'<path d="M12 3v4M12 17v4M9 7h6M9 17h6M10 7l4 10M14 7l-4 10"/>',
    battery:'<rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8V6M17 8V6M8 13h3M9.5 11.5v3M15 13h2"/>',
    starter:'<circle cx="10" cy="12" r="6"/><path d="M16 10h5M16 14h5M10 9v6"/>',
    alt:'<circle cx="11" cy="12" r="6"/><path d="M17 12h4M11 7v10"/>',
    wire:'<path d="M4 6c4 0 4 12 8 12s4-12 8-12"/>',
    ac:'<path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18"/>',
    cool:'<path d="M12 3v18M8 6l4 3 4-3M8 18l4-3 4 3M3.5 9l4 3-4 3M20.5 9l-4 3 4 3"/>',
    wrench:'<path d="M14 6a4 4 0 0 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z"/>'
};
const svgIcon=(k)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]||ICONS.wrench}</svg>`;

/* ---------- Premium SVG "photo" generator (no external images) ---------- */
function svgPhoto(title, tag, seed){
    seed = seed||0;
    const hue = 348; // red family
    const g1 = `hsl(${hue},70%,${18+(seed%3)*4}%)`;
    const g2 = `hsl(${230+(seed%4)*8},22%,9%)`;
    const car = `<path d="M60 250 L110 250 C120 210 150 190 200 190 L330 190 C380 190 410 210 430 240 L520 250 C545 253 560 262 560 280 L560 300 L60 300 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)"/>
        <circle cx="180" cy="300" r="34" fill="#0b0b0f" stroke="rgba(224,25,51,0.7)" stroke-width="5"/>
        <circle cx="430" cy="300" r="34" fill="#0b0b0f" stroke="rgba(224,25,51,0.7)" stroke-width="5"/>
        <path d="M215 200 L320 200 L360 235 L200 235 Z" fill="rgba(224,25,51,0.18)"/>`;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${g1}"/><stop offset="1" stop-color="${g2}"/>
          </linearGradient>
          <radialGradient id="gl" cx="0.3" cy="0.2" r="0.8">
            <stop offset="0" stop-color="rgba(224,25,51,0.4)"/><stop offset="1" stop-color="rgba(224,25,51,0)"/>
          </radialGradient>
        </defs>
        <rect width="640" height="360" fill="url(#bg)"/>
        <rect width="640" height="360" fill="url(#gl)"/>
        ${car}
        <text x="40" y="60" fill="rgba(224,25,51,0.95)" font-family="Arial" font-weight="800" font-size="20" letter-spacing="4">${tag||'KIA SERVICE'}</text>
        <text x="40" y="330" fill="rgba(255,255,255,0.92)" font-family="Arial" font-weight="700" font-size="22">${title||''}</text>
      </svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}

/* =====================================================================
   Render: SERVICES
   ===================================================================== */
async function renderServices(limit){
    const grid=document.getElementById('svc-grid'); if(!grid)return;
    const data=await loadJSON('data/services.json');
    const list=limit?data.slice(0,limit):data;
    grid.innerHTML=list.map((s,i)=>`
      <article class="svc-card reveal ${'d'+(i%4+1)}" data-cat="${s.cat}">
        <div class="ic">${svgIcon(s.icon)}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <span class="go">→</span>
      </article>`).join('');
    // category filter (if toolbar present)
    const toolbar=document.getElementById('svc-toolbar');
    if(toolbar){
        toolbar.addEventListener('click',e=>{
            const chip=e.target.closest('.chip'); if(!chip)return;
            toolbar.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
            chip.classList.add('active');
            const cat=chip.dataset.cat;
            grid.querySelectorAll('.svc-card').forEach(card=>{
                card.style.display=(cat==='all'||card.dataset.cat===cat)?'':'none';
            });
        });
    }
    revealAgain(grid);
}

/* =====================================================================
   Render: GALLERY (masonry + filter + lightbox + lazy)
   ===================================================================== */
async function renderGallery(limit){
    const grid=document.getElementById('gal-grid'); if(!grid)return;
    const data=await loadJSON('data/gallery.json');
    const list=limit?data.slice(0,limit):data;
    grid.innerHTML=list.map((g,i)=>`
      <figure class="gal-item reveal" data-cat="${g.cat}" data-i="${i}">
        <div class="ph" style="--ar:${g.ar||'4/3'}">
          <img loading="lazy" src="${g.img||svgPhoto(g.title,g.tag,i)}" alt="${g.title}"
               onerror="this.onerror=null;this.src='${svgPhoto(g.title,g.tag,i)}'">
        </div>
        <figcaption class="ov"><span>${g.tag}</span><h4>${g.title}</h4></figcaption>
      </figure>`).join('');
    const lbList=list.map((g,i)=>({type:'image',src:g.img||svgPhoto(g.title,g.tag,i),cap:g.title}));
    grid.querySelectorAll('.gal-item').forEach(el=>{
        el.addEventListener('click',()=>Lightbox.open(lbList,+el.dataset.i));
    });
    const filter=document.getElementById('gal-filter');
    if(filter){
        filter.addEventListener('click',e=>{
            const chip=e.target.closest('.chip'); if(!chip)return;
            filter.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
            chip.classList.add('active');
            const cat=chip.dataset.cat;
            grid.querySelectorAll('.gal-item').forEach(it=>{
                it.classList.toggle('hide',!(cat==='all'||it.dataset.cat===cat));
            });
        });
    }
    revealAgain(grid);
}

/* =====================================================================
   Render: VIDEOS
   ===================================================================== */
async function renderVideos(limit){
    const grid=document.getElementById('vid-grid'); if(!grid)return;
    const data=await loadJSON('data/videos.json');
    const list=limit?data.slice(0,limit):data;
    grid.innerHTML=list.map((v,i)=>`
      <article class="vid-card reveal" data-yt="${v.yt}" data-title="${v.title}">
        <img class="thumb" loading="lazy" src="${svgPhoto(v.title,'ВИДЕО · '+v.dur,i+3)}" alt="${v.title}">
        <div class="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
        <div class="meta"><h4>${v.title}</h4><span>Տևողություն · ${v.dur}</span></div>
      </article>`).join('');
    grid.querySelectorAll('.vid-card').forEach(el=>{
        el.addEventListener('click',()=>Lightbox.open([{type:'video',src:el.dataset.yt,cap:el.dataset.title}],0));
    });
    revealAgain(grid);
}

/* =====================================================================
   Render: REVIEWS
   ===================================================================== */
async function renderReviews(){
    const track=document.getElementById('rev-slides'); if(!track)return;
    const data=await loadJSON('data/reviews.json');
    track.innerHTML=data.map(r=>`
      <div class="slide"><div class="review-card">
        <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
        <p>“${r.text}”</p>
        <div class="who">
          <div class="av">${r.photo?`<img loading="lazy" src="${r.photo}" alt="${r.name}" onerror="this.parentNode.textContent='${r.name.charAt(0)}'">`:r.name.charAt(0)}</div>
          <div style="text-align:left"><b>${r.name}</b><span>${r.car}</span></div>
        </div>
      </div></div>`).join('');
    if(typeof initSlider==='function')initSlider();
}

/* =====================================================================
   Render: FAQ
   ===================================================================== */
async function renderFaq(){
    const wrap=document.getElementById('faq-wrap'); if(!wrap)return;
    const data=await loadJSON('data/faq.json');
    wrap.innerHTML=data.map(f=>`
      <div class="faq-item">
        <button class="faq-q">${f.q}<span class="ic">+</span></button>
        <div class="faq-a"><p>${f.a}</p></div>
      </div>`).join('');
    if(typeof initFaq==='function')initFaq();
}

/* =====================================================================
   Render: SPECIALISTS
   ===================================================================== */
async function renderTeam(){
    const grid=document.getElementById('team-grid'); if(!grid)return;
    const data=await loadJSON('data/specialists.json');
    grid.innerHTML=data.map((m,i)=>`
      <article class="member reveal ${'d'+(i%4+1)}">
        <div class="avatar"><span class="init">${m.init}</span>${m.photo?`<img loading="lazy" src="${m.photo}" alt="${m.name}" onerror="this.remove()">`:''}</div>
        <div class="info">
          <h4>${m.name}</h4>
          <div class="role">${m.role}</div>
          <p>${m.spec}</p>
          <span class="exp">${m.exp} փորձ</span>
        </div>
      </article>`).join('');
    revealAgain(grid);
}

/* ---------- re-observe freshly injected .reveal nodes ---------- */
function revealAgain(scope){
    const els=scope.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-s');
    if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('show'));return;}
    const io=new IntersectionObserver((en)=>en.forEach(e=>{
        if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target);}
    }),{threshold:.1});
    els.forEach(e=>io.observe(e));
}

/* ---------- Auto-run present sections ---------- */
document.addEventListener('DOMContentLoaded',()=>{
    const home=document.body.dataset.page;
    renderReviews(); renderFaq(); renderTeam();
    if(home==='home'){ renderServices(9); renderGallery(9); renderVideos(6); }
    else{ renderServices(); renderGallery(); renderVideos(); }
});
