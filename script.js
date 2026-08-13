/* ═══════════════════════════════════════════════════════════════
   CareToIndia.com — JavaScript Interactions
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Navbar scroll behaviour ───────────────────────────────── */
  const navbar = document.getElementById('navbar');

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load

  /* ── Mobile hamburger menu ─────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    // Animate hamburger to X
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.cssText = 'transform: translateY(7px) rotate(45deg)';
      spans[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
      spans[2].style.cssText = 'transform: translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });

  // Close mobile menu on link click
  mobileMenu?.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
    });
  });

  /* ── Smooth scroll for anchor links ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Intersection Observer — Reveal animations ─────────────── */
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe steps
  document.querySelectorAll('.step').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
    revealObserver.observe(el);
  });

  // Observe service cards
  document.querySelectorAll('.service-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
    revealObserver.observe(el);
  });

  // Observe testimonials
  document.querySelectorAll('.testimonial-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.12}s`;
    revealObserver.observe(el);
  });

  // Generic reveal elements
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // Problem section elements
  const problemImage = document.getElementById('problem-image');
  const problemText = document.getElementById('problem-text');
  if (problemImage) revealObserver.observe(problemImage);
  if (problemText) revealObserver.observe(problemText);

  // Why India section
  const whyText = document.getElementById('why-text');
  const whyImage = document.getElementById('why-image');
  if (whyText) revealObserver.observe(whyText);
  if (whyImage) revealObserver.observe(whyImage);

  // CTA box
  const ctaBox = document.getElementById('cta-box');
  if (ctaBox) revealObserver.observe(ctaBox);

  /* ── Counter animation for stats ───────────────────────────── */
  const statsSection = document.getElementById('hero-stats');
  let statsAnimated = false;

  const animateCounters = () => {
    if (statsAnimated) return;
    statsAnimated = true;
    // Stat numbers are text-based (80%, JCI, 48h) — just do a flash-in effect
    document.querySelectorAll('.stat-num').forEach((el, i) => {
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s ease';
        el.style.opacity = '1';
      }, i * 200 + 200);
    });
  };

  // Trigger after page load for hero stats (already visible)
  setTimeout(animateCounters, 800);

  /* ── Contact form submission ───────────────────────────────── */
  const form = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const btnSubmit = document.getElementById('btn-submit');

  // ▶ Paste your deployed Apps Script Web App URL here:
  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz4AYZ7e6NxLp5V7dDsD5FFgXWHL8gpCL8KpmtnpNlJ3FRQeCUFvyKZCnbZxg1dzwPXwg/exec';

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!name) {
      shakeField('name');
      return;
    }

    if (!email || !isValidEmail(email)) {
      shakeField('email');
      return;
    }

    // Animate button → loading state
    const originalBtn = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        style="animation: spin 0.8s linear infinite">
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
      <span>Sending…</span>`;
    btnSubmit.style.opacity = '0.75';

    // Collect all form fields
    const payload = {
      name,
      email,
      phone: document.getElementById('phone').value.trim(),
      cancerType: document.getElementById('cancer-type').value,
      message: document.getElementById('message').value.trim(),
    };

    try {
      // Google Apps Script requires no-cors mode because it redirects;
      // we send the data and treat any response as success.
      await fetch(SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',       // Apps Script redirects; no-cors avoids CORS error
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // ── GA4: Track form submission as a lead conversion ──────
      trackEvent('generate_lead', {
        event_category: 'Contact Form',
        event_label: payload.cancerType || 'Not specified',
        cancer_type: payload.cancerType || 'Not specified',
        value: 1,
        currency: 'USD',
      });

      // Show success state
      form.style.display = 'none';
      formSuccess.classList.add('show');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      console.error('Form submission error:', err);

      // Restore button so user can retry
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalBtn;
      btnSubmit.style.opacity = '1';

      // Show inline error
      let errMsg = document.getElementById('form-error-msg');
      if (!errMsg) {
        errMsg = document.createElement('p');
        errMsg.id = 'form-error-msg';
        errMsg.style.cssText = 'color:#c0392b; font-size:0.85rem; margin-top:8px; text-align:center;';
        btnSubmit.parentNode.insertBefore(errMsg, btnSubmit.nextSibling);
      }
      errMsg.textContent = 'Something went wrong. Please try again or WhatsApp us directly.';
    }
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeField(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderColor = '#e74c3c';
    field.style.animation = 'shake 0.4s ease';
    field.focus();
    setTimeout(() => {
      field.style.animation = '';
    }, 400);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Inject shake keyframes
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
    @keyframes spin-once {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(shakeStyle);

  /* ── Add reveal class to sections on scroll ─────────────────── */
  const sections = document.querySelectorAll('section:not(.hero)');
  sections.forEach(section => {
    section.classList.add('reveal');
    revealObserver.observe(section);
  });

  /* ── Parallax subtle effect on hero ───────────────────────── */
  const heroBg = document.querySelector('.hero-bg-img');
  if (heroBg && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    }, { passive: true });
  }

  /* ── Why-points staggered reveal ──────────────────────────── */
  document.querySelectorAll('.why-point').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    revealObserver.observe(el);

    // Override the observer to handle these specifically
    const wpObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
          wpObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    wpObserver.observe(el);
  });

  console.log('%c✦ CareToIndia.com', 'color: #C9923E; font-size: 20px; font-weight: bold;');
  console.log('%cWorld-class cancer care. Built with care.', 'color: #0A7B8E; font-size: 14px;');

  /* ── Google Analytics 4 — Event Tracking ───────────────────── */

  // Safe wrapper: works even if gtag hasn't loaded yet
  function trackEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }

  // 1. WhatsApp button click
  document.getElementById('wa-float')?.addEventListener('click', () => {
    trackEvent('whatsapp_click', {
      event_category: 'Engagement',
      event_label: 'Floating WhatsApp Button',
    });
  });

  // 2. Footer WhatsApp link
  document.querySelector('.footer-links-col a[href*="wa.me"]')?.addEventListener('click', () => {
    trackEvent('whatsapp_click', {
      event_category: 'Engagement',
      event_label: 'Footer WhatsApp Link',
    });
  });

  // 3. Hero primary CTA — "Get a Free Consultation"
  document.getElementById('hero-cta-primary')?.addEventListener('click', () => {
    trackEvent('cta_click', {
      event_category: 'CTA',
      event_label: 'Hero — Get Free Consultation',
    });
  });

  // 4. Hero ghost CTA — "See How It Works"
  document.getElementById('hero-cta-ghost')?.addEventListener('click', () => {
    trackEvent('cta_click', {
      event_category: 'CTA',
      event_label: 'Hero — See How It Works',
    });
  });

  // 5. Navbar CTA
  document.getElementById('nav-cta')?.addEventListener('click', () => {
    trackEvent('cta_click', {
      event_category: 'CTA',
      event_label: 'Navbar — Talk to a Care Advisor',
    });
  });

  // 6. Scroll depth milestones (25%, 50%, 75%, 100%)
  const scrollMilestones = new Set();
  window.addEventListener('scroll', () => {
    const pct = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    [25, 50, 75, 100].forEach(milestone => {
      if (pct >= milestone && !scrollMilestones.has(milestone)) {
        scrollMilestones.add(milestone);
        trackEvent('scroll_depth', {
          event_category: 'Engagement',
          event_label: `${milestone}%`,
          value: milestone,
        });
      }
    });
  }, { passive: true });

  // 7. Section visibility — track when key sections come into view
  const sectionLabels = {
    'how-it-works':  'How It Works',
    'why-india':     'Why India',
    'services':      'Services',
    'testimonials':  'Testimonials',
    'talk-to-us':    'Contact Form',
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const label = sectionLabels[entry.target.id];
        if (label) {
          trackEvent('section_view', {
            event_category: 'Engagement',
            event_label: label,
          });
          sectionObserver.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.3 });

  Object.keys(sectionLabels).forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

})();
