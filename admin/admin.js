/* =====================================================================
   KIA SERVICE — Admin Panel logic (Vanilla JS)
   Simulated backend: seeds from /data/*.json, persists to localStorage,
   exports/imports JSON so edits can be saved back to the data files.
   ===================================================================== */
'use strict';

/* ---------- Auth ---------- */
const AdminAuth={
    USER:'admin', PASS:'kia2026', KEY:'kia_admin_session',
    initLogin(){
        const f=document.getElementById('loginForm'); if(!f)return;
        if(sessionStorage.getItem(this.KEY)==='1'){location.href='dashboard.html';return;}
        f.addEventListener('submit',e=>{
            e.preventDefault();
            const d=Object.fromEntries(new FormData(f));
            if(d.user===this.USER&&d.pass===this.PASS){
                sessionStorage.setItem(this.KEY,'1'); location.href='dashboard.html';
            }else{ document.getElementById('err').textContent='Սխալ օգտանուն կամ գաղտնաբառ։'; }
        });
    },
    guard(){ if(sessionStorage.getItem(this.KEY)!=='1'){location.href='index.html';} },
    logout(){ sessionStorage.removeItem(this.KEY); location.href='index.html'; }
};

/* ---------- Collections config ---------- */
const COLLECTIONS={
    parts:{key:'kia_parts',file:'../data/parts.json',label:'Պահեստամասեր',
        cols:['img','name','code','cat','price','type','stock'],
        fields:[
            {n:'name',l:'Անվանում',t:'text',req:1},
            {n:'code',l:'Կոդ',t:'text',req:1},
            {n:'cat',l:'Մոդել',t:'select',opts:['Elantra','Forte','K5','Sportage','Tucson','Sorento','Santa Fe','Accent']},
            {n:'price',l:'Գին (֏)',t:'number',req:1},
            {n:'type',l:'Տեսակ',t:'select',opts:['orig','oem','used']},
            {n:'stock',l:'Առկա է',t:'bool'},
            {n:'desc',l:'Նկարագրություն',t:'textarea'},
            {n:'img',l:'Նկար',t:'image'}
        ]},
    services:{key:'kia_services',file:'../data/services.json',label:'Ծառայություններ',
        cols:['title','cat','desc'],
        fields:[
            {n:'title',l:'Անվանում',t:'text',req:1},
            {n:'cat',l:'Կատեգորիա',t:'select',opts:['diag','engine','trans','chassis','elec','comfort']},
            {n:'icon',l:'Իկոն (key)',t:'text'},
            {n:'desc',l:'Նկարագրություն',t:'textarea'}
        ]},
    gallery:{key:'kia_gallery',file:'../data/gallery.json',label:'Գալերիա',
        cols:['title','tag','cat'],
        fields:[
            {n:'title',l:'Վերնագիր',t:'text',req:1},
            {n:'tag',l:'Պիտակ',t:'text'},
            {n:'cat',l:'Կատեգորիա',t:'select',opts:['kia','hyundai','elantra','forte','engine','transmission','suspension']},
            {n:'ar',l:'Հարաբերություն',t:'select',opts:['4/3','3/4','1/1']},
            {n:'img',l:'Նկար',t:'image'}
        ]},
    reviews:{key:'kia_reviews',file:'../data/reviews.json',label:'Կարծիքներ',
        cols:['name','car','stars'],
        fields:[
            {n:'name',l:'Անուն',t:'text',req:1},
            {n:'car',l:'Մեքենա',t:'text'},
            {n:'stars',l:'Աստղեր (1-5)',t:'number'},
            {n:'text',l:'Կարծիք',t:'textarea',req:1}
        ]},
    faq:{key:'kia_faq',file:'../data/faq.json',label:'Հ.Տ.Հ',
        cols:['q'],
        fields:[
            {n:'q',l:'Հարց',t:'text',req:1},
            {n:'a',l:'Պատասխան',t:'textarea',req:1}
        ]},
    specialists:{key:'kia_specialists',file:'../data/specialists.json',label:'Վարպետներ',
        cols:['name','role','exp'],
        fields:[
            {n:'name',l:'Անուն',t:'text',req:1},
            {n:'init',l:'Սկզբնատառ',t:'text'},
            {n:'role',l:'Պաշտոն',t:'text'},
            {n:'exp',l:'Փորձ',t:'text'},
            {n:'spec',l:'Մասնագիտացում',t:'textarea'}
        ]},
    videos:{key:'kia_videos',file:'../data/videos.json',label:'Վիդեո',
        cols:['title','yt','dur'],
        fields:[
            {n:'title',l:'Վերնագիր',t:'text',req:1},
            {n:'yt',l:'YouTube ID',t:'text',req:1},
            {n:'dur',l:'Տևողություն',t:'text'}
        ]}
};

