# Website Audit Notes (April 9, 2026)

## Critical updates to do now

1. **Update expired offer messaging**
   - README still says: combo offer is free until **March 31, 2026**, which is now past.
   - Action: update public pricing/offer copy in website + docs so users are not confused.

2. **Replace placeholder social profile links**
   - `config.js` still points social links to generic homepages (LinkedIn/Instagram/Facebook root URLs).
   - Action: replace with your real brand profile URLs.

3. **Decide on Tableau and SQL launch state**
   - Both are marked **Coming Soon** in course cards and purchase options.
   - Action: either publish launch date/ETA or remove from buyer flow until ready.

## Important reliability/content updates

4. **Avoid hardcoded Apps Script fallback URL in `index.html`**
   - There is a default hardcoded `SHEET_WEBAPP_URL` fallback in the page script.
   - Action: keep one source of truth in `config.js` to prevent accidental mismatch between environments.

5. **Add release cadence to README checklist**
   - Existing checklist is good; add a dated "last verified" stamp and maintain a monthly release log.

## Status checks run

- `python3 scripts/check_website.py --verbose` => static references/config checks passed.
- Manual scan detected business/content freshness updates needed (offers, social links, launch state).

