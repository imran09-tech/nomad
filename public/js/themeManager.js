/**
 * NOMAD - Ultra-Premium Theme Management Engine
 * Handles Dark Mode, Light Mode, System Preference auto-detection,
 * and Theme Color Accent Palette switching (Gold, Purple, Blue, Emerald, Rose, Amber).
 * Eliminates FOUC (Flash of Unstyled Color), syncs across tabs, and provides UI state controls.
 */
class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'nomad_theme';
        this.COLOR_STORAGE_KEY = 'nomad_theme_color';
        this.currentMode = this.getSavedTheme();
        this.currentColor = this.getSavedColor();
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.init();
    }

    /**
     * Get saved theme mode from localStorage, or fallback to 'system'
     */
    getSavedTheme() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved === 'dark' || saved === 'light' || saved === 'system') {
                return saved;
            }
            // Migration check for legacy keys
            const legacySetting = localStorage.getItem('nomad_settings');
            if (legacySetting) {
                const parsed = JSON.parse(legacySetting);
                if (typeof parsed.darkMode === 'boolean') {
                    return parsed.darkMode ? 'dark' : 'light';
                }
            }
            const legacyDark = localStorage.getItem('imxx_dark_mode');
            if (legacyDark !== null) {
                return legacyDark === 'true' ? 'dark' : 'light';
            }
        } catch (e) {
            console.warn('[ThemeManager] Storage access error:', e);
        }
        return 'system';
    }

    /**
     * Get saved accent color from localStorage, or fallback to 'gold'
     */
    getSavedColor() {
        try {
            const saved = localStorage.getItem(this.COLOR_STORAGE_KEY);
            if (saved && ['gold', 'purple', 'blue', 'emerald', 'rose', 'amber'].includes(saved)) {
                return saved;
            }
        } catch (e) {
            console.warn('[ThemeManager] Color storage access error:', e);
        }
        return 'gold';
    }

    /**
     * Determine resolved theme ('dark' or 'light') based on current mode and system preferences
     */
    getResolvedTheme(mode = this.currentMode) {
        if (mode === 'dark') return 'dark';
        if (mode === 'light') return 'light';
        return this.mediaQuery.matches ? 'dark' : 'light';
    }

    /**
     * Initialize event listeners and apply initial theme and color palette
     */
    init() {
        // Apply current theme mode to DOM
        this.applyTheme(this.currentMode, false);
        this.setThemeColor(this.currentColor, false);

        // Listen for OS system preference changes
        if (this.mediaQuery.addEventListener) {
            this.mediaQuery.addEventListener('change', (e) => {
                if (this.currentMode === 'system') {
                    this.applyTheme('system', true);
                }
            });
        }

        // Listen for tab sync via storage event
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY && e.newValue) {
                this.currentMode = e.newValue;
                this.applyTheme(this.currentMode, true);
            }
            if (e.key === this.COLOR_STORAGE_KEY && e.newValue) {
                this.setThemeColor(e.newValue, true);
            }
        });

        // Sync UI toggles once DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.syncUI();
                this.syncColorUI();
            });
        } else {
            this.syncUI();
            this.syncColorUI();
        }
    }

    /**
     * Set a new theme mode ('dark', 'light', or 'system')
     */
    setTheme(mode, notify = true) {
        if (mode !== 'dark' && mode !== 'light' && mode !== 'system') {
            mode = 'system';
        }
        this.currentMode = mode;

        try {
            localStorage.setItem(this.STORAGE_KEY, mode);
            localStorage.setItem('imxx_dark_mode', this.getResolvedTheme(mode) === 'dark');
            
            // Sync with legacy Store settings if available
            if (window.Store && window.Store.state && window.Store.state.settings) {
                window.Store.state.settings.darkMode = (this.getResolvedTheme(mode) === 'dark');
                window.Store.save('settings', window.Store.state.settings);
            }
        } catch (e) {
            console.warn('[ThemeManager] Failed to persist theme preference:', e);
        }

        this.applyTheme(mode, notify);
    }

    /**
     * Set a primary theme accent color ('gold', 'purple', 'blue', 'emerald', 'rose', 'amber')
     */
    setThemeColor(colorName, notify = true) {
        const palettes = {
            gold: {
                name: 'Imperial Gold',
                gold: '#D4AF37', goldLight: '#F9D976', goldGlow: 'rgba(212, 175, 55, 0.4)',
                goldGradient: 'linear-gradient(135deg, #fce055 0%, #d4af37 50%, #b8860b 100%)',
                shadowGlow: '0 0 35px rgba(212, 175, 55, 0.3)'
            },
            purple: {
                name: 'Cyber Purple',
                gold: '#a855f7', goldLight: '#c084fc', goldGlow: 'rgba(168, 85, 247, 0.4)',
                goldGradient: 'linear-gradient(135deg, #e9d5ff 0%, #a855f7 50%, #7e22ce 100%)',
                shadowGlow: '0 0 35px rgba(168, 85, 247, 0.3)'
            },
            blue: {
                name: 'Royal Sapphire',
                gold: '#3b82f6', goldLight: '#60a5fa', goldGlow: 'rgba(59, 130, 246, 0.4)',
                goldGradient: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 50%, #1d4ed8 100%)',
                shadowGlow: '0 0 35px rgba(59, 130, 246, 0.3)'
            },
            emerald: {
                name: 'Emerald Green',
                gold: '#10b981', goldLight: '#34d399', goldGlow: 'rgba(16, 185, 129, 0.4)',
                goldGradient: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 50%, #047857 100%)',
                shadowGlow: '0 0 35px rgba(16, 185, 129, 0.3)'
            },
            rose: {
                name: 'Sunset Crimson',
                gold: '#f43f5e', goldLight: '#fb7185', goldGlow: 'rgba(244, 63, 94, 0.4)',
                goldGradient: 'linear-gradient(135deg, #fecdd3 0%, #f43f5e 50%, #be123c 100%)',
                shadowGlow: '0 0 35px rgba(244, 63, 94, 0.3)'
            },
            amber: {
                name: 'Solar Amber',
                gold: '#f97316', goldLight: '#fb923c', goldGlow: 'rgba(249, 115, 22, 0.4)',
                goldGradient: 'linear-gradient(135deg, #ffedd5 0%, #f97316 50%, #c2410c 100%)',
                shadowGlow: '0 0 35px rgba(249, 115, 22, 0.3)'
            }
        };

        if (!palettes[colorName]) colorName = 'gold';
        this.currentColor = colorName;

        try {
            localStorage.setItem(this.COLOR_STORAGE_KEY, colorName);
        } catch (e) {}

        const palette = palettes[colorName];
        const root = document.documentElement;

        root.style.setProperty('--gold', palette.gold);
        root.style.setProperty('--gold-light', palette.goldLight);
        root.style.setProperty('--gold-glow', palette.goldGlow);
        root.style.setProperty('--gold-gradient', palette.goldGradient);
        root.style.setProperty('--shadow-glow', palette.shadowGlow);

        Object.keys(palettes).forEach(k => {
            root.classList.remove(`theme-accent-${k}`);
            if (document.body) document.body.classList.remove(`theme-accent-${k}`);
        });

        root.classList.add(`theme-accent-${colorName}`);
        if (document.body) document.body.classList.add(`theme-accent-${colorName}`);

        // Sync with animation engine theme if matching
        const animThemeMap = {
            gold: 'gold',
            purple: 'cyberpunk',
            blue: 'sapphire',
            emerald: 'emerald',
            rose: 'rosegold',
            amber: 'rosegold'
        };
        if (window.app && typeof window.app.setAnimationTheme === 'function') {
            window.app.setAnimationTheme(animThemeMap[colorName] || 'gold', false);
        }

        this.syncColorUI();

        if (notify && window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(`Theme Accent: ${palette.name}`, 'info');
        }
    }

    /**
     * Toggle cleanly between Light Mode and Dark Mode
     */
    toggleTheme() {
        const resolved = this.getResolvedTheme();
        const nextMode = resolved === 'dark' ? 'light' : 'dark';
        this.setTheme(nextMode, true);
    }

    /**
     * Apply theme classes to <html> and <body> elements and dispatch change event
     */
    applyTheme(mode = this.currentMode, notify = true) {
        const resolved = this.getResolvedTheme(mode);
        const isDark = resolved === 'dark';

        const root = document.documentElement;
        const body = document.body;

        if (isDark) {
            root.classList.add('dark-mode');
            root.classList.remove('light-mode');
            if (body) {
                body.classList.add('dark-mode');
                body.classList.remove('light-mode');
            }
        } else {
            root.classList.add('light-mode');
            root.classList.remove('dark-mode');
            if (body) {
                body.classList.add('light-mode');
                body.classList.remove('dark-mode');
            }
        }

        // Set meta theme-color tag for mobile browsers
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = isDark ? '#070a12' : '#f1f5f9';

        this.syncUI();

        // Dispatch custom themechange event
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { mode: this.currentMode, resolved: resolved, isDark: isDark }
        }));

        if (notify && window.app && typeof window.app.showNotification === 'function') {
            const modeName = mode === 'system' ? `System (${resolved})` : (isDark ? 'Dark' : 'Light');
            window.app.showNotification(`${modeName} Mode Enabled`, 'info');
        }
    }

    /**
     * Synchronize UI toggle controls across the application
     */
    syncUI() {
        const resolved = this.getResolvedTheme();
        const isDark = resolved === 'dark';

        // 1. Settings view checkbox switch
        const settingCheckbox = document.getElementById('setting-dark-mode');
        if (settingCheckbox) {
            settingCheckbox.checked = isDark;
        }

        // 2. Header toggle button states
        const headerToggle = document.getElementById('header-theme-toggle');
        if (headerToggle) {
            headerToggle.setAttribute('data-theme', resolved);
            headerToggle.title = `Current Theme: ${isDark ? 'Dark' : 'Light'} (Click to toggle)`;
        }

        // 3. AppState sync
        if (window.AppState) {
            window.AppState._isDarkMode = isDark;
        }
    }

    /**
     * Synchronize color palette swatch buttons across UI
     */
    syncColorUI() {
        const color = this.currentColor || 'gold';

        document.querySelectorAll('.cp-dot, .setting-color-btn').forEach(btn => {
            if (btn.getAttribute('data-color') === color) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Instantiate global ThemeManager singleton
window.themeManager = new ThemeManager();
