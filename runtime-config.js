(function (global) {
  const FORCED_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz89cWPWlNihcLw9jpZpwgTBtcLb99u4m9wvjjEhL-zzVr3TkNpc6wCNl_wvi42gqEZ/exec';

  const CONFIG = {
    build: '20260322_refactor_i18n_v1a',
    channel: 'beta',
    serviceWorkerVersion: '20260322_cf1',
    serviceWorkerPath: './sw.js',
    scope: './',
    endpoints: {
      registry: FORCED_ENDPOINT,
      tracking: FORCED_ENDPOINT
    }
  };

  function readMeta(name) {
    try {
      const node = document.querySelector(`meta[name="${name}"]`);
      return node && node.content ? String(node.content).trim() : '';
    } catch (_err) {
      return '';
    }
  }

  function clearLegacyStorage() {
    try { localStorage.removeItem('kedrix_registry_endpoint'); } catch (_err) {}
    try { localStorage.removeItem('kedrix_tracking_endpoint'); } catch (_err) {}
  }

  const api = {
    getBuild() {
      return readMeta('kedrix-build') || CONFIG.build;
    },
    getChannel() {
      return readMeta('kedrix-channel') || CONFIG.channel;
    },
    getScope() {
      return CONFIG.scope;
    },
    getServiceWorkerUrl() {
      return `${CONFIG.serviceWorkerPath}?v=${CONFIG.serviceWorkerVersion}`;
    },
    getEndpoint(kind) {
      clearLegacyStorage();
      const normalizedKind = String(kind || '').trim().toLowerCase();
      if (!normalizedKind) return FORCED_ENDPOINT;
      return CONFIG.endpoints[normalizedKind] || FORCED_ENDPOINT;
    }
  };

  global.KedrixRuntimeConfig = api;
})(window);
