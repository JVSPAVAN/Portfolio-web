
// Preload images
const preloadImages = (selector = 'img') => {
    return new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
    });
};

// Calculates the direction of the mouse entry/exit
const getMouseEnterDirection = (element, mouseX, mouseY) => {
    const { width, height, top, left } = element.getBoundingClientRect();
    const x = (mouseX - left - (width / 2)) * (width > height ? (height / width) : 1);
    const y = (mouseY - top - (height / 2)) * (height > width ? (width / height) : 1);
    const direction = Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
    return ['top', 'right', 'bottom', 'left'][direction];
}

export { preloadImages, getMouseEnterDirection };
