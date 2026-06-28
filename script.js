document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. LOADING SCREEN
    // ============================================================
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hidden'), 900);
    });

    // ============================================================
    // 2. CUSTOM CURSOR
    // ============================================================
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
        follower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    document.querySelectorAll('a, button, .glass-card, .cert-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            follower.style.width = '64px';
            follower.style.height = '64px';
            follower.style.backgroundColor = 'rgba(0,229,255,0.08)';
        });
        el.addEventListener('mouseleave', () => {
            follower.style.width = '36px';
            follower.style.height = '36px';
            follower.style.backgroundColor = 'transparent';
        });
    });

    // ============================================================
    // 3. SCROLL PROGRESS BAR  (tracks main-content scroll)
    // ============================================================
    const scrollProgress = document.getElementById('scroll-progress');
    const mainContent = document.getElementById('main-content');
    const backToTop = document.getElementById('back-to-top');

    mainContent.addEventListener('scroll', () => {
        const scrolled = mainContent.scrollTop;
        const total = mainContent.scrollHeight - mainContent.clientHeight;
        scrollProgress.style.width = `${(scrolled / total) * 100}%`;

        // Back to top button
        if (scrolled > 400) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
    });

    backToTop.addEventListener('click', () => {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================================================
    // 4. TYPING ANIMATION
    // ============================================================
    const typingEl = document.getElementById('typing-text');
    const roles = [
        'Cyber Security Enthusiast',
        'Full Stack Developer',
        'Vibe Coding Explorer',
        'BSIT Student @ Air Uni'
    ];
    let roleIdx = 0, charIdx = 0, isDeleting = false, typeSpeed = 100;

    function type() {
        const current = roles[roleIdx];
        typingEl.textContent = isDeleting
            ? current.substring(0, charIdx - 1)
            : current.substring(0, charIdx + 1);

        isDeleting ? charIdx-- : charIdx++;
        typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIdx === current.length) {
            isDeleting = true;
            typeSpeed = 2200;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            typeSpeed = 450;
        }
        setTimeout(type, typeSpeed);
    }
    type();

    // ============================================================
    // 5. PARTICLE BACKGROUND
    // ============================================================
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.color = Math.random() > 0.5 ? '#00e5ff' : '#7c3aed';
            this.alpha = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        }
        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 90; i++) particles.push(new Particle());

    (function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    })();

    // ============================================================
    // 6. SCROLL REVEAL & SKILL BAR ANIMATIONS
    //    (observes inside the scrollable main-content column)
    // ============================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('revealed');

            // Animate skill bars
            if (entry.target.classList.contains('skill-card')) {
                const fill = entry.target.querySelector('.skill-fill');
                if (fill) fill.style.width = entry.target.dataset.skill + '%';
            }

            // Animate stat counters
            const num = entry.target.querySelector('.stat-number');
            if (num && !num.dataset.animated) {
                num.dataset.animated = '1';
                animateCount(num, parseInt(num.dataset.count));
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
        root: mainContent   // observe within scrollable container
    });

    document.querySelectorAll('[data-reveal], .skill-card, .stat-card').forEach(el => {
        revealObserver.observe(el);
    });

    function animateCount(el, target) {
        let current = 0;
        const step = target / (1800 / 16);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { el.textContent = target; clearInterval(timer); }
            else el.textContent = Math.floor(current);
        }, 16);
    }

    // ============================================================
    // 7. ACTIVE NAV LINK TRACKING (sidebar)
    //    Uses IntersectionObserver on sections inside main-content
    // ============================================================
    const sections = document.querySelectorAll('.main-content section[id]');
    const navLinks = document.querySelectorAll('.sidebar-nav a');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.remove('active'));
                const active = document.querySelector(`.sidebar-nav a[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, {
        root: mainContent,
        threshold: 0.3,
        rootMargin: '-10% 0px -60% 0px'
    });

    sections.forEach(s => navObserver.observe(s));

    // ============================================================
    // 8. SMOOTH SCROLL FOR SIDEBAR LINKS
    // ============================================================
    document.querySelectorAll('.sidebar-nav a, .sidebar-cta-outline, footer a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ============================================================
    // 9. CERTIFICATE MODAL
    // ============================================================
    const modal = document.getElementById('certModal');
    const modalFrame = document.getElementById('modalFrame');

    window.openCertModal = function(fileSrc) {
        modal.style.display = 'block';
        modalFrame.src = fileSrc;
        document.body.style.overflow = 'hidden';
        if (cursor) cursor.style.display = 'none';
        if (follower) follower.style.display = 'none';
    };

    window.closeCertModal = function() {
        modal.style.display = 'none';
        modalFrame.src = '';
        document.body.style.overflow = 'auto';
        if (cursor) cursor.style.display = 'block';
        if (follower) follower.style.display = 'block';
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeCertModal();
    });

    // ============================================================
    // 10. CONTACT FORM
    // ============================================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const original = btn.innerHTML;
            btn.innerHTML = '<span>Sent!</span><i class="fas fa-check"></i>';
            btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
            contactForm.reset();
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
            }, 3000);
        });
    }

});
