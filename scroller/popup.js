// Auto Scroll - Popup Script (YouTube & TikTok v1.6.0)

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    // Language Selector
    langSelect: document.getElementById('langSelect'),

    // Master Switch & Content container
    masterEnabled: document.getElementById('masterEnabled'),
    mainContent: document.getElementById('mainContent'),

    // Smart Guards & Direction
    pauseOnCommentsOpen: document.getElementById('pauseOnCommentsOpen'),
    scrollDirection: document.getElementById('scrollDirection'),

    // TikTok
    tiktokEnabled: document.getElementById('tiktokEnabled'),
    tiktokSkipAds: document.getElementById('tiktokSkipAds'),
    tiktokSkipLive: document.getElementById('tiktokSkipLive'),
    tiktokDelay: document.getElementById('tiktokDelay'),

    // YouTube Shorts
    shortsEnabled: document.getElementById('shortsEnabled'),
    shortsDelay: document.getElementById('shortsDelay'),
    shortsLoopCount: document.getElementById('shortsLoopCount'),

    // Common
    showFloatingBtn: document.getElementById('showFloatingBtn'),
    pageScrollEnabled: document.getElementById('pageScrollEnabled'),
    pageScrollSpeed: document.getElementById('pageScrollSpeed'),
    speedDisplay: document.getElementById('speedDisplay'),

    // Donate & Donator Modal
    openDonateModal: document.getElementById('openDonateModal'),
    closeDonateModal: document.getElementById('closeDonateModal'),
    donateModal: document.getElementById('donateModal'),
    tabs: document.querySelectorAll('.modal-tab'),
    panes: document.querySelectorAll('.tab-pane'),
    copyBtns: document.querySelectorAll('.btn-copy'),

    // Footer actions
    btnRate: document.getElementById('btnRate'),
    footerKofi: document.getElementById('footerKofi')
  };

  const defaults = {
    appLang: 'auto', // 'auto' or specific code like 'en', 'vi', 'es', etc.
    masterEnabled: true,
    pauseOnCommentsOpen: true,
    scrollDirection: 'down',

    tiktokEnabled: true,
    tiktokSkipAds: true,
    tiktokSkipLive: true,
    tiktokDelay: '0',

    shortsEnabled: true,
    shortsDelay: '0',
    shortsLoopCount: '1',

    showFloatingBtn: true,
    pageScrollEnabled: false,
    pageScrollSpeed: 3
  };

  const supportedLocales = ['en', 'vi', 'es', 'pt_BR', 'zh_CN', 'zh_TW', 'ja', 'ko', 'de', 'fr', 'ru', 'id', 'hi'];

  function detectSystemLocale() {
    const sys = (chrome?.i18n?.getUILanguage?.() || navigator.language || 'en').toLowerCase().replace('-', '_');

    if (sys.startsWith('zh_cn') || sys.startsWith('zh_hans')) return 'zh_CN';
    if (sys.startsWith('zh_tw') || sys.startsWith('zh_hk') || sys.startsWith('zh_hant')) return 'zh_TW';
    if (sys.startsWith('pt')) return 'pt_BR';

    for (const loc of supportedLocales) {
      if (sys.startsWith(loc.toLowerCase())) {
        return loc;
      }
    }
    return 'en';
  }

  let activeLang = 'en';

  // Apply translations from _locales
  async function applyLocale(langSetting = 'auto') {
    const targetLang = langSetting === 'auto' ? detectSystemLocale() : langSetting;
    activeLang = targetLang;

    try {
      const url = chrome.runtime.getURL(`_locales/${targetLang}/messages.json`);
      const res = await fetch(url);
      const msgs = await res.json();

      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (msgs[key]?.message) {
          el.textContent = msgs[key].message;
        }
      });
    } catch (e) {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const msg = chrome.i18n?.getMessage?.(key);
        if (msg) el.textContent = msg;
      });
    }
  }

  // Load saved settings
  chrome.storage.local.get(defaults, (items) => {
    const savedLang = items.appLang || 'auto';
    if (elements.langSelect) {
      elements.langSelect.value = savedLang;
    }
    applyLocale(savedLang);

    // Master switch
    elements.masterEnabled.checked = items.masterEnabled;
    toggleMainContentState(items.masterEnabled);

    // Smart Guards & Direction
    elements.pauseOnCommentsOpen.checked = items.pauseOnCommentsOpen;
    elements.scrollDirection.value = items.scrollDirection;

    // TikTok
    elements.tiktokEnabled.checked = items.tiktokEnabled;
    elements.tiktokSkipAds.checked = items.tiktokSkipAds;
    elements.tiktokSkipLive.checked = items.tiktokSkipLive;
    elements.tiktokDelay.value = items.tiktokDelay;

    // Shorts
    elements.shortsEnabled.checked = items.shortsEnabled;
    elements.shortsDelay.value = items.shortsDelay;
    elements.shortsLoopCount.value = items.shortsLoopCount;

    // Common
    elements.showFloatingBtn.checked = items.showFloatingBtn;
    elements.pageScrollEnabled.checked = items.pageScrollEnabled;
    elements.pageScrollSpeed.value = items.pageScrollSpeed;
    elements.speedDisplay.textContent = items.pageScrollSpeed;
  });

  // Language selector change
  if (elements.langSelect) {
    elements.langSelect.addEventListener('change', () => {
      const selected = elements.langSelect.value;
      chrome.storage.local.set({ appLang: selected });
      applyLocale(selected);
    });
  }

  function toggleMainContentState(isEnabled) {
    if (elements.mainContent) {
      if (isEnabled) {
        elements.mainContent.classList.remove('disabled-all');
      } else {
        elements.mainContent.classList.add('disabled-all');
      }
    }
  }

  // Save Master switch
  elements.masterEnabled.addEventListener('change', () => {
    const isEnabled = elements.masterEnabled.checked;
    toggleMainContentState(isEnabled);
    chrome.storage.local.set({ masterEnabled: isEnabled });
  });

  // Save Smart Guards
  elements.pauseOnCommentsOpen.addEventListener('change', () => {
    chrome.storage.local.set({ pauseOnCommentsOpen: elements.pauseOnCommentsOpen.checked });
  });

  elements.scrollDirection.addEventListener('change', () => {
    chrome.storage.local.set({ scrollDirection: elements.scrollDirection.value });
  });

  // Save TikTok settings
  elements.tiktokEnabled.addEventListener('change', () => {
    chrome.storage.local.set({ tiktokEnabled: elements.tiktokEnabled.checked });
  });

  elements.tiktokSkipAds.addEventListener('change', () => {
    chrome.storage.local.set({ tiktokSkipAds: elements.tiktokSkipAds.checked });
  });

  elements.tiktokSkipLive.addEventListener('change', () => {
    chrome.storage.local.set({ tiktokSkipLive: elements.tiktokSkipLive.checked });
  });

  elements.tiktokDelay.addEventListener('change', () => {
    chrome.storage.local.set({ tiktokDelay: elements.tiktokDelay.value });
  });

  // Save YouTube settings
  elements.shortsEnabled.addEventListener('change', () => {
    chrome.storage.local.set({ shortsEnabled: elements.shortsEnabled.checked });
  });

  elements.shortsDelay.addEventListener('change', () => {
    chrome.storage.local.set({ shortsDelay: elements.shortsDelay.value });
  });

  elements.shortsLoopCount.addEventListener('change', () => {
    chrome.storage.local.set({ shortsLoopCount: elements.shortsLoopCount.value });
  });

  // Save Common settings
  elements.showFloatingBtn.addEventListener('change', () => {
    chrome.storage.local.set({ showFloatingBtn: elements.showFloatingBtn.checked });
  });

  elements.pageScrollEnabled.addEventListener('change', () => {
    chrome.storage.local.set({ pageScrollEnabled: elements.pageScrollEnabled.checked });
  });

  elements.pageScrollSpeed.addEventListener('input', () => {
    const val = parseInt(elements.pageScrollSpeed.value, 10);
    elements.speedDisplay.textContent = val;
    chrome.storage.local.set({ pageScrollSpeed: val });
  });

  // --- Donate Modal Handling ---
  if (elements.openDonateModal && elements.donateModal) {
    elements.openDonateModal.addEventListener('click', () => {
      elements.donateModal.classList.add('active');
    });

    elements.closeDonateModal.addEventListener('click', () => {
      elements.donateModal.classList.remove('active');
    });

    elements.donateModal.addEventListener('click', (e) => {
      if (e.target === elements.donateModal) {
        elements.donateModal.classList.remove('active');
      }
    });
  }

  // Tabs switching
  elements.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      elements.tabs.forEach((t) => t.classList.remove('active'));
      elements.panes.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Ko-fi button click
  const btnKofi = document.getElementById('btnKofi');
  if (btnKofi) {
    btnKofi.addEventListener('click', () => {
      const url = 'https://ko-fi.com/poordev1997';
      if (chrome?.tabs?.create) {
        chrome.tabs.create({ url });
      } else {
        window.open(url, '_blank');
      }
    });
  }

  // Footer Ko-fi click
  if (elements.footerKofi) {
    elements.footerKofi.addEventListener('click', (e) => {
      e.preventDefault();
      const url = 'https://ko-fi.com/poordev1997';
      if (chrome?.tabs?.create) {
        chrome.tabs.create({ url });
      } else {
        window.open(url, '_blank');
      }
    });
  }

  // Rate Extension Click
  if (elements.btnRate) {
    elements.btnRate.addEventListener('click', (e) => {
      e.preventDefault();
      const extId = chrome.runtime?.id;
      const url = extId
        ? `https://chromewebstore.google.com/detail/${extId}/reviews`
        : 'https://chromewebstore.google.com/';
      if (chrome?.tabs?.create) {
        chrome.tabs.create({ url });
      } else {
        window.open(url, '_blank');
      }
    });
  }

  // One-click Copy
  elements.copyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const text = targetEl.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        const copiedMsg = activeLang === 'vi' ? 'Đã chép!' : (activeLang === 'es' ? '¡Copiado!' : (activeLang === 'zh_CN' || activeLang === 'zh_TW' ? '已复制！' : 'Copied!'));
        btn.textContent = copiedMsg;
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 1500);
      });
    });
  });
});
