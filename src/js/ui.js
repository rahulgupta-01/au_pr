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
 * --- DEFINITIVE TOOLTIP FIX ---
 * Initializes tooltips using JavaScript for perfect positioning.
 */
function initializeTooltips() {
    const hideAllTooltips = () => {
        document.querySelectorAll('.tooltiptext.is-active').forEach(tooltip => {
            tooltip.classList.remove('is-active');
        });
    };

    // Hide tooltips on scroll to prevent them from becoming detached
    window.addEventListener('scroll', hideAllTooltips, true);

    // Universal click listener to close tooltips
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.tooltip-wrapper')) {
            hideAllTooltips();
        }
    });

    document.querySelectorAll('.tooltip-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const tooltipText = wrapper.querySelector('.tooltiptext');
            if (!tooltipText) return;

            const wasActive = tooltipText.classList.contains('is-active');

            // Hide all other tooltips first
            hideAllTooltips();

            if (wasActive) {
                // If it was already active, the command above already closed it.
                return;
            }

            // --- Calculate and Apply Position ---
            tooltipText.classList.add('is-active');

            const triggerRect = wrapper.getBoundingClientRect();
            const tooltipRect = tooltipText.getBoundingClientRect();
            
            // Vertically, position it 8px above the trigger
            const top = triggerRect.top - tooltipRect.height - 8;

            // Horizontally, center it on the trigger
            let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

            // Boundary checks to prevent it from going off-screen
            if (left < 10) {
                left = 10; // Left boundary
            }
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10; // Right boundary
            }
            
            tooltipText.style.top = `${top}px`;
            tooltipText.style.left = `${left}px`;
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
    initializeTooltips(); 

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

