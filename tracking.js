// === KEDRIX TRACKING BRIDGE ===
(function () {
  const recent = new Map();
  const DEDUPE_WINDOW_MS = 2500;

  function cleanup(now) {
    recent.forEach((value, key) => {
      if ((now - value) > DEDUPE_WINDOW_MS) recent.delete(key);
    });
  }

  function getKey(eventName, data) {
    return `${String(eventName || '')}::${JSON.stringify(data || {})}`;
  }

  function shouldForward(eventName, data) {
    const now = Date.now();
    cleanup(now);
    const key = getKey(eventName, data);
    const last = recent.get(key) || 0;
    if ((now - last) < DEDUPE_WINDOW_MS) return false;
    recent.set(key, now);
    return true;
  }

  function callTracker(eventName, data) {
    try {
      if (!shouldForward(eventName, data)) {
        return Promise.resolve({ ok: true, skipped: true, duplicate: true });
      }
      if (window.KedrixTracking && typeof window.KedrixTracking.trackEvent === 'function') {
        return window.KedrixTracking.trackEvent(eventName, data || {});
      }
    } catch (_err) {}
    return Promise.resolve({ ok: false, skipped: true, reason: 'tracking_unavailable' });
  }

  window.trackEvent = function trackEvent(eventName, data = {}) {
    return callTracker(eventName, data);
  };

  window.KedrixTrackingBridge = {
    trackEvent: window.trackEvent
  };
})();
