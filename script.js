// Chrafty — link-in-bio interactions

// ===== 1) No text selection / long-press menu / inspect shortcuts =====
(function () {
  const block = (e) => e.preventDefault();

  // Long-press selection, right-click menu, drag, copy
  ['contextmenu', 'selectstart', 'dragstart', 'copy', 'cut'].forEach((ev) =>
    document.addEventListener(ev, block, { capture: true })
  );

  // Safety net: if anything still gets selected, clear it immediately
  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      sel.removeAllRanges();
    }
  });

  // Keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S, Ctrl+A)
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    const blocked =
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(k)) ||
      (e.ctrlKey && ['u', 's', 'a'].includes(k)) ||
      (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(k)) ||
      (e.metaKey && ['s', 'a'].includes(k));
    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
})();

// ===== 2) Ripple + press feedback on cards =====
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.link-card');

  cards.forEach((card) => {
    const rippleLayer = card.querySelector('.ripple-layer');

    card.addEventListener('click', (e) => {
      if (!rippleLayer) return;

      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const x = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
      const y = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      rippleLayer.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    });

    card.addEventListener('touchstart', () => {
      card.style.transform = 'translateY(-1px) scale(0.99)';
    }, { passive: true });

    card.addEventListener('touchend', () => {
      card.style.transform = '';
    }, { passive: true });
  });
});

// ===== 3) Double-tap / double-click on logo opens the game =====
(function () {
  const GAME_URL = 'https://wilsonlightshine.github.io/cross-crown/';

  function init() {
    const logo = document.getElementById('logo') || document.querySelector('.brand-logo');
    if (!logo) return;

    let lastTime = 0;

    function go() {
      // guard: never open twice
      if (window.__gameOpenedAt && Date.now() - window.__gameOpenedAt < 1500) return;
      window.__gameOpenedAt = Date.now();
      window.open(GAME_URL, '_blank', 'noopener');
    }

    // Touch, pen and mouse
    logo.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const now = Date.now();
      if (now - lastTime < 500) go();
      lastTime = now;
    });

    // Desktop fallback
    logo.addEventListener('dblclick', go);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ===== 4) UPI button: GPay first, then PhonePe, Paytm, BHIM, then any UPI app =====
// Each app is tried two ways: Android "intent" link, then the app's own link scheme
// (some browsers ignore intent links). If everything fails, the UPI ID is shown to copy.
(function () {
  const PA = 'wilson.prince1435@oksbi';
  const PN = 'Wilson Prince';
  const query = 'pa=' + encodeURIComponent(PA) + '&pn=' + encodeURIComponent(PN) + '&cu=INR';
  const GENERIC = 'upi://pay?' + query;

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inApp = /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Snapchat|Twitter|LinkedInApp|MicroMessenger/i.test(ua) ||
    (isAndroid && /; wv\)/.test(ua));

  // Priority order
  const APPS = isAndroid
    ? [
      { pkg: 'com.google.android.apps.nbu.paisa.user', scheme: 'tez://upi/pay?' + query },   // Google Pay
      { pkg: 'com.phonepe.app', scheme: 'phonepe://pay?' + query },                          // PhonePe
      { pkg: 'net.one97.paytm', scheme: 'paytmmp://pay?' + query },                          // Paytm
      { pkg: 'in.org.npci.upiapp', scheme: 'bhim://pay?' + query }                           // BHIM
    ]
    : [
      { scheme: 'gpay://upi/pay?' + query },
      { scheme: 'phonepe://pay?' + query },
      { scheme: 'paytmmp://pay?' + query }
    ];

  function showToast() {
    if (document.getElementById('upi-toast')) return;
    const t = document.createElement('div');
    t.id = 'upi-toast';
    t.style.cssText =
      'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99;' +
      'width:calc(100% - 32px);max-width:420px;background:#2B2320;color:#fff;' +
      'padding:14px 16px;border-radius:16px;font:500 14px/1.45 Poppins,sans-serif;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:center;';
    t.innerHTML =
      'Could not open a payment app.<br>UPI ID: <b>' + PA + '</b>' +
      (inApp ? '<br><span style="opacity:.8">Tip: open this page in Chrome (⋮ menu → Open in browser).</span>' : '') +
      '<br><button id="upi-copy" style="margin-top:10px;padding:8px 18px;border:0;border-radius:999px;' +
      'background:#EA6A1F;color:#fff;font:600 14px Poppins,sans-serif;">Copy UPI ID</button>';
    document.body.appendChild(t);
    document.getElementById('upi-copy').addEventListener('click', function () {
      const done = () => { this.textContent = 'Copied ✓'; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(PA).then(done, done);
      } else {
        done();
      }
    });
    setTimeout(() => t.remove(), 12000);
  }

  function init() {
    const btn = document.getElementById('card-pay');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      if (!isAndroid && !isIOS) return; // computers: default behaviour
      e.preventDefault();

      const base = location.href.split('#')[0];
      let idx = 0;
      let phase = 'intent'; // Android: 'intent' first, then 'scheme'
      let done = false;
      let timer = null;

      function stop() {
        done = true;
        clearTimeout(timer);
        window.removeEventListener('hashchange', onHash);
        window.removeEventListener('blur', stop);
        window.removeEventListener('pagehide', stop);
        document.removeEventListener('visibilitychange', onVis);
      }
      function onVis() { if (document.hidden) stop(); } // an app opened

      function nextApp() { idx++; phase = 'intent'; go(); }

      // Chrome sends us here when the app is NOT installed -> skip quickly
      function onHash() {
        if (location.hash === '#upi-next') {
          history.replaceState(null, '', base);
          clearTimeout(timer);
          nextApp();
        }
      }

      function go() {
        if (done) return;
        clearTimeout(timer);
        const app = APPS[idx];

        if (!app) {                       // every specific app failed
          location.href = GENERIC;        // let the phone choose any UPI app
          timer = setTimeout(function () {
            if (!document.hidden) showToast();
            stop();
          }, 2500);
          return;
        }

        if (isAndroid && phase === 'intent') {
          location.href = 'intent://pay?' + query +
            '#Intent;scheme=upi;package=' + app.pkg +
            ';S.browser_fallback_url=' + encodeURIComponent(base + '#upi-next') + ';end';
          // browser ignored the intent link -> try the app's own scheme
          timer = setTimeout(function () { phase = 'scheme'; go(); }, 1500);
        } else {
          location.href = app.scheme;
          timer = setTimeout(nextApp, 2200);
        }
      }

      window.addEventListener('hashchange', onHash);
      window.addEventListener('blur', stop);
      window.addEventListener('pagehide', stop);
      document.addEventListener('visibilitychange', onVis);
      go();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
