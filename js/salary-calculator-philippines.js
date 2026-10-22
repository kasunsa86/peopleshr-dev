'use strict';
/* Philippines Salary Calculator — gross to net / net to gross.
   Withholding: BIR revised monthly withholding table, January 2023 onwards (TRAIN, RA 10963 / RR 11-2018).
   SSS: 15% of MSC (5% employee, 10% employer) + employer EC, MSC ₱5,000–₱35,000 (Circular 2024-006, Jan 2025).
   PhilHealth: 5% premium split 50/50, ₱10,000 floor, ₱100,000 ceiling, on monthly BASIC salary only
     (Advisory 2025-0002; allowances, overtime and bonuses excluded per Circular 2018-0001).
   Pag-IBIG: 1%/2% employee, 2% employer, ₱10,000 maximum fund salary (Circular 460, Feb 2024).
     Fund salary = basic + allowances, as is SSS compensation (RA 11199 s.8(f)).
   Employee contributions are deducted before withholding tax. Every amount is rounded to the centavo.
   Full rule matrix and tests: tools/ph-salary-calculator-audit/. */
(function(){
const MAX_INPUT=1e9, /* ₱1 billion a month: keeps every search finite */
  $=id=>document.getElementById(id),
  val=el=>{const n=parseFloat(el.value);return Number.isFinite(n)?Math.min(MAX_INPUT,Math.max(0,n)):0},
  /* Half-up to the centavo; the nudge absorbs binary noise such as 833.325 -> 833.32499… */
  r2=n=>Math.round(n*100+(n<0?-1e-7:1e-7))/100,
  fmt=n=>'₱ '+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2}),
  yr=n=>fmt(Math.round(n*100)/100*12)+' / yr',
  esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

/* Monthly bands; marginal sums reproduce the BIR table's fixed amounts (₱1,875 / ₱8,541.80 / ₱33,541.80 / ₱183,541.80). */
const BANDS=[{from:0,to:20833,rate:0},{from:20833,to:33333,rate:.15},{from:33333,to:66667,rate:.20},{from:66667,to:166667,rate:.25},{from:166667,to:666667,rate:.30},{from:666667,to:Infinity,rate:.35}];

function withholding(taxable){
  let tax=0,rate=0;
  const rows=BANDS.map(b=>{
    const inBand=Math.max(0,Math.min(taxable,b.to)-b.from),t=r2(inBand*b.rate);
    if(inBand>0)rate=b.rate;
    tax+=t;
    return{from:b.from,to:b.to,rate:b.rate,inBand,tax:t};
  });
  return{tax:r2(tax),rate,rows};
}

function sss(base){
  if(base<=0)return{msc:0,mpf:0,ee:0,er:0,ec:0};
  const msc=Math.max(5000,Math.min(35000,Math.floor((base+250)/500)*500)),ec=msc<15000?10:30;
  return{msc,mpf:Math.max(0,msc-20000),ee:msc*.05,er:msc*.10,ec};
}
const philhealth=basic=>basic<=0?0:r2(Math.max(10000,Math.min(basic,100000))*.025),
  hdmfEe=base=>base<=0?0:r2(base<=1500?base*.01:Math.min(base,10000)*.02),
  hdmfEr=base=>base<=0?0:r2(Math.min(base,10000)*.02);

const S={mode:'gross',allow:[],ded:[],view:'er'};

function compute(basic){
  const covered=$('covered').checked,mwe=$('mwe').checked;
  let allowTotal=0,contribAllow=0,taxAllow=0;
  S.allow.forEach(a=>{allowTotal+=a.amount;if(a.contrib)contribAllow+=a.amount;if(a.tax)taxAllow+=a.amount});
  const other=r2(S.ded.reduce((s,d)=>s+d.amount,0)),
    gross=r2(basic+allowTotal),
    /* SSS compensation and Pag-IBIG fund salary include allowances; PhilHealth uses basic salary only. */
    base=covered?basic+contribAllow:0,phBase=covered?basic:0,
    sd=sss(base),phEe=philhealth(phBase),hdEe=hdmfEe(base),hdEr=hdmfEr(base),
    contrib=r2(sd.ee+phEe+hdEe),
    /* Minimum wage earners: statutory minimum wage is exempt, other taxable pay is still taxed.
       Assumes the basic entered IS the applicable regional minimum wage (not validated). */
    taxable=r2(mwe?taxAllow:Math.max(0,basic+taxAllow-contrib)),
    t=withholding(taxable),
    net=r2(gross-contrib-t.tax-other),
    erContrib=r2(sd.er+sd.ec+phEe+hdEr);
  return{basic,allowTotal,gross,base,phBase,contribAllow,sd,phEe,hdEe,hdEr,contrib,taxable,tax:t.tax,rate:t.rate,rows:t.rows,other,net,erContrib,erCost:r2(gross+erContrib),covered,mwe};
}

