// Auto Scroll Extension for YouTube & TikTok (v1.6.1 - Bulletproof Scroller)

(() => {
  const isYouTube = window.location.hostname.includes('youtube.com');
  const isTikTok = window.location.hostname.includes('tiktok.com');

  // Default configuration
  const defaultSettings = {
    // Master Switch
    masterEnabled: true,

    // Smart Guards & Direction
    pauseOnCommentsOpen: true,
    scrollDirection: 'down', // 'down' (next) or 'up' (previous)

    // YouTube Shorts
    shortsEnabled: true,
    shortsDelay: 0, // seconds
    shortsLoopCount: 1,
    showFloatingBtn: true,
    pageScrollEnabled: false,
    pageScrollSpeed: 3,

    // TikTok
    tiktokEnabled: true,
    tiktokSkipAds: true,
    tiktokSkipLive: true,
    tiktokDelay: 0 // seconds
  };

  let settings = { ...defaultSettings };
  let currentVideo = null;
  let playedTimes = 0;
  let lastScrolledAt = 0;
  let lastVideoTime = 0;
  let delayTimer = null;
  let floatingBtn = null;
  let isNavigating = false;
  let pageScrollAnimationId = null;
  let lastUrl = window.location.href;

  // Load saved settings
  if (chrome?.storage?.local) {
    chrome.storage.local.get(defaultSettings, (items) => {
      settings = { ...settings, ...items };
      init();
    });

    // Listen for setting changes from popup
    chrome.storage.onChanged.addListener((changes) => {
      for (const [key, { newValue }] of Object.entries(changes)) {
        settings[key] = newValue;
      }
      updateFloatingBtn();
      if (isYouTube) handlePageScroll();
    });
  } else {
    init();
  }

  function init() {
    console.log('[Auto Scroll] Initialized on', window.location.hostname);
    if (isYouTube) {
      setupYouTubeObserver();
      setupNavigationListener();
      handlePageScroll();
    } else if (isTikTok) {
      setupTikTokObserver();
      setupNavigationListener();
    }
    setupShortcuts();
    startHighFrequencyMonitor();
  }

  // --- Common Navigation Handling ---
  function setupNavigationListener() {
    window.addEventListener('yt-navigate-finish', onUrlChange);
    window.addEventListener('popstate', onUrlChange);

    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        onUrlChange();
      }
    }, 500);
  }

  function onUrlChange() {
    clearTimeout(delayTimer);
    playedTimes = 0;
    currentVideo = null;
    lastVideoTime = 0;

    if (isYouTube) {
      if (isShorts()) {
        stopPageScroll();
        attachToCurrentShortVideo();
        ensureFloatingBtn();
      } else {
        removeFloatingBtn();
        handlePageScroll();
      }
    } else if (isTikTok) {
      attachToCurrentTikTokVideo();
      ensureFloatingBtn();
    }
  }

  // --- Smart Guards: Typing & Comments Detection ---
  function isUserTyping() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  // Exact Tyson3101 method: Check YouTube comments engagement panel specifically
  function isYouTubeCommentsOpen() {
    const commentsPanel = document.querySelector(
      'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"]'
    );
    if (!commentsPanel) return false;

    const visibility = commentsPanel.getAttribute('visibility');
    const hasVisibleContent = commentsPanel
      .querySelector('[panel-target-id="engagement-panel-comments-section"]')
      ?.hasAttribute('panel-content-visible');

    return visibility === 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED' || hasVisibleContent === true;
  }

  function isTikTokCommentsOpen() {
    const commentList = document.querySelector(
      '[data-e2e="comment-list"], div[class*="DivCommentListContainer"], div[class*="DivCommentContainer"]'
    );
    return !!(commentList && commentList.offsetParent !== null && commentList.offsetHeight > 100);
  }

  function isCommentsOpen() {
    if (!settings.pauseOnCommentsOpen) return false;
    if (isYouTube) return isYouTubeCommentsOpen();
    if (isTikTok) return isTikTokCommentsOpen();
    return false;
  }

  // --- Directional Keyboard & Scroll Dispatch ---
  function dispatchKey(keyName, keyCode) {
    const keyEvent = new KeyboardEvent('keydown', {
      key: keyName,
      code: keyName,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true
    });
    (document.activeElement || document.body || document).dispatchEvent(keyEvent);
    window.dispatchEvent(keyEvent);
  }

  function dispatchNavigationKey() {
    if (settings.scrollDirection === 'up') {
      dispatchKey('ArrowUp', 38);
    } else {
      dispatchKey('ArrowDown', 40);
    }
  }

  // ==========================================
  //            YOUTUBE SECTION
  // ==========================================
  function isShorts() {
    return isYouTube && window.location.pathname.startsWith('/shorts');
  }

  function setupYouTubeObserver() {
    setInterval(() => {
      if (!isShorts()) return;
      attachToCurrentShortVideo();
      ensureFloatingBtn();
    }, 700);
  }

  function findActiveShortContainer() {
    const selectors = [
      'ytd-reel-video-renderer[is-active]',
      '.reel-video-in-sequence[is-active]',
      'ytd-reel-video-renderer',
      '.reel-video-in-sequence',
      '.reel-video-in-sequence-new'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }

    // Fallback: check container of playing video
    const playingVideo = Array.from(document.querySelectorAll('video')).find(
      (v) => !v.paused && v.duration > 0 && v.offsetHeight > 100
    );
    if (playingVideo) {
      return (
        playingVideo.closest('ytd-reel-video-renderer, .reel-video-in-sequence, .reel-video-in-sequence-new') ||
        playingVideo.parentElement
      );
    }

    return null;
  }

  function getActiveYouTubeVideo() {
    const activeRenderer = findActiveShortContainer();
    if (activeRenderer) {
      const v = activeRenderer.querySelector('video');
      if (v) return v;
    }

    const allVideos = Array.from(document.querySelectorAll('ytd-shorts video, #shorts-player video, video'));
    for (const v of allVideos) {
      if (!v.paused && v.duration > 0 && v.offsetHeight > 100) {
        return v;
      }
    }
    return allVideos[0] || null;
  }

  function attachToCurrentShortVideo() {
    if (!isShorts()) return;

    const video = getActiveYouTubeVideo();
    if (!video) return;

    // Strip loop attribute immediately
    if (video.hasAttribute('loop') || video.loop) {
      video.removeAttribute('loop');
      video.loop = false;
    }

    if (video === currentVideo) return;

    if (currentVideo) {
      currentVideo.removeEventListener('timeupdate', onYouTubeTimeUpdate);
      currentVideo.removeEventListener('ended', onYouTubeEnded);
    }

    currentVideo = video;
    playedTimes = 0;
    lastVideoTime = 0;

    currentVideo.addEventListener('timeupdate', onYouTubeTimeUpdate);
    currentVideo.addEventListener('ended', onYouTubeEnded);
    currentVideo.addEventListener('play', () => {
      if (currentVideo) {
        currentVideo.removeAttribute('loop');
        currentVideo.loop = false;
      }
    });

    console.log('[Auto Scroll] Attached to Shorts video:', currentVideo.src || 'HTML5 Video');
  }

  function onYouTubeTimeUpdate() {
    if (!settings.masterEnabled || !settings.shortsEnabled || !currentVideo || currentVideo.paused) return;

    if (currentVideo.loop) {
      currentVideo.removeAttribute('loop');
      currentVideo.loop = false;
    }

    const { duration, currentTime } = currentVideo;
    if (duration > 0 && currentTime >= duration - 0.35) {
      handleYouTubeVideoFinished();
    }
  }

  function onYouTubeEnded() {
    if (!settings.masterEnabled || !settings.shortsEnabled) return;
    handleYouTubeVideoFinished();
  }

  function handleYouTubeVideoFinished() {
    if (!settings.masterEnabled || !settings.shortsEnabled || isNavigating) return;

    // Check smart guards
    if (isUserTyping()) {
      console.log('[Auto Scroll] Paused: User is typing');
      return;
    }

    if (isCommentsOpen()) {
      console.log('[Auto Scroll] Paused: Comments are open');
      return;
    }

    const now = Date.now();
    if (now - lastScrolledAt < 1200) return;

    playedTimes++;
    const targetLoops = Math.max(1, parseInt(settings.shortsLoopCount) || 1);

    if (playedTimes < targetLoops) {
      console.log(`[Auto Scroll] Replaying short (${playedTimes}/${targetLoops})`);
      if (currentVideo) {
        currentVideo.currentTime = 0;
        currentVideo.play().catch(() => {});
      }
      return;
    }

    playedTimes = 0;
    lastScrolledAt = now;

    console.log('[Auto Scroll] Short finished! Preparing scroll...');

    const delayMs = (parseFloat(settings.shortsDelay) || 0) * 1000;
    if (delayMs > 0) {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        scrollToNextYouTubeShort();
      }, delayMs);
    } else {
      scrollToNextYouTubeShort();
    }
  }

  // Multi-tier robust scroll execution
  function scrollToNextYouTubeShort() {
    if (!isShorts() || isNavigating) return;
    isNavigating = true;

    console.log('[Auto Scroll] Executing scroll to next short...');

    const isUp = settings.scrollDirection === 'up';
    const activeContainer = findActiveShortContainer();
    let scrolled = false;

    // Method 1: Sibling DOM element scrollIntoView (Super smooth and 100% reliable)
    if (activeContainer) {
      const targetSibling = isUp ? activeContainer.previousElementSibling : activeContainer.nextElementSibling;
      if (targetSibling) {
        targetSibling.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        scrolled = true;
      }

      // Or by ID (YouTube numbers them sequentially: 0, 1, 2, 3...)
      if (!scrolled && activeContainer.id) {
        const curId = parseInt(activeContainer.id, 10);
        if (!isNaN(curId)) {
          const nextEl = document.getElementById((isUp ? curId - 1 : curId + 1).toString());
          if (nextEl) {
            nextEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            scrolled = true;
          }
        }
      }
    }

    // Method 2: Click YouTube's down navigation button
    const selector = isUp
      ? '#navigation-button-up button, #navigation-button-up ytd-button-renderer button, ytd-shorts [aria-label*="Previous"], ytd-shorts [aria-label*="trước"]'
      : '#navigation-button-down button, #navigation-button-down ytd-button-renderer button, ytd-shorts [aria-label*="Next"], ytd-shorts [aria-label*="tiếp theo"]';

    const navBtn = document.querySelector(selector);
    if (navBtn) {
      navBtn.click();
      scrolled = true;
    }

    // Method 3: WheelEvent simulation (Triggers YouTube's internal listener)
    const wheelDelta = isUp ? -window.innerHeight : window.innerHeight;
    window.dispatchEvent(
      new WheelEvent('wheel', {
        deltaY: wheelDelta,
        bubbles: true,
        cancelable: true
      })
    );

    // Method 4: ArrowDown KeyboardEvent
    dispatchNavigationKey();

    // Method 5: window.scrollBy fallback
    window.scrollBy({
      top: isUp ? -window.innerHeight : window.innerHeight,
      behavior: 'smooth'
    });

    setTimeout(() => {
      isNavigating = false;
      attachToCurrentShortVideo();
    }, 900);
  }

  // Regular Page Auto Scroll for YouTube
  function handlePageScroll() {
    if (isShorts() || !settings.masterEnabled) {
      stopPageScroll();
      return;
    }

    if (settings.pageScrollEnabled) {
      startPageScroll();
    } else {
      stopPageScroll();
    }
  }

  function startPageScroll() {
    if (pageScrollAnimationId) return;

    function step() {
      if (!settings.masterEnabled || !settings.pageScrollEnabled || isShorts()) {
        stopPageScroll();
        return;
      }
      if (!isUserTyping()) {
        const speed = Math.max(1, Math.min(10, settings.pageScrollSpeed || 3));
        const direction = settings.scrollDirection === 'up' ? -1 : 1;
        window.scrollBy(0, speed * 0.75 * direction);
      }
      pageScrollAnimationId = requestAnimationFrame(step);
    }

    pageScrollAnimationId = requestAnimationFrame(step);
  }

  function stopPageScroll() {
    if (pageScrollAnimationId) {
      cancelAnimationFrame(pageScrollAnimationId);
      pageScrollAnimationId = null;
    }
  }

  // ==========================================
  //             TIKTOK SECTION
  // ==========================================
  function setupTikTokObserver() {
    setInterval(() => {
      if (!isTikTok) return;
      attachToCurrentTikTokVideo();
      ensureFloatingBtn();
    }, 700);
  }

  function getActiveTikTokContainer() {
    const containers = Array.from(
      document.querySelectorAll(
        '[data-e2e="feed-item"], [data-e2e="recommend-list-item-container"], div[class*="DivItemContainer"], div[class*="DivVideoWrapper"]'
      )
    );

    for (const c of containers) {
      const v = c.querySelector('video');
      if (v && (!v.paused || isElementInViewport(c))) {
        return { container: c, video: v };
      }
    }

    const videos = Array.from(document.querySelectorAll('video'));
    for (const v of videos) {
      if (!v.paused && v.offsetHeight > 100) {
        return { container: v.closest('div[class*="Container"]') || v.parentElement, video: v };
      }
    }

    return null;
  }

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top >= -rect.height / 2 && rect.bottom <= windowHeight + rect.height / 2;
  }

  function isTikTokAd(container) {
    if (!container) return false;
    if (
      container.querySelector(
        '[data-e2e="feed-ad"], [data-e2e="ad-action-button"], [data-e2e="ad-tag"], [class*="AdTag"], [class*="ad-tag"]'
      )
    ) {
      return true;
    }
    const textElements = container.querySelectorAll('span, div, p, strong');
    for (const el of textElements) {
      if (el.children.length === 0) {
        const text = el.textContent.trim().toLowerCase();
        if (text === 'sponsored' || text === 'được tài trợ' || text === 'quảng cáo' || text === 'ad') {
          return true;
        }
      }
    }
    return false;
  }

  function isTikTokLive(container, video) {
    if (video && (video.duration === Infinity || (video.duration === 0 && !video.paused))) {
      return true;
    }
    if (!container) return false;
    if (
      container.querySelector(
        '[data-e2e="live-badge"], [data-e2e="live-card"], [class*="LiveBadge"], [class*="live-badge"]'
      )
    ) {
      return true;
    }
    if (container.querySelector('a[href*="/live"]')) {
      return true;
    }
    const textElements = container.querySelectorAll('span, div');
    for (const el of textElements) {
      if (el.children.length === 0) {
        const text = el.textContent.trim().toUpperCase();
        if (text === 'LIVE' || text === 'TRỰC TIẾP') {
          return true;
        }
      }
    }
    return false;
  }

  function attachToCurrentTikTokVideo() {
    if (!isTikTok || !settings.masterEnabled) return;

    const item = getActiveTikTokContainer();
    if (!item || !item.video) return;

    const { container, video } = item;

    // Check if current item is an Ad
    if (settings.tiktokEnabled && settings.tiktokSkipAds && isTikTokAd(container)) {
      const now = Date.now();
      if (now - lastScrolledAt > 1500) {
        lastScrolledAt = now;
        const msg = chrome.i18n?.getMessage?.('toastAdSkipped') || 'Skipped TikTok Ad ⚡';
        showToast(msg);
        scrollToNextTikTok();
        return;
      }
    }

    // Check if current item is a Livestream
    if (settings.tiktokEnabled && settings.tiktokSkipLive && isTikTokLive(container, video)) {
      const now = Date.now();
      if (now - lastScrolledAt > 1500) {
        lastScrolledAt = now;
        const msg = chrome.i18n?.getMessage?.('toastLiveSkipped') || 'Skipped TikTok Live ⚡';
        showToast(msg);
        scrollToNextTikTok();
        return;
      }
    }

    if (video.hasAttribute('loop') || video.loop) {
      video.removeAttribute('loop');
      video.loop = false;
    }

    if (video === currentVideo) return;

    if (currentVideo) {
      currentVideo.removeEventListener('timeupdate', onTikTokTimeUpdate);
      currentVideo.removeEventListener('ended', onTikTokEnded);
    }

    currentVideo = video;
    currentVideo.loop = false;

    currentVideo.addEventListener('timeupdate', onTikTokTimeUpdate);
    currentVideo.addEventListener('ended', onTikTokEnded);
    currentVideo.addEventListener('play', () => {
      if (currentVideo) {
        currentVideo.removeAttribute('loop');
        currentVideo.loop = false;
      }
    });
  }

  function onTikTokTimeUpdate() {
    if (!settings.masterEnabled || !settings.tiktokEnabled || !currentVideo || currentVideo.paused) return;
    if (currentVideo.loop) currentVideo.loop = false;

    const { duration, currentTime } = currentVideo;
    if (duration > 0 && currentTime >= duration - 0.35) {
      handleTikTokVideoFinished();
    }
  }

  function onTikTokEnded() {
    if (!settings.masterEnabled || !settings.tiktokEnabled) return;
    handleTikTokVideoFinished();
  }

  function handleTikTokVideoFinished() {
    if (!settings.masterEnabled || !settings.tiktokEnabled || isNavigating) return;

    if (isUserTyping() || isCommentsOpen()) return;

    const now = Date.now();
    if (now - lastScrolledAt < 1200) return;
    lastScrolledAt = now;

    const delayMs = (parseFloat(settings.tiktokDelay) || 0) * 1000;
    if (delayMs > 0) {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        scrollToNextTikTok();
      }, delayMs);
    } else {
      scrollToNextTikTok();
    }
  }

  function scrollToNextTikTok() {
    if (!isTikTok || isNavigating) return;
    isNavigating = true;

    const isUp = settings.scrollDirection === 'up';
    const item = getActiveTikTokContainer();

    // 1. Sibling container scrollIntoView
    if (item?.container) {
      const sibling = isUp ? item.container.previousElementSibling : item.container.nextElementSibling;
      if (sibling) {
        sibling.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // 2. Next button on TikTok
    const nextBtn = document.querySelector(
      isUp
        ? '[data-e2e="arrow-up"], button[aria-label*="Up"], button[aria-label*="Trước"]'
        : '[data-e2e="arrow-down"], [data-e2e="arrow-right"], button[aria-label*="Down"], button[aria-label*="next"], button[aria-label*="Tiếp"]'
    );
    if (nextBtn) {
      nextBtn.click();
    }

    // 3. Wheel event
    window.dispatchEvent(
      new WheelEvent('wheel', {
        deltaY: isUp ? -window.innerHeight : window.innerHeight,
        bubbles: true,
        cancelable: true
      })
    );

    // 4. Arrow key
    dispatchNavigationKey();

    // 5. Scroll by fallback
    window.scrollBy({
      top: isUp ? -window.innerHeight : window.innerHeight,
      behavior: 'smooth'
    });

    setTimeout(() => {
      isNavigating = false;
      attachToCurrentTikTokVideo();
    }, 900);
  }

  // ==========================================
  //     HIGH FREQUENCY LOOP/END MONITOR (150ms)
  // ==========================================
  function startHighFrequencyMonitor() {
    setInterval(() => {
      if (!settings.masterEnabled) return;

      if (isShorts()) {
        if (!settings.shortsEnabled) return;
        const video = getActiveYouTubeVideo();
        if (video && !video.paused && video.duration > 0) {
          // Keep loop attribute removed
          if (video.hasAttribute('loop') || video.loop) {
            video.removeAttribute('loop');
            video.loop = false;
          }

          const dur = video.duration;
          const cur = video.currentTime;

          // Check near end
          if (cur >= dur - 0.35) {
            handleYouTubeVideoFinished();
          }
          // Detect loop reset if YouTube internally looped the video
          else if (cur < 1.0 && lastVideoTime > dur * 0.85) {
            console.log('[Auto Scroll] Detected YouTube loop reset, triggering advance');
            handleYouTubeVideoFinished();
          }

          lastVideoTime = cur;
        }
      } else if (isTikTok) {
        if (!settings.tiktokEnabled) return;
        const item = getActiveTikTokContainer();
        const video = item?.video;
        if (video && !video.paused && video.duration > 0) {
          if (video.hasAttribute('loop') || video.loop) {
            video.removeAttribute('loop');
            video.loop = false;
          }

          const dur = video.duration;
          const cur = video.currentTime;

          if (cur >= dur - 0.35) {
            handleTikTokVideoFinished();
          } else if (cur < 1.0 && lastVideoTime > dur * 0.85) {
            console.log('[Auto Scroll] Detected TikTok loop reset, triggering advance');
            handleTikTokVideoFinished();
          }

          lastVideoTime = cur;
        }
      }
    }, 150);
  }

  // ==========================================
  //          FLOATING BUTTON & SHORTCUTS
  // ==========================================
  function ensureFloatingBtn() {
    const isTargetPage = (isYouTube && isShorts()) || isTikTok;
    if (!isTargetPage || !settings.showFloatingBtn || !settings.masterEnabled) {
      removeFloatingBtn();
      return;
    }

    if (floatingBtn && document.body.contains(floatingBtn)) {
      updateFloatingBtn();
      return;
    }

    floatingBtn = document.createElement('div');
    floatingBtn.id = 'yt-auto-scroll-btn';
    floatingBtn.title = 'Bật/Tắt Auto Scroll (Alt + S)';

    floatingBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCurrentAutoScroll();
    });

    document.body.appendChild(floatingBtn);
    updateFloatingBtn();
  }

  function removeFloatingBtn() {
    if (floatingBtn?.parentNode) {
      floatingBtn.parentNode.removeChild(floatingBtn);
    }
    floatingBtn = null;
  }

  function updateFloatingBtn() {
    if (!floatingBtn) return;

    const isActive = settings.masterEnabled && (isTikTok ? settings.tiktokEnabled : settings.shortsEnabled);
    floatingBtn.className = isActive ? 'yt-as-active' : 'yt-as-inactive';

    const platformLabel = isTikTok ? 'TikTok' : 'Shorts';
    const onLabel = chrome.i18n?.getMessage?.('statusOn') || 'ON';
    const offLabel = chrome.i18n?.getMessage?.('statusOff') || 'OFF';

    floatingBtn.textContent = '';
    const iconSpan = document.createElement('span');
    iconSpan.className = 'yt-as-icon';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('fill', 'currentColor');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z');
    svg.appendChild(path);
    iconSpan.appendChild(svg);

    const textSpan = document.createElement('span');
    textSpan.textContent = ` ${platformLabel} Scroll `;

    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'yt-as-badge';
    badgeSpan.textContent = isActive ? onLabel : offLabel;

    floatingBtn.append(iconSpan, textSpan, badgeSpan);
  }

  function toggleCurrentAutoScroll() {
    const onLabel = chrome.i18n?.getMessage?.('statusOn') || 'ON';
    const offLabel = chrome.i18n?.getMessage?.('statusOff') || 'OFF';

    if (isTikTok) {
      const newState = !settings.tiktokEnabled;
      settings.tiktokEnabled = newState;
      if (chrome?.storage?.local) {
        chrome.storage.local.set({ tiktokEnabled: newState });
      }
      updateFloatingBtn();
      const label = chrome.i18n?.getMessage?.('toastTiktok') || 'TikTok Auto Scroll';
      showToast(`${label}: ${newState ? onLabel : offLabel}`);
    } else {
      const newState = !settings.shortsEnabled;
      settings.shortsEnabled = newState;
      if (chrome?.storage?.local) {
        chrome.storage.local.set({ shortsEnabled: newState });
      }
      updateFloatingBtn();
      const label = chrome.i18n?.getMessage?.('toastShorts') || 'YouTube Shorts Auto Scroll';
      showToast(`${label}: ${newState ? onLabel : offLabel}`);
    }
  }

  function setupShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
        e.preventDefault();
        const onLabel = chrome.i18n?.getMessage?.('statusOn') || 'ON';
        const offLabel = chrome.i18n?.getMessage?.('statusOff') || 'OFF';

        if (isTikTok || isShorts()) {
          toggleCurrentAutoScroll();
        } else if (isYouTube) {
          const newState = !settings.pageScrollEnabled;
          settings.pageScrollEnabled = newState;
          if (chrome?.storage?.local) {
            chrome.storage.local.set({ pageScrollEnabled: newState });
          }
          handlePageScroll();
          const label = chrome.i18n?.getMessage?.('toastPage') || 'Regular Page Scroll';
          showToast(`${label}: ${newState ? onLabel : offLabel}`);
        }
      }
    });
  }

  function showToast(message) {
    let toast = document.getElementById('yt-auto-scroll-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'yt-auto-scroll-toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('yt-toast-show');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('yt-toast-show');
    }, 2200);
  }
})();