/* ---------- Store ---------- */
const Store={
    async get(name){
        const c=COLLECTIONS[name];
        const local=localStorage.getItem(c.key);
        if(local){try{return JSON.parse(local);}catch(_){}}
        try{ const d=await (await fetch(c.file,{cache:'no-store'})).json();
            localStorage.setItem(c.key,JSON.stringify(d)); return d; }catch(_){ return []; }
    },
    set(name,data){ localStorage.setItem(COLLECTIONS[name].key,JSON.stringify(data)); },
    async site(){
        const local=localStorage.getItem('kia_site');
        if(local){try{return JSON.parse(local);}catch(_){}}
        try{ const d=await (await fetch('../data/site.json',{cache:'no-store'})).json();
            localStorage.setItem('kia_site',JSON.stringify(d)); return d;}catch(_){return{};}
    },
    saveSite(obj){ localStorage.setItem('kia_site',JSON.stringify(obj)); }
};

/* ---------- Helpers ---------- */
const el=(h)=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild;};
function toast(m){let t=document.querySelector('.toast');if(!t){t=el('<div class="toast"></div>');document.body.appendChild(t);}t.textContent=m;requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>t.classList.remove('show'),2600);}
const esc=(s)=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function partImg(p,i){ if(p.img)return p.img; return svgThumb(p.name||p.title||'KIA',i); }
function svgThumb(title,i){
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140"><rect width="200" height="140" fill="#16161f"/><circle cx="60" cy="120" r="16" fill="#0b0b0f" stroke="#e01933" stroke-width="3"/><circle cx="150" cy="120" r="16" fill="#0b0b0f" stroke="#e01933" stroke-width="3"/><rect x="30" y="60" width="140" height="40" rx="10" fill="rgba(255,255,255,.06)"/><text x="14" y="30" fill="#e01933" font-family="Arial" font-size="12" font-weight="700">KIA</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}

/* =====================================================================
   Dashboard
   ===================================================================== */
const Dashboard={
    current:'dashboard',
    async init(){
        AdminAuth.guard();
        this.bindNav();
        await this.renderStats();
        await this.renderAll();
        await this.loadSettings();
        this.bindExport();
    },
    bindNav(){
        document.querySelectorAll('.nav-item[data-sec]').forEach(b=>{
            b.addEventListener('click',()=>this.show(b.dataset.sec));
        });
        const mt=document.querySelector('.mobile-toggle');
        if(mt)mt.addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));
        document.getElementById('logoutBtn').addEventListener('click',()=>AdminAuth.logout());
    },
    show(sec){
        this.current=sec;
        document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active',s.id==='sec-'+sec));
        document.querySelectorAll('.nav-item[data-sec]').forEach(b=>b.classList.toggle('active',b.dataset.sec===sec));
        document.getElementById('pageTitle').textContent=document.querySelector(`.nav-item[data-sec="${sec}"]`)?.dataset.title||'Dashboard';
        document.querySelector('.sidebar').classList.remove('open');
    },
    async renderStats(){
        const box=document.getElementById('statCards'); if(!box)return;
        const entries=Object.keys(COLLECTIONS);
        const counts={};
        for(const k of entries){counts[k]=(await Store.get(k)).length;}
        const bookings=(JSON.parse(localStorage.getItem('kia_bookings')||'[]')).length;
        const map=[
            {k:'parts',ic:'🔧'},{k:'services',ic:'🛠️'},{k:'gallery',ic:'🖼️'},
            {k:'reviews',ic:'⭐'},{k:'specialists',ic:'👨‍🔧'},{k:'videos',ic:'🎬'}
        ];
        box.innerHTML=map.map(m=>`<div class="card"><div class="ic" style="font-size:20px">${m.ic}</div><b>${counts[m.k]||0}</b><span>${COLLECTIONS[m.k].label}</span></div>`).join('')
          +`<div class="card"><div class="ic" style="font-size:20px">📨</div><b>${bookings}</b><span>Ամրագրումներ</span></div>`;
    },
    async renderAll(){
        for(const name of Object.keys(COLLECTIONS)){ await this.renderTable(name); }
    },
    async renderTable(name){
        const c=COLLECTIONS[name];
        const body=document.getElementById('tbody-'+name); if(!body)return;
        const data=await Store.get(name);
        if(!data.length){body.innerHTML=`<tr><td colspan="${c.cols.length+1}"><div class="empty">Դատարկ է։ Ավելացրեք նոր տարր։</div></td></tr>`;return;}
        body.innerHTML=data.map((row,i)=>{
            const cells=c.cols.map(col=>{
                if(col==='img')return `<td><img class="thumb" src="${partImg(row,i)}" alt=""></td>`;
                if(col==='price')return `<td>${Number(row.price).toLocaleString('en-US')} ֏</td>`;
                if(col==='stock')return `<td><span class="pill ${row.stock?'in':'out'}">${row.stock?'Առկա':'Չկա'}</span></td>`;
                if(col==='type')return `<td><span class="pill ${row.type}">${row.type}</span></td>`;
                if(col==='stars')return `<td>${'★'.repeat(row.stars||0)}</td>`;
                return `<td>${esc(row[col]).slice(0,60)}</td>`;
            }).join('');
            return `<tr>${cells}<td><div class="row-actions">
                <button class="btn btn-ghost btn-sm" data-edit="${name}:${i}">Խմբագրել</button>
                <button class="btn btn-danger btn-sm" data-del="${name}:${i}">✕</button>
            </div></td></tr>`;
        }).join('');
    },
    bindExport(){
        document.getElementById('exportBtn').addEventListener('click',()=>this.exportAll());
        const imp=document.getElementById('importInput');
        imp.addEventListener('change',e=>this.importAll(e.target.files[0]));
        document.getElementById('resetBtn').addEventListener('click',()=>{
            if(confirm('Վերականգնե՞լ սկզբնական տվյալները (localStorage-ը կմաքրվի)։')){
                ['parts','services','gallery','reviews','faq','specialists','videos'].forEach(k=>localStorage.removeItem(COLLECTIONS[k].key));
                localStorage.removeItem('kia_site'); location.reload();
            }
        });
    },
    async exportAll(){
        const out={};
        for(const k of Object.keys(COLLECTIONS)){out[k]=await Store.get(k);}
        out.site=await Store.site();
        const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);
        a.download='kia-data-export.json';a.click();
        toast('Տվյալները արտահանվեցին ✅');
    },
    importAll(file){
        if(!file)return;
        const r=new FileReader();
        r.onload=()=>{
            try{
                const obj=JSON.parse(r.result);
                Object.keys(COLLECTIONS).forEach(k=>{if(obj[k])Store.set(k,obj[k]);});
                if(obj.site)Store.saveSite(obj.site);
                toast('Ներմուծված է ✅'); setTimeout(()=>location.reload(),700);
            }catch(_){toast('Սխալ ֆայլ ❌');}
        };
        r.readAsText(file);
    },
    async loadSettings(){
        const s=await Store.site();
        const f=document.getElementById('settingsForm'); if(!f)return;
        Object.keys(s).forEach(k=>{if(f.elements[k])f.elements[k].value=s[k];});
        f.addEventListener('submit',e=>{
            e.preventDefault();
            const d=Object.fromEntries(new FormData(f));
            Store.saveSite(d); toast('Կարգավորումները պահպանվեցին ✅');
        });
    }
};

