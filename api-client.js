(function(global){
  const DEFAULT_TIMEOUT = 12000;
  const API = {
    buildMeta(extra){
      const guard = global.KedrixLicenseGuard;
      const session = global.KedrixSessionManager;
      return {
        app: 'kedrix-pfe',
        channel: 'beta',
        sentAt: new Date().toISOString(),
        fingerprint: guard && typeof guard.getFingerprint === 'function' ? guard.getFingerprint() : '',
        sessionId: session && typeof session.getSessionId === 'function' ? session.getSessionId() : '',
        ...extra
      };
    },
    normalizePayload(payload = {}, meta = {}){
      const raw = { ...payload, _meta: API.buildMeta(meta) };
      const action = String(raw.action || '').trim().toLowerCase();
      const normalized = { ...raw };

      if (action === 'beta_request') {
        normalized.action = 'register_beta_request';
      }

      if (action === 'activate_license') {
        normalized.action = 'check_license';
      }

      if (normalized.email && !normalized.user_email) normalized.user_email = normalized.email;
      if (normalized.testerId && !normalized.tester_id) normalized.tester_id = normalized.testerId;
      if (normalized.licenseKey && !normalized.tester_id) normalized.tester_id = normalized.licenseKey;
      if (normalized.sessionId && !normalized.session_id) normalized.session_id = normalized.sessionId;
      if (normalized.source && !normalized.origin) normalized.origin = normalized.source;
      if (normalized.client_sig && !normalized.clientSig) normalized.clientSig = normalized.client_sig;

      return normalized;
    },
    async request(url, payload = {}, options = {}){
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
      try {
        const normalizedPayload = API.normalizePayload(payload, options.meta || {});
        const response = await fetch(url, {
          method: options.method || 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(normalizedPayload),
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store',
          signal: controller.signal
        });
        const raw = await response.text().catch(() => '');
        let data = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch(_e) { data = { ok:false, raw }; }
        return { ok: response.ok, status: response.status, data, raw };
      } finally {
        clearTimeout(timeout);
      }
    }
  };
  global.KedrixAPI = API;
})(window);