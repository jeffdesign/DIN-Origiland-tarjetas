/* =====================================================
   ORIGILAND DIGITAL CONTACT CARDS
   Shared JavaScript for all contact pages
   ===================================================== */

const screenEl = document.querySelector('.contact-screen');
const toastEl = document.querySelector('.toast');
let toastTimer;

function showToast(message) {
  if (!toastEl) return;
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('is-visible');
  }, 2200);
}

async function copyText(value, message = 'Copiado') {
  const text = String(value || '').trim();
  if (!text) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
    showToast(message);
  } catch (error) {
    showToast('No se pudo copiar');
  }
}

function getContactData() {
  if (!screenEl) return {};
  return {
    name: screenEl.dataset.name || '',
    firstName: screenEl.dataset.firstName || '',
    lastName: screenEl.dataset.lastName || '',
    role: screenEl.dataset.role || '',
    phone: screenEl.dataset.phone || '',
    workPhone: screenEl.dataset.workPhone || '',
    email: screenEl.dataset.email || '',
    website: screenEl.dataset.website || '',
    location: screenEl.dataset.location || '',
    photo: screenEl.dataset.photo || ''
  };
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function createVCard() {
  const data = getContactData();
  const safeName = data.name || 'Contacto Origiland';
  const fileName = `${safeName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}.vcf`;

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${safeName}`,
    `N:${data.lastName};${data.firstName};;;`,
    'ORG:Origiland',
    `TITLE:${data.role}`,
    data.phone ? `TEL;TYPE=CELL:${data.phone}` : '',
    data.workPhone ? `TEL;TYPE=WORK,VOICE:${data.workPhone}` : '',
    data.email ? `EMAIL;TYPE=WORK:${data.email}` : '',
    data.website ? `URL:${data.website}` : '',
    data.location ? `ADR;TYPE=WORK:;;;;${data.location};;México` : '',
    'NOTE:Origiland · Inteligencia inmobiliaria. Análisis. Estrategia. Oportunidad.',
    'END:VCARD'
  ].filter(Boolean).join('\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('Contacto listo para guardar');
}

function setupLinks() {
  const data = getContactData();
  const phone = onlyDigits(data.phone);
  const message = encodeURIComponent(`Hola ${data.firstName || ''}, vi tu tarjeta digital de Origiland.`.trim());

  document.querySelectorAll('.js-whatsapp').forEach((link) => {
    link.href = phone ? `https://wa.me/52${phone}?text=${message}` : '#';
  });

  document.querySelectorAll('.js-mail').forEach((link) => {
    link.href = data.email ? `mailto:${data.email}` : '#';
  });

  document.querySelectorAll('.js-website').forEach((link) => {
    link.href = data.website || 'https://origiland.com.mx/';
  });
}

function setupCopyCards() {
  document.querySelectorAll('.js-copy').forEach((card) => {
    card.addEventListener('click', () => {
      copyText(card.dataset.copy, card.dataset.toast || 'Copiado');
    });
  });
}

function setupSaveContact() {
  document.querySelectorAll('.js-save-vcard').forEach((button) => {
    button.addEventListener('click', createVCard);
  });
}

function setupRipple() {
  document.querySelectorAll('.js-ripple').forEach((element) => {
    element.addEventListener('click', (event) => {
      const rect = element.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      element.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 720);
    });
  });
}

function setupTilt() {
  const tiltItems = document.querySelectorAll('.js-tilt');

  tiltItems.forEach((item) => {
    item.addEventListener('pointermove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 5;
      const rotateY = (x - 0.5) * 5;
      item.style.setProperty('--x', `${x * 100}%`);
      item.style.setProperty('--y', `${y * 100}%`);
      item.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    item.addEventListener('pointerleave', () => {
      item.style.transform = '';
    });
  });
}

function setupParallax() {
  const items = document.querySelectorAll('.js-parallax');
  if (!items.length) return;

  const move = (clientX, clientY) => {
    const x = (clientX / window.innerWidth - 0.5) * 2;
    const y = (clientY / window.innerHeight - 0.5) * 2;

    items.forEach((item) => {
      const depth = Number(item.dataset.depth || 0.04);
      item.style.setProperty('--mx', `${x * depth * 120}px`);
      item.style.setProperty('--my', `${y * depth * 120}px`);
    });
  };

  window.addEventListener('pointermove', (event) => move(event.clientX, event.clientY), { passive: true });
  window.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (touch) move(touch.clientX, touch.clientY);
  }, { passive: true });
}

function setupEntryObserver() {
  const revealItems = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealItems.forEach((item) => observer.observe(item));
}

function init() {
  setupLinks();
  setupCopyCards();
  setupSaveContact();
  setupRipple();
  setupTilt();
  setupParallax();
  setupEntryObserver();
}

document.addEventListener('DOMContentLoaded', init);
