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
  // Members-only: any play button pops up the HubSpot gate; the video then starts where they clicked
  var gm=$('#wsi-gm'),pending=0,lastFocus=null,formBuilt=false;
  function unlock(){if(unlocked)return;unlocked=true;try{localStorage.setItem(KEY,'1');}catch(e){}applyGate();if(gm)closeGate();openVideo(pending);}
  // Same HubSpot v2 embed as the webinars page gate, built the first time the pop-up opens
  function buildForm(){if(formBuilt)return;formBuilt=true;
    function create(){hbspt.forms.create({region:'na2',portalId:'45700506',formId:'93181f13-b063-4e09-a572-345dbda4b062',target:'#wsi-gm-form',
      onFormReady:function(){var l=$('#wsi-gm-loading');if(l)l.style.display='none';},onFormSubmitted:unlock});}
    if(window.hbspt&&hbspt.forms&&hbspt.forms.create)create();
    else{var s=document.createElement('script');s.charset='utf-8';s.src='https://js-na2.hsforms.net/forms/embed/v2.js';s.onload=create;document.head.appendChild(s);}}
  // Message first, form ~0.8s later (straight to the form when reduced motion is on)
  var formTimer,FORM_DELAY=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?0:800;
  function openGate(t){pending=t;lastFocus=document.activeElement;buildForm();
    gm.classList.remove('form-in');gm.classList.add('active');document.body.style.overflow='hidden';$('#wsi-gm-x').focus();
    clearTimeout(formTimer);formTimer=setTimeout(function(){gm.classList.add('form-in');},FORM_DELAY);}
  function closeGate(){clearTimeout(formTimer);gm.classList.remove('active','form-in');document.body.style.overflow='';if(lastFocus)lastFocus.focus();}
  if(gm){$('#wsi-gm-x').addEventListener('click',closeGate);
    gm.addEventListener('click',function(e){if(e.target===gm)closeGate();});}
  // Fallback when onFormSubmitted doesn't fire directly (same as the hub)
  window.addEventListener('message',function(e){var d=e.data;
    if(gated&&d&&d.type==='hsFormCallback'&&d.eventName==='onFormSubmitted')unlock();});

  // Pop-up player
  var vm=$('#wsi-vm'),vmIf=$('#wsi-vm-if'),DEF_TITLE=$('#wsi-vm-t').textContent;
  function fmt(s){s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  function chapterName(t){var n='',best=-1;$$('.wsi-ch',page).forEach(function(c){var s=+c.querySelector('.wsi-ts').dataset.t;if(t>=s&&s>best){best=s;n=c.querySelector('h3').textContent;}});return n;}
  function openVideo(start,end,label,preview){
    start=Math.floor(start||0);
    if(gated&&!unlocked){
      if(!preview&&gm){openGate(start);return;}   // only [data-preview] buttons play without the form
      start=PS;end=PE;label=label||'2-min preview';}
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
    if(v){e.preventDefault();openVideo(+v.dataset.vid,v.dataset.end?+v.dataset.end:0,v.dataset.label,v.hasAttribute('data-preview'));return;}
    var ch=e.target.closest('.wsi-ch');
    var t=e.target.closest('a[data-t]')||(ch&&ch.querySelector('a[data-t]'));   // timestamps are real youtu.be links; JS opens them in place (whole chapter row plays too)
    if(t){e.preventDefault();openVideo(+t.dataset.t);return;}
    if(e.target.closest('[data-play]')){e.preventDefault();openVideo(0);return;}
  });
})();
