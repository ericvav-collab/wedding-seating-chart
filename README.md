# Wedding seating review

Live website: https://ericvav-collab.github.io/wedding-seating-chart/

This is a static GitHub Pages site. Updates to `main` publish to the same address. Visitors can compare options; their selections do not edit the shared guest list.

`seating-data.json` is the guest and meal source. Keep private contact details out of this repository. `model.js` contains the stated furniture assumptions and clearance checks. `layout-options.json` contains candidate positions for three options at six hypothetical room sizes. There are no surveyed venue dimensions in the supplied PDF; do not relabel a test size as measured.

Run `node scripts/check.cjs` to check guest totals, corrections, group capacities, head seats, and the saved geometry audits. Run `node scripts/review.cjs` after guest changes to refresh the downloadable review. Preview with a local HTTP server before publishing.

The full-venue schematic traces architecture from the vendor reference, rotated 180 degrees to keep the stage left. Bar position comes from that reference; jazz trio, boba, and photo booth are proposed placements. The old furniture and scheduling notes have been removed.
