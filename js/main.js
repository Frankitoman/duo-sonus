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
        // member/repertoire cards replay their cascade every time they cross
        // the viewport; everything else reveals once and stays put
        var repeatable = entry.target.matches('.member-card, .rep-card');
        if (repeatable) {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        } else if (entry.isIntersecting) {
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

  /* ---------- journey accordion: animate height instead of snapping ---------- */
  document.querySelectorAll('.journey__year-group').forEach(function (details) {
    var summary = details.querySelector('summary');
    var panel = details.querySelector('.journey__list');

    summary.addEventListener('click', function (e) {
      e.preventDefault();

      if (details.open) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.offsetHeight; // force reflow so the explicit height is committed first
        requestAnimationFrame(function () {
          panel.style.maxHeight = '0px';
        });
        panel.addEventListener('transitionend', function onClose() {
          details.open = false;
          panel.style.maxHeight = '';
          panel.removeEventListener('transitionend', onClose);
        });
      } else {
        details.open = true;
        var targetHeight = panel.scrollHeight; // read now, while open=true has just forced layout
        panel.style.maxHeight = '0px';
        panel.offsetHeight; // force reflow so 0px is committed before animating up
        requestAnimationFrame(function () {
          panel.style.maxHeight = targetHeight + 'px';
        });
        panel.addEventListener('transitionend', function onOpen() {
          panel.style.maxHeight = '';
          panel.removeEventListener('transitionend', onOpen);
        });
      }
    });
  });

  /* ---------- tour map pins: keyboard/tap friendly tooltip toggle ---------- */
  document.querySelectorAll('.tourmap__pin').forEach(function (pin) {
    pin.addEventListener('click', function () {
      pin.classList.toggle('is-open');
    });
  });

  /* ---------- booking form -> sent automatically via the worker ---------- */
  var form = document.getElementById('bookingForm');
  var status = document.getElementById('bookingStatus');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var payload = {
        name: document.getElementById('bkName').value.trim(),
        email: document.getElementById('bkEmail').value.trim(),
        date: document.getElementById('bkDate').value,
        type: document.getElementById('bkType').value,
        location: document.getElementById('bkLocation').value.trim(),
        message: document.getElementById('bkMessage').value.trim(),
        company: document.getElementById('bkCompany').value
      };

      submitBtn.disabled = true;
      status.textContent = 'Sending…';
      status.classList.remove('is-error');
      status.classList.add('is-visible');

      fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok && result.data.ok) {
            status.textContent = "Thanks! We've received your request and will get back to you soon.";
            form.reset();
          } else {
            throw new Error('send failed');
          }
        })
        .catch(function () {
          status.textContent = "Something went wrong sending that. Please email us directly at duosonus.accordion@gmail.com.";
          status.classList.add('is-error');
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

})();
