/**
 * DataLearn10X purchase + analytics API for Google Apps Script
 *
 * What it fixes:
 * - Returns purchased course mapping by email for cross-device access.
 * - Stores website analytics in a dedicated sheet so dashboard counts are shared across devices.
 * - Supports remote analytics export for the admin dashboard.
 */

var SPREADSHEET_ID = "1JZnJkVTX0ArDFtjV_Nlv_Spb3JB-5-KkuvbFpEflvjA";
var SHEET_NAME = "Sheet1";
var ANALYTICS_SHEET_NAME = "Analytics";
var PROGRESS_SHEET_NAME = "PracticeProgress";
var PURCHASE_HEADERS = [
  "timestamp",
  "name",
  "mobile",
  "email",
  "profession",
  "course",
  "total",
  "discount",
  "netpayment",
  "payment_id",
  "order_id",
  "signature"
];
var ANALYTICS_HEADERS = [
  "timestamp",
  "event_name",
  "page",
  "page_title",
  "page_url",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "ttclid",
  "source_platform",
  "source_type",
  "source_label",
  "visitor_id",
  "session_id",
  "user_agent",
  "payload_json"
];
var PROGRESS_HEADERS = [
  "timestamp",
  "email",
  "module",
  "student_name",
  "progress_json"
];

function getOrCreateSheet_(sheetName, headers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function getSheet_() {
  return getOrCreateSheet_(SHEET_NAME, PURCHASE_HEADERS);
}

function getAnalyticsSheet_() {
  return getOrCreateSheet_(ANALYTICS_SHEET_NAME, ANALYTICS_HEADERS);
}

function getProgressSheet_() {
  return getOrCreateSheet_(PROGRESS_SHEET_NAME, PROGRESS_HEADERS);
}

function normalizeEmail_(value) {
  return String(value || "").toLowerCase().trim();
}

function splitCourses_(courseText) {
  var text = String(courseText || "").trim();
  if (!text) return [];
  return text
    .split(/\s*\|\s*|\s*,\s*/)
    .map(function (item) { return item.trim(); })
    .filter(function (item) { return item.length > 0; });
}

function parseJsonSafe_(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function getPurchasedCoursesByEmail_(email) {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var target = normalizeEmail_(email);

  var unique = {};
  for (var i = 1; i < data.length; i++) {
    var rowEmail = normalizeEmail_(data[i][3]);
    if (rowEmail !== target) continue;

    var rowCourses = splitCourses_(data[i][5]);
    for (var j = 0; j < rowCourses.length; j++) {
      unique[rowCourses[j]] = true;
    }
  }

  return Object.keys(unique);
}

function appendPurchaseRow_(e) {
  var sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    e.parameter.name,
    e.parameter.mobile,
    e.parameter.email,
    e.parameter.profession,
    e.parameter.course,
    e.parameter.total,
    e.parameter.discount,
    e.parameter.netpayment,
    e.parameter.payment_id,
    e.parameter.order_id,
    e.parameter.signature
  ]);
}

function appendAnalyticsEvent_(e) {
  var sheet = getAnalyticsSheet_();
  sheet.appendRow([
    e.parameter.ts || new Date().toISOString(),
    e.parameter.event_name || "",
    e.parameter.page || "",
    e.parameter.page_title || "",
    e.parameter.page_url || "",
    e.parameter.referrer || "",
    e.parameter.utm_source || "",
    e.parameter.utm_medium || "",
    e.parameter.utm_campaign || "",
    e.parameter.utm_content || "",
    e.parameter.utm_term || "",
    e.parameter.utm_id || "",
    e.parameter.fbclid || "",
    e.parameter.gclid || "",
    e.parameter.gbraid || "",
    e.parameter.wbraid || "",
    e.parameter.ttclid || "",
    e.parameter.source_platform || "",
    e.parameter.source_type || "",
    e.parameter.source_label || "",
    e.parameter.visitor_id || "",
    e.parameter.session_id || "",
    e.parameter.user_agent || "",
    e.parameter.payload_json || "{}"
  ]);
}

