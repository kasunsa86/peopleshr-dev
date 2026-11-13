'use strict';
/* Sri Lanka Income Tax Calculator (PAYE) (simple).
   Two rule sets, switched by the toggle:
   Opens on 'proposed' (Budget 2027), as asked by Nilendra; 'current' is the 2026/27 view.
   Every result also shows tax under both rule sets and the monthly/yearly difference.
   - 'current': APIT Table 01 (regular monthly profits from primary employment), IRD tax table Y/A 2025/26,
     from Inland Revenue (Amendment) Act No. 02 of 2025, effective 01.04.2025 (unchanged for 2026/27).
     Relief Rs. 1,800,000 a year, then 6% on 1,000,000, 18% / 24% / 30% on each 500,000, 36% on the rest.
   - 'proposed': Budget 2027 speech (12 Nov 2026), proposed from 01.04.2027, not yet law.
     Relief Rs. 1,950,000 a year, then 6% on 850,000, 12% / 18% / 24% / 30% on each 600,000, 36% on the rest.
     Sources: newswire.lk and erpa.lk Budget 2027 coverage, 12 Nov 2026.
   EPF 8% employee (not deductible for APIT), 12% employer; ETF 3% employer.
   EPF/ETF are worked out on total earnings (basic + allowances). */
(function(){
const $=id=>document.getElementById(id),
  num=el=>Math.max(0,parseFloat(el.value)||0),
  fmt=n=>'Rs. '+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});

const EPF_EE=.08,EPF_ER=.12,ETF=.03;
/* Annual figures; monthly APIT spreads them evenly over 12 months */
const RULES={
  current:{title:'Current tax table (2026/27)',sub:'IRD <a href="https://www.ird.gov.lk/en/publications/APIT_Tax_Tables/2025-2026/Table%20-%201/02.%20APIT_2526_Table_01.pdf" target="_blank" rel="noopener">APIT Table 01</a> (issued for 2025/26), monthly. Still in force for 2026/27, until 31 March 2027.',relief:1800000,bands:[[1000000,.06],[500000,.18],[500000,.24],[500000,.30],[Infinity,.36]]},
  proposed:{title:'Budget 2027 proposed tax table',sub:'Monthly. Proposed in the <a href="https://www.treasury.gov.lk/web/budget" target="_blank" rel="noopener">Budget Speech</a> from 1 April 2027, not yet law.',relief:1950000,bands:[[850000,.06],[600000,.12],[600000,.18],[600000,.24],[600000,.30],[Infinity,.36]]}
};
let mode='proposed';

function paye(monthly,key){
  const R=RULES[key||mode];
  let rest=Math.max(0,monthly-R.relief/12),tax=0,rate=0;
  for(const [w,r] of R.bands){
    const b={w:w/12,r};
    if(rest<=0)break;
    const used=Math.min(rest,b.w);
    tax+=used*b.r;rate=b.r;rest-=used;
  }
  return{tax,rate};
}

const form=$('slpForm'),list=$('slpAllowList'),results=$('slpResults');
const X='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

$('slpAdd').addEventListener('click',()=>{
  const row=document.createElement('div');
  row.className='slp-row';
  row.innerHTML='<input class="slp-name" type="text" placeholder="Allowance name" aria-label="Allowance name">'+
    '<div class="slp-money slp-money--sm"><span>Rs.</span><input class="slp-amt" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" aria-label="Allowance amount"></div>'+
    '<button type="button" class="slp-remove" aria-label="Remove allowance">'+X+'</button>';
  list.appendChild(row);
  row.querySelector('.slp-amt').focus();
  markStale();
});

list.addEventListener('click',e=>{
  const b=e.target.closest('.slp-remove');
  if(!b)return;
  b.closest('.slp-row').remove();
  markStale();
});

/* Results only change on Calculate; dim them while inputs differ from what was calculated */
function markStale(){if(!results.classList.contains('hidden'))results.classList.add('is-stale')}
form.addEventListener('input',markStale);

