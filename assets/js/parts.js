/* =====================================================================
   KIA SERVICE — Parts Store (catalog, search, filters, order)
   ===================================================================== */
'use strict';

(async function parts(){
    const grid=document.getElementById('parts-grid'); if(!grid)return;
    let DATA=[];
    try{
        // prefer admin-edited catalog from localStorage, else JSON file
        const local=localStorage.getItem('kia_parts');
        DATA=local?JSON.parse(local):await (await fetch('data/parts.json',{cache:'no-store'})).json();
    }catch(_){ DATA=[]; }

    const state={cat:'all',type:'all',q:''};
    const money=n=>Number(n).toLocaleString('en-US')+' ֏';
    const typeLabel={orig:'Original',oem:'OEM',used:'Used'};

    function card(p,i){
        return `<article class="part-card reveal" data-i="${i}">
          <div class="pimg">
            <img loading="lazy" src="${svgPhoto(p.name,p.cat,i)}" alt="${p.name}">
            <span class="tag ${p.type}">${typeLabel[p.type]||p.type}</span>
            <span class="stock ${p.stock?'in':'out'}">${p.stock?'Առկա է':'Սպառված'}</span>
          </div>
          <div class="pbody">
            <div class="code">Կոդ՝ ${p.code}</div>
            <h4>${p.name}</h4>
            <p class="pdesc">${p.desc||''}</p>
            <div class="prow">
              <div class="price">${money(p.price)}</div>
              <button class="order-btn" data-order="${i}" ${p.stock?'':'disabled'}>${p.stock?'Պատվիրել':'Չկա'}</button>
            </div>
          </div>
        </article>`;
    }

    function apply(){
        const list=DATA.filter(p=>{
            const okCat=state.cat==='all'||p.cat===state.cat;
            const okType=state.type==='all'||p.type===state.type;
            const okQ=!state.q||`${p.name} ${p.code} ${p.cat} ${p.desc}`.toLowerCase().includes(state.q.toLowerCase());
            return okCat&&okType&&okQ;
        });
        grid.innerHTML=list.length?list.map((p)=>card(p,DATA.indexOf(p))).join('')
            :`<div class="parts-empty">Ոչինչ չգտնվեց 🔍<br>Փորձեք այլ ֆիլտր կամ որոնում։</div>`;
        if(typeof revealAgain==='function')revealAgain(grid);
    }

    // build category chips dynamically
    const cats=['all',...new Set(DATA.map(p=>p.cat))];
    const catBox=document.getElementById('parts-cats');
    if(catBox){
        catBox.innerHTML=cats.map(c=>`<li><button class="${c==='all'?'active':''}" data-cat="${c}">${c==='all'?'Բոլոր մոդելները':c}</button></li>`).join('');
        catBox.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
            catBox.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
            state.cat=b.dataset.cat;apply();});
    }
    const typeBox=document.getElementById('parts-types');
    if(typeBox){
        typeBox.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
            typeBox.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
            state.type=b.dataset.type;apply();});
    }
    const search=document.getElementById('parts-q');
    if(search)search.addEventListener('input',e=>{state.q=e.target.value;apply();});

    // order -> modal -> WhatsApp/Telegram
    grid.addEventListener('click',e=>{
        const btn=e.target.closest('[data-order]'); if(!btn)return;
        const p=DATA[+btn.dataset.order];
        openOrder(p);
    });

    function openOrder(p){
        let modal=document.getElementById('orderModal');
        if(!modal){
            modal=document.createElement('div'); modal.id='orderModal'; modal.className='modal-back';
            modal.innerHTML=`<div class="modal glass"><div class="modal-head">
              <div><h3>Պատվիրել պահեստամաս</h3><p id="ord-sub"></p></div>
              <button class="modal-close">✕</button></div>
              <div class="modal-body"><form id="orderForm">
                <div class="field"><label>Անուն *</label><input name="name" required placeholder="Ձեր անունը"></div>
                <div class="field"><label>Հեռախոս *</label><input name="phone" required placeholder="0XX XXX XXX"></div>
                <div class="field"><label>Քանակ</label><input name="qty" type="number" min="1" value="1"></div>
                <div class="two-col" style="margin-top:8px">
                  <button type="submit" class="btn btn-wa" style="justify-content:center">Ուղարկել WhatsApp</button>
                  <button type="button" data-ord-tg class="btn btn-tg" style="justify-content:center">Ուղարկել Telegram</button>
                </div>
              </form></div></div>`;
            document.body.appendChild(modal);
        }
        modal.querySelector('#ord-sub').textContent=`${p.name} · ${p.code} · ${money(p.price)}`;
        const form=modal.querySelector('#orderForm'); form.reset();
        const compose=()=>{const d=Object.fromEntries(new FormData(form));
            return `Բարև, KIA SERVICE 🛒 Պատվեր\n\n`+
                `🔧 Պահեստամաս՝ ${p.name}\n`+
                `🔖 Կոդ՝ ${p.code}\n`+
                `💵 Գին՝ ${money(p.price)}\n`+
                `🔢 Քանակ՝ ${d.qty||1}\n`+
                `👤 Անուն՝ ${d.name||'-'}\n`+
                `📞 Հեռախոս՝ ${d.phone||'-'}`;};
        const go=ch=>{if(!form.reportValidity())return;
            window.open(ch==='tg'?tgLink(compose()):waLink(compose()),'_blank');
            toast('Պատվերն ուղարկվում է '+(ch==='tg'?'Telegram':'WhatsApp')+' 📨');};
        form.onsubmit=ev=>{ev.preventDefault();go('wa');};
        modal.querySelector('[data-ord-tg]').onclick=()=>go('tg');
        openModal('orderModal');
    }

    apply();
})();
