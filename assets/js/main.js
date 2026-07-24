/* =====================================================================
   KIA SERVICE — Core JS (Vanilla, no libraries)
   ===================================================================== */
'use strict';

/* ---------- Global site config ---------- */
const SITE = {
    name: 'KIA SERVICE',
    phone1: '+37455579909',
    phone1d: '055 57 99 09',
    phone2: '+37491579909',
    phone2d: '091 57 99 09',
    whatsapp: '37455579909',
    telegram: '37455579909',
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    location: 'Զովունի, Հայաստան',
    hours: 'Երկ - Շաբ · 09:00 – 20:00',
};
const waLink = (msg) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
const tgLink = (msg) => `https://t.me/+${SITE.telegram}?text=${encodeURIComponent(msg)}`;

/* =====================================================================
   1. Custom cursor + mouse-follow glow
   ===================================================================== */
(function cursor(){
    if (window.matchMedia('(max-width:900px)').matches) return;
    const dot = document.createElement('div'); dot.className='cursor-dot';
    const ring = document.createElement('div'); ring.className='cursor-ring';
    document.body.append(dot, ring);
    let rx=0, ry=0, mx=0, my=0;
    window.addEventListener('mousemove', e=>{
        mx=e.clientX; my=e.clientY;
        dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop(){
        rx+=(mx-rx)*0.18; ry+=(my-ry)*0.18;
        ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        requestAnimationFrame(loop);
    })();
    const hoverSel='a,button,.chip,.gal-item,.svc-card,.faq-q,.vid-card,.part-card,input,textarea,select';
    document.addEventListener('mouseover', e=>{ if(e.target.closest(hoverSel)) ring.classList.add('hover'); });
    document.addEventListener('mouseout', e=>{ if(e.target.closest(hoverSel)) ring.classList.remove('hover'); });
})();

/* =====================================================================
   2. Particle field (canvas)
   ===================================================================== */
(function particles(){
    const c=document.getElementById('particles'); if(!c) return;
    const ctx=c.getContext('2d'); let w,h,pts;
    const N = window.innerWidth<768 ? 34 : 70;
    function seed(){ pts=Array.from({length:N},()=>({
        x:Math.random(), y:Math.random(),
        vx:(Math.random()-.5)*0.0006, vy:(Math.random()-.5)*0.0006,
        r:Math.random()*1.6+0.4
    })); }
    function resize(){ w=c.width=innerWidth; h=c.height=innerHeight; }
    resize(); seed();
    addEventListener('resize', ()=>{ resize(); });
    (function draw(){
        ctx.clearRect(0,0,w,h);
        for(const p of pts){
            p.x+=p.vx; p.y+=p.vy;
            if(p.x<0||p.x>1)p.vx*=-1; if(p.y<0||p.y>1)p.vy*=-1;
            const px=p.x*w, py=p.y*h;
            ctx.beginPath(); ctx.arc(px,py,p.r,0,7);
            ctx.fillStyle='rgba(224,25,51,.55)'; ctx.fill();
        }
        for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
            const a=pts[i],b=pts[j];
            const dx=(a.x-b.x)*w, dy=(a.y-b.y)*h; const d=Math.hypot(dx,dy);
            if(d<130){ ctx.beginPath(); ctx.moveTo(a.x*w,a.y*h); ctx.lineTo(b.x*w,b.y*h);
                ctx.strokeStyle=`rgba(255,255,255,${0.06*(1-d/130)})`; ctx.stroke(); }
        }
        requestAnimationFrame(draw);
    })();
})();

/* =====================================================================
   3. Header scroll + burger
   ===================================================================== */
(function header(){
    const hd=document.querySelector('header');
    const onScroll=()=>hd&&hd.classList.toggle('scrolled', scrollY>30);
    addEventListener('scroll', onScroll); onScroll();
    const burger=document.querySelector('.burger'), nav=document.querySelector('.nav');
    if(burger){
        burger.addEventListener('click',()=>{burger.classList.toggle('active');nav.classList.toggle('open');});
        nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{burger.classList.remove('active');nav.classList.remove('open');}));
    }
})();

/* =====================================================================
   4. Scroll reveal
   ===================================================================== */
(function reveal(){
    const els=document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-s');
    if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('show'));return;}
    const io=new IntersectionObserver((en)=>en.forEach(e=>{
        if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target);}
    }),{threshold:.12});
    els.forEach(e=>io.observe(e));
})();

/* =====================================================================
   5. Animated counters
   ===================================================================== */
