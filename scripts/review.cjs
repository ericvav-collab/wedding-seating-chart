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
`${guests.length} guests: ${data.groups[0].guests.length} at the head table; ${guests.length-data.groups[0].guests.length} at ${data.groups.length-1} guest tables (Meg's regrouped chart, Sep 20).`,
`Meals: ${meals.O} beef (O), ${meals.C} chicken (C), ${meals.V} vegetarian (V), ${meals.VG} vegan (VG), ${meals.S} special meals (S)${meals.K?`, ${meals.K} kids meal (K)`:''}${meals['?']?`, ${meals['?']} pending (?)`:' — all choices resolved'}.`,
'Eric and Meg: special meal (S).',
'Seat references use first names and distinguishing initials.',
'',
'VENUE ORIENTATION & SERVICE',
'Stage RIGHT; head table LEFT; rear main entrance ABOVE; front lobby BELOW; patio FAR RIGHT.',
'All options use one approximate 50 x 61-ft footprint following the vendor drawing.',
'Confirm usable dimensions, furniture sizes and door swings on site.',
'The dance floor attaches to the stage. Keep the centre free of guest tables.',
'Reserve the kitchen turning apron, the 4-ft serving route and the 5-ft route behind the head table.',
'SELECTED LAYOUT: Milano\u2019s Sep 25 floorplan (Fay). Exit 9:00 pm; everyone out 10:00 pm.',
'Boba moved OUT of Monza to the bar in the front lobby (decided with Fay, Sep 22).',
'',
'ARRIVAL & COCKTAIL HOUR',
'Rear welcome lobby: three tables and the welcome mirror.',
'From an entering guest’s viewpoint:',
'Middle: round guest-book table with photos of Eric and Meg and Polaroid supplies.',
'Left: 6-ft seating-chart table with photos; mirror 2 stands beside this table (station 1).',
'Back right: 6-ft memory table.',
'Display inventory: two 6-ft tables + one round (4-ft diameter shown) + freestanding mirror.',
'No drink cart in the welcome lobby.',
'Front entrance lobby: bar, boba cart, photo booth and jazz trio (cocktail hour). Reception band: Monza stage.',
'Cake: beside the stage on the lower/front-lobby side, on its own low table.',
...Object.entries(V.counts).map(([id,c])=>`${V.rooms[id].name}: ${c.high} high + ${c.low} low cocktail tables; ${c.low*4} chairs.`),
'Cocktail total: 12 high + 10 low tables + 40 chairs, additional to dinner seating.',
'Booth: 8 x 8-ft working area + 4 x 6-ft queue. Trio: 8 x 6-ft area. Both need power.',
'Confirm supplier footprints, power, sound and an indoor weather plan for patio furniture.',
'',
'LAYOUTS — ALL-ROUND GUEST TABLES PER MEG\u2019S SEP 20 CHART',
'(Table scale confirmed by Fay, Sep 9: 60-inch rounds + 6-ft rectangles.)',
'Every layout seats the same 14 guest tables: 13 rounds (max 8) + the',
'joined 12-ft A&M table of ten (Table 6). Only the head table changes.',
'SELECTED — MILANO PLAN (Sep 25): 8-table U head table (4 along the wall,',
'   2 per arm), chairs on the OUTSIDE only, so all 25 face the dance',
'   floor and band. Seven tables seat 3, one seats 4. Boba leaves Monza.',
'Earlier options, for reference only:',
'A: Compact U head (6 sections). FITS WITH ZERO OVERLAPS BUT VERY TIGHT:',
'   15 gaps under 1.5 ft; two tables essentially touch. Setup-crew hard.',
'B: Longer-arm U head (8 sections). DOES NOT FIT at true scale: 3',
'   furniture overlaps and a blocked service route in every optimizer',
'   run. Shown for completeness; not recommended.',
'C: Straight double-sided head (4 sections). BEST FIT: zero overlaps,',
'   0.5-ft minimum gap. 12 head seats face the band, 12 face away, 1 end.',
'D: Same compact U as A, but BOTH PARENTS\u2019 TABLES (1 and 7) sit in the',
'   keep-open lane, mirrored in front of the couple. Zero overlaps and',
'   the side bands breathe; the trade is one pinch point where Table 1',
'   passes the dance-floor edge (~0.5 ft in the model; the dance floor',
'   is not a wall, so confirm comfort on site).',
'Display furniture is additional to these quantities.',
'',
'SPACING REVIEW',
'The target is 3 ft between occupied chair spaces. Unresolved tight gaps need vendor review.'
];
for(const opt of Object.keys(M.options)){const a=layouts[opt][M.ROOM_WIDTH].audit;lines.push(`${M.options[opt].name}: ${a.hard} overlaps; ${a.tight} gaps below target; closest guest-table gap ${a.minGap.toFixed(2)} ft.`,a.routeClear?'Kitchen, entrance and boba working areas clear in the model.':'Revise conflicts in kitchen, entrance or boba working areas.');}
lines.push('','FLORIST REVIEW — PROPOSED QUANTITIES');
for(const kind of ['Large','Compote','Taper trio','Runner']){const ts=data.groups.slice(1).filter(t=>t.flowers===kind);lines.push(`${ts.length} x ${kind}: ${ts.map(t=>'Table '+t.id.slice(1)).join(', ')}.`);}
lines.push('Head garland: Milano plan = 8 six-foot tables, 48 ft of tabletop (front edge faces the dance floor).',
'Earlier options for comparison: A 36 ft, B 48 ft, C 24 ft; these are not garland order quantities.',
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
lines.push('GUEST SEATS — SAME GROUPS IN ALL THREE OPTIONS','');
for(const t of data.groups.slice(1)){const k=M.kind(t.id,'u');lines.push(`TABLE ${t.id.slice(1)} — ${t.guests.length} guests`,k==='round'?'60-inch round, up to 8':'Two joined 6-ft tables',...t.guests.map((g,i)=>` ${i+1}. ${g.name} (${g.meal})`),` Proposed flowers: ${t.flowers}`,'');}
lines.push('Preserve the displayed seat order.',
(guests.some(g=>g.meal==='?')?'Meal choices pending: '+guests.filter(g=>g.meal==='?').map(g=>g.name).join(', '):'Meal choices: all resolved (Sep 25, 2026 — Irma beef, Oliver kids meal).'),
'','REVIEW CHECKLIST',
'Coordinator: usable dimensions, all chairs, door swings, service routes, front-lobby power (bar, boba, booth, trio) and supplier needs.',
'Florist: quantities, styles, head coverage, runner coverage, sightlines, candles and additional display flowers.',
'Catering: final meal counts and pending choices.',
'Planning basis: vendor floor plan, supplied venue photos and current seating instructions.','');
fs.writeFileSync(path.join(root,'seating-review.txt'),lines.join('\n'));
console.log('Vendor review notes generated.');
