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
