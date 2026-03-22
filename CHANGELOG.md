🌐 **English** | [Русский](CHANGELOG_RU.md)

---

# Changelog

## v1.0.1 — unreleased

### Features
- **SSH Key tab**: generate ED25519 and RSA key pairs (2048 / 3072 / 4096 bits) directly in the browser using the Web Crypto API; keys are exported in standard OpenSSH format (`-----BEGIN OPENSSH PRIVATE KEY-----`) with matching `.pub`-style public key line; copy buttons for both private and public key
- **Download archive**: single button downloads both keys as a ZIP file (`<name>.key` + `<name>.pub`) with paired random base filename; ZIP built in pure JS without external libraries
- **Verify keys**: modal window to check that a private and public key form a valid pair — paste or upload each key, supports file upload (`.key`, `.pub`, `.pem`)

## v1.0.0 — 2026-03-22

### Features
- **Password tab**: length slider (4–64, default 20), uppercase / lowercase / numbers / symbols toggles, exclude similar characters (I, l, 1, O, 0), no-repeating-characters option, extra symbols field, exclude characters field, 8 platform presets (PostgreSQL, MySQL, SQL Server, Linux User, Windows Admin, Redis, RabbitMQ, High Entropy), strength bar (1–5 scale with color coding)
- **Passphrase tab**: word count slider (2–10, default 8), capitalize words / random capitalization options, add digit at start / end, random numbers inside phrase (randomly appends a digit to some words), separator selector (space, dash, dot, underscore, random symbol, none; default: dash), ~500-word built-in wordlist
- **PIN tab**: length slider (4–12 digits, default 6)
- Generate multiple results at once (count slider 1–50) on all three tabs
- Per-result copy button; Copy all button opens a modal with all results in a textarea
- Regenerate button shared across all results on each tab
- Results visible by default (no show/hide toggle)
- Cryptographically secure randomness via `window.crypto.getRandomValues()` with rejection sampling to eliminate modulo bias
- Strength indicator based on Shannon entropy + character variety: Strong requires 2+ types, Very Strong requires 3+ types and ≥80 bits; single-character-type passwords are capped at Fair regardless of length
- Reset settings button (↺) clears all localStorage and reloads the page
- Settings restore now uses browser-clamped range values, fixing a bug where out-of-range values from localStorage caused fields to display stale numbers
- Fixed number input fields accepting impossible values mid-typing (linkSlider no longer overwrites the field on every keystroke; clamping happens only on blur)
- Reset settings now writes a clean versioned object to localStorage to guarantee all fields revert to HTML defaults on reload

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
