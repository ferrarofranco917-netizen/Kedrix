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
      const normalized = { ...raw };

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
        const action = String(normalizedPayload.action || '').trim().toLowerCase();
        const queryUrl = new URL(url, window.location.href);

        Object.entries(normalizedPayload).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') return;
          if (typeof value === 'object') {
            queryUrl.searchParams.set(key, JSON.stringify(value));
          } else {
            queryUrl.searchParams.set(key, String(value));
          }
        });

        const readActions = new Set(['check_license', 'register_beta_request', 'beta_request', 'activate_license']);

        if (readActions.has(action)) {
          const response = await fetch(queryUrl.toString(), {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store',
            signal: controller.signal
          });
          const raw = await response.text().catch(() => '');
          let data = {};
          try { data = raw ? JSON.parse(raw) : {}; } catch(_e) { data = { ok:false, raw }; }
          return { ok: response.ok, status: response.status, data, raw };
        }

        const body = JSON.stringify(normalizedPayload);

        if (navigator.sendBeacon) {
          const beaconOk = navigator.sendBeacon(queryUrl.toString(), new Blob([body], { type: 'text/plain;charset=utf-8' }));
          return { ok: beaconOk, status: beaconOk ? 202 : 0, data: { queued: beaconOk }, raw: '' };
        }

        await fetch(queryUrl.toString(), {
          method: 'POST',
          mode: 'no-cors',
          credentials: 'omit',
          cache: 'no-store',
          body,
          signal: controller.signal
        });

        return { ok: true, status: 0, data: { queued: true }, raw: '' };
      } finally {
        clearTimeout(timeout);
      }
    }
  };
  global.KedrixAPI = API;
})(window);
