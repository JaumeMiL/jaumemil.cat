document.addEventListener('DOMContentLoaded', () => {
    const state = {
        lang: 'en',
        data: null
    };

    const container = document.getElementById('content-area');
    const langToggle = document.getElementById('lang-toggle');

    async function init() {
        try {
            const response = await fetch('../content.json?t=' + new Date().getTime());
            state.data = await response.json();
            render();
        } catch (error) {
            container.innerHTML = '<h1>FATAL_ERROR: DATA_CORRUPTED</h1>';
        }
    }

    function render() {
        if (!state.data) return;

        const { hero, about, skills, experience, projects, contact } = state.data;
        const l = state.lang;

        // Helper to uppercase everything for brutalist feel
        const text = (str) => (str || '').toUpperCase();

        let html = '';

        // 1. INTRO
        html += `
            <section id="intro">
                <h1>${text(hero.name)}</h1>
                <div style="border: 2px solid black; padding: 2rem; background: var(--accent);">
                    <p style="font-weight:bold; font-size:1.5rem;">> ROLE: ${text(hero.role[l])}</p>
                    <p>> LOC: ${text(hero.location[l])}</p>
                    <p>> STATUS: ${text(hero.availability[l])}</p>
                </div>
                <div style="margin-top: 2rem;">
                    <p>${about.summary[l]}</p>
                </div>
            </section>
        `;

        // 2. STACK
        html += `
            <section id="stack">
                <h2>${text(skills.title[l])}</h2>
                <div class="tags">
                    ${about.languages.map(lang => `<div class="tag-brut">${text(lang)}</div>`).join('')}
                    ${skills.categories[0].items.map(s => `<div class="tag-brut" style="background:#eee;">${text(s)}</div>`).join('')}
                </div>
            </section>
        `;

        // 3. WORK
        html += `
            <section id="work">
                <h2>${text(experience.title[l])}</h2>
                <div style="border: var(--border);">
                    ${experience.items.map(item => `
                        <div class="exp-row">
                            <div class="exp-date" style="padding-left:1rem;">${item.dates[l] || item.dates}</div>
                            <div style="padding-right:1rem;">
                                <strong>${text(item.role[l])}</strong> @ ${text(item.company)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;

        // 4. PROJECTS
        html += `
            <section id="projects">
                <h2>${text(projects.title[l])}</h2>
                ${projects.items.map(p => `
                    <div class="proj-block">
                        <img src="../${p.image}" class="proj-img">
                        <div class="proj-info">
                            <h3 style="font-size:2rem; margin-bottom:1rem; font-family:var(--font-disp);">${text(p.title[l])}</h3>
                            <p>${p.desc[l]}</p>
                            <div class="tags" style="margin: 1rem 0;">
                                ${p.tags.map(t => `<span style="background:black; color:white; padding:2px 8px; font-size:0.8rem;">${t}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </section>
        `;

        // Footer block
        html += `
             <div style="padding: 4rem 0; border-top: 5px solid black;">
                <h1 style="font-size: 3rem;">${text(contact.title[l])}</h1>
                <a href="mailto:${contact.email}" style="font-size:2rem; color:black; background:var(--accent); text-decoration:none; padding:1rem; border:2px solid black; display:inline-block;">
                    ${contact.email.toUpperCase()}
                </a>
             </div>
        `;

        container.innerHTML = html;

        // Update marquee
        document.querySelector('.marquee-content').textContent =
            `${text(hero.name)} — ${text(hero.role[l])} — ${text(hero.location[l])} — `.repeat(10);
    }

    langToggle.addEventListener('click', () => {
        state.lang = state.lang === 'ca' ? 'en' : 'ca';
        render();
    });

    init();
});
