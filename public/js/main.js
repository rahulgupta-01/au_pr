document.addEventListener(‘DOMContentLoaded’, () => {

```
// ==========================================================================
// 1. GLOBAL DATA & HELPERS
// ==========================================================================

// Current date for all timeline and milestone calculations
const todayForCalculations = new Date();
todayForCalculations.setHours(0, 0, 0, 0);

// Helper function to calculate days between two dates
const calcDays = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));

// Complete milestone data for the Australian PR journey
const milestones = [
    { id: 'student_visa_1_grant', title: '🛂 First Student Visa Granted', date: '2021-01-20', phase: 'visa', details: 'Granted the initial Student (subclass 500) visa, allowing me to formally study the Bachelor of Information Technology in Australia. This visa was valid until August 30, 2023.' },
    { id: 'student_visa_2_apply', title: '📝 Applied for Visa Extension', date: '2023-08-23', phase: 'visa', details: 'Applied for a new Student Visa to cover the extended course duration. A Bridging A visa was granted on this day to maintain my legal status while the application was processed.' },
    { id: 'student_visa_2_grant', title: '✅ Student Visa Extension Granted', date: '2023-10-23', phase: 'visa', details: 'The new Student (subclass 500) visa was granted, extending my stay until March 15, 2025, to allow for the completion of my degree.' },
    { id: 'it_grad', title: '🎓 IT Degree Completed', date: '2024-11-05', phase: 'study', details: 'Completed Bachelor of Information Technology at Griffith University. This qualification enables the 485 visa and forms the basis for Australian Study points.' },
    { id: 'visa_485_apply', title: '📨 Applied for Graduate Visa (485)', date: '2025-01-29', phase: 'visa', details: 'Lodged the application for the Temporary Graduate (subclass 485) visa after completing my degree. A Bridging A visa was granted on this day.' },
    { id: 'visa485', title: '🛂 485 Visa Granted', date: '2025-02-15', phase: 'visa', details: 'Subclass 485 visa granted, valid until Feb 2027. A 1-year regional extension is available due to study in Gold Coast.' },
    { id: 'cert_start', title: '🧱 Cert III Started', date: '2025-04-07', phase: 'study', details: 'Commenced CPC33020 Certificate III in Bricklaying at Skills Australia Institute, Perth, on the 485 visa.' },
    { id: 'cert_complete', title: '🎯 Cert III Completed', date: '2026-07-05', phase: 'study', details: 'Successfully qualified as a bricklayer. This unlocks the ability to apply for the Provisional Skills Assessment (PSA).' },
    { id: 'work_start', title: '🔨 Paid Work Started', date: '2026-07-06', phase: 'work', details: 'Began paid employment as a bricklayer. The first 90 days can be back-claimed for the JRP if the JRE application is submitted promptly.' },
    { id: 'psa_apply', title: '📋 PSA Application', date: '2026-07-06', phase: 'work', details: 'Lodged the Provisional Skills Assessment with TRA, the first mandatory step of the Job Ready Program.' },
    { id: 'jrp_register', title: '🚀 JRP Registered (JRE)', date: '2026-10-01', phase: 'work', details: 'Registered for Job Ready Employment (JRE), officially starting the 1725-hour / 12-month countdown.' },
    { id: 'visa_extend', title: '✅ 485 Regional Extension Applied', date: '2027-02-08', phase: 'visa', details: 'Apply for the 1-year regional extension. This is a critical step to extend the visa runway from Feb 2027 to Feb 2028.' },
    { id: 'jrwa', title: '🔍 Workplace Assessment (JRWA)', date: '2027-03-15', phase: 'work', details: 'Mid-program assessment by a TRA assessor to verify skills and competency in a real-world Australian workplace.' },
    { id: 'jrp_complete', title: '🏆 JRP Completed & Full Skills Assessment', date: '2027-07-15', phase: 'work', details: 'Completed 1725 hours and received a positive Job Ready Final Assessment (JRFA), securing a full skills assessment and 5 work experience points.' },
    { id: 'wa_nomination', title: '🌟 WA Nomination EOI', date: '2027-08-15', phase: 'visa', details: 'Submitted Expression of Interest (EOI) targeting WA state nomination (190/491). The high points score and priority occupation provide a strong advantage.' },
    { id: 'invite', title: '📨 Invitation Received', date: '2027-09-15', phase: 'visa', details: 'Received an official invitation from Home Affairs to apply for a skilled visa within 60 days.' },
    { id: 'visa_lodge', title: '🎊 PR Visa Lodged', date: '2027-10-15', phase: 'visa', details: 'Lodged the Subclass 190/491 visa application, automatically activating a Bridging Visa A to remain in Australia legally.' },
    { id: 'pr_grant', title: '🇦🇺 PR GRANTED', date: '2028-04-15', phase: 'visa', details: 'The ultimate goal achieved! Permanent Residency granted, providing the freedom to live and work anywhere in Australia.' },
    { id: 'it_transition', title: '💻 Transition Back to IT', date: '2028-05-01', phase: 'career', details: 'Begin the transition back to the IT sector by updating the CV, pursuing relevant certifications (Azure, CCNA, etc.), and applying for roles as a Permanent Resident.' },
].sort((a, b) => new Date(a.date) - new Date(b.date));

// ==========================================================================
// 2. HEADER-DEPENDENT INITIALIZATION
// ==========================================================================
function initializeHeaderDependentScripts() {
    // Mobile menu toggle functionality
    const navMenu = document.getElementById('navigation-menu');
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    const overlay = document.getElementById('overlay');

    function openMenu() {
        document.body.classList.add('menu-is-open');
        if (navMenu) navMenu.classList.add('is-open');
        if (overlay) overlay.classList.add('is-visible');
    }

    function closeMenu() {
        document.body.classList.remove('menu-is-open');
        if (navMenu) navMenu.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-visible');
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

    // Dark mode theme toggle with localStorage persistence
    const themeToggle = document.getElementById('dark-mode-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
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

// Real-time clock update for Perth timezone
function updateClock() {
    const clockDateEl = document.getElementById('currentDate');
    const clockTimeEl = document.getElementById('currentTime');
    if (clockDateEl && clockTimeEl) {
        const now = new Date();
        const options = { timeZone: 'Australia/Perth' };
        clockDateEl.textContent = now.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...options });
        clockTimeEl.textContent = now.toLocaleTimeString('en-AU', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', ...options }).toLowerCase() + ' AWST';
    }
}

// Scroll to top button initialization and event handling
function initializeScrollToTop() {
    const buttonHTML = `
        <a href="#" id="scrollToTopBtn" class="scroll-to-top-btn" title="Go to top">
            <i class="fas fa-chevron-up"></i>
        </a>
    `;
    document.body.insertAdjacentHTML('beforeend', buttonHTML);

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    if (!scrollToTopBtn) return;

    // Show button when user scrolls down 300px
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top when clicked
    scrollToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Dashboard initialization for points tracking, cost tracking, and metrics
function initializeDashboard() {
    const config = {
        userDOB: '2001-05-18', journeyStartDate: '2025-02-15', prGrantDate: '2028-04-15',
        initialVisaExpiryDate: '2027-02-15', finalVisaExpiryDate: '2028-02-15',
    };
    const costData = [
        { id: 'cert', label: 'Certificate III Course', amount: 17230, paid: true },
        { id: 'tools', label: 'Tools, PPE, White Card', amount: 550, paid: true },
        { id: 'tra', label: 'TRA Assessments (All)', amount: 3540, paid: false },
        { id: 'visa_app', label: 'Visa Application Fee', amount: 4910, paid: false },
        { id: 'medicals', label: 'Medicals & Police Checks', amount: 900, paid: false },
        { id: 'english_test', label: 'English Test', amount: 400, paid: false },
        { id: 'naati_test', label: 'NAATI CCL Test', amount: 220, paid: false },
    ];
    let state = { points: {}, costs: {} };
    const D = (id) => document.getElementById(id);
    const elements = {
        currentPoints: D('currentPoints'), pointsProgress: D('pointsProgress'), pointsBreakdown: D('points-breakdown'),
        currentTotalPoints: D('currentTotalPoints'), costTracker: D('cost-tracker'), totalCostSpent: D('total_cost_spent'),
        totalSpentDisplay: D('totalSpentDisplay'), totalBudgetDisplay: D('totalBudgetDisplay'), investmentProgress: D('investmentProgress'),
        daysRemaining: D('daysRemaining'), visaStatus: D('visaStatus'), visaTimeProgress: D('visaTimeProgress'),
        nextMilestoneCountdown: D('nextMilestoneCountdown'), nextMilestoneTitle: D('nextMilestoneTitle'), milestoneProgress: D('milestoneProgress'),
        alertsContainer: D('alertsContainer'),
    };

    function saveState() { localStorage.setItem('prDashboardState', JSON.stringify(state)); }
    function loadState() {
        const savedState = localStorage.getItem('prDashboardState');
        if (savedState) return JSON.parse(savedState);
        const defaultState = { points: {}, costs: {} };
        getPointsData().forEach(p => { defaultState.points[p.id] = p.initial || (p.achievedDate && new Date() >= new Date(p.achievedDate)); });
        costData.forEach(c => defaultState.costs[c.id] = c.paid);
        return defaultState;
    }
    const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }).format(val);
    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        let age = todayForCalculations.getFullYear() - birthDate.getFullYear();
        const m = todayForCalculations.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && todayForCalculations.getDate() < birthDate.getDate())) age--;
        return age;
    };
    function getPointsData() {
        const age = calculateAge(config.userDOB);
        const birthday25 = new Date(config.userDOB);
        birthday25.setFullYear(birthday25.getFullYear() + 25);
        return [
            { id: 'age', label: 'Age', points: 30, currentPoints: 25, achievedDate: birthday25.toISOString().split('T')[0], tooltip: `You are currently ${age}. You get 25 points for age 18-24, and 30 points for 25-32. You will turn 25 on ${birthday25.toLocaleDateString('en-AU', {year: 'numeric', month: 'long', day: 'numeric'})} and get the extra 5 points.` },
            { id: 'english', label: 'Superior English', points: 20, currentPoints: 10, initial: false, tooltip: 'Targeting 20 points for a superior score (e.g., PTE 79+), up from the current 10 points for proficient English.' },
            { id: 'work_exp', label: '1 Year Aus Work Exp', points: 5, achievedDate: '2027-07-15', initial: false, tooltip: 'Achieved after completing the 12-month Job Ready Program.' },
            { id: 'degree', label: 'Bachelor Degree', points: 15, initial: true, tooltip: 'Points for your Bachelor of IT degree from Griffith University.' },
            { id: 'study_req', label: 'Australian Study Req', points: 5, initial: true, tooltip: 'Points for completing a 2-year course in Australia.' },
            { id: 'naati', label: 'Community Language', points: 5, initial: false, tooltip: '5 points to be gained by passing the NAATI CCL (Hindi) test.' },
            { id: 'regional', label: 'Regional Study', points: 5, initial: true, tooltip: 'Points for studying your degree in Gold Coast, a designated regional area.' },
            { id: 'single', label: 'Single Applicant', points: 10, initial: true, tooltip: '10 points for applying as a single applicant.' },
        ];
    }
    function renderPoints() {
        const pointsData = getPointsData();
        let currentTotal = 0;
        elements.pointsBreakdown.innerHTML = pointsData.map(p => {
            const isAchievedByDate = p.achievedDate && todayForCalculations >= new Date(p.achievedDate);
            const isChecked = state.points[p.id] || isAchievedByDate;
            const displayPoints = isChecked ? p.points : (p.currentPoints || 0);
            currentTotal += displayPoints;
            return `<div class="points-item"><input type="checkbox" class="interactive-checkbox" id="check_${p.id}" data-id="${p.id}" ${isChecked ? 'checked' : ''} ${isAchievedByDate ? 'disabled' : ''}><label for="check_${p.id}" class="item-label">${p.label} <span class="tooltip">(i)<span class="tooltiptext">${p.tooltip}</span></span></label><span class="points-value ${isChecked ? 'points-achieved' : 'points-pending'}">${displayPoints}</span></div>`;
        }).join('');
        elements.currentTotalPoints.textContent = currentTotal;
        elements.currentPoints.textContent = currentTotal;
        elements.pointsProgress.style.width = `${(currentTotal / 95) * 100}%`;
        document.querySelectorAll('#points-breakdown .interactive-checkbox:not(:disabled)').forEach(box => {
            box.addEventListener('change', (e) => { state.points[e.target.dataset.id] = e.target.checked; saveState(); renderPoints(); });
        });
    }
    function renderCosts() {
        const totalBudget = costData.reduce((acc, c) => acc + c.amount, 0);
        let totalSpent = 0;
        elements.costTracker.innerHTML = costData.map(c => {
             if (state.costs[c.id]) totalSpent += c.amount;
             return `<div class="cost-item"><input type="checkbox" class="interactive-checkbox" id="check_cost_${c.id}" data-id="${c.id}" ${state.costs[c.id] ? 'checked' : ''}><label for="check_cost_${c.id}" class="item-label">${c.label}</label><span>${formatCurrency(c.amount)}</span></div>`;
        }).join('');
        elements.totalCostSpent.textContent = formatCurrency(totalSpent);
        elements.totalSpentDisplay.textContent = formatCurrency(totalSpent);
        elements.totalBudgetDisplay.textContent = `Budget: ${formatCurrency(totalBudget)}`;
        elements.investmentProgress.style.width = totalBudget > 0 ? `${(totalSpent / totalBudget) * 100}%` : '0%';
        document.querySelectorAll('#cost-tracker .interactive-checkbox').forEach(box => {
            box.addEventListener('change', (e) => { state.costs[e.target.dataset.id] = e.target.checked; saveState(); renderCosts(); });
        });
    }
    function updateMetrics() {
        const extensionMilestone = milestones.find(m => m.id === 'visa_extend');
        const extensionApplied = todayForCalculations >= new Date(extensionMilestone.date);
        const activeExpiryDate = extensionApplied ? config.finalVisaExpiryDate : config.initialVisaExpiryDate;
        const daysLeft = calcDays(todayForCalculations, activeExpiryDate);
        elements.daysRemaining.textContent = daysLeft > 0 ? daysLeft : 'BVA';
        elements.visaStatus.textContent = extensionApplied ? 'Expires Feb 2028 (Ext. Active)' : 'Expires Feb 2027 (Ext. Pending)';
        const totalVisaDuration = calcDays(config.journeyStartDate, activeExpiryDate);
        const visaTimeUsed = calcDays(config.journeyStartDate, todayForCalculations);
        elements.visaTimeProgress.style.width = `${(visaTimeUsed / totalVisaDuration) * 100}%`;
        const futureMilestones = milestones.filter(m => new Date(m.date) >= todayForCalculations);
        if (futureMilestones.length > 0) {
            const nextM = futureMilestones[0];
            elements.nextMilestoneCountdown.textContent = calcDays(todayForCalculations, nextM.date);
            elements.nextMilestoneTitle.textContent = nextM.title.replace(/[^\w\s]/gi, '').trim();
            const prevMIndex = milestones.findIndex(m => m.id === nextM.id) - 1;
            const prevMDate = prevMIndex >= 0 ? new Date(milestones[prevMIndex].date) : new Date(config.journeyStartDate);
            const totalDaysBetween = calcDays(prevMDate, nextM.date);
            const daysPassed = calcDays(prevMDate, todayForCalculations);
            elements.milestoneProgress.style.width = totalDaysBetween > 0 ? `${Math.min(100, (daysPassed / totalDaysBetween * 100))}%` : '0%';
        } else {
             elements.nextMilestoneCountdown.textContent = '✓';
             elements.nextMilestoneTitle.textContent = 'Journey Complete!';
             elements.milestoneProgress.style.width = '100%';
        }
    }
    function updateAlerts() {
        const extensionMilestone = milestones.find(m => m.id === 'visa_extend');
        const extensionApplied = todayForCalculations >= new Date(extensionMilestone.date);
        const activeExpiryDate = extensionApplied ? config.finalVisaExpiryDate : config.initialVisaExpiryDate;
        const daysLeft = calcDays(todayForCalculations, activeExpiryDate);
        let alerts = [];
        const currentM = milestones.find(m => { const mDate = new Date(m.date); return mDate >= todayForCalculations && calcDays(todayForCalculations, mDate) <= 14; });
        if (currentM) alerts.push({type: 'info', msg: `<strong>Current Focus:</strong> ${currentM.title}. This is happening now or in the next two weeks!`});
        if (daysLeft < 90 && daysLeft > 0) alerts.push({type: 'error', msg: `<strong>CRITICAL:</strong> Less than 90 days remaining on your current visa. Ensure next steps are taken!`});
        else if (daysLeft < 365 && daysLeft > 0) alerts.push({type: 'warning', msg: `<strong>Attention:</strong> Less than one year remaining on your current visa.`});
        if (alerts.length === 0) alerts.push({type: 'success', msg: 'All systems are green. You are on track!'});
        elements.alertsContainer.innerHTML = alerts.map(a => `<div class="alert alert-${a.type}"><i class="fas fa-info-circle"></i>${a.msg}</div>`).join('');
    }
    function initializeResetButtons() {
        const handleReset = () => { if (confirm("Are you sure you want to reset all calculators to their default values? This action cannot be undone.")) { localStorage.removeItem('prDashboardState'); location.reload(); } };
        const resetBtn1 = document.getElementById('resetDataBtn');
        const resetBtn2 = document.getElementById('resetDataBtn2');
        if (resetBtn1) resetBtn1.addEventListener('click', handleReset);
        if (resetBtn2) resetBtn2.addEventListener('click', handleReset);
    }
    state = loadState(); renderPoints(); renderCosts(); updateMetrics(); updateAlerts(); initializeResetButtons();
}

// Timeline visualization with accurate progress bar calculation
function initializeTimeline() {
    function renderTimeline(filter = 'all') {
        const timelineEl = document.getElementById('timeline');
        
        // Filter milestones based on phase selection
        const visibleMilestones = milestones.filter(m => filter === 'all' || m.phase === filter);
        const totalVisible = visibleMilestones.length;

        if (totalVisible === 0) {
            timelineEl.innerHTML = '<p>No milestones found for this filter.</p>';
            return;
        }

        // Find the last completed milestone index
        const lastCompletedIndex = visibleMilestones.findLastIndex(m => {
            const milestoneDate = new Date(m.date);
            milestoneDate.setHours(0, 0, 0, 0);
            return milestoneDate <= todayForCalculations;
        });

        // Calculate progress bar percentage based on milestone positions
        let progressPercent = 0;
        if (lastCompletedIndex >= 0) {
            if (totalVisible === 1) {
                // Single milestone case - show 100% if completed
                progressPercent = 100;
            } else {
                // Multiple milestones - calculate position-based percentage
                // Use (lastCompletedIndex + 1) to fill TO the completed milestone
                progressPercent = ((lastCompletedIndex + 1) / totalVisible) * 100;
            }
        }
        // If no milestones are completed, progressPercent remains 0

        // Render the timeline with progress bar and milestone elements
        timelineEl.innerHTML = `<div id="timeline-progress-fill" style="height: ${progressPercent}%"></div>` + visibleMilestones
            .map(m => {
                const milestoneDate = new Date(m.date);
                milestoneDate.setHours(0, 0, 0, 0);
                const isCompleted = milestoneDate <= todayForCalculations;

                // Format date consistently without timezone issues
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

        // Add click handlers for milestone detail expansion
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

    // Phase filter button event handling
    const toggleBtnGroup = document.querySelector('.toggle-btn-group');
    if (toggleBtnGroup) {
         toggleBtnGroup.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
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

    // Load header component and set page title
    if (headerPlaceholder) {
        try {
            const response = await fetch('_header.html');
            if (response.ok) {
                headerPlaceholder.innerHTML = await response.text();
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
    
    // Load footer component
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
    
    // Initialize header-dependent functionality after DOM is ready
    initializeHeaderDependentScripts();

    // Initialize page-specific functionality based on DOM elements present
    if (document.getElementById('currentDate')) {
        updateClock();
        setInterval(updateClock, 1000);
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
    
    // Initialize global functionality available on all pages
    initializeScrollToTop();
}

// Begin page initialization process
initializePage();
```

});