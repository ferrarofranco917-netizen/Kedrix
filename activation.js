// Kedrix activation bridge v2
(function () {
  function boot() {
    try {
      if (window.app && typeof window.app.bootstrapActivationSystem === 'function') {
        window.app.bootstrapActivationSystem();
      }
    } catch (_err) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
