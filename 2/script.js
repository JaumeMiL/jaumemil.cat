document.addEventListener('DOMContentLoaded', () => {
    const state = {
        lang: 'en',
        data: null
    };

    const container = document.getElementById('main-content');
    const langBtn = document.getElementById('lang-btn');

    async function init() {
        try {
            const response = await fetch('../content.json?t=' + new Date().getTime());
            state.data = await response.json();
            render();
        } catch (error) {
            console.error(error);
        }
    }

    function render() {
        if (!state.data) return;

        const { hero, about, skills, experience, projects, contact } = state.data;
        const l = state.lang;

        let html = '';

        // 1. Hero Card (Large, Span 2x2)
        html += `
            <div class="bento-card card-hero" id="home">
                <div>
                    <h3>${hero.role[l]}</h3>
                    <h1 class="hero-title">${hero.name.split(' ').join('<br>')}</h1>
                </div>
                <div>
                    <p>${hero.location[l]}</p>
                    <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                        <a href="${contact.linkedin}" target="_blank" style="color:white;">LinkedIn ↗</a>
                        <a href="${contact.github}" target="_blank" style="color:white;">GitHub ↗</a>
                    </div>
                </div>
            </div>
        `;

        // 2. About Card (Span 2)
        html += `
            <div class="bento-card card-about" id="summary">
                <h3>${about.title[l]}</h3>
                <p>${about.summary[l]}</p>
            </div>
        `;

        // 3. Skills Column (Tall, Span 1x2)
        html += `
            <div class="bento-card card-skills">
                <h3>${skills.title[l]}</h3>
                <div class="skill-list">
                    ${about.languages.map(lang => `
                        <div class="skill-item">
                            <span>${lang}</span>
                            <span style="color:var(--accent);">●</span>
                        </div>
                    `).join('')}
                    <!-- Adding other technical skills -->
                    ${skills.categories[0].items.slice(0, 4).map(s => `
                        <div class="skill-item">
                            <span>${s}</span>
                            <span style="color:#444;">○</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // 4. Experience (Span 2)
        html += `
            <div class="bento-card card-experience" id="work">
                <h3>${experience.title[l]}</h3>
                ${experience.items.slice(0, 3).map(item => `
                    <div class="exp-item">
                        <div class="exp-role">${item.role[l]}</div>
                        <div class="exp-date">${item.company} | ${item.dates[l] || item.dates}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // 5. Projects (Individual Cards)
        projects.items.forEach(p => {
            html += `
                <div class="bento-card card-project" style="background-image: url('../${p.image}');" id="projects">
                    <div class="project-info">
                        <h2>${p.title[l]}</h2>
                        <p style="font-size:0.85rem;">${p.desc[l]}</p>
                    </div>
                </div>
            `;
        });

        // 6. Contact (Small)
        html += `
            <div class="bento-card" style="background:var(--accent); border:none; color:black;">
                <h3 style="color:rgba(0,0,0,0.6);">CONTACT</h3>
                <a href="mailto:${contact.email}" style="font-size:1.5rem; font-weight:bold; color:black; text-decoration:none;">
                    ${l === 'ca' ? "Parlem?" : "Let's Talk"} ↗
                </a>
            </div>
        `;

        container.innerHTML = html;
    }

    langBtn.addEventListener('click', () => {
        state.lang = state.lang === 'ca' ? 'en' : 'ca';
        langBtn.textContent = state.lang.toUpperCase();
        render();
    });

    init();
});
