/* SIMULATOR BIAYA UMP 2027 · INDONESIA (/simulator-biaya-ump-2027.html). Tracking events are prefixed phr_psb_ (dataLayer, gtag, _hsq). Debug: ?debug=1&today=YYYY-MM-DD */
(function(){

const QS=new URLSearchParams(location.search);
const DEBUG=QS.get('debug')==='1';
function track(ev,props){props=props||{};try{(window.dataLayer=window.dataLayer||[]).push(Object.assign({event:ev},props));}catch(e){}
 try{if(window.gtag)gtag('event',ev,props);}catch(e){}
 try{if(window._hsq)_hsq.push(['trackCustomBehavioralEvent',{name:ev,properties:props}]);}catch(e){}
 if(DEBUG)console.log('[track]',ev,props);}
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
// intent ladder shared by both pages
const INTENT_RANK={low:0,medium:1,high:2};
function bumpIntent(sig){const s=LS.get('phr_psb_signals',{});s[sig]=true;LS.set('phr_psb_signals',s);
 let lvl='low';const ticks=LS.get('phr_psb_tickcount',0);
 if(ticks>=3||s.calendar||s.multiplier||s.simulator)lvl='medium';
 if((s.simulator||s.calendar_email)&&s.cta)lvl='high';
 const prev=LS.get('phr_psb_intent','low');
 if(INTENT_RANK[lvl]>INTENT_RANK[prev]){LS.set('phr_psb_intent',lvl);track('phr_psb_intent',{level:lvl});}}
function todayWIB(){const q=DEBUG&&QS.get('today');if(q)return q;
 const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return p;}
const nf=new Intl.NumberFormat('id-ID');
function rp(n){return 'Rp'+nf.format(Math.round(n));}
function rpShort(n){const a=Math.abs(n);let s;
 if(a>=1e12)s=(n/1e12).toLocaleString('id-ID',{maximumFractionDigits:2})+' T';
 else if(a>=1e9)s=(n/1e9).toLocaleString('id-ID',{maximumFractionDigits:2})+' M';
 else if(a>=1e6)s=(n/1e6).toLocaleString('id-ID',{maximumFractionDigits:1})+' jt';
 else s=nf.format(Math.round(n));return 'Rp'+s;}
function num(v){return Number(String(v).replace(/[^0-9,]/g,'').replace(',','.'))||0;}
document.addEventListener('click',e=>{const c=e.target.closest('[data-cta]');if(c){track('phr_psb_cta',{location:c.dataset.cta});bumpIntent('cta');}
 const d=e.target.closest('[data-demo]');if(d)track('phr_psb_demo',{});});

const $=id=>document.getElementById(id);
const CAP_KES=12000000, CAP_JP=11086300;
let simTracked=false;
/* Inputs only update their own controls and mark the result as stale; the result recalculates on "Hitung"
   (button click or Enter in any field). The first result is calculated on load from the example values. */
function fmtInput(el){el.addEventListener('input',()=>{el.value=el.value?nf.format(num(el.value)):'';changed();});}
['n','w','ot'].forEach(i=>fmtInput($(i)));
function touch(){if(!simTracked){simTracked=true;track('phr_psb_simulator',{});bumpIntent('simulator');}}
document.querySelectorAll('[data-w]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-w]').forEach(o=>o.setAttribute('aria-pressed',o===b?'true':'false'));$('w').value=nf.format(+b.dataset.w);changed();}));
document.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>{$('p').value=b.dataset.p;changed();}));
$('p').addEventListener('input',changed);$('jkk').addEventListener('change',changed);
function uiSync(){const p=Number($('p').value);$('po').textContent=p.toLocaleString('id-ID',{maximumFractionDigits:1})+'%';
 document.querySelectorAll('[data-p]').forEach(b=>b.setAttribute('aria-pressed',Math.abs(+b.dataset.p-p)<1e-9?'true':'false'));}
let stale=false;
function setStale(v){stale=v;$('out').classList.toggle('is-stale',v);$('stale-tag').hidden=!v;$('stale-note').hidden=!v;$('calc').classList.toggle('pulse',v);}
function changed(){uiSync();setStale(true);touch();}
let shownTotal=0,totRaf=0;
/* count-up of the total. On stacked screens it runs for exactly the glide's duration, so the number and the
   scroll finish together and nothing is still moving once the result lines up. */
