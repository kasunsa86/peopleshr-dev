/* CHECKLIST PAYROLL SKALA BESAR · INDONESIA 2026 (/checklist-payroll-skala-besar-2026.html). Tracking events are prefixed phr_psb_ (dataLayer, gtag, _hsq). Debug: ?debug=1&today=YYYY-MM-DD */
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

const LAYERS=[{"id": "data", "name": "Data", "win": [-10, -8], "n": 5}, {"id": "aturan", "name": "Aturan", "win": [-7, -6], "n": 5}, {"id": "sistem", "name": "Sistem", "win": [-5, -4], "n": 5}, {"id": "kontrol", "name": "Kontrol", "win": [-3, -1], "n": 5}, {"id": "komunikasi", "name": "Komunikasi", "win": [0, 20], "n": 5}];
const DATES=[{"d": "2026-11-21", "tag": "UPAH", "t": "Batas penetapan UMP 2027", "x": "Gubernur menetapkan UMP paling lambat 21 November (PP 36/2021 jo. PP 49/2025). Jatuh hari Sabtu dan tidak bergeser."}, {"d": "2026-11-25", "tag": "UPAH", "t": "Batas penetapan UMK 2027", "x": "Kini 25 November, lebih awal dari 30 November yang dulu (Pasal 35 PP 49/2025). Konfirmasi ke Disnaker setempat."}, {"d": "2026-12-10", "tag": "BPJS", "t": "Iuran BPJS Kesehatan", "x": "Batas bayar iuran setiap tanggal 10. Pastikan upah yang dilaporkan sudah sesuai data terbaru."}, {"d": "2026-12-15", "tag": "PAJAK", "t": "Setor PPh 21 masa November", "x": "Paling lambat tanggal 15 bulan berikutnya (PMK 81/2024)."}, {"d": "2026-12-21", "tag": "PAJAK", "t": "Lapor SPT Masa PPh 21 November", "x": "Tanggal 20 jatuh hari Minggu, jadi bergeser ke Senin 21 Desember."}, {"d": "2026-12-25", "tag": "LIBUR", "t": "Natal", "x": "Payroll Desember adalah masa pajak terakhir: PPh 21 dihitung ulang dengan tarif Pasal 17. Mulai lebih awal."}, {"d": "2027-01-01", "tag": "UPAH", "t": "UMP dan UMK 2027 berlaku", "x": "Payroll Januari wajib memakai upah minimum baru, termasuk dasar lembur 1/173 upah sebulan."}, {"d": "2027-01-15", "tag": "PAJAK", "t": "Setor PPh 21 masa Desember", "x": "Termasuk selisih hasil rekonsiliasi setahun dengan tarif Pasal 17."}, {"d": "2027-01-20", "tag": "PAJAK", "t": "Lapor SPT Masa PPh 21 Desember", "x": "Rabu. Lapor sebelum bukti potong tahunan dibagikan."}, {"d": "2027-01-29", "tag": "PAJAK", "t": "Bagikan BPA1 ke karyawan", "x": "Batasnya 1 bulan setelah masa pajak terakhir (PER-11/PJ/2025). 31 Januari jatuh hari Minggu, jadi kami sarankan selesai Jumat."}, {"d": "2027-03-01", "tag": "BPJS", "t": "Pantau batas upah Jaminan Pensiun 2027", "x": "Batas upah JP disesuaikan setiap Maret. 2026: Rp11.086.300 (surat B/1226/022026). Perbarui sistem begitu surat 2027 terbit."}, {"d": "2027-03-03", "tag": "THR", "t": "Batas bayar THR Idul Fitri", "x": "Paling lambat H-7 dari Idul Fitri 10 Maret 2027. THR membuat PPh 21 bulan itu naik karena TER dihitung dari bruto bulanan. Beri tahu karyawan."}, {"d": "2027-03-10", "tag": "LIBUR", "t": "Idul Fitri 1448 H", "x": "Libur 10 dan 11 Maret. Cuti bersama 9, 12, dan 15 Maret. Nyepi Senin 8 Maret."}, {"d": "2027-03-16", "tag": "PAJAK", "t": "Setor PPh 21 masa Februari", "x": "Tanggal 15 adalah cuti bersama nasional, jadi bergeser ke Selasa 16 Maret. Lapor SPT Masa: Senin 22 Maret (tanggal 20 hari Sabtu)."}];
// TODO(next push to dev): paste the new Indonesia HubSpot form GUID here. Until then NO signup reaches HubSpot.
const HS={portal:'45700506',form:'',region:'na2'}; // form: GUID of the NEW Indonesia calendar form (full name + work email). Empty = preview form, nothing submitted. // Same calendar-signup form as the PH checklist. Swap for a dedicated ID form if RevOps wants separate reporting.
const BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const BLN3=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const TODAY=todayWIB();
function D(s){const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d));}
function iso(dt){return dt.toISOString().slice(0,10);}
function addDays(dt,n){return new Date(dt.getTime()+n*864e5);}
function fmtLong(dt){return HARI[dt.getUTCDay()]+', '+dt.getUTCDate()+' '+BULAN[dt.getUTCMonth()]+' '+dt.getUTCFullYear();}
function fmtShort(dt){return HARI[dt.getUTCDay()].slice(0,3)+' '+dt.getUTCDate()+' '+BLN3[dt.getUTCMonth()];}

