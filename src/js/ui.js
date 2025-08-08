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
    let lastFocusedElement; // Stores the element that opened the menu to return focus to it later.

    const openMenu = () => {
        lastFocusedElement = document.activeElement; // Save the currently focused element.
        document.body.classList.add('menu-is-open'); // Prevent body scroll.
        if (navMenu) {
            navMenu.classList.add('is-open');
            navMenu.removeAttribute('inert'); // Make the menu interactive.
        }
        if (overlay) overlay.classList.add('is-visible');
        // Defer focus to ensure the element is visible and focusable.
        requestAnimationFrame(() => closeMenuBtn && closeMenuBtn.focus());
    };

    // Add event listeners to the menu buttons and overlay.
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu); // closeMenu is defined below.
    if (overlay) overlay.addEventListener('click', closeMenu);

    // Add keyboard controls for the menu.
    document.addEventListener('keydown', (e) => {
        // Allow closing the menu with the 'Escape' key.
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-open')) {
            closeMenu();
        }
        // Trap focus within the menu when it's open.
        if (e.key === 'Tab' && navMenu && navMenu.classList.contains('is-open')) {
            const focusableElements = Array.from(navMenu.querySelectorAll('button, [href], input'));
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) { // Handle Shift + Tab for reverse tabbing.
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Handle Tab for forward tabbing.
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
 * Creates and manages the "scroll to top" button.
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
 * --- FINAL, SIMPLIFIED TOOLTIP FIX ---
 * The logic is now handled by the inline onclick in dashboard.js.
 * This function just adds a global listener to close tooltips when clicking away.
 */
function initializeTooltips() {
    document.addEventListener('click', (e) => {
        // If the click is not on a tooltip wrapper, close all active tooltips
        if (!e.target.closest('.tooltip-wrapper')) {
            document.querySelectorAll('.tooltip-wrapper.is-active').forEach(wrapper => {
                wrapper.classList.remove('is-active');
            });
        }
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