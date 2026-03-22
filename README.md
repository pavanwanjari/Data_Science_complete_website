# Data Science

DataLearn10X training website with multi-course pages, payment flow, access verification, and analytics.

## Current offer pricing (synced with `index.html`)
- Advance Excel: MRP ₹999 | Offer ₹49
- Python: MRP ₹2000 | Offer ₹99
- Power BI: MRP ₹2500 | Offer ₹99
- Tableau: Coming Soon
- SQL (MySQL): Coming Soon
- Machine Learning + Deep Learning: MRP ₹3000 | Offer ₹99
- Data Analytics Cheat Sheets: currently shown as FREE in the buy section but disabled for standalone purchase
- 20000+ HR Emails: MRP ₹499 | Offer ₹19
- Data Analytics Combo (all courses + resources): Offer ₹199


## Course access behavior (important)
- **Same device/browser:** access is fast because recent purchases are cached in localStorage (`paidUsers`).
- **Any other device/browser:** access works via `check_email.html` by querying your Google Apps Script (`SHEET_WEBAPP_URL`) with the payment email.
- To support cross-device access reliably, ensure the Sheet/API response includes purchased course mapping (e.g. `course` / `courses`).
- If API returns only generic `FOUND` without course names, access cannot determine which links to show and verification will ask the learner to contact support.

## Website flow
1. User lands on `index.html`.
2. User selects one/multiple courses in cart or combo.
3. Payment is done via Razorpay.
4. Payment row is saved to Google Sheet via Apps Script `doPost` payload.
5. On success, user is redirected to `Excel_success_v3.html` with links.
6. Returning users verify via `check_email.html` (Google `doGet` with `email`).

## Apps Script compatibility
Frontend save now uses POST form fields matching provided Apps Script:
- `name, mobile, email, profession, course, total, discount, netpayment, payment_id, order_id, signature`

## Analytics files
- `analytics.js`
- `analytics_dashboard.html`
- `google_apps_script_template.gs` (now also stores/export shared analytics events)


## Analytics dashboard login
- Replace the default dashboard credential mapping in `analytics_dashboard.html` before going live.
- Do not keep plaintext hints or share access keys in repository docs.
- The dashboard now prefers remote analytics exported from the Apps Script (`?action=analytics_export`). If that endpoint is not deployed yet, it falls back to local browser-only data.
- To measure Facebook, Instagram, WhatsApp, Google, YouTube, and other campaign traffic correctly, add UTM parameters to ad URLs, for example: `?utm_source=facebook&utm_medium=paid_social&utm_campaign=summer_offer`, `?utm_source=instagram&utm_medium=paid_social&utm_campaign=reel_ad`, `?utm_source=whatsapp&utm_medium=shared_link&utm_campaign=promo_blast`, `?utm_source=google&utm_medium=cpc&utm_campaign=search_leads`, or `?utm_source=youtube&utm_medium=video&utm_campaign=shorts_launch`.


## After copying this website to a new repository
Update these values first so links and integrations work correctly:
- `config.js`
  - `SHEET_WEBAPP_URL`: your Google Apps Script Web App URL
  - `WHATSAPP_NUMBER`: your support number in international format (e.g. `91XXXXXXXXXX`)
  - `WHATSAPP_TEXT`: default WhatsApp prefilled message
  - `AD_IMAGES_BASE_URL`: your GitHub folder base URL (Raw), e.g. `https://raw.githubusercontent.com/<user>/<repo>/<branch>/ads`
  - `AD_IMAGES`: image file names from that folder OR full image URLs

Example with a GitHub folder:
```js
AD_IMAGES_BASE_URL: "https://raw.githubusercontent.com/your-user/your-repo/main/ads",
AD_IMAGES: ["ad1.jpg", "ad2.jpg", "ad3.jpg"]
```

All pages read these values automatically (`index.html` and `check_email.html`).



## Fix for cross-device course access by email
Your current Apps Script `doGet` only returns `FOUND`/`NOT_FOUND`, so website cannot know **which courses** to show on another device.

Use `google_apps_script_template.gs` as your new Apps Script code and redeploy as Web App. It returns purchased courses for an email in JSON when called like:
```
?action=check&email=user@example.com
```
Expected JSON response:
```json
{"found":true,"email":"user@example.com","courses":["Python","Power BI"],"course":"Python | Power BI","status":"FOUND"}
```

Deployment checklist:
1. Open your Apps Script project and replace `Code.gs` with `google_apps_script_template.gs`.
2. **Deploy > Manage deployments > Edit > New version > Deploy**.
3. Keep access set to anyone who has the web app link.
4. Confirm `config.js` -> `SHEET_WEBAPP_URL` is this latest deployed URL.
5. Test in browser: `YOUR_WEBAPP_URL?action=check&email=your-test-email@example.com`.

Result: `check_email.html` will show only courses purchased by that email (no extra course links).

## Shared analytics deployment
The updated `google_apps_script_template.gs` now supports two analytics endpoints in the same web app:
- `POST action=analytics_event` → stores page views, campaign attribution, source platform detection, click IDs, and funnel events into an `Analytics` sheet.
- `GET action=analytics_export&limit=10000` → returns recent analytics events as JSON for `analytics_dashboard.html`.

After redeploying the Apps Script Web App, the dashboard can finally show shared visit counts from Instagram ad clicks across devices/browsers instead of only the current browser's localStorage.

## Quick website health check
Run a static verification before publishing:
```bash
python3 scripts/check_website.py --verbose
```
This checks HTML local references and validates `config.js` keys and configured ad image files.

## Advertisement slider (image size + adding 5 ads)
- Slider display ratio is **16:5** (set in CSS as `aspect-ratio:16/5`), so use banners in the same ratio for best fit.
- Recommended ad image size: **1600 x 500 px** (or any 16:5 size such as 1280x400, 1920x600).
- Put ad images inside the `ads/` folder.
- Then update `config.js` -> `AD_IMAGES` with each file name.

Example for 5 ads:
```js
AD_IMAGES_BASE_URL: "ads",
AD_IMAGES: ["ad1.jpg", "ad2.jpg", "ad3.jpg", "ad4.jpg", "ad5.jpg"]
```

> Important: in the current static setup, ads are **not auto-discovered** from folder contents.
> You must list each file in `AD_IMAGES` for it to appear in the slider.
> The slider now auto-checks each configured file and skips broken/missing paths, so one wrong filename will not break the whole rotation.

### Quick sync after renaming ad files
If you rename/add/remove files inside `ads/`, run:
```bash
python3 scripts/sync_ads_config.py
```
This updates `config.js` -> `AD_IMAGES` to match current files in the folder.


## Repository + website update checklist
Use this checklist before pushing a new public release:

1. **Pricing consistency**
   - Keep offer prices aligned across `index.html` cards, buy cart, and this README.
2. **Config sanity**
   - Confirm `config.js` values (`SHEET_WEBAPP_URL`, WhatsApp details, ad images) are production-ready.
3. **Ads sync**
   - If files changed in `ads/`, run `python3 scripts/sync_ads_config.py`.
4. **Static integrity check**
   - Run `python3 scripts/check_website.py --verbose` and fix any broken links/references.
5. **Apps Script deployment**
   - If backend sheet logic changed, redeploy Apps Script and re-test `check_email.html`.
