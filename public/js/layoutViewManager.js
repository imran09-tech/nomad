/**
 * NOMAD - Ultra-Premium Layout & Orientation View Manager
 * Controls viewing orientation (Vertical Grid vs. Horizontal Row/List view) for items, destination cards, hotels, and images.
 * Persists preference, handles dynamic CSS transformations, and syncs toggle controls across all UI components.
 */
class LayoutViewManager {
    constructor() {
        this.STORAGE_KEY = 'nomad_layout_view';
        this.currentLayout = this.getSavedLayout();
        this.init();
    }

    /**
     * Get saved layout from localStorage, fallback to 'vertical'
     */
    getSavedLayout() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved === 'horizontal' || saved === 'vertical') {
                return saved;
            }
        } catch (e) {
            console.warn('[LayoutViewManager] Storage access error:', e);
        }
        return 'vertical';
    }

    /**
     * Initialize listeners and apply initial layout mode
     */
    init() {
        this.applyLayout(this.currentLayout, false);

        // Tab sync via storage event
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY && e.newValue) {
                this.currentLayout = e.newValue;
                this.applyLayout(this.currentLayout, true);
            }
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.syncUI());
        } else {
            this.syncUI();
        }
    }

    /**
     * Set explicit layout ('vertical' or 'horizontal')
     */
    setLayout(layout, notify = true) {
        if (layout !== 'horizontal' && layout !== 'vertical') {
            layout = 'vertical';
        }
        this.currentLayout = layout;
        try {
            localStorage.setItem(this.STORAGE_KEY, layout);
        } catch (e) {
            console.warn('[LayoutViewManager] Storage write error:', e);
        }
        this.applyLayout(layout, notify);
    }

    /**
     * Toggle cleanly between Vertical and Horizontal orientation
     */
    toggleLayout() {
        const next = this.currentLayout === 'vertical' ? 'horizontal' : 'vertical';
        this.setLayout(next, true);
    }

    /**
     * Apply layout classes to root and container elements
     */
    applyLayout(layout = this.currentLayout, notify = true) {
        const root = document.documentElement;
        const body = document.body;
        const appWrapper = document.querySelector('.app-wrapper') || body;

        if (layout === 'horizontal') {
            root.classList.add('layout-horizontal');
            root.classList.remove('layout-vertical');
            if (body) {
                body.classList.add('layout-horizontal');
                body.classList.remove('layout-vertical');
            }
            if (appWrapper) {
                appWrapper.classList.add('layout-horizontal');
                appWrapper.classList.remove('layout-vertical');
            }
        } else {
            root.classList.add('layout-vertical');
            root.classList.remove('layout-horizontal');
            if (body) {
                body.classList.add('layout-vertical');
                body.classList.remove('layout-horizontal');
            }
            if (appWrapper) {
                appWrapper.classList.add('layout-vertical');
                appWrapper.classList.remove('layout-horizontal');
            }
        }

        this.syncUI();

        window.dispatchEvent(new CustomEvent('layoutviewchange', {
            detail: { layout: this.currentLayout, isHorizontal: this.currentLayout === 'horizontal' }
        }));

        if (notify && window.app && typeof window.app.showNotification === 'function') {
            const label = this.currentLayout === 'horizontal' ? 'Horizontal List View' : 'Vertical Grid View';
            window.app.showNotification(`${label} Enabled`, 'info');
        }
    }

    /**
     * Synchronize all UI toggle controls across the application
     */
    syncUI() {
        const isHorizontal = this.currentLayout === 'horizontal';

        // 1. Sync toggle button states in header and filter bars
        document.querySelectorAll('.layout-btn, .view-mode-btn').forEach(btn => {
            const layoutAttr = btn.getAttribute('data-layout') || btn.getAttribute('data-mode');
            if (layoutAttr) {
                if (layoutAttr === this.currentLayout) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                }
            }
        });

        // 2. Sync dropdown/select in settings view if present
        const settingSelect = document.getElementById('setting-layout-view');
        if (settingSelect) {
            settingSelect.value = this.currentLayout;
        }
    }
}

// Instantiate global singleton
window.layoutViewManager = new LayoutViewManager();
