'use strict';
const M=SeatingModel, $=id=>document.getElementById(id), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MEALS={O:'Beef · Osso Bucco',C:'Chicken Wellington',V:'Vegetarian',VG:'Vegan','?':'Meal needed'};
let DATA,LAYOUTS,option='straight',width=54,selected='head',space=true;
const colors={eric:'#edf3ec',meg:'#f1ebe1',shared:'#e0e9de'};
const label=id=>id==='head'?'Head table':id.startsWith('t')?'Table '+id.slice(1):({'wall':'Wall','dance':'Dance floor','stage':'Stage','cake':'Cake','view-lane':'Central view corridor','head-back':'Head table','head-north':'North arm','head-south':'South arm','front-entry':'Front entry','rear-entry':'Rear entry',head:'Head table',service:'Stage-side door',patio:'Stage-side door'})[id]||id;
const group=id=>DATA.groups.find(g=>g.id===id);
const svgText=(x,y,t,size=1,anchor='middle',fill='#435b50',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" ${extra}>${esc(t)}</text>`;
function rect(x,y,w,h,fill,stroke='#9bac9e',extra=''){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width=".09" ${extra}/>`;}
function seat(x,y,angle,n,g,small=false,textRotation=0){
 const fill=g?'#e4e9e0':'#fff',dash=g?'':'stroke-dasharray=".15 .12"';
 return `<g transform="translate(${x} ${y}) rotate(${angle})"><rect x="-.8" y="-.85" width="1.6" height="1.7" rx=".22" fill="${fill}" stroke="#91a28f" stroke-width=".07" ${dash}/><path d="M-.68 -.62H.68" stroke="#526e57" stroke-width=".1"/></g>${small?'':svgText(x,y+.24,n,.64,'middle','#435b50',`transform="rotate(${-textRotation} ${x} ${y})"`)}`;
}
function florals(x,y,kind,scale=1){
 let out='';if(kind==='Taper trio'){out='<path d="M-.6 .6V-.5 M0 .6V-.9 M.6 .6V-.25" stroke="#a48455" stroke-width=".13"/><path d="M-.6 -.7v-.2 M0 -1.1v-.2 M.6 -.45v-.2" stroke="#b97937" stroke-width=".12"/>';}
 else if(kind==='To choose')out='<circle r=".6" fill="none" stroke="#b2a997" stroke-dasharray=".15 .12" stroke-width=".1"/>';
 else{out='<path d="M-1 .4Q0-.5 1 .2 M-.8-.4Q0 .6 .8-.5" fill="none" stroke="#82927b" stroke-width=".16"/>';for(const [cx,cy,r] of [[0,0,.4],[-.55,-.22,.27],[.5,.2,.28],[.25,-.5,.26]])out+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fbf4e8" stroke="#a1ae93" stroke-width=".07"/>`;}
 return `<g transform="translate(${x} ${y}) scale(${scale})">${out}</g>`;
}
function partySeats(t,kind){
 const n=t.guests.length;
 if(kind==='round')return Array.from({length:8},(_,i)=>{const a=i*Math.PI/4-Math.PI/2+Math.PI/8;return {x:3.6*Math.cos(a),y:3.6*Math.sin(a),angle:a*180/Math.PI+90,index:i};});
 if(t.id==='t6')return [{index:0,x:-7,y:0,angle:-90},{index:1,x:-4.5,y:-2.3,angle:0},{index:2,x:-1.5,y:-2.3,angle:0},{index:3,x:1.5,y:-2.3,angle:0},{index:4,x:4.5,y:-2.3,angle:0},{index:5,x:7,y:0,angle:90},{index:6,x:-4.5,y:2.3,angle:180},{index:7,x:-1.5,y:2.3,angle:180},{index:8,x:1.5,y:2.3,angle:180},{index:9,x:4.5,y:2.3,angle:180}];
 return Array.from({length:6},(_,i)=>({index:i,x:-2+(i%3)*2,y:i<3?-2.3:2.3,angle:i<3?0:180}));
}
function kindOf(t){return t.id==='t6'?'long':option==='mixed'&&M.mix.has(t.id)?'small':'round';}
function tableDrawing(t,x,y,rot=0,detail=false){
 const k=kindOf(t),angle=rot?90:0;
 let shape=k==='round'?`<circle class="surface" r="2.5" fill="${colors[t.side]}" stroke="${selected===t.id?'#355f48':'#9cac99'}" stroke-width="${selected===t.id?.16:.09}"/>`:rect(k==='long'?-6:-3,-1.25,k==='long'?12:6,2.5,colors[t.side],'#9cac99','class="surface"');
 if(k==='long')shape+='<path d="M0 -1.25V1.25" stroke="#98aa99" stroke-width=".1"/>';
 shape+=florals(0,k==='round'?0:0,t.flowers,k==='round'?.72:.55);
 if(!detail)shape+=svgText(0,k==='round'?1.75:.35,t.id==='t6'?'6 · A&M':t.id.slice(1),k==='round'?1.1:.8,'middle','#263b36','font-weight="650"');
 const chairs=partySeats(t,k).map(s=>seat(s.x,s.y,s.angle,s.index+1,t.guests[s.index],!detail,angle)).join('');
 return `<g class="table-click" data-table="${t.id}" tabindex="0" role="button" aria-label="${esc(label(t.id)+', '+t.label+', '+t.guests.length+' guests')}" transform="translate(${x} ${y}) rotate(${angle})"><title>${esc(label(t.id)+': '+t.guests.map(g=>g.name).join(', '))}</title>${chairs}${shape}</g>`;
}
function headSeatPositions(opt,wallX,top){
 const gs=group('head').guests,find=n=>gs.findIndex(g=>g.name===n),out=[];
 for(let i=0;i<12;i++)out.push({x:wallX+3.5,y:top+1+i*2,angle:90,index:i,section:'Facing the stage'});
 if(opt==='u'){
  [['Jason',1.5],['Haley',4],['PJ',8],['Anna',10.5]].forEach(([n,x])=>out.push({x:wallX-12+x,y:top-1,angle:0,index:find(n),section:'North arm · outer'}));
  [['Austin',5],['Talia',7.5]].forEach(([n,x])=>out.push({x:wallX-12+x,y:top+3.5,angle:180,index:find(n),section:'North arm · inner'}));
  [['Vivian',1.5],['Tony',4],['Lorraine',8],['Fortune',10.5]].forEach(([n,x])=>out.push({x:wallX-12+x,y:top+25,angle:180,index:find(n),section:'South arm · outer'}));
  [['Merielle (MM)',5],['James',7.5],['Oliver',10]].forEach(([n,x])=>out.push({x:wallX-12+x,y:top+20.5,angle:0,index:find(n),section:'South arm · inner'}));
 }else{
  for(let i=0;i<12;i++)out.push({x:wallX-1,y:top+1+i*2,angle:-90,index:12+i,section:i<6?'Opposite row · north':'Opposite row · south'});
  out.push({x:wallX+1.25,y:top+25,angle:180,index:24,section:'South end · next to James'});
 }
 return out;
}
function headTables(opt,x,y){let s='';for(let i=0;i<4;i++)s+=rect(x,y+i*6,2.5,6,'#e4ecdf','#94a589')+florals(x+1.25,y+3+i*6,'Garland',.7);
 if(opt==='u')for(let j=0;j<2;j++)for(let i=0;i<2;i++)s+=rect(x-12+i*6,y+j*21.5,6,2.5,'#e4ecdf','#94a589')+florals(x-9+i*6,y+1.25+j*21.5,'Garland',.6);return s;}
