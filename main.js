/* ============================================
   REAGAN WOKORACH PORTFOLIO — MAIN.JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    handleBackToTop();
    highlightNavLink();
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ===== HAMBURGER MENU =====
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // ===== ACTIVE NAV LINK =====
  const sections = document.querySelectorAll('section[id]');
  function highlightNavLink() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
      }
    });
  }

  // ===== BACK TO TOP =====
  const backToTopBtn = document.getElementById('backToTop');
  function handleBackToTop() {
    backToTopBtn.classList.toggle('visible', window.scrollY > 400);
  }
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== FOOTER YEAR =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== ANIMATED COUNTERS =====
  function animateCounter(el, target, duration = 1500) {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('.stat-num[data-count]');
  let countersStarted = false;
  function startCounters() {
    if (countersStarted) return;
    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;
    const rect = heroStats.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      countersStarted = true;
      counterEls.forEach(el => {
        animateCounter(el, parseInt(el.dataset.count));
      });
    }
  }
  window.addEventListener('scroll', startCounters, { passive: true });
  startCounters();

  // ===== SCROLL ANIMATIONS (AOS-like) =====
  const aosElements = document.querySelectorAll('[data-aos]');
  const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay) || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, delay);
        aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  aosElements.forEach(el => aosObserver.observe(el));

  // ===== CONTACT FORM WITH VALIDATION =====
  const form = document.getElementById('contactForm');
  if (form) {
    const nameInput    = document.getElementById('name');
    const emailInput   = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const nameError    = document.getElementById('nameError');
    const emailError   = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    const btnText      = document.getElementById('btnText');
    const btnLoader    = document.getElementById('btnLoader');
    const submitBtn    = document.getElementById('submitBtn');
    const feedback     = document.getElementById('formFeedback');

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function showError(el, msg) { if (el) el.textContent = msg; }
    function clearError(el)     { if (el) el.textContent = ''; }

    function validate() {
      let valid = true;
      clearError(nameError);
      clearError(emailError);
      clearError(messageError);

      if (!nameInput.value.trim()) {
        showError(nameError, 'Please enter your name.');
        valid = false;
      }
      if (!emailInput.value.trim()) {
        showError(emailError, 'Please enter your email.');
        valid = false;
      } else if (!validateEmail(emailInput.value)) {
        showError(emailError, 'Please enter a valid email address.');
        valid = false;
      }
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        showError(messageError, 'Please write at least 10 characters.');
        valid = false;
      }
      return valid;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) return;

      // Show loader
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-block';
      submitBtn.disabled = true;
      feedback.style.display = 'none';

      const formData = new FormData(form);

      try {
        const response = await fetch('php/contact.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        feedback.style.display = 'block';
        if (result.success) {
          feedback.className = 'form-feedback success';
          feedback.textContent = result.message || 'Message sent! I\'ll be in touch soon.';
          form.reset();
        } else {
          feedback.className = 'form-feedback error';
          feedback.textContent = result.message || 'Something went wrong. Please try again.';
        }
      } catch {
        // Fallback: mailto
        const subject = encodeURIComponent(document.getElementById('subject').value || 'Portfolio Inquiry');
        const body = encodeURIComponent(messageInput.value);
        window.location.href = `mailto:wokorachreagan5030@gmail.com?subject=${subject}&body=${body}`;
        feedback.style.display = 'block';
        feedback.className = 'form-feedback success';
        feedback.textContent = 'Opening your email client...';
      } finally {
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
        setTimeout(() => { feedback.style.display = 'none'; }, 6000);
      }
    });

    // Real-time validation
    nameInput.addEventListener('blur', () => {
      if (!nameInput.value.trim()) showError(nameError, 'Please enter your name.');
      else clearError(nameError);
    });
    emailInput.addEventListener('blur', () => {
      if (!emailInput.value.trim()) showError(emailError, 'Please enter your email.');
      else if (!validateEmail(emailInput.value)) showError(emailError, 'Invalid email address.');
      else clearError(emailError);
    });
    messageInput.addEventListener('blur', () => {
      if (messageInput.value.trim().length < 10) showError(messageError, 'Please write at least 10 characters.');
      else clearError(messageError);
    });
  }

  // ===== SMOOTH HOVER PARALLAX ON HERO PHOTO =====
  const heroPhoto = document.querySelector('.hero-photo-ring');
  if (heroPhoto) {
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      const rect = document.querySelector('.hero').getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (e.clientX - rect.left - cx) / cx;
      const dy = (e.clientY - rect.top  - cy) / cy;
      heroPhoto.style.transform = `translateY(${dy * -8}px) translateX(${dx * -4}px)`;
    });
    document.querySelector('.hero')?.addEventListener('mouseleave', () => {
      heroPhoto.style.transform = '';
    });
  }

  // ===== TYPING EFFECT ON HERO (optional) =====
  const roles = ['Cybersecurity Enthusiast', 'Web Developer', 'IT Student', 'Problem Solver'];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingEl = document.querySelector('.hero-sub');
  const originalText = typingEl ? typingEl.textContent : '';

  // Subtle skill-badge rotation in hero area
  function rotateBadge() {
    const badge = document.querySelector('.hero-tag');
    if (!badge) return;
    const msgs = ['Available for Opportunities', 'Open to Internships', 'Seeking Collaborations'];
    let i = 0;
    setInterval(() => {
      badge.style.opacity = '0';
      setTimeout(() => {
        i = (i + 1) % msgs.length;
        badge.textContent = msgs[i];
        badge.style.opacity = '1';
        badge.style.transition = 'opacity 0.5s ease';
      }, 300);
    }, 4000);
  }
  rotateBadge();

  // ===== SKILL TAGS HOVER RIPPLE =====
  document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
      this.style.transition = 'transform 0.15s ease';
    });
    tag.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // ===== SCROLL PROGRESS INDICATOR =====
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; width: 0%;
    background: linear-gradient(to right, #c8a96e, #e8c98a);
    z-index: 9999; transition: width 0.1s linear; pointer-events: none;
  `;
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / total) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });

  // ===== INITIAL CALL =====
  handleScroll();
  highlightNavLink();
});