/* ---------- multiplier ---------- */
const mA=document.getElementById('m-amt'),mN=document.getElementById('m-n');
let multTracked=false;
function mult(){const a=num(mA.value),n=num(mN.value),t=a*n;
 document.getElementById('m-out').innerHTML=rpShort(t)+'<small>per bulan</small>';
 document.getElementById('m-line').innerHTML='Kalau baru ketahuan <b>3 bulan</b> kemudian: <b>'+rpShort(t*3)+'</b> yang harus ditarik kembali, satu slip demi satu slip.';}
[mA,mN].forEach(el=>{el.addEventListener('input',()=>{const c=el.selectionStart,len=el.value.length;el.value=el.value?nf.format(num(el.value)):'';mult();
 if(!multTracked){multTracked=true;track('phr_psb_multiplier',{});bumpIntent('multiplier');}});});
mult();

/* ---------- checklist ---------- */
const ST=LS.get('phr_psb_state',null)||{};
const cyM=document.getElementById('cy-m'),cyD=document.getElementById('cy-d');
(function(){const t=D(TODAY);let y=t.getUTCFullYear(),m=t.getUTCMonth();
 for(let i=-1;i<=4;i++){const dt=new Date(Date.UTC(y,m+i,1));const v=iso(dt).slice(0,7);const o=document.createElement('option');o.value=v;o.textContent=BULAN[dt.getUTCMonth()]+' '+dt.getUTCFullYear();cyM.appendChild(o);}
 cyM.value=ST.cycle&&[...cyM.options].some(o=>o.value===ST.cycle)?ST.cycle:iso(t).slice(0,7);
 if(ST.payday)cyD.value=ST.payday;})();
ST.checked=ST.checked||{};
function save(){ST.cycle=cyM.value;ST.payday=Math.min(31,Math.max(1,Number(cyD.value)||25));LS.set('phr_psb_state',ST);}
function payday(){const [y,m]=cyM.value.split('-').map(Number);const last=new Date(Date.UTC(y,m,0)).getUTCDate();return new Date(Date.UTC(y,m-1,Math.min(last,Number(cyD.value)||25)));}
const boxes=[...document.querySelectorAll('.items input')];
boxes.forEach(b=>{b.checked=!!ST.checked[b.dataset.id];b.addEventListener('change',()=>{ST.checked[b.dataset.id]=b.checked;save();
 if(b.checked){const c=LS.get('phr_psb_tickcount',0)+1;LS.set('phr_psb_tickcount',c);track('phr_psb_check',{item:b.dataset.id});bumpIntent('tick');}
 render();});});
