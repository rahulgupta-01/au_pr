import { loadJourneyData } from './data.js';
import { initializeDashboard } from './dashboard.js';
import { initializeTimeline } from './timeline.js';
import { initializeUI } from './ui.js';
// IMPORT THE ROUTER
import { initializeRouter } from './router.js';

// --- MAIN APP CONFIGURATION ---
const config = {
    userDOB: '2001-05-18',
    journeyStartDate: '2025-02-15',
    initialVisaExpiryDate: '2027-02-15',
    finalVisaExpiryDate: '2028-02-15',
    pointsTarget: 95
};

async function initializeApp() {
    // This part now needs to be callable every time new content is loaded.
    const initializePageSpecificScripts = async () => {
        const { milestones, costData } = await loadJourneyData();

        if (document.getElementById('points-breakdown')) {
            // Pass the config object to the dashboard
            initializeDashboard(milestones, costData, config);
        }
        if (document.getElementById('timeline')) {
            initializeTimeline(milestones);
        }
    };
    
    // Initialize all common UI elements (header, theme, etc.) ONCE.
    initializeUI();
    
    // Initialize the router. The router will call a modified handleLocation function.
    initializeRouter(initializePageSpecificScripts);
}

// Start the application once the DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);