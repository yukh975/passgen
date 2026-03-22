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
//  App logic — add your code below
// ============================================================
