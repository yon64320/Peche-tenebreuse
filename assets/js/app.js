/**
 * App.js - Application complète unifiée
 * Gestion du chargement JSON, rendu navbar/footer, animations et toutes les pages
 */

// Cache pour les données JSON chargées
let appData = null;

/**
 * Charge le fichier JSON unique de manière asynchrone
 * @returns {Promise<Object>} - Les données JSON parsées
 */
async function loadJSON() {
  try {
    const response = await fetch('data/data.json');
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors du chargement de data.json:', error);
    throw error;
  }
}

/**
 * Charge les données JSON avec cache
 * @returns {Promise<Object>} - Les données chargées
 */
async function loadData() {
  if (!appData) {
    try {
      appData = await loadJSON();
    } catch (error) {
      console.error('Impossible de charger data.json:', error);
      throw error;
    }
  }
  return appData;
}

/**
 * Met à jour les balises meta SEO depuis les données
 * @param {Object} seoData - Données SEO depuis site.json
 * @param {Object} pageData - Données spécifiques de la page (optionnel)
 */
function updateSEO(seoData, pageData = {}) {
  const title = pageData.title || seoData.default.title || 'La Pêche Ténébreuse';
  const description = pageData.description || seoData.default.description || '';

  // Mise à jour du titre
  document.title = title;

  // Mise à jour de la meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = description;

  // Mise à jour des balises Open Graph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = title;
  else {
    const meta = document.createElement('meta');
    meta.property = 'og:title';
    meta.content = title;
    document.head.appendChild(meta);
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.content = description;
  else {
    const meta = document.createElement('meta');
    meta.property = 'og:description';
    meta.content = description;
    document.head.appendChild(meta);
  }

  if (seoData.og) {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.content = seoData.og.image;
    else {
      const meta = document.createElement('meta');
      meta.property = 'og:image';
      meta.content = seoData.og.image;
      document.head.appendChild(meta);
    }
  }
}

/**
 * Rendu de la navbar depuis les données
 * @param {Object} navData - Données de navigation depuis site.json
 */
function renderNavbar(navData) {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  let html = `
    <div class="navbar">
      <a href="index.html" class="logo">${navData.branding.logo.text || navData.branding.name}</a>
      <ul class="nav-links">
  `;

  navData.navigation.links.forEach(link => {
    const isActive = link.href === currentPage ? 'active' : '';
    html += `
      <li>
        <a href="${link.href}" class="${isActive}">${link.label}</a>
      </li>
    `;
  });

  html += `
      </ul>
      <a href="${navData.navigation.cta.href}" class="nav-cta">${navData.navigation.cta.label}</a>
      <button class="mobile-menu-toggle" aria-label="Menu" id="mobileMenuToggle">☰</button>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      <ul>
  `;

  navData.navigation.links.forEach(link => {
    html += `<li><a href="${link.href}">${link.label}</a></li>`;
  });

  html += `
        <li><a href="${navData.navigation.cta.href}" class="nav-cta">${navData.navigation.cta.label}</a></li>
      </ul>
    </div>
  `;

  navbar.innerHTML = html;

  // Gestion du menu mobile
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      const isActive = mobileMenu.classList.contains('active');
      mobileMenuToggle.textContent = isActive ? '✕' : '☰';
      mobileMenuToggle.setAttribute('aria-expanded', isActive);
    });
  }
}

/**
 * Rendu du footer depuis les données
 * @param {Object} footerData - Données du footer depuis site.json
 */
function renderFooter(footerData) {
  const footer = document.getElementById('footer');
  if (!footer) return;

  const html = `
    <div class="footer-content">
      <div class="footer-section">
        <h3>${footerData.branding.name}</h3>
        <p>${footerData.footer.description}</p>
      </div>
      <div class="footer-section">
        <h3>Contact</h3>
        <p>📞 ${footerData.footer.contact.phone}</p>
        <p>✉️ <a href="mailto:${footerData.footer.contact.email}">${footerData.footer.contact.email}</a></p>
        <p>📍 ${footerData.footer.contact.zone}</p>
        <p>🕒 ${footerData.footer.contact.horaires}</p>
      </div>
      <div class="footer-section">
        <h3>Liens</h3>
        <ul class="footer-links">
          ${footerData.footer.links.map(link => 
            `<li><a href="${link.href}">${link.label}</a></li>`
          ).join('')}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>${footerData.footer.copyright}</p>
    </div>
  `;

  footer.innerHTML = html;
}

