// ============================================================
//  Theme
// ============================================================

const LS_THEME = 'passgen_theme';
const ICON_SUN  = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

let currentTheme = localStorage.getItem(LS_THEME) || 'dark';

function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(LS_THEME, theme);
    const btn = document.getElementById('theme-btn');
    if (btn) {
        btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
        btn.title     = t(theme === 'dark' ? 'theme_to_light' : 'theme_to_dark');
    }
}

document.getElementById('theme-btn')?.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// ============================================================
//  Language
// ============================================================

const LS_LANG = 'passgen_lang';
let currentLang = localStorage.getItem(LS_LANG) || 'en';

function t(key, ...args) {
    const val = TRANSLATIONS[currentLang][key];
    return typeof val === 'function' ? val(...args) : (val ?? key);
}

function applyLang() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = t(el.dataset.i18nTitle);
    });
    document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');
    document.getElementById('lang-ru').classList.toggle('active', currentLang === 'ru');
    document.getElementById('help-lang-en').classList.toggle('active', currentLang === 'en');
    document.getElementById('help-lang-ru').classList.toggle('active', currentLang === 'ru');
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(LS_LANG, lang);
    applyLang();
}

document.getElementById('lang-en').addEventListener('click', () => setLang('en'));
document.getElementById('lang-ru').addEventListener('click', () => setLang('ru'));
document.getElementById('help-lang-en').addEventListener('click', () => setLang('en'));
document.getElementById('help-lang-ru').addEventListener('click', () => setLang('ru'));

// ============================================================
//  Error toast
// ============================================================

const errorBackdrop = document.getElementById('error-backdrop');
const errorBox      = document.getElementById('error');
const errorText     = document.getElementById('error-text');

function showError(msg) {
    errorText.textContent = msg;
    errorBox.classList.remove('hidden');
    errorBackdrop.classList.remove('hidden');
}

function closeError() {
    errorBox.classList.add('hidden');
    errorBackdrop.classList.add('hidden');
}

document.getElementById('error-close').addEventListener('click', closeError);

// ============================================================
//  Help modal
// ============================================================

const helpModal = document.getElementById('help');

function openHelp() {
    helpModal.classList.remove('hidden');
    errorBackdrop.classList.remove('hidden');
}

function closeHelp() {
    helpModal.classList.add('hidden');
    errorBackdrop.classList.add('hidden');
}

document.getElementById('help-btn').addEventListener('click', openHelp);
document.getElementById('help-close').addEventListener('click', closeHelp);

errorBackdrop.addEventListener('click', () => {
    closeError();
    closeHelp();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeError();
        closeHelp();
    }
});

// ============================================================
//  Init
// ============================================================

applyLang();
applyTheme(currentTheme);

// ============================================================
//  Generator — crypto helpers
// ============================================================

function secureRandomInt(max) {
    if (max <= 1) return 0;
    const limit = Math.floor(0x100000000 / max) * max;
    let r;
    do {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        r = buf[0];
    } while (r >= limit);
    return r % max;
}

// ============================================================
//  Generator — character sets & presets
// ============================================================

const CHARS = {
    upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:   'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~',
    similar: 'IlO01',
};

const PRESETS = {
    postgresql:  { length: 20, upper: true,  lower: true,  numbers: true,  symbols: true,  nosimilar: false, custom: '', exclude: `'"/@`  },
    mysql:       { length: 20, upper: true,  lower: true,  numbers: true,  symbols: true,  nosimilar: false, custom: '', exclude: `'"`    },
    sqlserver:   { length: 20, upper: true,  lower: true,  numbers: true,  symbols: true,  nosimilar: false, custom: '', exclude: `'" `   },
    linux:       { length: 16, upper: true,  lower: true,  numbers: true,  symbols: false, nosimilar: false, custom: '', exclude: ''      },
    windows:     { length: 16, upper: true,  lower: true,  numbers: true,  symbols: true,  nosimilar: false, custom: '', exclude: `'" `   },
    redis:       { length: 32, upper: true,  lower: true,  numbers: true,  symbols: false, nosimilar: false, custom: '', exclude: `'",@`  },
    rabbitmq:    { length: 24, upper: true,  lower: true,  numbers: true,  symbols: true,  nosimilar: false, custom: '', exclude: `'";@?` },
    highentropy: { length: 64, upper: true,  lower: true,  numbers: true,  symbols: true,  nosimilar: true,  custom: '', exclude: ''      },
};

