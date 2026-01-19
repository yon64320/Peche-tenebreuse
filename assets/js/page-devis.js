/**
 * page-devis.js - Script spécifique à la page Devis
 */

let servicesData = [];
let currentStep = 1;

document.addEventListener('DOMContentLoaded', async () => {
  // Charger les données nécessaires
  const data = await window.App.initApp({
    dataFiles: ['site', 'pages', 'services'],
    onDataLoaded: (data) => {
      renderDevisPage(data);
    }
  });

  // Initialiser le formulaire
  initDevisForm();

  // Vérifier si un service est présélectionné depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('service');
  if (serviceId && data.services) {
    preselectService(serviceId);
  }
});

/**
 * Rendu de la page Devis
 * @param {Object} data - Données chargées (site, pages, services)
 */
function renderDevisPage(data) {
  const pageData = data.pages.devis;
  if (!pageData) return;

  servicesData = data.services.services || [];

  // Rendu du hero
  renderHero(pageData.hero);

  // Rendu de l'introduction
  renderIntro(pageData.intro);

  // Rendu des services dans le formulaire
  renderServicesSelect(servicesData);
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
 * Rendu de l'introduction
 * @param {Object} introData - Données de l'introduction
 */
function renderIntro(introData) {
  const introSection = document.getElementById('intro');
  if (!introSection) return;

  const html = `
    <div class="container">
      <p class="text-center" style="max-width: 800px; margin: 0 auto; color: var(--color-text-light);">${introData.text}</p>
    </div>
  `;

  introSection.innerHTML = html;
}

/**
 * Rendu du sélecteur de services
 * @param {Array} services - Liste des services
 */
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
      const priceText = window.App.formatPrice(service.price, service.priceFrom);
      const unitText = window.App.formatUnit(service);
      
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

/**
 * Obtient le nom d'une catégorie
 * @param {string} categoryId - ID de la catégorie
 * @returns {string} - Nom de la catégorie
 */
function getCategoryName(categoryId) {
  const names = {
    'coque': 'Coque & Structure',
    'finition': 'Finition & Peinture',
    'entretien': 'Entretien & Maintenance',
    'packs': 'Packs & Formules'
  };
  return names[categoryId] || categoryId;
}

/**
 * Présélectionne un service depuis l'URL
 * @param {string} serviceId - ID du service
 */
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

/**
 * Initialisation du formulaire de devis
 */
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
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearFieldError(input));
    }
  });
}

/**
 * Validation du formulaire de devis
 * @param {HTMLFormElement} form - Formulaire à valider
 * @returns {boolean} - true si valide
 */
function validateDevisForm(form) {
  let isValid = true;

  // Champs obligatoires
  const requiredFields = ['name', 'email', 'phone', 'boat-type', 'boat-length'];
  requiredFields.forEach(fieldName => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field && !validateField(field)) {
      isValid = false;
    }
  });

  // Validation email
  const emailField = form.querySelector('[name="email"]');
  if (emailField && emailField.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
      showFieldError(emailField, 'Veuillez entrer une adresse email valide');
      isValid = false;
    }
  }

  // Validation téléphone
  const phoneField = form.querySelector('[name="phone"]');
  if (phoneField && phoneField.value) {
    const phoneRegex = /^[0-9+\s\-()]+$/;
    if (!phoneRegex.test(phoneField.value)) {
      showFieldError(phoneField, 'Veuillez entrer un numéro de téléphone valide');
      isValid = false;
    }
  }

  // Validation longueur du bateau
  const lengthField = form.querySelector('[name="boat-length"]');
  if (lengthField && lengthField.value) {
    const length = parseFloat(lengthField.value);
    if (isNaN(length) || length <= 0 || length > 100) {
      showFieldError(lengthField, 'Veuillez entrer une longueur valide (0-100m)');
      isValid = false;
    }
  }

  // Validation services
  const servicesCheckboxes = form.querySelectorAll('input[name="services"]:checked');
  if (servicesCheckboxes.length === 0) {
    const servicesContainer = document.getElementById('services-select');
    if (servicesContainer) {
      showMessage(servicesContainer, 'Veuillez sélectionner au moins un service', 'error');
    }
    isValid = false;
  }

  // Validation RGPD
  const rgpdCheckbox = form.querySelector('[name="rgpd"]');
  if (!rgpdCheckbox || !rgpdCheckbox.checked) {
    showMessage(form, 'Vous devez accepter le traitement de vos données personnelles', 'error');
    isValid = false;
  }

  return isValid;
}

/**
 * Validation d'un champ
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field - Champ à valider
 * @returns {boolean} - true si valide
 */
function validateField(field) {
  const value = field.value.trim();
  const isRequired = field.hasAttribute('required');
  
  if (isRequired && !value) {
    showFieldError(field, 'Ce champ est obligatoire');
    return false;
  }

  clearFieldError(field);
  return true;
}

/**
 * Affiche une erreur sur un champ
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field - Champ
 * @param {string} message - Message d'erreur
 */
function showFieldError(field, message) {
  clearFieldError(field);
  
  field.classList.add('error');
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error show';
  errorEl.textContent = message;
  field.parentElement.appendChild(errorEl);
}

/**
 * Efface l'erreur d'un champ
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field - Champ
 */
function clearFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.parentElement.querySelector('.form-error');
  if (errorEl) {
    errorEl.remove();
  }
}

/**
 * Affiche un message général
 * @param {HTMLElement} container - Conteneur
 * @param {string} message - Message
 * @param {string} type - Type (error, success)
 */
function showMessage(container, message, type = 'error') {
  const messageEl = document.createElement('div');
  messageEl.className = `form-${type} show`;
  messageEl.textContent = message;
  container.insertBefore(messageEl, container.firstChild);

  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => messageEl.remove(), 300);
  }, 5000);
}

/**
 * Affiche le récapitulatif du devis
 * @param {HTMLFormElement} form - Formulaire
 */
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
        const service = servicesData.find(s => s.id === id);
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

/**
 * Rendu du récapitulatif
 * @param {Object} devisData - Données du devis
 */
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
            <span class="summary-item-value">${window.App.formatPrice(service.price, service.priceFrom)} / ${service.unit || 'forfait'}</span>
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

/**
 * Obtient le libellé de l'urgence
 * @param {string} urgence - Valeur de l'urgence
 * @returns {string} - Libellé
 */
function getUrgenceLabel(urgence) {
  const labels = {
    'faible': 'Faible',
    'moyenne': 'Moyenne',
    'forte': 'Forte'
  };
  return labels[urgence] || urgence;
}

/**
 * Copie le devis dans le presse-papiers
 */
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

/**
 * Formate le devis pour la copie texte
 * @param {Object} devisData - Données du devis
 * @returns {string} - Texte formaté
 */
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
    text += `- ${service.name}: ${window.App.formatPrice(service.price, service.priceFrom)} / ${service.unit || 'forfait'}\n`;
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

/**
 * Télécharge le devis en JSON
 */
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
