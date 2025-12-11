import { getMouseEnterDirection } from './utils.js';

let lastMouseX = null;
let lastMouseY = null;

document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

/**
 * Class that represents a box inside a card.
 */
class CardBox {
    
    // Define properties related to the DOM elements and their styles.
    DOM = {
        el: null,                 // The main container of the box
        number: null,             // The number inside the box
        numberChars: null,        // Individual characters of the number (after using Splitting.js)
        tags: null,               // The tags associated with this box
        category: null,           // The category of the box
        categoryChars: null,      // Individual characters of the category (after using Splitting.js)
    };

    /**
     * Constructor: Initializes the properties with the actual DOM elements.
     * @param {HTMLElement} DOM_el - The main container of the box.
     */
    constructor(DOM_el) {
        // Associate the provided element with the main container
        this.DOM.el = DOM_el;
        // Fetch various child elements
        this.DOM.number = this.DOM.el.querySelector('.card__box-number');
        this.DOM.tags = this.DOM.el.querySelector('.card__box-tags');
        this.DOM.category = this.DOM.el.querySelector('.card__box-category');

        // Prepare the number and category elements for splitting using Splitting.js
        if ( this.DOM.number ) {
            this.DOM.number.dataset.splitting = '';
        }
        if ( this.DOM.category ) {
            this.DOM.category.dataset.splitting = '';
        }

        // Use Splitting.js to split the text content into individual characters for animation/effects.
        Splitting();

        // Store references to the individual characters after the split.
        if (this.DOM.number) {
            this.DOM.numberChars = this.DOM.number.querySelectorAll('.char');
        }
        if (this.DOM.category) {
            this.DOM.categoryChars = this.DOM.category.querySelectorAll('.char');
        }
    }
    
}



/**
 * Class representing Card2.
 */
/**
 * Class representing the Unified Card.
 */
export class Card {
    
    // Define properties related to the DOM elements and their styles.
    DOM = {
        el: null,
        img: null,
        boxes: null
    };
    cardBoxesArr = [];

    /**
     * Constructor: Initializes properties with actual DOM elements and sets up event listeners.
     * @param {HTMLElement} DOM_el - The main card element.
     */
    constructor(DOM_el) {
        this.DOM.el = DOM_el;
        this.DOM.img = this.DOM.el.querySelector('.card__img');
        this.boxes = [...this.DOM.el.querySelectorAll('.card__box')];
        // Initialize CardBox instances
        this.boxes.forEach(boxEl => this.cardBoxesArr.push(new CardBox(boxEl)));
        
        this.initEvents();
    }

    /**
     * Getters to retrieve specific parts of card boxes in an array format.
     */
    get cardBoxElements() {
        return this.cardBoxesArr.map(box => box.DOM.el).filter(el => el);
    }
    get cardBoxNumberChars() {
        return this.cardBoxesArr.map(box => box.DOM.numberChars).filter(chars => chars);
    }
    get cardBoxCategoryChars() {
        return this.cardBoxesArr.map(box => box.DOM.categoryChars).filter(chars => chars);
    }
    
    /**
     * Initialize the event listeners for the card.
     */
    initEvents() {
        const mouseenterFn = event => this.enter(event);
        const mouseLeaveFn = event => this.leave(event);
        this.DOM.el.addEventListener('mouseenter', mouseenterFn);
        this.DOM.el.addEventListener('mouseleave', mouseLeaveFn);
    }

    isDarkMode() {
        return document.body.classList.contains('dark-theme');
    }

    /**
     * Resets the card state by clearing GSAP inline styles.
     * Useful when switching themes.
     */
    reset() {
        // Kill any active timelines
        if (this.enterTimeline) this.enterTimeline.kill();
        if (this.leaveTimeline) this.leaveTimeline.kill();
        
        // Clear specific inline styles set by GSAP to let CSS take over or reset to default
        // We avoid 'all' to preserve the inline background-image on .card__img
        gsap.set(this.DOM.img, { clearProps: 'transform,filter,opacity' });
        gsap.set(this.cardBoxElements, { clearProps: 'transform,filter,opacity' });
        gsap.set(this.cardBoxNumberChars, { clearProps: 'transform,filter,opacity' });
        gsap.set(this.cardBoxCategoryChars, { clearProps: 'transform,filter,opacity' });
    }

