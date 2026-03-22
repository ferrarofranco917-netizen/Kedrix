// === KEDRIX GUIDED ACTIVATION BRIDGE (micropatch) ===
(function () {
  function handoffToApp() {
    const app = window.app || window.KedrixApp;
    if (!app) return false;

    // Non creare piu' una modale parallela con copy separata: lascia il controllo
    // al sistema integrato dentro app.js.
    if (typeof app.bootstrapActivationSystem === 'function') {
      try { app.bootstrapActivationSystem(); } catch (_err) {}
      return true;
    }

    try {
      if (typeof app.renderActivationCard === 'function') app.renderActivationCard(true);
      if (typeof app.showActivationModal === 'function') app.showActivationModal(true);
    } catch (_err) {}
    return true;
  }

  function waitForApp() {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (handoffToApp() || attempts > 40) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForApp, { once: true });
  } else {
    waitForApp();
  }
})();
