import { loadJourneyData } from './data.js';
import { initializeDashboard } from './dashboard.js';
import { initializeTimeline } from './timeline.js';
import { initializeUI } from './ui.js';
import { initializeRouter } from './router.js';
import { initializeDocumentsPage } from './documents.js';

function showConfigError() {
  const errorBanner = document.createElement('div');
  errorBanner.className = 'config-error-banner';
  errorBanner.textContent = '⚠️ Could not load live configuration. Displaying default data. Some information may be outdated.';
  document.body.prepend(errorBanner);
  
  // Basic styling for the banner
  const style = document.createElement('style');
  style.textContent = `
    .config-error-banner {
      background-color: #D32F2F;
      color: white;
      text-align: center;
      padding: 0.75rem;
      font-weight: 500;
      font-size: 0.9rem;
    }
  `;
  document.head.appendChild(style);
}

async function fetchConfig() {
  try {
    const res = await fetch('data/config.json', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Failed to load config');
    return await res.json();
  } catch (e) {
    console.error('Config load failed, falling back to defaults', e);
    showConfigError(); // Display the error banner to the user
    return {
      userDOB: '2001-05-18',
      journeyStartDate: '2025-02-15',
      initialVisaExpiryDate: '2027-02-15',
      finalVisaExpiryDate: '2028-02-15',
      pointsTarget: 95,
      dataVersion: 1
    };
  }
}

async function initializeApp() {
  // PWA: register service worker only in production, and unregister in dev
  if ('serviceWorker' in navigator) {
    if (import.meta && import.meta.env && import.meta.env.PROD) {
      try { await navigator.serviceWorker.register('/sw.js'); } catch {}
    } else {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) { await r.unregister().catch(()=>{}); }
      } catch {}
    }
  }

  initializeUI();

  const config = await fetchConfig();
  const { milestones, costData } = await loadJourneyData(config);

  const runPageScripts = (path) => {
    initializeUI();
    if (document.querySelector('.key-metrics-panel')) {
      initializeDashboard(milestones, costData, config);
    }
    if (document.getElementById('timeline')) {
      initializeTimeline(milestones);
    }
    if (document.querySelector('.document-table')) {
      initializeDocumentsPage();
    }
  };

  initializeRouter(runPageScripts);
}

// Start the application once the DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);