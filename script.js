/* ============================================================
   script.js — Cinematic Luxury Portfolio
   Suleman Saqib · 2026
============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── Reduced-motion preference ──────────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth <= 900;

  // ============================================================
  // 1. LOADING SCREEN
  // ============================================================
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 800);
  });

  // ============================================================
  // 2. LENIS SMOOTH SCROLL
  // ============================================================
  let lenis = null;

  if (!prefersReducedMotion && !isMobile() && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      wrapper: document.getElementById('main-content'),
      content: document.getElementById('main-content'),
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function rafLoop(time) {
      lenis.raf(time);
      requestAnimationFrame(rafLoop);
    }
    requestAnimationFrame(rafLoop);
  }

  // Scroll helper — works whether Lenis is active or not
  function getScrollEl() {
    return document.getElementById('main-content');
  }

  // ============================================================
  // 3. CUSTOM CURSOR — gold dot + expanding ring
  // ============================================================
  const cursor    = document.getElementById('cursor');
  const follower  = document.getElementById('cursor-follower');

  if (!isMobile() && cursor && follower) {
    document.addEventListener('mousemove', e => {
      cursor.style.transform   = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      follower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    const hoverTargets = document.querySelectorAll(
      'a, button, .glass-card, .cert-card, .project-card, .service-card, .social-btn, .theme-toggle'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => follower.classList.add('hovered'));
      el.addEventListener('mouseleave', () => follower.classList.remove('hovered'));
    });
  }

  // ============================================================
  // 3.5 THEME TOGGLE (Luxury Dark & Luxury Light)
  // ============================================================
  const themeToggle = document.getElementById('theme-toggle');

  function updateThemeUI(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (!icon) return;
    if (theme === 'light') {
      icon.className = 'fas fa-moon';
      themeToggle.setAttribute('aria-label', 'Switch to dark theme');
      themeToggle.setAttribute('title', 'Switch to dark theme');
    } else {
      icon.className = 'fas fa-sun';
      themeToggle.setAttribute('aria-label', 'Switch to light theme');
      themeToggle.setAttribute('title', 'Switch to light theme');
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeUI(theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateThemeUI(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(activeTheme);
    });
  }

  // ============================================================
  // 4. NAVBAR — scroll effect + active link tracking
  // ============================================================
  const navbar       = document.getElementById('navbar');
  const navLinksAll  = document.querySelectorAll('.nav-links a');
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTop    = document.getElementById('back-to-top');
  const mainContent  = document.getElementById('main-content');

  // Use either the main-content scroller (desktop) or window (mobile)
  function addScrollListener(handler) {
    if (!isMobile()) {
      mainContent.addEventListener('scroll', handler, { passive: true });
    } else {
      window.addEventListener('scroll', handler, { passive: true });
    }
  }

  function getScrollTop() {
    return isMobile()
      ? window.scrollY || document.documentElement.scrollTop
      : mainContent.scrollTop;
  }
  function getScrollHeight() {
    return isMobile()
      ? document.documentElement.scrollHeight - window.innerHeight
      : mainContent.scrollHeight - mainContent.clientHeight;
  }

  addScrollListener(() => {
    const scrolled = getScrollTop();
    const total    = getScrollHeight();

    // Progress bar
    if (scrollProgress && total > 0) {
      scrollProgress.style.width = `${(scrolled / total) * 100}%`;
    }

    // Navbar style
    if (scrolled > 40) navbar.classList.add('scrolled');
    else               navbar.classList.remove('scrolled');

    // Back to top visibility
    if (backToTop) {
      if (scrolled > 500) backToTop.classList.add('visible');
      else                backToTop.classList.remove('visible');
    }
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.5 });
      else       mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active nav link via IntersectionObserver
  const sections = document.querySelectorAll('.main-content section[id]');
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinksAll.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, {
    root:       isMobile() ? null : mainContent,
    threshold:  0.3,
    rootMargin: '-10% 0px -55% 0px',
  });
  sections.forEach(s => navObserver.observe(s));

  // ============================================================
  // 5. MOBILE MENU TOGGLE
  // ============================================================
  const menuToggle  = document.getElementById('menu-toggle');
  const navLinksList = document.getElementById('nav-links');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinksList.classList.toggle('active');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinksList.classList.remove('active');
      });
    });
  }

  // ============================================================
  // 6. SMOOTH SCROLL for anchor links (fallback when Lenis not active)
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, { duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============================================================
  // 7. TYPING ANIMATION
  // ============================================================
  const typingEl = document.getElementById('typing-text');
  if (typingEl) {
    const roles = [
      'Pen Tester',
      'Blue Teamer',
      'Full Stack Developer',
      '3D Web Builder',
      'BSIT @ Air Uni',
    ];
    let roleIdx = 0, charIdx = 0, isDeleting = false, typeSpeed = 100;

    function type() {
      const current = roles[roleIdx];
      typingEl.textContent = isDeleting
        ? current.substring(0, charIdx - 1)
        : current.substring(0, charIdx + 1);

      isDeleting ? charIdx-- : charIdx++;
      typeSpeed = isDeleting ? 48 : 100;

      if (!isDeleting && charIdx === current.length) {
        isDeleting = true; typeSpeed = 2400;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typeSpeed = 420;
      }
      setTimeout(type, typeSpeed);
    }
    type();
  }

  // ============================================================
  // 8. THREE.JS HERO — Wireframe Icosahedron + Particle Network
  // ============================================================
  function initThreeHero() {
    if (prefersReducedMotion || isMobile()) return;
    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    renderer.setClearColor(0x000000, 0);

    // Scene & Camera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      canvas.parentElement.clientWidth / canvas.parentElement.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    // ── Gold colour ──
    const GOLD      = 0xD4AF37;
    const GOLD_DIM  = 0x8C6D4F;

    // ── 1. Wireframe icosahedron (core) ──
    const icoGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: GOLD,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    // ── 2. Inner smaller icosahedron (depth) ──
    const ico2 = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.0, 1),
      new THREE.MeshBasicMaterial({
        color: GOLD_DIM,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      })
    );
    scene.add(ico2);

    // ── 3. Particle nodes on a sphere surface ──
    const PARTICLE_COUNT = 120;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const RADIUS = 2.8;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Distribute evenly on sphere using golden-ratio spiral
      const phi   = Math.acos(1 - 2 * (i + 0.5) / PARTICLE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      positions[i * 3]     = RADIUS * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = RADIUS * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = RADIUS * Math.cos(phi);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: GOLD,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── 4. Connection lines between nearby particles ──
    const LINE_THRESHOLD = 1.4; // max distance to draw a line
    const linePositions = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const ax = positions[i * 3], ay = positions[i * 3 + 1], az = positions[i * 3 + 2];
        const bx = positions[j * 3], by = positions[j * 3 + 1], bz = positions[j * 3 + 2];
        const dist = Math.sqrt(
          (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2
        );
        if (dist < LINE_THRESHOLD) {
          linePositions.push(ax, ay, az, bx, by, bz);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(linePositions), 3)
    );
    const lineMat = new THREE.LineBasicMaterial({
      color: GOLD_DIM,
      transparent: true,
      opacity: 0.22,
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    // ── 5. Mouse parallax ──
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    canvas.parentElement.addEventListener('mousemove', e => {
      const rect = canvas.parentElement.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    });

    // ── 6. Resize handler ──
    function onResize() {
      if (isMobile()) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // ── 7. Animation loop ──
    let frameId;
    function animate(time) {
      frameId = requestAnimationFrame(animate);

      // Slow rotation
      ico.rotation.x  += 0.0025;
      ico.rotation.y  += 0.0040;
      ico2.rotation.x -= 0.0018;
      ico2.rotation.y -= 0.0028;
      particles.rotation.y += 0.0015;
      lineSegments.rotation.y += 0.0015;

      // Smooth parallax tilt
      targetX += (mouseX * 0.4 - targetX) * 0.04;
      targetY += (mouseY * 0.3 - targetY) * 0.04;
      scene.rotation.y = targetX;
      scene.rotation.x = -targetY;

      // Pulsing opacity for particles
      const pulse = 0.7 + 0.15 * Math.sin(time * 0.001);
      particleMat.opacity = pulse;

      renderer.render(scene, camera);
    }
    // ── 8. Theme synchronization for 3D hero ──
    function updateThreeColors(theme) {
      const isLight = theme === 'light';
      const mainGold = isLight ? 0xA67C1E : GOLD;
      const dimGold  = isLight ? 0x785637 : GOLD_DIM;
      if (icoMat) {
        icoMat.color.setHex(mainGold);
        icoMat.opacity = isLight ? 0.65 : 0.55;
      }
      if (ico2 && ico2.material) {
        ico2.material.color.setHex(dimGold);
        ico2.material.opacity = isLight ? 0.35 : 0.25;
      }
      if (particleMat) {
        particleMat.color.setHex(mainGold);
      }
      if (lineMat) {
        lineMat.color.setHex(dimGold);
        lineMat.opacity = isLight ? 0.35 : 0.22;
      }
    }

    // Apply current theme on Three.js load
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (currentTheme === 'light') {
      updateThreeColors('light');
    }

    window.addEventListener('themechange', e => {
      updateThreeColors(e.detail.theme);
    });

    // Stop rendering when hero is not visible (perf)
    const heroObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          cancelAnimationFrame(frameId);
        } else {
          animate(0);
        }
      });
    }, { threshold: 0.1, root: isMobile() ? null : mainContent });
    heroObserver.observe(document.getElementById('hero'));
  }

  // Lazy-init Three.js after first load event settles
  window.addEventListener('load', () => {
    requestAnimationFrame(() => requestAnimationFrame(initThreeHero));
  });

  // ============================================================
  // 9. SCROLL REVEAL — blur + fade + slide (staggered children)
  // ============================================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');

      // Trigger children stagger inside this element
      entry.target.querySelectorAll('[data-reveal-child]').forEach(child => {
        child.classList.add('revealed');
      });

      // Animate stat counters
      const num = entry.target.querySelector('.stat-number');
      if (num && !num.dataset.animated) {
        num.dataset.animated = '1';
        animateCount(num, parseInt(num.dataset.count, 10));
      }
      entry.target.querySelectorAll('.stat-number').forEach(n => {
        if (!n.dataset.animated) {
          n.dataset.animated = '1';
          animateCount(n, parseInt(n.dataset.count, 10));
        }
      });

      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold:  0.12,
    rootMargin: '0px 0px -40px 0px',
    root:       isMobile() ? null : mainContent,
  });

  document.querySelectorAll('[data-reveal], .stat-card').forEach(el => {
    revealObserver.observe(el);
  });

  // Also observe standalone reveal-child elements not wrapped in a data-reveal parent
  const childObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      childObserver.unobserve(entry.target);
    });
  }, {
    threshold:  0.12,
    rootMargin: '0px 0px -40px 0px',
    root:       isMobile() ? null : mainContent,
  });
  document.querySelectorAll('[data-reveal-child]').forEach(el => {
    childObserver.observe(el);
  });

  function animateCount(el, target) {
    let current = 0;
    const duration = 1800;
    const step     = target / (duration / 16);
    const timer    = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  }

  // ============================================================
  // 10. PROJECT CARDS — Scroll-Stack Effect
  // ============================================================
  function initScrollStack() {
    const stack = document.getElementById('projects-stack');
    if (!stack || prefersReducedMotion) return;

    const cards = Array.from(stack.querySelectorAll('.project-card'));
    if (cards.length === 0) return;

    const scrollEl = isMobile() ? window : mainContent;

    function onStackScroll() {
      const stackRect  = stack.getBoundingClientRect();
      const viewH      = isMobile() ? window.innerHeight : mainContent.clientHeight;

      cards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect();
        const cardTop  = isMobile()
          ? cardRect.top
          : cardRect.top - mainContent.getBoundingClientRect().top;

        // How far the card has been scrolled past the center
        const progress = Math.max(0, Math.min(1,
          (viewH * 0.55 - cardTop) / (viewH * 0.6)
        ));

        // Cards behind the current one scale down slightly
        const scale     = 1 - progress * 0.03 * Math.min(i, 2);
        const translateY = progress * -10 * Math.min(i, 3);
        const opacity   = Math.max(0.65, 1 - progress * 0.15);

        // Don't affect the card that's currently active (i = first one not scrolled past)
        if (progress < 0.05) {
          card.style.transform = '';
          card.style.opacity   = '';
        } else {
          card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
          card.style.opacity   = opacity;
        }
      });
    }

    scrollEl.addEventListener('scroll', onStackScroll, { passive: true });
    onStackScroll(); // run once on init
  }
  initScrollStack();

  // ============================================================
  // 11. CERTIFICATE MODAL
  // ============================================================
  const modal      = document.getElementById('certModal');
  const modalFrame = document.getElementById('modalFrame');

  window.openCertModal = function (fileSrc) {
    if (!modal || !modalFrame) return;
    modal.style.display   = 'block';
    modalFrame.src        = fileSrc;
    document.body.style.overflow = 'hidden';
    if (cursor)   cursor.style.display   = 'none';
    if (follower) follower.style.display = 'none';
  };

  window.closeCertModal = function () {
    if (!modal || !modalFrame) return;
    modal.style.display   = 'none';
    modalFrame.src        = '';
    document.body.style.overflow = '';
    if (cursor)   cursor.style.display   = 'block';
    if (follower) follower.style.display = 'block';
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.closeCertModal();
  });

  // ============================================================
  // 12. CONTACT FORM — Real backend via /api/contact
  // ============================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      const btn          = contactForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;
      const nameVal    = contactForm.querySelector('#name')?.value?.trim();
      const emailVal   = contactForm.querySelector('#email')?.value?.trim();
      const messageVal = contactForm.querySelector('#message')?.value?.trim();

      // ── Loading state ──
      btn.disabled  = true;
      btn.innerHTML = '<span>Sending\u2026</span><i class="fas fa-spinner fa-spin"></i>';
      btn.style.opacity = '0.75';

      const oldStatus = contactForm.querySelector('.form-status');
      if (oldStatus) oldStatus.remove();

      try {
        const res  = await fetch('/api/contact', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name: nameVal, email: emailVal, message: messageVal }),
        });
        const data = await res.json();

        if (res.ok && data.ok) {
          // ── Success ──
          btn.innerHTML        = '<span>Message Sent!</span><i class="fas fa-check"></i>';
          btn.style.background = 'linear-gradient(135deg, #4ade80, #16a34a)';
          btn.style.opacity    = '1';
          contactForm.reset();
          setTimeout(() => {
            btn.innerHTML        = originalHTML;
            btn.style.background = '';
            btn.disabled         = false;
          }, 4000);
        } else {
          throw new Error(data.error || 'Something went wrong. Please try again.');
        }

      } catch (err) {
        // ── Network or API failure ──
        btn.innerHTML     = originalHTML;
        btn.style.opacity = '1';
        btn.disabled      = false;

        const statusEl = document.createElement('p');
        statusEl.className = 'form-status';
        statusEl.style.cssText = [
          'margin-top:12px', 'padding:12px 16px',
          'background:rgba(248,113,113,0.08)',
          'border:1px solid rgba(248,113,113,0.25)',
          'border-radius:10px', 'color:#f87171',
          'font-size:13px', 'line-height:1.6',
        ].join(';');
        statusEl.textContent = err.message;
        contactForm.appendChild(statusEl);
        setTimeout(() => statusEl.remove(), 6000);
      }
    });
  }

  // ============================================================
  // 13. PARTICLE CANVAS BACKGROUND (global — behind everything)
  //     Lightweight: only 60 particles, runs always
  // ============================================================
  // Note: We removed the particles canvas from HTML; Three.js handles the hero.
  // The background of the rest of the page is pure CSS.

  // ============================================================
  // 14. WINDOW RESIZE — re-initialise responsive-dependent features
  // ============================================================
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Reinit Lenis decision if needed (simple page reload on breakpoint cross)
      // For robustness — not destructive, just let scroll listeners update
    }, 250);
  });

}); // end DOMContentLoaded
