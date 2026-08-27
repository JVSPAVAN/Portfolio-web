/**
 * LinkedIn Posts Feed Engine for Community Impact Section
 * Renders cards with top-half image blending into bottom-half text,
 * 2-line summary, and hover reveals for reactions, view count, and "View Post" button.
 */

(function () {
  const LINKEDIN_API_ENDPOINT = 'assets/data/linkedin-posts.json';
  const PROFILE_URL = 'https://www.linkedin.com/in/pavansoftware/';
  const ACTIVITY_URL = 'https://www.linkedin.com/in/pavansoftware/recent-activity/all/';

  /**
   * Render loading skeleton cards matching the card structure
   */
  function renderSkeletons(container, count = 2) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="community__card" style="opacity: 0.7;">
          <div class="community__img-wrapper skeleton-shimmer" style="height: 190px;"></div>
          <div class="community__data">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
              <div class="skeleton-shimmer" style="width: 80px; height: 12px; border-radius: 4px;"></div>
              <div class="skeleton-shimmer" style="width: 50px; height: 12px; border-radius: 4px;"></div>
            </div>
            <div class="skeleton-shimmer" style="width: 65%; height: 20px; margin-bottom: 0.75rem; border-radius: 4px;"></div>
            <div class="skeleton-shimmer" style="width: 100%; height: 14px; margin-bottom: 0.4rem; border-radius: 4px;"></div>
            <div class="skeleton-shimmer" style="width: 85%; height: 14px; border-radius: 4px;"></div>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  /**
   * Render a single community post card HTML
   */
  function createPostCardHTML(post) {
    const postUrl = post.postUrl || ACTIVITY_URL;
    const likesCount = post.metrics?.likes || 0;
    const viewsCount = post.metrics?.impressions || '500+';

    // Top half: Image or gradient with icon
    let visualHTML = '';
    if (post.image) {
      visualHTML = `
        <div class="community__img-wrapper">
          <img src="${post.image}" alt="${post.imageAlt || post.title}" class="community__card-img" loading="lazy">
        </div>
      `;
    } else if (post.media && post.media.gradient) {
      visualHTML = `
        <div class="community__img-wrapper">
          <div class="community__img-placeholder" style="background: ${post.media.gradient};">
            <i class="uil ${post.media.icon || 'uil-award'} community__icon-overlay"></i>
          </div>
        </div>
      `;
    } else {
      visualHTML = `
        <div class="community__img-wrapper">
          <div class="community__img-placeholder" style="background: linear-gradient(135deg, #1d976c, #93f9b9);">
            <i class="uil uil-award community__icon-overlay"></i>
          </div>
        </div>
      `;
    }

    return `
      <div class="community__card">
        ${visualHTML}

        <div class="community__data">
          <div class="community__stats">
            <span class="community__stats-time">
              <i class="uil uil-clock"></i> ${post.timestamp}
            </span>
            <span class="community__stats-source">
              <i class="uil uil-linkedin"></i> LinkedIn
            </span>
          </div>

          <h3 class="community__title">${post.title}</h3>

          <p class="community__description">
            ${post.summary || post.content}
          </p>

          <!-- Hover footer: reactions, views, and View Post button -->
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
                <i class="uil uil-eye"></i> ${viewsCount} views
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
   * Main fetch and render function
   */
  async function loadLinkedInPosts() {
    const feedContainer = document.getElementById('community-linkedin-feed');
    if (!feedContainer) return;

    // Show skeletons while fetching
    renderSkeletons(feedContainer, 2);

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
