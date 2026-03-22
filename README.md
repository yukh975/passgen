🌐 **English** | [Русский](README_RU.md)

---

<img src="assets/logo.svg" width="48" height="48" align="left" style="margin-right: 14px">

# Secure Password Generator v1.0.1-devel

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-f7df1e?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE.md)

**A lightweight, fully client-side password and key generator. Supports Password, Passphrase, PIN, SSH Key, and GPG Key modes. All generation happens in the browser using the Web Crypto API — nothing is sent to any server.**

---

## Demo

Current version is available at **https://yukh.net/passgen/**

---

## Features

### Password
- Configurable length (4–64 characters, default 20)
- Toggle character sets: uppercase, lowercase, numbers, symbols
- Exclude visually similar characters (I, l, 1, O, 0)
- No-repeating-characters option
- Extra symbols field and exclude-characters field
- **8 platform presets**: PostgreSQL, MySQL, SQL Server, Linux User, Windows Admin, Redis, RabbitMQ, High Entropy
- Strength indicator based on Shannon entropy and character variety — **Very Strong** requires ≥ 80 bits and 3+ character types

### Passphrase
- Random word sequences from a built-in ~500-word wordlist
- Configurable word count (2–10, default 8)
- Capitalization options: capitalize first letter, or random per-letter
- Optional digit at start and/or end (attached directly to the word, no separator)
- Random numbers inside phrase (randomly appends a digit to some words)
- Separator: space, dash (default), dot, underscore, random symbol, or none

### PIN
- Numeric code, configurable length (4–12 digits, default 6)

### SSH Key
- Generate **ED25519** or **RSA** key pairs (2048 / 3072 / 4096 bits) directly in the browser
- Keys exported in standard OpenSSH format — compatible with `ssh-keygen` output
- Optional **passphrase** encrypts the private key with AES-256-CTR + bcrypt KDF (16 rounds) — identical to `ssh-keygen -a 16` output
- Per-key copy button; **Download archive** saves both keys as a single ZIP file (`<name>.key` + `<name>.pub`)
- **Verify keys** modal: paste or upload a private and public key to check they form a valid pair; passphrase-protected keys are fully supported — supports file upload (`.key`, `.pub`, `.pem`)
- bcrypt and ZIP implemented in pure JS with no external libraries

### GPG Key
- Generate **Ed25519** or **RSA** key pairs (3072 / 4096 bits) directly in the browser
- Keys exported in ASCII-armored OpenPGP v4 format (`-----BEGIN PGP PRIVATE KEY BLOCK-----`)
- Includes self-signed User ID — keys are importable with `gpg --import` without additional steps
- Optional **User ID** field (`Name <email>` format); defaults to a generic UID if left empty
- Per-key copy button; **Download archive** saves both `.asc` and `.pub.asc` files as a ZIP
- OpenPGP packet format, CRC-24, and self-signature implemented in pure JS with no external libraries

### General
- Generate 1–50 results at once on all three tabs
- Per-result copy button; **Copy all** opens a modal with all results in a textarea
- Regenerate button shared across all results on each tab
- Dark / light theme toggle, EN / RU language switcher
- Active tab and all generator settings saved to `localStorage`; **Reset** button (↺) restores all defaults
- Cryptographically secure randomness via `window.crypto.getRandomValues()` with rejection sampling

---

## Installation

```bash
git clone https://github.com/yukh975/passgen.git
cd passgen
```

Open `index.html` in a browser — no build step, no dependencies.

Or serve with any static file server:

```bash
npx serve .
```

---

## Project structure

```
passgen/
├── index.html              # UI shell
├── assets/
│   ├── app.js              # Generator logic, settings, i18n
│   ├── bcrypt.js           # bcrypt_pbkdf implementation (pure JS)
│   ├── pgp.js              # OpenPGP v4 key generation (pure JS)
│   ├── translations.js     # UI strings (EN / RU)
│   ├── wordlist.js         # Built-in ~500-word wordlist
│   ├── style.css           # Styles (dark / light theme)
│   ├── logo.svg            # Lock icon logo
│   └── theme-init.js       # Theme pre-load (prevents flash)
├── favicon.ico             # Generated from logo (16 / 32 / 48 px)
└── gen-favicon.js          # Favicon generator (Node.js, no deps)
```

---

## Security

- All randomness comes from `window.crypto.getRandomValues()` with rejection sampling to eliminate modulo bias.
- No data leaves the browser — generation is entirely local.
- No external CDNs, no remote resources, no tracking.

---

## Author

Yuriy Khachaturian (powered by [Claude.AI](https://claude.ai)), 2026.

---

🌐 **English** | [Русский](README_RU.md)
