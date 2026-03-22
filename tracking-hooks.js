// === KEDRIX LEGACY TRACKING HOOKS (NON-DUPLICATING BRIDGE) ===
(function () {
  function forward(eventName, data) {
    try {
      if (window.KedrixTrackingBridge && typeof window.KedrixTrackingBridge.trackEvent === 'function') {
        return window.KedrixTrackingBridge.trackEvent(eventName, data || {});
      }
      if (typeof window.trackEvent === 'function') {
        return window.trackEvent(eventName, data || {});
      }
    } catch (_err) {}
    return Promise.resolve({ ok: false, skipped: true, reason: 'tracking_bridge_unavailable' });
  }

  window.KedrixLegacyTracking = {
    trackEvent: forward
  };
})();