// ============================================================
//  Generator — generation functions
// ============================================================

function generatePassword({ length, upper, lower, numbers, symbols, nosimilar, norepeat, custom, exclude }) {
    let chars = '';
    if (upper)   chars += CHARS.upper;
    if (lower)   chars += CHARS.lower;
    if (numbers) chars += CHARS.numbers;
    if (symbols) chars += CHARS.symbols;
    if (custom)  chars += custom;

    let arr = [...new Set(chars)];
    if (nosimilar) arr = arr.filter(c => !CHARS.similar.includes(c));
    if (exclude)   { const ex = new Set(exclude); arr = arr.filter(c => !ex.has(c)); }

    if (!arr.length) return '';

    if (norepeat) {
        // Fisher-Yates shuffle, then take first `length` chars (capped at arr.length)
        for (let i = arr.length - 1; i > 0; i--) {
            const j = secureRandomInt(i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.slice(0, Math.min(length, arr.length)).join('');
    }

    let result = '';
    for (let i = 0; i < length; i++) result += arr[secureRandomInt(arr.length)];
    return result;
}

function generatePassphrase({ count, capitalize, randomCap, numStart, numEnd, numInner, separator }) {
    const words = [];
    for (let i = 0; i < count; i++) {
        let w = WORDLIST[secureRandomInt(WORDLIST.length)];
        if (capitalize)      w = w[0].toUpperCase() + w.slice(1).toLowerCase();
        else if (randomCap)  w = [...w].map(c => secureRandomInt(2) ? c.toUpperCase() : c.toLowerCase()).join('');
        else                 w = w.toLowerCase();
        if (numInner && secureRandomInt(2)) w += secureRandomInt(10);
        words.push(w);
    }
    const SEPS = { space: ' ', dash: '-', dot: '.', underscore: '_', none: '' };
    let sep;
    if (separator === 'random') {
        const syms = '!@#$%^&*';
        sep = syms[secureRandomInt(syms.length)];
    } else {
        sep = SEPS[separator] ?? ' ';
    }
    if (numStart) words[0] = secureRandomInt(10) + words[0];
    if (numEnd)   words[words.length - 1] += secureRandomInt(10);
    let result = words.join(sep);
    return result;
}

function generatePin(length) {
    let result = '';
    for (let i = 0; i < length; i++) result += secureRandomInt(10);
    return result;
}

function getStrength(password) {
    if (!password) return 0;
    let pool = 0, types = 0;
    if (/[a-z]/.test(password))        { pool += 26; types++; }
    if (/[A-Z]/.test(password))        { pool += 26; types++; }
    if (/[0-9]/.test(password))        { pool += 10; types++; }
    if (/[^a-zA-Z0-9]/.test(password)) { pool += 32; types++; }
    if (pool === 0) return 1;
    const entropy = password.length * Math.log2(pool);
    // Strong/Very Strong require character variety in addition to length
    if (entropy < 28)               return 1; // Very Weak
    if (entropy < 40)               return 2; // Weak
    if (entropy < 60 || types < 2)  return 3; // Fair  (single-type capped here)
    if (entropy < 80 || types < 3)  return 4; // Strong (2-type capped here)
    return 5;                                  // Very Strong: ≥80 bits + 3+ types
}

// ============================================================
//  Generator — shared UI helpers
// ============================================================

const ICON_EYE     = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_EYE_OFF = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function linkSlider(rangeEl, numEl, onChange) {
    rangeEl.addEventListener('input', () => {
        numEl.value = rangeEl.value;
        onChange();
    });
    numEl.addEventListener('input', () => {
        // Sync range (auto-clamps internally); don't overwrite numEl mid-typing
        rangeEl.value = numEl.value;
        onChange(); // regen reads from rangeEl, so always uses a valid clamped value
    });
    numEl.addEventListener('blur', () => {
        // Clamp and finalize on focus loss
        const v = Math.min(+numEl.max, Math.max(+numEl.min, +numEl.value || +numEl.min));
        numEl.value = v;
        rangeEl.value = v;
        onChange();
    });
}

function setupReveal(inputEl, btnEl) {
    btnEl.innerHTML = ICON_EYE;
    btnEl.addEventListener('click', () => {
        const hidden = inputEl.type === 'password';
        inputEl.type    = hidden ? 'text' : 'password';
        btnEl.innerHTML = hidden ? ICON_EYE_OFF : ICON_EYE;
    });
}

function setupCopy(btnEl, getVal) {
    btnEl.addEventListener('click', () => {
        const val = getVal();
        if (!val) return;
        navigator.clipboard.writeText(val).then(() => {
            btnEl.textContent = t('btn_copy_done');
            setTimeout(() => { btnEl.textContent = t('btn_copy'); }, 2000);
        });
    });
}

const STRENGTH_COLORS = ['', '#f56565', '#ed8936', '#ecc94b', '#48bb78', '#3ecf8e'];

function updateStrength(password, barEl, textEl) {
    const lvl = getStrength(password);
    barEl.style.setProperty('--strength-color', STRENGTH_COLORS[lvl] || '');
    barEl.querySelectorAll('.strength-seg').forEach(seg => {
        seg.classList.toggle('active', +seg.dataset.n <= lvl);
    });
    const keys = ['', 'strength_1', 'strength_2', 'strength_3', 'strength_4', 'strength_5'];
    textEl.textContent  = lvl > 0 ? t(keys[lvl]) : '';
    textEl.style.color  = STRENGTH_COLORS[lvl] || 'var(--muted)';
}

const ICON_COPY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

// ============================================================
//  Settings persistence
// ============================================================

const LS_GEN = 'passgen_gen';

const SETTINGS_VERSION = 2;

const GEN_DEFAULTS = {
    _v:           SETTINGS_VERSION,
    active_tab:   'password',
    pw_length:    20,  pw_count:    1,
    pp_count:     8,   pp_qty:      1,  pp_separator: 'dash',
    pin_length:   6,   pin_qty:     1,
    ssh_type:     'ed25519', ssh_bits: 4096,
};

document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (confirm(t('reset_confirm'))) {
        localStorage.removeItem(LS_THEME);
        localStorage.removeItem(LS_LANG);
        localStorage.setItem(LS_GEN, JSON.stringify(GEN_DEFAULTS));
        location.reload();
    }
});