    /**
     * Action to perform when mouse enters the card.
     */
    enter(event) {
        // Kill any ongoing timeline
        if ( this.leaveTimeline ) {
            this.leaveTimeline.kill();
        }

        // Initialize timeline
        this.enterTimeline = gsap.timeline({
            defaults: { duration: 0.7, ease: 'expo' }
        });
        
        if (this.isDarkMode()) {
            this.enterEffect1(event);
        } else {
            this.enterEffect2(event);
        }
    }

    /**
     * Action to perform when mouse leaves the card.
     */
    leave(event) {
        // Kill any ongoing timeline
        if ( this.enterTimeline ) {
            this.enterTimeline.kill();
        }

        // Initialize timeline
        this.leaveTimeline = gsap.timeline({
            defaults: { duration: 0.8, ease: 'expo' }
        });

        if (this.isDarkMode()) {
            this.leaveEffect1(event);
        } else {
            this.leaveEffect2(event);
        }
    }

    // ================= EFFECT 1 (Dark Mode) =================
    // ================= EFFECT 1 (Dark Mode) =================
    enterEffect1(event) {
        this.enterTimeline
        .addLabel('start', 0)
        // Animate TO the focused state (shrunk and darkened)
        .to(this.DOM.img, { scale: 0.85, xPercent: 0, yPercent: 0, filter: 'saturate(200%) brightness(70%)' }, 'start')
        .fromTo(this.cardBoxElements, { opacity: 0, xPercent: 0, yPercent: 0 }, { opacity: 1 }, 'start+=.2')
        .fromTo(this.cardBoxNumberChars, { opacity: 0 }, { duration: 0.3, opacity: 1, stagger: 0.1 }, 'start+=.2')
        .fromTo(this.cardBoxCategoryChars, { opacity: 0 }, { duration: 0.1, opacity: 1, stagger: 0.05 }, 'start+=.2');
    }

    leaveEffect1(event) {
        this.leaveTimeline
        .addLabel('start', 0)
        // Animate back TO the default state (full size and normal filter)
        .to(this.DOM.img, { scale: 1, xPercent: 0, yPercent: 0, filter: 'saturate(100%) brightness(100%)' }, 'start')
        .to(this.cardBoxElements, { opacity: 0 }, 'start');
    }

    // ================= EFFECT 2 (Light Mode) =================
    enterEffect2(event) {
        const direction = getMouseEnterDirection(event.target, lastMouseX, lastMouseY);
        event.target.dataset.direction = direction;

        this.enterTimeline
        .addLabel('start', 0)
        .fromTo(this.DOM.img, {
            filter: 'grayscale(0%)',
            scale: 1.3
        }, {
            scale: 1.3,
            xPercent: () => {
                if ( direction === 'left' ) return -10;
                else if ( direction === 'right' ) return 10;
                else return 0;
            },
            yPercent: () => {
                if ( direction === 'top' ) return -10;
                else if ( direction === 'bottom' ) return 10;
                else return 0;
            },
            filter: 'grayscale(40%)'
        }, 'start')
        .fromTo(this.cardBoxElements, {
            opacity: 0,
            xPercent: () => {
                if ( direction === 'left' ) return -20;
                else if ( direction === 'right' ) return 20;
                else return 0;
            },
            yPercent: () => {
                if ( direction === 'top' ) return -20;
                else if ( direction === 'bottom' ) return 20;
                else return 0;
            },
            rotation: -10
        }, {
            opacity: 1,
            xPercent: 0,
            yPercent: 0,
            rotation: 0,
            stagger: 0.08
        }, 'start')
        .fromTo(this.cardBoxNumberChars, {
            opacity: 0,
        }, {
            duration: 0.3,
            opacity: 1,
            stagger: 0.1,
        }, 'start+=.2')
        .fromTo(this.cardBoxCategoryChars, {
            opacity: 0
        }, {
            duration: 0.1,
            opacity: 1,
            stagger: { from: 'random', each: 0.05 },
        }, 'start+=.2');
    }

    leaveEffect2(event) {
        const direction = event.target.dataset.direction;
        
        this.leaveTimeline
        .addLabel('start', 0)
        .to(this.DOM.img, {
            scale: 1.3,
            xPercent: 0,
            yPercent: 0,
            filter: 'grayscale(0%)'
        }, 'start')
        .to(this.cardBoxElements, {
            opacity: 0,
            xPercent: () => {
                if ( direction === 'left' ) return -20;
                else if ( direction === 'right' ) return 20;
                else return 0;
            },
            yPercent: () => {
                if ( direction === 'top' ) return -20;
                else if ( direction === 'bottom' ) return 20;
                else return 0;
            },
            rotation: -10
        }, 'start');
    }
}
