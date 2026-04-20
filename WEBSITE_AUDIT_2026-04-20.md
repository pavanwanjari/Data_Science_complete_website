# Website Go-Live Audit (April 20, 2026)

## Overall status
- **Technical static readiness:** ✅ PASS (`python3 scripts/check_website.py --verbose`).
- **Go-live decision:** ⚠️ **Almost ready**, but a few business/content items should be updated before full production push.

## Fixes completed in this audit
1. Fixed broken internal links in `course_advance_excel.html`:
   - `python-course.html` → `course_python.html`
   - `sql-course.html` → `course_mysql.html`
   - `tableau-course.html` → `course_tableau.html`
2. Fixed missing enrollment target pages:
   - `course_mysql.html`: `enroll.html` → `index.html?add=SQL%20(MySQL)#buy-section`
   - `course_tableau.html`: `enroll.html` → `index.html?add=Tableau#buy-section`

## Must-update before going fully live
1. **Replace placeholder social profile links**
   - `config.js` still uses generic platform homepages for LinkedIn/Instagram/Facebook.
   - Update to your real brand profiles for trust and conversion.

2. **Confirm launch state for Coming Soon courses**
   - `Tableau` and `SQL (MySQL)` still show as Coming Soon in homepage cards and checkboxes.
   - Decide whether to:
     - keep hidden from buying flow until content is ready, or
     - publish expected launch date and waitlist CTA.

3. **Offer/copy freshness check**
   - Re-confirm all visible offer prices and any deadline-sensitive text (home page + README) before publishing ad campaigns.

## Recommended pre-launch checklist (final pass)
- Run static check:
  - `python3 scripts/check_website.py --verbose`
- Verify production values in `config.js`:
  - `SHEET_WEBAPP_URL`
  - `WHATSAPP_NUMBER`
  - `WHATSAPP_TEXT`
  - `SOCIAL_LINKS`
  - `AD_IMAGES`
- Test payment flow end-to-end:
  - Add to cart → complete payment → redirect success page → email verification in `check_email.html`
- Test cross-device access using same email (mobile + desktop).
- Validate analytics events in dashboard with UTM-tagged test links.

## Audit commands run
- `python3 scripts/check_website.py --verbose` (before fixes: failed, 5 broken refs)
- `python3 scripts/check_website.py --verbose` (after fixes: passed)
- `rg -n "Coming Soon|TODO|linkedin.com/\"|instagram.com/\"|facebook.com/\"" index.html config.js README.md`
