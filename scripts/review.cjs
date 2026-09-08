const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),M=require('../model.js'),V=require('../venue.js');
const d=JSON.parse(fs.readFileSync(path.join(root,'seating-data.json')));
const layouts=JSON.parse(fs.readFileSync(path.join(root,'layout-options.json')));
const ctx=vm.createContext({SeatingModel:M,VenuePlan:V,document:{},console,inputData:d});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8').split('start().catch')[0],ctx);
vm.runInContext('DATA=inputData;',ctx);
const lines=[
'RECEPTION SEATING REVIEW — MEIGHAN & ERIC — OCTOBER 10, 2026',
'Updated '+d.updated,
'Live review: https://ericvav-collab.github.io/wedding-seating-chart/',
'',
'118 guests: 25 at the head table; 93 in 13 guest groups.',
'Meg’s sheet says 116 because the head subtotal says 23. There are 25 names there.',
'Meals: 74 beef (O), 33 chicken (C), 3 vegetarian (V), 1 vegan (VG), 7 needed (?).',
'Joe and Diane Messina join Table 7. Gerry N., Letty and Mahmoud are unseated for now.',
'Jason and Haley have beef. Miranda is vegan. Quan is not attending.',
'Natalia and Stella have no reception seats. Coasters are maintained separately.',
'September 8 groups: Table 11 has 7; Table 13 has 6, including Joseph N. and Phung.',
'Table 10 is now Meg’s only long guest table. Eric’s long table is A&M at Table 6.',
'',
'VENDOR ORIENTATION — ALL VIEWS MATCH',
'Stage RIGHT; head table LEFT; front lobby BELOW; patio FAR RIGHT.',
'Eric’s groups are on the lower/front-lobby half. Meg’s are on the upper/rear-lobby half.',
'The building is no longer rotated relative to the vendor drawing.',
'',
'ROOM AND SERVICE',
'Keep the vendor outline as the baseline. The videos look consistent with about',
'seven rounds per side, but the chairs are close together and the centre is open.',
'The kitchen-to-Monza opening is on the lower wall, around the middle of the',
'catering-prep wall. Reserve the 6 x 8-ft apron, the 4-ft serving route along that',
'wall, and the 5-ft route behind the head table shown in blue.',
'The stage-attached dance floor and the centre of the U remain clear of guest tables.',
'Rear building entry is the MAIN entrance: three display tables and a welcome mirror.',
'Directions below are from a guest entering the building:',
'Middle: round guest-book table with photos of Eric and Meg, plus Polaroid supplies.',
'Left: 6-ft seating-chart table with photos of Eric and Meg (drawing right).',
'Back right: 6-ft memory table (lower-left corner of the vendor drawing).',
'The mirror greets arriving guests. Walking routes pass around the central round.',
'Boba stays near arrival on its separate cart, with its own queue.',
'Jazz trio: Alba. Bar: existing front-lobby position. Reception band: Monza stage.',
'Photo booth: front-lobby fallback near the bar, with separate queue space.',
'An assumed 8 x 8-ft booth in the requested Monza corner conflicts with Table 1.',
'Cake: unchanged beside the stage, on the lower/front-lobby side.',
'Doria, Alba and patio are available for cocktail hour.',
...Object.entries(V.counts).map(([id,c])=>`${V.rooms[id].name}: ${c.high} high + ${c.low} low cocktail tables; ${c.low*4} chairs.`),
'Cocktail total: 12 high, 10 low, 40 chairs. These are separate from dinner seating.',
'Display furniture: two 6-ft tables + one round table (4-ft diameter shown); welcome mirror.',
'Booth working area: 8 x 8 ft plus a 4 x 6-ft queue. Trio starting area: 10 x 8 ft.',
'Confirm supplier footprints and outdoor weather arrangements before setup.',
'',
'FURNITURE OPTIONS — SAME GUEST GROUPS',
'A: Compact U. Four 6-ft sections along the back and one per arm = 6 head sections.',
'   12 seats face the band, 11 are side-on, 2 end seats face away.',
'   One arm seats 6 and the other 7. Confirm the supports and corner place settings.',
'B: Longer-arm U. Four back sections and two per arm = 8 head sections.',
'   12 seats face the band, 13 are side-on. No head-table backs toward the band.',
'C: Straight double-sided. Four head sections. 12 face the band, 12 face away, 1 end seat.',
'Every option: 7 guest rounds (max 8), 4 single 6-ft guest tables,',
'and 2 joined guest tables (two sections each; no chairs at their ends).',
'Total dinner 6-ft sections: A 14; B 16; C 12. Display tables are additional.',
'Joined groups: A&M 10; Meg’s Table 10 has 10. Table 11 is a seven-person round.',
'Table positions are balanced around the head/dance area where space allows.',
'Meg keeps seven guest groups; Eric keeps six. Their groups are not combined for symmetry.',
'',
'SCALE AND REMAINING SPACING',
'No numerical scale is printed on the vendor PDF. The shape is about 520:635.',
'One fixed footprint: approximately 50 x 61 ft, preserving the vendor proportions.',
'No room-size selector. Photos inform the arrangement; wall lengths are approximate.',
'Rounds assume 60-inch tops and 2-ft chair space; banquet sections are 6 x 2.5 ft.',
'Guest rectangular-table chairs are only on the long sides, leaving table ends free.',
'The 3-ft gap target is between occupied spaces, not between tabletop edges.',
'At the 50-ft test, the compact U kitchen route is clear, but tight guest-table gaps',
'remain. A red warning means the candidate needs revision before setup.',
'Confirm actual wall lengths, furniture sizes, door swings and serving routes with Milano.',
''];
for(const opt of ['u','wide','mixed']){
 lines.push('HEAD SEATS — '+M.options[opt].name);
 const seats=vm.runInContext(`headSeatPositions('${opt}',7,15)`,ctx),sections=new Map();
 for(const seat of seats){if(!sections.has(seat.section))sections.set(seat.section,[]);const g=d.groups[0].guests[seat.index];sections.get(seat.section).push(` ${seat.index+1}. ${g.name} (${g.meal})`);}
 for(const [name,gs]of sections)lines.push(name,...gs);
 lines.push('');
}
lines.push('GUEST SEATS — EVERY OPTION');
for(const t of d.groups.slice(1)){
 const k=M.kind(t.id,'u');
 lines.push(`TABLE ${t.id.slice(1)} — ${t.label} — ${t.guests.length} guests`,
 k==='round'?'Round, up to 8':k==='small'?'One 6-ft table':'Two joined 6-ft tables',
 ...t.guests.map((g,i)=>` ${i+1}. ${g.name} (${g.meal})`),` Flowers: ${t.flowers}`,'');
}
lines.push('Joseph N. and Phung sit together at Table 13. Miko and Maynard are at nearby Table 11.',
'Sam and Adelia are side by side; Danielle and Matt are across from each other.',
'Floral proposal: 2 large (T1/T7), 4 compotes, 6 taper trios, head garland, A&M runner.',
'Meals needed: '+d.groups.flatMap(t=>t.guests).filter(g=>g.meal==='?').map(g=>g.name).join(', '),
'',
'Sources: vendor Floorplan.pdf, venue videos/photos dated October 17, 2025,',
'guest list 083026.csv for courses, and Meg’s revised groups plus Eric’s corrections.',
'');
fs.writeFileSync(path.join(root,'seating-review.txt'),lines.join('\n'));
console.log('Current review copy generated.');