let lastMilestone=LS.get('phr_psb_ms',0);
/* ribbon: calendar tile, next-up line, 5 layer bars, animated ring */
const RING_C=2*Math.PI*16;
const rbCal=document.getElementById('rb-cal'),rbChg=document.getElementById('rb-chg'),rbEdit=document.getElementById('rb-edit');
function toggleEdit(){const open=rbEdit.hidden;rbEdit.hidden=!open;[rbCal,rbChg].forEach(b=>b.setAttribute('aria-expanded',String(open)));if(open)setTimeout(()=>cyD.focus(),30);}
rbCal.addEventListener('click',toggleEdit);rbChg.addEventListener('click',toggleEdit);
let shownPct=null,pctRaf=0,lastPd='';
const layerFull={};let rendered=false;
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPARK_C=['#16a34a','#f97316','#2563eb','#facc15','#20a0f8'];
function spark(el){if(RM)return;const r=el.getBoundingClientRect(),root=el.closest('.psb-scope')||document.body;
 const s=document.createElement('span');s.className='rb-spark';s.style.left=(r.left+r.width/2)+'px';s.style.top=(r.top+r.height/2)+'px';
 const n=14,reach=Math.max(r.width,r.height)/2+18;
 for(let i=0;i<n;i++){const p=document.createElement('i');if(i%2)p.className='s';p.style.setProperty('--a',(i*360/n+Math.random()*12)+'deg');
  p.style.setProperty('--d',(reach+Math.random()*18)+'px');p.style.setProperty('--c',SPARK_C[i%SPARK_C.length]);p.style.animationDelay=(Math.random()*80)+'ms';s.appendChild(p);}
 root.appendChild(s);setTimeout(()=>s.remove(),1000);}
function celebrate(el){el.classList.remove('celebrate');void el.offsetWidth;el.classList.add('celebrate');setTimeout(()=>el.classList.remove('celebrate'),1500);spark(el);}
function tweenPct(to,done,tot){const el=document.getElementById('ring-v');const from=shownPct==null?0:shownPct;cancelAnimationFrame(pctRaf);
 const t0=performance.now(),dur=650;
 (function step(t){const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);const v=Math.round(from+(to-from)*e);
  el.innerHTML=v+'%<small>'+done+' dari '+tot+'</small>';if(k<1)pctRaf=requestAnimationFrame(step);else shownPct=to;})(t0);}
/* side-panel total card: appears once the ribbon is scrolled out of view, ring sweeps in */
const ptBox=document.getElementById('pyr-tot'),ptC=document.getElementById('pt-c'),ptV=document.getElementById('pt-v'),ptN=document.getElementById('pt-n');
let ptShown=false,ptPct=0,ptRaf=0,cur={done:0,tot:25};
function ptCount(from,to){cancelAnimationFrame(ptRaf);const t0=performance.now();
 (function st(t){const k=Math.min(1,(t-t0)/800),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));ptV.textContent=v+'%';if(k<1)ptRaf=requestAnimationFrame(st);else ptPct=to;})(t0);}
function ptUpdate(fromZero){const pct=Math.round(cur.done/cur.tot*100);ptN.textContent=cur.done+' dari '+cur.tot;
 if(fromZero){ptC.style.transition='none';ptC.style.strokeDashoffset=RING_C.toFixed(2);void ptC.getBoundingClientRect();ptC.style.transition='';ptPct=0;}
 requestAnimationFrame(()=>{ptC.style.strokeDashoffset=(RING_C*(1-cur.done/cur.tot)).toFixed(2);});
 ptCount(fromZero?0:ptPct,pct);}
let ptTimer=0;
function ptToggle(show){if(show===ptShown)return;ptShown=show;clearTimeout(ptTimer);ptBox.classList.toggle('show',show);ptBox.setAttribute('aria-hidden',String(!show));
 if(show){ptC.style.transition='none';ptC.style.strokeDashoffset=RING_C.toFixed(2);ptV.textContent='0%';ptTimer=setTimeout(()=>ptUpdate(true),420);}}
