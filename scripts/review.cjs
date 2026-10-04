const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),M=require('../model.js'),V=require('../venue.js');
const data=JSON.parse(fs.readFileSync(path.join(root,'seating-data.json')));
const ctx=vm.createContext({SeatingModel:M,VenuePlan:V,document:{},console,inputData:data});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8').split('start().catch')[0],ctx);
vm.runInContext('DATA=inputData;',ctx);
const guests=data.groups.flatMap(t=>t.guests),meals=guests.reduce((a,g)=>(a[g.meal]=(a[g.meal]||0)+1,a),{});
const head=data.groups[0],six=M.options.fay.six;
const lines=[
'SEATING NOTES — ERIC & MEG',
'October 10, 2026 · The Milano',
'Final seating plan · updated '+data.updated,
'Website: https://ericvav-collab.github.io/wedding-seating-chart/',
'',
`${guests.length} guests: ${head.guests.length} at the head table; ${guests.length-head.guests.length} at ${data.groups.length-1} guest tables (13 60-inch rounds + Table 6, two 6-ft tables joined).`,
`Meals: ${meals.O} beef (O), ${meals.C} chicken (C), ${meals.V} vegetarian (V), ${meals.VG} vegan (VG), ${meals.S} couple's meals (S)${meals.K?`, ${meals.K} kids meal (K)`:''}.`,
'',
'LAYOUT — MILANO\u2019S SEP 25 FLOORPLAN',
`Head table: ${six} six-ft tables in a U (4 along the wall, 2 per arm), chairs on the outside only.`,
'Parents: Table 5 (Paul & Susan) and Table 9 (Noli & Nelia), closest to the head table.',
'Alba: bar on the far wall; boba cart at the front by the windows.',
'Front lobby: photo booth; jazz trio in the corner for cocktail hour.',
'Rear welcome lobby: guest-book table in the middle, seating-chart table on the left with the welcome mirror beside it, memory table at the back right.',
...Object.entries(V.counts).map(([id,c])=>`${V.rooms[id].name}: ${c.high} high + ${c.low} low cocktail tables; ${c.low*4} chairs.`),
''
];
lines.push('HEAD TABLE (seat numbers match the website drawing)');
{const f=M.fixed(M.ROOM_WIDTH,'fay'),ss=vm.runInContext(`headSeatPositions('fay',${f.wallX},${f.wallTop})`,ctx),sections=new Map();
 for(const s of ss){if(!sections.has(s.section))sections.set(s.section,[]);const g=head.guests[s.index];sections.get(s.section).push(` ${s.index+1}. ${g.name} (${g.meal})`);}
 for(const [title,seats]of sections)lines.push(title,...seats);}
lines.push('','GUEST TABLES','');
for(const t of data.groups.slice(1)){const long=M.kind(t.id,'fay')==='long';lines.push(`TABLE ${t.id.slice(1)} — ${t.guests.length} guests`,long?'Two 6-ft tables joined: seats 1 and 6 on the ends, 2-5 on one side, 7-10 on the other going around (7 faces 5, 8 faces 4, 9 faces 3, 10 faces 2).':'60-inch round',...t.guests.map((g,i)=>` ${i+1}. ${g.name} (${g.meal})`),'');}
fs.writeFileSync(path.join(root,'seating-review.txt'),lines.join('\n'));
console.log('Seating notes generated.');
