🌐 **English** | [Русский](CHANGELOG_RU.md)

---

# Changelog

## v1.0.0 — unreleased

### UI
- Dark/light theme toggle (sun/moon icon) in the header; dark theme is the default; preference saved to `localStorage`
- EN / RU language switcher in the header and inside the help modal
- Help modal (?) with usage guide and language switcher
- Lock icon SVG logo to the left of the page title
- Version number in the footer

### Features
- **Password tab**: length slider (4–64), uppercase / lowercase / numbers / symbols toggles, exclude similar characters (I, l, 1, O, 0), extra symbols field, exclude characters field, 8 platform presets (PostgreSQL, MySQL, SQL Server, Linux User, Windows Admin, Redis, RabbitMQ, High Entropy), strength bar (1–5 scale with color coding)
- **Passphrase tab**: word count slider (2–10), capitalize words / random capitalization options (mutually exclusive), add digit at start / end, separator selector (space, dash, dot, underscore, random symbol, none), ~500-word built-in wordlist
- **PIN tab**: length slider (4–12 digits)
- Show / hide result toggle for all three tabs
- Copy to clipboard button for all three tabs (resets to original label after 2 s)
- Regenerate button for all three tabs
- Cryptographically secure randomness via `window.crypto.getRandomValues()` with rejection sampling to eliminate modulo bias

---

🌐 **English** | [Русский](CHANGELOG_RU.md)