// rootMargin keeps it from flickering at the edge: the ribbon must be fully past the sticky navbar
if('IntersectionObserver' in window){new IntersectionObserver(es=>{es.forEach(en=>ptToggle(!en.isIntersecting&&en.boundingClientRect.top<0));},{threshold:0,rootMargin:'-90px 0px 0px 0px'}).observe(document.getElementById('rib'));}
function render(){const pd=payday(),today=D(TODAY);let tot=0,done=0,nextUp=null;
 LAYERS.forEach(L=>{const bx=boxes.filter(b=>b.dataset.id.startsWith(L.id+'-'));const d=bx.filter(b=>b.checked).length;tot+=bx.length;done+=d;
  const s=addDays(pd,L.win[0]),e=L.id==='komunikasi'?new Date(Date.UTC(pd.getUTCFullYear(),pd.getUTCMonth()+1,20)):addDays(pd,L.win[1]);
  const lbl=L.id==='komunikasi'?('Hari H, '+fmtShort(pd)+' s.d. '+fmtShort(e)):(L.win[0]===L.win[1]?'H'+L.win[0]:'H'+L.win[0]+' s.d. H'+L.win[1])+' · '+fmtShort(s)+(L.win[0]===L.win[1]?'':' – '+fmtShort(e));
  const hl=L.id==='komunikasi'?'Hari H s.d. tgl 20 bulan berikutnya':(L.win[0]===L.win[1]?'H'+L.win[0]:'H'+L.win[0]+' s.d. H'+L.win[1]);
  document.querySelector('[data-win="'+L.id+'"]').textContent=hl;
  const tile=x=>'<span class="lw-t"><span class="lw-m">'+BLN3[x.getUTCMonth()].toUpperCase()+'</span><span class="lw-d tnum">'+x.getUTCDate()+'</span><span class="lw-w">'+HARI[x.getUTCDay()].slice(0,3)+'</span></span>';
  const lw=document.querySelector('[data-lwin="'+L.id+'"]');lw.setAttribute('aria-label','Kerjakan '+lbl);
  lw.innerHTML=tile(s)+(+s===+e?'':'<span class="lw-ar" aria-hidden="true"><i></i></span>'+tile(e));
  const cl=document.querySelector('[data-clear="'+L.id+'"]');cl.disabled=d===0;
  const art=document.getElementById('lapis-'+L.id);const isNow=today>=s&&today<=e;const late=today>e&&d<bx.length;
  art.classList.toggle('is-now',isNow);art.querySelector('.pill.now').hidden=!isNow;art.querySelector('.pill.late').hidden=!late;
  const py=document.querySelector('[data-pyr="'+L.id+'"]');py.style.setProperty('--p',(d/bx.length*100)+'%');py.classList.toggle('done',d===bx.length);
  if(!nextUp&&d<bx.length)nextUp={L,s,e,left:bx.length-d,late};
  const full=d===bx.length;if(rendered&&full&&!layerFull[L.id]){celebrate(py);}layerFull[L.id]=full;});
 rendered=true;
 const pct=Math.round(done/tot*100);tweenPct(pct,done,tot);
 const wasAll=cur.done===cur.tot;cur={done,tot};if(ptShown){ptUpdate(false);if(done===tot&&!wasAll)celebrate(ptBox);}
 document.getElementById('ring-c').style.strokeDashoffset=(RING_C*(1-done/tot)).toFixed(2);
 const ring=document.getElementById('ring');const wasFull=ring.classList.contains('full');ring.classList.toggle('full',done===tot);if(done===tot&&!wasFull){ring.classList.remove('full');void ring.offsetWidth;ring.classList.add('full');}
 // calendar tile + payday line
 const pdKey=iso(pd);document.getElementById('rb-m').textContent=BLN3[pd.getUTCMonth()].toUpperCase();document.getElementById('rb-d').textContent=pd.getUTCDate();document.getElementById('rb-w').textContent=HARI[pd.getUTCDay()].toUpperCase();
 if(lastPd&&lastPd!==pdKey){rbCal.classList.remove('flip');void rbCal.offsetWidth;rbCal.classList.add('flip');}lastPd=pdKey;
 document.getElementById('rb-long').textContent='Gajian '+fmtLong(pd);
 const dl=Math.round((pd-today)/864e5);document.getElementById('rb-left').textContent=dl>1?dl+' hari lagi':dl===1?'besok':dl===0?'hari ini':'sudah lewat';
 const nx=document.getElementById('rb-next');nx.classList.remove('late','ok');
 if(!nextUp){nx.innerHTML='<span class="k">Siap gajian</span><b>Semua '+tot+' cek selesai</b><span>Siklus ini aman diproses.</span>';nx.classList.add('ok');}
 else{const N=nextUp,dm=x=>x.getUTCDate()+' '+BLN3[x.getUTCMonth()];
  const rng=+N.s===+N.e?dm(N.s):N.s.getUTCMonth()===N.e.getUTCMonth()?N.s.getUTCDate()+'–'+dm(N.e):dm(N.s)+' – '+dm(N.e);
  nx.innerHTML='<span class="k">'+(N.late?'Terlambat':'Berikutnya')+'</span><b>Lapis '+(LAYERS.indexOf(N.L)+1)+' · '+N.L.name+'</b><span>Tenggat '+rng+' · sisa '+N.left+' cek</span>';if(N.late)nx.classList.add('late');}
 const ms=[25,50,75,100].filter(x=>pct>=x).pop()||0;if(ms>lastMilestone){lastMilestone=ms;LS.set('phr_psb_ms',ms);track('phr_psb_progress',{pct:ms});}}
