# Real company logos (manual setup)

This project currently includes fallback placeholder SVG logos in `assets/logos/*.svg`.

To show **real logos**, add PNG files in this folder:

`assets/logos/real/`

Use these exact filenames:

- `tcs.png`
- `infosys.png`
- `wipro.png`
- `hcltech.png`
- `techmahindra.png`
- `reliance.png`
- `icici.png`
- `hdfc.png`
- `flipkart.png`
- `zomato.png`

Behavior on homepage:
- If `assets/logos/real/<name>.png` exists, that real logo is shown.
- If missing, the page automatically falls back to `assets/logos/<name>.svg`.

## Why manual setup is needed
In some deployment/dev environments, external logo hotlinks are blocked or unreliable.
Bundling logo files locally is the most stable approach.

## Recommendation
Use transparent PNGs around 320x90 (or similar ratio) for best fit in current cards.
