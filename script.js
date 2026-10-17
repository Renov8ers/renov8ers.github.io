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

  /* ---- automated estimate questionnaire ---- */
  var form = document.getElementById('est-form');
  if (form) {
    var cur = 1;
    function showStep(n){
      cur = n;
      form.querySelectorAll('.qstep').forEach(function(s){
        s.classList.toggle('active', s.dataset.step == String(n));
      });
      document.querySelectorAll('#qdots .qd').forEach(function(d){
        d.classList.toggle('active', +d.dataset.d <= n);
        d.classList.toggle('done', +d.dataset.d < n);
      });
      form.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
    function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function validStep(n){
      if (n === 1) {
        var ok = val('f-name') && val('f-phone') && val('f-town') && /.+@.+\..+/.test(val('f-email'));
        if (!ok) alert('Please fill in your name, phone, town, and a valid email.');
        return !!ok;
      }
      if (n === 2) {
        var sq = parseFloat(val('f-sqft'));
        if (!(sq >= 200 && sq <= 20000)) { alert('Please enter an approximate square footage.'); return false; }
        return true;
      }
      if (n === 3) {
        var jobs = form.querySelectorAll('#f-jobs input:checked');
        if (!jobs.length) { alert('Pick at least one project you\'re interested in.'); return false; }
        return true;
      }
      return true;
    }
    form.querySelectorAll('.qnext').forEach(function(b){
      b.addEventListener('click', function(){ if (validStep(cur)) showStep(cur + 1); });
    });
    form.querySelectorAll('.qback').forEach(function(b){
      b.addEventListener('click', function(){ showStep(cur - 1); });
    });
    var mediaInput = document.getElementById('f-media');
    if (mediaInput) mediaInput.addEventListener('change', function(){
      var fl = document.getElementById('filelist');
      fl.innerHTML = '';
      Array.prototype.forEach.call(mediaInput.files, function(f){
        var d = document.createElement('div');
        d.className = 'filechip';
        d.textContent = (f.type.indexOf('video') === 0 ? '🎬 ' : '🖼️ ') + f.name;
        fl.appendChild(d);
      });
    });

    function gather(){
      var jobs = [];
      form.querySelectorAll('#f-jobs input:checked').forEach(function(c){ jobs.push(c.value); });
      return {
        name: val('f-name'), phone: val('f-phone'), email: val('f-email'), town: val('f-town'),
        home_type: val('f-htype'), sqft: val('f-sqft'), year_built: val('f-year'), stories: val('f-stories'),
        jobs: jobs, budget: val('f-budget'), timeline: val('f-timeline'),
        details: val('f-details'), media: []
      };
    }
    function enginePost(url, payload, timeoutMs){
      var ctrl = new AbortController();
      var to = setTimeout(function(){ ctrl.abort(); }, timeoutMs || 15000);
      return fetch(url.replace(/\/$/, '') + '/api/renov8ers', {
        method: 'POST', headers: {'Content-Type': 'text/plain'},
        body: JSON.stringify(payload), signal: ctrl.signal
      }).then(function(r){ clearTimeout(to); return r.json(); });
    }
    function viaSms(q){
      var msg = 'Hi Renov8ers! I\'d like a free automated estimate.\n'
        + 'Name: ' + q.name + '\nTown: ' + q.town + '\nPhone: ' + q.phone + '\nEmail: ' + q.email + '\n'
        + 'Home: ' + q.home_type + ', ' + q.sqft + ' sqft\n'
        + 'Projects: ' + q.jobs.join(', ') + '\nBudget: ' + q.budget + ' | Timeline: ' + q.timeline
        + (q.details ? '\nDetails: ' + q.details : '')
        + '\n(Photos to follow in this text thread)';
      window.location.href = 'sms:+15169868621?&body=' + encodeURIComponent(msg);
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!validStep(1) || !validStep(2) || !validStep(3)) { showStep(1); return; }
      var q = gather();
      var btn = document.getElementById('qsubmit');
      btn.disabled = true; btn.textContent = '⚡ Running your numbers…';
      var urls = (window.R8_ENGINE_URLS || []).filter(function(u){ return !!u; });

      function done(ok, estimateId){
        if (ok) {
          /* upload media if any, then show confirmation */
          var files = mediaInput && mediaInput.files.length ? mediaInput.files : null;
          function finish(msg){
            var m = document.getElementById('qdone-msg');
            if (m && msg) m.textContent = msg;
            showStep('done');
          }
          if (files && urls.length) {
            var fd = new FormData();
            for (var i = 0; i < files.length; i++) fd.append('files', files[i], files[i].name);
            fd.append('estimate_id', estimateId || '');
            fetch(urls[0].replace(/\/$/, '') + '/api/renov8ers/ingest', {method: 'POST', body: fd})
              .then(function(r){ return r.json(); })
              .then(function(j){
                var names = ((j && j.accepted) || []).map(function(f){ return {name: f.name}; });
                if (names.length && estimateId) {
                  return enginePost(urls[0], {action: 'site-estimate-attach',
                    estimate_id: estimateId, media: names}, 10000).catch(function(){});
                }
              })
              .catch(function(){ /* media optional - estimate already computed */ })
              .then(function(){ finish(); });
          } else finish();
        } else {
          viaSms(q);
        }
      }

      (function tryNext(i){
        if (i >= urls.length) { done(false); return; }
        enginePost(urls[i], {action: 'site-auto-estimate', questionnaire: q}, 20000)
          .then(function(j){
            if (j && j.ok) done(true, j.estimate_id);
            else tryNext(i + 1);
          })
          .catch(function(){ tryNext(i + 1); });
      })(0);
    });
  }
})();
