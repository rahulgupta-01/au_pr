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
    let lastFocusedElement;

    const openMenu = () => {
        lastFocusedElement = document.activeElement;
        document.body.classList.add('menu-is-open');
        if (navMenu) {
            navMenu.classList.add('is-open');
            navMenu.removeAttribute('inert');
        }
        if (overlay) overlay.classList.add('is-visible');
        requestAnimationFrame(() => closeMenuBtn && closeMenuBtn.focus());
    };

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-open')) {
            closeMenu();
        }
        if (e.key === 'Tab' && navMenu && navMenu.classList.contains('is-open')) {
            const focusableElements = Array.from(navMenu.querySelectorAll('button, [href], input'));
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
 * Initializes the "scroll to top" button.
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
        clockDateEl.textContent = now.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...options });
        clockTimeEl.textContent = now.toLocaleTimeString('en-AU', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', ...options }).toLowerCase() + ' AWST';
    }
}

/**
 * Initializes contact page copy buttons.
 */
function initializeContactPage() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            navigator.clipboard.writeText(button.dataset.copy)
                .then(() => {
                    button.classList.add('copied');
                    setTimeout(() => button.classList.remove('copied'), 2000);
                })
                .catch(err => console.error('Failed to copy text: ', err));
        });
    });
}

/**
 * --- FINAL, GUARANTEED TOOLTIP FIX ---
 * Initializes tooltips using JavaScript for perfect positioning and reliable clicks.
 */
function initializeTooltips() {
    const hideAllTooltips = () => {
        document.querySelectorAll('.tooltip-wrapper.is-active').forEach(wrapper => {
            wrapper.classList.remove('is-active');
        });
    };

    // Global listener to close tooltips when clicking anywhere else
    document.addEventListener('click', hideAllTooltips);
    // Also hide on scroll to prevent detached tooltips
    window.addEventListener('scroll', hideAllTooltips, true);

    document.querySelectorAll('.tooltip-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            // Prevent the label from toggling the checkbox AND
            // prevent the document listener from closing the tooltip immediately
            e.preventDefault();
            e.stopPropagation();

            const wasActive = wrapper.classList.contains('is-active');
            
            // First, close all other tooltips
            hideAllTooltips();
            
            // If the clicked tooltip wasn't already the active one, make it active
            if (!wasActive) {
                wrapper.classList.add('is-active');
            }
            // If it was active, the hideAllTooltips() call already handled it.
        });
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

    if (document.getElementById('currentDate')) {
        updateClock();
        setInterval(updateClock, 1000);
    }
    if (document.querySelector('.copy-btn')) {
        initializeContactPage();
    }
}
