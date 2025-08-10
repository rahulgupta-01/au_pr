/**
 * @file Manages all general UI components and interactions for the application.
 * Includes header navigation, theme switching, and other global UI elements.
 */

/**
 * Initializes the header, including the slide-out navigation menu and its accessibility features.
 */
function initializeHeader() {
  const navMenu = document.getElementById('navigation-menu');
  const hamburgerBtn = document.getElementById('hamburger-menu');
  const closeMenuBtn = document.getElementById('close-menu');
  const overlay = document.getElementById('overlay');
  let lastFocusedElement; // Stores the element that opened the menu to return focus to it later.

  const openMenu = () => {
    lastFocusedElement = document.activeElement; // Save the currently focused element.
    document.body.classList.add('menu-is-open'); // Prevent body scroll.
    if (navMenu) {
      navMenu.classList.add('is-open');
      navMenu.removeAttribute('inert'); // Make the menu interactive.
    }
    if (overlay) overlay.classList.add('is-visible');
    // Defer focus to ensure the element is visible and focusable.
    requestAnimationFrame(() => closeMenuBtn && closeMenuBtn.focus());
  };

  // Add event listeners to the menu buttons and overlay.
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu); // closeMenu is defined below.
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Add keyboard controls for the menu.
  document.addEventListener('keydown', (e) => {
    // Allow closing the menu with the 'Escape' key.
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-open')) {
      closeMenu();
    }
    // Trap focus within the menu when it's open.
    if (e.key === 'Tab' && navMenu && navMenu.classList.contains('is-open')) {
      const focusableElements = Array.from(
        navMenu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.hasAttribute('disabled'));
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) { // Handle Shift + Tab for reverse tabbing.
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Handle Tab for forward tabbing.
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });
}

/**
 * Closes the slide-out navigation menu and restores the page state.
 */
export function closeMenu() {
  const navMenu = document.getElementById('navigation-menu');
  const overlay = document.getElementById('overlay');
  const openingElement = document.querySelector('.hamburger-menu');

  document.body.classList.remove('menu-is-open');
  if (navMenu) {
    navMenu.classList.remove('is-open');
    navMenu.setAttribute('inert', '');
  }
  if (overlay) overlay.classList.remove('is-visible');
  if (openingElement) openingElement.focus();
}

/**
 * Initializes the dark/light mode theme switcher.
 */
function initializeTheme() {
  const themeToggle = document.getElementById('dark-mode-toggle');
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.checked = true;
  }
  if (themeToggle) {
    themeToggle.addEventListener('change', function() {
      document.body.classList.toggle('dark-mode', this.checked);
      localStorage.setItem('theme', this.checked ? 'dark' : 'light');
    });
  }
}

/**
 * Creates and manages the "scroll to top" button.
 */
function initializeScrollToTop() {
  if (document.getElementById('scrollToTopBtn')) return;

  const buttonHTML = `<a href="#" id="scrollToTopBtn" class="scroll-to-top-btn" title="Go to top"><i class="fas fa-chevron-up"></i></a>`;
  document.body.insertAdjacentHTML('beforeend', buttonHTML);
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (!scrollToTopBtn) return;

  window.addEventListener('scroll', () => {
    scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
  });

  scrollToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Updates the live clock in the header.
 */
function updateClock() {
  const clockDateEl = document.getElementById('currentDate');
  const clockTimeEl = document.getElementById('currentTime');
  if (clockDateEl && clockTimeEl) {
    const now = new Date();
    const options = { timeZone: 'Australia/Perth' };
    clockDateEl.textContent = now.toLocaleDateString(
      'en-AU',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...options }
    );
    // Minimal AWST suffix exactly like your original
    clockTimeEl.textContent = now
      .toLocaleTimeString('en-AU', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', ...options })
      .toLowerCase() + ' AWST';
  }
}

/**
 * Initializes contact page copy buttons.
 * Keeps the icon; uses the tooltip text to show "Copied!" briefly.
 */
function initializeContactPage() {
  document.querySelectorAll('.copy-btn').forEach(button => {
    if (button.dataset.bound === '1') return;
    button.dataset.bound = '1';
    const tip = button.querySelector('.tooltip-text');
    button.addEventListener('click', () => {
      const text = button.dataset.copy || '';
      navigator.clipboard.writeText(text)
        .then(() => {
          if (tip) {
            const orig = tip.textContent;
            tip.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
              tip.textContent = orig || 'Copy';
              button.classList.remove('copied');
            }, 1200);
          }
        })
        .catch(err => console.error('Failed to copy text: ', err));
    });
  });
}