/**
 * Gestion du header sticky avec effet au scroll
 */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
}

/**
 * Intersection Observer pour les animations au scroll
 */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observer tous les éléments avec la classe 'card' ou 'service-card'
  document.querySelectorAll('.card, .service-card, .stat-item, .gallery-item').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Initialisation de l'application
 * @param {Function} onDataLoaded - Callback appelé après le chargement des données
 */
async function initApp(onDataLoaded = null) {
  try {
    // Afficher un état de chargement
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'block';
    }

    // Charger les données
    const data = await loadData();

    // Vérifier que les données essentielles sont présentes
    if (!data.site) {
      throw new Error('Impossible de charger les données du site');
    }

    // Rendu de la navbar et du footer
    renderNavbar(data.site);
    renderFooter(data.site);

    // Mise à jour SEO
    updateSEO(data.site.seo);

    // Initialiser les animations et interactions
    initStickyHeader();
    initScrollAnimations();

    // Masquer le chargement
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }

    // Appeler le callback si fourni
    if (onDataLoaded && typeof onDataLoaded === 'function') {
      onDataLoaded(data);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    
    // Afficher un message d'erreur
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="error-message">
          <h2>Erreur de chargement</h2>
          <p>Impossible de charger les données du site. Veuillez vérifier que vous utilisez un serveur HTTP local.</p>
          <p><strong>Note:</strong> Pour lancer le site, utilisez: <code>python -m http.server 8000</code></p>
        </div>
      `;
    }
  }
}

/**
 * Utilitaire pour formater un prix
 * @param {number} price - Prix à formater
 * @param {boolean} from - Indique si c'est "à partir de"
 * @returns {string} - Prix formaté
 */
function formatPrice(price, from = false) {
  const prefix = from ? 'À partir de ' : '';
  return `${prefix}${price.toFixed(0)}€`;
}

/**
 * Utilitaire pour obtenir l'unité de prix formatée
 * @param {Object} service - Service avec unit et unitLabel
 * @returns {string} - Unité formatée
 */
function formatUnit(service) {
  if (service.unit === 'forfait') {
    return service.unitLabel || 'forfait';
  }
  return `/ ${service.unit}${service.unitLabel ? ' (' + service.unitLabel + ')' : ''}`;
}

// ============================================================================
// PAGE HOME
// ============================================================================

/**
 * Rendu de la page d'accueil
 * @param {Object} data - Données chargées (site, pages, services)
 */
function renderHomePage(data) {
  const pageData = data.pages.home;
  if (!pageData) return;

  // Rendu du hero
  renderHomeHero(pageData.hero);

  // Rendu des expertises
  renderExpertises(pageData.expertises);

  // Rendu de la section Before/After
  renderBeforeAfter(pageData.beforeAfter);

  // Rendu de la section "Pourquoi nous"
  renderWhyUs(pageData.whyUs, data.site.stats);

  // Réinitialiser les animations après le rendu
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}

function renderHomeHero(heroData) {
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

// ============================================================================
// PAGE ABOUT
// ============================================================================

/**
 * Rendu de la page À propos
 * @param {Object} data - Données chargées (site, pages)
 */
function renderAboutPage(data) {
  const pageData = data.pages.about;
  if (!pageData) return;

  // Rendu du hero
  renderAboutHero(pageData.hero);

  // Rendu de l'histoire
  renderStory(pageData.story);

  // Rendu des valeurs
  renderValues(pageData.values);

  // Rendu de la méthode
  renderMethod(pageData.method);

  // Réinitialiser les animations après le rendu
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}

function renderAboutHero(heroData) {
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

// ============================================================================
// PAGE CONTACT
// ============================================================================

let servicesDataContact = [];

/**
 * Rendu de la page Contact
 * @param {Object} data - Données chargées (site, pages)
 */
function renderContactPage(data) {
  const pageData = data.pages.contact;
  if (!pageData) return;

  // Rendu du hero
  renderContactHero(pageData.hero);

  // Rendu de l'introduction
  renderContactIntro(pageData.intro);

  // Rendu des coordonnées
  renderContactInfo(data.site.footer.contact);
}

function renderContactHero(heroData) {
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

function renderContactIntro(introData) {
  const introSection = document.getElementById('intro');
  if (!introSection) return;

  const html = `
    <div class="container">
      <p class="text-center" style="max-width: 800px; margin: 0 auto; color: var(--color-text-light);">${introData.text}</p>
    </div>
  `;

  introSection.innerHTML = html;
}

function renderContactInfo(contactData) {
  const contactInfoSection = document.getElementById('contact-info');
  if (!contactInfoSection) return;

  const html = `
    <div class="container">
      <div class="cards-grid" style="grid-template-columns: 1fr;">
        <div class="card">
          <h3 class="card-title">Coordonnées</h3>
          <div style="color: var(--color-text-light); line-height: 2;">
            <p><strong>📞 Téléphone:</strong><br><a href="tel:${contactData.phone}">${contactData.phone}</a></p>
            <p><strong>✉️ Email:</strong><br><a href="mailto:${contactData.email}">${contactData.email}</a></p>
            <p><strong>📍 Zone d'intervention:</strong><br>${contactData.zone}</p>
            <p><strong>🕒 Horaires:</strong><br>${contactData.horaires}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  contactInfoSection.innerHTML = html;
}

