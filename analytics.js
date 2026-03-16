(function () {
  var STORAGE_KEY = "psaAnalyticsEvents";
  var MAX_EVENTS = 1000;

  function safeParse(value) {
    try {
      return JSON.parse(value || "[]");
    } catch (err) {
      return [];
    }
  }

  function saveEvent(eventName, payload) {
    var records = safeParse(localStorage.getItem(STORAGE_KEY));
    records.push({
      event: eventName,
      payload: payload || {},
      page: location.pathname,
      ts: new Date().toISOString()
    });

    if (records.length > MAX_EVENTS) {
      records = records.slice(records.length - MAX_EVENTS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function trackEvent(eventName, payload) {
    var data = payload || {};

    if (!window.dataLayer) {
      window.dataLayer = [];
    }
    window.dataLayer.push({ event: eventName, ...data });

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, data);
    }

    saveEvent(eventName, data);
    console.log("track", eventName, data);
  }

  function getStoredEvents() {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  }

  window.PSAAnalytics = {
    trackEvent: trackEvent,
    getStoredEvents: getStoredEvents,
    STORAGE_KEY: STORAGE_KEY
  };
})();
