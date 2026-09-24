/* lexi-insights.js — tabs + video auto-advance for the Lexi AI Insights
   section (css/lexi-insights.css). Shared by index.html and
   philippines.html; moved here from philippines.js. No-ops on pages
   without the section. */
(function(){
  if(!document.querySelector('.ph-lexi-ins-tab')) return;

  /* Lexi AI Insights tabs â€” panels are grid-stacked in CSS (all three
     occupy the same cell) rather than hidden/display:none'd, so the
     box height stays locked to the tallest panel across tab switches.
     That means toggling visibility here, not the `hidden` attribute
     (which would force display:none via the browser's UA stylesheet
     and pull the panel back out of the grid's height calculation).

     Because all three panels stay in the DOM, all three <video>s would
     autoplay at once the moment real <source>s are uncommented â€” only
     one is ever visible, so play/pause them in lockstep with the tab
     switch instead of leaving the other two decoding in the background. */
  var lexiInsTabs = document.querySelectorAll('.ph-lexi-ins-tab');
  var lexiInsPanels = document.querySelectorAll('.ph-lexi-ins-panel');
  var LEXI_INS_ORDER = ['leaders', 'managers', 'employees'];
  var LEXI_INS_IMAGE_MS = 5000;
  var lexiInsImageTimer = null;
  var setLexiInsVideoPlaying = function(panel, shouldPlay){
    var video = panel.querySelector('video.ph-lexi-ins-video-el');
    if(!video) return;
    if(shouldPlay){
      video.currentTime = 0;
      video.play().catch(function(){});
    } else {
      video.pause();
    }
  };
  /* Not every panel has a real clip/image yet, so landing on an empty
     placeholder would stall the cycle there forever. hasRealMedia/
     nextTargetWithMedia walk forward past any placeholder panels to
     the next one that can actually play or display and continue the
     chain â€” remove this skip once every panel has real media, it
     becomes a no-op at that point anyway. */
  var hasRealMedia = function(target){
    var panel = document.querySelector('.ph-lexi-ins-panel[data-lexi-ins-panel="' + target + '"]');
    if(!panel) return false;
    var source = panel.querySelector('video.ph-lexi-ins-video-el source');
    if(source && source.getAttribute('src')) return true;
    return !!panel.querySelector('img.ph-lexi-ins-video-el');
  };
  var nextTargetWithMedia = function(current){
    var index = LEXI_INS_ORDER.indexOf(current);
    for(var i = 1; i <= LEXI_INS_ORDER.length; i++){
      var candidate = LEXI_INS_ORDER[(index + i) % LEXI_INS_ORDER.length];
      if(hasRealMedia(candidate)) return candidate;
    }
    return null;
  };
  var activateLexiInsTab = function(target){
    lexiInsTabs.forEach(function(t){
      var isActive = t.getAttribute('data-lexi-ins-tab') === target;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    var activePanel = null;
    lexiInsPanels.forEach(function(panel){
      var isActive = panel.getAttribute('data-lexi-ins-panel') === target;
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      setLexiInsVideoPlaying(panel, isActive);
      if(isActive) activePanel = panel;
    });
    if(lexiInsImageTimer){
      clearTimeout(lexiInsImageTimer);
      lexiInsImageTimer = null;
    }
    /* Images have no 'ended' event, so drive their auto-advance off a
       fixed timer instead â€” mirrors how a video panel advances itself
       below once its clip finishes playing. */
    if(activePanel && activePanel.querySelector('img.ph-lexi-ins-video-el')){
      lexiInsImageTimer = setTimeout(function(){
        var next = nextTargetWithMedia(target);
        if(next) activateLexiInsTab(next);
      }, LEXI_INS_IMAGE_MS);
    }
  };
  lexiInsTabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      activateLexiInsTab(tab.getAttribute('data-lexi-ins-tab'));
    });
  });
  /* Auto-advance to the next tab when its video finishes â€” leaders ->
     managers -> employees -> back to leaders. Videos aren't set to loop
     for this reason (loop would mean 'ended' never fires). */
  lexiInsPanels.forEach(function(panel){
    var video = panel.querySelector('video.ph-lexi-ins-video-el');
    if(!video) return;
    video.addEventListener('ended', function(){
      var next = nextTargetWithMedia(panel.getAttribute('data-lexi-ins-panel'));
      if(next) activateLexiInsTab(next);
    });
  });
  /* Route the initially-active panel through activateLexiInsTab (rather
     than a plain play/pause loop) so it also arms the image timer when
     that panel's media turns out to be an image, not a video. */
  var lexiInsInitialActive = document.querySelector('.ph-lexi-ins-panel.is-active');
  if(lexiInsInitialActive) activateLexiInsTab(lexiInsInitialActive.getAttribute('data-lexi-ins-panel'));
})();
