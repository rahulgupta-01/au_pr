/**
 * @file Client-side router for handling navigation in a Single-Page Application (SPA).
 * Intercepts link clicks, fetches page content without a full reload, and updates the UI.
 */

import { closeMenu } from './ui.js';

const routes = {
    '/': { file: 'index.html', title: 'PR Journey Dashboard' },
    '/about': { file: 'about.html', title: 'About Me' },
    '/plan': { file: 'plan.html', title: 'My PR Plan' },
    '/visa': { file: 'visa.html', title: 'Visa Background' },
    '/documents': { file: 'documents.html', title: 'Documents Hub' },
    '/contact': { file: 'contact.html', title: 'Contact' }
};

let onContentLoaded;

const updateActiveLink = (path) => {
    const navLinks = document.querySelectorAll('.navigation-menu a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });
};

const handleLocation = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes['/'];
    
    try {
        const response = await fetch(`/${route.file}`);
        if (!response.ok) throw new Error(`Failed to fetch ${route.file}`);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const newContent = doc.querySelector('.main-content').innerHTML;
        document.querySelector('.main-content').innerHTML = newContent;

        document.querySelector('#page-title').textContent = route.title;

        updateActiveLink(path);
        
        if (onContentLoaded) {
            onContentLoaded();
        }
        
    } catch (error) {
        console.error('Failed to fetch page content:', error);
    }
};

/**
 * --- FIX ---
 * The route function is now simpler. It only handles the history and content loading,
 * accepting a clean URL string as its argument instead of the whole event object.
 */
const route = (href) => {
    window.history.pushState({}, "", href);
    handleLocation();
};

export const initializeRouter = (callback) => {
    onContentLoaded = callback;

    window.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link && link.href.startsWith(window.location.origin)) {
            
            // --- FIX ---
            // We now prevent the default page load right here in the event listener.
            event.preventDefault();

            if(link.closest('.navigation-menu')) {
                closeMenu();
            }
            
            // --- FIX ---
            // We now pass the clean href from the link directly to our route function.
            route(link.href);
        }
    });

    window.onpopstate = handleLocation;
    handleLocation();
};