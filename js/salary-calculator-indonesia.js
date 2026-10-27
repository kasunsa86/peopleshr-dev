'use strict';
/* Indonesia Salary Calculator — gross to net / net to gross.
   PPh 21: monthly TER withholding for Jan–Nov (PP 58/2023, PMK 168/2023), applied to gross income
   including employer-paid JKK, JKM and BPJS Kesehatan. December: annual Article 17 (UU HPP) less TER withheld.
   BPJS Ketenagakerjaan: JHT 3.7% ER / 2% EE; JP 2% ER / 1% EE up to the JP wage cap; JKK 0.24–1.74% ER; JKM 0.3% ER.
   BPJS Kesehatan: 4% ER / 1% EE, wage cap Rp 12,000,000. */
(function(){
const $=id=>document.getElementById(id),
  val=el=>Math.max(0,parseFloat(el.value)||0),
  fmt=n=>(n<0?'− ':'')+'Rp '+Math.abs(Math.round(n||0)).toLocaleString('en-US'),
  pct=r=>(Math.round(r*10000)/100)+'%',
  esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

/* JP wage cap from 1 March 2026 (BPJS letter B/1226/022026); BPJS revises it each March. Update when the new cap is announced. */
const JP_CAP=11086300,KES_CAP=12000000;

const PTKP={'TK/0':54e6,'TK/1':58.5e6,'TK/2':63e6,'TK/3':67.5e6,'K/0':58.5e6,'K/1':63e6,'K/2':67.5e6,'K/3':72e6},
  CAT={'TK/0':'A','TK/1':'A','K/0':'A','TK/2':'B','TK/3':'B','K/1':'B','K/2':'B','K/3':'C'};

/* TER tables (PP 58/2023 annex): [upper bound of monthly gross, rate %]. Lower bound exclusive, upper inclusive. */
const TER={
  A:[[5400000,0],[5650000,.25],[5950000,.5],[6300000,.75],[6750000,1],[7500000,1.25],[8550000,1.5],[9650000,1.75],[10050000,2],[10350000,2.25],[10700000,2.5],[11050000,3],[11600000,3.5],[12500000,4],[13750000,5],[15100000,6],[16950000,7],[19750000,8],[24150000,9],[26450000,10],[28000000,11],[30050000,12],[32400000,13],[35400000,14],[39100000,15],[43850000,16],[47800000,17],[51400000,18],[56300000,19],[62200000,20],[68600000,21],[77500000,22],[89000000,23],[103000000,24],[125000000,25],[157000000,26],[206000000,27],[337000000,28],[454000000,29],[550000000,30],[695000000,31],[910000000,32],[1400000000,33],[Infinity,34]],
  B:[[6200000,0],[6500000,.25],[6850000,.5],[7300000,.75],[9200000,1],[10750000,1.5],[11250000,2],[11600000,2.5],[12600000,3],[13600000,4],[14950000,5],[16400000,6],[18450000,7],[21850000,8],[26000000,9],[27700000,10],[29350000,11],[31450000,12],[33950000,13],[37100000,14],[41100000,15],[45800000,16],[49500000,17],[53800000,18],[58500000,19],[64000000,20],[71000000,21],[80000000,22],[93000000,23],[109000000,24],[129000000,25],[163000000,26],[211000000,27],[374000000,28],[459000000,29],[555000000,30],[704000000,31],[957000000,32],[1405000000,33],[Infinity,34]],
  C:[[6600000,0],[6950000,.25],[7350000,.5],[7800000,.75],[8850000,1],[9800000,1.25],[10950000,1.5],[11200000,1.75],[12050000,2],[12950000,3],[14150000,4],[15550000,5],[17050000,6],[19500000,7],[22700000,8],[26600000,9],[28100000,10],[30100000,11],[32600000,12],[35400000,13],[38900000,14],[43000000,15],[47400000,16],[51200000,17],[55800000,18],[60400000,19],[66700000,20],[74500000,21],[83200000,22],[95600000,23],[110000000,24],[134000000,25],[169000000,26],[221000000,27],[390000000,28],[463000000,29],[561000000,30],[709000000,31],[965000000,32],[1419000000,33],[Infinity,34]]
};

/* Article 17 annual bands */
const BANDS=[{from:0,to:60e6,rate:.05},{from:60e6,to:250e6,rate:.15},{from:250e6,to:500e6,rate:.25},{from:500e6,to:5e9,rate:.30},{from:5e9,to:Infinity,rate:.35}];

function ter(cat,bruto){
  const t=TER[cat];let i=t.findIndex(b=>bruto<=b[0]);if(i<0)i=t.length-1;
  return{rate:t[i][1]/100,from:i?t[i-1][0]:0,to:t[i][0]};
}

function article17(pkp){
  let tax=0;
  const rows=BANDS.map(b=>{
    const inBand=Math.max(0,Math.min(pkp,b.to)-b.from),t=inBand*b.rate;
    tax+=t;
    return{from:b.from,to:b.to,rate:b.rate,inBand,tax:t};
  });
  return{tax:Math.floor(tax),rows};
}

const S={mode:'gross',allow:[],ded:[],view:'er'};

function compute(basic){
  const covered=$('covered').checked,status=$('ptkp').value,cat=CAT[status],jkkRate=parseFloat($('jkk').value);
  let allowTotal=0,bpjsAllow=0,taxAllow=0;
  S.allow.forEach(a=>{allowTotal+=a.amount;if(a.bpjs)bpjsAllow+=a.amount;if(a.tax)taxAllow+=a.amount});
  const other=S.ded.reduce((s,d)=>s+d.amount,0),
    gross=basic+allowTotal,
    base=covered?basic+bpjsAllow:0,
    jpBase=Math.min(base,JP_CAP),kesBase=Math.min(base,KES_CAP),
    jhtEe=Math.round(base*.02),jpEe=Math.round(jpBase*.01),kesEe=Math.round(kesBase*.01),
    jhtEr=Math.round(base*.037),jpEr=Math.round(jpBase*.02),jkk=Math.round(base*jkkRate),jkm=Math.round(base*.003),kesEr=Math.round(kesBase*.04),
    contrib=jhtEe+jpEe+kesEe,
    /* Gross income for PPh 21 includes the employer's JKK, JKM and BPJS Kesehatan premiums, not employer JHT or JP. */
    bruto=basic+taxAllow+jkk+jkm+kesEr,
    band=ter(cat,bruto),
    tax=Math.floor(bruto*band.rate),
    net=gross-contrib-tax-other,
    erContrib=jhtEr+jpEr+jkk+jkm+kesEr,
    /* Annual Article 17 for a full year at this monthly pay */
    brutoY=bruto*12,jabatan=Math.min(brutoY*.05,6e6),pensionY=(jhtEe+jpEe)*12,ptkp=PTKP[status],
    pkp=Math.max(0,Math.floor((brutoY-jabatan-pensionY-ptkp)/1000)*1000),
    a17=article17(pkp);
  return{basic,allowTotal,gross,base,jpBase,kesBase,jhtEe,jpEe,kesEe,jhtEr,jpEr,jkk,jkkRate,jkm,kesEr,contrib,bruto,cat,status,band,tax,other,net,erContrib,erCost:gross+erContrib,covered,
    brutoY,jabatan,pensionY,ptkp,pkp,taxY:a17.tax,rows:a17.rows,dec:a17.tax-tax*11};
}

/* Net to gross: TER applies one rate to the whole gross, so net drops slightly at each TER threshold.
   Those drops are downward only, so bisection still lands on a continuous crossing. */
function solveBasic(target){
  if(compute(0).net>=target)return 0;
  let lo=0,hi=Math.max(target,1)*2;
  while(compute(hi).net<target&&hi<1e13)hi*=2;
  for(let i=0;i<100;i++){const mid=(lo+hi)/2;if(compute(mid).net<target)lo=mid;else hi=mid}
  return Math.ceil(hi);
}

function current(){
  if(S.mode==='gross')return compute(val($('basic')));
  return compute(solveBasic(val($('target'))));
}

function render(){
  const r=current(),net=S.mode==='net',yr=n=>fmt(n*12)+' / yr';
  if(net){
    $('resALabel').textContent='Required basic salary';$('resA').textContent=fmt(r.basic);
    $('resBLabel').textContent='Gross monthly pay';$('resB').textContent=fmt(r.gross);
    $('stickyLabel').textContent='Required gross';$('stickyNet').textContent=fmt(r.gross);
  }else{
    $('resALabel').textContent='Monthly PPh 21 (TER)';$('resA').textContent=fmt(r.tax);
    $('resBLabel').textContent='Net monthly pay';$('resB').textContent=fmt(r.net);
    $('stickyLabel').textContent='Estimated take-home';$('stickyNet').textContent=fmt(r.net);
  }
  $('jhtEe').textContent=fmt(r.jhtEe);$('jpEe').textContent=fmt(r.jpEe);$('kesEe').textContent=fmt(r.kesEe);
  /* Annual figures use the Article 17 tax, so the PPh 21 and net totals include the December true-up. */
  $('kGross').textContent=fmt(r.gross);$('kGrossY').textContent=yr(r.gross);
  $('kContrib').textContent=fmt(r.contrib);$('kContribY').textContent=yr(r.contrib);
  $('kTax').textContent=fmt(r.tax);$('kTaxY').textContent=fmt(r.taxY)+' / yr';
  $('kDed').textContent=fmt(r.other);$('kDedY').textContent=yr(r.other);
  $('kNet').textContent=fmt(r.net);$('kNetY').textContent=fmt((r.gross-r.contrib-r.other)*12-r.taxY)+' / yr';
  $('erGross').textContent=fmt(r.gross);$('erGrossY').textContent=yr(r.gross);
  $('erJhtJp').textContent=fmt(r.jhtEr+r.jpEr);$('erJhtJpY').textContent=yr(r.jhtEr+r.jpEr);
  $('erJkkJkm').textContent=fmt(r.jkk+r.jkm);$('erJkkJkmY').textContent=yr(r.jkk+r.jkm);
  $('erKes').textContent=fmt(r.kesEr);$('erKesY').textContent=yr(r.kesEr);
  $('erTotal').textContent=fmt(r.erCost);$('erTotalY').textContent=yr(r.erCost);
  $('decNote').textContent=r.dec<0?fmt(-r.dec)+' refund (over-withheld)':fmt(r.dec);
  $('pkpNote').textContent=fmt(r.pkp);
  const b=r.band,ceil=Number.isFinite(b.to)?b.to:Math.max(r.bruto,b.from*1.25),
    p=Math.max(0,Math.min(100,(r.bruto-b.from)/(ceil-b.from)*100));
  $('bracketLabel').textContent='Category '+r.cat+' ('+r.status+') · '+pct(b.rate);
  $('taxableLabel').textContent=fmt(r.bruto);
  $('bracketFill').style.width=(r.bruto>0?p:0)+'%';
  const cur=r.rows.filter(x=>x.inBand>0).pop();
  $('bandRows').innerHTML=r.rows.map(x=>'<tr class="'+(x===cur?'is-current':'')+'"><td>'+(Number.isFinite(x.to)?fmt(x.from)+' – '+fmt(x.to):'Above '+fmt(x.from))+'</td><td>'+Math.round(x.rate*100)+'%</td><td>'+fmt(x.inBand)+'</td><td>'+fmt(x.tax)+'</td></tr>').join('');
  $('bandTotal').textContent=fmt(r.taxY);
  $('coveredNote').classList.toggle('hidden',r.covered);
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
    ['BPJS wage base',fmt(r.base),r.covered?'Basic + allowances marked "BPJS"':'BPJS contributions not deducted'],
    ['JHT employee share',fmt(r.jhtEe),'2% of wage base'],
    ['JP employee share',fmt(r.jpEe),'1% of wage base, up to '+fmt(JP_CAP)],
    ['BPJS Kesehatan employee share',fmt(r.kesEe),'1% of wage base, up to '+fmt(KES_CAP)],
    ['Gross income for PPh 21',fmt(r.bruto),'Basic + taxable allowances + employer JKK, JKM and BPJS Kesehatan'],
    ['PPh 21 (TER, Jan–Nov)',fmt(r.tax),'Category '+r.cat+' ('+r.status+') at '+pct(r.band.rate)],
    ['Other deductions',fmt(r.other),S.ded.map(d=>esc(d.name||'Deduction')).join(', ')||'None'],
    ['Net monthly pay',fmt(r.net),'Gross − BPJS employee shares − PPh 21 − other deductions'],
    ['Annual gross income',fmt(r.brutoY),'12 × monthly gross income for PPh 21'],
    ['Occupational cost',fmt(r.jabatan),'5% of annual gross, max Rp 6,000,000'],
    ['Employee JHT + JP',fmt(r.pensionY),'Annual, deductible'],
    ['PTKP',fmt(r.ptkp),r.status],
    ['Taxable income (PKP)',fmt(r.pkp),'Rounded down to the nearest Rp 1,000'],
    ['Annual PPh 21',fmt(r.taxY),'Article 17 progressive rates'],
    ['December PPh 21',r.dec<0?fmt(-r.dec)+' refund':fmt(r.dec),'Annual tax − 11 × monthly TER'],
    ['Employer JHT',fmt(r.jhtEr),'3.7% of wage base'],
    ['Employer JP',fmt(r.jpEr),'2% of wage base, up to '+fmt(JP_CAP)],
    ['Employer JKK',fmt(r.jkk),pct(r.jkkRate)+' of wage base'],
    ['Employer JKM',fmt(r.jkm),'0.3% of wage base'],
    ['Employer BPJS Kesehatan',fmt(r.kesEr),'4% of wage base, up to '+fmt(KES_CAP)],
    ['Total cost to employer',fmt(r.erCost),'Gross + employer contributions']
  ];
  $('breakBody').innerHTML=rows.map(x=>'<div class="break-row"><div><b>'+x[0]+'</b><small>'+x[2]+'</small></div><b>'+x[1]+'</b></div>').join('')+'<p class="footnote">Illustrative estimate only. THR, bonuses, mid-year joiners and leavers are not included here.</p>';
}

/* ---------- Allowance and deduction rows ---------- */
const X='<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
function allowRow(a,i){
  return '<div class="line-item" data-i="'+i+'"><input class="li-name" data-k="name" placeholder="Allowance name" value="'+esc(a.name)+'" aria-label="Allowance name"><div class="money"><span>Rp</span><input data-k="amount" type="number" min="0" step="1" inputmode="numeric" placeholder="0" value="'+(a.amount||'')+'" aria-label="Allowance amount"></div><label class="check"><input type="checkbox" data-k="bpjs"'+(a.bpjs?' checked':'')+'>BPJS</label><label class="check"><input type="checkbox" data-k="tax"'+(a.tax?' checked':'')+'>Taxable</label><button class="icon-btn danger" data-remove title="Remove" aria-label="Remove allowance">'+X+'</button></div>';
}
function dedRow(d,i){
  return '<div class="line-item line-item--ded" data-i="'+i+'"><input class="li-name" data-k="name" placeholder="e.g. Loan, cooperative dues" value="'+esc(d.name)+'" aria-label="Deduction name"><div class="money"><span>Rp</span><input data-k="amount" type="number" min="0" step="1" inputmode="numeric" placeholder="0" value="'+(d.amount||'')+'" aria-label="Deduction amount"></div><button class="icon-btn danger" data-remove title="Remove" aria-label="Remove deduction">'+X+'</button></div>';
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
  if(mode==='net')$('target').value=r.net>0?Math.round(r.net):'';
  else $('basic').value=r.basic>0?Math.round(r.basic):'';
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
  $('basic').value='';$('target').value='';$('covered').checked=true;$('ptkp').value='TK/0';$('jkk').value='0.0024';
  S.allow=[];S.ded=[];drawLists();render();
}

document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
['basic','target'].forEach(id=>$(id).addEventListener('input',render));
['covered','ptkp','jkk'].forEach(id=>$(id).addEventListener('change',render));
$('addAllow').addEventListener('click',()=>{S.allow.push({name:'',amount:0,bpjs:true,tax:true});drawLists();$('allowList').querySelector('[data-i="'+(S.allow.length-1)+'"] .li-name').focus()});
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