/* Net to gross returns the SMALLEST basic, to the centavo, whose net reaches the target.
   Between statutory steps net rises by at most ₱0.01 per centavo of basic, so it hits the
   target exactly. At each step (first centavo of pay, Pag-IBIG over ₱1,500, every SSS ₱500
   MSC step) net drops, so the same net can occur twice. Walk the segments between steps in
   order and solve inside the first one that reaches the target. Works in whole centavos. */
function stepCents(){
  if(!$('covered').checked)return[];
  const extra=Math.round(S.allow.reduce((s,a)=>s+(a.contrib?a.amount:0),0)*100),
    base=[1,150001];for(let c=525000;c<=3475000;c+=50000)base.push(c);
  const cuts=base.map(c=>c-extra);cuts.push(1); /* PhilHealth starts on the first centavo of basic */
  return[...new Set(cuts.filter(c=>c>0))].sort((a,b)=>a-b);
}
function solveBasic(target){
  const net=c=>compute(c/100).net;
  if(net(0)>=target)return 0;
  let top=Math.max(100,Math.round(target*200));
  while(net(top)<target&&top<MAX_INPUT*400)top*=2;
  const cuts=stepCents().filter(c=>c<=top),starts=[0,...cuts];
  for(let i=0;i<starts.length;i++){
    let e=i+1<starts.length?starts[i+1]-1:top;const s=starts[i];
    /* Rounding can dip net by ₱0.01 for one centavo, so look at the last two centavos. */
    if(net(e)<target){if(e>s&&net(e-1)>=target)e--;else continue}
    let lo=s,hi=e;
    while(lo<hi){const mid=Math.floor((lo+hi)/2);if(net(mid)>=target)hi=mid;else lo=mid+1}
    for(let c=lo-1;c>=Math.max(s,lo-300);c--)if(net(c)>=target)lo=c;
    return lo/100;
  }
  return top/100;
}

function current(){
  if(S.mode==='gross')return compute(val($('basic')));
  return compute(solveBasic(val($('target'))));
}

function bandLabel(r){return r.rate?Math.round(r.rate*100)+'% marginal bracket':'0% bracket (tax-free)'}

function render(){
  const r=current(),net=S.mode==='net';
  if(net){
    $('resALabel').textContent='Required basic salary';$('resA').textContent=fmt(r.basic);
    $('resBLabel').textContent='Gross monthly pay';$('resB').textContent=fmt(r.gross);
    $('stickyLabel').textContent='Required gross';$('stickyNet').textContent=fmt(r.gross);
  }else{
    $('resALabel').textContent='Monthly withholding tax';$('resA').textContent=fmt(r.tax);
    $('resBLabel').textContent='Net monthly pay';$('resB').textContent=fmt(r.net);
    $('stickyLabel').textContent='Estimated take-home';$('stickyNet').textContent=fmt(r.net);
  }
  $('sssEe').textContent=fmt(r.sd.ee);$('phEe').textContent=fmt(r.phEe);$('hdEe').textContent=fmt(r.hdEe);
  $('kGross').textContent=fmt(r.gross);$('kGrossY').textContent=yr(r.gross);
  $('kContrib').textContent=fmt(r.contrib);$('kContribY').textContent=yr(r.contrib);
  $('kTax').textContent=fmt(r.tax);$('kTaxY').textContent=yr(r.tax);
  $('kDed').textContent=fmt(r.other);$('kDedY').textContent=yr(r.other);
  $('kNet').textContent=fmt(r.net);$('kNetY').textContent=yr(r.net);
  $('erGross').textContent=fmt(r.gross);$('erGrossY').textContent=yr(r.gross);
  $('erSss').textContent=fmt(r.sd.er+r.sd.ec);$('erSssY').textContent=yr(r.sd.er+r.sd.ec);
  $('erPh').textContent=fmt(r.phEe);$('erPhY').textContent=yr(r.phEe);
  $('erHd').textContent=fmt(r.hdEr);$('erHdY').textContent=yr(r.hdEr);
  $('erTotal').textContent=fmt(r.erCost);$('erTotalY').textContent=yr(r.erCost);
  $('mscNote').textContent=fmt(r.sd.msc)+(r.sd.mpf?' (incl. '+fmt(r.sd.mpf)+' to MPF)':'');
  const cur=r.rows.filter(x=>x.inBand>0).pop()||r.rows[0],
    ceil=Number.isFinite(cur.to)?cur.to:Math.max(r.taxable,cur.from*1.25),
    pct=Math.max(0,Math.min(100,(r.taxable-cur.from)/(ceil-cur.from)*100));
  $('bracketLabel').textContent=bandLabel(cur);$('taxableLabel').textContent=fmt(r.taxable);
  $('bracketFill').style.width=(r.taxable>0?pct:0)+'%';
  $('bandRows').innerHTML=r.rows.map(x=>'<tr class="'+(x===cur&&r.taxable>0?'is-current':'')+'"><td>'+(Number.isFinite(x.to)?fmt(x.from)+' – '+fmt(x.to):'Above '+fmt(x.from))+'</td><td>'+Math.round(x.rate*100)+'%</td><td>'+fmt(x.inBand)+'</td><td>'+fmt(x.tax)+'</td></tr>').join('');
  $('bandTotal').textContent=fmt(r.tax);
  $('coveredNote').classList.toggle('hidden',r.covered);
  $('mweNote').classList.toggle('hidden',!r.mwe);
  $('zeroNote').classList.toggle('hidden',!(net&&r.basic===0&&val($('target'))>0));
  $('negNote').classList.toggle('hidden',!(r.net<0));
  breakdown(r);
  return r;
}

