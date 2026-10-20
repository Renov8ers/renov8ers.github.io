# Renov8ers — Official Website (RENOV8ERS LLC, DBA Renov8ers)

Live: **https://renov8ers.github.io/**

Static site (GitHub Pages, $0 tooling) for RENOV8ERS LLC. ROI-first: every service shows
value boost %, estimated $ lift and value per dollar, from the same baseline table as the
STUMF Renov8ers engine (labelled estimates, never quotes).

- `index.html`: hero ROI card, offers ladder (free estimate, $50 walk-around flagship, the work), ROI explorer, before/after, crew, area, FAQ
- `services.html`: services with ROI badges, ROI table, bundles, payment planner (12/36/60 mo examples)
- `roi-check.html`: $50 walk-around landing page with sample 8-card ROI matrix and Stripe checkout
- `work.html`: before/after slider and gallery with lightbox (real crew photos only)
- `contact.html`: 4-step estimate questionnaire, posting to the engine (`engine-config.js`), with a one-tap text/email fallback
- `pay.html`: invoice lookup (`?inv=`) and Stripe pay link; `404.html`, `sitemap.xml`, `robots.txt`
- `assets/`: real photos (+ WebP), brand mark/icons, `og-banner.png` / `og-card.jpg` share images

Honesty rules baked in: no reviews or testimonials until real ones exist, no license claims, no invented stats,
no far-zone fee shown, crew phone numbers never shown.

## Local preview

```bash
python3 -m http.server 8931   # open http://127.0.0.1:8931/
```
