/**
 * /public/js/appState.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central frontend state layer.
 *
 * Responsibilities:
 *  1. Global destination selection state → DetailPanel subscription
 *  2. Cart management (add/remove/count)
 *  3. Favorites / Wishlist toggling
 *  4. Dark mode state persistence
 *  5. Sidebar nav active-link management
 *
 * This module is imported as a script tag and attaches itself to `window.AppState`
 * so it is accessible by the existing app.js / app.*.js files.
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function (window) {
  'use strict';

  // ── Internal state ──────────────────────────────────────────────────────────
  let _selectedItem      = null;       // Currently selected destination card
  let _cart              = [];         // Array of { id, name, price, image, category }
  let _favorites         = new Set();  // Set of item IDs
  let _isDarkMode        = true;       // Default dark
  let _activeView        = 'home';     // Matches sidebar nav data-view

  // Registered subscriber callbacks
  const _detailSubscribers = [];
  const _cartSubscribers   = [];

  // ── Selection state ─────────────────────────────────────────────────────────
  /**
   * Set the globally selected destination card.
   * All subscribers (Detail Panel) are notified instantly.
   */
  function selectItem(item) {
    if (!item || typeof item !== 'object') return;
    _selectedItem = item;
    _detailSubscribers.forEach(cb => cb(item));
  }

  function getSelectedItem() {
    return _selectedItem;
  }

  /**
   * Subscribe to selected-item changes.
   * @param {Function} callback  called with the new item whenever it changes
   * @returns {Function} unsubscribe function
   */
  function onItemSelected(callback) {
    _detailSubscribers.push(callback);
    // Immediately replay current state
    if (_selectedItem) callback(_selectedItem);
    return () => {
      const i = _detailSubscribers.indexOf(callback);
      if (i !== -1) _detailSubscribers.splice(i, 1);
    };
  }

  // ── Cart management ─────────────────────────────────────────────────────────
  function addToCart(item) {
    if (!item || !item.id) return;
    const exists = _cart.findIndex(c => c.id === item.id);
    if (exists === -1) {
      _cart.push({ ...item, qty: 1 });
    } else {
      _cart[exists].qty = (_cart[exists].qty || 1) + 1;
    }
    _notifyCart();
    return _cart.length;
  }

  function removeFromCart(itemId) {
    _cart = _cart.filter(c => c.id !== itemId);
    _notifyCart();
  }

  function getCart() { return [..._cart]; }
  function getCartCount() { return _cart.reduce((s, c) => s + (c.qty || 1), 0); }
  function clearCart() { _cart = []; _notifyCart(); }

  function onCartChange(callback) {
    _cartSubscribers.push(callback);
    callback([..._cart]);
    return () => {
      const i = _cartSubscribers.indexOf(callback);
      if (i !== -1) _cartSubscribers.splice(i, 1);
    };
  }

  function _notifyCart() {
    _cartSubscribers.forEach(cb => cb([..._cart]));
    // Update cart badge in header
    const badge = document.getElementById('cart-badge');
    const count = getCartCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // ── Favorites / Wishlist ─────────────────────────────────────────────────────
  function toggleFavorite(itemId) {
    if (_favorites.has(itemId)) {
      _favorites.delete(itemId);
    } else {
      _favorites.add(itemId);
    }
    _syncHeartIcons(itemId);
    return _favorites.has(itemId);
  }

  function isFavorite(itemId) { return _favorites.has(itemId); }
  function getFavorites()     { return [..._favorites]; }

  function _syncHeartIcons(itemId) {
    // Sync all heart buttons that reference this item
    document.querySelectorAll(`[data-favorite-id="${itemId}"]`).forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-solid', _favorites.has(itemId));
        icon.classList.toggle('fa-regular', !_favorites.has(itemId));
        icon.style.color = _favorites.has(itemId) ? '#ef4444' : '';
      }
    });
  }

  // ── Dark Mode toggle ─────────────────────────────────────────────────────────
  function toggleDarkMode(forceDark) {
    _isDarkMode = typeof forceDark === 'boolean' ? forceDark : !_isDarkMode;
    document.body.classList.toggle('dark-mode', _isDarkMode);
    document.body.classList.toggle('light-mode', !_isDarkMode);
    try { localStorage.setItem('imxx_dark_mode', _isDarkMode); } catch (_) {}
    return _isDarkMode;
  }

  function initDarkMode() {
    try {
      const saved = localStorage.getItem('imxx_dark_mode');
      _isDarkMode = saved === null ? true : saved === 'true';
    } catch (_) {
      _isDarkMode = true;
    }
    document.body.classList.toggle('dark-mode', _isDarkMode);
    document.body.classList.toggle('light-mode', !_isDarkMode);
  }

  // ── Sidebar active nav management ────────────────────────────────────────────
  function setActiveView(view) {
    _activeView = view;
    document.querySelectorAll('.nav-item[data-view]').forEach(el => {
      const isActive = el.getAttribute('data-view') === view;
      el.classList.toggle('active', isActive);
    });
  }

  function getActiveView() { return _activeView; }

  // ── Grid card "Add to Cart" helper ───────────────────────────────────────────
  /**
   * Called from the grid card Add to Cart button. 
   * Shows a toast notification.
   */
  function handleAddToCart(item) {
    const count = addToCart(item);
    // Show toast if app.showNotification is available
    if (window.app && typeof window.app.showNotification === 'function') {
      window.app.showNotification(`"${item.name}" added to cart (${count} items)`, 'success');
    }
  }

  /**
   * Wire all grid cards with Add to Cart buttons on render.
   * Call this after the grid is dynamically populated.
   */
  function wireGridCards() {
    document.querySelectorAll('[data-item-id]').forEach(card => {
      const itemId   = card.dataset.itemId;
      const itemName = card.dataset.itemName   || '';
      const itemPrice = card.dataset.itemPrice || '';
      const itemImg   = card.dataset.itemImage || '';
      const itemCat   = card.dataset.itemCat   || '';

      // ── Heart / Favorite button ────────────────────────────────────────────
      const heartBtn = card.querySelector('[data-favorite-id]');
      if (heartBtn && !heartBtn.dataset.wired) {
        heartBtn.dataset.wired = '1';
        heartBtn.addEventListener('click', e => {
          e.stopPropagation();
          const isNowFav = toggleFavorite(itemId);
          if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(
              isNowFav ? `Added to Wishlist` : `Removed from Wishlist`,
              isNowFav ? 'success' : 'info'
            );
          }
        });
        // Replay current favorite state
        _syncHeartIcons(itemId);
      }

      // ── Add to Cart button ─────────────────────────────────────────────────
      const cartBtn = card.querySelector('.card-add-to-cart-btn');
      if (cartBtn && !cartBtn.dataset.wired) {
        cartBtn.dataset.wired = '1';
        cartBtn.addEventListener('click', e => {
          e.stopPropagation();
          handleAddToCart({ id: itemId, name: itemName, price: itemPrice, image: itemImg, category: itemCat });
        });
      }

      // ── Card click → select item → update Detail Panel ────────────────────
      if (!card.dataset.clickWired) {
        card.dataset.clickWired = '1';
        card.addEventListener('click', () => {
          selectItem({ id: itemId, name: itemName, price: itemPrice, image: itemImg, category: itemCat });
        });
      }
    });
  }

  // ── Detail Panel subscriber auto-register ────────────────────────────────────
  /**
   * Registers the Detail Panel renderer.
   * Automatically called once the Detail Panel is in the DOM.
   */
  function registerDetailPanel(renderFn) {
    onItemSelected(renderFn);
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  window.AppState = {
    // Selection
    selectItem,
    getSelectedItem,
    onItemSelected,
    registerDetailPanel,

    // Cart
    addToCart,
    removeFromCart,
    getCart,
    getCartCount,
    clearCart,
    onCartChange,
    handleAddToCart,

    // Favorites
    toggleFavorite,
    isFavorite,
    getFavorites,

    // Dark Mode
    toggleDarkMode,
    initDarkMode,

    // Nav
    setActiveView,
    getActiveView,

    // Wire
    wireGridCards,
  };

  // Auto-init on load
  document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
  });

})(window);