/* ---------- Item modal (add/edit) ---------- */
const ItemModal={
    open(name,index){
        const c=COLLECTIONS[name];
        Store.get(name).then(data=>{
            const item=index!=null?data[index]:{};
            const back=document.getElementById('itemModal');
            document.getElementById('mTitle').textContent=(index!=null?'Խմբագրել':'Ավելացնել')+' · '+c.label;
            const body=document.getElementById('mBody');
            body.innerHTML=c.fields.map(f=>this.field(f,item[f.n])).join('');
            // image preview wiring
            body.querySelectorAll('input[type=file]').forEach(inp=>{
                inp.addEventListener('change',e=>{
                    const file=e.target.files[0]; if(!file)return;
                    const rd=new FileReader();
                    rd.onload=()=>{const prev=inp.parentElement.querySelector('.thumbprev');prev.src=rd.result;prev.style.display='block';prev.dataset.val=rd.result;};
                    rd.readAsDataURL(file);
                });
            });
            back.classList.add('open');
            document.getElementById('mSave').onclick=()=>this.save(name,index);
        });
    },
    field(f,val){
        val=val==null?'':val;
        if(f.t==='textarea')return `<div class="f"><label>${f.l}</label><textarea name="${f.n}" ${f.req?'required':''}>${esc(val)}</textarea></div>`;
        if(f.t==='select')return `<div class="f"><label>${f.l}</label><select name="${f.n}">${f.opts.map(o=>`<option ${o==val?'selected':''}>${o}</option>`).join('')}</select></div>`;
        if(f.t==='bool')return `<div class="f"><label>${f.l}</label><select name="${f.n}"><option value="true" ${val?'selected':''}>Այո</option><option value="false" ${!val?'selected':''}>Ոչ</option></select></div>`;
        if(f.t==='number')return `<div class="f"><label>${f.l}</label><input type="number" name="${f.n}" value="${esc(val)}" ${f.req?'required':''}></div>`;
        if(f.t==='image')return `<div class="f"><label>${f.l} (ֆայլ կամ URL)</label><input type="text" name="${f.n}" value="${esc(val)}" placeholder="https://..."><input type="file" accept="image/*" style="margin-top:8px"><img class="thumbprev" src="${val||''}" style="${val?'display:block':''}"></div>`;
        return `<div class="f"><label>${f.l}</label><input type="text" name="${f.n}" value="${esc(val)}" ${f.req?'required':''}></div>`;
    },
    async save(name,index){
        const c=COLLECTIONS[name];
        const body=document.getElementById('mBody');
        const obj={};
        for(const f of c.fields){
            const inp=body.querySelector(`[name="${f.n}"]`);
            let v=inp?inp.value:'';
            if(f.t==='image'){ const prev=inp.parentElement.querySelector('.thumbprev'); if(prev&&prev.dataset.val)v=prev.dataset.val; }
            if(f.t==='number')v=Number(v)||0;
            if(f.t==='bool')v=(v==='true');
            obj[f.n]=v;
        }
        // required check
        for(const f of c.fields){if(f.req&&(obj[f.n]===''||obj[f.n]==null)){toast('Լրացրեք բոլոր պարտադիր դաշտերը');return;}}
        const data=await Store.get(name);
        if(index!=null)data[index]=obj; else data.push(obj);
        Store.set(name,data);
        document.getElementById('itemModal').classList.remove('open');
        await Dashboard.renderTable(name);
        await Dashboard.renderStats();
        toast('Պահպանվեց ✅');
    }
};

/* ---------- Global click handlers ---------- */
document.addEventListener('click',async e=>{
    const add=e.target.closest('[data-add]'); if(add)ItemModal.open(add.dataset.add);
    const edit=e.target.closest('[data-edit]'); if(edit){const[n,i]=edit.dataset.edit.split(':');ItemModal.open(n,+i);}
    const del=e.target.closest('[data-del]'); if(del){
        const[n,i]=del.dataset.del.split(':');
        if(confirm('Ջնջե՞լ այս տարրը։')){
            const data=await Store.get(n); data.splice(+i,1); Store.set(n,data);
            await Dashboard.renderTable(n); await Dashboard.renderStats(); toast('Ջնջվեց 🗑️');
        }
    }
    if(e.target.closest('.mclose')||e.target.classList.contains('mback'))
        document.querySelectorAll('.mback.open').forEach(m=>m.classList.remove('open'));
});