document.querySelectorAll('[data-clear]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.clear;
 boxes.filter(b=>b.dataset.id.startsWith(id+'-')).forEach(b=>{b.checked=false;ST.checked[b.dataset.id]=false;});save();render();track('phr_psb_clear_layer',{layer:id});}));
cyM.addEventListener('change',()=>{save();render();});cyD.addEventListener('input',()=>{save();render();});
const rs=document.getElementById('reset');let armed=null;
rs.addEventListener('click',()=>{if(!armed){rs.textContent='Yakin? Kosongkan semua centang';armed=setTimeout(()=>{rs.textContent='Mulai siklus baru';armed=null;},4000);return;}
 clearTimeout(armed);armed=null;ST.checked={};boxes.forEach(b=>b.checked=false);
 const i=cyM.selectedIndex;if(i<cyM.options.length-1)cyM.selectedIndex=i+1;lastMilestone=0;LS.set('phr_psb_ms',0);save();render();rs.textContent='Siklus baru dimulai';setTimeout(()=>rs.textContent='Mulai siklus baru',2500);});
render();

/* ---------- dates ---------- */
const box=document.getElementById('dates');
const upcoming=DATES.filter(x=>x.d>=TODAY);const NEXT=upcoming[0];
/* agenda by month (vertical timeline) */
const dDiff=s=>Math.round((D(s)-D(TODAY))/864e5);
const inTxt=n=>n===0?'Hari ini':n===1?'Besok':n>0?n+' hari lagi':'Sudah lewat';
const MONTHS=[];(function(){const a=D(DATES[0].d),b=D(DATES[DATES.length-1].d);let y=a.getUTCFullYear(),m=a.getUTCMonth();
 while(y<b.getUTCFullYear()||(y===b.getUTCFullYear()&&m<=b.getUTCMonth())){MONTHS.push([y,m]);m++;if(m>11){m=0;y++;}}})();
box.innerHTML=MONTHS.map(([y,m])=>{const ev=DATES.map((x,i)=>({x,i})).filter(o=>{const dt=D(o.x.d);return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m;});
 return '<div class="ag-m"><div class="ag-ml"><b>'+BULAN[m]+'</b><small>'+y+'</small><span class="ag-cnt tnum" data-n="'+ev.length+'">'+(ev.length?ev.length+' tanggal':'')+'</span><span class="ag-none"'+(ev.length?' hidden':'')+'>Tidak ada tenggat bulan ini.</span></div><div class="ag-rows">'+
 ev.map(({x,i})=>{const dt=D(x.d),n=dDiff(x.d);const cls=x===NEXT?' is-next':(x.d<TODAY?' is-past':'');
  return '<div class="ag-r'+cls+'" id="tg-'+i+'" data-tag="'+x.tag+'"><span class="ag-dot" aria-hidden="true"></span><div class="ag-dt"><b class="tnum">'+dt.getUTCDate()+'</b><small>'+HARI[dt.getUTCDay()].slice(0,3).toUpperCase()+'</small></div><div class="ag-tx"><h4><span class="ag-chip">'+x.tag+'</span>'+x.t+'</h4><p>'+x.x+'</p></div><span class="ag-in tnum">'+(x===NEXT?'Berikutnya · ':'')+inTxt(n)+'</span></div>';}).join('')+'</div></div>';}).join('');
document.querySelectorAll('.filters button[data-f]').forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.f;document.querySelectorAll('.filters button[data-f]').forEach(o=>o.setAttribute('aria-pressed',o===b?'true':'false'));
 box.querySelectorAll('.ag-r').forEach(c=>c.hidden=!(f==='ALL'||c.dataset.tag===f)); box.querySelectorAll('.ag-m').forEach(g=>{const n=[...g.querySelectorAll('.ag-r')].filter(r=>!r.hidden).length;const c=g.querySelector('.ag-cnt');c.textContent=n?n+' tanggal':'';g.querySelector('.ag-none').hidden=n>0;});}));
