(() => {
  const config = window.SUBPATH_SITE_CONFIG || {};
  const eligible = document.documentElement.dataset.adsenseEligible === 'true';
  const client = String(config.adsenseClient || '').trim();
  const validClient = /^ca-pub-\d{16}$/.test(client);

  if (!eligible || config.adsenseEnabled !== true || !validClient) return;
  if (document.querySelector('script[data-subpath-adsense]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.subpathAdsense = 'true';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.appendChild(script);
})();
