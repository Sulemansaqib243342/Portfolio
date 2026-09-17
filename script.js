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

    document.addEventListener('mousedown', () => {
      cursor.classList.add('clicking');
      follower.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
      cursor.classList.remove('clicking');
      follower.classList.remove('clicking');
    });

    const hoverTargets = document.querySelectorAll(
      'a, button, .glass-card, .cert-card, .project-card, .service-card, .social-btn, .theme-toggle, .sound-toggle, .terminal-launcher, .btn-sm'
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
      if (soundEnabled) playUiSound('toggle');
    });
  }

  // ============================================================
  // 3.6 SOUND EFFECTS ENGINE (Web Audio API — zero network overhead)
  // ============================================================
  let audioCtx = null;
  let soundEnabled = localStorage.getItem('sound_enabled') === 'true'; // Default muted
  const soundToggle = document.getElementById('sound-toggle');

  function updateSoundUI() {
    if (!soundToggle) return;
    const icon = soundToggle.querySelector('i');
    if (soundEnabled) {
      soundToggle.classList.add('active');
      soundToggle.setAttribute('title', 'Mute UI sounds');
      soundToggle.setAttribute('aria-label', 'Mute UI sounds');
      if (icon) icon.className = 'fas fa-volume-up';
    } else {
      soundToggle.classList.remove('active');
      soundToggle.setAttribute('title', 'Enable UI sounds');
      soundToggle.setAttribute('aria-label', 'Enable UI sounds');
      if (icon) icon.className = 'fas fa-volume-mute';
    }
  }
  updateSoundUI();

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('sound_enabled', soundEnabled);
      updateSoundUI();
      if (soundEnabled) playUiSound('toggle');
    });
  }

  function playUiSound(type = 'click') {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'toggle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'terminal') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.start(now);
        osc.stop(now + 0.025);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // Bind subtle sounds to interactive elements
  document.addEventListener('click', e => {
    const target = e.target.closest('button, .btn, .btn-sm, .social-btn, .nav-links a');
    if (target && soundEnabled) {
      playUiSound('click');
    }
  });

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
    if (e.key === 'Escape') {
      window.closeCertModal();
      window.closeCaseStudyModal();
      if (typeof closeTerminal === 'function') closeTerminal();
    }
  });

  // ============================================================
  // 11.5 CASE STUDY MODAL ENGINE
  // ============================================================
  const caseStudyModal = document.getElementById('caseStudyModal');
  const caseStudyBody  = document.getElementById('caseStudyBody');

  const CASE_STUDIES = {
    'case-prompt-injection': {
      badge: 'AI Red-Teaming & LLM Security',
      title: 'Prompt Injection & Automated Adversarial Evaluation',
      client: 'Morphe Labs',
      duration: '4-Week Intensive Red-Team Sprint',
      frameworks: 'OWASP LLM Top 10 · Promptfoo · Groq API',
      overview: 'Conducted an automated adversarial security evaluation targeting an LLM-powered customer assistance bot. Designed multi-turn jailbreak sequences, role-play evasion attacks, and direct system prompt exfiltration probes.',
      stats: [
        { num: '311', lbl: 'Adversarial Test Cases' },
        { num: '86.6%', lbl: 'Baseline Defense Rate' },
        { num: '29', lbl: 'Confirmed Vulnerabilities' },
        { num: '13.4%', lbl: 'Attack Success Rate (ASR)' }
      ],
      breakdown: [
        { cat: 'LLM01: Prompt Injection', attempts: '110 tests', bypasses: '14 bypasses', severity: 'High' },
        { cat: 'LLM06: Sensitive Info Disclosure', attempts: '75 tests', bypasses: '8 bypasses', severity: 'Critical' },
        { cat: 'LLM02: Insecure Output Handling', attempts: '60 tests', bypasses: '4 bypasses', severity: 'Medium' },
        { cat: 'LLM07: System Prompt Leakage', attempts: '40 tests', bypasses: '3 bypasses', severity: 'High' },
        { cat: 'LLM08: Vector DB / RAG Poisoning', attempts: '26 tests', bypasses: '0 bypasses', severity: 'Informational' }
      ],
      takeaways: 'Delivered remediation recommendations including dual-LLM input validation pipelines, constrained output token policies, system prompt isolation delimiters, and regex guardrails for API credentials.'
    },
    'case-smart-analyst': {
      badge: 'Blue Team AI · SOC Automation',
      title: 'AI-Assisted Smart Security Analyst & NSL-KDD Triage',
      client: 'Morphe Labs',
      duration: 'NSL-KDD Dataset Evaluation',
      frameworks: 'Python · Pandas · Ollama / Groq · MITRE ATT&CK',
      overview: 'Engineered an AI-augmented SOC triage reporting pipeline converting raw NSL-KDD network flow telemetry into contextual plain-English incident summaries. Identified model hallucination failure modes and refined classification fidelity through systematic prompt tuning.',
      stats: [
        { num: '76.7%', lbl: 'True-Positive Classification' },
        { num: '+10.0%', lbl: 'Accuracy Gain After Tuning' },
        { num: '3', lbl: 'Evaluation Iterations' },
        { num: '100%', lbl: 'Root-Caused Residual Errors' }
      ],
      breakdown: [
        { cat: 'Iteration 1 (Zero-Shot Baseline)', attempts: '120 Alerts', bypasses: '66.7% TP', severity: 'Baseline' },
        { cat: 'Iteration 2 (Feature Categorization Fix)', attempts: '120 Alerts', bypasses: '72.5% TP', severity: 'Improvement' },
        { cat: 'Iteration 3 (Few-Shot Context Injection)', attempts: '120 Alerts', bypasses: '76.7% TP', severity: 'Optimized' }
      ],
      takeaways: 'Demonstrated that raw LLM alerts hallucinate protocol severity when low-level telemetry lacks normalized feature descriptions. Resolved edge-case confusion in R2L and U2R attacks by augmenting prompt context with MITRE ATT&CK mapping tables.'
    },
    'case-m57-dfir': {
      badge: 'Digital Forensics & Incident Response (DFIR)',
      title: 'M57.biz Corporate Insider Threat Forensics Investigation',
      client: 'Cyberster Capstone',
      duration: 'Dual Capstone Investigation',
      frameworks: 'Autopsy · Volatility 3 · FTK Imager · NIST SP 800-61',
      overview: 'Executed comprehensive forensic examinations across two independent corporate espionage and insider-threat incidents involving disk raw images, volatile memory snapshots, and removable USB media.',
      stats: [
        { num: '2', lbl: 'Forensic Cases Solved' },
        { num: '100%', lbl: 'Cryptographic Hash Match' },
        { num: '1', lbl: 'Exonerated Wronged Employee' },
        { num: '0', lbl: 'Unverified Conjectures' }
      ],
      breakdown: [
        { cat: 'Case 1: CEO Spoofing Investigation', attempts: 'Autopsy EML parser', bypasses: 'Display name mismatch', severity: 'Employee Exonerated' },
        { cat: 'Case 2: Intellectual Property Theft', attempts: 'Volatility 3 + EnCase', bypasses: 'Exact MD5 hash match', severity: 'Exfiltration Proven' }
      ],
      takeaways: 'Strict chain of custody was maintained with SHA-256 verification throughout. Successfully isolated malicious executables from RAM unallocated space while documenting evidentiary gaps to adhere strictly to court-admissible standards.'
    }
  };

  window.openCaseStudy = function (caseId) {
    const data = CASE_STUDIES[caseId];
    if (!data || !caseStudyModal || !caseStudyBody) return;

    let statsHtml = data.stats.map(s => `
      <div class="cs-stat-box">
        <span class="cs-stat-num">${s.num}</span>
        <span class="cs-stat-lbl">${s.lbl}</span>
      </div>
    `).join('');

    let tableRows = data.breakdown.map(r => `
      <tr>
        <td><strong>${r.cat}</strong></td>
        <td>${r.attempts}</td>
        <td>${r.bypasses}</td>
        <td><span class="cs-tag">${r.severity}</span></td>
      </tr>
    `).join('');

    caseStudyBody.innerHTML = `
      <div class="cs-header">
        <span class="cs-badge"><i class="fas fa-shield-alt"></i> ${data.badge}</span>
        <h3 class="cs-title">${data.title}</h3>
        <div class="cs-meta">
          <span><i class="fas fa-building"></i> ${data.client}</span>
          <span><i class="fas fa-clock"></i> ${data.duration}</span>
          <span><i class="fas fa-microchip"></i> ${data.frameworks}</span>
        </div>
      </div>
      <div class="cs-section">
        <h4 class="cs-section-title"><i class="fas fa-crosshairs"></i> Executive Summary &amp; Scope</h4>
        <p class="cs-text">${data.overview}</p>
      </div>
      <div class="cs-grid">
        ${statsHtml}
      </div>
      <div class="cs-section">
        <h4 class="cs-section-title"><i class="fas fa-chart-bar"></i> Empirical Test Matrix &amp; Findings</h4>
        <div class="cs-table-wrap">
          <table class="cs-table">
            <thead>
              <tr>
                <th>Category / Phase</th>
                <th>Volume / Strategy</th>
                <th>Outcome / Score</th>
                <th>Status / Severity</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
      <div class="cs-section">
        <h4 class="cs-section-title"><i class="fas fa-shield-virus"></i> Key Security Takeaways &amp; Hardening</h4>
        <p class="cs-text">${data.takeaways}</p>
      </div>
    `;

    caseStudyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (cursor)   cursor.style.display   = 'none';
    if (follower) follower.style.display = 'none';
  };

  window.closeCaseStudyModal = function (e) {
    if (e && e.target !== caseStudyModal && !e.target.classList.contains('case-study-close')) return;
    if (caseStudyModal) {
      caseStudyModal.classList.remove('active');
      document.body.style.overflow = '';
      if (cursor)   cursor.style.display   = 'block';
      if (follower) follower.style.display = 'block';
    }
  };

  // ============================================================
  // 11.6 CYBERSECURITY CLI TERMINAL WIDGET
  // ============================================================
  const terminalWidget   = document.getElementById('terminal-widget');
  const terminalLauncher = document.getElementById('terminal-launcher');
  const terminalInput    = document.getElementById('terminal-input');
  const terminalOutput   = document.getElementById('terminal-output');
  const terminalCloseBtn = document.getElementById('terminal-x');
  const terminalDotClose = document.getElementById('terminal-dot-close');

  function toggleTerminal() {
    if (!terminalWidget) return;
    const isOpen = terminalWidget.classList.toggle('open');
    terminalWidget.setAttribute('aria-hidden', !isOpen);
    if (isOpen && terminalInput) {
      setTimeout(() => terminalInput.focus(), 150);
      playUiSound('terminal');
    }
  }

  function closeTerminal() {
    if (terminalWidget) {
      terminalWidget.classList.remove('open');
      terminalWidget.setAttribute('aria-hidden', 'true');
    }
  }

  if (terminalLauncher) terminalLauncher.addEventListener('click', toggleTerminal);
  if (terminalCloseBtn) terminalCloseBtn.addEventListener('click', closeTerminal);
  if (terminalDotClose) terminalDotClose.addEventListener('click', closeTerminal);

  // Global hotkey: Ctrl + ` or Backquote
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === '`') {
      e.preventDefault();
      toggleTerminal();
    }
  });

  const CLI_COMMANDS = {
    help: () => `
      <p class="t-line t-gold">&#x2699; Available Shell Commands:</p>
      <p class="t-line"><span class="t-cmd">whoami</span> &mdash; Print operator profile & security clearances</p>
      <p class="t-line"><span class="t-cmd">skills</span> &mdash; List offensive, defensive, and dev toolsets</p>
      <p class="t-line"><span class="t-cmd">projects</span> &mdash; Display featured security architectures</p>
      <p class="t-line"><span class="t-cmd">certs</span> &mdash; Enumerate certified credentials</p>
      <p class="t-line"><span class="t-cmd">scan [target]</span> &mdash; Perform synthetic simulated reconnaissance</p>
      <p class="t-line"><span class="t-cmd">decrypt [hash]</span> &mdash; Run simulated hash identifier & cracking</p>
      <p class="t-line"><span class="t-cmd">matrix</span> &mdash; Toggle cyber rain console effect</p>
      <p class="t-line"><span class="t-cmd">contact</span> &mdash; Quick contact coordinates</p>
      <p class="t-line"><span class="t-cmd">clear</span> &mdash; Wipe current terminal scrollback</p>
    `,
    whoami: () => `
      <p class="t-line t-cyan">Operator: Suleman Saqib</p>
      <p class="t-line">Role: Penetration Tester · Blue Team SOC Analyst · Full Stack Developer</p>
      <p class="t-line">Education: BS Cybersecurity @ Air University Islamabad (2023–2027)</p>
      <p class="t-line">Clearance: SOC L1 Triage / Morphe Labs AI Red-Teaming Capstone</p>
      <p class="t-line t-gold">Status: Available for Security Operations &amp; Engineering Roles</p>
    `,
    skills: () => `
      <p class="t-line t-gold">[Offensive &amp; Penetration Testing]</p>
      <p class="t-line t-dim">Burp Suite Pro, Metasploit, Nmap, Hydra, Hashcat, SQLMap, Gobuster, John the Ripper, WPScan</p>
      <p class="t-line t-cyan">[Defensive &amp; SOC Operations]</p>
      <p class="t-line t-dim">Wazuh SIEM, Suricata IDS/IPS, pfSense, Autopsy DFIR, Volatility 3, Wireshark, MITRE ATT&amp;CK</p>
      <p class="t-line t-green">[Development &amp; Automation]</p>
      <p class="t-line t-dim">Python, Next.js, Three.js, C++, Scapy, Node.js, Flask, Tailwind CSS, Lenis, GSAP</p>
    `,
    projects: () => `
      <p class="t-line t-gold">[01] Nova Robotics &mdash; 3D Interactive Next.js/Three.js Experience</p>
      <p class="t-line t-gold">[02] Toolset Dossier &mdash; Interactive 26-Tool Attack Lifecycle Matrix</p>
      <p class="t-line t-gold">[03] Network Sniffing Tool &mdash; Python + Scapy Live TCP Analyzer</p>
      <p class="t-line t-gold">[04] Evil Twin Simulation &mdash; Rogue AP Captive Portal Testbed</p>
      <p class="t-line t-gold">[05] Event Management System &mdash; Full Stack Ticketing Platform</p>
      <p class="t-line t-gold">[06] Prompt Injection Assessment &mdash; 311 LLM Red-Team Testcases</p>
      <p class="t-line t-gold">[07] AI-Assisted Smart SOC Assistant &mdash; NSL-KDD Triage Pipeline</p>
      <p class="t-line t-gold">[08] M57.biz DFIR Capstones &mdash; Autopsy + Volatility 3 Forensic Solves</p>
    `,
    certs: () => `
      <p class="t-line t-cyan">&bull; Morphe Labs LLM Red-Teaming &amp; AI Analyst Assistant (2026)</p>
      <p class="t-line t-cyan">&bull; Ethical Hacking Essentials (EHE) &mdash; EC-Council (2026)</p>
      <p class="t-line">&bull; Pre Security &amp; Cyber Defense &mdash; TryHackMe (2026)</p>
      <p class="t-line">&bull; Certified Pen Tester Intern &mdash; Security Experts Pvt. Ltd. (2026)</p>
      <p class="t-line">&bull; Blue Team Intern &mdash; Cyberster (2026)</p>
      <p class="t-line">&bull; Penetration Testing Intern &mdash; CodeAlpha (2026)</p>
    `,
    contact: () => `
      <p class="t-line t-gold">Email: sulemansaqib243@gmail.com</p>
      <p class="t-line">Phone: +92 300 0530752</p>
      <p class="t-line">GitHub: https://github.com/Sulemansaqib243342</p>
      <p class="t-line">LinkedIn: https://www.linkedin.com/in/sulemansaqib</p>
    `,
    clear: () => {
      if (terminalOutput) terminalOutput.innerHTML = '';
      return '';
    }
  };

  if (terminalInput) {
    terminalInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const raw = terminalInput.value.trim();
        if (!raw) return;
        terminalInput.value = '';
        playUiSound('terminal');

        const parts = raw.toLowerCase().split(/\s+/);
        const cmd   = parts[0];
        const args  = parts.slice(1);

        const echoLine = document.createElement('p');
        echoLine.className = 't-line';
        echoLine.innerHTML = `<span class="t-prompt">suleman@sec-ops:~$</span> <span class="t-cmd">${raw}</span>`;
        terminalOutput.appendChild(echoLine);

        if (cmd === 'clear') {
          CLI_COMMANDS.clear();
          return;
        }

        if (cmd === 'scan') {
          const target = args[0] || '127.0.0.1';
          const scanEl = document.createElement('div');
          scanEl.innerHTML = `
            <p class="t-line t-dim">Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toLocaleTimeString()} ...</p>
            <p class="t-line t-green">Nmap scan report for ${target}</p>
            <p class="t-line">Host is up (0.00042s latency).</p>
            <p class="t-line t-gold">PORT     STATE SERVICE       VERSION</p>
            <p class="t-line">22/tcp   open  ssh           OpenSSH 8.9p1 Ubuntu</p>
            <p class="t-line">80/tcp   open  http          nginx 1.18.0 (Security Hardened)</p>
            <p class="t-line">443/tcp  open  ssl/https     TLS 1.3 / Strict-Transport-Security</p>
            <p class="t-line">1514/tcp open  wazuh-agent   Wazuh SIEM Active Monitoring</p>
            <p class="t-line t-green">&#x2714; Scan completed: 0 vulnerabilities exploited, defense active.</p>
          `;
          terminalOutput.appendChild(scanEl);
        } else if (cmd === 'decrypt') {
          const hash = args[0] || '5f4dcc3b5aa765d61d8327deb882cf99';
          const decEl = document.createElement('div');
          decEl.innerHTML = `
            <p class="t-line t-dim">Analyzing hash: ${hash}</p>
            <p class="t-line t-gold">Algorithm: MD5 (Length: 32)</p>
            <p class="t-line t-green">Hashcat v6.2.6 &mdash; dictionary attack [rockyou.txt]</p>
            <p class="t-line t-gold">${hash}:password</p>
            <p class="t-line t-green">&#x2714; Recovered plain text in 0.012s: <strong>password</strong></p>
          `;
          terminalOutput.appendChild(decEl);
        } else if (cmd === 'matrix') {
          const matEl = document.createElement('p');
          matEl.className = 't-line t-green';
          matEl.textContent = '01010011 01010101 01001100 01000101 01001101 01000001 01001110 [SECURE ACCESS GRANTED]';
          terminalOutput.appendChild(matEl);
        } else if (CLI_COMMANDS[cmd]) {
          const res = CLI_COMMANDS[cmd]();
          if (res) {
            const resEl = document.createElement('div');
            resEl.innerHTML = res;
            terminalOutput.appendChild(resEl);
          }
        } else {
          const errEl = document.createElement('p');
          errEl.className = 't-line t-red';
          errEl.textContent = `zsh: command not found: ${cmd}. Type 'help' for valid options.`;
          terminalOutput.appendChild(errEl);
        }

        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }
    });
  }

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
      const hpVal      = contactForm.querySelector('input[name="_honeypot"]')?.value || '';

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
          body:    JSON.stringify({ name: nameVal, email: emailVal, message: messageVal, _honeypot: hpVal }),
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