function loadGenSettings() {
    try {
        const s = JSON.parse(localStorage.getItem(LS_GEN)) || {};
        if ((s._v || 1) < SETTINGS_VERSION) {
            // v2: reset fields that had wrong defaults in earlier versions
            delete s.pp_separator; // was defaulting to 'space', correct default is 'dash'
            delete s.pw_length;    // was defaulting to 16, correct default is 20
            delete s.pp_count;     // was defaulting to 4, correct default is 8 (passphrase words)
            delete s.pw_count;     // clear potentially out-of-range count values
            s._v = SETTINGS_VERSION;
            localStorage.setItem(LS_GEN, JSON.stringify(s));
        }
        return s;
    } catch { return {}; }
}

function saveGenSettings(patch) {
    const s = loadGenSettings();
    localStorage.setItem(LS_GEN, JSON.stringify(Object.assign(s, patch)));
}

// ============================================================
//  Generator — Password tab
// ============================================================

let lastPasswords = [];

(function setupPassword() {
    const s           = loadGenSettings();
    const lengthRange = document.getElementById('pw-length-range');
    const lengthNum   = document.getElementById('pw-length-num');
    const countRange  = document.getElementById('pw-count-range');
    const countNum    = document.getElementById('pw-count-num');
    const upper       = document.getElementById('pw-upper');
    const lower       = document.getElementById('pw-lower');
    const numbers     = document.getElementById('pw-numbers');
    const symbols     = document.getElementById('pw-symbols');
    const nosimilar   = document.getElementById('pw-nosimilar');
    const norepeat    = document.getElementById('pw-norepeat');
    const custom      = document.getElementById('pw-custom');
    const exclude     = document.getElementById('pw-exclude');
    const preset      = document.getElementById('pw-preset');
    const resultList  = document.getElementById('pw-result-list');
    const copyAllBtn  = document.getElementById('pw-copy-all');
    const regenBtn    = document.getElementById('pw-regen');
    const barEl       = document.getElementById('pw-strength-bar');
    const textEl      = document.getElementById('pw-strength-text');

    // Restore saved settings
    if (s.pw_length    !== undefined) lengthRange.value = s.pw_length;
    if (s.pw_count     !== undefined) countRange.value  = s.pw_count;
    if (s.pw_upper     !== undefined) upper.checked     = s.pw_upper;
    if (s.pw_lower     !== undefined) lower.checked     = s.pw_lower;
    if (s.pw_numbers   !== undefined) numbers.checked   = s.pw_numbers;
    if (s.pw_symbols   !== undefined) symbols.checked   = s.pw_symbols;
    if (s.pw_nosimilar !== undefined) nosimilar.checked = s.pw_nosimilar;
    if (s.pw_norepeat  !== undefined) norepeat.checked  = s.pw_norepeat;
    if (s.pw_custom    !== undefined) custom.value      = s.pw_custom;
    if (s.pw_exclude   !== undefined) exclude.value     = s.pw_exclude;
    // Always sync num fields from range (overrides browser form-state restoration)
    lengthNum.value = lengthRange.value;
    countNum.value  = countRange.value;

    function getOpts() {
        return {
            length: +lengthRange.value, upper: upper.checked, lower: lower.checked,
            numbers: numbers.checked, symbols: symbols.checked, nosimilar: nosimilar.checked,
            norepeat: norepeat.checked, custom: custom.value, exclude: exclude.value,
        };
    }

    function regen() {
        const count = +countRange.value;
        const opts  = getOpts();
        lastPasswords = Array.from({ length: count }, () => generatePassword(opts));

        saveGenSettings({
            pw_length: +lengthRange.value, pw_count: count,
            pw_upper: upper.checked, pw_lower: lower.checked,
            pw_numbers: numbers.checked, pw_symbols: symbols.checked,
            pw_nosimilar: nosimilar.checked, pw_norepeat: norepeat.checked,
            pw_custom: custom.value, pw_exclude: exclude.value,
        });

        updateStrength(lastPasswords[0] || '', barEl, textEl);

        resultList.innerHTML = '';
        lastPasswords.forEach((pw, i) => {
            const row   = document.createElement('div');
            row.className = 'pw-result-row';

            const num = document.createElement('span');
            num.className   = 'pw-result-num';
            num.textContent = i + 1;

            const input = document.createElement('input');
            input.type      = 'text';
            input.className = 'result-input';
            input.readOnly  = true;
            input.value     = pw;

            const btn   = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'pw-copy-btn';
            btn.innerHTML = ICON_COPY;
            btn.title     = t('btn_copy');
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(pw).then(() => {
                    btn.innerHTML = ICON_CHECK;
                    btn.classList.add('copied');
                    setTimeout(() => { btn.innerHTML = ICON_COPY; btn.classList.remove('copied'); }, 2000);
                });
            });

            row.appendChild(num);
            row.appendChild(input);
            row.appendChild(btn);
            resultList.appendChild(row);
        });
    }

    linkSlider(lengthRange, lengthNum, regen);
    linkSlider(countRange, countNum, regen);
    [upper, lower, numbers, symbols, nosimilar, norepeat].forEach(el => el.addEventListener('change', regen));
    [custom, exclude].forEach(el => el.addEventListener('input', regen));

    preset.addEventListener('change', () => {
        const p = PRESETS[preset.value];
        if (!p) return;
        lengthRange.value = p.length; lengthNum.value = p.length;
        upper.checked = p.upper; lower.checked = p.lower;
        numbers.checked = p.numbers; symbols.checked = p.symbols;
        nosimilar.checked = p.nosimilar;
        custom.value = p.custom; exclude.value = p.exclude;
        preset.value = '';
        regen();
    });

    copyAllBtn.addEventListener('click', () => openCopyAll(lastPasswords));
    regenBtn.addEventListener('click', regen);
    regen();
})();

