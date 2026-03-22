🌐 **English** | [Русский](CHANGELOG_RU.md)

---

# Changelog

## v1.0.0 — unreleased

### Features
- **Password tab**: length slider (4–64, default 20), uppercase / lowercase / numbers / symbols toggles, exclude similar characters (I, l, 1, O, 0), no-repeating-characters option, extra symbols field, exclude characters field, 8 platform presets (PostgreSQL, MySQL, SQL Server, Linux User, Windows Admin, Redis, RabbitMQ, High Entropy), strength bar (1–5 scale with color coding)
- **Passphrase tab**: word count slider (2–10, default 8), capitalize words / random capitalization options, add digit at start / end, random numbers inside phrase (randomly appends a digit to some words), separator selector (space, dash, dot, underscore, random symbol, none; default: dash), ~500-word built-in wordlist
- **PIN tab**: length slider (4–12 digits, default 6)
- Generate multiple results at once (count slider 1–20) on all three tabs
- Per-result copy button; Copy all button opens a modal with all results in a textarea
- Regenerate button shared across all results on each tab
- Results visible by default (no show/hide toggle)
- Cryptographically secure randomness via `window.crypto.getRandomValues()` with rejection sampling to eliminate modulo bias
- Strength indicator based on Shannon entropy (bits = length × log₂(pool size)); thresholds: <28 Very Weak, 28–39 Weak, 40–59 Fair, 60–79 Strong, ≥80 Very Strong

### UI
- Dark/light theme toggle (sun/moon icon) in the header; dark theme is default
- EN / RU language switcher in the header and inside the help modal
- Help modal (?) with usage guide
- Lock icon SVG logo to the left of the page title
- `favicon.ico` generated from the lock logo (16/32/48 px, pure Node.js, no external tools)
- Version number in the footer

### Persistence
- All generator settings saved to `localStorage` and restored on page reload: theme, language, active tab, all per-tab options (length, count, presets, checkboxes, separator)
- Settings versioning with migration: stale defaults from earlier development builds are corrected automatically on first load

---

🌐 **English** | [Русский](CHANGELOG_RU.md)
