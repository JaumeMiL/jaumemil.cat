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
    for (const link of document.querySelectorAll('a[href]')) {
        if (link.hasAttribute('data-language-toggle')) continue;
        const url = new URL(link.href);
        if (url.origin === location.origin && url.pathname.startsWith('/proposta/') && !link.getAttribute('href').startsWith('#')) {
            url.searchParams.set('lang', 'en');
            link.href = url.href;
        }
    }
}

languageToggle.hidden = false;
languageToggle.lang = english ? 'ca' : 'en';
languageToggle.hreflang = languageToggle.lang;
languageToggle.href = (english ? '?lang=ca' : '?lang=en') + location.hash;
languageToggle.addEventListener('click', () => {
    languageToggle.href = (english ? '?lang=ca' : '?lang=en') + location.hash;
});

const themeToggle = document.querySelector('[data-theme-toggle]');
let savedTheme;
try {
    savedTheme = localStorage.getItem('proposta-theme');
} catch {
    // The theme toggle still works if local storage is unavailable.
}
root.dataset.theme = savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
themeToggle.hidden = false;
themeToggle.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
themeToggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    try {
        localStorage.setItem('proposta-theme', theme);
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
