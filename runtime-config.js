(function (global) {
  const CONFIG = {
    build: '20260322_refactor_i18n_v1a',
    channel: 'beta',
    serviceWorkerVersion: '20260322_cf1',
    serviceWorkerPath: './sw.js',
    scope: './',
    endpoints: {
  registry: 'https://script.google.com/macros/s/AKfycbz89cWPWlNihcLw9jpZpwgTBtcLb99u4m9wvjjEhL-zzVr3TkNpc6wCNl_wvi42gqEZ/exec',
  tracking: 'https://script.google.com/macros/s/AKfycbz89cWPWlNihcLw9jpZpwgTBtcLb99u4m9wvjjEhL-zzVr3TkNpc6wCNl_wvi42gqEZ/exec'
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

  function readStorage(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? String(value).trim() : '';
    } catch (_err) {
      return '';
    }
  }
  const CURRENT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz89cWPWlNihcLw9jpZpwgTBtcLb99u4m9wvjjEhL-zzVr3TkNpc6wCNl_wvi42gqEZ/exec';
  const LEGACY_ENDPOINTS = new Set([
    'https://script.google.com/macros/s/AKfycbzgKv6VM1K--AhdtFhAuGgm7rscoQCTf7vPFljAUr6njQRP_s6oyzB_UEIG5xWi0Se_4A/exec'
  ]);

  function normalizeEndpoint(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/\/exec(?:\?|#|$)/.test(raw)) return raw;
    if (/script\.google\.com\/macros\/s\//.test(raw)) return raw.replace(/\/?$/, '/exec');
    return raw;
  }

  function isLegacyEndpoint(value) {
    const normalized = normalizeEndpoint(value);
    return LEGACY_ENDPOINTS.has(normalized);
  }

  function readEndpointOverride(key) {
    const value = readStorage(key);
    const normalized = normalizeEndpoint(value);
    if (!normalized) return '';
    if (isLegacyEndpoint(normalized)) {
      try { localStorage.removeItem(key); } catch (_err) {}
      return '';
    }
    return normalized;
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
      const normalizedKind = String(kind || '').trim().toLowerCase();
      if (!normalizedKind) return '';

      const storageKeys = {
        registry: ['kedrix_registry_endpoint'],
        tracking: ['kedrix_tracking_endpoint', 'kedrix_registry_endpoint']
      };
      const metaKeys = {
        registry: 'kedrix-beta-registry-endpoint',
        tracking: 'kedrix-tracking-endpoint'
      };

      const storageCandidates = storageKeys[normalizedKind] || [];
      for (const key of storageCandidates) {
        const value = readEndpointOverride(key);
        if (value) return value;
      }

      const metaValue = readMeta(metaKeys[normalizedKind] || '');
      if (metaValue) return metaValue;

      return CONFIG.endpoints[normalizedKind] || CURRENT_ENDPOINT || '';
    }
  };

  global.KedrixRuntimeConfig = api;
})(window);