// ============================================================
//  Generator — Passphrase tab
// ============================================================

(function setupPassphrase() {
    const s          = loadGenSettings();
    const countRange = document.getElementById('pp-count-range');
    const countNum   = document.getElementById('pp-count-num');
    const qtyRange   = document.getElementById('pp-qty-range');
    const qtyNum     = document.getElementById('pp-qty-num');
    const capitalize = document.getElementById('pp-capitalize');
    const randomCap  = document.getElementById('pp-random-cap');
    const numStart   = document.getElementById('pp-num-start');
    const numEnd     = document.getElementById('pp-num-end');
    const numInner   = document.getElementById('pp-num-inner');
    const separator  = document.getElementById('pp-separator');
    const resultList = document.getElementById('pp-result-list');
    const copyAllBtn = document.getElementById('pp-copy-all');
    const regenBtn   = document.getElementById('pp-regen');

    if (s.pp_count      !== undefined) countRange.value  = s.pp_count;
    if (s.pp_qty        !== undefined) qtyRange.value    = s.pp_qty;
    if (s.pp_capitalize !== undefined) capitalize.checked = s.pp_capitalize;
    if (s.pp_random_cap !== undefined) randomCap.checked  = s.pp_random_cap;
    if (s.pp_num_start  !== undefined) numStart.checked   = s.pp_num_start;
    if (s.pp_num_end    !== undefined) numEnd.checked     = s.pp_num_end;
    if (s.pp_num_inner  !== undefined) numInner.checked   = s.pp_num_inner;
    if (s.pp_separator  !== undefined) separator.value    = s.pp_separator;
    countNum.value = countRange.value;
    qtyNum.value   = qtyRange.value;

    function getOpts() {
        return {
            count: +countRange.value, capitalize: capitalize.checked,
            randomCap: randomCap.checked, numStart: numStart.checked,
            numEnd: numEnd.checked, numInner: numInner.checked,
            separator: separator.value,
        };
    }

    let lastPhrases = [];

    function regen() {
        const qty = +qtyRange.value;
        const opts = getOpts();
        lastPhrases = Array.from({ length: qty }, () => generatePassphrase(opts));

        saveGenSettings({
            pp_count: +countRange.value, pp_qty: qty,
            pp_capitalize: capitalize.checked, pp_random_cap: randomCap.checked,
            pp_num_start: numStart.checked, pp_num_end: numEnd.checked,
            pp_num_inner: numInner.checked, pp_separator: separator.value,
        });

        resultList.innerHTML = '';
        lastPhrases.forEach((phrase, i) => {
            const row   = document.createElement('div');
            row.className = 'pw-result-row';

            const num = document.createElement('span');
            num.className   = 'pw-result-num';
            num.textContent = i + 1;

            const input = document.createElement('input');
            input.type      = 'text';
            input.className = 'result-input';
            input.readOnly  = true;
            input.value     = phrase;

            const btn   = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'pw-copy-btn';
            btn.innerHTML = ICON_COPY;
            btn.title     = t('btn_copy');
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(phrase).then(() => {
                    btn.innerHTML = ICON_CHECK;
                    btn.classList.add('copied');
                    setTimeout(() => { btn.innerHTML = ICON_COPY; btn.classList.remove('copied'); }, 2000);
                });
            });

            row.appendChild(num);
            row.appendChild(input);
            row.appendChild(btn);
            resultList.appendChild(row);
        });
    }

    linkSlider(countRange, countNum, regen);
    linkSlider(qtyRange, qtyNum, regen);
    [numStart, numEnd, numInner].forEach(el => el.addEventListener('change', regen));
    separator.addEventListener('change', regen);

    capitalize.addEventListener('change', () => { if (capitalize.checked) randomCap.checked = false; regen(); });
    randomCap.addEventListener('change',  () => { if (randomCap.checked)  capitalize.checked = false; regen(); });

    copyAllBtn.addEventListener('click', () => openCopyAll(lastPhrases));
    regenBtn.addEventListener('click', regen);
    regen();
})();

