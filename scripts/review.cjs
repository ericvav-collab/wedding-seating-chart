const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),M=require('../model.js'),V=require('../venue.js');
const data=JSON.parse(fs.readFileSync(path.join(root,'seating-data.json')));
const layouts=JSON.parse(fs.readFileSync(path.join(root,'layout-options.json')));
const ctx=vm.createContext({SeatingModel:M,VenuePlan:V,document:{},console,inputData:data});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8').split('start().catch')[0],ctx);
vm.runInContext('DATA=inputData;',ctx);
const guests=data.groups.flatMap(t=>t.guests),meals=guests.reduce((a,g)=>(a[g.meal]=(a[g.meal]||0)+1,a),{});
const lines=[
'COORDINATOR & FLORIST REVIEW — ERIC & MEG',
'October 10, 2026 · The Milano',
'Revised '+data.updated+' · Proposals pending vendor confirmation',
'Review website: https://ericvav-collab.github.io/wedding-seating-chart/',
'',
`${guests.length} guests: ${data.groups[0].guests.length} at the head table; ${guests.length-data.groups[0].guests.length} at 13 guest tables.`,
`Meals: ${meals.O} beef (O), ${meals.C} chicken (C), ${meals.V} vegetarian (V), ${meals.VG} vegan (VG), ${meals.S} special meals (S), ${meals['?']} pending (?).`,
'Eric and Meg: special meal (S).',
'Seat references use first names and distinguishing initials.',
'',
'VENUE ORIENTATION & SERVICE',
'Stage RIGHT; head table LEFT; rear main entrance ABOVE; front lobby BELOW; patio FAR RIGHT.',
'All options use one approximate 50 x 61-ft footprint following the vendor drawing.',
'Confirm usable dimensions, furniture sizes and door swings on site.',
'The dance floor attaches to the stage. Keep the centre free of guest tables.',
'Reserve the kitchen turning apron, the 4-ft serving route and the 5-ft route behind the head table.',
'Boba is INSIDE MONZA near the rear-lobby entry: 6 x 2.5-ft cart, 2.5-ft staff depth,',
'and a separate 3.5-ft-deep queue. Keep both access and service space clear.',
'',
'ARRIVAL & COCKTAIL HOUR',
'Rear welcome lobby: three tables and the welcome mirror.',
'From an entering guest’s viewpoint:',
'Middle: round guest-book table with photos of Eric and Meg and Polaroid supplies.',
'Left: 6-ft seating-chart table with photos; mirror 2 stands beside this table (station 1).',
'Back right: 6-ft memory table.',
'Display inventory: two 6-ft tables + one round (4-ft diameter shown) + freestanding mirror.',
'Boba is in Monza; no drink cart is placed in the welcome lobby.',
'Jazz trio: Alba. Bar and photo booth: front lobby. Reception band: Monza stage.',
'Cake: beside the stage on the lower/front-lobby side, on its own low table.',
...Object.entries(V.counts).map(([id,c])=>`${V.rooms[id].name}: ${c.high} high + ${c.low} low cocktail tables; ${c.low*4} chairs.`),
'Cocktail total: 12 high + 10 low tables + 40 chairs, additional to dinner seating.',
'Booth: 8 x 8-ft working area + 4 x 6-ft queue. Trio: initial 10 x 8-ft working area.',
'Confirm supplier footprints, power, sound and an indoor weather plan for patio furniture.',
'',
'ROUND-TABLE PROPOSAL D — REGROUPING REQUIRED',
'Diagram: https://ericvav-collab.github.io/wedding-seating-chart/round-table-proposal.svg',
'Ten 60-inch rounds: five per side. Two long guest tables: one per side, each 2 x 6-ft sections.',
'Straight double-sided head for 25: four 6-ft sections. Total dinner 6-ft sections: eight.',
'Eric’s 33 round-table guests stay in five groups. Meg’s 40 need five groups of eight.',
'E1-E5 map to current Tables 1-5; M1-M5 are proposed positions with assignments pending.',
'The two ten-person long-table groups stay together. No guest names have been reassigned.',
'Boba rotates along the rear Monza wall inside the lobby entry; staff and queue space reserved.',
'Closest model gaps: 1.74 ft between guest tables and 1.52 ft at the head table, below the 3-ft target.',
'Vendor review and agreement on regrouping are required before this proposal is used.',
'',
'CURRENT RECEPTION FURNITURE OPTIONS',
'Every option has 7 guest rounds, 4 single 6-ft guest tables and 2 joined 12-ft guest tables.',
'Rounds seat up to 8. Rectangular guest tables use long-side seating.',
'Tables 6 and 10 each seat 10 at two joined 6-ft sections.',
'A: Compact U, 6 head sections (4 back + 1 per arm); 14 total dinner 6-ft sections.',
'   12 head seats face the band, 11 side-on, 2 end seats face away.',
'B: Longer U, 8 head sections (4 back + 2 per arm); 16 total dinner 6-ft sections.',
'   12 head seats face the band, 13 side-on.',
'C: Straight double-sided, 4 head sections; 12 total dinner 6-ft sections.',
'   12 head seats face the band, 12 face away, 1 end seat.',
'Display furniture is additional to these quantities.',
'',
'SPACING REVIEW',
'The target is 3 ft between occupied chair spaces. Unresolved tight gaps need vendor review.'
];
for(const opt of Object.keys(M.options)){const a=layouts[opt][M.ROOM_WIDTH].audit;lines.push(`${M.options[opt].name}: ${a.hard} overlaps; ${a.tight} gaps below target; closest guest-table gap ${a.minGap.toFixed(2)} ft.`,a.routeClear?'Kitchen, entrance and boba working areas clear in the model.':'Revise conflicts in kitchen, entrance or boba working areas.');}
lines.push('','FLORIST REVIEW — PROPOSED QUANTITIES');
for(const kind of ['Large','Compote','Taper trio','Runner']){const ts=data.groups.slice(1).filter(t=>t.flowers===kind);lines.push(`${ts.length} x ${kind}: ${ts.map(t=>'Table '+t.id.slice(1)).join(', ')}.`);}
lines.push('Head garland: specify coverage after selection of the head-table option.',
'Head-table surface length: A 36 ft, B 48 ft, C 24 ft; these are not garland order quantities.',
'Table 6 runner: confirm coverage across the 12-ft surface.',
'Confirm arrangement scale, sightlines, candle policy and any additional entrance/cake flowers.',
'Additional display arrangements are not included in the guest-table counts.','');
for(const opt of Object.keys(M.options)){
 lines.push('HEAD SEATS — '+M.options[opt].name);
 const f=M.fixed(M.ROOM_WIDTH,opt),ss=vm.runInContext(`headSeatPositions('${opt}',${f.wallX},${f.wallTop})`,ctx),sections=new Map();
 for(const s of ss){if(!sections.has(s.section))sections.set(s.section,[]);const g=data.groups[0].guests[s.index];sections.get(s.section).push(` ${s.index+1}. ${g.name} (${g.meal})`);}
 for(const [title,seats]of sections)lines.push(title,...seats);
 lines.push('');
}
lines.push('GUEST SEATS — ALL OPTIONS');
for(const t of data.groups.slice(1)){const k=M.kind(t.id,'u');lines.push(`TABLE ${t.id.slice(1)} — ${t.guests.length} guests`,k==='round'?'Round, up to 8':k==='small'?'One 6-ft table':'Two joined 6-ft tables',...t.guests.map((g,i)=>` ${i+1}. ${g.name} (${g.meal})`),` Proposed flowers: ${t.flowers}`,'');}
lines.push('Preserve the displayed seat order. Keep Tables 11 and 13 nearby.',
'Meal choices pending: '+guests.filter(g=>g.meal==='?').map(g=>g.name).join(', '),
'','REVIEW CHECKLIST',
'Coordinator: selected option, usable dimensions, all chairs, door swings, service routes, boba operations and supplier needs.',
'Florist: quantities, styles, head coverage, runner coverage, sightlines, candles and additional display flowers.',
'Catering: final meal counts and pending choices.',
'Planning basis: vendor floor plan, supplied venue photos and current seating instructions.','');
fs.writeFileSync(path.join(root,'seating-review.txt'),lines.join('\n'));
console.log('Vendor review notes generated.');
