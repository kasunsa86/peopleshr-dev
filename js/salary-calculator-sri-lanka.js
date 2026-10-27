'use strict';
/* Sri Lanka Salary Calculator — gross to net / net to gross.
   APIT: Table 01 (regular monthly profits from primary employment), Y/A 2026/27
   (rates from Inland Revenue (Amendment) Act No. 02 of 2025, effective 01.04.2025; unchanged for 2026/27).
   EPF: 8% employee + 12% (or 15%) employer. ETF: 3% employer. EPF is not deductible for APIT. */
(function(){
const $=id=>document.getElementById(id),
  val=el=>Math.max(0,parseFloat(el.value)||0),
  fmt=n=>'Rs. '+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),
  yr=n=>fmt(Math.round(n*100)/100*12)+' / yr',
  esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

const RELIEF=1800000,EPF_EE=.08,ETF=.03;
/* Annual bands after personal relief; monthly APIT = annual tax on (monthly × 12) / 12 */
const BANDS=[{width:1000000,rate:.06},{width:500000,rate:.18},{width:500000,rate:.24},{width:500000,rate:.30},{width:Infinity,rate:.36}];

function apit(monthlyTaxable){
  let rest=Math.max(0,monthlyTaxable*12-RELIEF),tax=0,rate=0;
  const rows=[{from:0,to:RELIEF/12,rate:0,inBand:Math.min(monthlyTaxable,RELIEF/12),tax:0}];
  let from=RELIEF;
  BANDS.forEach(b=>{
    const used=Math.min(rest,b.width),t=used*b.rate;
    rows.push({from:from/12,to:(from+b.width)/12,rate:b.rate,inBand:used/12,tax:t/12});
    if(used>0)rate=b.rate;
    tax+=t;rest-=used;from+=b.width;
  });
  return{tax:tax/12,rate,rows};
}

const S={mode:'gross',allow:[],ded:[],view:'er'};

function compute(basic){
  const epfOn=$('epfMember').checked,erRate=parseFloat($('erRate').value)||.12;
  let allowTotal=0,epfAllow=0,taxAllow=0;
  S.allow.forEach(a=>{allowTotal+=a.amount;if(a.epf)epfAllow+=a.amount;if(a.tax)taxAllow+=a.amount});
  const other=S.ded.reduce((s,d)=>s+d.amount,0),
    gross=basic+allowTotal,
    epfBase=epfOn?basic+epfAllow:0,
    epfEe=epfBase*EPF_EE,epfEr=epfBase*erRate,etf=epfBase*ETF,
    taxable=basic+taxAllow,
    t=apit(taxable),
    net=gross-epfEe-t.tax-other;
  return{basic,allowTotal,gross,epfBase,epfEe,epfEr,etf,erRate,taxable,tax:t.tax,rate:t.rate,rows:t.rows,other,net,erCost:gross+epfEr+etf,epfOn};
}

/* Net to gross: net rises monotonically with basic (max marginal deduction 44%), so bisect. */
function solveBasic(target){
  if(compute(0).net>=target)return 0;
  let lo=0,hi=Math.max(target,1)*2;
  while(compute(hi).net<target&&hi<1e12)hi*=2;
  for(let i=0;i<100;i++){const mid=(lo+hi)/2;if(compute(mid).net<target)lo=mid;else hi=mid}
  return Math.round(hi*100)/100;
}

function current(){
  if(S.mode==='gross')return compute(val($('basic')));
  return compute(solveBasic(val($('target'))));
}

function bandLabel(r){return r.rate?Math.round(r.rate*100)+'% marginal band':'Tax-free (personal relief)'}

function render(){
  const r=current(),net=S.mode==='net';
  if(net){
    $('resALabel').textContent='Required basic salary';$('resA').textContent=fmt(r.basic);
    $('resBLabel').textContent='Gross monthly earnings';$('resB').textContent=fmt(r.gross);
    $('stickyLabel').textContent='Required gross';$('stickyNet').textContent=fmt(r.gross);
  }else{
    $('resALabel').textContent='Monthly APIT';$('resA').textContent=fmt(r.tax);
    $('resBLabel').textContent='Net monthly salary';$('resB').textContent=fmt(r.net);
    $('stickyLabel').textContent='Estimated take-home';$('stickyNet').textContent=fmt(r.net);
  }
  $('kGross').textContent=fmt(r.gross);$('kGrossY').textContent=yr(r.gross);
  $('kEpf').textContent=fmt(r.epfEe);$('kEpfY').textContent=yr(r.epfEe);
  $('kTax').textContent=fmt(r.tax);$('kTaxY').textContent=yr(r.tax);
  $('kDed').textContent=fmt(r.other);$('kDedY').textContent=yr(r.other);
  $('kNet').textContent=fmt(r.net);$('kNetY').textContent=yr(r.net);
  $('erGross').textContent=fmt(r.gross);$('erGrossY').textContent=yr(r.gross);
  $('erEpfLabel').textContent='Employer EPF ('+Math.round(r.erRate*100)+'%)';
  $('erEpf').textContent=fmt(r.epfEr);$('erEpfY').textContent=yr(r.epfEr);
  $('erEtf').textContent=fmt(r.etf);$('erEtfY').textContent=yr(r.etf);
  $('erTotal').textContent=fmt(r.erCost);$('erTotalY').textContent=yr(r.erCost);
  $('erFund').textContent=fmt(r.epfEe+r.epfEr);
  $('epfEeStat').textContent=fmt(r.epfEe);$('etfStat').textContent=fmt(r.etf);
  $('epfErStat').textContent=fmt(r.epfEr);$('epfErStatLabel').textContent='Employer EPF ('+Math.round(r.erRate*100)+'%)';
  const cur=r.rows.filter(x=>x.inBand>0).pop()||r.rows[0],
    ceil=Number.isFinite(cur.to)?cur.to:Math.max(r.taxable,cur.from*1.25),
    pct=Math.max(0,Math.min(100,(r.taxable-cur.from)/(ceil-cur.from)*100));
  $('bracketLabel').textContent=bandLabel(cur);$('taxableLabel').textContent=fmt(r.taxable);
  $('bracketFill').style.width=(r.taxable>0?pct:0)+'%';
  $('bandRows').innerHTML=r.rows.map(x=>'<tr class="'+(x===cur&&r.taxable>0?'is-current':'')+'"><td>'+(Number.isFinite(x.to)?fmt(x.from)+' – '+fmt(x.to):'Above '+fmt(x.from))+'</td><td>'+Math.round(x.rate*100)+'%</td><td>'+fmt(x.inBand)+'</td><td>'+fmt(x.tax)+'</td></tr>').join('');
  $('bandTotal').textContent=fmt(r.tax);
  $('epfNote').classList.toggle('hidden',r.epfOn);
  $('zeroNote').classList.toggle('hidden',!(net&&r.basic===0&&val($('target'))>0));
  $('negNote').classList.toggle('hidden',!(r.net<0));
  breakdown(r);
  return r;
}

function breakdown(r){
  const rows=[
    ['Basic salary',fmt(r.basic),S.mode==='net'?'Solved from target net salary':'Input'],
    ['Allowances',fmt(r.allowTotal),S.allow.length+' item(s)'],
    ['Gross monthly earnings',fmt(r.gross),'Basic + allowances'],
    ['EPF / ETF liable earnings',fmt(r.epfBase),r.epfOn?'Basic + allowances marked EPF/ETF':'Not an EPF member'],
    ['Employee EPF',fmt(r.epfEe),'8% of liable earnings'],
    ['Taxable employment income',fmt(r.taxable),'Basic + allowances marked taxable (EPF is not deductible)'],
    ['APIT',fmt(r.tax),bandLabel({rate:r.rate})+', Table 01, Y/A 2026/27'],
    ['Other deductions',fmt(r.other),S.ded.map(d=>esc(d.name||'Deduction')).join(', ')||'None'],
    ['Net monthly salary',fmt(r.net),'Gross − EPF 8% − APIT − other deductions'],
    ['Employer EPF',fmt(r.epfEr),Math.round(r.erRate*100)+'% of liable earnings'],
    ['Employer ETF',fmt(r.etf),'3% of liable earnings'],
    ['Total cost to employer',fmt(r.erCost),'Gross + employer EPF + ETF']
  ];
  $('breakBody').innerHTML=rows.map(x=>'<div class="break-row"><div><b>'+x[0]+'</b><small>'+x[2]+'</small></div><b>'+x[1]+'</b></div>').join('')+'<p class="footnote">Illustrative estimate only. Bonuses and other lump-sum payments are taxed under separate APIT tables and are not included here.</p>';
}

/* ---------- Allowance and deduction rows ---------- */
const X='<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
function allowRow(a,i){
  return '<div class="line-item" data-i="'+i+'"><input class="li-name" data-k="name" placeholder="Allowance name" value="'+esc(a.name)+'" aria-label="Allowance name"><div class="money"><span>Rs.</span><input data-k="amount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" value="'+(a.amount||'')+'" aria-label="Allowance amount"></div><label class="check"><input type="checkbox" data-k="epf"'+(a.epf?' checked':'')+'>EPF/ETF</label><label class="check"><input type="checkbox" data-k="tax"'+(a.tax?' checked':'')+'>Taxable</label><button class="icon-btn danger" data-remove title="Remove" aria-label="Remove allowance">'+X+'</button></div>';
}
function dedRow(d,i){
  return '<div class="line-item line-item--ded" data-i="'+i+'"><input class="li-name" data-k="name" placeholder="e.g. Staff loan, welfare" value="'+esc(d.name)+'" aria-label="Deduction name"><div class="money"><span>Rs.</span><input data-k="amount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" value="'+(d.amount||'')+'" aria-label="Deduction amount"></div><button class="icon-btn danger" data-remove title="Remove" aria-label="Remove deduction">'+X+'</button></div>';
}
function drawLists(){
  $('allowList').innerHTML=S.allow.length?S.allow.map(allowRow).join(''):'<p class="empty-line">No allowances added.</p>';
  $('dedList').innerHTML=S.ded.length?S.ded.map(dedRow).join(''):'<p class="empty-line">No other deductions added.</p>';
}
function bindList(listId,arr){
  const box=$(listId),update=e=>{
    const row=e.target.closest('[data-i]'),k=e.target.dataset.k;if(!row||!k)return;
    const item=arr()[+row.dataset.i];
    item[k]=e.target.type==='checkbox'?e.target.checked:k==='amount'?val(e.target):e.target.value;
    render();
  };
  box.addEventListener('input',update);box.addEventListener('change',update);
  box.addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;arr().splice(+b.closest('[data-i]').dataset.i,1);drawLists();render()});
}

