/* Webinar summary pages (/webinars/*-summary/): gate, pop-up player, timestamps.
   Reads data-yt / data-gated / data-preview-* from <main class="wsi-page">. */
(function(){
  var page=document.querySelector('.wsi-page');if(!page)return;
  var $=function(s,r){return (r||document).querySelector(s);},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var VID=page.dataset.yt,gated=page.dataset.gated==='true';
  var PS=+page.dataset.previewStart||0,PE=+page.dataset.previewEnd||0,unlocked=false;
  // Gate already passed on the webinars page (or here earlier) in this browser
  var KEY='wsi-unlocked:'+VID;
  try{unlocked=localStorage.getItem(KEY)==='1';}catch(e){}

  // Open vs members-only
  function applyGate(){var g=gated&&!unlocked;
    $$('[data-gate="open"]',page).forEach(function(el){el.hidden=g;});
    $$('[data-gate="form"]',page).forEach(function(el){el.hidden=!g;});}
  applyGate();
  // HubSpot gate submitted: unlock the full recording (same behaviour as the hub)
  window.addEventListener('message',function(e){var d=e.data;
    if(!d||d.type!=='hsFormCallback'||d.eventName!=='onFormSubmitted')return;
    if(gated){unlocked=true;try{localStorage.setItem(KEY,'1');}catch(e){}applyGate();openVideo(0);}
    else if(gm&&gm.classList.contains('active'))unlock();});

  // Open webinars: the first play asks for a short HubSpot form in a pop-up (message first,
  // then the form ~0.8s later); once submitted, this webinar plays from the point clicked.
  var gm=null,pending=0,formBuilt=false,formTimer,gateFocus=null;
  var FORM_DELAY=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?0:800;
  if(!gated&&!unlocked){
    gm=document.createElement('div');gm.className='dg-gate-overlay';gm.id='wsi-gm';
    gm.setAttribute('role','dialog');gm.setAttribute('aria-modal','true');gm.setAttribute('aria-labelledby','wsi-gm-t');
    gm.innerHTML='<div class="dg-gate-card"><button type="button" class="dg-gate-close" id="wsi-gm-x" aria-label="Close">&#x2715;</button>'+
      '<div class="dg-gate-header"><div class="dg-gate-icon"><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M7 5l9 5-9 5V5z" fill="currentColor"/></svg></div>'+
      '<h3 class="dg-gate-title" id="wsi-gm-t">Your session is ready</h3><p class="dg-gate-sub">Tell us a little about you and the recording starts right away. It takes under a minute, and you only do it once.</p></div>'+
      '<div class="wsi-gm-body"><div><div class="dg-gate-loading" id="wsi-gm-loading"><div class="dg-gate-spinner"></div>Loading form&hellip;</div><div id="wsi-gm-form"></div></div></div></div>';
    document.body.appendChild(gm);
    $('#wsi-gm-x').addEventListener('click',closeGate);
    gm.addEventListener('click',function(e){if(e.target===gm)closeGate();});
  }
  // HubSpot v2 embed of the on-demand first-play form (name, work email, phone; members-only
  // keeps its own form), built the first time the pop-up opens
  function buildForm(){if(formBuilt)return;formBuilt=true;
    function create(){hbspt.forms.create({region:'na2',portalId:'45700506',formId:'9c1fb962-eff8-4402-b53c-71fd085903d9',target:'#wsi-gm-form',
      onFormReady:function(f){var l=$('#wsi-gm-loading');if(l)l.style.display='none';centerButton(f);},onFormSubmitted:unlock});}
    // The form renders in HubSpot's own (same-origin) iframe, so centre its button from inside it
    function centerButton(f){var el=f&&(f.jquery?f[0]:f),d=el&&el.ownerDocument;
      if(!d||!d.getElementById){var fr=$('#wsi-gm-form iframe');try{d=fr&&fr.contentDocument;}catch(e){d=null;}}
      if(!d||d.getElementById('wsi-gm-css'))return;
      var s=d.createElement('style');s.id='wsi-gm-css';s.textContent='.hs_submit .actions,.submitted-message{text-align:center!important;}';(d.head||d.body).appendChild(s);}
    if(window.hbspt&&hbspt.forms&&hbspt.forms.create)create();
    else{var s=document.createElement('script');s.charset='utf-8';s.src='https://js-na2.hsforms.net/forms/embed/v2.js';s.onload=create;document.head.appendChild(s);}}
  function openGate(t){pending=t;gateFocus=document.activeElement;buildForm();
    gm.classList.remove('form-in');gm.classList.add('active');document.body.style.overflow='hidden';$('#wsi-gm-x').focus();
    clearTimeout(formTimer);formTimer=setTimeout(function(){gm.classList.add('form-in');},FORM_DELAY);}
  function closeGate(){clearTimeout(formTimer);gm.classList.remove('active','form-in');document.body.style.overflow='';if(gateFocus)gateFocus.focus();}
  function unlock(){if(unlocked)return;unlocked=true;try{localStorage.setItem(KEY,'1');}catch(e){}closeGate();openVideo(pending);}

  // Pop-up player
  var vm=$('#wsi-vm'),vmIf=$('#wsi-vm-if'),lastFocus=null,DEF_TITLE=$('#wsi-vm-t').textContent;
  function fmt(s){s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  function chapterName(t){var n='',best=-1;$$('.wsi-ch',page).forEach(function(c){var s=+c.querySelector('.wsi-ts').dataset.t;if(t>=s&&s>best){best=s;n=c.querySelector('h3').textContent;}});return n;}
  function openVideo(start,end,label){
    start=Math.floor(start||0);
    if(gm&&!unlocked){openGate(start);return;}
    if(gated&&!unlocked){start=PS;end=PE;label=label||'2-min preview';}
    lastFocus=document.activeElement;
    vmIf.src='https://www.youtube.com/embed/'+VID+'?autoplay=1&rel=0&start='+start+(end?'&end='+end:'');
    var name=label||(start?chapterName(start):'')||DEF_TITLE;
    $('#wsi-vm-t').textContent=name+(start&&!end?' · from '+fmt(start):'');
    $('#wsi-vm-yt').href='https://youtu.be/'+VID+(start?'?t='+start:'');
    vm.classList.add('open');document.body.style.overflow='hidden';$('#wsi-vm-x').focus();
  }
  function closeVideo(){vm.classList.remove('open');vmIf.src='about:blank';document.body.style.overflow='';if(lastFocus)lastFocus.focus();}
  $('#wsi-vm-x').addEventListener('click',closeVideo);
  vm.addEventListener('click',function(e){if(e.target===vm)closeVideo();});
  document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;
    if(vm.classList.contains('open'))closeVideo();else if(gm&&gm.classList.contains('active'))closeGate();});
  page.addEventListener('click',function(e){
    if(e.target.closest('#wsi-vm-yt'))return;
    var v=e.target.closest('[data-vid]');
    if(v){e.preventDefault();openVideo(+v.dataset.vid,v.dataset.end?+v.dataset.end:0,v.dataset.label);return;}
    var ch=e.target.closest('.wsi-ch');
    var t=e.target.closest('a[data-t]')||(ch&&ch.querySelector('a[data-t]'));   // timestamps are real youtu.be links; JS opens them in place (whole chapter row plays too)
    if(t){e.preventDefault();openVideo(+t.dataset.t);return;}
    if(e.target.closest('[data-play]')){e.preventDefault();openVideo(0);return;}
  });
})();
