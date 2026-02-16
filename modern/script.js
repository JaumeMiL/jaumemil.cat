document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const state = { lang: 'en', theme: 'light', data: null };

    // --- DOM ---
    const el = {
        main: document.getElementById('main-content'),
        nav: document.getElementById('nav-links'),
        langBtn: document.getElementById('lang-toggle')
    };

    // --- Init ---
    async function init() {
        // Load Content
        try {
            const res = await fetch('content.json?t=' + Date.now());
            state.data = await res.json();

            // Set Lang
            const storedLang = localStorage.getItem('lang');
            state.lang = storedLang || 'en';

            renderAll();
        } catch (e) {
            console.error(e);
        }
    }

    // --- Render ---
    function renderAll() {
        if (!state.data) return;
        document.title = state.data.metadata.title[state.lang];

        const d = state.data;

        // 1. Navigation (Vertical Icon Bar)
        const navHTML = d.nav.links.map(l => `
            <a href="#${l.id}" class="nav-icon" title="${l.text[state.lang]}">
                <i class="fas fa-${getIconForSection(l.id)}"></i>
            </a>
        `).join('');
        // Inject into navbar-specific container if strictly following layout, 
        // but for now we replace the main nav container content.
        // NOTE: In this design the nav is external to main, so let's handle it:
        const navContainer = document.querySelector('.nav-links');
        if (navContainer) navContainer.innerHTML = navHTML;


        // 2. HERO: Deconstructed Split Screen
        // FIXED: Accessing properties where they actually exist in content.json
        // content.json structure: hero.summary (Yes, it exists in line 89 of viewed file), hero.avatar_url (line 88)
        // Wait, looking at the previous view_file output...
        // Line 87: "avatar_url": "assets/profile.jpg"
        // Line 89: "summary": { ... }
        // So they ARE in hero.
        // The error was "Cannot read properties of undefined (reading 'en')".
        // This implies d.hero.summary might be undefined IF the JSON structure is different than I think.
        // Let's use optional chaining or fallback to ensure it works.

        const heroSummary = d.hero.summary ? d.hero.summary[state.lang] : d.about.summary[state.lang];
        const avatarUrl = d.hero.avatar_url || 'assets/profile.jpg';

        const heroHTML = `
            <section id="hero">
                <div class="hero-text">
                    <span class="hero-subtitle">${d.hero.role[state.lang]}</span>
                    <h1>${d.hero.name.split(' ')[0]}<br><span style="color:var(--text-secondary)">${d.hero.name.split(' ').slice(1).join(' ')}</span></h1>
                    <p style="max-width:500px; margin-bottom: 2rem; color: var(--text-secondary);">${heroSummary}</p>
                    <a href="#projects" class="btn-luxury">${d.hero.cta_secondary[state.lang]}</a>
                </div>
                <div class="hero-visual">
                    <img src="${avatarUrl}" alt="Profile Art">
                    <div class="senyera-line"></div>
                </div>
            </section>
        `;

        // 3. PROJECTS: "The Exhibit"
        const projectsHTML = `
            <section id="projects" style="padding: 100px 0;">
                <h2>${d.projects.title[state.lang]}</h2>
                ${d.projects.items.map(p => `
                    <div class="project-item">
                        <div class="project-visual">
                            <img src="${p.image || 'assets/profile.jpg'}" alt="${p.title[state.lang]}">
                        </div>
                        <div class="project-info">
                            <h3>${p.title[state.lang]}</h3>
                            <p>${p.desc[state.lang]}</p>
                            <div style="margin-bottom: 2rem;">
                                ${p.tags.map(t => `<span style="margin-right:1rem; font-size:0.8rem; letter-spacing:1px; text-transform:uppercase; border-bottom:1px solid #333;">${t}</span>`).join('')}
                            </div>
                            <a href="${p.links[0]?.url || '#'}" target="_blank" class="btn-luxury">EXPLORE</a>
                        </div>
                    </div>
                `).join('')}
            </section>
        `;

        // 4. EXPERIENCE: Minimal List
        const expHTML = `
            <div class="section-divider"></div>
            <section id="experience">
                <h2>${d.experience.title[state.lang]}</h2>
                <div style="border-left: 1px solid #333; padding-left: 2rem;">
                    ${d.experience.items.map(item => `
                        <div style="margin-bottom: 3rem;">
                            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${item.role[state.lang]}</h3>
                            <div style="color: var(--accent-burgundy); font-family: var(--font-body); letter-spacing: 0.1em; margin-bottom: 1rem;">
                                ${item.company} | ${item.dates[state.lang]}
                            </div>
                            <p>${item.description[0][state.lang]}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;

        // 5. CONTACT: Luxury Form
        const contactHTML = `
             <div class="section-divider"></div>
             <section id="contact">
                <h2>${d.contact.title[state.lang]}</h2>
                <p style="margin-bottom: 3rem;">${d.contact.text[state.lang]}</p>
                
                <form class="contact-form" onsubmit="event.preventDefault(); alert('Missatge enviat (Demo)');">
                    <input type="text" placeholder="${d.contact.form.name_label[state.lang]}">
                    <input type="email" placeholder="${d.contact.form.email_label[state.lang]}">
                    <textarea rows="4" placeholder="${d.contact.form.message_label[state.lang]}"></textarea>
                    <button type="submit" class="btn-luxury">${d.contact.form.submit_btn[state.lang]}</button>
                </form>
             </section>
        `;

        // Combine
        el.main.innerHTML = heroHTML + projectsHTML + expHTML + contactHTML;

        // Update Lang Text
        document.getElementById('lang-text').innerText = state.lang.toUpperCase();
    }

    // Helper
    function getIconForSection(id) {
        const map = {
            'about': 'user',
            'experience': 'briefcase',
            'projects': 'layer-group',
            'skills': 'code',
            'education': 'graduation-cap',
            'awards': 'trophy',
            'contact': 'envelope'
        };
        return map[id] || 'circle';
    }

    // Listeners
    window.toggleLang = () => {
        state.lang = state.lang === 'en' ? 'ca' : 'en';
        localStorage.setItem('lang', state.lang);
        renderAll();
    };

    init();
});
