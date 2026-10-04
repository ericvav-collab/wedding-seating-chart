# Eric & Meg seating plan

Live website: https://ericvav-collab.github.io/wedding-seating-chart/

Static GitHub Pages site; pushing to `main` publishes it.

- `seating-data.json` — tables, seat order, meal codes and flowers. First names and initials only; keep contact details and private notes out of this repository.
- `model.js`, `layout-options.json` — room footprint and table geometry. The site shows Milano's Sep 25 floorplan (`fay`); the earlier layout options remain in the model only for the checks.
- `venue.js` — full-venue drawing: cocktail tables, stations, walking routes.
- `countdown.html` — final countdown checklist.

Run `node scripts/check.cjs` after any change (guest totals, meals, seat requests, geometry). Run `node scripts/review.cjs` after seating changes to regenerate `seating-review.txt`, the plain-text notes linked from the site.
