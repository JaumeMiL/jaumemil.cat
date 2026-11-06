const root = document.documentElement;
const english = new URLSearchParams(location.search).get('lang') === 'en';
const languageToggle = document.querySelector('[data-language-toggle]');

if (english) {
    root.lang = 'en';
    for (const element of document.querySelectorAll('[data-en]')) {
        element.textContent = element.dataset.en;
    }
    for (const element of document.querySelectorAll('[data-en-label]')) {
        element.setAttribute('aria-label', element.dataset.enLabel);
    }
    for (const link of document.querySelectorAll('a[data-en-href]')) {
        link.href = link.dataset.enHref;
        link.hreflang = 'en';
    }
    const pagePaths = new Set(['/', '/sobre-mi/', '/trajectoria/', '/projectes/', '/cv/', '/contacte/', '/old/']);
    for (const link of document.querySelectorAll('a[href]')) {
        if (link === languageToggle || link.getAttribute('href').startsWith('#')) continue;
        const url = new URL(link.href);
        if (url.origin !== location.origin || !pagePaths.has(url.pathname)) continue;
        url.searchParams.set('lang', 'en');
        link.href = url.href;
    }
}

function languageHref() {
    const url = new URL(location.href);
    url.searchParams.set('lang', english ? 'ca' : 'en');
    return url.href;
}

languageToggle.hidden = false;
languageToggle.lang = english ? 'ca' : 'en';
languageToggle.hreflang = languageToggle.lang;
languageToggle.href = languageHref();
languageToggle.addEventListener('click', () => {
    languageToggle.href = languageHref();
});

const themeToggle = document.querySelector('[data-theme-toggle]');
const themeKey = 'jaumemil-theme';
let savedTheme;
try {
    savedTheme = localStorage.getItem(themeKey) || localStorage.getItem('proposta7-theme');
} catch {
    // The theme toggle still works if local storage is unavailable.
}
const preferredTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
root.dataset.theme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme;
themeToggle.hidden = false;
themeToggle.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
themeToggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    try {
        localStorage.setItem(themeKey, theme);
    } catch {
        // The selected theme applies to the current page.
    }
});

const menuToggle = document.querySelector('[data-menu-toggle]');
const siteHeader = menuToggle.closest('.site-header');
const siteNav = document.getElementById(menuToggle.getAttribute('aria-controls'));

function setMenuOpen(open) {
    siteHeader.dataset.menuOpen = String(open);
    menuToggle.setAttribute('aria-expanded', String(open));
}

setMenuOpen(false);
menuToggle.hidden = false;
menuToggle.addEventListener('click', () => {
    const open = siteHeader.dataset.menuOpen === 'false';
    setMenuOpen(open);
    if (open) siteNav.querySelector('a').focus();
});
siteHeader.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteHeader.dataset.menuOpen === 'true') {
        setMenuOpen(false);
        menuToggle.focus();
    }
});
document.addEventListener('click', (event) => {
    if (!siteHeader.contains(event.target)) setMenuOpen(false);
});