/* ---------- Mode, views, drawers ---------- */
function setMode(mode){
  if(mode===S.mode)return;
  const r=current();
  if(mode==='net')$('target').value=r.net>0?r.net.toFixed(2):'';
  else $('basic').value=r.basic>0?r.basic.toFixed(2):'';
  S.mode=mode;
  document.querySelector('.tclk-scope').classList.toggle('is-net',mode==='net');
  document.querySelectorAll('[data-mode]').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('active',on);b.setAttribute('aria-selected',on)});
  $('basicField').classList.toggle('hidden',mode==='net');
  $('targetField').classList.toggle('hidden',mode!=='net');
  render();
}
function setView(v){
  S.view=v;
  $('eeView').classList.toggle('active',v==='ee');$('erView').classList.toggle('active',v==='er');
  $('eeKpis').classList.toggle('hidden',v!=='ee');$('erKpis').classList.toggle('hidden',v!=='er');
}
function openDrawer(type){$('backdrop').classList.add('open');$(type==='rules'?'rulesDrawer':'breakDrawer').classList.add('open');document.body.style.overflow='hidden'}
function closeDrawers(){['backdrop','rulesDrawer','breakDrawer'].forEach(id=>$(id).classList.remove('open'));document.body.style.overflow=''}
function reset(){
  $('basic').value='';$('target').value='';$('epfMember').checked=true;$('erRate').value='0.12';
  S.allow=[];S.ded=[];drawLists();render();
}

