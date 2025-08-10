import { loadJourneyData } from './data.js';
import { initializeDashboard } from './dashboard.js';
import { initializeTimeline } from './timeline.js';
import { initializeUI } from './ui.js';
import { initializeRouter } from './router.js';

async function fetchConfig() {
  try {
    const res = await fetch('data/config.json', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Failed to load config');
    return await res.json();
  } catch (e) {
    console.error('Config load failed, falling back to defaults', e);
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
  };

  initializeRouter(runPageScripts);
}

// Start the application once the DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
