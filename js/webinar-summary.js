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
    if(gated&&d&&d.type==='hsFormCallback'&&d.eventName==='onFormSubmitted'){unlocked=true;try{localStorage.setItem(KEY,'1');}catch(e){}applyGate();openVideo(0);}});

  // Pop-up player
  var vm=$('#wsi-vm'),vmIf=$('#wsi-vm-if'),lastFocus=null,DEF_TITLE=$('#wsi-vm-t').textContent;
  function fmt(s){s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  function chapterName(t){var n='',best=-1;$$('.wsi-ch',page).forEach(function(c){var s=+c.querySelector('.wsi-ts').dataset.t;if(t>=s&&s>best){best=s;n=c.querySelector('h3').textContent;}});return n;}
  function openVideo(start,end,label){
    start=Math.floor(start||0);
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
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&vm.classList.contains('open'))closeVideo();});
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
