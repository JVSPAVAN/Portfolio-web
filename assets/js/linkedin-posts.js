/**
 * LinkedIn Posts Feed Engine for Community Impact Section
 * Features:
 * - High-res 2048px LinkedIn CDN photos
 * - 2-second auto-carousel for multi-photo posts
 * - Perfectly centered glassmorphic badge for non-image posts
 * - Smooth downward gradient blend into card body
 * - Topic tag pills & full post content
 * - Slow line-by-line upward auto-scroll on hover to read entire post
 * - Interactive hover reveal with reaction stack, view count, and action pill
 */

(function () {
  const LINKEDIN_API_ENDPOINT = 'assets/data/linkedin-posts.json';
  const PROFILE_URL = 'https://www.linkedin.com/in/pavansoftware/';
  const ACTIVITY_URL = 'https://www.linkedin.com/in/pavansoftware/recent-activity/all/';

  // Track active carousel timers to clean up on reload
  let carouselTimers = [];

  /**
   * Render loading skeleton cards matching modern structure
   */
  function renderSkeletons(container, count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="community__card" style="opacity: 0.7;">
          <div class="community__img-wrapper skeleton-shimmer" style="height: 155px;"></div>
          <div class="community__data">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.6rem;">
              <div class="skeleton-shimmer" style="width: 75px; height: 20px; border-radius: 12px;"></div>
              <div class="skeleton-shimmer" style="width: 55px; height: 16px; border-radius: 4px;"></div>
            </div>
            <div class="skeleton-shimmer" style="width: 70%; height: 20px; margin-bottom: 0.5rem; border-radius: 4px;"></div>
            <div class="skeleton-shimmer" style="width: 100%; height: 14px; margin-bottom: 0.35rem; border-radius: 4px;"></div>
            <div class="skeleton-shimmer" style="width: 80%; height: 14px; border-radius: 4px;"></div>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  /**
   * Render a single modern community post card HTML
   */
  function createPostCardHTML(post) {
    const postUrl = post.postUrl || ACTIVITY_URL;
    const likesCount = post.metrics?.likes || 0;
    const viewsCount = post.metrics?.impressions || '500+';

    // Top half: Multi-image carousel (2-sec interval), single image, or glassmorphic gradient icon badge
    let visualHTML = '';
    const imagesList = post.images || (post.image ? [post.image] : []);

    if (imagesList.length > 1) {
      // Multi-image carousel with 2-second interval
      const slidesHTML = imagesList
        .map((img, idx) => `
          <img src="${img}" alt="${post.title} photo ${idx + 1}" class="community__carousel-slide ${idx === 0 ? 'active' : ''}" loading="lazy">
        `)
        .join('');

      const dotsHTML = imagesList
        .map((_, idx) => `
          <span class="carousel-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>
        `)
        .join('');

      visualHTML = `
        <div class="community__img-wrapper community__carousel-wrapper" data-interval="2000">
          <span class="community__carousel-badge">
            <i class="uil uil-images"></i> ${imagesList.length} Photos
          </span>
          <div class="community__carousel-slides">
            ${slidesHTML}
          </div>
          <div class="community__carousel-dots">
            ${dotsHTML}
          </div>
        </div>
      `;
    } else if (imagesList.length === 1) {
      // Single High-Res Image
      visualHTML = `
        <div class="community__img-wrapper">
          <img src="${imagesList[0]}" alt="${post.imageAlt || post.title}" class="community__card-img" loading="lazy">
        </div>
      `;
    } else if (post.media && post.media.gradient) {
      // Perfectly Centered Glassmorphic Icon Badge (Zero offset on hover!)
      visualHTML = `
        <div class="community__img-wrapper">
          <div class="community__img-placeholder" style="background: ${post.media.gradient};">
            <div class="community__icon-badge">
              <i class="uil ${post.media.icon || 'uil-newspaper'}"></i>
            </div>
          </div>
        </div>
      `;
    } else {
      visualHTML = `
        <div class="community__img-wrapper">
          <div class="community__img-placeholder" style="background: linear-gradient(135deg, #1d976c, #93f9b9);">
            <div class="community__icon-badge">
              <i class="uil uil-award"></i>
            </div>
          </div>
        </div>
      `;
    }

    // Modern tags row (up to 3 tags)
    const tagsHTML = (post.tags && post.tags.length > 0)
      ? `<div class="community__tags-row">
          ${post.tags.slice(0, 3).map(tag => `<span class="community__tag-pill">${tag}</span>`).join('')}
        </div>`
      : '';

    const fullContent = post.content || post.summary || '';

    return `
      <div class="community__card">
        ${visualHTML}

        <div class="community__data">
          <div class="community__stats">
            <span class="community__stats-time">
              <i class="uil uil-clock"></i> ${post.timestamp}
            </span>
            <a href="${postUrl}" target="_blank" rel="noopener noreferrer" class="community__stats-source" title="View on LinkedIn">
              <i class="uil uil-linkedin"></i> LinkedIn
            </a>
          </div>

          <h3 class="community__title">${post.title}</h3>

          ${tagsHTML}

          <!-- Description wrapper for smooth upward reading autoscroll on hover -->
          <div class="community__description-wrapper">
            <p class="community__description-text">
              ${fullContent}
            </p>
          </div>

          <!-- Hover footer: reactions, views, and action pill (overlays over bottom of text on hover) -->
          <div class="community__hover-footer">
            <div class="community__metrics">
              <span class="community__reactions" title="${likesCount} reactions">
                <span class="reaction-bubbles">
                  <span class="reaction-bubble reaction-like">👍</span>
                  <span class="reaction-bubble reaction-celebrate">👏</span>
                  <span class="reaction-bubble reaction-love">❤️</span>
                </span>
                <span>${likesCount}</span>
              </span>

              <span class="community__views" title="${viewsCount} impressions">
                <i class="uil uil-eye"></i> ${viewsCount}
              </span>
            </div>

            <a href="${postUrl}" target="_blank" rel="noopener noreferrer" class="community__view-btn">
              View Post <i class="uil uil-arrow-up-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize 2-second auto-rotation on all multi-image carousels
   */
  function initCarousels() {
    carouselTimers.forEach(timer => clearInterval(timer));
    carouselTimers = [];

    const carousels = document.querySelectorAll('.community__carousel-wrapper');
    carousels.forEach(carousel => {
      const slides = carousel.querySelectorAll('.community__carousel-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      if (slides.length <= 1) return;

      let currentIndex = 0;
      const intervalTime = parseInt(carousel.dataset.interval, 10) || 2000;

      function goToSlide(nextIndex) {
        slides[currentIndex].classList.remove('active');
        if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

        currentIndex = nextIndex % slides.length;

        slides[currentIndex].classList.add('active');
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
      }

      function nextSlide() {
        goToSlide(currentIndex + 1);
      }

      // Auto cycle every 2000ms (2 seconds)
      let timer = setInterval(nextSlide, intervalTime);
      carouselTimers.push(timer);

      // Pause when cursor hovers over the image wrapper, resume when mouse leaves
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', () => {
        clearInterval(timer);
        timer = setInterval(nextSlide, intervalTime);
        carouselTimers.push(timer);
      });
    });
  }

  /**
   * Smoothly scroll post text upwards line-by-line on hover,
   * stopping at the end of the text. Snaps back to top on mouseleave.
   */
  function initPostTextScroll() {
    const cards = document.querySelectorAll('.community__card');
    cards.forEach(card => {
      const wrapper = card.querySelector('.community__description-wrapper');
      const text = card.querySelector('.community__description-text');
      if (!wrapper || !text) return;

      let scrollTimeout = null;

      card.addEventListener('mouseenter', () => {
        // Calculate the overflow distance
        const scrollDistance = text.scrollHeight - wrapper.clientHeight;
        if (scrollDistance > 4) {
          // Pause 300ms before scrolling so user can start reading line 1
          scrollTimeout = setTimeout(() => {
            // Speed: ~20 pixels per second for a natural, comfortable reading pace
            const duration = Math.max(2.5, scrollDistance / 20);
            text.style.transition = `transform ${duration}s linear`;
            text.style.transform = `translateY(-${scrollDistance}px)`;
          }, 300);
        }
      });

      card.addEventListener('mouseleave', () => {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
          scrollTimeout = null;
        }
        // Smoothly animate back to the top
        text.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        text.style.transform = 'translateY(0)';
      });
    });
  }

  /**
   * Main fetch and render function
   */
  async function loadLinkedInPosts() {
    const feedContainer = document.getElementById('community-linkedin-feed');
    if (!feedContainer) return;

    // Show skeletons while fetching
    renderSkeletons(feedContainer, 3);

    try {
      // Add timestamp to bypass cache and always fetch fresh on page load
      const cacheBuster = `?t=${new Date().getTime()}`;
      const response = await fetch(LINKEDIN_API_ENDPOINT + cacheBuster);

      if (!response.ok) {
        throw new Error(`Failed to fetch posts (status: ${response.status})`);
      }

      const posts = await response.json();

      if (!Array.isArray(posts) || posts.length === 0) {
        feedContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-color-light);">
            <p>No recent LinkedIn posts found.</p>
          </div>
        `;
        return;
      }

      // Render cards (latest 5 posts)
      const latest5Posts = posts.slice(0, 5);
      feedContainer.innerHTML = latest5Posts.map(post => createPostCardHTML(post)).join('');

      // Initialize 2-second auto-transitions for multi-image posts
      initCarousels();

      // Initialize upward line-by-line reading scroll on hover
      initPostTextScroll();
    } catch (error) {
      console.warn('LinkedIn feed fetch error:', error);
      feedContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--container-color); border-radius: 1rem;">
          <p style="color: var(--title-color); font-weight: 600; margin-bottom: 0.5rem;">Unable to load LinkedIn posts.</p>
          <a href="${ACTIVITY_URL}" target="_blank" rel="noopener noreferrer" class="button button--small button--flex">
            View on LinkedIn <i class="uil uil-external-link-alt button__icon"></i>
          </a>
        </div>
      `;
    }
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLinkedInPosts);
  } else {
    loadLinkedInPosts();
  }
})();
