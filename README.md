# Renov8ers — Official Website (RENOV8ERS LLC, DBA Renov8ers)

Live: **https://renov8ers.github.io/**

Static 4-page business site for the user's actual LLC (registered NY, July 2026;
owned 50/50 by Aaron Sodaro and Ernesto Cordova):

- `index.html` — Home: hero, trust strip, services, before/after slider, 3-step process, service area, CTA
- `services.html` — Masonry & tile, kitchens & baths, siding & insulation, pavers & outdoor living
- `work.html` — Before/after slider + project gallery (all real crew photos, zero stock)
- `contact.html` — Call/text cards + estimate form that opens an SMS to (516) 986-8621 with the request pre-written
- `style.css`, `script.js` — shared design system (charcoal + construction amber, Archivo/Inter)
- `assets/` — 9 optimized project photos (siding before/after pair, pavers, fireplace, outdoor kitchen)

Honesty rules baked in: no fake reviews, no license-badge claims (jobs go to
licensed contractors — implied, never printed), no invented stats or address.

## Publishing

Site source lives here. The live site is published to the `renov8ers` GitHub org
repo `renov8ers.github.io` (GitHub Pages). Text files push via the GitHub
connector (`push-files`); the JPEG assets are binary and were uploaded through
the GitHub web UI (the connector's push path is UTF-8 only).

## Local preview

```bash
cd renov8ers-site && python3 -m http.server 8931
# open http://127.0.0.1:8931/
```