/**
 * Initialisation du formulaire de contact
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validation
    if (validateContactForm(form)) {
      // Afficher un message de succès (simulation, pas de backend)
      showSuccessMessage('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
      form.reset();
    }
  });

  // Validation en temps réel
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateContactField(input));
    input.addEventListener('input', () => clearContactFieldError(input));
  });
}

function validateContactForm(form) {
  let isValid = true;
  const fields = ['name', 'email', 'message'];

  fields.forEach(fieldName => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field && !validateContactField(field)) {
      isValid = false;
    }
  });

  // Validation email spéciale
  const emailField = form.querySelector('[name="email"]');
  if (emailField && emailField.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
      showContactFieldError(emailField, 'Veuillez entrer une adresse email valide');
      isValid = false;
    }
  }

  return isValid;
}

function validateContactField(field) {
  const value = field.value.trim();
  const isRequired = field.hasAttribute('required');
  
  if (isRequired && !value) {
    showContactFieldError(field, 'Ce champ est obligatoire');
    return false;
  }

  clearContactFieldError(field);
  return true;
}

function showContactFieldError(field, message) {
  clearContactFieldError(field);
  
  field.classList.add('error');
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error show';
  errorEl.textContent = message;
  field.parentElement.appendChild(errorEl);
}

function clearContactFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.parentElement.querySelector('.form-error');
  if (errorEl) {
    errorEl.remove();
  }
}

function showSuccessMessage(message) {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const existingSuccess = form.querySelector('.form-success');
  if (existingSuccess) {
    existingSuccess.remove();
  }

  const successEl = document.createElement('div');
  successEl.className = 'form-success show';
  successEl.textContent = message;
  form.insertBefore(successEl, form.firstChild);

  // Scroll vers le message
  successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Supprimer après 5 secondes
  setTimeout(() => {
    successEl.classList.remove('show');
    setTimeout(() => successEl.remove(), 300);
  }, 5000);
}

// ============================================================================
// PAGE DEVIS
// ============================================================================

let servicesDataDevis = [];
let currentStep = 1;

/**
 * Rendu de la page Devis
 * @param {Object} data - Données chargées (site, pages, services)
 */
function renderDevisPage(data) {
  const pageData = data.pages.devis;
  if (!pageData) return;

  servicesDataDevis = data.services.services || [];

  // Rendu du hero
  renderDevisHero(pageData.hero);

  // Rendu de l'introduction
  renderDevisIntro(pageData.intro);

  // Rendu des services dans le formulaire
  renderServicesSelect(servicesDataDevis);
}

