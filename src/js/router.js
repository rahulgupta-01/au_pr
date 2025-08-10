/**
 * Client-side router for SPA navigation with accessibility, focus management, and relative fetching.
 */
import { closeMenu, setActiveNavLink } from './ui.js';

const routes = {
  '/':          { file: 'index.html',     title: 'PR Journey Dashboard' },
  '/about':     { file: 'about.html',     title: 'About Me' },
  '/plan':      { file: 'plan.html',      title: 'My PR Plan' },
  '/visa':      { file: 'visa.html',      title: 'Visa Background' },
  '/documents': { file: 'documents.html', title: 'Documents Hub' },
  '/contact':   { file: 'contact.html',   title: 'Contact' }
};

const MAIN_SELECTOR = '.main-content';

function normalizePath(href) {
  const url = new URL(href, window.location.origin);
  let path = url.pathname;
  // collapse repeated slashes and strip trailing (except root)
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
}

function isInternalLink(anchor) {
  const url = new URL(anchor.href, window.location.origin);
  return url.origin === window.location.origin && routes.hasOwnProperty(url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/');
}

async function render(path) {
  const route = routes[path];
  const container = document.querySelector(MAIN_SELECTOR);
  if (!container) return;

  if (!route) {
    container.innerHTML = `<div class="card"><div class="card-header"><i class="fas fa-exclamation-triangle"></i> Page not found</div><p>We couldn't find <code>${path}</code>. Try the Dashboard.</p></div>`;
    setActiveNavLink('/');
    document.title = 'Not Found | Australian PR Journey';
    return;
  }

  try {
    // Relative fetch so it works under sub-path deployments as well
    const res = await fetch(route.file, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Failed to fetch page');
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newMain = doc.querySelector(MAIN_SELECTOR);
    if (!newMain) throw new Error('Malformed page: missing main content');

    // Swap main content
    container.innerHTML = newMain.innerHTML;

    // Update document title and header h1
    document.title = doc.title || `🇦🇺 Australian PR Journey | ${route.title}`;
    const headerTitle = document.getElementById('page-title');
    if (headerTitle) headerTitle.textContent = route.title;

    // Update active nav
    setActiveNavLink(path);

    // Focus management: move focus to first heading
    const focusTarget = container.querySelector('h1, h2, [role="heading"]');
    if (focusTarget) {
      focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus();
    }

    // Run page-specific scripts
    if (typeof window.__afterRoute === 'function') {
      window.__afterRoute(path);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="card"><div class="card-header"><i class="fas fa-wifi"></i> Network error</div><p>We couldn't load this page. Please try again.</p></div>`;
  }
}

export function initializeRouter(onAfterRender) {
  window.__afterRoute = onAfterRender;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const rawHref = link.getAttribute('href') || '';
    // Allow hash-only and same-page hash links to behave normally
    if (rawHref.startsWith('#')) return;
    const tmp = new URL(rawHref, window.location.origin);
    if (tmp.hash && tmp.pathname === window.location.pathname) return;
    if (!isInternalLink(link)) return;
    e.preventDefault();
    closeMenu();

    const path = normalizePath(link.getAttribute('href'));
    history.pushState({}, '', path);
    render(path);
  });

  window.addEventListener('popstate', () => {
    render(normalizePath(location.pathname));
  });

  // Initial render
  render(normalizePath(location.pathname));
}
