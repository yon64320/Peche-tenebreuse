/**
 * page-services.js - Script spécifique à la page Services
 */

let allServices = [];
let filteredServices = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Charger les données nécessaires
  const data = await window.App.initApp({
    dataFiles: ['site', 'pages', 'services'],
    onDataLoaded: (data) => {
      renderServicesPage(data);
    }
  });
});

/**
 * Rendu de la page Services
 * @param {Object} data - Données chargées (site, pages, services)
 */
function renderServicesPage(data) {
  const pageData = data.pages.services;
  if (!pageData) return;

  allServices = data.services.services || [];
  filteredServices = [...allServices];

  // Rendu du hero
  renderHero(pageData.hero);

  // Rendu de l'introduction et avertissement
  renderIntro(pageData.intro);

  // Rendu des filtres
  renderFilters(data.services.categories);

  // Rendu des services
  renderServices(filteredServices);

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
 * Rendu de l'introduction et avertissement
 * @param {Object} introData - Données de l'introduction
 */
function renderIntro(introData) {
  const introSection = document.getElementById('intro');
  if (!introSection) return;

  const html = `
    <div class="container">
      <p style="text-align: center; margin-bottom: 1.5rem; color: var(--color-text-light); max-width: 800px; margin-left: auto; margin-right: auto;">${introData.text}</p>
      <div class="warning-box">
        <strong>⚠️ ${introData.warning}</strong>
      </div>
    </div>
  `;

  introSection.innerHTML = html;
}

/**
 * Rendu des filtres par catégorie
 * @param {Array} categories - Liste des catégories
 */
function renderFilters(categories) {
  const filtersSection = document.getElementById('filters');
  if (!filtersSection) return;

  let html = `
    <div class="container">
      <div class="services-filters">
        <button class="filter-btn active" data-category="all">Tous</button>
  `;

  categories.forEach(category => {
    html += `
      <button class="filter-btn" data-category="${category.id}">
        ${category.icon} ${category.name}
      </button>
    `;
  });

  html += `
      </div>
    </div>
  `;

  filtersSection.innerHTML = html;

  // Ajouter les event listeners
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.category;
      filterServices(category);
      
      // Mise à jour de l'état actif
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}

/**
 * Filtrage des services par catégorie
 * @param {string} categoryId - ID de la catégorie ('all' pour tout afficher)
 */
function filterServices(categoryId) {
  if (categoryId === 'all') {
    filteredServices = [...allServices];
  } else {
    filteredServices = allServices.filter(service => service.category === categoryId);
  }
  
  renderServices(filteredServices);
  
  // Réinitialiser les animations
  setTimeout(() => {
    window.App.initScrollAnimations();
  }, 100);
}

/**
 * Rendu des services
 * @param {Array} services - Liste des services à afficher
 */
function renderServices(services) {
  const servicesSection = document.getElementById('services-grid');
  if (!servicesSection) return;

  if (services.length === 0) {
    servicesSection.innerHTML = `
      <div class="container">
        <p class="text-center" style="color: var(--color-text-muted);">Aucun service trouvé dans cette catégorie.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="container">
      <div class="cards-grid">
  `;

  services.forEach(service => {
    const priceText = window.App.formatPrice(service.price, service.priceFrom);
    const unitText = window.App.formatUnit(service);
    const badge = service.badge ? `<span class="card-badge">${service.badge}</span>` : '';

    html += `
      <div class="service-card">
        ${badge}
        <div class="service-header">
          <div>
            <h3 class="card-title">${service.name}</h3>
            <p class="card-description" style="margin-bottom: 0;">${service.description}</p>
          </div>
        </div>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
          <div class="service-price">
            ${priceText}<span class="service-price-unit">${unitText}</span>
          </div>
          ${service.note ? `<p class="service-note">${service.note}</p>` : ''}
        </div>
        <div class="service-actions">
          <button class="btn btn-outline" onclick="showServiceDetails('${service.id}')" style="flex: 1;">Voir détails</button>
          <a href="devis.html?service=${service.id}" class="btn btn-primary" style="flex: 1; text-align: center;">Devis</a>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  servicesSection.innerHTML = html;
}

/**
 * Affiche les détails d'un service dans une modal
 * @param {string} serviceId - ID du service
 */
function showServiceDetails(serviceId) {
  const service = allServices.find(s => s.id === serviceId);
  if (!service) return;

  const priceText = window.App.formatPrice(service.price, service.priceFrom);
  const unitText = window.App.formatUnit(service);

  const modalHtml = `
    <div class="modal active" id="serviceModal">
      <div class="modal-content">
        <button class="modal-close" onclick="closeServiceModal()" aria-label="Fermer">✕</button>
        <h2>${service.name}</h2>
        <div style="margin: 1.5rem 0;">
          <div class="service-price" style="font-size: 2rem;">
            ${priceText}<span class="service-price-unit">${unitText}</span>
          </div>
          ${service.note ? `<p class="service-note" style="margin-top: 0.5rem;">${service.note}</p>` : ''}
        </div>
        <p style="color: var(--color-text-light); line-height: 1.8; margin-bottom: 1.5rem;">${service.descriptionLong || service.description}</p>
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <a href="devis.html?service=${service.id}" class="btn btn-primary" style="flex: 1; text-align: center;">Demander un devis</a>
          <button class="btn btn-outline" onclick="closeServiceModal()">Fermer</button>
        </div>
      </div>
    </div>
  `;

  // Créer et insérer la modal
  const existingModal = document.getElementById('serviceModal');
  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Fermer au clic en dehors
  document.getElementById('serviceModal').addEventListener('click', (e) => {
    if (e.target.id === 'serviceModal') {
      closeServiceModal();
    }
  });
}

/**
 * Ferme la modal des détails
 */
function closeServiceModal() {
  const modal = document.getElementById('serviceModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// Exposer la fonction globalement
window.showServiceDetails = showServiceDetails;
window.closeServiceModal = closeServiceModal;
