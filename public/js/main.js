document.addEventListener(‘DOMContentLoaded’, () => {

```
// ==========================================================================
// 1. GLOBAL DATA & HELPERS
// ==========================================================================

// Get the current actual date for real-time calculations
const todayForCalculations = new Date();
todayForCalculations.setHours(0, 0, 0, 0); // Set to start of day for consistent comparisons

// Live clock configuration - shows current Perth time
const pageLoadTime = new Date();

// Helper function to calculate days between two dates
const calcDays = (d1, d2) => Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

// Complete milestone data for the Australian PR journey
const milestones = [
    { id: 'student_visa_1_grant', title: '  First Student Visa Granted', date: '2021-01-20', phase: 'visa', details: 'Granted the initial Student (subclass 500) visa.' },
    { id: 'student_visa_2_apply', title: '  Applied for Visa Extension', date: '2023-08-23', phase: 'visa', details: 'Applied for a new Student Visa to cover the extended course duration.' },
    { id: 'student_visa_2_grant', title: '  Student Visa Extension Granted', date: '2023-10-23', phase: 'visa', details: 'The new Student (subclass 500) visa was granted.' },
    { id: 'it_grad', title: '  IT Degree Completed', date: '2024-11-05', phase: 'study', details: 'Completed Bachelor of Information Technology at Griffith University.' },
    { id: 'visa_485_apply', title: '  Applied for Graduate Visa (485)', date: '2025-01-29', phase: 'visa', details: 'Lodged the application for the Temporary Graduate (subclass 485) visa.' },
    { id: 'visa485', title: '  485 Visa Granted', date: '2025-02-15', phase: 'visa', details: 'Subclass 485 visa granted, valid until Feb 2027.' },
    { id: 'cert_start', title: '  Cert III Started', date: '2025-04-07', phase: 'study', details: 'Commenced CPC33020 Certificate III in Bricklaying.' },
    { id: 'cert_complete', title: '  Cert III Completed', date: '2026-07-05', phase: 'study', details: 'Successfully qualified as a bricklayer.' },
    { id: 'work_start', title: '  Paid Work Started', date: '2026-07-06', phase: 'work', details: 'Began paid employment as a bricklayer.' },
    { id: 'psa_apply', title: '  PSA Application', date: '2026-07-06', phase: 'work', details: 'Lodged the Provisional Skills Assessment with TRA.' },
    { id: 'jrp_register', title: '  JRP Registered (JRE)', date: '2026-10-01', phase: 'work', details: 'Registered for Job Ready Employment (JRE).' },
    { id: 'visa_extend', title: '  485 Regional Extension Applied', date: '2027-02-08', phase: 'visa', details: 'Apply for the 1-year regional extension.' },
    { id: 'jrwa', title: '  Workplace Assessment (JRWA)', date: '2027-03-15', phase: 'work', details: 'Mid-program assessment by a TRA assessor.' },
    { id: 'jrp_complete', title: '  JRP Completed & Full Skills Assessment', date: '2027-07-15', phase: 'work', details: 'Completed 1725 hours and received a positive JRFA.' },
    { id: 'wa_nomination', title: '  WA Nomination EOI', date: '2027-08-15', phase: 'visa', details: 'Submitted Expression of Interest (EOI) for WA state nomination.' },
    { id: 'invite', title: '  Invitation Received', date: '2027-09-15', phase: 'visa', details: 'Received an official invitation to apply for a skilled visa.' },
    { id: 'visa_lodge', title: '  PR Visa Lodged', date: '2027-10-15', phase: 'visa', details: 'Lodged the Subclass 190/491 visa application.' },
    { id: 'pr_grant', title: '  PR GRANTED', date: '2028-04-15', phase: 'visa', details: 'The ultimate goal achieved! Permanent Residency granted.' },
    { id: 'it_transition', title: '  Transition Back to IT', date: '2028-05-01', phase: 'career', details: 'Begin the transition back to the IT sector.' },
].sort((a, b) => new Date(a.date) - new Date(b.date));

// ==========================================================================
// 2. HEADER-DEPENDENT INITIALIZATION
// ==========================================================================
function initializeHeaderDependentScripts() {
    const navMenu = document.getElementById('navigation-menu');
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    const overlay = document.getElementById('overlay');

    // Mobile menu open functionality
    function openMenu() {
        document.body.classList.add('menu-is-open');
        if (navMenu) navMenu.classList.add('is-open');
        if (overlay) overlay.classList.add('is-visible');
    }

    // Mobile menu close functionality
    function closeMenu() {
        document.body.classList.remove('menu-is-open');
        if (navMenu) navMenu.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-visible');
    }

    // Event listeners for mobile menu controls
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

    // Dark mode theme toggle functionality
    const themeToggle = document.getElementById('dark-mode-toggle');
    const currentTheme = localStorage.getItem('theme');

    // Apply saved theme preference on page load
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    }

    // Handle theme toggle changes
    if (themeToggle) {
        themeToggle.addEventListener('change', function () {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

// ==========================================================================
// 3. PAGE-SPECIFIC & GLOBAL INITIALIZATION FUNCTIONS
// ==========================================================================

// Real-time clock display for Perth time
function updateClock() {
    const clockDateEl = document.getElementById('currentDate');
    const clockTimeEl = document.getElementById('currentTime');
    if (clockDateEl && clockTimeEl) {
        const now = new Date();

        // Format current date and time for Perth timezone
        const options = { timeZone: 'Australia/Perth' };
        clockDateEl.textContent = now.toLocaleDateString('en-AU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            ...options 
        });
        clockTimeEl.textContent = now.toLocaleTimeString('en-AU', { 
            hour12: true, 
            hour: 'numeric', 
            minute: '2-digit', 
            second: '2-digit', 
            ...options 
        }).toLowerCase() + ' AWST';
    }
}

// Scroll to top button functionality
function initializeScrollToTop() {
    const buttonHTML = `<a href="#" id="scrollToTopBtn" class="scroll-to-top-btn" title="Go to top"><i class="fas fa-chevron-up"></i></a>`;
    document.body.insertAdjacentHTML('beforeend', buttonHTML);

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (!scrollToTopBtn) return;

    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Dashboard initialization for points and cost tracking
function initializeDashboard() {
    const config = {
        userDOB: '2001-05-18',
        journeyStartDate: '2025-02-15',
        prGrantDate: '2028-04-15',
        initialVisaExpiryDate: '2027-02-15',
        finalVisaExpiryDate: '2028-02-15'
    };

    // Cost tracking data for PR journey expenses
    const costData = [
        { id: 'cert', label: 'Certificate III Course', amount: 17230, paid: true },
        { id: 'tools', label: 'Tools, PPE, White Card', amount: 550, paid: true },
        { id: 'tra', label: 'TRA Assessments (All)', amount: 3540, paid: false },
        { id: 'visa_app', label: 'Visa Application Fee', amount: 4910, paid: false },
        { id: 'medicals', label: 'Medicals & Police Checks', amount: 900, paid: false },
        { id: 'english_test', label: 'English Test', amount: 400, paid: false },
        { id: 'naati_test', label: 'NAATI CCL Test', amount: 220, paid: false }
    ];

    let state = { points: {}, costs: {} };

    // Quick DOM element selector
    const D = (id) => document.getElementById(id);

    // Cache all dashboard elements
    const elements = {
        currentPoints: D('currentPoints'),
        pointsProgress: D('pointsProgress'),
        pointsBreakdown: D('points-breakdown'),
        currentTotalPoints: D('currentTotalPoints'),
        costTracker: D('cost-tracker'),
        totalCostSpent: D('total_cost_spent'),
        totalSpentDisplay: D('totalSpentDisplay'),
        totalBudgetDisplay: D('totalBudgetDisplay'),
        investmentProgress: D('investmentProgress'),
        daysRemaining: D('daysRemaining'),
        visaStatus: D('visaStatus'),
        visaTimeProgress: D('visaTimeProgress'),
        nextMilestoneCountdown: D('nextMilestoneCountdown'),
        nextMilestoneTitle: D('nextMilestoneTitle'),
        milestoneProgress: D('milestoneProgress'),
        alertsContainer: D('alertsContainer')
    };

    // Save dashboard state to localStorage
    function saveState() {
        localStorage.setItem('prDashboardState', JSON.stringify(state));
    }

    // Load dashboard state from localStorage or create default
    function loadState() {
        const savedState = localStorage.getItem('prDashboardState');
        if (savedState) return JSON.parse(savedState);
        const defaultState = { points: {}, costs: {} };
        getPointsData().forEach(p => {
            defaultState.points[p.id] = p.initial || (p.achievedDate && new Date(p.achievedDate) <= todayForCalculations);
        });
        costData.forEach(c => defaultState.costs[c.id] = c.paid);
        return defaultState;
    }

    // Format currency values for Australian dollars
    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }).format(val);

    // Points calculation data structure
    function getPointsData() {
        return []; // Placeholder - assume filled elsewhere in the actual implementation
    }

    // Dashboard rendering functions
    function renderPoints() {}
    function renderCosts() {}
    function updateMetrics() {}
    function updateAlerts() {}
    function initializeResetButtons() {}

    // Initialize dashboard with saved or default state
    state = loadState();
    renderPoints();
    renderCosts();
    updateMetrics();
    updateAlerts();
    initializeResetButtons();
}

// Timeline visualization for PR journey milestones
function initializeTimeline() {
    function renderTimeline(filter = 'all') {
        const timelineEl = document.getElementById('timeline');
        const visibleMilestones = milestones.filter(m => filter === 'all' || m.phase === filter);
        const totalVisible = visibleMilestones.length;

        if (totalVisible === 0) {
            timelineEl.innerHTML = '<p>No milestones found for this filter.</p>';
            return;
        }

        // Find the last completed milestone based on current date
        const lastCompletedIndex = visibleMilestones.findLastIndex(m => {
            const milestoneDate = new Date(m.date);
            milestoneDate.setHours(0, 0, 0, 0);
            return milestoneDate <= todayForCalculations;
        });

        // Calculate progress bar percentage based on milestone positions
        let progressPercent = 0;
        if (lastCompletedIndex >= 0) {
            if (totalVisible === 1) {
                // Single milestone - either 0% or 100%
                progressPercent = 100;
            } else {
                // Multiple milestones - calculate position-based percentage
                // Add 1 to lastCompletedIndex because we want to fill TO the completed milestone
                progressPercent = ((lastCompletedIndex + 1) / totalVisible) * 100;
            }
        }

        // Render timeline with progress bar and milestones
        timelineEl.innerHTML = `<div id="timeline-progress-fill" style="height: ${progressPercent}%"></div>` + visibleMilestones
            .map(m => {
                const milestoneDate = new Date(m.date);
                milestoneDate.setHours(0, 0, 0, 0);
                const isCompleted = milestoneDate <= todayForCalculations;

                // Format date in Australian format with consistent timezone handling
                const displayDate = milestoneDate.toLocaleDateString('en-AU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                });

                return `<div class="milestone" data-phase="${m.phase}">
                    <div class="milestone-header" data-id="${m.id}">
                        <div class="milestone-icon ${isCompleted ? 'completed' : 'future'}">
                            <i class="fas fa-${isCompleted ? 'check' : 'hourglass-start'}"></i>
                        </div>
                        <div class="milestone-content">
                            <div class="milestone-title">${m.title}</div>
                            <div class="milestone-date">${displayDate}</div>
                        </div>
                    </div>
                    <div class="milestone-details" id="details_${m.id}">
                        <p>${m.details}</p>
                    </div>
                </div>`;
            }).join('');

        // Add click handlers for milestone expansion
        document.querySelectorAll('.milestone-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const detailsEl = document.getElementById(`details_${e.currentTarget.dataset.id}`);
                detailsEl.classList.toggle('visible');
                if (detailsEl.classList.contains('visible')) {
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
    }

    // Initial timeline render
    renderTimeline();

    // Phase filter button functionality
    const toggleBtnGroup = document.querySelector('.toggle-btn-group');
    if (toggleBtnGroup) {
        toggleBtnGroup.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                // Update active button state
                document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                // Re-render timeline with selected filter
                renderTimeline(e.target.dataset.phase);
            }
        });
    }
}

// Contact page copy-to-clipboard functionality
function initializeContactPage() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            navigator.clipboard.writeText(button.dataset.copy).then(() => {
                // Show visual feedback for successful copy
                button.classList.add('copied');
                setTimeout(() => button.classList.remove('copied'), 2000);
            }).catch(err => console.error('Failed to copy text: ', err));
        });
    });
}

// ==========================================================================
// 4. MAIN PAGE INITIALIZATION FLOW
// ==========================================================================
async function initializePage() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    // Load and inject header content
    if (headerPlaceholder) {
        try {
            const response = await fetch('_header.html');
            if (response.ok) {
                headerPlaceholder.innerHTML = await response.text();
                
                // Set page title from data attribute
                const pageTitle = headerPlaceholder.getAttribute('data-title');
                if (pageTitle && document.getElementById('page-title')) {
                    document.getElementById('page-title').textContent = pageTitle;
                }
                
                // Highlight current page in navigation
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                document.querySelectorAll('.navigation-menu a').forEach(link => {
                    if (link.getAttribute('href') === currentPage) {
                        link.classList.add('active');
                    }
                });
            } else {
                headerPlaceholder.innerHTML = '<p>Error: Could not load header.</p>';
            }
        } catch (error) {
            console.error("Error fetching header:", error);
        }
    }

    // Load and inject footer content
    if (footerPlaceholder) {
        try {
            const response = await fetch('_footer.html');
            if (response.ok) {
                footerPlaceholder.innerHTML = await response.text();
            } else {
                footerPlaceholder.innerHTML = '<p>Error: Could not load footer.</p>';
            }
        } catch (error) {
            console.error("Error fetching footer:", error);
        }
    }

    // Initialize header-dependent scripts after header is loaded
    initializeHeaderDependentScripts();

    // Initialize page-specific features based on DOM elements present
    if (document.getElementById('currentDate')) {
        updateClock();
        setInterval(updateClock, 1000); // Update clock every second
    }
    if (document.getElementById('points-breakdown')) {
        initializeDashboard();
    }
    if (document.getElementById('timeline')) {
        initializeTimeline();
    }
    if (document.querySelector('.copy-btn')) {
        initializeContactPage();
    }
    
    // Initialize global features available on all pages
    initializeScrollToTop();
}

// Start the initialization process
initializePage();
```

});