function headDrawing(opt,x,y,detail=false){
 const gs=group('head').guests,sp=headSeatPositions(opt,x,y);let s=headTables(opt,x,y);
 for(const p of sp){const g=gs[p.index];s+=seat(p.x,p.y,p.angle,p.index+1,g,!detail);if(detail){let nx=p.x,ny=p.y,anchor='middle';if(p.angle===90){nx+=1.5;ny+=.25;anchor='start';}else if(p.angle===-90){nx-=1.5;ny+=.25;anchor='end';}else if(p.angle===0){ny-=opt==='u'&&p.index%2===0?3.2:1.5;}else{ny+=opt==='u'&&p.index%2===0?3.5:1.9;}if(opt==='u'&&(p.angle===0||p.angle===180))s+=`<path d="M${p.x} ${p.y+(p.angle===0?-.95:.95)}V${ny+(p.angle===0?.3:-.9)}" stroke="#b3beb2" stroke-width=".07"/>`;let name=g.name==='Merielle (MM)'?'MM':g.name; s+=svgText(nx,ny,`${name} · ${g.meal}`,.83,anchor,'#334a40',g.id==='eric'||g.id==='meg'?'font-weight="700"':'');}}
 return s;
}
function footprint(shape,color='#aebbaa'){if(shape.type==='circle')return `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.r}" fill="none" stroke="${color}" stroke-width=".1" stroke-dasharray=".3 .3"/>`;return rect(shape.x,shape.y,shape.w,shape.h,'none',color,'stroke-dasharray=".3 .3"');}
function roomContent(mini=false){
 const f=M.fixed(width,option),D=f.D,extra=width*.11,p=LAYOUTS[option][width].positions;let s='';
 const poly=`0,0 ${width+extra},0 ${width+extra},${D*.14} ${width},${D*.14} ${width},${D*.88} ${width+extra},${D*.88} ${width+extra},${D} 0,${D}`;
 s+=`<polygon points="${poly}" fill="#fffdf8" stroke="#536b5d" stroke-width=".24"/>`;
 if(!mini){s+=svgText(width/2,-2.3,`TEST SIZE ${width} × ${D.toFixed(1)} FT · NOT MEASURED`,1.02,'middle','#697a6c');s+=svgText(width*.49,-.7,'ERIC’S / NORTH SIDE',.85,'middle','#64816a');s+=svgText(width*.7,D+1.8,'MEG’S / SOUTH SIDE',.85,'middle','#8d7a58');}
 // Front lobby entry is the upper entrance after rotating the vendor drawing 180 degrees.
 for(const y of [1.5,D-7.5])s+=`<path d="M${width+extra} ${y}v6" stroke="white" stroke-width=".5"/><path d="M${width+extra} ${y}h-2 M${width+extra} ${y+6}h-2" stroke="#5e7d69" stroke-width=".12"/>`;
 if(!mini){s+=svgText(width+extra+1.2,4,'Front lobby',.75,'start');s+=svgText(width+extra+1.2,5.2,'entry',.75,'start');s+=svgText(width+extra+1.2,D-4,'Rear lobby',.75,'start');s+=svgText(width+extra+1.2,D-2.8,'entry',.75,'start');}
 for(const b of [f.dance,f.lane])if(b.w>0)s+=rect(b.x,b.y,b.w,b.h,b.id==='dance'?'#eef2ef':'#edf4f7','#97adb0','stroke-dasharray=".35 .25"');
 s+=rect(f.stage.x,f.stage.y,f.stage.w,f.stage.h,'#e5dfd1','#a69f8b');
 s+=svgText(f.stage.w/2,f.cy-.4,'BAND',1.3)+svgText(f.stage.w/2,f.cy+1.2,'STAGE',1.1);
 s+=svgText(f.dance.x+6,f.cy-.2,'DANCE',1.05)+svgText(f.dance.x+6,f.cy+1.15,'12 × 18 ft',.82);
 if(f.lane.w>4&&!mini)s+=svgText(f.lane.x+f.lane.w/2,f.cy,'KEEP OPEN',.86);
 s+=`<circle cx="${f.cake.x}" cy="${f.cake.y}" r="${f.cake.r}" fill="#f7e6d7" stroke="#b79c7d" stroke-width=".1"/>`;
 s+=svgText(f.cake.x,f.cake.y+.27,'Cake',.64);
 const b=f.boba;s+=rect(b.x,b.y,b.w,b.h,'#e6ecdc','#889c77');s+=svgText(b.x+b.w/2,b.y+1.25,'Boba',.58);
 s+=headDrawing(option,width-8,f.cy-12,false);
 if(!mini)s+=svgText(width-6.75,f.cy,'HEAD · 25',.8,'middle','#3e5b44',`transform="rotate(-90 ${width-6.75} ${f.cy})"`);
 for(const [id,pos]of Object.entries(p)){
  if(space&&!mini)s+=footprint(M.shape(id,option,pos.x,pos.y,pos.rot));
  s+=tableDrawing(group(id),pos.x,pos.y,pos.rot);
 }
 if(space&&!mini)for(const h of f.headBlocks)s+=footprint(h,'#b3bda5');
 if(!mini){for(const door of f.doors)s+=rect(door.x,door.y,door.w,door.h,'none','#aab9be','stroke-dasharray=".25 .3"');
 s+=svgText(width-1.75,f.cy,'3.5-ft chair-back route',.7,'middle','#728070',`transform="rotate(-90 ${width-1.75} ${f.cy})"`);
 s+=svgText(width+extra/2,D*.54,'CORRIDOR / RESTROOM CORE',.83,'middle','#728070',`transform="rotate(-90 ${width+extra/2} ${D*.54})"`);
 s+=`<path d="M1 ${D+3}h6 M1 ${D+2.7}v.6 M7 ${D+2.7}v.6" fill="none" stroke="#71816e" stroke-width=".15"/>`+svgText(4,D+4.3,'6-ft reference',.74);
 }
 return s;
}
function roomSVG(){const D=width*M.ASPECT;return `<svg viewBox="-1 -5 ${width*1.11+12} ${D+11}" role="img" aria-label="${esc(M.options[option].short)}, hypothetical ${width}-foot-wide Monza room, with named table groups and chair clearances">${roomContent()}</svg>`;}
function venueSVG(){
 // Clean architecture trace in the vendor page's rendered coordinates.
 // Entire building turns 180 degrees; each label is counter-rotated to remain upright.
 const tx=(x,y,t,size=18,fill='#435b50')=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${fill}" transform="rotate(180 ${x} ${y})">${esc(t)}</text>`;
 const box=(x,y,w,h,fill='#f2f1eb')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#899b8c" stroke-width="2"/>`;
 let s=box(270,205,285,375)+box(270,705,285,440)+box(270,580,116,126,'#e7e7e1')+box(555,438,112,143,'#eeeee8')+box(555,581,112,102,'#eeeee8')+box(555,683,112,222,'#eeeee8')+box(667,438,83,467,'#fcfaf4')+box(750,438,150,467,'#e6e7df')+box(840,990,298,153,'#e7e7df')+box(1428,390,205,560,'#f3f0e7')+box(558,905,282,240,'#fcfaf4')+box(558,205,282,233,'#fcfaf4');
 s+=tx(410,430,'THE DORIA',24)+tx(410,395,'Room availability to confirm',15)+tx(405,820,'ALBA',25)+tx(405,785,'Not allocated for dinner',15)+tx(608,651,'BRIDAL',14)+tx(608,631,'SUITE',14)+tx(708,667,'CORRIDOR',12)+tx(825,667,'RESTROOMS',17)+tx(327,646,'Catering',14)+tx(987,1070,'CATERING PREP',18)+tx(1525,699,'PATIO',23)+tx(1525,655,'Weather-dependent',15);
 // Reception room inset uses the same geometry/orientation as the option diagram.
 s+=`<g transform="translate(1420 985) scale(${-520/width} ${-635/(width*M.ASPECT)})">${roomContent(true)}</g>`;
 // Venue circulation boundaries and clear openings.
 s+='<path d="M840 365v62 M840 914v62 M665 1145h74 M655 205h77 M556 1029v60 M556 250v62" stroke="#fffdf8" stroke-width="7"/>';
 s+=box(792,992,43,86,'#d6e4d6')+tx(813,1040,'BAR',14);
 s+=box(585,926,135,62,'#d9e7e9')+tx(651,963,'JAZZ TRIO',17)+tx(651,943,'proposed · cocktail hour',10);
 s+=box(645,269,128,65,'#ece4d6')+tx(709,308,'PHOTO BOOTH',14)+tx(709,287,'proposed',11);
 s+=tx(679,1095,'FRONT LOBBY',18)+tx(711,1130,'BUILDING ENTRANCE',14)+tx(700,356,'REAR LOBBY',18)+tx(701,225,'REAR BUILDING ENTRY',13);
 s+='<path d="M706 1140L754 1087L755 941L842 941L884 941" fill="none" stroke="#628a96" stroke-width="5" stroke-dasharray="9 6"/><path d="M884 941l-15-9v18z" fill="#628a96"/>';
 s+=tx(1268,326,'MONZA · RECEPTION',19);
 return `<svg viewBox="40 145 1450 1040" role="img" aria-label="Full Milano venue with Monza stage, cake, boba, front lobby bar and jazz trio, rear photo booth, Doria, Alba, patio, restrooms and catering"><g transform="translate(1700 1320) rotate(180)">${s}</g></svg>`;
}
function headSVG(){const x=option==='u'?30:24,y=8;
 let s=svgText(4,20,'STAGE',.9)+`<path d="M7 21H2l1-1 M2 21l1 1" stroke="#789089" stroke-width=".18" fill="none"/>`;
 s+=svgText(23,2.5,'NORTH / ERIC’S SIDE',.88)+svgText(23,38,'SOUTH / MEG’S SIDE',.88);
 s+=headDrawing(option,x,y,true);
 return `<svg viewBox="-1 0 49 41" role="img" aria-label="25 named head-table seats, meal codes, flowers and stage-facing direction">${s}</svg>`;
}
function badge(g){return `<span title="${esc(MEALS[g.meal])}" aria-label="${esc(MEALS[g.meal])}" class="badge ${g.meal==='?'?'unknown':g.meal==='VG'?'vegan':''}">${esc(g.meal==='?'?'TBD':g.meal)}</span>`;}
function headRoster(){const seats=headSeatPositions(option,0,0),parts=new Map();for(const s of seats){if(!parts.has(s.section))parts.set(s.section,[]);parts.get(s.section).push({...group('head').guests[s.index],seat:s.index+1});}return [...parts].map(([title,gs])=>`<div><h3>${esc(title)}</h3><ol>${gs.map(g=>`<li value="${g.seat}">${esc(g.name)} ${badge(g)}${g.id==='andrew-v'?' · Best man':g.id==='mabelle'?' · Maid of honor':''}</li>`).join('')}</ol></div>`).join('');}
function tableCard(t){const k=kindOf(t),kind=k==='round'?'Round · up to 8':k==='small'?'One 6-ft table · up to 6':'Two 6-ft tables · 10';return `<article class="table-card" id="card-${t.id}"><header><div><h3>${label(t.id)} · ${esc(t.label)}</h3><small>${esc(kind)}</small></div><span class="badge">${t.guests.length} guests</span></header><div class="body"><svg viewBox="${k==='long'?'-9 -5.5 18 11':'-5.5 -5.5 11 11'}" style="width:100%;max-height:210px" role="img" aria-label="${esc(label(t.id))} numbered seats and floral arrangement">${tableDrawing(t,0,0,LAYOUTS[option][width].positions[t.id].rot,true)}</svg><ul>${t.guests.map((g,i)=>`<li class="seatrow"><span><span class="num">${i+1}</span>${esc(g.name)}</span>${badge(g)}</li>`).join('')}</ul><p class="flower">Flowers: ${esc(t.flowers==='To choose'?'one additional arrangement to choose':t.flowers)}</p>${t.id==='t6'?'<p class="flower">Sam and Adelia sit together around the west corner. Danielle and Matt sit around the east corner.</p>':''}</div></article>`;}
function renderTables(){const query=$('search').value.trim().toLowerCase();$('guestTables').innerHTML=DATA.groups.filter(t=>t.id!=='head'&&(!query||[label(t.id),t.label,...t.guests.map(g=>g.name)].join(' ').toLowerCase().includes(query))).map(tableCard).join('');}
function summaryHTML(){const l=LAYOUTS[option][width],a=l.audit,tooTight=a.issues.filter(i=>!i.hard&&i.gap<1.5),o=M.options[option],r=option==='mixed'?7:13,guestSix=option==='mixed'?6:0;
 let status=a.hard?`<strong>${a.hard} clashes in this candidate.</strong> This placement does not work at the selected test size.`:`<strong>No footprint overlaps in this candidate.</strong> ${tooTight.length?tooTight.length+' areas have less than 1.5 ft between occupied spaces.':'The model still flags gaps below the 3-ft circulation target.'} This is not venue approval.`;
 const issues=a.issues.slice().sort((x,y)=>x.gap-y.gap).slice(0,8);
 let t=group(selected),roster=t?`<div class="selected-roster"><h3>${esc(label(t.id))} · ${t.guests.length} guests</h3><p>${esc(t.label)}</p><ul>${t.guests.map(g=>`<li>${esc(g.name)} · ${esc(MEALS[g.meal])}</li>`).join('')}</ul><p><a href="${t.id==='head'?'#head':'#card-'+t.id}">See seats &amp; flowers</a></p></div>`:'<p>Tap a table for names and meals.</p>';
 return `<span class="eyebrow">${option==='straight'?'First choice to measure':'Alternative for review'}</span><h3>${esc(o.name)}</h3><p>${esc(o.trade)}</p><dl><dt>Head-table seats</dt><dd>25</dd><dt>Head-table 6-footers</dt><dd>${o.six}</dd><dt>Guest rounds</dt><dd>${r}</dd><dt>Small group 6-footers</dt><dd>${guestSix}</dd><dt>A&amp;M 6-footers</dt><dd>2</dd><dt>Total 6-footers</dt><dd>${o.six+guestSix+2}</dd></dl><p class="caption">Cake uses a separate low table; boba is a cart. Their actual sizes need confirmation.</p><div class="status ${a.hard?'bad':''}">${status}</div><details><summary>Closest areas to check</summary><ol class="fit-list">${issues.map(i=>`<li>${esc(label(i.a))} / ${esc(label(i.b))}: ${i.gap<0?Math.abs(i.gap).toFixed(1)+'-ft overlap':i.gap.toFixed(1)+'-ft gap'}</li>`).join('')}</ol></details>${roster}`;
}
function render(){
 $('choices').innerHTML=Object.entries(M.options).map(([id,o])=>`<button type="button" class="choice ${id===option?'active':''}" data-option="${id}" aria-pressed="${id===option}"><span class="tag">${id==='straight'?'Suggested starting point':id==='u'?'Keeps the U':'Keeps each group separate'}</span><strong>${esc(o.name)}</strong><small>${id==='u'?'8 head-table sections · 13 guest rounds':id==='straight'?'4 head-table sections · 13 guest rounds':'4 head-table sections · 7 rounds + 6 small tables'}</small></button>`).join('');
 $('roomPlan').innerHTML=roomSVG();$('venuePlan').innerHTML=venueSVG();$('layoutSummary').innerHTML=summaryHTML();$('headPlan').innerHTML=headSVG();$('headRoster').innerHTML=headRoster();
 $('headTrade').textContent=option==='u'?'The outer wall row faces the stage. Arm seats face across the U and turn toward the band; seating both sides does not make every chair face the stage. Inner-arm place settings and corner access need checking.':'The wall-side row faces the stage. The opposite row faces Eric and Meg, and turns to watch the band. Oliver’s south-end seat keeps MM, James and Oliver together. No guest has been removed from the head table.';
 renderTables();
}
function zoom(which){const container={room:'roomPlan',venue:'venuePlan',head:'headPlan'}[which];$('zoomDrawing').innerHTML=$(container).innerHTML;$('zoomTitle').textContent={room:'Monza layout · '+M.options[option].short,venue:'Full venue · lobby & reception',head:'Head table · 25 named seats'}[which];$('zoomDialog').showModal();}
async function start(){
 const r=await Promise.all([fetch('seating-data.json',{cache:'no-store'}),fetch('layout-options.json',{cache:'no-store'})]);if(r.some(x=>!x.ok))throw Error('Could not load the seating plan');[DATA,LAYOUTS]=await Promise.all(r.map(x=>x.json()));
 const counts={O:0,C:0,V:0,VG:0,'?':0};for(const t of DATA.groups)for(const g of t.guests)counts[g.meal]++;
 $('stats').innerHTML=[[DATA.guests,'Guests in the plan'],[group('head').guests.length,'At the head table'],[DATA.groups.length-1,'Guest groups outside the head table'],[counts['?'],'Meal choices needed']].map(([n,l])=>`<div class="stat"><strong>${n}</strong><span>${l}</span></div>`).join('');
 $('updated').textContent='Updated '+DATA.updated+' · Shared review copy';
 $('mealCounts').innerHTML=Object.entries(counts).map(([m,n])=>`<div class="meal-chip ${m==='VG'?'vegan':''}"><b>${n}</b>${esc(MEALS[m])}</div>`).join('');
 $('unknownMeals').textContent=DATA.groups.flatMap(t=>t.guests).filter(g=>g.meal==='?').map(g=>g.name).join(' · ');
 $('flowerSummary').textContent='Floral proposal: 2 large arrangements for Tables 1 and 7, 4 compotes, 6 taper trios, garland for the head table and a runner for A&M. Table 14 needs one additional treatment. The same assignments follow the groups in every option; confirm the inventory with the florist.';
 render();
 $('roomWidth').addEventListener('change',e=>{width=+e.target.value;render();});$('showSpace').addEventListener('change',e=>{space=e.target.checked;render();});$('search').addEventListener('input',renderTables);$('print').addEventListener('click',()=>window.print());
 document.addEventListener('click',e=>{let c=e.target.closest('[data-option]');if(c){option=c.dataset.option;render();return;}c=e.target.closest('[data-zoom]');if(c){zoom(c.dataset.zoom);return;}c=e.target.closest('[data-table]');if(c){selected=c.dataset.table;$('layoutSummary').innerHTML=summaryHTML();}});
 document.addEventListener('keydown',e=>{const t=e.target.closest('[data-table]');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selected=t.dataset.table;$('layoutSummary').innerHTML=summaryHTML();}});
 $('closeZoom').addEventListener('click',()=>$('zoomDialog').close());
 window.SEATING_REVIEW={getData:()=>DATA,getState:()=>({option,width,selected}),model:M,layouts:LAYOUTS,headSeatPositions};
}
start().catch(e=>{$('stats').textContent='The seating data did not load. Please refresh the page.';console.error(e);});
