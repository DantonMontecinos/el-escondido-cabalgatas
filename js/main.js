/* ═══════════════════════════════════════════
   MAIN JS — El Escondido Cabalgatas
   Vanilla JavaScript — Modular & Clean
   ═══════════════════════════════════════════ */

'use strict';

/**
 * Wait for DOM ready, then initialize all modules
 */
document.addEventListener('DOMContentLoaded', () => {
  Navbar.init();
  MobileMenu.init();
  ScrollReveal.init();
  SmoothScroll.init();
  ContactForm.init();
  Parallax.init();
});

/* ═══════════════════════════════════════════
   NAVBAR MODULE
   Transparent → Solid on scroll
   ═══════════════════════════════════════════ */
const Navbar = (() => {
  const SCROLL_THRESHOLD = 80;
  let navbar;
  let ticking = false;

  function init() {
    navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', onScroll, { passive: true });
    // Set initial state
    update();
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    }
  }

  function update() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  return { init };
})();

/* ═══════════════════════════════════════════
   MOBILE MENU MODULE
   Fullscreen overlay menu
   ═══════════════════════════════════════════ */
const MobileMenu = (() => {
  let toggle;
  let menu;
  let links;
  let isOpen = false;

  function init() {
    toggle = document.getElementById('nav-toggle');
    menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    links = menu.querySelectorAll('.mobile-menu__link');

    toggle.addEventListener('click', toggleMenu);

    // Close on link click
    links.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });
  }

  function toggleMenu() {
    isOpen ? closeMenu() : openMenu();
  }

  function openMenu() {
    isOpen = true;
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('active');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('active');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  return { init };
})();

/* ═══════════════════════════════════════════
   SCROLL REVEAL MODULE
   IntersectionObserver-based animations
   ═══════════════════════════════════════════ */
const ScrollReveal = (() => {
  function init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Make everything visible immediately
      document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => {
        el.classList.add('visible');
      });
      return;
    }

    const options = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all reveal elements
    const elements = document.querySelectorAll('.reveal-up, .reveal-scale');
    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ═══════════════════════════════════════════
   SMOOTH SCROLL MODULE
   Smooth anchor navigation with offset
   ═══════════════════════════════════════════ */
const SmoothScroll = (() => {
  const OFFSET = 80; // navbar height

  function init() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', handleClick);
    });
  }

  function handleClick(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;

    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }

  return { init };
})();

/* ═══════════════════════════════════════════
   CONTACT FORM MODULE
   Basic validation + UX feedback
   ═══════════════════════════════════════════ */
const ContactForm = (() => {
  let form;

  function init() {
    form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    // Real-time validation on blur
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('blur', validateField);
      input.addEventListener('input', clearError);
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Basic validation
    let isValid = true;

    if (!data.name || data.name.trim().length < 2) {
      showError('contact-name', 'Por favor ingresá tu nombre');
      isValid = false;
    }

    if (!data.email || !isValidEmail(data.email)) {
      showError('contact-email', 'Por favor ingresá un email válido');
      isValid = false;
    }

    if (!isValid) return;

    // Loading state
    const btn = document.getElementById('contact-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    // Send to Formspree
    fetch('https://formspree.io/f/xwvgbdaa', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        // Success
        btn.textContent = '¡Enviado! ✓';
        btn.style.backgroundColor = 'var(--color-olive-600)';
        btn.style.borderColor = 'var(--color-olive-600)';
        form.reset();

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
          btn.disabled = false;
        }, 3000);
      } else {
        throw new Error('Error en el envío');
      }
    })
    .catch(() => {
      // Error
      btn.textContent = 'Error al enviar';
      btn.style.backgroundColor = '#c0392b';
      btn.style.borderColor = '#c0392b';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
        btn.disabled = false;
      }, 3000);
    });
  }

  function validateField(e) {
    const input = e.target;
    const value = input.value.trim();

    if (input.required && !value) {
      input.style.borderColor = '#c0392b';
    }

    if (input.type === 'email' && value && !isValidEmail(value)) {
      input.style.borderColor = '#c0392b';
    }
  }

  function clearError(e) {
    e.target.style.borderColor = '';
  }

  function showError(id, message) {
    const input = document.getElementById(id);
    if (input) {
      input.style.borderColor = '#c0392b';
      input.focus();
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  return { init };
})();

/* ═══════════════════════════════════════════
   PARALLAX MODULE
   Subtle parallax on CTA banner
   ═══════════════════════════════════════════ */
const Parallax = (() => {
  let ticking = false;

  function init() {
    // Skip on mobile for performance
    if (window.innerWidth < 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    const bannerBg = document.querySelector('.cta-banner__bg');
    if (bannerBg) {
      const rect = bannerBg.parentElement.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const translate = (progress - 0.5) * 60;
        bannerBg.style.transform = `translateY(${translate}px)`;
      }
    }

    ticking = false;
  }

  return { init };
})();
