🌐 **English** | [Русский](README_RU.md)

---

# Passgen — Secure Passwords Generator

A lightweight, client-side password generator with three modes: **Password**, **Passphrase**, and **PIN**. All generation happens in the browser using the Web Crypto API — nothing is sent to any server.

**Live demo:** https://yukh.net/passgen/

---

## Features

### Password
- Configurable length (4–64 characters, default 20)
- Toggle character sets: uppercase, lowercase, numbers, symbols
- Option to exclude visually similar characters (I, l, 1, O, 0)
- No-repeating-characters option
- Extra symbols field and exclude-characters field
- **8 platform presets**: PostgreSQL, MySQL, SQL Server, Linux User, Windows Admin, Redis, RabbitMQ, High Entropy
- Strength indicator based on Shannon entropy and character variety — **Very Strong** requires ≥80 bits entropy AND 3+ character types; single-type passwords are capped at Fair

### Passphrase
- Random word sequences from a ~500-word wordlist
- Configurable word count (2–10, default 8)
- Capitalization options: capitalize first letter, or random per-letter
- Optional digit at start and/or end
- Random numbers inside phrase (randomly appends a digit to some words)
- Separator: space, dash (default), dot, underscore, random symbol, or none

### PIN
- Numeric code, configurable length (4–12 digits, default 6)

### General
- Generate multiple results at once (count slider 1–20) on all three tabs
- Per-result copy button; **Copy all** button opens a modal with all results
- Regenerate button shared across all results
- Dark / light theme (saved in `localStorage`)
- EN / RU language switcher
- Active tab and all generator settings saved across page reloads; **Reset settings** button (↺) in the header clears all saved settings
- Cryptographically secure randomness via `window.crypto.getRandomValues()`
- Fully client-side — no server, no tracking

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yukh975/passgen.git
   cd passgen
   ```
2. Open `index.html` in a browser — no build step required.

Or serve with any static file server:
```bash
npx serve .
```

---

## Security

- All randomness comes from `window.crypto.getRandomValues()` with rejection sampling to prevent modulo bias.
- No data leaves the browser — generation is entirely local.
- No dependencies on external CDNs or remote resources.

---

## License

MIT © 2026 Yuriy Khachaturian

---

🌐 **English** | [Русский](README_RU.md)
