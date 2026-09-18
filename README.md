# Loopi Device Inspection

Public website for Loopi Technologies Inc. device inspection reports.

## Structure

- `index.html` — Loopi landing page and report lookup
- `about.html` — company information and contact section
- `report.html` — shared report template for every device
- `data/reports.json` — report data source
- `assets/css/style.css` — responsive visual design
- `assets/js/report.js` — loads a report by URL parameter

Example report URL:

`report.html?id=R26-001`

The report data and photos will later be synced automatically from Google Sheets / Google Drive via Apps Script.
