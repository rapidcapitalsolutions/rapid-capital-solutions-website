(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  function closeMenu() {
    if (!navLinks || !toggle) return;
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
  }

  function openMenu() {
    if (!navLinks || !toggle) return;
    navLinks.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('nav-open');
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) closeMenu();
      else openMenu();
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  document.querySelectorAll('.faq-q').forEach((btn, idx) => {
    const item = btn.closest('.faq-item');
    const answer = item && item.querySelector('.faq-a');
    if (!answer) return;
    const aid = 'faq-a-' + idx;
    answer.id = aid;
    btn.setAttribute('aria-controls', aid);
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((el) => {
        el.classList.remove('open');
        const a = el.querySelector('.faq-a');
        const q = el.querySelector('.faq-q');
        if (a) a.style.maxHeight = null;
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  const form = document.getElementById('apply-form');
  if (form && !document.getElementById('rcs-apply-form')) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = 'apply.html';
    });
  }

  const heroSlider = document.getElementById('hero-amount-slider');
  const heroDisplay = document.getElementById('hero-amount-display');
  const heroApplyBtn = document.getElementById('hero-apply-btn');
  if (heroSlider && heroDisplay) {
    const amounts = [5000, 100000, 250000, 500000, 5000000];
    const formatAmount = (n) => '$' + n.toLocaleString('en-US');

    const syncHeroAmount = () => {
      const idx = Math.max(0, Math.min(amounts.length - 1, parseInt(heroSlider.value, 10) || 0));
      const val = amounts[idx];
      heroDisplay.textContent = formatAmount(val);
      heroSlider.setAttribute('aria-valuenow', String(idx));
      heroSlider.setAttribute('aria-valuetext', formatAmount(val));
      if (heroApplyBtn) {
        heroApplyBtn.href = 'apply.html?amount=' + encodeURIComponent(String(val));
      }
    };

    heroSlider.addEventListener('input', syncHeroAmount);
    heroSlider.addEventListener('change', syncHeroAmount);
    syncHeroAmount();
  }
})();
