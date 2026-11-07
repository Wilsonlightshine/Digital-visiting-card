// Chrafty — link-in-bio interactions
// Adds a ripple effect on click/tap for every card and ensures
// full-card clickability without interfering with real navigation.

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

    // subtle press feedback for touch devices
    card.addEventListener('touchstart', () => {
      card.style.transform = 'translateY(-1px) scale(0.99)';
    }, { passive: true });

    card.addEventListener('touchend', () => {
      card.style.transform = '';
    }, { passive: true });
  });
});

// ===== NEW: Double-tap / double-click logo opens the game =====
  const logo = document.getElementById('logo');
  const GAME_URL = 'game.html'; // change to your game page or link

  if (logo) {
    const openGame = () => {
      window.location.href = GAME_URL;      // opens in the same tab
      // window.open(GAME_URL, '_blank');   // use this instead for a new tab
    };

    // Desktop: double click
    logo.addEventListener('dblclick', openGame);

    // Mobile: double tap
    let lastTap = 0;
    logo.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault();
        openGame();
      }
      lastTap = now;
    });
  }
});
