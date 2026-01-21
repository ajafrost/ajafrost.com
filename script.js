// ===================================
// MOBILE MENU TOGGLE
// ===================================

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
});

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================

const topNav = document.querySelector('.top-nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        topNav.classList.add('scrolled');
    } else {
        topNav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===================================
// SMOOTH SCROLL WITH OFFSET
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80; // Offset for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and experience items
document.querySelectorAll('.section, .experience-item').forEach(el => {
    observer.observe(el);
});

// ===================================
// ACTIVE NAV LINK HIGHLIGHT
// ===================================

const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================

// Debounce function for scroll events
function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// ===================================
// PRELOAD IMAGES (IF ADDED LATER)
// ===================================

const preloadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
    });
};

// Run on page load
window.addEventListener('load', () => {
    preloadImages();
});

// ===================================
// TOKEN MODE EASTER EGG (WITH PERSISTENCE)
// ===================================

let tokenSequence = '';
let tokenModeActive = false;
let originalContent = new Map();

// Check for saved token mode state on page load (before DOM ready for fastest activation)
(function() {
    if (localStorage.getItem('tokenMode') === 'enabled') {
        // Add class immediately to prevent FOUC
        document.documentElement.classList.add('token-mode-loading');
        tokenModeActive = true;
    }
})();

// Activate token mode as soon as DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('tokenMode') === 'enabled') {
        enableTokenMode();
    }
});

// Listen for "token" sequence
document.addEventListener('keydown', (e) => {
    tokenSequence += e.key.toLowerCase();

    // Keep only last 5 characters
    if (tokenSequence.length > 5) {
        tokenSequence = tokenSequence.slice(-5);
    }

    // Toggle token mode when "token" is typed
    if (tokenSequence === 'token') {
        toggleTokenMode();
        tokenSequence = ''; // Reset
    }

    // ESC to exit
    if (e.key === 'Escape' && tokenModeActive) {
        toggleTokenMode();
    }
});

function toggleTokenMode() {
    if (tokenModeActive) {
        // Disable token mode
        disableTokenMode();
        localStorage.removeItem('tokenMode');
        tokenModeActive = false;
    } else {
        // Enable token mode
        enableTokenMode();
        localStorage.setItem('tokenMode', 'enabled');
        tokenModeActive = true;
    }
}

function enableTokenMode() {
    document.body.classList.add('token-mode');
    document.documentElement.classList.remove('token-mode-loading');

    // Find all text elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, a, button, label');

    textElements.forEach((element) => {
        // Skip if already tokenized or is the counter
        if (element.classList.contains('tokenized') || element.id === 'token-counter') {
            return;
        }

        // Store original content
        originalContent.set(element, element.innerHTML);

        // Tokenize text nodes only
        tokenizeElement(element);
        element.classList.add('tokenized');
    });

    // Create token counter HUD
    createTokenCounter();
}

function disableTokenMode() {
    document.body.classList.remove('token-mode');
    document.documentElement.classList.remove('token-mode-loading');

    // Restore original content
    originalContent.forEach((html, element) => {
        element.innerHTML = html;
        element.classList.remove('tokenized');
    });
    originalContent.clear();

    // Remove counter
    const counter = document.getElementById('token-counter');
    if (counter) {
        counter.remove();
    }
}

function tokenizeElement(element) {
    // Get all text nodes
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        // Skip empty or whitespace-only nodes
        if (node.textContent.trim().length > 0) {
            textNodes.push(node);
        }
    }

    // Process each text node
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const words = text.split(/(\s+)/); // Keep whitespace

        const fragment = document.createDocumentFragment();
        let tokenIndex = 0;

        words.forEach(word => {
            if (word.trim().length > 0) {
                // Create token span
                const span = document.createElement('span');
                span.className = `token token-${(tokenIndex % 5) + 1}`;
                span.textContent = word;
                fragment.appendChild(span);
                tokenIndex++;
            } else {
                // Preserve whitespace
                fragment.appendChild(document.createTextNode(word));
            }
        });

        textNode.parentNode.replaceChild(fragment, textNode);
    });
}

function createTokenCounter() {
    // Count all tokens
    const tokens = document.querySelectorAll('.token');
    const tokenCount = tokens.length;

    // Estimate cost (rough calculation: ~750 tokens per $0.0001 for GPT-4)
    const estimatedCost = (tokenCount / 750 * 0.0001).toFixed(6);

    // Create HUD
    const counter = document.createElement('div');
    counter.id = 'token-counter';
    counter.innerHTML = `
        <div class="token-counter-line">TOKEN COUNT: <span class="token-count-num">${tokenCount.toLocaleString()}</span></div>
        <div class="token-counter-line">EST. COST: <span class="token-cost-num">$${estimatedCost}</span></div>
        <div class="token-counter-hint">Press ESC to exit</div>
    `;

    document.body.appendChild(counter);
}