// ============================================================
//  Generator — PIN tab
// ============================================================

(function setupPin() {
    const s           = loadGenSettings();
    const lengthRange = document.getElementById('pin-length-range');
    const lengthNum   = document.getElementById('pin-length-num');
    const qtyRange    = document.getElementById('pin-qty-range');
    const qtyNum      = document.getElementById('pin-qty-num');
    const resultList  = document.getElementById('pin-result-list');
    const copyAllBtn  = document.getElementById('pin-copy-all');
    const regenBtn    = document.getElementById('pin-regen');

    if (s.pin_length !== undefined) lengthRange.value = s.pin_length;
    if (s.pin_qty    !== undefined) qtyRange.value    = s.pin_qty;
    lengthNum.value = lengthRange.value;
    qtyNum.value    = qtyRange.value;

    let lastPins = [];

    function regen() {
        const qty = +qtyRange.value;
        lastPins = Array.from({ length: qty }, () => generatePin(+lengthRange.value));

        saveGenSettings({ pin_length: +lengthRange.value, pin_qty: qty });

        resultList.innerHTML = '';
        lastPins.forEach((pin, i) => {
            const row   = document.createElement('div');
            row.className = 'pw-result-row';

            const num = document.createElement('span');
            num.className   = 'pw-result-num';
            num.textContent = i + 1;

            const input = document.createElement('input');
            input.type      = 'text';
            input.className = 'result-input';
            input.readOnly  = true;
            input.value     = pin;

            const btn   = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'pw-copy-btn';
            btn.innerHTML = ICON_COPY;
            btn.title     = t('btn_copy');
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(pin).then(() => {
                    btn.innerHTML = ICON_CHECK;
                    btn.classList.add('copied');
                    setTimeout(() => { btn.innerHTML = ICON_COPY; btn.classList.remove('copied'); }, 2000);
                });
            });

            row.appendChild(input);
            row.appendChild(btn);
            resultList.appendChild(row);
        });
    }

    linkSlider(lengthRange, lengthNum, regen);
    linkSlider(qtyRange, qtyNum, regen);
    copyAllBtn.addEventListener('click', () => openCopyAll(lastPins));
    regenBtn.addEventListener('click', regen);
    regen();
})();