function renderDevisHero(heroData) {
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

function renderDevisIntro(introData) {
  const introSection = document.getElementById('intro');
  if (!introSection) return;

  const html = `
    <div class="container">
      <p class="text-center" style="max-width: 800px; margin: 0 auto; color: var(--color-text-light);">${introData.text}</p>
    </div>
  `;

  introSection.innerHTML = html;
}

function renderServicesSelect(services) {
  const servicesContainer = document.getElementById('services-select');
  if (!servicesContainer) return;

  let html = `
    <div class="cards-grid" style="grid-template-columns: 1fr;">
  `;

  // Grouper par catégorie
  const categories = [...new Set(services.map(s => s.category))];
  
  categories.forEach(categoryId => {
    const categoryServices = services.filter(s => s.category === categoryId);
    const categoryName = getCategoryName(categoryId);
    
    html += `
      <div style="margin-bottom: 2rem;">
        <h4 style="margin-bottom: 1rem; color: var(--color-secondary);">${categoryName}</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
    `;

    categoryServices.forEach(service => {
      const priceText = formatPrice(service.price, service.priceFrom);
      const unitText = formatUnit(service);
      
      html += `
        <label style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background-color: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--border-radius); cursor: pointer; transition: var(--transition-fast);">
          <input type="checkbox" name="services" value="${service.id}" style="width: 20px; height: 20px; cursor: pointer;">
          <div style="flex: 1;">
            <strong>${service.name}</strong>
            <span style="display: block; font-size: 0.875rem; color: var(--color-text-muted); margin-top: 0.25rem;">
              ${priceText}${unitText}
            </span>
          </div>
        </label>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  html += `
    </div>
  `;

  servicesContainer.innerHTML = html;

  // Ajouter les styles hover
  const labels = servicesContainer.querySelectorAll('label');
  labels.forEach(label => {
    label.addEventListener('mouseenter', () => {
      if (!label.querySelector('input').checked) {
        label.style.borderColor = 'var(--color-secondary)';
      }
    });
    label.addEventListener('mouseleave', () => {
      if (!label.querySelector('input').checked) {
        label.style.borderColor = 'var(--color-border)';
      }
    });
    label.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) {
        label.style.borderColor = 'var(--color-secondary)';
        label.style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
      } else {
        label.style.borderColor = 'var(--color-border)';
        label.style.backgroundColor = 'var(--color-bg-card)';
      }
    });
  });
}

function getCategoryName(categoryId) {
  const names = {
    'coque': 'Coque & Structure',
    'finition': 'Finition & Peinture',
    'entretien': 'Entretien & Maintenance',
    'packs': 'Packs & Formules'
  };
  return names[categoryId] || categoryId;
}

function preselectService(serviceId) {
  setTimeout(() => {
    const checkbox = document.querySelector(`input[name="services"][value="${serviceId}"]`);
    if (checkbox) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      // Scroll vers le service
      checkbox.closest('label').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 500);
}

function initDevisForm() {
  const form = document.getElementById('devis-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (validateDevisForm(form)) {
      showSummary(form);
    }
  });

  // Validation en temps réel
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    if (input.type !== 'checkbox') {
      input.addEventListener('blur', () => validateDevisField(input));
      input.addEventListener('input', () => clearDevisFieldError(input));
    }
  });
}

function validateDevisForm(form) {
  let isValid = true;

  // Champs obligatoires
  const requiredFields = ['name', 'email', 'phone', 'boat-type', 'boat-length'];
  requiredFields.forEach(fieldName => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field && !validateDevisField(field)) {
      isValid = false;
    }
  });

  // Validation email
  const emailField = form.querySelector('[name="email"]');
  if (emailField && emailField.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
      showDevisFieldError(emailField, 'Veuillez entrer une adresse email valide');
      isValid = false;
    }
  }

  // Validation téléphone
  const phoneField = form.querySelector('[name="phone"]');
  if (phoneField && phoneField.value) {
    const phoneRegex = /^[0-9+\s\-()]+$/;
    if (!phoneRegex.test(phoneField.value)) {
      showDevisFieldError(phoneField, 'Veuillez entrer un numéro de téléphone valide');
      isValid = false;
    }
  }

  // Validation longueur du bateau
  const lengthField = form.querySelector('[name="boat-length"]');
  if (lengthField && lengthField.value) {
    const length = parseFloat(lengthField.value);
    if (isNaN(length) || length <= 0 || length > 100) {
      showDevisFieldError(lengthField, 'Veuillez entrer une longueur valide (0-100m)');
      isValid = false;
    }
  }

  // Validation services
  const servicesCheckboxes = form.querySelectorAll('input[name="services"]:checked');
  if (servicesCheckboxes.length === 0) {
    const servicesContainer = document.getElementById('services-select');
    if (servicesContainer) {
      showDevisMessage(servicesContainer, 'Veuillez sélectionner au moins un service', 'error');
    }
    isValid = false;
  }

  // Validation RGPD
  const rgpdCheckbox = form.querySelector('[name="rgpd"]');
  if (!rgpdCheckbox || !rgpdCheckbox.checked) {
    showDevisMessage(form, 'Vous devez accepter le traitement de vos données personnelles', 'error');
    isValid = false;
  }

  return isValid;
}

function validateDevisField(field) {
  const value = field.value.trim();
  const isRequired = field.hasAttribute('required');
  
  if (isRequired && !value) {
    showDevisFieldError(field, 'Ce champ est obligatoire');
    return false;
  }

  clearDevisFieldError(field);
  return true;
}

function showDevisFieldError(field, message) {
  clearDevisFieldError(field);
  
  field.classList.add('error');
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error show';
  errorEl.textContent = message;
  field.parentElement.appendChild(errorEl);
}

function clearDevisFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.parentElement.querySelector('.form-error');
  if (errorEl) {
    errorEl.remove();
  }
}

function showDevisMessage(container, message, type = 'error') {
  const messageEl = document.createElement('div');
  messageEl.className = `form-${type} show`;
  messageEl.textContent = message;
  container.insertBefore(messageEl, container.firstChild);

  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => messageEl.remove(), 300);
  }, 5000);
}

function showSummary(form) {
  const formData = new FormData(form);
  const devisData = {
    date: new Date().toISOString(),
    client: {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone')
    },
    bateau: {
      type: formData.get('boat-type'),
      longueur: formData.get('boat-length'),
      materiau: formData.get('boat-material'),
      annee: formData.get('boat-year')
    },
    besoin: {
      services: formData.getAll('services').map(id => {
        const service = servicesDataDevis.find(s => s.id === id);
        return {
          id: id,
          name: service ? service.name : id,
          price: service ? service.price : 0,
          priceFrom: service ? service.priceFrom : false,
          unit: service ? service.unit : ''
        };
      }),
      description: formData.get('description'),
      urgence: formData.get('urgence')
    },
    localisation: {
      ville: formData.get('location-ville'),
      port: formData.get('location-port')
    },
    autres: {
      photos: formData.get('photos-links'),
      rgpd: formData.get('rgpd') === 'on'
    }
  };

  // Rendre le récapitulatif
  renderSummary(devisData);

  // Scroll vers le récapitulatif
  const summarySection = document.getElementById('devis-summary');
  if (summarySection) {
    summarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderSummary(devisData) {
  const summarySection = document.getElementById('devis-summary');
  if (!summarySection) return;

  // Calculer le total estimé
  let totalEstime = 0;
  devisData.besoin.services.forEach(service => {
    totalEstime += service.price;
  });

  const html = `
    <div class="devis-summary">
      <h2 style="margin-bottom: 2rem; color: var(--color-secondary);">Récapitulatif de votre demande de devis</h2>
      
      <div class="summary-section">
        <h3 class="summary-title">Informations client</h3>
        <div class="summary-item">
          <span class="summary-item-label">Nom:</span>
          <span class="summary-item-value">${devisData.client.name}</span>
        </div>
        <div class="summary-item">
          <span class="summary-item-label">Email:</span>
          <span class="summary-item-value">${devisData.client.email}</span>
        </div>
        <div class="summary-item">
          <span class="summary-item-label">Téléphone:</span>
          <span class="summary-item-value">${devisData.client.phone}</span>
        </div>
      </div>

      <div class="summary-section">
        <h3 class="summary-title">Informations bateau</h3>
        <div class="summary-item">
          <span class="summary-item-label">Type:</span>
          <span class="summary-item-value">${devisData.bateau.type === 'voilier' ? 'Voilier' : 'Bateau à moteur'}</span>
        </div>
        <div class="summary-item">
          <span class="summary-item-label">Longueur:</span>
          <span class="summary-item-value">${devisData.bateau.longueur} m</span>
        </div>
        ${devisData.bateau.materiau ? `
        <div class="summary-item">
          <span class="summary-item-label">Matériau:</span>
          <span class="summary-item-value">${devisData.bateau.materiau}</span>
        </div>
        ` : ''}
        ${devisData.bateau.annee ? `
        <div class="summary-item">
          <span class="summary-item-label">Année:</span>
          <span class="summary-item-value">${devisData.bateau.annee}</span>
        </div>
        ` : ''}
      </div>

      <div class="summary-section">
        <h3 class="summary-title">Services demandés</h3>
        ${devisData.besoin.services.map(service => `
          <div class="summary-item">
            <span class="summary-item-label">${service.name}:</span>
            <span class="summary-item-value">${formatPrice(service.price, service.priceFrom)} / ${service.unit || 'forfait'}</span>
          </div>
        `).join('')}
        <div class="summary-item" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border); font-weight: 700;">
          <span class="summary-item-label">Total estimé:</span>
          <span class="summary-item-value" style="color: var(--color-secondary);">${totalEstime.toFixed(0)}€</span>
        </div>
        ${devisData.besoin.description ? `
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
          <strong style="color: var(--color-white);">Description:</strong>
          <p style="color: var(--color-text-light); margin-top: 0.5rem;">${devisData.besoin.description}</p>
        </div>
        ` : ''}
        <div class="summary-item" style="margin-top: 1rem;">
          <span class="summary-item-label">Urgence:</span>
          <span class="summary-item-value">${getUrgenceLabel(devisData.besoin.urgence)}</span>
        </div>
      </div>

      ${devisData.localisation.ville || devisData.localisation.port ? `
      <div class="summary-section">
        <h3 class="summary-title">Localisation</h3>
        ${devisData.localisation.ville ? `
        <div class="summary-item">
          <span class="summary-item-label">Ville:</span>
          <span class="summary-item-value">${devisData.localisation.ville}</span>
        </div>
        ` : ''}
        ${devisData.localisation.port ? `
        <div class="summary-item">
          <span class="summary-item-label">Port:</span>
          <span class="summary-item-value">${devisData.localisation.port}</span>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div class="warning-box" style="margin-top: 2rem;">
        <strong>⚠️ Total indicatif. Un devis précis sera établi après diagnostic sur place.</strong>
      </div>

      <div class="summary-actions">
        <button class="btn btn-primary" onclick="copyDevis()" id="copyBtn">
          📋 Copier le devis
        </button>
        <button class="btn btn-secondary" onclick="downloadDevis()">
          💾 Télécharger en JSON
        </button>
        <a href="index.html" class="btn btn-outline">
          🏠 Retour à l'accueil
        </a>
      </div>
    </div>
  `;

  summarySection.innerHTML = html;
  summarySection.style.display = 'block';

  // Stocker les données pour la copie/téléchargement
  window.devisDataForExport = devisData;
}

function getUrgenceLabel(urgence) {
  const labels = {
    'faible': 'Faible',
    'moyenne': 'Moyenne',
    'forte': 'Forte'
  };
  return labels[urgence] || urgence;
}

async function copyDevis() {
  if (!window.devisDataForExport) return;

  const text = formatDevisForCopy(window.devisDataForExport);
  
  try {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById('copyBtn');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✅ Copié !';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    }
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    alert('Impossible de copier. Veuillez sélectionner et copier manuellement.');
  }
}

function formatDevisForCopy(devisData) {
  let text = 'DEMANDE DE DEVIS - La Pêche Ténébreuse\n';
  text += '='.repeat(50) + '\n\n';
  
  text += `Date: ${new Date(devisData.date).toLocaleDateString('fr-FR')}\n\n`;
  
  text += 'INFORMATIONS CLIENT\n';
  text += '-'.repeat(30) + '\n';
  text += `Nom: ${devisData.client.name}\n`;
  text += `Email: ${devisData.client.email}\n`;
  text += `Téléphone: ${devisData.client.phone}\n\n`;
  
  text += 'INFORMATIONS BATEAU\n';
  text += '-'.repeat(30) + '\n';
  text += `Type: ${devisData.bateau.type === 'voilier' ? 'Voilier' : 'Bateau à moteur'}\n`;
  text += `Longueur: ${devisData.bateau.longueur} m\n`;
  if (devisData.bateau.materiau) text += `Matériau: ${devisData.bateau.materiau}\n`;
  if (devisData.bateau.annee) text += `Année: ${devisData.bateau.annee}\n`;
  text += '\n';
  
  text += 'SERVICES DEMANDÉS\n';
  text += '-'.repeat(30) + '\n';
  devisData.besoin.services.forEach(service => {
    text += `- ${service.name}: ${formatPrice(service.price, service.priceFrom)} / ${service.unit || 'forfait'}\n`;
  });
  if (devisData.besoin.description) {
    text += `\nDescription: ${devisData.besoin.description}\n`;
  }
  text += `Urgence: ${getUrgenceLabel(devisData.besoin.urgence)}\n\n`;
  
  if (devisData.localisation.ville || devisData.localisation.port) {
    text += 'LOCALISATION\n';
    text += '-'.repeat(30) + '\n';
    if (devisData.localisation.ville) text += `Ville: ${devisData.localisation.ville}\n`;
    if (devisData.localisation.port) text += `Port: ${devisData.localisation.port}\n`;
    text += '\n';
  }
  
  text += '\n⚠️ Total indicatif. Un devis précis sera établi après diagnostic.\n';
  
  return text;
}

function downloadDevis() {
  if (!window.devisDataForExport) return;

  const json = JSON.stringify(window.devisDataForExport, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `devis-${window.devisDataForExport.client.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Exposer les fonctions globalement
window.copyDevis = copyDevis;
window.downloadDevis = downloadDevis;

// ============================================================================
// PAGE SERVICES
// ============================================================================

let allServices = [];
let filteredServices = [];

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
  renderServicesHero(pageData.hero);

  // Rendu de l'introduction et avertissement
  renderServicesIntro(pageData.intro);

  // Rendu des filtres
  renderFilters(data.services.categories);

  // Rendu des services
  renderServices(filteredServices);

  // Réinitialiser les animations après le rendu
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}

function renderServicesHero(heroData) {
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

function renderServicesIntro(introData) {
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
      filterServicesByCategory(category);
      
      // Mise à jour de l'état actif
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}

function filterServicesByCategory(categoryId) {
  if (categoryId === 'all') {
    filteredServices = [...allServices];
  } else {
    filteredServices = allServices.filter(service => service.category === categoryId);
  }
  
  renderServices(filteredServices);

  // Réinitialiser les animations
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}

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
    const priceText = formatPrice(service.price, service.priceFrom);
    const unitText = formatUnit(service);
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

function showServiceDetails(serviceId) {
  const service = allServices.find(s => s.id === serviceId);
  if (!service) return;

  const priceText = formatPrice(service.price, service.priceFrom);
  const unitText = formatUnit(service);

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

// ============================================================================
// ROUTAGE ET INITIALISATION
// ============================================================================

/**
 * Détermine quelle page initialiser selon le nom du fichier
 */
function getPageName() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  
  if (filename === 'index.html' || filename === '') return 'home';
  if (filename === 'a-propos.html') return 'about';
  if (filename === 'contact.html') return 'contact';
  if (filename === 'devis.html') return 'devis';
  if (filename === 'services.html') return 'services';
  
  return 'home';
}

/**
 * Initialisation automatique au chargement de la page
 */
document.addEventListener('DOMContentLoaded', async () => {
  const pageName = getPageName();
  
  // Initialiser l'application
  const data = await initApp((data) => {
    // Initialiser la page spécifique
    switch (pageName) {
      case 'home':
        renderHomePage(data);
        break;
      case 'about':
        renderAboutPage(data);
        break;
      case 'contact':
        renderContactPage(data);
        initContactForm();
        break;
      case 'devis':
        renderDevisPage(data);
        initDevisForm();
        
        // Vérifier si un service est présélectionné depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const serviceId = urlParams.get('service');
        if (serviceId && data.services) {
          preselectService(serviceId);
        }
        break;
      case 'services':
        renderServicesPage(data);
        break;
    }
  });
});

/**
 * Gestion des erreurs globales
 */
window.addEventListener('error', (event) => {
  console.error('Erreur JavaScript:', event.error);
});

// Export des fonctions principales pour utilisation globale
window.App = {
  loadJSON,
  loadData,
  updateSEO,
  renderNavbar,
  renderFooter,
  initApp,
  formatPrice,
  formatUnit,
  initScrollAnimations
};