if(NEXT){const days=Math.round((D(NEXT.d)-D(TODAY))/864e5);document.getElementById('next-d').innerHTML=(days===0?'0':days)+'<small>'+(days===0?'HARI INI':'HARI LAGI')+'</small>';
 document.getElementById('next-t').textContent=NEXT.t;document.getElementById('next-s').textContent=fmtLong(D(NEXT.d));}
else document.getElementById('next').hidden=true;

/* ---------- simulator card: play the attention animation once it scrolls into view ---------- */
(function(){const tc=document.querySelector('#tanggal .toolcard');if(!tc||!('IntersectionObserver' in window))return;
 tc.classList.add('tc-arm');
 const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting){tc.classList.add('tc-in');tc.classList.remove('tc-arm');io.disconnect();track('phr_psb_toolcard_seen',{});}});},{threshold:.45});
 io.observe(tc);})();

/* ---------- calendar (.ics) + email popup ---------- */
function icsEsc(s){return s.replace(/[\\,;]/g,m=>'\\'+m).replace(/\n/g,'\\n');}
function ics(list){const st=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
 const ev=list.map(x=>{const s=x.d.replace(/-/g,''),e=iso(addDays(D(x.d),1)).replace(/-/g,'');
  return ['BEGIN:VEVENT','UID:psb-'+s+'-'+x.tag.toLowerCase()+'@peopleshr.com','DTSTAMP:'+st,'DTSTART;VALUE=DATE:'+s,'DTEND;VALUE=DATE:'+e,'SUMMARY:'+icsEsc('['+x.tag+'] '+x.t),'DESCRIPTION:'+icsEsc(x.x+' Sumber: checklist payroll skala besar PeoplesHR.'),'TRANSP:TRANSPARENT','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(x.t),'TRIGGER:-P1D','END:VALARM','END:VEVENT'].join('\r\n');});
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PeoplesHR//Payroll Skala Besar 2026//ID','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-TIMEZONE:Asia/Jakarta'].concat(ev,['END:VCALENDAR']).join('\r\n');}
function download(which){const list=which==='all'?DATES.filter(x=>x.d>=TODAY):[DATES[+which]];
 const blob=new Blob([ics(list.length?list:DATES)],{type:'text/calendar;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);
 a.download=which==='all'?'payroll-skala-besar-2026-2027.ics':'payroll-'+DATES[+which].d+'.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
 track('phr_psb_calendar',{which:which==='all'?'all':DATES[+which].d});bumpIntent('calendar');}
/* Popup gate, same logic as the PH year-end checklist: ONE form (full name + work email), shared by
   "Cetak checklist" and the calendar buttons. Whichever one a visitor submits first unlocks both:
   after that, printing and the .ics download go straight through with no form.
   The form is HubSpot's own v2 embed (so HubSpot never counts a signup twice). HS.form is EMPTY until
   RevOps creates the ID form (full name, work email, hidden phr_signup_source + phr_intent_level).
   While it is empty, the native preview form is shown and NOTHING is submitted. Set it before go-live. */
const COPY={
 cal:{h:'Kunci 14 tenggat payroll di kalender Anda',p:'UMP, PPh 21, BPJS, BPA1, sampai THR. Semua tanggal penting November 2026 sampai Maret 2027 masuk kalender dalam satu klik, masing-masing dengan pengingat sehari sebelumnya. Supaya tidak ada yang baru ketahuan di hari gajian.',b:'Kunci tanggalnya',done:'File kalender sedang diunduh. Buka file itu untuk menambahkan semua tanggal.',src:'calendar_id'},
 print:{h:'Cetak checklist untuk meja tim payroll',p:'25 cek di 5 lapis, lengkap dengan tenggat tiap lapis untuk siklus gajian Anda. Isi sekali saja, lalu checklist cetak dan file kalender langsung terbuka untuk Anda.',b:'Cetak checklist',done:'Terima kasih! Jendela cetak sedang dibuka.',src:'checklist_print_id'}};
let mode='cal',pending=null,lastFocus=null;const modal=document.getElementById('modal'),em=document.getElementById('cal-email'),nm=document.getElementById('cal-name'),er=document.getElementById('cal-err');
const signup=document.getElementById('cal-signup'),done=document.getElementById('cal-done'),nform=document.getElementById('calform'),hsWrap=document.getElementById('cal-hs'),loading=document.getElementById('cal-loading');
function isSignedUp(){return !!(LS.get('phr_psb_contact',false)||LS.get('phr_psb_cal_ok',false));}
function markSignedUp(){LS.set('phr_psb_contact',true);}
let hsScript=null;
function loadHS(){if(!hsScript)hsScript=new Promise((res,rej)=>{if(window.hbspt)return res();const s=document.createElement('script');s.src='https://js-'+HS.region+'.hsforms.net/forms/embed/v2.js';s.onload=()=>window.hbspt?res():rej();s.onerror=rej;document.head.appendChild(s);}).catch(e=>{hsScript=null;throw e;});return hsScript;}
function setHidden(f,n,v){const el=f&&f.querySelector('input[name="'+n+'"]');if(el)el.value=v;}
function embedForm(){if(hsWrap.dataset.hs)return;hsWrap.dataset.hs='1';loading.hidden=false;loading.textContent='Memuat formulir…';
 loadHS().then(()=>{hbspt.forms.create({region:HS.region,portalId:HS.portal,formId:HS.form,target:'#cal-hs',
  onFormReady:()=>{loading.hidden=true;},
  onFormSubmit:$f=>{const f=$f&&$f.jquery?$f[0]:$f;setHidden(f,'phr_signup_source',COPY[mode].src);setHidden(f,'phr_intent_level',LS.get('phr_psb_intent','low'));},
  onFormSubmitted:()=>{signedUp();}});})
 .catch(()=>{delete hsWrap.dataset.hs;loading.textContent='Formulir tidak bisa dimuat. Periksa koneksi Anda lalu coba lagi.';});}
function doPrint(){track('phr_psb_print',{});setTimeout(()=>{try{window.print();}catch(e){}},50);}
function openModal(m){mode=m;const c=COPY[m];document.getElementById('mt').textContent=c.h;document.querySelector('#modal .m-lede').textContent=c.p;
 nform.querySelector('button[type="submit"]').textContent=c.b;done.textContent=c.done;
 lastFocus=document.activeElement;modal.hidden=false;document.body.style.overflow='hidden';
 requestAnimationFrame(()=>requestAnimationFrame(()=>modal.classList.add('open')));
 signup.hidden=false;done.hidden=true;er.textContent='';
 if(HS.form){nform.hidden=true;embedForm();}else{nform.hidden=false;setTimeout(()=>nm.focus(),260);}}
function closeModal(after){modal.classList.remove('open');document.body.style.overflow='';
 setTimeout(()=>{if(!modal.classList.contains('open'))modal.hidden=true;if(after)after();},300);if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function signedUp(){markSignedUp();track(mode==='print'?'phr_psb_print_signup':'phr_psb_calendar_signup',{});bumpIntent(mode==='print'?'cta':'calendar_email');
 signup.hidden=true;done.hidden=false;done.focus();
 if(mode==='print'){setTimeout(()=>closeModal(doPrint),1200);} // close first, so the popup isn't in the printout
 else{download(pending||'all');setTimeout(()=>closeModal(),2200);}}
document.addEventListener('click',e=>{const c=e.target.closest('[data-cal]');if(!c)return;
 pending=c.dataset.cal;if(isSignedUp()){download(pending);return;}openModal('cal');});
document.getElementById('print').addEventListener('click',()=>{if(isSignedUp()){doPrint();return;}openModal('print');});
document.getElementById('cal-cancel').addEventListener('click',()=>closeModal());document.getElementById('cal-x').addEventListener('click',()=>closeModal());
modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal();});
const FREE=/@(gmail|yahoo|ymail|hotmail|outlook|live|icloud|aol)\./i;
nform.addEventListener('submit',e=>{e.preventDefault();const n=nm.value.trim(),v=em.value.trim();
 if(n.length<2){er.textContent='Masukkan nama lengkap Anda.';nm.focus();return;}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){er.textContent='Masukkan alamat email yang valid, misalnya nama@perusahaan.co.id.';em.focus();return;}
 if(FREE.test(v)){er.textContent='Gunakan email kantor, bukan email pribadi.';em.focus();return;}
 if(DEBUG)console.log('[preview] HS.form is empty: nothing submitted');signedUp();});
})();