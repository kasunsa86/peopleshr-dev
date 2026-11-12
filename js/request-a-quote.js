'use strict';
/* Request a Live Quote — one question per screen, then the recommended
   package (tiers can be switched), then contact details.
   Questions and module cards are rendered server-side from
   inc/quote-tiers.php; this file only moves between steps, validates and
   posts to /quote-submit.php: first {action:'recommend'} to fill the
   package step, then the full request, which prices it and emails the SDR. */
(function(){
const form=document.getElementById('rqForm');
if(!form)return;
const AUTO_ADVANCE_MS=280,
  ENDPOINT='/quote-submit.php',
  $=id=>document.getElementById(id),
  steps=[...form.querySelectorAll('.rq-step')],
  bar=$('rqBar'), count=$('rqCount'), progress=form.querySelector('.rq-progress'),
  back=$('rqBack'), next=$('rqNext'), error=$('rqError'),
  pkgLoading=$('rqPkgLoading'), modsRequired=$('rqModsRequired'), modsOptional=$('rqModsOptional'), optionalTitle=$('rqModsOptionalTitle'),
  track=(name,params)=>{if(typeof window.gtag==='function')window.gtag('event',name,params||{})},
  cookie=name=>{const m=document.cookie.match(new RegExp('(?:^|; )'+name+'=([^;]*)'));return m?decodeURIComponent(m[1]):''},
  post=body=>fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(r=>r.json().catch(()=>({})).then(res=>{if(!r.ok||!res.ok)throw new Error(res.error||'');return res}));
/* Arrow keys also change radios, so only a pointer pick auto-advances. */
let current=0, timer=0, sending=false, pointer=false,
  /* Answers the package step was last built from; '' while loading or failed. */
  pkgFor='', pkgPending=null;
form.addEventListener('pointerdown',()=>{pointer=true});
form.addEventListener('keydown',()=>{pointer=false});

function show(i,focus){
  clearTimeout(timer);
  current=i;
  steps.forEach((s,n)=>{s.hidden=n!==i});
  const step=i+1, last=i===steps.length-1;
  bar.style.width=(step/steps.length*100)+'%';
  progress.setAttribute('aria-valuenow',step);
  count.textContent='Step '+step+' of '+steps.length;
  back.hidden=i===0;
  next.textContent=last?'Submit':'Next';
  error.textContent='';
  if(steps[i].dataset.type==='package')loadPackage();
  if(focus)steps[i].querySelector('.rq-q').focus({preventScroll:true});
  track('quote_step',{step:step});
}

function answers(){
  const data=new FormData(form), out={};
  steps.forEach(s=>{
    const name=s.dataset.name;
    if(s.dataset.type==='single')out[name]=data.get(name);
    else if(s.dataset.type==='number')out[name]=String(data.get(name)||'').replace(/[\s,]/g,'');
    else if(s.dataset.type==='multi')out[name]=data.getAll(name);
  });
  return out;
}

/* Fills the package step with the recommended tiers. Rebuilds only when
   the answers changed, so tier switches survive going Back and Next. */
function loadPackage(){
  const a=answers(), key=JSON.stringify(a);
  if(key===pkgFor||key===pkgPending)return;
  pkgFor='';
  pkgPending=key;
  pkgLoading.textContent='Building your package…';
  pkgLoading.hidden=false;
  modsRequired.hidden=modsOptional.hidden=optionalTitle.hidden=true;
  post({action:'recommend',answers:a}).then(res=>{
    if(pkgPending!==key)return;
    let optional=0;
    Object.keys(res.package).forEach(id=>{
      const rec=res.package[id], card=form.querySelector('.rq-mod[data-bundle="'+id+'"]');
      if(!card)return;
      (rec.required?modsRequired:modsOptional).appendChild(card);
      if(!rec.required)optional++;
      card.querySelector('.rq-seg-none').hidden=rec.required;
      card.querySelectorAll('input').forEach(input=>{
        const rank=+input.value;
        input.closest('.rq-seg-opt').classList.toggle('is-rec',rank===rec.rank);
        input.checked=rank===(rec.required?rec.rank:0);
      });
      card.classList.toggle('is-off',!rec.required);
      card.hidden=false;
    });
    pkgFor=key;
    pkgPending=null;
    pkgLoading.hidden=true;
    modsRequired.hidden=false;
    modsOptional.hidden=optionalTitle.hidden=!optional;
  }).catch(()=>{
    if(pkgPending!==key)return;
    pkgPending=null;
    pkgLoading.textContent='We could not load your package. Press Next to try again.';
  });
}

/* Returns an error message for the current step, or '' if it can continue. */
function check(step){
  const type=step.dataset.type;
  if(type==='single')return step.querySelector('input:checked')?'':'Please choose an answer to continue.';
  if(type==='multi')return '';
  if(type==='number'){
    const input=step.querySelector('input'), raw=input.value.replace(/[\s,]/g,''),
      n=+raw, min=+input.dataset.min, max=+input.dataset.max,
      bad=!/^[0-9]+$/.test(raw)||n<min||n>max;
    input.setAttribute('aria-invalid',bad);
    if(!bad)return '';
    input.focus();
    return raw===''?'Please enter your number of employees.':
      /^[0-9]+$/.test(raw)&&n>max?'For more than '+max.toLocaleString()+' employees, please contact our sales team.':
      'Please enter a whole number of employees.';
  }
  if(type==='package'){
    if(pkgFor)return '';
    if(!pkgPending)loadPackage();
    return 'Your package is still loading. Please wait a moment.';
  }
  let msg='';
  step.querySelectorAll('.rq-field input').forEach(input=>{
    input.value=input.value.trim();
    const bad=!input.checkValidity();
    input.setAttribute('aria-invalid',bad);
    if(bad&&!msg){
      msg=input.validity.valueMissing?'Please fill in every field.':
        input.type==='email'?'Please enter a valid email address.':
        input.type==='tel'?'Please enter a valid phone number.':'Please check the highlighted field.';
      input.focus();
    }
  });
  return msg;
}

function collect(){
  const data=new FormData(form), pkg={};
  form.querySelectorAll('.rq-mod').forEach(card=>{
    const picked=card.querySelector('input:checked');
    if(picked)pkg[card.dataset.bundle]=+picked.value;
  });
  return {
    answers:answers(),
    package:pkg,
    contact:{firstName:data.get('firstName'),lastName:data.get('lastName'),email:data.get('email'),company:data.get('company'),phone:data.get('phone')},
    website:data.get('website'),
    hutk:cookie('hubspotutk'),
    pageUrl:location.href
  };
}

function submit(){
  sending=true;
  next.disabled=back.disabled=true;
  next.textContent='Sending…';
  const payload=collect();
  post(payload)
    .then(()=>{
      form.hidden=true;
      $('rqDoneTitle').textContent='Thank you, '+payload.contact.firstName+'!';
      $('rqDone').hidden=false;
      $('rqDoneTitle').focus();
      track('generate_lead',{form_name:'live_quote'});
    })
    .catch(e=>{
      error.textContent=e.message||'Something went wrong. Please check your connection and try again.';
      next.textContent='Submit';
    })
    .finally(()=>{sending=false;next.disabled=back.disabled=false});
}

form.addEventListener('submit',e=>{
  e.preventDefault();
  if(sending)return;
  const msg=check(steps[current]);
  if(msg){error.textContent=msg;return}
  if(current<steps.length-1)show(current+1,true);
  else submit();
});

back.addEventListener('click',()=>{if(current>0)show(current-1,true)});

/* Clear text-field errors while typing: clearing them on blur (change)
   shifts the buttons up mid-click, so the Submit click misses. */
form.addEventListener('input',e=>{
  if(!e.target.closest('.rq-field'))return;
  e.target.removeAttribute('aria-invalid');
  error.textContent='';
});

form.addEventListener('change',e=>{
  const input=e.target, step=input.closest('.rq-step');
  if(!step||(input.type!=='radio'&&input.type!=='checkbox'))return;
  error.textContent='';
  if(step.dataset.type==='package'){
    input.closest('.rq-mod').classList.toggle('is-off',input.value==='0');
  }else if(input.type==='radio'){
    /* Single answers move on by themselves; Back still allows changes. */
    clearTimeout(timer);
    if(!pointer)return;
    timer=setTimeout(()=>{if(steps[current]===step)show(current+1,true)},AUTO_ADVANCE_MS);
  }else{
    /* data-max (from the question's 'max') caps the picks; no data-max, no cap. */
    const max=+step.dataset.max, label=step.querySelector('.rq-picked'),
      boxes=[...step.querySelectorAll('input[type=checkbox]')],
      picked=boxes.filter(b=>b.checked).length;
    if(!max)return;
    boxes.forEach(b=>{if(!b.checked)b.disabled=picked>=max});
    if(label)label.textContent=picked?picked+' of '+max+' selected':'';
  }
});

show(0,false);
})();
