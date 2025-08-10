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

  const openMenu = () => {
    document.body.classList.add('menu-is-open');
    if (navMenu) {
      navMenu.classList.add('is-open');
      navMenu.removeAttribute('inert');
    }
    if (overlay) overlay.classList.add('is-visible');
    
    // FIX: Focus the close button without the visual highlight ring
    requestAnimationFrame(() => {
      if (closeMenuBtn) {
        closeMenuBtn.classList.add('programmatic-focus');
        closeMenuBtn.focus();
        setTimeout(() => closeMenuBtn.classList.remove('programmatic-focus'), 100);
      }
    });
  };

  // Add event listeners to the menu buttons and overlay.
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-open')) {
      closeMenu();
    }
    if (e.key === 'Tab' && navMenu && navMenu.classList.contains('is-open')) {
      const focusableElements = Array.from(
        navMenu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.hasAttribute('disabled'));
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
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
  
  if (openingElement) {
    openingElement.classList.add('programmatic-focus');
    openingElement.focus();
    setTimeout(() => openingElement.classList.remove('programmatic-focus'), 100);
  }
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

  const buttonHTML = `<a href="#" id="scrollToTopBtn" class="scroll-to-top-btn" title="Go to top" aria-label="Scroll to top"><i class="fas fa-chevron-up" aria-hidden="true"></i></a>`;
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
    clockTimeEl.textContent = now
      .toLocaleTimeString('en-AU', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', ...options })
      .toLowerCase() + ' AWST';
  }
}

/**
 * Initializes contact page copy buttons.
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
 * Initializes tooltips globally.
 */
function initializeTooltips() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tooltip-wrapper')) {
      document.querySelectorAll('.tooltip-wrapper.is-active').forEach(wrapper => {
        wrapper.classList.remove('is-active');
      });
    }
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
  setActiveNavLink();

  if (document.getElementById('currentDate')) {
    updateClock();
    setInterval(updateClock, 1000);
  }
  if (document.querySelector('.copy-btn')) {
    initializeContactPage();
  }
}