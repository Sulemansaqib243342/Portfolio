document.addEventListener('DOMContentLoaded', () => {
    // 1. Loading Screen
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1000);
    });

    // 2. Custom Cursor
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
        follower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    document.querySelectorAll('a, button, .glass-card').forEach(link => {
        link.addEventListener('mouseenter', () => {
            follower.style.width = '70px';
            follower.style.height = '70px';
            follower.style.backgroundColor = 'rgba(0, 240, 255, 0.1)';
        });
        link.addEventListener('mouseleave', () => {
            follower.style.width = '35px';
            follower.style.height = '35px';
            follower.style.backgroundColor = 'transparent';
        });
    });

    // 3. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / totalHeight) * 100;
        
        scrollProgress.style.width = `${progress}%`;

        if (scrolled > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (scrolled > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 4. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // 5. Typing Animation
    const typingText = document.getElementById('typing-text');
    const roles = ['Cyber Security Enthusiast', 'Full Stack Developer', 'Vibe Coding Explorer', 'BSIT Student'];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typingText.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }
    type();

    // 6. Particles Background
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = Math.random() > 0.5 ? '#00f0ff' : '#7b2fff';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // 7. Scroll Reveal & Intersection Observers
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it's a skill card, animate the bar
                if (entry.target.classList.contains('skill-card')) {
                    const fill = entry.target.querySelector('.skill-fill');
                    fill.style.width = entry.target.dataset.skill + '%';
                }

                // If it's a stat number, animate count
                if (entry.target.querySelector('.stat-number')) {
                    const num = entry.target.querySelector('.stat-number');
                    const target = parseInt(num.dataset.count);
                    animateCount(num, target);
                }
            }
        });
    }, revealOptions);

    document.querySelectorAll('[data-reveal], .skill-card, .stat-card').forEach(el => {
        revealObserver.observe(el);
    });

    function animateCount(el, target) {
        let current = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, 16);
    }

    // 8. Active Link on Scroll
    const sections = document.querySelectorAll('section');
    const navA = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navA.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').includes(current)) {
                a.classList.add('active');
            }
        });
    });

    // 9. Mouse Parallax for Hero Image
    const heroImage = document.querySelector('.hero-img-wrapper');
    if (heroImage) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            heroImage.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
    }

    // 10. Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>Sent!</span><i class="fas fa-check"></i>';
            btn.style.background = '#28a745';
            contactForm.reset();
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 3000);
        });
    }
    // 11. Certificate Modal
    const modal = document.getElementById('certModal');
    const modalFrame = document.getElementById('modalFrame');
    
    window.openCertModal = function(fileSrc) {
        modal.style.display = "block";
        modalFrame.src = fileSrc;
        document.body.style.overflow = 'hidden'; 
        if(cursor) cursor.style.display = 'none';
        if(follower) follower.style.display = 'none';
    }

    window.closeCertModal = function() {
        modal.style.display = "none";
        modalFrame.src = ""; // Clear src to stop PDF loading
        document.body.style.overflow = 'auto';
        if(cursor) cursor.style.display = 'block';
        if(follower) follower.style.display = 'block';
    }
});
