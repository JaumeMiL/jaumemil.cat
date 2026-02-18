document.addEventListener('DOMContentLoaded', () => {
    const state = {
        lang: 'en',
        data: null
    };

    const container = document.getElementById('dynamic-content');
    const langToggle = document.getElementById('lang-toggle');

    async function init() {
        try {
            // Fetch from parent directory
            const response = await fetch('../content.json?t=' + new Date().getTime());
            state.data = await response.json();
            render();
        } catch (error) {
            console.error(error);
            container.innerHTML = '<h1>Match Postponed (Error Loading Data)</h1>';
        }
    }

    function render() {
        if (!state.data) return;

        // --- 1. About (Player Profile) ---
        const about = state.data.about;

        let html = `
            <section id="about">
                <h2 class="section-title">${about.title[state.lang]}</h2>
                <div class="card-grid">
                    <div class="player-card" style="grid-column: span 2;">
                        <span class="card-stat">INFO</span>
                        <p class="card-desc" style="font-size: 1.2rem;">${about.summary[state.lang]}</p>
                    </div>
        `;

        // Programming Languages as "Technical Skills"
        html += `
            <div class="player-card">
                <span class="card-stat">SKILLS</span>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
                    ${about.languages.map(l => `<span style="background:var(--blau); padding:0.25rem 0.5rem; color:white; font-weight:bold;">${l}</span>`).join('')}
                </div>
            </div>
        `;

        // Highlights
        about.highlights.forEach(h => {
            html += `
                <div class="player-card">
                    <span class="card-stat" style="font-size: 1.5rem;">${h.title[state.lang]}</span>
                    <p class="card-desc">${h.desc[state.lang]}</p>
                </div>
            `;
        });

        html += `</div></section>`;

        // --- 2. Experience (Season Stats) ---
        const exp = state.data.experience;
        html += `
            <section id="experience">
                <h2 class="section-title">${exp.title[state.lang]}</h2>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>SEASON</th>
                            <th>CLUB (COMPANY)</th>
                            <th>ROLE</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        exp.items.forEach(item => {
            html += `
                <tr>
                    <td style="color:var(--gold); font-weight:bold;">${item.dates[state.lang] || item.dates}</td>
                    <td>${item.company}</td>
                    <td>${item.role[state.lang]}</td>
                </tr>
            `;
        });

        html += `</tbody></table></section>`;

        // --- 3. Projects (Goal Highlights) ---
        const proj = state.data.projects;
        html += `
            <section id="projects">
                <h2 class="section-title">${proj.title[state.lang]}</h2>
                <div class="card-grid">
        `;

        proj.items.forEach(p => {
            html += `
                <div class="player-card">
                    <div style="height: 200px; background: #333; margin: -2rem -2rem 1rem -2rem; overflow:hidden;">
                        <img src="../${p.image}" style="width:100%; height:100%; object-fit:cover; opacity:0.8;">
                    </div>
                    <span class="card-title">${p.title[state.lang]}</span>
                    <p class="card-desc">${p.desc[state.lang]}</p>
                    <div style="margin-top:1rem;">
                        ${p.tags.map(t => `<span style="color:var(--grana); font-weight:bold; margin-right:0.5rem;">#${t}</span>`).join('')}
                    </div>
                </div>
            `;
        });

        html += `</div></section>`;

        // --- 4. Contact (Transfer Request) ---
        const contact = state.data.contact;
        html += `
            <section id="contact" style="text-align:center;">
                <h2 class="section-title" style="border:none; text-align:center;">${contact.title[state.lang]}</h2>
                <p style="font-size:1.5rem; margin-bottom:2rem;">${contact.text[state.lang]}</p>
                
                <a href="mailto:${contact.email}" class="btn-action">
                    ${state.lang === 'ca' ? 'Envia Oferta' : 'Send Offer'}
                </a>
                
                <div style="margin-top: 3rem; display:flex; justify-content:center; gap:2rem;">
                    <a href="${contact.linkedin}" style="color:white; font-size:1.2rem;">LINKEDIN</a>
                    <a href="${contact.github}" style="color:white; font-size:1.2rem;">GITHUB</a>
                </div>
            </section>
        `;

        container.innerHTML = html;

        // Update static elements
        document.getElementById('hero-role').textContent = state.data.hero.role[state.lang].toUpperCase();
    }

    langToggle.addEventListener('click', () => {
        state.lang = state.lang === 'ca' ? 'en' : 'ca';
        langToggle.textContent = state.lang === 'ca' ? 'EN' : 'CA';
        render();
    });

    init();
});
