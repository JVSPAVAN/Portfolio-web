/**
 * LinkedIn Posts Feed Engine for Community Impact Section
 * Fetches and displays the latest 5 LinkedIn posts for @pavansoftware
 */

(function () {
  // Configurable API endpoint (can be swapped for a live webhook or serverless proxy)
  const LINKEDIN_API_ENDPOINT = 'assets/data/linkedin-posts.json';
  const PROFILE_URL = 'https://www.linkedin.com/in/pavansoftware/';
  const ACTIVITY_URL = 'https://www.linkedin.com/in/pavansoftware/recent-activity/all/';

  /**
   * Render loading skeleton cards while fetching
   */
  function renderSkeletons(container, count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="linkedin-skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-avatar skeleton-shimmer"></div>
            <div class="skeleton-meta">
              <div class="skeleton-line-title skeleton-shimmer"></div>
              <div class="skeleton-line-sub skeleton-shimmer"></div>
            </div>
          </div>
          <div class="skeleton-banner skeleton-shimmer"></div>
          <div class="skeleton-text">
            <div class="skeleton-line skeleton-shimmer"></div>
            <div class="skeleton-line skeleton-shimmer"></div>
            <div class="skeleton-line-short skeleton-shimmer"></div>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  /**
   * Render a single post card HTML
   */
  function createPostCardHTML(post) {
    const totalReactions = (post.metrics?.likes || 0) + (post.metrics?.celebrates || 0) + (post.metrics?.loves || 0);
    const commentsCount = post.metrics?.comments || 0;
    const postUrl = post.postUrl || ACTIVITY_URL;

    // Tags HTML
    const tagsHTML = (post.tags || [])
      .map(tag => `<span class="linkedin-tag-badge">${tag}</span>`)
      .join('');

    // Media Banner HTML
    let mediaHTML = '';
    if (post.media && post.media.gradient) {
      mediaHTML = `
        <div class="linkedin-media-banner" style="background: ${post.media.gradient}">
          <i class="uil ${post.media.icon || 'uil-newspaper'} linkedin-media-icon"></i>
          <span class="linkedin-media-caption">${post.media.caption || 'LinkedIn Update'}</span>
        </div>
      `;
    }

    return `
      <article class="linkedin-post-card" data-id="${post.id}">
        <div class="linkedin-card-header">
          <div class="linkedin-card-author">
            <img src="${post.author.avatar}" alt="${post.author.name}" class="linkedin-author-avatar" onerror="this.src='assets/img/perfil.png'">
            <div class="linkedin-author-meta">
              <div class="linkedin-author-name">${post.author.name}</div>
              <div class="linkedin-author-title">${post.author.headline || 'Specialist Programmer @ Infosys'}</div>
              <div class="linkedin-post-time">
                <i class="uil uil-clock-three"></i> ${post.timestamp}
              </div>
            </div>
          </div>
          <a href="${PROFILE_URL}" target="_blank" rel="noopener noreferrer" class="linkedin-card-logo" title="View on LinkedIn">
            <i class="uil uil-linkedin"></i>
          </a>
        </div>

        ${mediaHTML}

        <div class="linkedin-card-body">
          <p class="linkedin-post-text">${post.content}</p>
          <div class="linkedin-post-tags">
            ${tagsHTML}
          </div>
        </div>

        <div class="linkedin-card-footer">
          <div class="linkedin-metrics">
            <span class="linkedin-reactions-group" title="${totalReactions} total reactions">
              <span class="linkedin-reaction-icons">
                <span class="reaction-bubble reaction-like">👍</span>
                <span class="reaction-bubble reaction-celebrate">👏</span>
                <span class="reaction-bubble reaction-love">❤️</span>
              </span>
              <span>${totalReactions}</span>
            </span>

            <span class="linkedin-comments-count" title="${commentsCount} comments">
              <i class="uil uil-comment-alt-lines"></i> ${commentsCount}
            </span>
          </div>

          <a href="${postUrl}" target="_blank" rel="noopener noreferrer" class="linkedin-view-btn">
            View Post <i class="uil uil-external-link-alt"></i>
          </a>
        </div>
      </article>
    `;
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
      // Add timestamp query parameter to bypass cache and always fetch fresh on page load
      const cacheBuster = `?t=${new Date().getTime()}`;
      const response = await fetch(LINKEDIN_API_ENDPOINT + cacheBuster);

      if (!response.ok) {
        throw new Error(`Failed to fetch LinkedIn posts (status: ${response.status})`);
      }

      const posts = await response.json();

      if (!Array.isArray(posts) || posts.length === 0) {
        feedContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-color-light);">
            <p>No recent LinkedIn posts found. Check back soon!</p>
          </div>
        `;
        return;
      }

      // Take the latest 5 posts
      const latest5Posts = posts.slice(0, 5);

      // Render cards
      feedContainer.innerHTML = latest5Posts.map(post => createPostCardHTML(post)).join('');
    } catch (error) {
      console.warn('LinkedIn Feed fetch error:', error);
      feedContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--container-color); border-radius: 1rem; border: 1px dashed rgba(10,102,194,0.3);">
          <i class="uil uil-exclamation-triangle" style="font-size: 2rem; color: #f59e0b; margin-bottom: 0.5rem; display: block;"></i>
          <p style="color: var(--title-color); font-weight: 600; margin-bottom: 0.5rem;">Unable to load live LinkedIn posts right now.</p>
          <a href="${ACTIVITY_URL}" target="_blank" rel="noopener noreferrer" class="button button--small button--flex" style="background: #0a66c2; margin-top: 0.5rem; display: inline-flex;">
            View Posts on LinkedIn <i class="uil uil-external-link-alt button__icon"></i>
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
