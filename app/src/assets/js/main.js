/* ============================================================
   SHIFT STUDIO — behaviours
   ============================================================ */
(function () {
  'use strict';

  /* ---------- rolling text links (nav, buttons) ---------- */
  document.querySelectorAll('[data-roll]').forEach(function (el) {
    var text = el.textContent;
    el.textContent = '';
    var inner = document.createElement('span');
    inner.className = 'roll__inner';
    for (var pass = 0; pass < 2; pass++) {
      var row = document.createElement('span');
      row.className = 'roll__row';
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        var cell = document.createElement('span');
        cell.style.display = 'inline-block';
        if (ch === ' ') { cell.innerHTML = '&nbsp;'; } else { cell.textContent = ch; }
        row.appendChild(cell);
      }
      inner.appendChild(row);
    }
    el.appendChild(inner);
    el.classList.add('roll');
  });

  /* ---------- text reveal (orange wipe) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- fade-up reveal ---------- */
  var fadeEls = document.querySelectorAll('.fadeup');
  if ('IntersectionObserver' in window) {
    var fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); fo.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    fadeEls.forEach(function (el) { fo.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- sticky chips + be-words (works section) ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var bewords = Array.prototype.slice.call(document.querySelectorAll('.beword'));
  if (chips.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-on'); }
      });
    }, { threshold: 0.5 });
    chips.forEach(function (c) { co.observe(c); });
    var bo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-on'); }
      });
    }, { threshold: 0.6 });
    bewords.forEach(function (b) { bo.observe(b); });
  } else {
    chips.forEach(function (c) { c.classList.add('is-on'); });
    bewords.forEach(function (b) { b.classList.add('is-on'); });
  }

  /* ---------- horizontal scroll section ---------- */
  var hs = document.querySelector('.hscroll');
  if (hs) {
    var track = hs.querySelector('.hscroll__track');
    var sticky = hs.querySelector('.hscroll__sticky');
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = hs.getBoundingClientRect();
      var total = hs.offsetHeight - window.innerHeight;
      var progress = Math.min(1, Math.max(0, -r.top / total));
      var maxShift = track.scrollWidth - sticky.clientWidth;
      if (maxShift > 0 && window.innerWidth >= 810) {
        track.style.transform = 'translateX(' + (-progress * maxShift) + 'px)';
      } else {
        track.style.transform = 'none';
      }
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------- marquee pause on hover (a11y nicety) ---------- */
  document.querySelectorAll('.marquee').forEach(function (m) {
    m.addEventListener('mouseenter', function () {
      var t = m.querySelector('.marquee__track');
      if (t) t.style.animationPlayState = 'paused';
    });
    m.addEventListener('mouseleave', function () {
      var t = m.querySelector('.marquee__track');
      if (t) t.style.animationPlayState = 'running';
    });
  });

  /* ---------- gallery: 3D plane ---------- */
  var gallery = document.querySelector('.gallery__plane');
  if (gallery) {
    var tilesData = JSON.parse(document.getElementById('gallery-data').textContent);
    var COLS = 10, ROWS = 6;
    var W = window.innerWidth < 810 ? 240 : 320;
    var GAPX = 40, GAPY = 48;
    var frag = document.createDocumentFragment();
    var idx = 0;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var d = tilesData[idx % tilesData.length];
        idx++;
        var tile = document.createElement('div');
        tile.className = 'gtile';
        var img = document.createElement('div');
        img.className = 'gtile__img';
        img.style.backgroundImage = 'url(' + d.src + ')';
        var cap = document.createElement('div');
        cap.className = 'gtile__cap';
        cap.innerHTML = '<b>' + d.name + '</b><span>' + d.year + '</span>';
        tile.appendChild(img);
        tile.appendChild(cap);
        tile.style.left = (c * (W + GAPX)) + 'px';
        tile.style.top = (r * (W + GAPY)) + 'px';
        frag.appendChild(tile);
      }
    }
    gallery.appendChild(frag);

    var planeW = COLS * (W + GAPX);
    var planeH = ROWS * (W + GAPY);
    var px = 0, py = 0, tx = 0, ty = 0, mx = 0, my = 0, t = 0;
    gallery.parentElement.parentElement.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    var place = function () {
      W = window.innerWidth < 810 ? 240 : 320;
      planeW = COLS * (W + GAPX);
      planeH = ROWS * (W + GAPY);
    };
    window.addEventListener('resize', place);
    (function loop() {
      t += 0.006;
      tx = -Math.sin(t) * (planeW * 0.22) + mx * 60;
      ty = -Math.cos(t * 0.8) * (planeH * 0.12) + my * 40;
      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      gallery.style.transform = 'translate3d(' + (-planeW / 2 + px) + 'px,' + (-planeH / 2 + py) + 'px,0) rotateX(18deg) rotateZ(-6deg)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- contact form ---------- */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var required = form.querySelectorAll('[required]');
      var ok = true;
      required.forEach(function (f) {
        if (!f.value.trim()) { ok = false; f.style.borderColor = 'rgba(251,70,23,.95)'; }
        else { f.style.borderColor = ''; }
      });
      var email = form.querySelector('input[type="email"]');
      if (email && email.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
        ok = false; email.style.borderColor = 'rgba(251,70,23,.95)';
      }
      if (ok) {
        form.classList.add('is-sent');
        form.querySelector('.form__ok').textContent = '( Message sent — we will get back to you soon! )';
      }
    });
  }

  /* ---------- hero parallax ---------- */
  var heroVisual = document.querySelector('.hero__visual');
  if (heroVisual) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroVisual.style.transform = 'translateY(' + y * 0.18 + 'px)';
      }
    }, { passive: true });
  }
})();
