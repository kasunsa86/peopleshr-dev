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
const HS={portal:'45700506',form:'9fffb4ce-f1ff-4941-987c-2fd1db929518',region:'na2'}; // Same calendar-signup form as the PH checklist. Swap for a dedicated ID form if RevOps wants separate reporting.
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
function render(){const pd=payday(),today=D(TODAY);let tot=0,done=0;
 LAYERS.forEach(L=>{const bx=boxes.filter(b=>b.dataset.id.startsWith(L.id+'-'));const d=bx.filter(b=>b.checked).length;tot+=bx.length;done+=d;
  const s=addDays(pd,L.win[0]),e=L.id==='komunikasi'?new Date(Date.UTC(pd.getUTCFullYear(),pd.getUTCMonth()+1,20)):addDays(pd,L.win[1]);
  const lbl=L.id==='komunikasi'?('Hari H, '+fmtShort(pd)+' s.d. '+fmtShort(e)):(L.win[0]===L.win[1]?'H'+L.win[0]:'H'+L.win[0]+' s.d. H'+L.win[1])+' · '+fmtShort(s)+(L.win[0]===L.win[1]?'':' – '+fmtShort(e));
  document.querySelector('[data-win="'+L.id+'"]').textContent=lbl;
  document.querySelector('[data-cnt="'+L.id+'"]').textContent=d+'/'+bx.length;
  const art=document.getElementById('lapis-'+L.id);const isNow=today>=s&&today<=e;const late=today>e&&d<bx.length;
  art.classList.toggle('is-now',isNow);art.querySelector('.pill.now').hidden=!isNow;art.querySelector('.pill.late').hidden=!late;
  const py=document.querySelector('[data-pyr="'+L.id+'"]');py.style.setProperty('--p',(d/bx.length*100)+'%');py.classList.toggle('done',d===bx.length);py.querySelector('.pc').textContent=d+'/'+bx.length;});
 const pct=Math.round(done/tot*100);document.getElementById('ring-v').innerHTML=pct+'%<small>'+done+' dari '+tot+'</small>';
 document.getElementById('ring-c').setAttribute('stroke-dashoffset',(97.4*(1-done/tot)).toFixed(1));
 const ms=[25,50,75,100].filter(x=>pct>=x).pop()||0;if(ms>lastMilestone){lastMilestone=ms;LS.set('phr_psb_ms',ms);track('phr_psb_progress',{pct:ms});}}
cyM.addEventListener('change',()=>{save();render();});cyD.addEventListener('input',()=>{save();render();});
const rs=document.getElementById('reset');let armed=null;
rs.addEventListener('click',()=>{if(!armed){rs.textContent='Yakin? Kosongkan semua centang';armed=setTimeout(()=>{rs.textContent='Mulai siklus baru';armed=null;},4000);return;}
 clearTimeout(armed);armed=null;ST.checked={};boxes.forEach(b=>b.checked=false);
 const i=cyM.selectedIndex;if(i<cyM.options.length-1)cyM.selectedIndex=i+1;lastMilestone=0;LS.set('phr_psb_ms',0);save();render();rs.textContent='Siklus baru dimulai';setTimeout(()=>rs.textContent='Mulai siklus baru',2500);});
document.getElementById('print').addEventListener('click',()=>{try{window.print();}catch(e){}});
render();

/* ---------- dates ---------- */
const box=document.getElementById('dates');
const upcoming=DATES.filter(x=>x.d>=TODAY);const NEXT=upcoming[0];
box.innerHTML=DATES.map((x,i)=>{const dt=D(x.d);const cls=x===NEXT?' is-next':(x.d<TODAY?' is-past':'');
 return '<div class="dt'+cls+'" data-tag="'+x.tag+'"><div class="when"><div class="wd">'+HARI[dt.getUTCDay()]+'</div><div class="dd tnum">'+dt.getUTCDate()+'</div><div class="mm">'+BLN3[dt.getUTCMonth()]+' '+dt.getUTCFullYear()+'</div></div><div><span class="tg">'+x.tag+'</span><b>'+x.t+'</b><p>'+x.x+'</p></div><button class="add" type="button" data-cal="'+i+'">+ Kalender</button></div>';}).join('');
document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filters button').forEach(o=>o.setAttribute('aria-pressed',o===b?'true':'false'));
 box.querySelectorAll('.dt').forEach(c=>c.hidden=!(b.dataset.f==='ALL'||c.dataset.tag===b.dataset.f));}));
if(NEXT){const days=Math.round((D(NEXT.d)-D(TODAY))/864e5);document.getElementById('next-d').innerHTML=(days===0?'0':days)+'<small>'+(days===0?'HARI INI':'HARI LAGI')+'</small>';
 document.getElementById('next-t').textContent=NEXT.t;document.getElementById('next-s').textContent=fmtLong(D(NEXT.d));}
else document.getElementById('next').hidden=true;

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
let pending=null;const modal=document.getElementById('modal'),em=document.getElementById('cal-email'),er=document.getElementById('cal-err');
document.addEventListener('click',e=>{const c=e.target.closest('[data-cal]');if(!c)return;
 if(LS.get('phr_psb_cal_ok',false)){download(c.dataset.cal);return;}
 pending=c.dataset.cal;modal.hidden=false;er.textContent='';setTimeout(()=>em.focus(),30);});
document.getElementById('cal-cancel').addEventListener('click',()=>{modal.hidden=true;pending=null;});
modal.addEventListener('click',e=>{if(e.target===modal){modal.hidden=true;pending=null;}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden){modal.hidden=true;pending=null;}});
const FREE=/@(gmail|yahoo|ymail|hotmail|outlook|live|icloud|aol)\./i;
function hutk(){const m=document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/);return m?m[1]:undefined;}
document.getElementById('calform').addEventListener('submit',e=>{e.preventDefault();const v=em.value.trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){er.textContent='Masukkan alamat email yang valid, misalnya nama@perusahaan.co.id.';return;}
 if(FREE.test(v)){er.textContent='Gunakan email kantor, bukan email pribadi.';return;}
 if(HS.form&&HS.form.indexOf('TODO')!==0){try{fetch('https://api.hsforms.com/submissions/v3/integration/submit/'+HS.portal+'/'+HS.form,{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({fields:[{name:'email',value:v}],context:{hutk:hutk(),pageUri:location.href,pageName:document.title}})}).catch(()=>{});}catch(x){}}
 LS.set('phr_psb_cal_ok',true);track('phr_psb_calendar_signup',{});bumpIntent('calendar_email');modal.hidden=true;download(pending||'all');pending=null;});

})();
