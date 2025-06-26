
class AtlasWebsite {
  constructor() {
    this.initializeComponents();
    this.bindEvents();
  }

  initializeComponents() {
    this.header = new Header();
    this.navigation = new Navigation();
    this.forms = new Forms();
    this.animations = new Animations();
    this.humanoidSection = new HumanoidSection();
  }

  bindEvents() {
    // Global event listeners
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    window.addEventListener('load', this.handleLoad.bind(this));
  }

  handleScroll() {
    this.header.updateOnScroll();
    this.animations.updateOnScroll();
  }

  handleResize() {
    this.navigation.handleResize();
  }

  handleLoad() {
    this.animations.initializeOnLoad();
  }
}

class Header {
  constructor() {
    this.header = document.getElementById('header');
    this.isScrolled = false;
  }

  updateOnScroll() {
    const scrollY = window.scrollY;
    const shouldBeScrolled = scrollY > 10;
    
    if (shouldBeScrolled !== this.isScrolled) {
      this.isScrolled = shouldBeScrolled;
      this.header.classList.toggle('header--scrolled', this.isScrolled);
    }
  }
}

class Navigation {
  constructor() {
    this.menuBtn = document.getElementById('menuBtn');
    this.mobileNav = document.getElementById('mobileNav');
    this.isMenuOpen = false;
    
    this.bindEvents();
    this.initializeSmoothScroll();
  }

  bindEvents() {
    this.menuBtn?.addEventListener('click', this.toggleMenu.bind(this));
    
    // Close menu when clicking on mobile nav links
    const mobileNavLinks = document.querySelectorAll('.header__mobile-nav-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', this.closeMenu.bind(this));
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.menuBtn.contains(e.target) && !this.mobileNav.contains(e.target)) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.mobileNav.classList.toggle('header__mobile-nav--active', this.isMenuOpen);
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    
    // Update menu button icon
    this.updateMenuIcon();
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.mobileNav.classList.remove('header__mobile-nav--active');
    document.body.style.overflow = '';
    this.updateMenuIcon();
  }

  updateMenuIcon() {
    const icons = this.menuBtn.querySelectorAll('.header__menu-icon');
    icons.forEach((icon, index) => {
      if (this.isMenuOpen) {
        if (index === 0) {
          icon.style.transform = 'rotate(45deg) translate(5px, 5px)';
        } else if (index === 1) {
          icon.style.opacity = '0';
        } else if (index === 2) {
          icon.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        }
      } else {
        icon.style.transform = '';
        icon.style.opacity = '';
      }
    });
  }

  handleResize() {
    if (window.innerWidth >= 768 && this.isMenuOpen) {
      this.closeMenu();
    }
  }

  initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = anchor.getAttribute('href').substring(1);
        if (!targetId) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        const offset = window.innerWidth < 768 ? 100 : 80;
        const targetPosition = targetElement.offsetTop - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  }
}

class Forms {
  constructor() {
    this.initializeForms();
  }

  initializeForms() {
    const contactForm = document.getElementById('contactForm');
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (contactForm) {
      contactForm.addEventListener('submit', this.handleContactFormSubmit.bind(this));
    }
    
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', this.handleNewsletterFormSubmit.bind(this));
    }
  }

  handleContactFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Simple validation
    if (!data.fullName || !data.email) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Simulate form submission
    this.showNotification('Request submitted successfully!', 'success');
    
    // Reset form
    e.target.reset();
  }

  handleNewsletterFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    
    if (!email) {
      this.showNotification('Please enter your email address', 'error');
      return;
    }
    
    // Simulate submission
    setTimeout(() => {
      this.showNotification('Thank you for subscribing! You\'ll receive updates about Atlas soon.', 'success');
      e.target.reset();
    }, 1000);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '9999',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      backgroundColor: type === 'error' ? '#ef4444' : '#10b981'
    });
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
}

class Animations {
  constructor() {
    this.observedElements = new Set();
    this.initializeIntersectionObserver();
  }

  initializeIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
  }

  initializeOnLoad() {
    // Observe elements with animation classes
    const animatableElements = document.querySelectorAll('.animate-on-scroll, .fade-in-element');
    animatableElements.forEach((el, index) => {
      el.style.animationDelay = `${0.1 * (index + 1)}s`;
      this.observer.observe(el);
    });
    
    // Observe feature cards with staggered animation
    const featureCards = document.querySelectorAll('.features__card');
    featureCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      card.style.animationDelay = `${0.1 * index}s`;
      
      this.observer.observe(card);
    });
  }

  updateOnScroll() {
    // Add any scroll-based animations here
    this.updateParallaxElements();
  }

  updateParallaxElements() {
    const parallaxElements = document.querySelectorAll('.parallax');
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.speed || '0.1');
      const yPos = -scrollY * speed;
      el.style.setProperty('--parallax-y', `${yPos}px`);
      el.style.transform = `translateY(var(--parallax-y))`;
    });
  }
}

class HumanoidSection {
  constructor() {
    this.section = document.querySelector('.humanoid');
    this.cards = document.querySelectorAll('.humanoid__card');
    this.activeCardIndex = 0;
    this.isIntersecting = false;
    
    if (this.section) {
      this.initializeScrollObserver();
      this.initializeIntersectionObserver();
    }
  }

  initializeIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        this.isIntersecting = entry.isIntersecting;
        this.updateCardVisibility();
      },
      { threshold: 0.1 }
    );
    
    observer.observe(this.section);
  }

  initializeScrollObserver() {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateCardsOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  updateCardsOnScroll() {
    if (!this.section) return;
    
    const sectionRect = this.section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const totalScrollDistance = viewportHeight * 2;
    
    let progress = 0;
    if (sectionRect.top <= 0) {
      progress = Math.min(1, Math.max(0, Math.abs(sectionRect.top) / totalScrollDistance));
    }
    
    // Determine active card based on progress
    let newActiveIndex = 0;
    if (progress >= 0.66) {
      newActiveIndex = 2;
    } else if (progress >= 0.33) {
      newActiveIndex = 1;
    }
    
    if (newActiveIndex !== this.activeCardIndex) {
      this.activeCardIndex = newActiveIndex;
      this.updateCardVisibility();
    }
  }

  updateCardVisibility() {
    this.cards.forEach((card, index) => {
      const isVisible = this.isIntersecting && index <= this.activeCardIndex;
      card.classList.toggle('humanoid__card--active', isVisible);
      
      // Update card transforms based on active state
      if (this.isIntersecting) {
        if (index === 0) {
          card.style.transform = 'translateY(90px) scale(0.9)';
          card.style.opacity = '0.9';
          card.style.zIndex = '10';
        } else if (index === 1) {
          if (this.activeCardIndex >= 1) {
            card.style.transform = this.activeCardIndex === 1 ? 'translateY(55px) scale(0.95)' : 'translateY(45px) scale(0.95)';
            card.style.opacity = '1';
          } else {
            card.style.transform = 'translateY(200px) scale(0.95)';
            card.style.opacity = '0';
          }
          card.style.zIndex = '20';
        } else if (index === 2) {
          if (this.activeCardIndex >= 2) {
            card.style.transform = 'translateY(15px) scale(1)';
            card.style.opacity = '1';
          } else {
            card.style.transform = 'translateY(200px) scale(1)';
            card.style.opacity = '0';
          }
          card.style.zIndex = '30';
        }
      } else {
        card.style.transform = 'translateY(200px) scale(0.9)';
        card.style.opacity = '0';
      }
    });
  }
}

// Utility Functions
const utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const app = new AtlasWebsite();
  
  // Add fade-in animation to initial elements
  const initialElements = document.querySelectorAll('.hero__badge, .hero__title, .hero__subtitle, .hero__actions');
  initialElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100 + (index * 200));
  });
});

// Export for potential external use
window.AtlasWebsite = AtlasWebsite;