// ============================================================
//  Copy-all modal
// ============================================================

function openCopyAll(passwords) {
    const modal    = document.getElementById('copy-all-modal');
    const textarea = document.getElementById('copy-all-text');
    if (!modal || !textarea) return;
    textarea.value = passwords.join('\n');
    textarea.rows  = Math.min(passwords.length, 10);
    modal.classList.remove('hidden');
    errorBackdrop.classList.remove('hidden');
}

function closeCopyAll() {
    const modal = document.getElementById('copy-all-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    errorBackdrop.classList.add('hidden');
}

document.getElementById('copy-all-close')?.addEventListener('click', closeCopyAll);
errorBackdrop.addEventListener('click', closeCopyAll);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCopyAll(); });

document.getElementById('copy-all-btn')?.addEventListener('click', () => {
    const textarea = document.getElementById('copy-all-text');
    const btn      = document.getElementById('copy-all-btn');
    if (!textarea?.value) return;
    navigator.clipboard.writeText(textarea.value).then(() => {
        btn.textContent = t('btn_copy_done');
        setTimeout(() => { btn.textContent = t('btn_copy'); }, 2000);
    });
});

// ============================================================
//  Generator — tabs
// ============================================================

function activateTab(name) {
    document.querySelectorAll('.gen-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.gen-panel').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById('panel-' + name);
    if (panel) panel.classList.remove('hidden');
}

