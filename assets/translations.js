// eslint-disable-next-line no-unused-vars
const TRANSLATIONS = {
    en: {
        // ── App chrome ──────────────────────────────────────────
        app_title:       'Password Generator',
        subtitle:        'Secure Passwords Generator',
        help_title:      'Help',
        help_content:    '<h3>Password</h3><p>Configure length, character sets, and optional constraints. Use <strong>Presets</strong> to apply platform-specific settings (PostgreSQL, MySQL, Redis, etc.).</p><h3>Passphrase</h3><p>Generates a sequence of random words. Easier to remember, strong enough for most uses. Adjust word count, capitalization, separator, and optional numbers.</p><h3>PIN</h3><p>A numeric code of 4–12 digits generated with a cryptographically secure random source.</p><h3>Strength</h3><p>Estimated from length and character variety. For best security use 16+ characters with all character sets enabled.</p>',
        theme_to_light:  'Switch to light theme',
        theme_to_dark:   'Switch to dark theme',

        // ── Generator — tabs ────────────────────────────────────
        tab_password:    'Password',
        tab_passphrase:  'Passphrase',
        tab_pin:         'PIN',

        // ── Generator — controls ────────────────────────────────
        length_label:    'Length',
        options_label:   'Options',
        opt_uppercase:   'Uppercase (A–Z)',
        opt_lowercase:   'Lowercase (a–z)',
        opt_numbers:     'Numbers (0–9)',
        opt_symbols:     'Symbols (!@#…)',
        opt_nosimilar:   'Exclude similar (I, l, 1, O, 0)',
        opt_norepeat:    'No repeating characters',
        custom_symbols_label: 'Extra symbols',
        exclude_label:   'Exclude',
        preset_label:    'Preset',
        preset_none:     '— No preset',
        preset_high_entropy: 'High Entropy',
        count_label:     'Count',

        // ── Generator — strength ────────────────────────────────
        strength_label:  'Strength',
        strength_1:      'Very Weak',
        strength_2:      'Weak',
        strength_3:      'Fair',
        strength_4:      'Strong',
        strength_5:      'Very Strong',

        // ── Generator — passphrase ──────────────────────────────
        word_count_label: 'Word count',
        opt_capitalize:  'Capitalize words',
        opt_random_cap:  'Random capitalization',
        opt_num_start:   'Add number at start',
        opt_num_end:     'Add number at end',
        opt_num_inner:   'Random numbers inside',
        separator_label: 'Separator',
        sep_space:       'Space',
        sep_dash:        'Dash (—)',
        sep_dot:         'Dot (.)',
        sep_underscore:  'Underscore (_)',
        sep_random:      'Random symbol',
        sep_none:        'None',

        // ── Generator — buttons ─────────────────────────────────
        btn_copy:        'Copy',
        btn_copy_done:   'Copied!',
        btn_regen:       'Regenerate',
        btn_copy_all:    'Copy all',
        copy_all_title:  'Generated passwords',
    },
    ru: {
        // ── Оболочка ─────────────────────────────────────────────
        app_title:       'Password Generator',
        subtitle:        'Генератор надёжных паролей',
        help_title:      'Справка',
        help_content:    '<h3>Пароль</h3><p>Настройте длину, наборы символов и ограничения. Используйте <strong>Пресеты</strong> для платформ (PostgreSQL, MySQL, Redis и т.д.).</p><h3>Фраза-пароль</h3><p>Набор случайных слов. Легко запомнить, достаточно надёжный для большинства задач. Настраиваются количество слов, регистр, разделитель и цифры.</p><h3>PIN</h3><p>Числовой код 4–12 цифр на основе криптографически стойкого генератора.</p><h3>Надёжность</h3><p>Оценивается по длине и разнообразию символов. Для максимальной защиты используйте 16+ символов со всеми включёнными наборами.</p>',
        theme_to_light:  'Светлая тема',
        theme_to_dark:   'Тёмная тема',

        // ── Генератор — вкладки ──────────────────────────────────
        tab_password:    'Пароль',
        tab_passphrase:  'Фраза',
        tab_pin:         'PIN',

        // ── Генератор — управление ───────────────────────────────
        length_label:    'Длина',
        options_label:   'Параметры',
        opt_uppercase:   'Заглавные (A–Z)',
        opt_lowercase:   'Строчные (a–z)',
        opt_numbers:     'Цифры (0–9)',
        opt_symbols:     'Символы (!@#…)',
        opt_nosimilar:   'Исключить похожие (I, l, 1, O, 0)',
        opt_norepeat:    'Без повторяющихся символов',
        custom_symbols_label: 'Доп. символы',
        exclude_label:   'Исключить',
        preset_label:    'Пресет',
        preset_none:     '— Без пресета',
        preset_high_entropy: 'Макс. энтропия',
        count_label:     'Количество',

        // ── Генератор — надёжность ───────────────────────────────
        strength_label:  'Надёжность',
        strength_1:      'Очень слабый',
        strength_2:      'Слабый',
        strength_3:      'Средний',
        strength_4:      'Сильный',
        strength_5:      'Очень сильный',

        // ── Генератор — фраза-пароль ─────────────────────────────
        word_count_label: 'Кол-во слов',
        opt_capitalize:  'С заглавной',
        opt_random_cap:  'Случайный регистр',
        opt_num_start:   'Число в начале',
        opt_num_end:     'Число в конце',
        opt_num_inner:   'Числа внутри фразы',
        separator_label: 'Разделитель',
        sep_space:       'Пробел',
        sep_dash:        'Дефис (—)',
        sep_dot:         'Точка (.)',
        sep_underscore:  'Подчёркивание (_)',
        sep_random:      'Случайный символ',
        sep_none:        'Без разделителя',

        // ── Генератор — кнопки ───────────────────────────────────
        btn_copy:        'Копировать',
        btn_copy_done:   'Скопировано!',
        btn_regen:       'Пересоздать',
        btn_copy_all:    'Скопировать все',
        copy_all_title:  'Сгенерированные пароли',
    },
};
