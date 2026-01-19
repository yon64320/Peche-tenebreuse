/**
 * page-about.js - Script spécifique à la page À propos
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Charger les données nécessaires
  const data = await window.App.initApp({
    dataFiles: ['site', 'pages'],
    onDataLoaded: (data) => {
      renderAboutPage(data);
    }
  });
});

/**
 * Rendu de la page À propos
 * @param {Object} data - Données chargées (site, pages)
 */
function renderAboutPage(data) {
  const pageData = data.pages.about;
  if (!pageData) return;

  // Rendu du hero
  renderHero(pageData.hero);

  // Rendu de l'histoire
  renderStory(pageData.story);

  // Rendu des valeurs
  renderValues(pageData.values);

  // Rendu de la méthode
  renderMethod(pageData.method);

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
    </div>
  `;

  heroSection.innerHTML = html;
}

/**
 * Rendu de la section histoire
 * @param {Object} storyData - Données de l'histoire
 */
function renderStory(storyData) {
  const storySection = document.getElementById('story');
  if (!storySection) return;

  // Convertir les sauts de ligne en paragraphes
  const paragraphs = storyData.content.split('\n\n').filter(p => p.trim());

  const html = `
    <div class="container">
      <h2 class="section-title">${storyData.title}</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        ${paragraphs.map(p => `<p style="margin-bottom: 1.5rem; color: var(--color-text-light); line-height: 1.8;">${p.trim()}</p>`).join('')}
      </div>
    </div>
  `;

  storySection.innerHTML = html;
}

/**
 * Rendu de la section valeurs
 * @param {Object} valuesData - Données des valeurs
 */
function renderValues(valuesData) {
  const valuesSection = document.getElementById('values');
  if (!valuesSection) return;

  let html = `
    <div class="container">
      <h2 class="section-title">${valuesData.title}</h2>
      <div class="cards-grid">
  `;

  valuesData.items.forEach(item => {
    html += `
      <div class="card">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-description">${item.description}</p>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  valuesSection.innerHTML = html;
}

/**
 * Rendu de la section méthode
 * @param {Object} methodData - Données de la méthode
 */
function renderMethod(methodData) {
  const methodSection = document.getElementById('method');
  if (!methodSection) return;

  let html = `
    <div class="container">
      <h2 class="section-title">${methodData.title}</h2>
      <div class="cards-grid" style="grid-template-columns: 1fr;">
  `;

  if (window.innerWidth >= 768) {
    html = html.replace('grid-template-columns: 1fr;', 'grid-template-columns: repeat(2, 1fr);');
  }

  methodData.steps.forEach(step => {
    html += `
      <div class="card" style="position: relative; padding-left: 4rem;">
        <div style="position: absolute; left: 1.5rem; top: 1.5rem; width: 3rem; height: 3rem; background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: var(--color-white);">${step.number}</div>
        <h3 class="card-title">${step.title}</h3>
        <p class="card-description">${step.description}</p>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  methodSection.innerHTML = html;
}
