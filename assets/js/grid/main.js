// Importing the necessary functions and classes from other modules.
import { preloadImages } from './utils.js'; // Utility function to preload images
import { Card } from './card.js?v=19';          // Unified Card class for dynamic effects

// Array to hold the instantiated card objects.
let cardsArr = [];

// Query all non-empty card elements and for each card:
[...document.querySelectorAll('.card:not(.card--empty)')].forEach(cardEl => {
    // Instantiate Unified Card for all cards
    cardsArr.push(new Card(cardEl));
});

// Watch for theme changes (class 'dark-theme' on body)
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            // Reset all cards to clear inline styles when theme changes
            cardsArr.forEach(card => card.reset());
        }
    });
});
observer.observe(document.body, { attributes: true });
    
// Preload all images
// Once all images are preloaded, remove the 'loading' class from the body.
preloadImages('.card__img').then(() => document.body.classList.remove('loading'));
