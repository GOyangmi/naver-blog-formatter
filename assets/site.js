(() => {
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
  }

  document.querySelectorAll('[data-current-year]').forEach(node => {
    node.textContent = String(new Date().getFullYear());
  });

  // 긴 안내서 페이지에서 지금 읽고 있는 절을 목차에 표시한다.
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
    }, { rootMargin: '-96px 0px -60% 0px' });

    for (const section of map.keys()) observer.observe(section);
  }
})();
