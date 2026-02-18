document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        lang: 'en',
        theme: 'light',
        data: null
    };

    // --- DOM Elements ---
    const elements = {
        langToggle: document.getElementById('lang-toggle'),
        themeToggle: document.getElementById('theme-toggle'),
        ctaDownload: document.getElementById('cta-download'),
        navLinks: document.getElementById('nav-links'),
        mainContent: document.getElementById('main-content'),
        modal: document.getElementById('project-modal'),
        modalBody: document.getElementById('modal-body'),
        modalCloseBtns: document.querySelectorAll('[data-close="modal"]'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        backToTopBtn: document.getElementById('back-to-top')
    };

    // --- Initialization ---
    async function init() {
        // Load settings from localStorage or defaults
        loadPreferences();

        // Fetch Content
        try {
            const response = await fetch('content.json?t=' + new Date().getTime());
            state.data = await response.json();

            // Initial Render
            renderAll();

            // Event Listeners
            setupEventListeners();

            // Setup Observers
            setupScrollSpy();
            setupScrollAnimation();

            // Remove loading state if any
            document.body.classList.add('loaded');
        } catch (error) {
            console.error('Failed to load content:', error);
            document.body.innerHTML = '<p class="text-center" style="padding: 2rem; color: red;">Error loading content. Please check content.json.</p>';
        }
    }

    function loadPreferences() {
        // Theme: LocalStorage -> System Pref
        const storedTheme = localStorage.getItem('theme');

        if (storedTheme) {
            state.theme = storedTheme;
            console.log('Theme loaded from localStorage:', storedTheme);
        } else {
            // Check system preference
            const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            state.theme = systemDark ? 'dark' : 'light';
            console.log('Theme loaded from System Preference:', state.theme);
        }

        // Language: LocalStorage -> Navigator -> Fallback EN
        const storedLang = localStorage.getItem('lang');
        if (storedLang) {
            state.lang = storedLang;
        } else {
            const navLang = navigator.language || navigator.userLanguage;
            if (navLang.toLowerCase().startsWith('ca')) {
                state.lang = 'ca';
            } else {
                state.lang = 'en';
            }
        }

        applyTheme();

        // Listen for system theme changes if no override is set
        if (!storedTheme && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!localStorage.getItem('theme')) {
                    state.theme = e.matches ? 'dark' : 'light';
                    applyTheme();
                    console.log('System theme changed, updating:', state.theme);
                }
            });
        }
    }

    // --- Rendering ---
    function renderAll() {
        if (!state.data) return;

        // Metadata & SEO
        document.documentElement.lang = state.lang;
        document.title = state.data.metadata.title[state.lang];
        document.querySelector('meta[name="description"]').content = state.data.metadata.description[state.lang];

        // Navbar
        renderNavbar();

        // Hero
        renderHero();

        // Sections
        renderAbout();
        renderExperience();
        renderProjects();
        renderSkills();
        renderEducation();
        renderAwards();
        renderContact();
        renderFooter();

        // UI Updates
        updateLangButton();
    }

    function renderNavbar() {
        elements.navLinks.innerHTML = '';
        state.data.nav.links.forEach(link => {
            const a = document.createElement('a');
            a.href = `#${link.id}`;
            a.className = 'nav-link';
            a.dataset.section = link.id; // For ScrollSpy
            a.textContent = link.text[state.lang];
            a.addEventListener('click', () => {
                elements.navLinks.classList.remove('active'); // Close mobile menu on click
            });
            elements.navLinks.appendChild(a);
        });

        elements.ctaDownload.textContent = state.data.nav.cta[state.lang];
    }

    function renderHero() {
        document.getElementById('hero-name').textContent = state.data.hero.name;
        document.getElementById('hero-role').textContent = state.data.hero.role[state.lang];
        document.getElementById('hero-availability').innerHTML = `<span></span>${state.data.hero.availability[state.lang]}`;

        const ctaPrimary = document.getElementById('hero-cta-primary');
        ctaPrimary.textContent = state.data.hero.cta_primary[state.lang];

        const ctaSecondary = document.getElementById('hero-cta-secondary');
        ctaSecondary.textContent = state.data.hero.cta_secondary[state.lang];
    }

    function renderAbout() {
        let section = document.getElementById('about');
        if (!section) {
            section = createSection('about');
            elements.mainContent.appendChild(section);
        }

        const data = state.data.about;

        const highlightsHtml = data.highlights.map(h => `
            <div class="card reveal">
                <h3>${h.title[state.lang]}</h3>
                <p>${h.desc[state.lang]}</p>
            </div>
        `).join('');

        const langTitle = state.lang === 'ca' ? 'Llenguatges de Programació' : 'Programming Languages';
        const langCardHtml = `
            <div class="card reveal">
                <h3>${langTitle}</h3>
                <div class="skill-chips">
                    ${data.languages.map(lang => `<span class="chip">${lang}</span>`).join('')}
                </div>
            </div>
        `;

        section.innerHTML = `
            <div class="container">
                <h2 class="section-title reveal">${data.title[state.lang]}</h2>
                <div class="about-grid">
                    <div class="about-text reveal">
                        <p class="lead-text" style="text-align: left; margin: 0;">${data.summary[state.lang]}</p>
                    </div>
                    <div class="highlight-cards">
                        ${langCardHtml}
                        ${highlightsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    function renderExperience() {
        let section = document.getElementById('experience');
        if (!section) {
            section = createSection('experience');
            elements.mainContent.appendChild(section);
        }

        const data = state.data.experience;

        const itemsHtml = data.items.map(item => `
            <div class="timeline-item reveal">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h3>${item.role[state.lang]} @ ${item.company}</h3>
                    <div class="timeline-meta">
                        <span>${item.dates[state.lang]}</span>
                        <span>•</span>
                        <span>${item.location}</span>
                    </div>
                    <div class="timeline-desc">
                        <ul>
                            ${item.description.map(d => `<li>${d[state.lang]}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `).join('');

        section.innerHTML = `
            <div class="container">
                <h2 class="section-title reveal">${data.title[state.lang]}</h2>
                <div class="timeline">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    function renderProjects() {
        let section = document.getElementById('projects');
        if (!section) {
            section = createSection('projects');
            elements.mainContent.appendChild(section);
        }

        const data = state.data.projects;

        const itemsHtml = data.items.map((item, index) => `
            <div class="project-card reveal" onclick="openProjectModal(${index})">
                <div class="project-image">
                    <img src="${item.image ? item.image : `assets/project-placeholder-${(index % 3) + 1}.jpg`}?v=1" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22 viewBox=%220 0 400 200%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23e3e3e3%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%23666%22>Project Image</text></svg>'" alt="${item.title[state.lang]}">
                </div>
                <div class="project-info">
                    <h3>${item.title[state.lang]}</h3>
                    <p>${item.desc[state.lang]}</p>
                    <div class="project-tags">
                        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        section.innerHTML = `
            <div class="container">
                <h2 class="section-title reveal">${data.title[state.lang]}</h2>
                <div class="projects-grid">
                    ${itemsHtml}
                </div>
                <div style="text-align: center; margin-top: 3rem;">
                    <a href="${state.data.contact.github}" target="_blank" class="btn btn-primary">
                        ${data.view_github[state.lang]}
                    </a>
                </div>
            </div>
        `;

        // Expose open function to global scope
        window.openProjectModal = (index) => {
            const project = data.items[index];
            if (!project) return;

            const content = project.content;

            elements.modalBody.innerHTML = `
                <h2 style="margin-bottom: 0.5rem;">${project.title[state.lang]}</h2>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${project.desc[state.lang]}</p>
                
                <div style="margin-bottom: 1.5rem;">
                    <strong>${state.lang === 'ca' ? 'Objectiu' : 'Goal'}:</strong> ${content.goal[state.lang]}<br>
                    <strong>${state.lang === 'ca' ? 'Rol' : 'Role'}:</strong> ${content.role[state.lang]}<br>
                    <strong>${state.lang === 'ca' ? 'Resultat' : 'Result'}:</strong> ${content.result[state.lang]}
                </div>
                
                <div class="project-tags" style="margin-bottom: 2rem;">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                ${project.links.length > 0 ? `
                    <div style="display: flex; gap: 1rem;">
                        ${project.links.map(link => `<a href="${link.url}" target="_blank" class="btn btn-primary btn-sm">${link.text}</a>`).join('')}
                    </div>
                ` : ''}
            `;

            elements.modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };
    }

    function renderSkills() {
        let section = document.getElementById('skills');
        if (!section) {
            section = createSection('skills');
            const edu = document.getElementById('education');
            if (edu) edu.before(section);
            else elements.mainContent.appendChild(section);
        }

        const data = state.data.skills;

        const categoriesHtml = data.categories.map(cat => `
            <div class="skill-category reveal">
                <h3>${cat.name[state.lang]}</h3>
                <div class="skill-chips">
                    ${cat.items.map(skill => `<span class="chip">${skill}</span>`).join('')}
                </div>
            </div>
        `).join('');

        section.innerHTML = `
            <div class="container">
                <h2 class="section-title reveal">${data.title[state.lang]}</h2>
                <div class="skills-container">
                    ${categoriesHtml}
                </div>
            </div>
        `;
    }

    function renderEducation() {
        let section = document.getElementById('education');
        if (!section) {
            section = createSection('education');
            elements.mainContent.appendChild(section);
        }

        const data = state.data.education;

        const itemsHtml = data.items.map(item => `
            <div class="timeline-item reveal">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h3>${item.degree[state.lang]}</h3>
                    <div class="timeline-meta">
                        <span>${item.dates}</span>
                        <span>•</span>
                        <span>${item.school}</span>
                    </div>
                    ${item.desc ? `<p style="color:var(--text-muted)">${item.desc[state.lang]}</p>` : ''}
                </div>
            </div>
        `).join('');

        section.innerHTML = `
            <div class="container">
                <h2 class="section-title reveal">${data.title[state.lang]}</h2>
                <div class="timeline">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    function renderAwards() {
        let section = document.getElementById('awards');
        if (!section) {
            section = createSection('awards');
            elements.mainContent.appendChild(section);
        }

        const data = state.data.awards;

        const itemsHtml = data.items.map(item => `
            <li class="reveal" style="margin-bottom: 1rem; display: flex; gap: 1rem; align-items: baseline;">
                <span style="font-weight: bold; color: var(--accent-color);">${item.date}</span>
                <span>
                    <strong>${item.title[state.lang]}</strong>
                    ${item.issuer ? `— ${item.issuer}` : ''}
                </span>
            </li>
        `).join('');

        section.innerHTML = `
            <div class="container">
                <h2 class="section-title reveal">${data.title[state.lang]}</h2>
                <ul style="max-width: 600px; margin: 0 auto;">
                    ${itemsHtml}
                </ul>
            </div>
        `;
    }

    function renderContact() {
        let section = document.getElementById('contact');
        if (!section) {
            section = createSection('contact');
            elements.mainContent.appendChild(section);
        }

        const data = state.data.contact;
        const formData = data.form;

        section.innerHTML = `
            <div class="container text-center">
                <h2 class="section-title reveal">${data.title[state.lang]}</h2>
                <p class="lead-text reveal">${data.text[state.lang]}</p>
                
                <div class="reveal" style="margin-bottom: 2rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; align-items: center;">
                    <div class="tooltip">
                        <button class="btn-secondary btn-sm" onclick="copyEmail()" onmouseout="resetTooltip()">
                            ${data.email}
                            <span class="tooltip-text" id="email-tooltip">${state.lang === 'ca' ? 'Copiar email' : 'Copy email'}</span>
                        </button>
                    </div>

                    <a href="${data.linkedin}" target="_blank" class="btn-link">LinkedIn</a>
                </div>

                <form class="contact-form reveal" id="contact-form">
                    <div class="form-group">
                        <label for="name">${formData.name_label[state.lang]}</label>
                        <input type="text" id="name" name="name" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="email">${formData.email_label[state.lang]}</label>
                        <input type="email" id="email" name="email" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="message">${formData.message_label[state.lang]}</label>
                        <textarea id="message" name="message" class="form-textarea" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">${formData.submit_btn[state.lang]}</button>
                    <div class="success-message" id="success-message">
                        ${formData.success_msg[state.lang]}
                    </div>
                </form>
            </div>
        `;

        // Expose copy function
        window.copyEmail = () => {
            navigator.clipboard.writeText(data.email).then(() => {
                const tooltip = document.getElementById('email-tooltip');
                tooltip.textContent = state.lang === 'ca' ? 'Copiat!' : 'Copied!';
            });
        };

        window.resetTooltip = () => {
            const tooltip = document.getElementById('email-tooltip');
            tooltip.textContent = state.lang === 'ca' ? 'Copiar email' : 'Copy email';
        };

        const form = document.getElementById('contact-form');
        form.addEventListener('submit', handleFormSubmit);
    }

    function renderFooter() {
        document.getElementById('footer-copyright').textContent = state.data.footer.copyright[state.lang];
        document.getElementById('back-to-top').textContent = state.data.footer.back_to_top[state.lang];
    }

    // --- Helpers ---
    function createSection(id) {
        const sect = document.createElement('section');
        sect.id = id;
        return sect;
    }

    function updateLangButton() {
        elements.langToggle.textContent = state.lang === 'ca' ? 'EN' : 'CA';
    }

    function applyTheme(persist = false) {
        document.documentElement.setAttribute('data-theme', state.theme);
        if (persist) {
            localStorage.setItem('user_theme_preference', state.theme);
        }
    }

    // --- Observers ---
    function setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        if (link.dataset.section === id) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, { threshold: 0.3, rootMargin: "-70px 0px -50% 0px" });

        sections.forEach(section => observer.observe(section));
    }

    function setupScrollAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        // Elements marked with 'reveal' class
        setTimeout(() => {
            const hiddenElements = document.querySelectorAll('.reveal');
            hiddenElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                observer.observe(el);
            });

            // CSS to handle the 'active' class
            const style = document.createElement('style');
            style.textContent = `
                .reveal.active {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        }, 100); // Small delay to ensure render
    }

    // --- Event Handlers ---
    function setupEventListeners() {
        // Language Toggle
        elements.langToggle.addEventListener('click', () => {
            state.lang = state.lang === 'ca' ? 'en' : 'ca';
            localStorage.setItem('lang', state.lang);
            renderAll();
        });

        // Theme Toggle
        elements.themeToggle.addEventListener('click', () => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            applyTheme(true); // Persist user choice
        });



        // Mobile Menu
        elements.mobileMenuBtn.addEventListener('click', () => {
            elements.navLinks.classList.toggle('active');
            const expanded = elements.navLinks.classList.contains('active');
            elements.mobileMenuBtn.setAttribute('aria-expanded', expanded);
        });

        // Modal Close
        elements.modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.modal.getAttribute('aria-hidden') === 'false') {
                elements.modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });

        elements.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                document.querySelector('.navbar').classList.add('scrolled');
            } else {
                document.querySelector('.navbar').classList.remove('scrolled');
            }
        });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const successMsg = document.getElementById('success-message');
        const formData = new FormData(form);

        const originalText = btn.textContent;
        btn.textContent = '...';
        btn.disabled = true;

        try {
            console.log('Sending form to:', state.data.contact.formspree_endpoint);
            const response = await fetch(state.data.contact.formspree_endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Form success:', data);
                successMsg.style.display = 'block';
                successMsg.className = 'success-message';
                successMsg.style.color = '#065f46'; // Reset color
                successMsg.textContent = state.data.contact.form.success_msg[state.lang];
                form.reset();
                btn.style.display = 'none';
            } else {
                console.error('Form error response:', data);
                throw new Error(data.error || (data.errors ? data.errors.map(e => e.message).join(', ') : 'Form submission failed'));
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            successMsg.style.display = 'block';
            successMsg.className = 'error-message';
            successMsg.style.color = 'red';
            // Show more specific error to help debugging
            const genericError = state.lang === 'ca' ? "Hi ha hagut un error. Si us plau, envia'm un correu directament." : "There was an error. Please email me directly.";
            successMsg.textContent = `${genericError} (Details: ${error.message})`;

            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    // Start
    init();
});
