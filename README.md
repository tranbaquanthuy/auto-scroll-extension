# Auto Scroll for YouTube & TikTok

> **A smart, lightweight browser extension (Manifest V3)** that automatically scrolls to the next video when watching YouTube Shorts and TikTok. Features intelligent sponsored ad skipping, livestream skipping, comment pause detection, and full hands-free control.

[![Version](https://img.shields.io/badge/version-1.6.0-brightgreen.svg)](https://github.com/tranbaquanthuy/auto-scroll-extension)
[![Manifest](https://img.shields.io/badge/manifest-v3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Locales](https://img.shields.io/badge/locales-13%20languages-blueviolet.svg)](https://github.com/tranbaquanthuy/auto-scroll-extension/tree/main/scroller/_locales)
[![Donate](https://img.shields.io/badge/donate-Ko--fi-ff5e5b.svg)](https://ko-fi.com/poordev1997)

---

## 🌟 Key Features

### ⚡ 1. YouTube Shorts Auto-Scroll
- **Automatic Video Transition**: Automatically detects when a Short finishes playing and advances to the next video seamlessly.
- **Loop Trap Removal**: Automatically eliminates YouTube's default infinite replay loop to allow natural progression.
- **Replay Count (1x, 2x, 3x)**: Choose to replay a video once or multiple times before advancing.
- **Custom Scroll Delay**: Adjust wait time before scrolling (Instant, 0.5s, 1.0s, 2.0s).

### 🎵 2. TikTok Auto-Scroll & Smart Skip
- **Seamless Feed Advancement**: Automatically scrolls down to the next TikTok video upon completion.
- **🚫 Auto-Skip Sponsored Ads**: Automatically detects promotional and sponsored posts (`Sponsored`, `Ad`, `Promoted`) and advances immediately.
- **📡 Auto-Skip Livestreams**: Detects live broadcast rooms and skips past them automatically so you only watch video clips.
- **Delay Configuration**: Set an optional delay before advancing to the next TikTok.

### 💬 3. Smart Guards
- **Pause on Comments**: Automatically detects when the comments drawer/panel is opened on YouTube Shorts or TikTok and pauses auto-scrolling so you can read without losing your spot.
- **Typing Guard**: Automatically suspends auto-scroll whenever you are actively typing a comment, reply, or search query.

### 🎛️ 4. Controls & Customization
- **Master Switch**: A single toggle switch in the popup header to enable or disable all features instantly.
- **Scroll Direction**: Choose your preferred scroll direction: **Down** (Next video) or **Up** (Previous video).
- **Floating Quick-Toggle Button**: An elegant, dark-mode pill button appears on-screen on Shorts & TikTok for one-click toggling without opening the extension menu.
- **Keyboard Shortcut (`Alt + S`)**: Quickly toggle auto-scroll on or off anytime with an on-screen toast notification.
- **Regular YouTube Page Scroll**: Continuous smooth scrolling for long feed pages and comment sections with adjustable speed (1–10).

### 🌐 5. Global Multilingual Support (13 Locales)
Fully translated into the top 13 global languages with automatic browser language detection and an instant language switcher:
- **English (Default)**, **Tiếng Việt**, **Español**, **Português (BR)**, **简体中文**, **繁體中文**, **日本語**, **한국어**, **Deutsch**, **Français**, **Русский**, **Bahasa Indonesia**, **हिन्दी**.

---

## 📁 Project Structure

```text
auto-scroll-extension/
├── scroller/                      # Core extension source directory
│   ├── _locales/                  # 13 international translation dictionaries
│   ├── manifest.json              # Manifest V3 configuration
│   ├── content.js                 # Multi-tier scroll engine & DOM observers
│   ├── content.css                # Floating toggle button & toast styling
│   ├── popup.html                 # Dark mode settings popup
│   ├── popup.css                  # Popup interface styles
│   ├── popup.js                   # Settings sync & locale controller
│   ├── icon*.png                  # Extension icons (16px, 48px, 128px)
│   ├── build.ps1                  # Packaging & distribution script
│   ├── PRIVACY.md                 # Privacy Policy documentation
│   └── README.md                  # Extension documentation
├── auto-scroll-youtube-tiktok.zip # Store-ready distribution archive
├── screenshot_1280x800.png        # Official 1280x800 store screenshot
├── PRIVACY.md                     # Official Privacy Policy
├── AGENTS.md                      # Technical context & SemVer release log
└── README.md                      # Repository overview
```

---

## 🚀 Installation Guide

### Manual Installation (Developer Mode)
Compatible with **Google Chrome, Microsoft Edge, Brave, Opera, Cốc Cốc, and all Chromium browsers**:

1. Open your browser's extension manager:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
2. Enable **Developer mode** toggle in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `scroller` directory:
   ```text
   D:\Work\Personal Project\Extension\scroller
   ```
5. Navigate to [YouTube Shorts](https://www.youtube.com/shorts) or [TikTok](https://www.tiktok.com) and enjoy hands-free viewing!

---

## 🛡️ Privacy & Permissions

- **Zero Data Collection**: We do **not** collect, store, transmit, or sell any personal information or browsing history.
- **Minimal Permissions**:
  - `storage`: Used strictly to save your settings locally on your machine.
  - Host permissions (`youtube.com`, `tiktok.com`): Required exclusively to detect video playback status and execute page navigation.
- **No Remote Code**: 100% compliant with Chrome Web Store Manifest V3 guidelines. All scripts are packaged locally.

For our full privacy statement, please view [PRIVACY.md](PRIVACY.md).

---

## ☕ Support the Developer

If you find this extension helpful and want to support ongoing maintenance and new features, consider buying the developer a coffee:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Creator-ff5e5b?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/poordev1997)

👉 **[https://ko-fi.com/poordev1997](https://ko-fi.com/poordev1997)**

---

## 📜 Version History

| Version | Date | Highlights |
|---|---|---|
| **v1.6.0** | 2026-11-08 | Added 13 international locales, automated browser language detection, and multi-tier scroll engine. |
| **v1.5.0** | 2026-11-08 | Chrome i18n architecture implementation with English default and Vietnamese support. |
| **v1.4.0** | 2026-11-08 | Smart comment pause detection, header master toggle, scroll direction option, store review link. |
| **v1.3.0** | 2026-11-08 | Ko-fi donation integration (`ko-fi.com/poordev1997`) and distribution packaging automation. |
| **v1.2.0** | 2026-11-08 | Donator modal and Hall of Fame supporters section. |
| **v1.1.0** | 2026-11-08 | Full TikTok support with automated sponsored ad and livestream skipping. |
| **v1.0.0** | 2026-11-08 | Initial release: YouTube Shorts auto-advance, floating button, and page auto-scroll. |

---

## 📄 License

This project is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