(function counters(){
    const els=document.querySelectorAll('[data-count]'); if(!els.length) return;
    const run=el=>{
        const target=parseFloat(el.dataset.count), suf=el.dataset.suffix||'', dur=1600;
        let start=null;
        const step=ts=>{
            if(!start)start=ts; const p=Math.min((ts-start)/dur,1);
            const val=Math.floor((1-Math.pow(1-p,3))*target);
            el.textContent=val.toLocaleString('en-US')+suf;
            if(p<1)requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    const io=new IntersectionObserver((en)=>en.forEach(e=>{
        if(e.isIntersecting){run(e.target);io.unobserve(e.target);}
    }),{threshold:.5});
    els.forEach(e=>io.observe(e));
})();

/* =====================================================================
   6. Card mouse-glow position
   ===================================================================== */
(function glow(){
    document.addEventListener('mousemove', e=>{
        const card=e.target.closest('.svc-card'); if(!card)return;
        const r=card.getBoundingClientRect();
        card.style.setProperty('--mx',(e.clientX-r.left)+'px');
        card.style.setProperty('--my',(e.clientY-r.top)+'px');
    });
})();

/* =====================================================================
   7. FAQ accordion
   ===================================================================== */
function initFaq(){
    document.querySelectorAll('.faq-q').forEach(q=>{
        if(q.dataset.wired)return; q.dataset.wired='1';
        q.addEventListener('click',()=>{
            const item=q.parentElement, a=item.querySelector('.faq-a');
            const open=item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(i=>{i.classList.remove('open');i.querySelector('.faq-a').style.maxHeight=null;});
            if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
        });
    });
}

/* =====================================================================
   8. Reviews slider
   ===================================================================== */
function initSlider(){
    const slider=document.querySelector('.slider'); if(!slider)return;
    if(slider.dataset.wired)return;
    const track=slider.querySelector('.slides'), slides=[...track.children];
    if(!slides.length)return;              // nothing rendered yet — wait for renderer
    slider.dataset.wired='1';
    const dots=slider.parentElement.querySelector('.dots'); dots.innerHTML='';
    let i=0, timer;
    slides.forEach((_,idx)=>{const d=document.createElement('i');if(!idx)d.className='active';d.onclick=()=>go(idx);dots.appendChild(d);});
    const go=n=>{i=(n+slides.length)%slides.length;track.style.transform=`translateX(-${i*100}%)`;
        [...dots.children].forEach((d,x)=>d.classList.toggle('active',x===i));};
    slider.parentElement.querySelector('.prev').onclick=()=>{go(i-1);restart();};
    slider.parentElement.querySelector('.next').onclick=()=>{go(i+1);restart();};
    const restart=()=>{clearInterval(timer);timer=setInterval(()=>go(i+1),5500);};
    restart();
}

/* =====================================================================
   9. Before / After slider
   ===================================================================== */
(function beforeAfter(){
    const ba=document.querySelector('.ba'); if(!ba)return;
    const after=ba.querySelector('.after'), handle=ba.querySelector('.handle');
    let drag=false;
    const set=x=>{const r=ba.getBoundingClientRect();let p=(x-r.left)/r.width*100;p=Math.max(2,Math.min(98,p));
        after.style.clipPath=`inset(0 0 0 ${p}%)`;handle.style.left=p+'%';};
    const start=()=>drag=true, end=()=>drag=false;
    ba.addEventListener('mousedown',e=>{start();set(e.clientX);});
    addEventListener('mouseup',end);
    addEventListener('mousemove',e=>drag&&set(e.clientX));
    ba.addEventListener('touchstart',e=>{start();set(e.touches[0].clientX);});
    addEventListener('touchend',end);
    ba.addEventListener('touchmove',e=>drag&&set(e.touches[0].clientX));
})();

/* =====================================================================
   10. Lightbox (images + video)
   ===================================================================== */
const Lightbox=(function(){
    let items=[], cur=0, box;
    function build(){
        box=document.createElement('div'); box.className='lightbox';
        box.innerHTML=`<button class="lb-close" aria-label="Փակել">✕</button>
            <button class="lb-prev" aria-label="Նախորդ">‹</button>
            <button class="lb-next" aria-label="Հաջորդ">›</button>
            <div class="lb-stage"></div>
            <div class="lb-cap"></div>`;
        document.body.appendChild(box);
        box.querySelector('.lb-close').onclick=close;
        box.querySelector('.lb-prev').onclick=()=>show(cur-1);
        box.querySelector('.lb-next').onclick=()=>show(cur+1);
        box.addEventListener('click',e=>{if(e.target===box)close();});
        addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;
            if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1);});
    }
    function show(n){
        cur=(n+items.length)%items.length; const it=items[cur];
        const stage=box.querySelector('.lb-stage');
        if(it.type==='video'){
            stage.innerHTML=`<iframe class="lb-media" width="900" height="506" src="https://www.youtube.com/embed/${it.src}?autoplay=1" title="video" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        }else{
            stage.innerHTML=`<img src="${it.src}" alt="${it.cap||''}">`;
        }
        box.querySelector('.lb-cap').textContent=it.cap||'';
    }
    function open(list,index){ if(!box)build(); items=list; box.classList.add('open'); show(index||0); }
    function close(){ box.classList.remove('open'); box.querySelector('.lb-stage').innerHTML=''; }
    return {open};
})();

/* =====================================================================
   11. Modal helpers
   ===================================================================== */
function openModal(id){const m=document.getElementById(id);if(m){m.classList.add('open');document.body.style.overflow='hidden';}}
function closeModal(el){const m=el.closest('.modal-back')||el;m.classList.remove('open');document.body.style.overflow='';}
document.addEventListener('click',e=>{
    if(e.target.matches('[data-open]'))openModal(e.target.dataset.open);
    if(e.target.matches('.modal-back')||e.target.closest('.modal-close'))closeModal(e.target.matches('.modal-back')?e.target:e.target.closest('.modal-close'));
});

/* ---------- Toast ---------- */
function toast(msg){
    let t=document.querySelector('.toast');
    if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}
    t.textContent=msg;requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>t.classList.remove('show'),3200);
}

/* =====================================================================
   12. Booking form -> WhatsApp / Telegram
   ===================================================================== */
function initBooking(){
    const form=document.getElementById('bookingForm'); if(!form)return;
    const compose=()=>{
        const d=Object.fromEntries(new FormData(form).entries());
        return `Բարև, KIA SERVICE 👋\n\n`+
            `👤 Անուն՝ ${d.name||'-'}\n`+
            `📞 Հեռախոս՝ ${d.phone||'-'}\n`+
            `🚗 Մեքենա՝ ${d.car||'-'}\n`+
            `📅 Տարեթիվ՝ ${d.year||'-'}\n`+
            `🛠️ Խնդիրը՝ ${d.problem||'-'}\n`+
            `🗓️ Ամսաթիվ՝ ${d.date||'-'}\n`+
            `⏰ Ժամ՝ ${d.time||'-'}`;
    };
    const send=(channel)=>{
        if(!form.reportValidity())return;
        const msg=compose();
        window.open(channel==='tg'?tgLink(msg):waLink(msg),'_blank');
        toast('Հայտն ուղարկվում է '+(channel==='tg'?'Telegram':'WhatsApp')+' 📨');
        try{const arr=JSON.parse(localStorage.getItem('kia_bookings')||'[]');
            arr.push({...Object.fromEntries(new FormData(form)),ts:Date.now()});
            localStorage.setItem('kia_bookings',JSON.stringify(arr));}catch(_){}
    };
    form.addEventListener('submit',e=>{e.preventDefault();send('wa');});
    const tg=form.querySelector('[data-send="tg"]'); if(tg)tg.addEventListener('click',()=>send('tg'));
}

/* =====================================================================
   13. Init social/contact links from SITE
   ===================================================================== */
function bindSite(){
    document.querySelectorAll('[data-wa]').forEach(a=>a.href=waLink('Բարև 👋 Ցանկանում եմ ամրագրել սպասարկում KIA SERVICE-ում։'));
    document.querySelectorAll('[data-tg]').forEach(a=>a.href=tgLink('Բարև 👋 Ցանկանում եմ ամրագրել սպասարկում KIA SERVICE-ում։'));
    document.querySelectorAll('[data-call]').forEach(a=>a.href='tel:'+SITE.phone1);
    document.querySelectorAll('[data-fb]').forEach(a=>a.href=SITE.facebook);
    document.querySelectorAll('[data-ig]').forEach(a=>a.href=SITE.instagram);
    const y=document.getElementById('year'); if(y)y.textContent=new Date().getFullYear();
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded',()=>{
    bindSite(); initBooking();
    // Static FAQ/slider markup (if a page ships it inline) still gets wired.
    // Dynamically-rendered sections call these again after injection (both are idempotent).
    initFaq(); initSlider();
});