let countMs=700;
function tweenTotal(to){cancelAnimationFrame(totRaf);const from=shownTotal,t0=performance.now(),el=$('o-year'),dur=countMs;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=rpShort(to);shownTotal=to;return;}
 const sync=dur!==700; // synced with the glide: same ease-in-out curve as the scroll
 (function st(t){const k=Math.min(1,(t-t0)/dur),e=sync?(k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2):1-Math.pow(1-k,3),v=from+(to-from)*e;el.textContent=rpShort(v);if(k<1)totRaf=requestAnimationFrame(st);else shownTotal=to;})(t0);}
$('f').addEventListener('submit',e=>{e.preventDefault();const out=$('out');
 countMs=stacked()?glideMs(out):700;
 calc(true);setStale(false);track('phr_psb_sim_calc',{});touch();
 out.classList.remove('flash');void out.offsetWidth;out.classList.add('flash');
 if(stacked())glide(out);});
/* stacked layout (<=920px): Hitung glides down to the result; "Kembali ke kalkulator" glides back to the form */
function stacked(){return matchMedia('(max-width:920px)').matches;}
function glideTarget(el){const n=document.getElementById('nvBar');const navH=n?Math.max(0,n.getBoundingClientRect().bottom):0;return el.getBoundingClientRect().top+scrollY-navH-12;}
function glideMs(el){return Math.min(1500,Math.max(850,Math.abs(glideTarget(el)-scrollY)*.95));}
function glide(el,done){const y=glideTarget(el);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){scrollTo(0,y);if(done)done();return;}
 const y0=scrollY,d=y-y0,dur=glideMs(el),t0=performance.now();
 const html=document.documentElement,prev=html.style.scrollBehavior;html.style.scrollBehavior='auto';
 (function st(t){const k=Math.min(1,(t-t0)/dur),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;scrollTo(0,y0+d*e);if(k<1)requestAnimationFrame(st);else{html.style.scrollBehavior=prev;if(done)done();}})(t0);}
$('back-calc').addEventListener('click',()=>glide($('f')));
const DEF={n:'2.000',w:'5.729.876',p:'7.5',jkk:'0.24',ot:'0'};
$('reset').addEventListener('click',()=>{$('n').value=DEF.n;$('w').value=DEF.w;$('p').value=DEF.p;$('jkk').value=DEF.jkk;$('ot').value=DEF.ot;
 document.querySelectorAll('[data-w]').forEach(o=>o.setAttribute('aria-pressed',String(o.dataset.w==='5729876')));
 calc(true);setStale(false);track('phr_psb_sim_reset',{});});
function bpjsEmployer(w,jkk){return Math.min(w,CAP_KES)*0.04+w*0.037+Math.min(w,CAP_JP)*0.02+w*(jkk/100)+w*0.003;}
function calc(animate){const n=num($('n').value),w=num($('w').value),p=Number($('p').value),jkk=Number($('jkk').value),ot=num($('ot').value);
 uiSync();
 const w2=Math.round(w*(1+p/100)),dw=w2-w;
 const dB=bpjsEmployer(w2,jkk)-bpjsEmployer(w,jkk);
 const wage=dw*12*n,thr=dw*n,bpjs=dB*12*n,otc=ot*(p/100)*12,total=wage+thr+bpjs+otc;
 if(animate)tweenTotal(total);else{$('o-year').textContent=rpShort(total);shownTotal=total;}
 $('o-sub').innerHTML='Selisih <b>'+rp(dw)+'</b> per orang, dikali <b>'+nf.format(n)+'</b> karyawan, dikali 13 kali bayar.';
 $('o-new').textContent=rp(w2);$('o-pp').textContent=rp(dw+dB);$('o-month').textContent=rpShort((dw+dB)*n+ot*(p/100));$('o-thr').textContent=rpShort(thr);
 const parts={wage,thr,bpjs,ot:otc},mx=Math.max(1,...Object.values(parts));
 document.querySelectorAll('.bar').forEach(r=>{const v=parts[r.dataset.k];r.querySelector('i').style.width=(v/mx*100)+'%';r.querySelector('b').textContent=rpShort(v);});
 const wn=$('o-warn');if(w2>CAP_JP){wn.hidden=false;wn.textContent='Upah baru melewati batas upah Jaminan Pensiun, jadi iuran JP berhenti naik di Rp11.086.300.';}else wn.hidden=true;}
calc();

})();
