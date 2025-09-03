<div align="center">
	<img src="icon.png" alt="Message via WhatsApp Icon" width="96" height="96" />

	<h1>📨 Message via WhatsApp – Chrome Extension</h1>
	<p>Instantly open a WhatsApp chat with any phone number found on a webpage – no saving to contacts required.</p>

	<a href="https://chromewebstore.google.com/detail/message-via-whatsapp/obcfmbihiocgfmgflfidjlildciokgif" target="_blank"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Install%20from%20Chrome%20Web%20Store-4285F4?logo=googlechrome&logoColor=white"></a>
	<br />
	<img alt="License" src="https://img.shields.io/badge/License-MIT-green"> <img alt="Maintained" src="https://img.shields.io/badge/Status-Active-success">
</div>

---

## ✨ What It Does
This extension scans webpages for phone numbers (international & local formats). It adds a subtle WhatsApp icon next to each number. Click the icon → a new WhatsApp Web (or mobile) chat opens with the parsed number.

## 🔍 Features
* 🧠 Smart detection of international formats (+34, +39, +972, +1, etc.)
* 🌍 Automatic country code fallback based on browser locale (configurable)
* ⚡ Live scanning – dynamically added content is processed via a `MutationObserver`
* 🛡️ Safe: skips inside inputs, textareas, editable regions, code blocks & SVG
* 🖱️ One‑click to open `https://wa.me/<number>` in a new tab
* 🎯 Minimal footprint & defensive DOM traversal to avoid performance hits

## 🖼️ Example (Conceptual)
```
Contact Sales: +34 612 34 56 78   [wa-icon]
Support (Italy): +39 06 6982       [wa-icon]
Local (IL): 054-123-4567           [wa-icon]
```
> The actual icon is positioned just to the right of each detected number.

## 🚀 Install
1. Visit the Chrome Web Store listing:  
	 https://chromewebstore.google.com/detail/message-via-whatsapp/obcfmbihiocgfmgflfidjlildciokgif
2. Click **Add to Chrome**
3. Browse any page with phone numbers – icons appear automatically.

## 🧪 Local Development
Clone / download the repository, then load it as an unpacked extension:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the project folder
5. Open `test-content.html` in a tab to manually verify detection

### Key Files
| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (permissions, content scripts, etc.) |
| `content.js` | Injected script that scans the DOM & adds WhatsApp icons |
| `popup.html` / `popup.js` | (If used) UI for user settings / toggles |
| `countries.js` | Country metadata (if leveraged) |
| `test-content.html` | Manual QA page with varied number formats |
| `icon.png` | Extension/icon asset |

## 🧭 How Number Parsing Works
1. A broad, guarded regex matches candidate number strings.
2. Non‑digit characters are stripped (except `+` for prefix logic).
3. Local numbers starting with a single `0` are prefixed with the chosen / fallback country code.
4. Double‑zero prefix (`00XX…`) is normalized to an international number.
5. Result → `https://wa.me/<digits>` opened in a new tab.

## ⚙️ Settings & Behavior
The extension may store (via `chrome.storage.local`):
* `injectIcons` – Boolean to enable/disable auto-injection
* `country` – Preferred country code override (e.g. `34`, `39`, `972`)

If `country` isn’t set, a best‑effort guess from `navigator.language` is used; otherwise a fallback (`972`) is applied.

## 🔒 Permissions Rationale
| Permission | Reason |
|------------|--------|
| `storage` | Persist user settings (country code, toggle) |
| `activeTab` / Content script matches | Inject detection logic on relevant pages |

No external network requests are made besides opening the WhatsApp Web URL on click.

## 🐞 Troubleshooting
| Issue | Fix |
|-------|-----|
| Icons not appearing | Refresh page; ensure extension is enabled; verify no conflicting content blockers |
| Wrong country code applied | Set a specific country in extension popup (if available) or clear storage and reload |
| Too many false positives | Open an issue with sample text – regex can be refined |
| Performance lag on huge pages | Detection is debounced; report problematic URLs for optimization |

## 🧹 Performance Notes
The script: 
* Uses `TreeWalker` to traverse only text nodes
* Marks processed nodes to avoid re-wrapping
* Debounces mutation-based rescans
* Skips nodes inside interactive or code contexts

## 🤝 Contributing
1. Fork the repo
2. Create a feature branch (`feat/improve-detection`)
3. Submit a PR with a clear description and before/after cases
4. Add/update entries in `test-content.html` for new formats

## 📄 License
MIT. See `LICENSE` (add one if not present).

## 🛑 Disclaimer
Not affiliated with WhatsApp / Meta. Use responsibly and respect user privacy and local regulations regarding unsolicited messaging.

## 🙌 Acknowledgements
Thanks to the open-source community for inspiration around safe DOM processing and international phone patterns.

---

### 💬 Need Help?
Open an issue or submit a PR. Enjoy faster WhatsApp messaging! ✨

