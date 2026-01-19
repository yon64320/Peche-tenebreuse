/**
 * page-home.js - Script spécifique à la page d'accueil
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Charger les données nécessaires
  const data = await window.App.initApp({
    dataFiles: ['site', 'pages', 'services'],
    onDataLoaded: (data) => {
      renderHomePage(data);
    }
  });
});

/**
 * Rendu de la page d'accueil
 * @param {Object} data - Données chargées (site, pages, services)
 */
function renderHomePage(data) {
  const pageData = data.pages.home;
  if (!pageData) return;

  // Rendu du hero
  renderHero(pageData.hero);

  // Rendu des expertises
  renderExpertises(pageData.expertises);

  // Rendu de la section Before/After
  renderBeforeAfter(pageData.beforeAfter);

  // Rendu de la section "Pourquoi nous"
  renderWhyUs(pageData.whyUs, data.site.stats);

  // Réinitialiser les animations après le rendu
  setTimeout(() => {
    window.App.initScrollAnimations();
  }, 100);
}

/**
 * Rendu de la section hero
 * @param {Object} heroData - Données du hero
 */
function renderHero(heroData) {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const html = `
    <div class="hero-content">
      <h1 class="hero-title">${heroData.title}</h1>
      <p class="hero-subtitle">${heroData.subtitle}</p>
      <div class="hero-cta">
        <a href="${heroData.cta.primary.href}" class="btn btn-primary">${heroData.cta.primary.label}</a>
        <a href="${heroData.cta.secondary.href}" class="btn btn-secondary">${heroData.cta.secondary.label}</a>
      </div>
    </div>
  `;

  heroSection.innerHTML = html;
}

/**
 * Rendu de la section expertises
 * @param {Object} expertisesData - Données des expertises
 */
function renderExpertises(expertisesData) {
  const expertisesSection = document.getElementById('expertises');
  if (!expertisesSection) return;

  let html = `
    <div class="container">
      <h2 class="section-title">${expertisesData.title}</h2>
      <p class="section-subtitle">${expertisesData.subtitle}</p>
      <div class="cards-grid">
  `;

  expertisesData.items.forEach(item => {
    html += `
      <div class="card">
        <div class="card-icon">${item.icon}</div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-description">${item.description}</p>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  expertisesSection.innerHTML = html;
}

/**
 * Rendu de la section Before/After
 * @param {Object} beforeAfterData - Données de la section
 */
function renderBeforeAfter(beforeAfterData) {
  const beforeAfterSection = document.getElementById('before-after');
  if (!beforeAfterSection) return;

  const html = `
    <div class="container">
      <h2 class="section-title">${beforeAfterData.title}</h2>
      <p class="section-subtitle">${beforeAfterData.subtitle}</p>
      <p class="text-center" style="margin-bottom: 2rem; color: var(--color-text-light);">${beforeAfterData.description}</p>
      <div class="gallery">
        <div class="gallery-item">
          <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <span>Avant</span>
          </div>
        </div>
        <div class="gallery-item">
          <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <span>Après</span>
          </div>
        </div>
      </div>
    </div>
  `;

  beforeAfterSection.innerHTML = html;
}

/**
 * Rendu de la section "Pourquoi nous"
 * @param {Object} whyUsData - Données de la section
 * @param {Object} statsData - Données des statistiques
 */
function renderWhyUs(whyUsData, statsData) {
  const whyUsSection = document.getElementById('why-us');
  if (!whyUsSection) return;

  // Section des raisons
  let html = `
    <div class="container">
      <h2 class="section-title">${whyUsData.title}</h2>
      <p class="section-subtitle">${whyUsData.subtitle}</p>
      <div class="cards-grid">
  `;

  whyUsData.items.forEach(item => {
    html += `
      <div class="card">
        <div class="card-icon">${item.icon}</div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-description">${item.description}</p>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  // Section des statistiques
  if (statsData) {
    html += `
      <div class="container" style="margin-top: 4rem;">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">10+</div>
            <div class="stat-label">${statsData.experience}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">📍</div>
            <div class="stat-label">${statsData.interventions}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">100%</div>
            <div class="stat-label">${statsData.satisfaction}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">⚡</div>
            <div class="stat-label">${statsData.reactive}</div>
          </div>
        </div>
      </div>
    `;
  }

  whyUsSection.innerHTML = html;
}