function appendProgressRow_(e, moduleName) {
  var email = normalizeEmail_(e.parameter.email);
  if (!email) {
    return { ok: false, error: "EMAIL_REQUIRED" };
  }

  var sheet = getProgressSheet_();
  sheet.appendRow([
    e.parameter.ts || new Date().toISOString(),
    email,
    moduleName || "practice",
    e.parameter.student_name || "",
    e.parameter.progress_json || "{}"
  ]);
  return { ok: true };
}

function getLatestProgressByEmail_(email, moduleName) {
  var target = normalizeEmail_(email);
  if (!target) return null;

  var sheet = getProgressSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  for (var i = data.length - 1; i >= 1; i--) {
    var rowEmail = normalizeEmail_(data[i][1]);
    var rowModule = String(data[i][2] || "").toLowerCase();
    if (rowEmail === target && rowModule === String(moduleName || "").toLowerCase()) {
      return {
        timestamp: data[i][0],
        email: rowEmail,
        module: rowModule,
        student_name: data[i][3] || "",
        progress_json: data[i][4] || "{}"
      };
    }
  }
  return null;
}

function doPost(e) {
  var action = (e && e.parameter && e.parameter.action ? e.parameter.action : "").toLowerCase();

  if (action === "analytics_event") {
    appendAnalyticsEvent_(e);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, type: "analytics_event" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "practice_progress_save") {
    var savedPractice = appendProgressRow_(e, "practice_hub");
    return ContentService
      .createTextOutput(JSON.stringify(savedPractice))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "typing_progress_save") {
    var savedTyping = appendProgressRow_(e, "typing_course");
    return ContentService
      .createTextOutput(JSON.stringify(savedTyping))
      .setMimeType(ContentService.MimeType.JSON);
  }

  appendPurchaseRow_(e);
  return ContentService
    .createTextOutput("Success")
    .setMimeType(ContentService.MimeType.TEXT);
}

function exportAnalytics_(limit) {
  var sheet = getAnalyticsSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var header = data[0];
  var rows = data.slice(1);
  var safeLimit = Math.max(1, Math.min(Number(limit) || 5000, 10000));
  rows = rows.slice(Math.max(rows.length - safeLimit, 0));

  return rows.map(function (row) {
    var item = {};
    for (var i = 0; i < header.length; i++) {
      item[header[i]] = row[i];
    }
    item.payload = parseJsonSafe_(item.payload_json || "{}", {});
    return item;
  });
}

function doGet(e) {
  var action = ((e && e.parameter && e.parameter.action) || "").toLowerCase();
  var email = normalizeEmail_(e && e.parameter ? e.parameter.email : "");

  if (action === "analytics_export") {
    var payload = {
      ok: true,
      events: exportAnalytics_(e.parameter.limit)
    };
    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "practice_progress_get") {
    var latestPractice = getLatestProgressByEmail_(email, "practice_hub");
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: !!latestPractice,
        email: email,
        module: "practice_hub",
        progress: latestPractice ? parseJsonSafe_(latestPractice.progress_json, {}) : {},
        row: latestPractice
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "typing_progress_get") {
    var latestTyping = getLatestProgressByEmail_(email, "typing_course");
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: !!latestTyping,
        email: email,
        module: "typing_course",
        progress: latestTyping ? parseJsonSafe_(latestTyping.progress_json, {}) : {},
        row: latestTyping
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (!email) {
    return ContentService
      .createTextOutput("Script Working")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  var courses = getPurchasedCoursesByEmail_(email);
  var found = courses.length > 0;

  if (action === "check") {
    var payload2 = {
      found: found,
      email: email,
      courses: courses,
      course: courses.join(" | "),
      status: found ? "FOUND" : "NOT_FOUND"
    };
    return ContentService
      .createTextOutput(JSON.stringify(payload2))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (found) {
    return ContentService
      .createTextOutput("FOUND: " + courses.join(" | "))
      .setMimeType(ContentService.MimeType.TEXT);
  }

  return ContentService
    .createTextOutput("NOT_FOUND")
    .setMimeType(ContentService.MimeType.TEXT);
}
