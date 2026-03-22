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

function generatePassword({ length, upper, lower, numbers, symbols, nosimilar, custom, exclude }) {
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

    let result = '';
    for (let i = 0; i < length; i++) result += arr[secureRandomInt(arr.length)];
    return result;
}

function generatePassphrase({ count, capitalize, randomCap, numStart, numEnd, separator }) {
    const words = [];
    for (let i = 0; i < count; i++) {
        let w = WORDLIST[secureRandomInt(WORDLIST.length)];
        if (capitalize)      w = w[0].toUpperCase() + w.slice(1).toLowerCase();
        else if (randomCap)  w = [...w].map(c => secureRandomInt(2) ? c.toUpperCase() : c.toLowerCase()).join('');
        else                 w = w.toLowerCase();
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
    let result = words.join(sep);
    if (numStart) result = secureRandomInt(10) + sep + result;
    if (numEnd)   result = result + sep + secureRandomInt(10);
    return result;
}

function generatePin(length) {
    let result = '';
    for (let i = 0; i < length; i++) result += secureRandomInt(10);
    return result;
}

function getStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8)          score++;
    if (password.length >= 12)         score++;
    if (/[a-z]/.test(password))        score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return Math.min(5, Math.max(1, Math.round((score / 6) * 5)));
}

// ============================================================
//  Generator — shared UI helpers
// ============================================================

const ICON_EYE     = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_EYE_OFF = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function linkSlider(rangeEl, numEl, onChange) {
    rangeEl.addEventListener('input', () => { numEl.value = rangeEl.value; onChange(); });
    numEl.addEventListener('input', () => {
        const v = Math.min(+numEl.max, Math.max(+numEl.min, +numEl.value || +numEl.min));
        numEl.value = v; rangeEl.value = v; onChange();
    });
    numEl.addEventListener('blur', () => {
        if (!numEl.value) numEl.value = numEl.min;
        const v = Math.min(+numEl.max, Math.max(+numEl.min, +numEl.value));
        numEl.value = v; rangeEl.value = v; onChange();
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
//  Generator — Password tab
// ============================================================

(function setupPassword() {
    const lengthRange = document.getElementById('pw-length-range');
    const lengthNum   = document.getElementById('pw-length-num');
    const countRange  = document.getElementById('pw-count-range');
    const countNum    = document.getElementById('pw-count-num');
    const upper       = document.getElementById('pw-upper');
    const lower       = document.getElementById('pw-lower');
    const numbers     = document.getElementById('pw-numbers');
    const symbols     = document.getElementById('pw-symbols');
    const nosimilar   = document.getElementById('pw-nosimilar');
    const custom      = document.getElementById('pw-custom');
    const exclude     = document.getElementById('pw-exclude');
    const preset      = document.getElementById('pw-preset');
    const resultList  = document.getElementById('pw-result-list');
    const regenBtn    = document.getElementById('pw-regen');
    const barEl       = document.getElementById('pw-strength-bar');
    const textEl      = document.getElementById('pw-strength-text');

    function getOpts() {
        return {
            length: +lengthRange.value, upper: upper.checked, lower: lower.checked,
            numbers: numbers.checked, symbols: symbols.checked, nosimilar: nosimilar.checked,
            custom: custom.value, exclude: exclude.value,
        };
    }

    function regen() {
        const count = +countRange.value;
        const opts  = getOpts();
        const passwords = Array.from({ length: count }, () => generatePassword(opts));

        updateStrength(passwords[0] || '', barEl, textEl);

        resultList.innerHTML = '';
        passwords.forEach(pw => {
            const row = document.createElement('div');
            row.className = 'pw-result-row';

            const input = document.createElement('input');
            input.type     = 'text';
            input.className = 'result-input';
            input.readOnly = true;
            input.value    = pw;

            const btn = document.createElement('button');
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

            row.appendChild(input);
            row.appendChild(btn);
            resultList.appendChild(row);
        });
    }

    linkSlider(lengthRange, lengthNum, regen);
    linkSlider(countRange, countNum, regen);
    [upper, lower, numbers, symbols, nosimilar].forEach(el => el.addEventListener('change', regen));
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

    regenBtn.addEventListener('click', regen);
    regen();
})();

// ============================================================
//  Generator — Passphrase tab
// ============================================================

(function setupPassphrase() {
    const countRange = document.getElementById('pp-count-range');
    const countNum   = document.getElementById('pp-count-num');
    const capitalize = document.getElementById('pp-capitalize');
    const randomCap  = document.getElementById('pp-random-cap');
    const numStart   = document.getElementById('pp-num-start');
    const numEnd     = document.getElementById('pp-num-end');
    const separator  = document.getElementById('pp-separator');
    const result     = document.getElementById('pp-result');
    const showBtn    = document.getElementById('pp-show');
    const copyBtn    = document.getElementById('pp-copy');
    const regenBtn   = document.getElementById('pp-regen');

    function getOpts() {
        return {
            count: +countRange.value, capitalize: capitalize.checked,
            randomCap: randomCap.checked, numStart: numStart.checked,
            numEnd: numEnd.checked, separator: separator.value,
        };
    }

    function regen() { result.value = generatePassphrase(getOpts()); }

    linkSlider(countRange, countNum, regen);
    [numStart, numEnd].forEach(el => el.addEventListener('change', regen));
    separator.addEventListener('change', regen);

    capitalize.addEventListener('change', () => { if (capitalize.checked) randomCap.checked = false; regen(); });
    randomCap.addEventListener('change',  () => { if (randomCap.checked)  capitalize.checked = false; regen(); });

    setupReveal(result, showBtn);
    setupCopy(copyBtn, () => result.value);
    regenBtn.addEventListener('click', regen);
    regen();
})();

// ============================================================
//  Generator — PIN tab
// ============================================================

(function setupPin() {
    const lengthRange = document.getElementById('pin-length-range');
    const lengthNum   = document.getElementById('pin-length-num');
    const result      = document.getElementById('pin-result');
    const showBtn     = document.getElementById('pin-show');
    const copyBtn     = document.getElementById('pin-copy');
    const regenBtn    = document.getElementById('pin-regen');

    function regen() { result.value = generatePin(+lengthRange.value); }

    linkSlider(lengthRange, lengthNum, regen);
    setupReveal(result, showBtn);
    setupCopy(copyBtn, () => result.value);
    regenBtn.addEventListener('click', regen);
    regen();
})();

// ============================================================
//  Generator — tabs
// ============================================================

document.querySelectorAll('.gen-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.gen-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.gen-panel').forEach(p => p.classList.add('hidden'));
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.remove('hidden');
    });
});

// ============================================================
//  App logic — add your code below
// ============================================================
