# Wedding seating review

Live website: https://ericvav-collab.github.io/wedding-seating-chart/

This is a static GitHub Pages site. Updates to `main` publish to the same address. Visitors can compare options; their selections do not edit the shared guest list.

`seating-data.json` is the guest and meal source. Keep private contact details out of this repository. `model.js` contains the stated furniture assumptions and clearance checks. All three options use one fixed approximate 50 × 61-ft footprint, preserving the vendor outline. `layout-options.json` holds only this footprint. The supplied PDF has no surveyed wall lengths; keep the dimensions marked approximate.

Run `node scripts/check.cjs` to check guest totals, corrections, group capacities, head seats, and the saved geometry audits. Run `node scripts/review.cjs` after guest changes to refresh the downloadable review. Preview with a local HTTP server before publishing.

The full-venue schematic traces the vendor architecture (stage right, front lobby below). The rear entry is the main guest entrance, with three display tables and the welcome mirror. From an entering guest’s viewpoint: a round guest-book table with Eric/Meg photos is in the middle, the seating-chart/photos table is on the left, and the memory table is at the back right. The drawing keeps vendor orientation, so these left/right directions reverse on screen. Display inventory is two 6-ft tables and one round (4-ft diameter shown). Boba remains nearby on its cart. Walking routes pass around the central round. Doria, Alba and patio are available. `venue.js` holds cocktail furniture, stations and routes: 12 high tables, 10 low tables and 40 chairs. The trio is in Alba, the bar stays at its vendor location, and the photo booth uses the front-lobby fallback because the requested Monza corner conflicts with Table 1 or circulation. The kitchen opening, turning apron and service routes remain protected. Cake stays beside the stage.

September 8: 118 named guests, 13 guest groups plus the head table. Options A/B/C have compact U / longer-arm U / straight heads, with the same 7 rounds, 4 small guest rectangles and 2 joined guest rectangles. Guest rectangles use long-side seating. `node scripts/optimize.cjs` refines all three placements within the fixed footprint; pass an option only (for example `u`) to refine one. It rejects a room-size argument. Run the checks afterward. Do not resize the room to hide clashes.