const savedTab = loadGenSettings().active_tab;
if (savedTab) activateTab(savedTab);

document.querySelectorAll('.gen-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        activateTab(tab.dataset.tab);
        saveGenSettings({ active_tab: tab.dataset.tab });
    });
});

// ============================================================
//  Generator — SSH Key tab
// ============================================================

// ── Binary helpers (OpenSSH wire format) ─────────────────────

function concatBytes(...arrays) {
    const total = arrays.reduce((s, a) => s + a.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const a of arrays) { result.set(a, offset); offset += a.length; }
    return result;
}

function sshUint32(n) {
    const buf = new Uint8Array(4);
    new DataView(buf.buffer).setUint32(0, n, false);
    return buf;
}

function sshString(str) {
    const enc = new TextEncoder().encode(str);
    return concatBytes(sshUint32(enc.length), enc);
}

function sshBytes(bytes) {
    return concatBytes(sshUint32(bytes.length), bytes);
}

// mpint: big-endian arbitrary-precision integer with leading 0x00 if high bit set
function sshMpint(bytes) {
    let start = 0;
    while (start < bytes.length - 1 && bytes[start] === 0) start++;
    bytes = bytes.slice(start);
    if (bytes[0] & 0x80) {
        const padded = new Uint8Array(bytes.length + 1);
        padded.set(bytes, 1);
        bytes = padded;
    }
    return concatBytes(sshUint32(bytes.length), bytes);
}

function b64urlToBytes(b64url) {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
}

function bytesToB64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
}

function osshPadding(bytes) {
    const rem = bytes.length % 8;
    if (rem === 0) return bytes;
    const pad = 8 - rem;
    const result = new Uint8Array(bytes.length + pad);
    result.set(bytes);
    for (let i = 0; i < pad; i++) result[bytes.length + i] = i + 1;
    return result;
}

function formatOsshPem(blob) {
    const b64 = bytesToB64(blob);
    const lines = b64.match(/.{1,70}/g).join('\n');
    return `-----BEGIN OPENSSH PRIVATE KEY-----\n${lines}\n-----END OPENSSH PRIVATE KEY-----`;
}

function buildOsshBlob(pubBlob, privSection) {
    const magic = new TextEncoder().encode('openssh-key-v1\0');
    return concatBytes(
        magic,
        sshString('none'),         // ciphername
        sshString('none'),         // kdfname
        sshString(''),             // kdf options (empty string = \0\0\0\0)
        sshUint32(1),              // num keys
        sshBytes(pubBlob),         // public key
        sshBytes(osshPadding(privSection)),
    );
}

// ── Key generation ────────────────────────────────────────────

async function generateEd25519Pair() {
    const kp = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
    const pubJwk  = await crypto.subtle.exportKey('jwk', kp.publicKey);
    const privJwk = await crypto.subtle.exportKey('jwk', kp.privateKey);

    const pubBytes  = b64urlToBytes(pubJwk.x);               // 32 bytes
    const privBytes = concatBytes(b64urlToBytes(privJwk.d), pubBytes); // seed+pub = 64 bytes

    const pubBlob = concatBytes(sshString('ssh-ed25519'), sshBytes(pubBytes));
    const pubLine = `ssh-ed25519 ${bytesToB64(pubBlob)}`;

    const checkInt = new Uint8Array(4);
    crypto.getRandomValues(checkInt);

    const privSection = concatBytes(
        checkInt, checkInt,
        sshString('ssh-ed25519'),
        sshBytes(pubBytes),
        sshBytes(privBytes),
        sshString(''),
    );

    return { privateKey: formatOsshPem(buildOsshBlob(pubBlob, privSection)), publicKey: pubLine };
}

