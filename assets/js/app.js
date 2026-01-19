/**
 * App.js - Fonctions communes pour toutes les pages
 * Gestion du chargement JSON, rendu navbar/footer, animations
 */

// Cache pour les données JSON chargées
const dataCache = {
  site: null,
  pages: null,
  services: null,
  faq: null
};

/**
 * Charge un fichier JSON de manière asynchrone
 * @param {string} path - Chemin vers le fichier JSON
 * @returns {Promise<Object>} - Les données JSON parsées
 */
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors du chargement de ${path}:`, error);
    throw error;
  }
}

/**
 * Charge les données JSON nécessaires avec cache
 * @param {string[]} dataFiles - Liste des fichiers à charger
 * @returns {Promise<Object>} - Les données chargées
 */
async function loadData(dataFiles = ['site', 'pages']) {
  const promises = dataFiles.map(async (file) => {
    if (!dataCache[file]) {
      try {
        dataCache[file] = await loadJSON(`data/${file}.json`);
      } catch (error) {
        console.error(`Impossible de charger ${file}.json:`, error);
        return { [file]: null };
      }
    }
    return { [file]: dataCache[file] };
  });

  const results = await Promise.all(promises);
  return Object.assign({}, ...results);
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
 * @param {Object} options - Options d'initialisation
 * @param {string[]} options.dataFiles - Fichiers JSON à charger
 * @param {Function} options.onDataLoaded - Callback appelé après le chargement des données
 */
async function initApp(options = {}) {
  const {
    dataFiles = ['site', 'pages'],
    onDataLoaded = null
  } = options;

  try {
    // Afficher un état de chargement
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'block';
    }

    // Charger les données
    const data = await loadData(dataFiles);

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

/**
 * Gestion des erreurs globales
 */
window.addEventListener('error', (event) => {
  console.error('Erreur JavaScript:', event.error);
});

// Export des fonctions principales pour utilisation dans les scripts de page
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