/* Rule toggle: recalculates straight away if a result is already showing */
document.querySelectorAll('[data-rules]').forEach(b=>b.addEventListener('click',()=>{
  mode=b.dataset.rules;
  document.querySelectorAll('[data-rules]').forEach(x=>x.setAttribute('aria-pressed',x===b));
  $('slpProposedNote').classList.toggle('hidden',mode!=='proposed');
  $('slpCurrentNote').classList.toggle('hidden',mode!=='current');
  if(!results.classList.contains('hidden'))calculate();else renderTable();
}));

/* Tax table for the selected rules, built from RULES so it always matches the maths.
   Highlights the band the last calculated salary falls in. */
let lastGross=null;
function renderTable(){
  const R=RULES[mode],rs=n=>'Rs. '+Math.round(n).toLocaleString('en-US'),rows=[];
  let from=R.relief/12;
  rows.push({label:'Up to '+rs(from),rate:0,lo:0,hi:from});
  for(const [w,r] of R.bands){
    const to=from+w/12;
    rows.push({label:Number.isFinite(to)?rs(from)+' to '+rs(to):'Above '+rs(from),rate:r,lo:from,hi:to});
    from=to;
  }
  const cur=lastGross===null?-1:rows.findIndex(x=>lastGross<=x.hi);
  $('slpTableTitle').textContent=R.title;
  $('slpTableSub').innerHTML=R.sub; /* static strings from RULES only */
  $('slpTableBody').innerHTML=rows.map((x,i)=>'<tr'+(i===cur?' class="is-current"':'')+'><td>'+x.label+(i===cur?'<span class="slp-you">You</span>':'')+'</td><td>'+Math.round(x.rate*100)+'%</td></tr>').join('');
}
renderTable();

form.addEventListener('submit',e=>{e.preventDefault();calculate()});

function calculate(){
  const basic=num($('slpBasic')),
    allow=[...list.querySelectorAll('.slp-amt')].reduce((s,el)=>s+num(el),0);
  if(basic<=0){
    $('slpError').classList.remove('hidden');
    $('slpBasic').focus();
    return;
  }
  $('slpError').classList.add('hidden');

  const gross=basic+allow,
    t=paye(gross),
    epfEe=gross*EPF_EE,
    net=gross-t.tax-epfEe;

  $('slpNet').textContent=fmt(net);
  $('slpNetYear').textContent=fmt(net*12)+' a year';
  $('slpGross').textContent=fmt(gross);
  $('slpTax').textContent='− '+fmt(t.tax);
  $('slpRate').textContent=t.rate?Math.round(t.rate*100)+'% band':'Tax-free';
  $('slpEpfEe').textContent='− '+fmt(epfEe);
  $('slpTakeHome').textContent=fmt(net);
  $('slpEpfEr').textContent=fmt(gross*EPF_ER);
  $('slpEtf').textContent=fmt(gross*ETF);

  /* Comparison: shown on every result, whichever rules are selected */
  const taxNow=paye(gross,'current').tax,taxNew=paye(gross,'proposed').tax,saving=Math.max(0,taxNow-taxNew);
  $('slpCmpCur').textContent=fmt(taxNow);
  $('slpCmpNew').textContent=fmt(taxNew);
  if(saving>0){
    $('slpCmpLabel').textContent='You save under Budget 2027';
    $('slpCmpSave').textContent=fmt(saving)+' a month';
    $('slpCmpYear').textContent=fmt(saving*12)+' a year';
  }else{
    $('slpCmpLabel').textContent='Difference';
    $('slpCmpSave').textContent='No change';
    $('slpCmpYear').textContent='Tax-free under both';
  }
  $('slpSaving').textContent=mode==='proposed'?fmt(saving)+' less tax a month than now':fmt(saving)+' less tax a month from April 2027';
  $('slpSaving').classList.toggle('hidden',saving<=0);

  lastGross=gross;renderTable();

  const wasHidden=results.classList.contains('hidden');
  results.classList.remove('hidden','is-stale');
  if(wasHidden&&matchMedia('(max-width: 900px)').matches)results.scrollIntoView({behavior:'smooth',block:'start'});
}
})();
