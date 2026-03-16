/**
 * DataLearn10X purchase API for Google Apps Script
 *
 * What it fixes:
 * - Returns purchased course mapping by email for cross-device access.
 * - Ensures only purchased courses are returned.
 * - Supports legacy plain-text responses and JSON response for `action=check`.
 */

var SPREADSHEET_ID = "1kDHBNgBhFpMums95elXHLxpkAfzRv7Gc45gLjjEdJLk";
var SHEET_NAME = "Sheet1";

function getSheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
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

function getPurchasedCoursesByEmail_(email) {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var target = normalizeEmail_(email);

  var unique = {};
  for (var i = 1; i < data.length; i++) {
    var rowEmail = normalizeEmail_(data[i][3]);
    if (rowEmail !== target) continue;

    var rowCourses = splitCourses_(data[i][5]); // course column
    for (var j = 0; j < rowCourses.length; j++) {
      unique[rowCourses[j]] = true;
    }
  }

  return Object.keys(unique);
}

function doPost(e) {
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

  return ContentService
    .createTextOutput("Success")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  var email = normalizeEmail_(e && e.parameter ? e.parameter.email : "");
  if (!email) {
    return ContentService
      .createTextOutput("Script Working")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  var courses = getPurchasedCoursesByEmail_(email);
  var found = courses.length > 0;

  // JSON mode expected by check_email.html (`?action=check&email=...`)
  if ((e.parameter.action || "").toLowerCase() === "check") {
    var payload = {
      found: found,
      email: email,
      courses: courses,
      course: courses.join(" | "),
      status: found ? "FOUND" : "NOT_FOUND"
    };
    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Legacy mode
  if (found) {
    return ContentService
      .createTextOutput("FOUND: " + courses.join(" | "))
      .setMimeType(ContentService.MimeType.TEXT);
  }

  return ContentService
    .createTextOutput("NOT_FOUND")
    .setMimeType(ContentService.MimeType.TEXT);
}
