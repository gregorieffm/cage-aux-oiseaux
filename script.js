/* =========================================================
   Domaine La Cage aux Oiseaux — JavaScript
   ========================================================= */

// --- Navbar scroll effect ---
const nav = document.getElementById('nav');
const onScroll = () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 60);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// --- Mobile menu toggle ---
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('nav__links--open');
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('nav__links--open');
  });
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// --- Scroll reveal animation ---
const revealElements = () => {
  const elements = document.querySelectorAll(
    '.section__header, .split__text, .split__media, .room-card, ' +
    '.spa__option, .atelier__item, .stage-card, .tarif-card, ' +
    '.review, .form, .map-placeholder, .season'
  );

  elements.forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
};

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', revealElements);
} else {
  revealElements();
}

// --- Contact form handler ---
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Envoi en cours...';
  btn.disabled = true;

  // Simulate form submission (replace with real backend)
  setTimeout(() => {
    btn.textContent = 'Message envoy\u00e9 !';
    btn.style.background = '#6b7f5e';
    btn.style.borderColor = '#6b7f5e';

    setTimeout(() => {
      form.reset();
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.disabled = false;
    }, 3000);
  }, 1200);

  return false;
}

// --- Active nav link highlight ---
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav__links a[href^="#"]');

const highlightNav = () => {
  const scrollY = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinkItems.forEach(link => {
        link.style.opacity = link.getAttribute('href') === `#${id}` ? '1' : '';
      });
    }
  });
};

window.addEventListener('scroll', highlightNav, { passive: true });