function breakdown(r){
  const rows=[
    ['Basic salary',fmt(r.basic),S.mode==='net'?'Solved from target net pay':'Input'],
    ['Allowances',fmt(r.allowTotal),S.allow.length+' item(s)'],
    ['Gross monthly pay',fmt(r.gross),'Basic + allowances'],
    ['SSS / Pag-IBIG base',fmt(r.base),r.covered?'Basic + allowances marked SSS/Pag-IBIG':'Statutory contributions not deducted'],
    ['PhilHealth base',fmt(r.phBase),r.covered?'Monthly basic salary only (allowances excluded)':'Statutory contributions not deducted'],
    ['SSS employee share',fmt(r.sd.ee),r.sd.msc?'5% of MSC '+fmt(r.sd.msc):'—'],
    ['PhilHealth employee share',fmt(r.phEe),'2.5% of basic salary (₱10,000 floor, ₱100,000 ceiling)'],
    ['Pag-IBIG employee share',fmt(r.hdEe),r.base>0&&r.base<=1500?'1% of SSS / Pag-IBIG base':'2% of SSS / Pag-IBIG base, up to ₱10,000 (max ₱200)'],
    ['Taxable compensation',fmt(r.taxable),r.mwe?'Taxable allowances only (minimum wage is exempt)':'Basic + taxable allowances − employee contributions'],
    ['Withholding tax',fmt(r.tax),bandLabel({rate:r.rate})+', BIR monthly table (2023 onwards)'],
    ['Other deductions',fmt(r.other),S.ded.map(d=>esc(d.name||'Deduction')).join(', ')||'None'],
    ['Net monthly pay',fmt(r.net),'Gross − contributions − withholding − other deductions'],
    ['Employer SSS + EC',fmt(r.sd.er+r.sd.ec),r.sd.msc?'10% of MSC + ₱'+r.sd.ec+' EC':'—'],
    ['Employer PhilHealth',fmt(r.phEe),'2.5% of basic salary'],
    ['Employer Pag-IBIG',fmt(r.hdEr),'2% of SSS / Pag-IBIG base, up to ₱10,000'],
    ['Total cost to employer',fmt(r.erCost),'Gross + employer contributions']
  ];
  $('breakBody').innerHTML=rows.map(x=>'<div class="break-row"><div><b>'+x[0]+'</b><small>'+x[2]+'</small></div><b>'+x[1]+'</b></div>').join('')+'<p class="footnote">Illustrative estimate only. Each amount is rounded to the centavo. 13th-month pay, bonuses and year-end annualization are not included here.</p>';
}

/* ---------- Allowance and deduction rows ---------- */
const X='<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
function allowRow(a,i){
  return '<div class="line-item" data-i="'+i+'"><input class="li-name" data-k="name" placeholder="Allowance name" value="'+esc(a.name)+'" aria-label="Allowance name"><div class="money"><span>₱</span><input data-k="amount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" value="'+(a.amount||'')+'" aria-label="Allowance amount"></div><label class="check"><input type="checkbox" data-k="contrib"'+(a.contrib?' checked':'')+' title="Counts toward SSS and Pag-IBIG (not PhilHealth)">SSS/Pag-IBIG</label><label class="check"><input type="checkbox" data-k="tax"'+(a.tax?' checked':'')+'>Taxable</label><button class="icon-btn danger" data-remove title="Remove" aria-label="Remove allowance">'+X+'</button></div>';
}
function dedRow(d,i){
  return '<div class="line-item line-item--ded" data-i="'+i+'"><input class="li-name" data-k="name" placeholder="e.g. SSS loan, Pag-IBIG loan" value="'+esc(d.name)+'" aria-label="Deduction name"><div class="money"><span>₱</span><input data-k="amount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" value="'+(d.amount||'')+'" aria-label="Deduction amount"></div><button class="icon-btn danger" data-remove title="Remove" aria-label="Remove deduction">'+X+'</button></div>';
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
  $('basic').value='';$('target').value='';$('covered').checked=true;$('mwe').checked=false;
  S.allow=[];S.ded=[];drawLists();render();
}

document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
['basic','target'].forEach(id=>$(id).addEventListener('input',render));
['covered','mwe'].forEach(id=>$(id).addEventListener('change',render));
$('addAllow').addEventListener('click',()=>{S.allow.push({name:'',amount:0,contrib:true,tax:true});drawLists();$('allowList').querySelector('[data-i="'+(S.allow.length-1)+'"] .li-name').focus()});
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
})();
