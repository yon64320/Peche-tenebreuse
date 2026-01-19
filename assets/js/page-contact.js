/**
 * page-contact.js - Script spécifique à la page Contact
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Charger les données nécessaires
  const data = await window.App.initApp({
    dataFiles: ['site', 'pages'],
    onDataLoaded: (data) => {
      renderContactPage(data);
    }
  });

  // Initialiser le formulaire de contact
  initContactForm();
});

/**
 * Rendu de la page Contact
 * @param {Object} data - Données chargées (site, pages)
 */
function renderContactPage(data) {
  const pageData = data.pages.contact;
  if (!pageData) return;

  // Rendu du hero
  renderHero(pageData.hero);

  // Rendu de l'introduction
  renderIntro(pageData.intro);

  // Rendu des coordonnées
  renderContactInfo(data.site.footer.contact);
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
 * Rendu des informations de contact
 * @param {Object} contactData - Données de contact
 */
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
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearFieldError(input));
  });
}

/**
 * Validation du formulaire de contact
 * @param {HTMLFormElement} form - Formulaire à valider
 * @returns {boolean} - true si valide
 */
function validateContactForm(form) {
  let isValid = true;
  const fields = ['name', 'email', 'message'];

  fields.forEach(fieldName => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field && !validateField(field)) {
      isValid = false;
    }
  });

  // Validation email spéciale
  const emailField = form.querySelector('[name="email"]');
  if (emailField && emailField.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
      showFieldError(emailField, 'Veuillez entrer une adresse email valide');
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Validation d'un champ
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Champ à valider
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
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Champ
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
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Champ
 */
function clearFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.parentElement.querySelector('.form-error');
  if (errorEl) {
    errorEl.remove();
  }
}

/**
 * Affiche un message de succès
 * @param {string} message - Message à afficher
 */
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