/**
 * --- FINAL, SIMPLIFIED TOOLTIP FIX ---
 * The logic is now handled by the inline onclick in dashboard.js.
 * This function just adds a global listener to close tooltips when clicking away.
 */
function initializeTooltips() {
  document.addEventListener('click', (e) => {
    // If the click is not on a tooltip wrapper, close all active tooltips
    if (!e.target.closest('.tooltip-wrapper')) {
      document.querySelectorAll('.tooltip-wrapper.is-active').forEach(wrapper => {
        wrapper.classList.remove('is-active');
      });
    }
  });
}

/**
 * Locks required costs on the index page so they are always checked and cannot be unchecked.
 * It matches by label text to avoid changing existing HTML.
 */
function lockRequiredCosts() {
  const REQUIRED = ['Certificate III Course', 'Tools, PPE, White Card'];
  const boxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
  if (!boxes.length) return;

  boxes.forEach(cb => {
    const id = cb.id;
    let label = null;
    if (id) {
      try { label = document.querySelector(`label[for="${CSS.escape(id)}"]`); }
      catch { label = document.querySelector('label[for="' + id + '"]'); }
    }
    if (!label) {
      label = cb.closest('label, .cost-item, li, .item, .form-check') || cb.parentElement;
    }
    const text = (label ? label.textContent : cb.closest('.cost-item')?.textContent || '').trim();
    const mustLock = REQUIRED.some(name => text.includes(name));
    if (!mustLock) return;

    // Force checked
    cb.checked = true;
    cb.setAttribute('aria-checked', 'true');
    cb.dataset.locked = 'true';

    // Block unchecking by mouse/touch/keyboard
    const enforce = (e) => {
      if (cb.dataset.locked === 'true') {
        e.preventDefault();
        cb.checked = true;
        cb.setAttribute('aria-checked', 'true');
      }
    };
    cb.addEventListener('click', enforce, true);
    cb.addEventListener('change', enforce, true);
    cb.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') enforce(e);
    }, true);

    // Prevent label click from toggling
    if (label && label !== cb) {
      label.addEventListener('click', (e) => { e.preventDefault(); }, true);
    }

    // Trigger recalculation if your app listens for change events
    try { cb.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
  });
}

// Highlights the current page in the header + slide-out nav
export function setActiveNavLink(currentPath = location.pathname) {
  const normalize = (p) =>
    (p || '')
      .replace(location.origin, '')
      .split(/[?#]/)[0]
      .replace(/\/index\.html$/i, '/') || '/';

  const current = normalize(currentPath);

  const links = document.querySelectorAll(
    'nav a, #navigation-menu a, header a[data-nav], .site-nav a'
  );

  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) {
      a.classList.remove('active', 'is-active');
      a.removeAttribute('aria-current');
      return;
    }
    let linkPath = href;
    try { linkPath = new URL(href, location.origin).pathname; } catch {}
    const link = normalize(linkPath);
    const isActive = link === current || (link === '/' && current === '/');

    a.classList.toggle('active', isActive);
    a.classList.toggle('is-active', isActive);
    if (isActive) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

/**
 * The main UI initialization function.
 */
export function initializeUI() {
  initializeHeader();
  initializeTheme();
  initializeScrollToTop();
  initializeTooltips();

  // Highlight current nav link on first load
  setActiveNavLink();

  // Lock required costs on the home page
  lockRequiredCosts();

  if (document.getElementById('currentDate')) {
    updateClock();
    setInterval(updateClock, 1000);
  }
  if (document.querySelector('.copy-btn')) {
    initializeContactPage();
  }
}
