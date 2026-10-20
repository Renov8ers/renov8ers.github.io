/* Renov8ers — script.js (v4)
   Nav, sticky action bar, reveal, before/after, ROI explorer, payment planner,
   gallery lightbox, and the 4-step estimate questionnaire (engine + text/email fallback). */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE_SMS = 'sms:+15169868621?&body=';
  var EMAIL = 'aaronsodaro@gmail.com';

  /* ---- ROI baseline: mirrors STUMF renov8ers engine (ROI_CARDS + PRICE_BOOK, 15% margin) ---- */
  var MARGIN = 1.15, PPSF = 385;
  var JOBS = {
    kitchen:{t:'Kitchen refresh',b:14500,p:6.0}, bath:{t:'Primary bath refresh',b:9800,p:4.2},
    paint:{t:'Interior repaint (whole home)',b:4800,p:3.5,s:1}, flooring:{t:'LVP flooring (main level)',b:11200,p:4.8,s:1},
    basement:{t:'Basement finish',b:24000,p:7.5}, masonry_tile:{t:'Masonry / tile work',b:4560,p:3.0},
    siding:{t:'Siding replacement',b:13500,p:3.2}, roof:{t:'Roof soft-wash + minor repair',b:2900,p:1.9},
    curb:{t:'Curb appeal package',b:3600,p:2.8}, pavers:{t:'Paver driveway / walkway / patio',b:8800,p:3.5},
    deck:{t:'Deck rebuild (composite)',b:16400,p:4.5}, outdoor_kitchen:{t:'Outdoor kitchen',b:18500,p:4.5}
  };
  function r50(x){ return Math.round(x/50)*50; }
  function money(x){ return '$' + Math.round(x).toLocaleString('en-US'); }
  function priceOf(k, sqft){
    var j = JOBS[k], f = j.s ? Math.min(1.8, Math.max(0.6, (sqft||1800)/1800)) : 1, p = j.b*f*MARGIN;
    return {lo:r50(p*.92), hi:r50(p*1.12)};
  }
  function el(tag, cls, text){ var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---- header / nav ---- */
  var hdr = $('hdr'), burger = $('burger'), nav = $('nav'), bar = $('actbar');
  function setNav(open){
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && nav) {
    burger.addEventListener('click', function(){ setNav(!nav.classList.contains('open')); });
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); burger.focus(); } });
  }
  function onScroll(){
    var y = window.scrollY || 0;
    if (hdr) hdr.classList.toggle('scrolled', y > 10);
    if (bar) bar.classList.toggle('show', y > 280);
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---- reveal on scroll ---- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold:.08, rootMargin:'0px 0px -40px 0px'});
    rv.forEach(function(e){ io.observe(e); });
  } else rv.forEach(function(e){ e.classList.add('in'); });

  /* ---- hero ROI card bar ---- */
  var hb = document.querySelector('#hero-roi .bar i');
  if (hb) setTimeout(function(){ hb.style.width = hb.getAttribute('data-w') + '%'; }, 400);

  /* ---- before / after ---- */
  document.querySelectorAll('[data-ba]').forEach(function(ba){
    var range = ba.querySelector('.ba-range'), clip = ba.querySelector('.clip'), handle = ba.querySelector('.ba-handle');
    function set(p){ p = Math.max(0, Math.min(100, p)); clip.style.clipPath = 'inset(0 ' + (100-p) + '% 0 0)'; handle.style.left = p + '%'; }
    set(+range.value || 50);
    range.addEventListener('input', function(){ ba.classList.add('touched'); set(+range.value); });
  });

  /* ---- ROI explorer ---- */
  var xj = $('x-jobs');
  if (xj) {
    var xs = $('x-sqft'), xv = $('x-value'), valTouched = false;
    xv.addEventListener('input', function(){ valTouched = true; renderX(); });
    xs.addEventListener('input', function(){
      if (!valTouched) { var s = +xs.value; if (s >= 400) xv.value = Math.round(s*PPSF/1000)*1000; }
      renderX();
    });
    xj.addEventListener('change', renderX);
    function renderX(){
      var sqft = +xs.value || 1800, hv = +xv.value || sqft*PPSF;
      var picked = [].map.call(xj.querySelectorAll('input:checked'), function(c){ return c.value; });
      var rows = picked.map(function(k){
        var pr = priceOf(k, sqft), lift = hv*JOBS[k].p/100;
        return {k:k, t:JOBS[k].t, lo:pr.lo, hi:pr.hi, p:JOBS[k].p, lift:lift, vpd:lift/((pr.lo+pr.hi)/2)};
      }).sort(function(a,b){ return b.vpd - a.vpd; });
      var res = $('x-results'), tot = $('x-totals');
      res.textContent = ''; tot.textContent = '';
      if (!rows.length) { res.appendChild(el('div','empty','Pick a project to see its numbers.')); return; }
      var mx = rows[0].vpd;
      rows.forEach(function(r, i){
        var d = el('div','res');
        d.appendChild(el('div','rk', String(i+1)));
        var m = el('div'); m.appendChild(el('div','t', r.t));
        m.appendChild(el('div','d', money(r.lo) + ' – ' + money(r.hi) + ' · +' + r.p.toFixed(1) + '% · +' + money(r.lift) + ' lift'));
        d.appendChild(m);
        var v = el('div','vpd','$' + r.vpd.toFixed(2)); v.appendChild(el('small', null, 'per $1'));
        if (r.vpd < 1) v.lastChild.textContent = 'lower return';
        d.appendChild(v);
        var b = el('div','bar'), bi = el('i'); b.appendChild(bi); d.appendChild(b);
        res.appendChild(d);
        requestAnimationFrame(function(){ bi.style.width = Math.max(4, r.vpd/mx*100) + '%'; });
      });
      var lo = 0, hi = 0, p = 0, lift = 0;
      rows.forEach(function(r){ lo += r.lo; hi += r.hi; p += r.p; lift += r.lift; });
      [['Est. total', money(lo) + '–' + money(hi), 1], ['Value boost', '+' + p.toFixed(1) + '%'],
       ['Est. lift', '+' + money(lift), 1], ['Value per $1', '$' + (lift/((lo+hi)/2)).toFixed(2)]].forEach(function(x){
        var m = el('div','metric'); m.appendChild(el('div','k', x[0])); m.appendChild(el('div','v num' + (x[2] ? ' white' : ''), x[1]));
        if (x[0] === 'Est. total') m.lastChild.style.fontSize = '15px';
        tot.appendChild(m);
      });
      $('x-cta').href = 'contact.html?jobs=' + encodeURIComponent(picked.join(',')) + '#estimate';
    }
    renderX();
  }

  /* ---- payment planner ---- */
  var fa = $('fin-amt');
  if (fa) {
    var TERMS = [{m:12,a:0},{m:36,a:.0699},{m:60,a:.0899}];
    function pay(t, m, a){ if (!a) return t/m; var r = a/12; return t*r/(1-Math.pow(1+r,-m)); }
    function renderF(){
      var t = Math.max(0, +fa.value || 0), box = $('fin-opts'); box.textContent = '';
      TERMS.forEach(function(x){
        var o = el('div','fin-opt' + (x.a ? '' : ' zero'));
        o.appendChild(el('div','m', x.m + ' months'));
        var p = el('div','p', money(pay(t,x.m,x.a))); p.appendChild(el('small', null, '/mo')); o.appendChild(p);
        o.appendChild(el('div','a', x.a ? (x.a*100).toFixed(2) + '% APR (example)' : '0% APR'));
        box.appendChild(o);
      });
    }
    fa.addEventListener('input', function(){
      document.querySelectorAll('#fin-presets button').forEach(function(b){ b.setAttribute('aria-pressed','false'); });
      renderF();
    });
    document.querySelectorAll('#fin-presets button').forEach(function(b){
      b.addEventListener('click', function(){
        document.querySelectorAll('#fin-presets button').forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        fa.value = b.getAttribute('data-v'); renderF();
      });
    });
    renderF();
  }

  /* ---- gallery lightbox ---- */
  var lb = $('lightbox');
  if (lb && lb.showModal) {
    document.querySelectorAll('[data-lb]').forEach(function(b){
      b.addEventListener('click', function(){
        lb.querySelector('img').src = b.getAttribute('data-lb');
        lb.querySelector('img').alt = b.getAttribute('data-cap');
        lb.querySelector('p').textContent = b.getAttribute('data-cap');
        lb.showModal();
      });
    });
    lb.querySelector('.x').addEventListener('click', function(){ lb.close(); });
    lb.addEventListener('click', function(e){ if (e.target === lb) lb.close(); });
  }

  /* ---- estimate questionnaire ---- */
  var form = $('est-form');
  if (!form) return;
  var cur = 1, DRAFT = 'r8-est-draft';
  var stepLbl = {1:'Step 1 of 4',2:'Step 2 of 4',3:'Step 3 of 4',4:'Step 4 of 4',done:'Done',fallback:'Almost done'};
  function val(id){ var e = $(id); return e ? e.value.trim() : ''; }
  function showStep(n, noScroll){
    cur = n;
    form.querySelectorAll('.qstep').forEach(function(s){ s.classList.toggle('active', s.getAttribute('data-step') === String(n)); });
    $('qbar').style.width = (typeof n === 'number' ? n*25 : 100) + '%';
    $('qlbl').textContent = stepLbl[n];
    setErr('');
    if (!noScroll) {
      var top = form.getBoundingClientRect().top;
      if (top < 60 || top > window.innerHeight*.5) form.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
      var f = form.querySelector('.qstep.active input, .qstep.active a, .qstep.active select');
      if (f && typeof n === 'number') setTimeout(function(){ try { f.focus({preventScroll:true}); } catch(e){} }, 50);
    }
  }
  function setErr(msg){ var e = $('qerr'); e.textContent = msg || ''; e.classList.toggle('show', !!msg); }
  function flag(ids, bad){ ids.forEach(function(id){ $(id).classList.toggle('invalid', bad.indexOf(id) !== -1); $(id).setAttribute('aria-invalid', bad.indexOf(id) !== -1 ? 'true' : 'false'); }); }
  function validStep(n){
    if (n === 1) {
      var bad = [];
      if (!val('f-name')) bad.push('f-name');
      if (val('f-phone').replace(/\D/g,'').length < 10) bad.push('f-phone');
      if (!val('f-town')) bad.push('f-town');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('f-email'))) bad.push('f-email');
      flag(['f-name','f-phone','f-town','f-email'], bad);
      if (bad.length) { setErr('Please check the highlighted fields: name, a 10-digit phone, town and a valid email.'); $(bad[0]).focus(); return false; }
    }
    if (n === 2) {
      var sq = parseFloat(val('f-sqft'));
      flag(['f-sqft'], sq >= 200 && sq <= 20000 ? [] : ['f-sqft']);
      if (!(sq >= 200 && sq <= 20000)) { setErr('Please enter an approximate square footage (200 – 20,000). A rough guess is fine.'); $('f-sqft').focus(); return false; }
    }
    if (n === 3 && !form.querySelector('#f-jobs input:checked')) { setErr('Pick at least one project you\'re interested in.'); return false; }
    return true;
  }
  form.querySelectorAll('input, select, textarea').forEach(function(e){
    e.addEventListener('input', function(){ e.classList.remove('invalid'); setErr(''); saveDraft(); });
    e.addEventListener('change', saveDraft);
  });
  /* Enter inside a field advances instead of submitting the whole form */
  form.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && typeof cur === 'number' && cur < 4) {
      e.preventDefault(); if (validStep(cur)) showStep(cur + 1);
    }
  });
  form.querySelectorAll('.qnext').forEach(function(b){ b.addEventListener('click', function(){ if (validStep(cur)) showStep(cur + 1); }); });
  form.querySelectorAll('.qback').forEach(function(b){ b.addEventListener('click', function(){ showStep(cur - 1); }); });

  /* live ROI preview on step 3 */
  function preview(){
    var picked = [].map.call(form.querySelectorAll('#f-jobs input:checked'), function(c){ return c.value; });
    var pv = $('qpreview');
    if (!picked.length) { pv.hidden = true; return; }
    var sqft = parseFloat(val('f-sqft')) || 1800, hv = sqft*PPSF, lo = 0, hi = 0, p = 0;
    picked.forEach(function(k){ var pr = priceOf(k, sqft); lo += pr.lo; hi += pr.hi; p += JOBS[k].p; });
    pv.hidden = false; pv.textContent = '';
    pv.appendChild(el('div', null, 'Ballpark for your picks: '));
    pv.appendChild(el('span','big', money(lo) + ' – ' + money(hi)));
    pv.appendChild(el('div', null, 'Projected value lift ≈ +' + money(hv*p/100) + ' (+' + p.toFixed(1) + '%). Your full estimate refines this.'));
  }
  $('f-jobs').addEventListener('change', preview);

  var mediaInput = $('f-media');
  mediaInput.addEventListener('change', function(){
    var fl = $('filelist'); fl.textContent = '';
    [].forEach.call(mediaInput.files, function(f){ fl.appendChild(el('div','filechip', (f.type.indexOf('video') === 0 ? 'Video: ' : 'Photo: ') + f.name)); });
  });

  /* draft persistence + ?jobs= prefill */
  function saveDraft(){
    try {
      var d = {}; ['f-name','f-phone','f-town','f-email','f-htype','f-sqft','f-year','f-stories','f-budget','f-timeline','f-details'].forEach(function(id){ d[id] = $(id).value; });
      d.jobs = [].map.call(form.querySelectorAll('#f-jobs input:checked'), function(c){ return c.value; });
      localStorage.setItem(DRAFT, JSON.stringify(d));
    } catch(e){}
  }
  (function restore(){
    var d = null;
    try { d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch(e){}
    if (d) Object.keys(d).forEach(function(id){ if (id !== 'jobs' && $(id) && d[id]) $(id).value = d[id]; });
    var q = (new URLSearchParams(location.search).get('jobs') || '').split(',').filter(Boolean);
    var jobs = q.length ? q : (d && d.jobs) || [];
    jobs.forEach(function(k){ var c = form.querySelector('#f-jobs input[value="' + k.replace(/[^a-z_]/g,'') + '"]'); if (c) c.checked = true; });
    preview();
  })();

  function gather(){
    return {
      name: val('f-name'), phone: val('f-phone'), email: val('f-email'), town: val('f-town'),
      home_type: val('f-htype'), sqft: val('f-sqft'), year_built: val('f-year'), stories: val('f-stories'),
      jobs: [].map.call(form.querySelectorAll('#f-jobs input:checked'), function(c){ return c.value; }),
      budget: val('f-budget'), timeline: val('f-timeline'), details: val('f-details'), media: [],
      website: $('f-website') ? $('f-website').value : ''
    };
  }
  function enginePost(url, payload, ms){
    var ctrl = new AbortController(), to = setTimeout(function(){ ctrl.abort(); }, ms || 15000);
    return fetch(url.replace(/\/$/, '') + '/api/renov8ers', {
      method:'POST', headers:{'Content-Type':'text/plain'}, body: JSON.stringify(payload), signal: ctrl.signal
    }).then(function(r){ clearTimeout(to); return r.json(); }, function(e){ clearTimeout(to); throw e; });
  }
  function summary(q){
    return 'Hi Renov8ers! I\'d like a free estimate.\nName: ' + q.name + '\nTown: ' + q.town + '\nPhone: ' + q.phone + '\nEmail: ' + q.email
      + '\nHome: ' + q.home_type + ', ' + q.sqft + ' sqft' + (q.year_built ? ', built ' + q.year_built : '') + ', ' + q.stories + ' stories'
      + '\nProjects: ' + q.jobs.map(function(k){ return JOBS[k] ? JOBS[k].t : k; }).join(', ')
      + '\nBudget: ' + q.budget + ' | Timeline: ' + q.timeline + (q.details ? '\nDetails: ' + q.details : '')
      + '\n(Photos to follow in this thread)';
  }
  function fallback(q){
    var s = summary(q);
    $('fb-sms').href = PHONE_SMS + encodeURIComponent(s);
    $('fb-mail').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Free estimate request: ' + q.name + ', ' + q.town) + '&body=' + encodeURIComponent(s);
    showStep('fallback');
  }
  function renderEstimate(est){
    var out = $('est-out'); out.textContent = '';
    if (!est) return;
    var list = (est.recommended && est.recommended.length ? est.recommended : est.items || []).slice(0, 8);
    list.forEach(function(it){
      var row = el('div','est-line'), l = el('div'); l.appendChild(el('b', null, it.title));
      l.appendChild(el('div','muted', '+' + Number(it.boost_pct).toFixed(1) + '% projected value boost'));
      var r = el('div','r', money(it.price_low) + ' – ' + money(it.price_high));
      if (it.value_lift) r.appendChild(el('small', null, '+' + money(it.value_lift) + ' lift'));
      row.appendChild(l); row.appendChild(r); out.appendChild(row);
    });
    var t = est.totals;
    if (t) {
      var row = el('div','est-line'); row.style.borderColor = 'rgba(242,165,45,.5)';
      var l = el('div'); l.appendChild(el('b', null, 'Estimated total'));
      var mid = (t.low + t.high)/2;
      l.appendChild(el('div','muted', '+' + t.boost_pct + '% projected · ' + (mid ? '$' + (t.value_lift/mid).toFixed(2) + ' value per $1' : '')));
      var r = el('div','r', money(t.low) + ' – ' + money(t.high)); r.appendChild(el('small', null, '+' + money(t.value_lift) + ' lift'));
      row.appendChild(l); row.appendChild(r); out.appendChild(row);
    }
    out.appendChild(el('p','fine', 'Estimate only. Final price is confirmed after the contractor sees the job.'));
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    for (var s = 1; s <= 3; s++) if (!validStep(s)) { var bad = s; showStep(bad, true); validStep(bad); return; }
    var q = gather(), btn = $('qsubmit'), label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Running your numbers…';
    var urls = (window.R8_ENGINE_URLS || []).filter(Boolean);
    function reset(){ btn.disabled = false; btn.innerHTML = label; }
    function success(j){
      try { localStorage.removeItem(DRAFT); } catch(e){}
      // The public engine replies with totals only; the full line-item breakdown goes out by text/email.
      renderEstimate(j.estimate || (j.totals ? {totals: j.totals} : null));
      if (j.priceable === false) $('qdone-msg').textContent = 'Thanks! Your project needs a quick look before we can price it honestly. We\'ll call you shortly, or book the $50 ROI walk-around below for a full ranked plan.';
      var files = mediaInput.files && mediaInput.files.length ? mediaInput.files : null;
      showStep('done'); reset();
      if (files && j.estimate_id) {
        var fd = new FormData();
        for (var i = 0; i < files.length; i++) fd.append('files', files[i], files[i].name);
        fd.append('estimate_id', j.estimate_id);
        fetch(j._url + '/api/renov8ers/ingest', {method:'POST', body: fd})
          .then(function(r){ return r.json(); })
          .then(function(x){
            var names = ((x && x.accepted) || []).map(function(f){ return {name: f.name}; });
            if (names.length) return enginePost(j._url, {action:'site-estimate-attach', estimate_id: j.estimate_id, media: names}, 10000);
          }).catch(function(){ /* media optional; estimate already saved */ });
      }
    }
    (function tryNext(i){
      if (i >= urls.length) { reset(); fallback(q); return; }
      var u = urls[i].replace(/\/$/, '');
      enginePost(u, {action:'site-auto-estimate', questionnaire: q}, 20000)
        .then(function(j){ if (j && j.ok) { j._url = u; success(j); } else tryNext(i + 1); })
        .catch(function(){ tryNext(i + 1); });
    })(0);
  });
})();
