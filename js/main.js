/* ==========================================================================
   DUO SONUS — main.js
   ========================================================================== */
(function () {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- nav scroll state ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('navBurger');
  var mobileMenu = document.getElementById('navMobile');
  burger.addEventListener('click', function () {
    var open = mobileMenu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      mobileMenu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- images fade in/out both ways as they cross the viewport ---------- */
  var fadeEls = document.querySelectorAll('.fade-img');
  if ('IntersectionObserver' in window) {
    var fadeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.1, rootMargin: '-8% 0px -8% 0px' });
    fadeEls.forEach(function (el) { fadeIO.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- delicate cursor glow (desktop only) ---------- */
  var glow = document.querySelector('.cursor-glow');
  var hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (glow && hasFinePointer) {
    var raf = null;
    document.addEventListener('mousemove', function (e) {
      glow.classList.add('is-active');
      if (raf) return;
      raf = requestAnimationFrame(function () {
        glow.style.setProperty('--mx', e.clientX + 'px');
        glow.style.setProperty('--my', e.clientY + 'px');
        raf = null;
      });
    });
    document.addEventListener('mouseleave', function () {
      glow.classList.remove('is-active');
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (hasFinePointer) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.35 - 2) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- hero video: only show once it can actually play ---------- */
  var heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    heroVideo.addEventListener('canplay', function () {
      heroVideo.classList.add('is-ready');
    });
    heroVideo.addEventListener('error', function () {
      heroVideo.style.display = 'none';
    }, true);
  }

  /* ---------- tour map pins: keyboard/tap friendly tooltip toggle ---------- */
  document.querySelectorAll('.tourmap__pin').forEach(function (pin) {
    pin.addEventListener('click', function () {
      pin.classList.toggle('is-open');
    });
  });

  /* ---------- booking form -> mailto ---------- */
  var form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('bkName').value.trim();
      var email = document.getElementById('bkEmail').value.trim();
      var date = document.getElementById('bkDate').value;
      var type = document.getElementById('bkType').value;
      var location = document.getElementById('bkLocation').value.trim();
      var message = document.getElementById('bkMessage').value.trim();

      var lines = [
        'Name: ' + name,
        'Email: ' + email,
        'Event type: ' + type,
        date ? 'Event date: ' + date : null,
        location ? 'Location: ' + location : null,
        '',
        message
      ].filter(function (l) { return l !== null; });

      var subject = 'Booking Inquiry - Duo Sonus (' + type + ')';
      var mailto = 'mailto:duosonus.accordion@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = mailto;
      form.reset();
    });
  }

})();
