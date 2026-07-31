(() => {
  'use strict';

  /* ── 메뉴 ───────────────────────────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  document.querySelectorAll('[data-current-year]').forEach(node => {
    node.textContent = String(new Date().getFullYear());
  });

  /* ── 읽기 진행 표시 ─────────────────────────────────────
     문서 페이지에서 지금 어디쯤 읽고 있는지 위쪽에 가는 선으로 보여 줍니다. */
  const article = document.querySelector('.article-prose, .guide-body');
  if (article && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const track = document.createElement('div');
    track.className = 'read-progress';
    track.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span');
    track.append(fill);
    document.body.prepend(track);

    let ticking = false;
    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      fill.style.width = `${done * 100}%`;
      ticking = false;
    };
    const request = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  }

  /* ── 목차: 지금 읽는 절 표시 ───────────────────────────── */
  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map();
    for (const link of tocLinks) {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) map.set(target, link);
    }

    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      const first = [...map.keys()].find(section => visible.has(section));
      for (const link of tocLinks) link.removeAttribute('aria-current');
      if (first) map.get(first).setAttribute('aria-current', 'true');
    }, { rootMargin: '-92px 0px -62% 0px' });

    for (const section of map.keys()) observer.observe(section);
  }
})();
