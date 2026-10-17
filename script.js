/* Renov8ers — script.js : mobile nav, before/after sliders, reveal-on-scroll, SMS estimate form */
(function(){
  "use strict";

  /* ---- mobile nav ---- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function(e){
      if (e.target.closest('a')) nav.classList.remove('open');
    });
  }

  /* ---- before / after sliders ---- */
  function fitClip(ba){
    var clipImg = ba.querySelector('.clip img');
    if (clipImg) clipImg.style.width = ba.clientWidth + 'px';
  }
  function setBA(ba, pct){
    pct = Math.max(2, Math.min(98, pct));
    var clip = ba.querySelector('.clip');
    var handle = ba.querySelector('.ba-handle');
    if (clip) clip.style.width = pct + '%';
    if (handle) handle.style.left = pct + '%';
  }
  document.querySelectorAll('[data-ba]').forEach(function(ba){
    var range = ba.querySelector('.ba-range');
    fitClip(ba);
    setBA(ba, parseFloat(range.value) || 50);
    range.addEventListener('input', function(){ setBA(ba, parseFloat(range.value)); });
    range.addEventListener('pointerdown', function(){ ba.classList.add('touched'); });
    /* drag anywhere on the image */
    var dragging = false;
    function pctFromEvent(e){
      var r = ba.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      return (x / r.width) * 100;
    }
    ba.addEventListener('pointerdown', function(e){
      if (e.target === range) return;
      dragging = true; ba.setPointerCapture(e.pointerId);
      setBA(ba, pctFromEvent(e));
    });
    ba.addEventListener('pointermove', function(e){
      if (dragging) setBA(ba, pctFromEvent(e));
    });
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
      ba.addEventListener(ev, function(){ dragging = false; });
    });
  });
  window.addEventListener('resize', function(){
    document.querySelectorAll('[data-ba]').forEach(fitClip);
  });

  /* ---- reveal on scroll ---- */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold: 0.12});
    document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function(el){ el.classList.add('in'); });
  }

  /* ---- ticker loop (duplicate content for seamless scroll) ---- */
  var tick = document.getElementById('ticker-track');
  if (tick) tick.innerHTML += tick.innerHTML;

  /* ---- rotating hero specialty ---- */
  var rotWords = ['Masonry & Tile','Kitchens & Baths','Siding & Insulation','Paver Driveways','Outdoor Kitchens','Full Remodels'];
  var rotEl = document.getElementById('rotword');
  if (rotEl) {
    var ri = 0;
    setInterval(function(){
      rotEl.classList.add('rot-out');
      setTimeout(function(){
        ri = (ri + 1) % rotWords.length;
        rotEl.textContent = rotWords[ri];
        rotEl.classList.remove('rot-out');
      }, 320);
    }, 2800);
  }

  /* ---- SMS estimate form (via Renov8ers engine when reachable) ---- */
  var form = document.getElementById('est-form');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('f-name').value.trim();
      var town = document.getElementById('f-town').value.trim();
      var type = document.getElementById('f-type').value;
      var details = document.getElementById('f-details').value.trim();
      var smsBody = 'Hi Renov8ers! I\'d like a free estimate.\n'
        + 'Name: ' + name + '\n'
        + 'Town: ' + town + '\n'
        + 'Project: ' + type
        + (details ? '\nDetails: ' + details : '');

      function viaSms(){
        window.location.href = 'sms:+15169868621?&body=' + encodeURIComponent(smsBody);
      }
      function viaEngine(){
        form.innerHTML = '<div class="form-ok"><div class="big">✅</div>'
          + '<h3>Request received!</h3>'
          + '<p>Thanks ' + name.split(' ')[0] + ' — your request is in our dispatch engine. '
          + 'We\'ll be in touch shortly at a real, honest number.</p></div>';
        window.scrollTo({top: form.offsetTop - 120, behavior: 'smooth'});
      }

      var urls = (window.R8_ENGINE_URLS || []).filter(function(u){ return !!u; });
      var i = 0;
      function tryNext(){
        if (i >= urls.length) { viaSms(); return; }
        var url = urls[i++].replace(/\/$/, '');
        var ctrl = new AbortController();
        var to = setTimeout(function(){ ctrl.abort(); }, 3000);
        /* text/plain avoids a CORS preflight; the engine parses the JSON body */
        fetch(url + '/api/renov8ers', {
          method: 'POST',
          headers: {'Content-Type': 'text/plain'},
          body: JSON.stringify({action: 'site-lead', name: name, town: town,
                                type: type, details: details, source: 'website'}),
          signal: ctrl.signal
        }).then(function(r){ clearTimeout(to); return r.json(); })
          .then(function(j){ (j && j.ok) ? viaEngine() : tryNext(); })
          .catch(function(){ clearTimeout(to); tryNext(); });
      }
      tryNext();
    });
  }
})();
