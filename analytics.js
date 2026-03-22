(function () {
  var STORAGE_KEY = "psaAnalyticsEvents";
  var MAX_EVENTS = 1000;
  var SESSION_KEY = "psaAnalyticsSessionId";
  var VISITOR_KEY = "psaAnalyticsVisitorId";
  var PAGE_VIEW_KEY = "psaAnalyticsPageViewTracked:" + location.pathname + location.search;
  var REMOTE_SYNC_KEY = "psaAnalyticsRemoteSyncEnabled";

  function safeParse(value) {
    try {
      return JSON.parse(value || "[]");
    } catch (err) {
      return [];
    }
  }

  function randomId(prefix) {
    return (prefix || "id") + "-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function getSessionId() {
    try {
      var current = sessionStorage.getItem(SESSION_KEY);
      if (!current) {
        current = randomId("sess");
        sessionStorage.setItem(SESSION_KEY, current);
      }
      return current;
    } catch (err) {
      return randomId("sess");
    }
  }

  function getVisitorId() {
    try {
      var current = localStorage.getItem(VISITOR_KEY);
      if (!current) {
        current = randomId("visitor");
        localStorage.setItem(VISITOR_KEY, current);
      }
      return current;
    } catch (err) {
      return randomId("visitor");
    }
  }

  function getQueryValue(key) {
    try {
      return new URLSearchParams(location.search).get(key) || "";
    } catch (err) {
      return "";
    }
  }

  function getHostname(url) {
    if (!url || url === "direct") return "";
    try {
      return new URL(url).hostname.toLowerCase();
    } catch (err) {
      return String(url || "").toLowerCase();
    }
  }

  function detectSource(meta) {
    var utmSource = String(meta.utm_source || "").toLowerCase();
    var refHost = getHostname(meta.referrer || "");
    var sourceHint = [utmSource, refHost, meta.fbclid ? "fbclid" : "", meta.gclid ? "gclid" : "", meta.gbraid ? "gbraid" : "", meta.wbraid ? "wbraid" : "", meta.ttclid ? "ttclid" : ""].join(" ");
    var platform = "direct";
    var type = "direct";

    if (/instagram/.test(sourceHint)) {
      platform = "instagram";
      type = "social";
    } else if (/facebook|fbclid|m\.facebook|l\.facebook/.test(sourceHint)) {
      platform = "facebook";
      type = "social";
    } else if (/whatsapp|wa\.me/.test(sourceHint)) {
      platform = "whatsapp";
      type = "messaging";
    } else if (/youtube|youtu\.be/.test(sourceHint)) {
      platform = "youtube";
      type = "video";
    } else if (/google|gclid|gbraid|wbraid/.test(sourceHint)) {
      platform = "google";
      type = "search";
    } else if (/linkedin/.test(sourceHint)) {
      platform = "linkedin";
      type = "social";
    } else if (/telegram/.test(sourceHint)) {
      platform = "telegram";
      type = "messaging";
    } else if (/twitter|x\.com|t\.co/.test(sourceHint)) {
      platform = "x";
      type = "social";
    } else if (/direct/.test(sourceHint) || (!utmSource && !refHost)) {
      platform = "direct";
      type = "direct";
    } else {
      platform = utmSource || refHost || "other";
      type = meta.utm_medium || "referral";
    }

    return {
      source_platform: platform,
      source_type: type,
      source_label: platform === "direct"
        ? "direct"
        : platform + (meta.utm_campaign ? " / " + meta.utm_campaign : "")
    };
  }

  function getBaseMeta() {
    var meta = {
      page: location.pathname,
      page_title: document.title || "",
      page_url: location.href,
      referrer: document.referrer || "direct",
      utm_source: getQueryValue("utm_source"),
      utm_medium: getQueryValue("utm_medium"),
      utm_campaign: getQueryValue("utm_campaign"),
      utm_content: getQueryValue("utm_content"),
      utm_term: getQueryValue("utm_term"),
      utm_id: getQueryValue("utm_id"),
      fbclid: getQueryValue("fbclid"),
      gclid: getQueryValue("gclid"),
      gbraid: getQueryValue("gbraid"),
      wbraid: getQueryValue("wbraid"),
      ttclid: getQueryValue("ttclid"),
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      user_agent: navigator.userAgent || ""
    };
    return Object.assign(meta, detectSource(meta));
  }

  function saveEvent(eventName, payload, meta) {
    var records = safeParse(localStorage.getItem(STORAGE_KEY));
    records.push({
      event: eventName,
      payload: payload || {},
      page: (meta && meta.page) || location.pathname,
      ts: new Date().toISOString(),
      meta: meta || getBaseMeta()
    });

    if (records.length > MAX_EVENTS) {
      records = records.slice(records.length - MAX_EVENTS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function getRemoteEndpoint() {
    var config = window.DL10X_CONFIG || {};
    return config.SHEET_WEBAPP_URL || "";
  }

  function markRemoteSync(enabled) {
    try {
      localStorage.setItem(REMOTE_SYNC_KEY, enabled ? "yes" : "no");
    } catch (err) {}
  }

  function remoteSyncEnabled() {
    try {
      return localStorage.getItem(REMOTE_SYNC_KEY) === "yes";
    } catch (err) {
      return false;
    }
  }

  function sendToServer(eventName, payload, meta) {
    var endpoint = getRemoteEndpoint();
    if (!endpoint) {
      return Promise.resolve(false);
    }

    var body = new URLSearchParams({
      action: "analytics_event",
      event_name: eventName,
      page: meta.page || location.pathname,
      page_title: meta.page_title || "",
      page_url: meta.page_url || location.href,
      referrer: meta.referrer || "direct",
      utm_source: meta.utm_source || "",
      utm_medium: meta.utm_medium || "",
      utm_campaign: meta.utm_campaign || "",
      utm_content: meta.utm_content || "",
      utm_term: meta.utm_term || "",
      utm_id: meta.utm_id || "",
      fbclid: meta.fbclid || "",
      gclid: meta.gclid || "",
      gbraid: meta.gbraid || "",
      wbraid: meta.wbraid || "",
      ttclid: meta.ttclid || "",
      source_platform: meta.source_platform || "",
      source_type: meta.source_type || "",
      source_label: meta.source_label || "",
      visitor_id: meta.visitor_id || getVisitorId(),
      session_id: meta.session_id || getSessionId(),
      user_agent: meta.user_agent || navigator.userAgent || "",
      ts: new Date().toISOString(),
      payload_json: JSON.stringify(payload || {})
    });

    if (navigator.sendBeacon) {
      try {
        var ok = navigator.sendBeacon(endpoint, body);
        if (ok) {
          markRemoteSync(true);
          return Promise.resolve(true);
        }
      } catch (err) {}
    }

    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      keepalive: true
    })
      .then(function (response) {
        markRemoteSync(response.ok);
        return response.ok;
      })
      .catch(function () {
        markRemoteSync(false);
        return false;
      });
  }

  function trackEvent(eventName, payload, options) {
    var data = payload || {};
    var meta = Object.assign(getBaseMeta(), (options && options.meta) || {});
    meta = Object.assign(meta, detectSource(meta));

    if (!window.dataLayer) {
      window.dataLayer = [];
    }
    window.dataLayer.push({ event: eventName, page: meta.page, source_platform: meta.source_platform, ...data });

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, data);
    }

    saveEvent(eventName, data, meta);
    sendToServer(eventName, data, meta);
    console.log("track", eventName, data, meta);
  }

  function ensurePageViewTracked() {
    try {
      if (sessionStorage.getItem(PAGE_VIEW_KEY)) {
        return;
      }
      sessionStorage.setItem(PAGE_VIEW_KEY, "yes");
    } catch (err) {}

    trackEvent("page_view", {
      page_name: location.pathname.split("/").pop() || "index.html"
    });
  }

  function getStoredEvents() {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  }

  window.PSAAnalytics = {
    trackEvent: trackEvent,
    getStoredEvents: getStoredEvents,
    STORAGE_KEY: STORAGE_KEY,
    getVisitorId: getVisitorId,
    getSessionId: getSessionId,
    remoteSyncEnabled: remoteSyncEnabled,
    detectSource: detectSource
  };

  ensurePageViewTracked();
})();
