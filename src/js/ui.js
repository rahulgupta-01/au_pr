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
 * This function is exported so it can be called from other modules (like the router).
 */
export function closeMenu() {
    const navMenu = document.getElementById('navigation-menu');
    const overlay = document.getElementById('overlay');
    // In this context, we know the hamburger menu is what should be refocused.
    const openingElement = document.querySelector('.hamburger-menu');

    document.body.classList.remove('menu-is-open');
    if (navMenu) {
        navMenu.classList.remove('is-open');
        navMenu.setAttribute('inert', ''); // Make the menu non-interactive to hide it from screen readers and tab order.
    }
    if (overlay) overlay.classList.remove('is-visible');
    // Return focus to the element that opened the menu.
    if (openingElement) openingElement.focus();
}

/**
 * Initializes the dark/light mode theme switcher and loads the user's saved preference.
 */
function initializeTheme() {
    const themeToggle = document.getElementById('dark-mode-toggle');
    const currentTheme = localStorage.getItem('theme');
    // Apply the saved theme on page load.
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    }
    // Add a listener to handle theme changes.
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
    // Check if the button already exists to prevent duplicates on router navigation
    if (document.getElementById('scrollToTopBtn')) return;
    
    const buttonHTML = `<a href="#" id="scrollToTopBtn" class="scroll-to-top-btn" title="Go to top"><i class="fas fa-chevron-up"></i></a>`;
    document.body.insertAdjacentHTML('beforeend', buttonHTML);
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (!scrollToTopBtn) return;
    // Show or hide the button based on scroll position.
    window.addEventListener('scroll', () => {
        scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
    });
    // Handle the click event to scroll smoothly to the top.
    scrollToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Updates the live date and time clock in the header.
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
 * Initializes the "copy to clipboard" functionality on the contact page.
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
 * Initializes tooltips to be toggleable on click/tap for mobile devices,
 * while retaining hover functionality for desktops.
 */
function initializeTooltips() {
    const tooltipWrappers = document.querySelectorAll('.tooltip-wrapper');

    // Close all tooltips when clicking anywhere else on the page
    document.addEventListener('click', () => {
        tooltipWrappers.forEach(wrapper => wrapper.classList.remove('is-active'));
    });

    tooltipWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            // --- FIX: Stop the label from toggling the checkbox ---
            e.preventDefault(); 
            e.stopPropagation();

            const wasActive = wrapper.classList.contains('is-active');
            
            // First, close all other tooltips
            tooltipWrappers.forEach(t => t.classList.remove('is-active'));

            // If the clicked tooltip was not already active, activate it.
            if (!wasActive) {
                wrapper.classList.add('is-active');
            }
        });
    });
}


/**
 * The main UI initialization function. This should be called once when the app starts.
 */
export function initializeUI() {
    initializeHeader();
    initializeTheme();
    initializeScrollToTop();
    initializeTooltips(); // This will now correctly initialize tooltips on every page load

    // Initialize the clock if the element exists on the page.
    if (document.getElementById('currentDate')) {
        updateClock();
        setInterval(updateClock, 1000);
    }
    // Initialize contact page features if the copy buttons exist.
    if (document.querySelector('.copy-btn')) {
        initializeContactPage();
    }
}