async function generateRSAPair(bits) {
    const kp = await crypto.subtle.generateKey(
        { name: 'RSASSA-PKCS1-v1_5', modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true, ['sign', 'verify'],
    );
    const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);

    const n  = b64urlToBytes(jwk.n);
    const e  = b64urlToBytes(jwk.e);
    const d  = b64urlToBytes(jwk.d);
    const p  = b64urlToBytes(jwk.p);
    const q  = b64urlToBytes(jwk.q);
    const qi = b64urlToBytes(jwk.qi); // q^-1 mod p (iqmp)

    const pubBlob = concatBytes(sshString('ssh-rsa'), sshMpint(e), sshMpint(n));
    const pubLine = `ssh-rsa ${bytesToB64(pubBlob)}`;

    const checkInt = new Uint8Array(4);
    crypto.getRandomValues(checkInt);

    const privSection = concatBytes(
        checkInt, checkInt,
        sshString('ssh-rsa'),
        sshMpint(n), sshMpint(e), sshMpint(d),
        sshMpint(qi), sshMpint(p), sshMpint(q),
        sshString(''),
    );

    return { privateKey: formatOsshPem(buildOsshBlob(pubBlob, privSection)), publicKey: pubLine };
}

// ── SSH tab setup ─────────────────────────────────────────────

(function setupSSH() {
    const s           = loadGenSettings();
    const typeSelect  = document.getElementById('ssh-type');
    const bitsSelect  = document.getElementById('ssh-bits');
    const bitsField   = document.getElementById('ssh-bits-field');
    const resultEl    = document.getElementById('ssh-result');
    const generateBtn = document.getElementById('ssh-generate');

    if (s.ssh_type !== undefined) typeSelect.value = s.ssh_type;
    if (s.ssh_bits !== undefined) bitsSelect.value = s.ssh_bits;

    function updateBitsVisibility() {
        bitsField.classList.toggle('hidden', typeSelect.value !== 'rsa');
    }
    typeSelect.addEventListener('change', updateBitsVisibility);
    updateBitsVisibility();

    function renderResult(pair) {
        resultEl.innerHTML = '';
        [
            { key: 'private', label: 'ssh_private_label', val: pair.privateKey },
            { key: 'public',  label: 'ssh_public_label',  val: pair.publicKey  },
        ].forEach(({ label, val, key }) => {
            const block = document.createElement('div');
            block.className = 'ssh-key-block';

            const header = document.createElement('div');
            header.className = 'ssh-key-header';

            const labelEl = document.createElement('span');
            labelEl.className   = 'gen-label';
            labelEl.textContent = t(label);

            const copyBtn = document.createElement('button');
            copyBtn.type      = 'button';
            copyBtn.className = 'pw-copy-btn';
            copyBtn.innerHTML = ICON_COPY;
            copyBtn.title     = t('btn_copy');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(val).then(() => {
                    copyBtn.innerHTML = ICON_CHECK;
                    copyBtn.classList.add('copied');
                    setTimeout(() => { copyBtn.innerHTML = ICON_COPY; copyBtn.classList.remove('copied'); }, 2000);
                });
            });

            header.appendChild(labelEl);
            header.appendChild(copyBtn);

            const textarea = document.createElement('textarea');
            textarea.className    = 'ssh-key-textarea';
            textarea.readOnly     = true;
            textarea.spellcheck   = false;
            textarea.autocomplete = 'off';
            textarea.value        = val;
            const lines = val.split('\n').length;
            textarea.rows = key === 'private' ? Math.min(lines, 22) : 3;

            block.appendChild(header);
            block.appendChild(textarea);
            resultEl.appendChild(block);
        });
    }

    async function generate() {
        generateBtn.disabled    = true;
        generateBtn.textContent = t('ssh_generating');
        try {
            const type = typeSelect.value;
            const bits = +bitsSelect.value;
            const pair = type === 'ed25519' ? await generateEd25519Pair() : await generateRSAPair(bits);
            renderResult(pair);
            saveGenSettings({ ssh_type: type, ssh_bits: bits });
        } catch (err) {
            showError(err.message || 'Key generation failed');
        } finally {
            generateBtn.disabled    = false;
            generateBtn.textContent = t('btn_generate');
        }
    }

    generateBtn.addEventListener('click', generate);
    generate();
})();

// ============================================================
//  App logic — add your code below
// ============================================================