document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
['basic','target'].forEach(id=>$(id).addEventListener('input',render));
['epfMember','erRate'].forEach(id=>$(id).addEventListener('change',render));
$('addAllow').addEventListener('click',()=>{S.allow.push({name:'',amount:0,epf:true,tax:true});drawLists();$('allowList').querySelector('[data-i="'+(S.allow.length-1)+'"] .li-name').focus()});
$('addDed').addEventListener('click',()=>{S.ded.push({name:'',amount:0});drawLists();$('dedList').querySelector('[data-i="'+(S.ded.length-1)+'"] .li-name').focus()});
bindList('allowList',()=>S.allow);bindList('dedList',()=>S.ded);
$('eeView').addEventListener('click',()=>setView('ee'));$('erView').addEventListener('click',()=>setView('er'));
$('resetCalc').addEventListener('click',reset);
function toggleDash(){
  const open=!$('dash').classList.toggle('is-collapsed');
  ['dashToggle','dashCaret'].forEach(id=>$(id).setAttribute('aria-expanded',open));
  $('dashCaret').setAttribute('aria-label',open?'Hide overview':'Show overview');
}
$('dashToggle').addEventListener('click',toggleDash);$('dashCaret').addEventListener('click',toggleDash);
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openDrawer(b.dataset.open)));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeDrawers));
$('backdrop').addEventListener('click',closeDrawers);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawers()});

drawLists();render();

// Reveal the guide, examples, CTA and FAQ cards one by one as they scroll into view
(()=>{const cards=document.querySelectorAll('.tclk-scope .below > section');if(!cards.length||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const io=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).forEach((e,i)=>{const el=e.target;el.style.transitionDelay=(i*150)+'ms';el.style.opacity='1';el.style.transform='translateY(0)';io.unobserve(el)})},{threshold:.1,rootMargin:'0px 0px -40px 0px'});
cards.forEach(el=>{el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition='opacity .5s ease, transform .5s ease';io.observe(el)})})();
})();
