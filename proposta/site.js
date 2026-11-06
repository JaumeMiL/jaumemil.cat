const root = document.documentElement;
const query = new URLSearchParams(location.search);
const english = query.get('lang') === 'en';
const requestedDesign = document.body.dataset.design || query.get('disseny');
const design = /^[1-7]$/.test(requestedDesign) ? requestedDesign : null;
const languageToggle = document.querySelector('[data-language-toggle]');

if (design) root.dataset.design = design;

if (english) {
    root.lang = 'en';
    for (const element of document.querySelectorAll('[data-en]')) {
        element.textContent = element.dataset.en;
    }
    for (const element of document.querySelectorAll('[data-en-label]')) {
        element.setAttribute('aria-label', element.dataset.enLabel);
    }
}

if (english || design) {
    for (const link of document.querySelectorAll('a[href]')) {
        if (link === languageToggle || link.getAttribute('href').startsWith('#')) continue;
        const url = new URL(link.href);
        const isProposal = /^\/proposta(?:[1-7]\/|\/(?:cv\/|contacte\/|sobre-mi\/|projectes\/)?)$/.test(url.pathname);
        if (url.origin !== location.origin || !isProposal) continue;
        if (design && link.matches('.brand') && url.pathname === '/proposta/') {
            url.pathname = '/proposta' + design + '/';
        } else if (design && url.pathname.startsWith('/proposta/') && url.pathname !== '/proposta/') {
            url.searchParams.set('disseny', design);
        }
        if (english) url.searchParams.set('lang', 'en');
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
const themeKey = design ? 'proposta' + design + '-theme' : 'proposta-theme';
let savedTheme;
try {
    savedTheme = localStorage.getItem(themeKey);
} catch {
    // The theme toggle still works if local storage is unavailable.
}
const preferredTheme = design === '2' || matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
