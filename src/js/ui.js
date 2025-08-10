/**
 * Global UI utilities: header/nav, theme, tooltips, clock, etc.
 */
let lastFocusedElement = null;

export function closeMenu() {
  const navMenu = document.getElementById('navigation-menu');
  const overlay = document.getElementById('overlay');
  if (!navMenu) return;
  navMenu.classList.remove('is-open');
  navMenu.setAttribute('inert', '');
  navMenu.setAttribute('aria-hidden','true');
  setMenuFocusable(false);
  const hamburgerBtn = document.getElementById('hamburger-menu');
  if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded','false');
  document.body.classList.remove('menu-is-open');
  if (overlay) overlay.classList.remove('is-visible');
  // Restore focus
  if (lastFocusedElement) lastFocusedElement.focus();
}

function openMenu() {
  lastFocusedElement = document.activeElement;
  const navMenu = document.getElementById('navigation-menu');
  const closeBtn = document.getElementById('close-menu');
  const overlay = document.getElementById('overlay');
  document.body.classList.add('menu-is-open');
  if (navMenu) {
    navMenu.classList.add('is-open');
    navMenu.removeAttribute('inert');
    navMenu.removeAttribute('aria-hidden');
    setMenuFocusable(true);
  }
  if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded','true');
  if (overlay) overlay.classList.add('is-visible');
  requestAnimationFrame(() => closeBtn && closeBtn.focus());
}

export function setActiveNavLink(path) {
  document.querySelectorAll('nav a[data-nav]').forEach(a => {
    const p = a.getAttribute('data-nav');
    a.classList.toggle('active', p === path);
  });
}


function setMenuFocusable(enabled) {
  const navMenu = document.getElementById('navigation-menu');
  if (!navMenu) return;
  const links = navMenu.querySelectorAll('a, button, input, [tabindex]');
  links.forEach(el => {
    if (enabled) {
      if (el.hasAttribute('data-prev-tabindex')) {
        el.tabIndex = parseInt(el.getAttribute('data-prev-tabindex'), 10) || 0;
        el.removeAttribute('data-prev-tabindex');
      } else {
        el.tabIndex = 0;
      }
    } else {
      if (el.hasAttribute('tabindex')) el.setAttribute('data-prev-tabindex', el.getAttribute('tabindex'));
      el.tabIndex = -1;
    }
  });
}


function ensureOverlayExists() {
    let el = document.getElementById('overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'overlay';
        el.className = 'overlay';
        el.setAttribute('aria-hidden', 'true');
        document.body.appendChild(el);
    }
    return el;
}

function initializeHeader() {
  const navMenu = document.getElementById('navigation-menu');
  const hamburgerBtn = document.getElementById('hamburger-menu');
  const closeMenuBtn = document.getElementById('close-menu');
  const overlay = document.getElementById('overlay');

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
  // Ensure menu starts inert and unfocusable when closed
  if (navMenu && !navMenu.classList.contains('is-open')) {
    navMenu.setAttribute('inert','');
    navMenu.setAttribute('aria-hidden','true');
    setMenuFocusable(false);
  }

  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-open')) closeMenu();

    if (e.key === 'Tab' && navMenu && navMenu.classList.contains('is-open')) {
      const focusable = Array.from(navMenu.querySelectorAll('button, [href], input'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { last.focus(); e.preventDefault(); }
      } else {
        if (document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    }
  });
}

function initializeTheme() {
  const themeToggle = document.getElementById('dark-mode-toggle');
  const saved = localStorage.getItem('theme');
  if (saved) document.body.classList.toggle('dark-mode', saved === 'dark');
  if (themeToggle) themeToggle.checked = document.body.classList.contains('dark-mode');
  if (themeToggle) {
    themeToggle.addEventListener('change', function() {
      document.body.classList.toggle('dark-mode', this.checked);
      localStorage.setItem('theme', this.checked ? 'dark' : 'light');
    });
  }
}

function updateClock() {
  const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Australia/Perth' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Australia/Perth', hour12: true };
  const now = new Date();
  const dateEl = document.getElementById('currentDate');
  const timeEl = document.getElementById('currentTime');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-AU', optionsDate);
  if (timeEl) {
    let t = now.toLocaleTimeString('en-AU', optionsTime);
    if (!/awst/i.test(t)) {
      if (/(am|pm)/i.test(t)) t = t.replace(/(am|pm)/i, '$& AWST');
      else t = t + ' AWST';
    }
    timeEl.textContent = t;
  }
}


function setMainIdIfMissing() {
  const main = document.querySelector('.main-content');
  if (main && !main.id) main.id = 'main';
}

function initializeTooltips() {
  document.addEventListener('mouseenter', (e) => {
    const tgt = e.target;
    const el = (tgt && typeof tgt.closest === 'function') ? tgt.closest('.tooltip') : null;
    if (el) el.setAttribute('aria-expanded', 'true');
  }, true);
  document.addEventListener('mouseleave', (e) => {
    const tgt = e.target;
    const el = (tgt && typeof tgt.closest === 'function') ? tgt.closest('.tooltip') : null;
    if (el) el.setAttribute('aria-expanded', 'false');
  }, true);
}

function initializeScrollToTop() {
  if (document.getElementById('scrollToTopBtn')) return;
  const buttonHTML = `<a href="#" id="scrollToTopBtn" class="scroll-to-top-btn" title="Go to top"><i class="fas fa-chevron-up" aria-hidden="true"></i><span class="sr-only">Back to top</span></a>`;
  document.body.insertAdjacentHTML('beforeend', buttonHTML);
  const btn = document.getElementById('scrollToTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 300));
  btn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
}


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


export function initializeUI() {
  initializeHeader();
  initializeTheme();
  initializeScrollToTop();
  initializeTooltips();

  if (document.getElementById('currentDate')) {
    updateClock();
    setInterval(updateClock, 1000);
  }
  if (document.querySelector('.copy-btn')) {
    initializeContactPage();
  }
}
