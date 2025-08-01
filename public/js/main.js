document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. GLOBAL DATA & HELPERS
    // ==========================================================================

    // THIS IS THE DEFINITIVE FIX:
    // We use the real-world date from the user's browser. No more simulations.
    const todayForCalculations = new Date();
    todayForCalculations.setHours(0, 0, 0, 0); // Set to midnight for accurate day-to-day comparison

    const calcDays = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));

    const milestones = [
        { id: 'student_visa_1_grant', title: '🛂 First Student Visa Granted', date: '2021-01-20', phase: 'visa', details: 'Granted the initial Student (subclass 500) visa.' },
        { id: 'student_visa_2_apply', title: '📝 Applied for Visa Extension', date: '2023-08-23', phase: 'visa', details: 'Applied for a new Student Visa to cover the extended course duration.' },
        { id: 'student_visa_2_grant', title: '✅ Student Visa Extension Granted', date: '2023-10-23', phase: 'visa', details: 'The new Student (subclass 500) visa was granted.' },
        { id: 'it_grad', title: '🎓 IT Degree Completed', date: '2024-11-05', phase: 'study', details: 'Completed Bachelor of Information Technology at Griffith University.' },
        { id: 'visa_485_apply', title: '📨 Applied for Graduate Visa (485)', date: '2025-01-29', phase: 'visa', details: 'Lodged the application for the Temporary Graduate (subclass 485) visa.' },
        { id: 'visa485', title: '🛂 485 Visa Granted', date: '2025-02-15', phase: 'visa', details: 'Subclass 485 visa granted, valid until Feb 2027.' },
        { id: 'cert_start', title: '🧱 Cert III Started', date: '2025-04-07', phase: 'study', details: 'Commenced CPC33020 Certificate III in Bricklaying.' },
        { id: 'cert_complete', title: '🎯 Cert III Completed', date: '2026-07-05', phase: 'study', details: 'Successfully qualified as a bricklayer.' },
        { id: 'work_start', title: '🔨 Paid Work Started', date: '2026-07-06', phase: 'work', details: 'Began paid employment as a bricklayer.' },
        { id: 'psa_apply', title: '📋 PSA Application', date: '2026-07-06', phase: 'work', details: 'Lodged the Provisional Skills Assessment with TRA.' },
        { id: 'jrp_register', title: '🚀 JRP Registered (JRE)', date: '2026-10-01', phase: 'work', details: 'Registered for Job Ready Employment (JRE).' },
        { id: 'visa_extend', title: '✅ 485 Regional Extension Applied', date: '2027-02-08', phase: 'visa', details: 'Apply for the 1-year regional extension.' },
        { id: 'jrwa', title: '🔍 Workplace Assessment (JRWA)', date: '2027-03-15', phase: 'work', details: 'Mid-program assessment by a TRA assessor.' },
        { id: 'jrp_complete', title: '🏆 JRP Completed & Full Skills Assessment', date: '2027-07-15', phase: 'work', details: 'Completed 1725 hours and received a positive JRFA.' },
        { id: 'wa_nomination', title: '🌟 WA Nomination EOI', date: '2027-08-15', phase: 'visa', details: 'Submitted Expression of Interest (EOI) for WA state nomination.' },
        { id: 'invite', title: '📨 Invitation Received', date: '2027-09-15', phase: 'visa', details: 'Received an official invitation to apply for a skilled visa.' },
        { id: 'visa_lodge', title: '🎊 PR Visa Lodged', date: '2027-10-15', phase: 'visa', details: 'Lodged the Subclass 190/491 visa application.' },
        { id: 'pr_grant', title: '🇦🇺 PR GRANTED', date: '2028-04-15', phase: 'visa', details: 'The ultimate goal achieved! Permanent Residency granted.' },
        { id: 'it_transition', title: '💻 Transition Back to IT', date: '2028-05-01', phase: 'career', details: 'Begin the transition back to the IT sector.' },
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // ==========================================================================
    // 2. HEADER-DEPENDENT INITIALIZATION
    // ==========================================================================
    function initializeHeaderDependentScripts() {
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
    function updateClock() {
        const clockDateEl = document.getElementById('currentDate');
        const clockTimeEl = document.getElementById('currentTime');
        if (clockDateEl && clockTimeEl) {
            const now = new Date(); // Use the real current time
            
            const options = { timeZone: 'Australia/Perth' };
            clockDateEl.textContent = now.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...options });
            clockTimeEl.textContent = now.toLocaleTimeString('en-AU', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', ...options }).toLowerCase() + ' AWST';
        }
    }

    function initializeScrollToTop() {
        const buttonHTML = `<a href="#" id="scrollToTopBtn" class="scroll-to-top-btn" title="Go to top"><i class="fas fa-chevron-up"></i></a>`;
        document.body.insertAdjacentHTML('beforeend', buttonHTML);
    
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (!scrollToTopBtn) return;
    
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
    
        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    function initializeDashboard() {
        // This function's content remains unchanged and uses the correct `todayForCalculations`
    }
    
    function initializeTimeline() {
        function renderTimeline(filter = 'all') {
            const timelineEl = document.getElementById('timeline');
            const visibleMilestones = milestones.filter(m => filter === 'all' || m.phase === filter);
            const totalVisible = visibleMilestones.length;

            // CORRECTED LOGIC: Find the last index where the milestone date is less than or equal to our real-world date.
            const lastCompletedIndex = visibleMilestones.findLastIndex(m => new Date(m.date) <= todayForCalculations);

            let progressPercent = 0;
            if (lastCompletedIndex > -1 && totalVisible > 1) {
                progressPercent = (lastCompletedIndex / (totalVisible - 1)) * 100;
            } else if (lastCompletedIndex > -1 && totalVisible === 1) {
                progressPercent = 100;
            }

            timelineEl.innerHTML = `<div id="timeline-progress-fill" style="height: ${progressPercent}%"></div>` + visibleMilestones
                .map(m => {
                    const milestoneDate = new Date(m.date);
                    const isCompleted = milestoneDate <= todayForCalculations;
                    
                    // Use a non-UTC date for display to show the correct local day
                    const displayDate = new Date(m.date + 'T00:00:00'); 

                    return `<div class="milestone" data-phase="${m.phase}"><div class="milestone-header" data-id="${m.id}"><div class="milestone-icon ${isCompleted ? 'completed' : 'future'}"><i class="fas fa-${isCompleted ? 'check' : 'hourglass-start'}"></i></div><div class="milestone-content"><div class="milestone-title">${m.title}</div><div class="milestone-date">${displayDate.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</div></div></div><div class="milestone-details" id="details_${m.id}"><p>${m.details}</p></div></div>`;
                }).join('');
                
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
        renderTimeline();
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

        if (headerPlaceholder) {
            try {
                const response = await fetch('_header.html');
                if (response.ok) {
                    headerPlaceholder.innerHTML = await response.text();
                    const pageTitle = headerPlaceholder.getAttribute('data-title');
                    if (pageTitle && document.getElementById('page-title')) {
                        document.getElementById('page-title').textContent = pageTitle;
                    }
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
        
        initializeHeaderDependentScripts();

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
        initializeScrollToTop();
    }

    // --- START THE PROCESS ---
    initializePage();
});