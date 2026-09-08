'use strict';
const M=SeatingModel, $=id=>document.getElementById(id), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MEALS={O:'Beef · Osso Bucco',C:'Chicken Wellington',V:'Vegetarian',VG:'Vegan',S:'Special meal submitted','?':'Meal pending'};
const width=M.ROOM_WIDTH;
let DATA,LAYOUTS,option='u',selected='head',space=true,venueView='all';
const colors={eric:'#edf3ec',meg:'#f1ebe1',shared:'#e0e9de'};
const label=id=>id==='head'?'Head table':/^t\d+$/.test(id)?'Table '+id.slice(1):({'wall':'Wall','dance':'Dance floor','stage':'Stage','cake':'Cake','view-lane':'Open centre','head-back':'Head table','head-rear':'Rear-lobby arm','head-front':'Front-lobby arm','front-entry':'Front lobby entry','rear-entry':'Rear lobby entry','catering-apron':'Kitchen door apron','service-lane':'Catering route','wall-route':'Route behind head table','patio-front':'Patio approach','patio-rear':'Patio approach','boba-working':'Boba working area'})[id]||id;
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
 if(kind==='round')return Array.from({length:8},(_,i)=>{const a=i*Math.PI/4-Math.PI/2+Math.PI/8;return {x:3.6*Math.cos(a),y:3.6*Math.sin(a),angle:a*180/Math.PI+90,index:i};});
 if(kind==='small'&&t.guests.length===4)return [0,1,2,3].map(i=>({index:i,x:i%2?-1.5:1.5,y:i<2?-2.3:2.3,angle:i<2?0:180}));
 const n=kind==='long'?5:3,spacing=kind==='long'?2.4:2;
 return Array.from({length:n*2},(_,i)=>({index:i,x:((i%n)-(n-1)/2)*spacing,y:i<n?-2.3:2.3,angle:i<n?0:180}));
}
function kindOf(t){return M.kind(t.id,option);}
function tableDrawing(t,x,y,rot=0,detail=false){
 const k=kindOf(t),angle=rot?90:0;
 let shape=k==='round'?`<circle class="surface" r="2.5" fill="${colors[t.side]}" stroke="${selected===t.id?'#355f48':'#9cac99'}" stroke-width="${selected===t.id?.16:.09}"/>`:rect(k==='long'?-6:-3,-1.25,k==='long'?12:6,2.5,colors[t.side],'#9cac99','class="surface"');
 if(k==='long')shape+='<path d="M0 -1.25V1.25" stroke="#98aa99" stroke-width=".1"/>';
 shape+=florals(0,k==='round'?0:0,t.flowers,k==='round'?.72:.55);
 if(!detail)shape+=svgText(0,k==='round'?1.75:.35,t.id.slice(1),k==='round'?1.1:.8,'middle','#263b36',`font-weight="650" transform="rotate(${-angle} 0 ${k==='round'?1.75:.35})"`);
 const chairs=partySeats(t,k).map(s=>seat(s.x,s.y,s.angle,s.index+1,t.guests[s.index],!detail,angle)).join('');
 return `<g class="table-click" data-table="${t.id}" tabindex="0" role="button" aria-label="${esc(label(t.id)+', '+t.label+', '+t.guests.length+' guests')}" transform="translate(${x} ${y}) rotate(${angle})"><title>${esc(label(t.id)+': '+t.guests.map(g=>g.name).join(', '))}</title>${chairs}${shape}</g>`;
}
function headSeatPositions(opt,wallX,top){
 const gs=group('head').guests,find=n=>gs.findIndex(g=>g.name===n),out=[];
 for(let i=0;i<12;i++)out.push({x:wallX-1,y:top+23-i*2,angle:-90,index:i,section:'Wall row · faces the band'});
 if(opt==='u'){
  const add=(name,x,y,angle,section)=>out.push({x:wallX+x,y:top+y,angle,index:find(name),section});
  [['Austin',3.5],['Talia',5.5],['Haley',7.5]].forEach(([n,x])=>add(n,x,25,180,'Front-lobby arm · Eric · outer'));
  [['PJ',3.5],['Anna',5.5]].forEach(([n,x])=>add(n,x,20.5,0,'Front-lobby arm · Eric · inner'));
  add('Jason',9.5,22.75,90,'Front-lobby end · beside Haley');
  [['Vivian',3.5],['Tony',5.5],['Lorraine',7.5]].forEach(([n,x])=>add(n,x,-1,0,'Rear-lobby arm · Meg · outer'));
  [['Merielle (MM)',3.5],['James',5.5],['Oliver',7.5]].forEach(([n,x])=>add(n,x,3.5,180,'Rear-lobby arm · Meg · inner'));
  add('Fortune',9.5,1.25,90,'Rear-lobby end · beside Lorraine');
 }else if(M.usesU(opt)){
  [['Jason',10.5],['Haley',8],['PJ',4],['Anna',1.5]].forEach(([n,x])=>out.push({x:wallX+2.5+x,y:top+25,angle:180,index:find(n),section:'Front-lobby arm · Eric · outer'}));
  [['Austin',7],['Talia',4.5]].forEach(([n,x])=>out.push({x:wallX+2.5+x,y:top+20.5,angle:0,index:find(n),section:'Front-lobby arm · Eric · inner'}));
  [['Vivian',10.5],['Tony',8],['Lorraine',4],['Fortune',1.5]].forEach(([n,x])=>out.push({x:wallX+2.5+x,y:top-1,angle:0,index:find(n),section:'Rear-lobby arm · Meg · outer'}));
  [['Merielle (MM)',7],['James',4.5],['Oliver',2]].forEach(([n,x])=>out.push({x:wallX+2.5+x,y:top+3.5,angle:180,index:find(n),section:'Rear-lobby arm · Meg · inner'}));
 }else{
  for(let i=0;i<12;i++)out.push({x:wallX+3.5,y:top+23-i*2,angle:90,index:12+i,section:i<6?'Opposite row · Eric / front lobby':'Opposite row · Meg / rear lobby'});
  out.push({x:wallX+1.25,y:top-1,angle:0,index:24,section:'Rear-lobby end · Oliver beside James'});
 }
 return out;
}
function headTables(opt,x,y){let s='';for(let i=0;i<4;i++)s+=rect(x,y+i*6,2.5,6,'#e4ecdf','#94a589')+florals(x+1.25,y+3+i*6,'Garland',.7);
 if(M.usesU(opt))for(let j=0;j<2;j++)for(let i=0;i<(opt==='u'?1:2);i++)s+=rect(x+2.5+i*6,y+j*21.5,6,2.5,'#e4ecdf','#94a589')+florals(x+5.5+i*6,y+1.25+j*21.5,'Garland',.6);return s;}
function headDrawing(opt,x,y,detail=false){
 const gs=group('head').guests,sp=headSeatPositions(opt,x,y);let s=headTables(opt,x,y);
 for(const p of sp){const g=gs[p.index];s+=seat(p.x,p.y,p.angle,p.index+1,g,!detail);if(detail){let nx=p.x,ny=p.y,anchor='middle';const far=opt==='u'?Math.round((p.x-x-3.5)/2)%2===0:p.index%2===0;if(p.angle===90){nx+=1.5;ny+=.25;anchor='start';}else if(p.angle===-90){nx-=1.5;ny+=.25;anchor='end';}else if(p.angle===0){ny-=M.usesU(opt)&&far?3.2:1.5;}else{ny+=M.usesU(opt)&&far?3.5:1.9;}if(M.usesU(opt)&&(p.angle===0||p.angle===180))s+=`<path d="M${p.x} ${p.y+(p.angle===0?-.95:.95)}V${ny+(p.angle===0?.3:-.9)}" stroke="#b3beb2" stroke-width=".07"/>`;if(opt==='u'&&p.index===18)anchor='end';if(opt==='u'&&p.index===20)anchor='start';let name=g.name==='Merielle (MM)'?'MM':g.name;s+=svgText(nx,ny,`${name} · ${g.meal}`,.83,anchor,'#334a40',g.id==='eric'||g.id==='meg'?'font-weight="700"':'');}}
 return s;
}
function footprint(shape,color='#aebbaa'){if(shape.type==='circle')return `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.r}" fill="none" stroke="${color}" stroke-width=".1" stroke-dasharray=".3 .3"/>`;return rect(shape.x,shape.y,shape.w,shape.h,'none',color,'stroke-dasharray=".3 .3"');}
function roomContent(mini=false){
 const f=M.fixed(width,option),D=f.D,e=f.extra,p=LAYOUTS[option][width].positions;
 let s=`<polygon points="${-e},0 ${width},0 ${width},${D} ${-e},${D} ${-e},${D*.88} 0,${D*.88} 0,${D*.14} ${-e},${D*.14}" fill="#fffdf8" stroke="#536b5d" stroke-width=".24"/>`;
 for(const area of [f.wallRoute,f.serviceLane,f.catering])s+=rect(area.x,area.y,area.w,area.h,'#e5f0f3','#95b7bf','stroke-dasharray=".25 .25"');
 s+=rect(f.bobaService.x,f.bobaService.y,f.bobaService.w,f.bobaService.h,'#e5f0f3','#95b7bf','stroke-dasharray=".25 .25"')+svgText(f.bobaService.x+3,f.bobaService.y+1.5,'STAFF',.6);
 s+=rect(f.bobaQueue.x,f.bobaQueue.y,f.bobaQueue.w,f.bobaQueue.h,'#f8eedc','#b79861','stroke-dasharray=".25 .25"')+svgText(f.bobaQueue.x+3,f.bobaQueue.y+1.9,'BOBA QUEUE',.58);
 if(!mini)s+=rect(f.boba.x,f.boba.y,f.boba.w,f.boba.h,'#e3e9dc','#899b8c')+svgText(f.boba.x+3,f.boba.y+1.5,'BOBA · 5',.72);
 if(!mini){s+=svgText(width/2,-3.3,`WORKING SIZE ${width} × ${D.toFixed(1)} FT`,1,'middle','#697a6c');s+=svgText(width/2,-1.4,'VENDOR ORIENTATION · MEG / REAR-LOBBY SIDE',.85);s+=svgText(width*.66,D+1.8,'ERIC / FRONT-LOBBY SIDE',.85);}
 for(const y of [1.5,D-7.5])s+=`<path d="M${-e} ${y}v6" stroke="white" stroke-width=".5"/><path d="M${-e} ${y}h2 M${-e} ${y+6}h2" stroke="#5e7d69" stroke-width=".12"/>`;
 if(!mini){s+=svgText(-e-1,4,'Rear lobby',.8,'end');s+=svgText(-e-1,5.4,'entry',.8,'end');s+=svgText(-e-1,D-5,'Front lobby',.8,'end');s+=svgText(-e-1,D-3.6,'entry',.8,'end');}
 for(const b of [f.dance,f.lane])if(b.w>0)s+=rect(b.x,b.y,b.w,b.h,b.id==='dance'?'#f2eee5':'#edf4f7','#aeb7ad','stroke-dasharray=".35 .25"');
 s+=rect(f.stage.x,f.stage.y,f.stage.w,f.stage.h,'#e5dfd1','#a69f8b')+svgText(f.stage.x+f.stage.w/2,f.cy-.4,'BAND',1.25)+svgText(f.stage.x+f.stage.w/2,f.cy+1.2,'STAGE',1.1);
 s+=svgText(f.dance.x+6,f.cy-.2,'DANCE',1.05)+svgText(f.dance.x+6,f.cy+1.15,'12 × 18 ft',.82);
 if(f.lane.w>4&&!mini)s+=svgText(f.lane.x+f.lane.w/2,f.cy,'KEEP OPEN',.78);
 s+=`<circle cx="${f.cake.x}" cy="${f.cake.y}" r="${f.cake.r}" fill="#f7e6d7" stroke="#b79c7d" stroke-width=".1"/>`+svgText(f.cake.x,f.cake.y+.27,'Cake',.64);
 s+=headDrawing(option,f.wallX,f.wallTop,false);
 if(!mini)s+=svgText(f.wallX+1.25,f.cy,'HEAD · 25',.8,'middle','#3e5b44',`transform="rotate(-90 ${f.wallX+1.25} ${f.cy})"`);
 for(const [id,pos]of Object.entries(p)){if(space&&!mini)s+=footprint(M.shape(id,option,pos.x,pos.y,pos.rot));s+=tableDrawing(group(id),pos.x,pos.y,pos.rot);}
 if(space&&!mini)for(const h of f.headBlocks)s+=footprint(h,'#b3bda5');
 const doorWidth=width*40/520;s+=`<path d="M${f.kitchenX-doorWidth/2} ${D}h${doorWidth}" stroke="#fff" stroke-width=".5"/>`;
 s+=`<path d="M${f.kitchenX} ${D+1}V${D-2}H2.5V${D*.22}" fill="none" stroke="#5b8998" stroke-width="${mini?.2:.15}" stroke-dasharray=".4 .35"/>`;
 if(!mini){s+=svgText(f.kitchenX,D+3,'KITCHEN / CATERING',.85);s+=svgText(2.6,f.cy,'5-ft route behind chairs',.76,'middle','#476e80',`transform="rotate(-90 2.6 ${f.cy})"`);s+=svgText(10,D-1.1,'4-ft serving route',.72,'middle','#476e80');s+=svgText(8,D+5.7,'Bar + photo booth · front lobby',.7);s+=`<path d="M${width-8} ${D+5}h6 M${width-8} ${D+4.7}v.6 M${width-2} ${D+4.7}v.6" stroke="#71816e" stroke-width=".15"/>`+svgText(width-5,D+6.3,'6-ft reference',.7);}
 return s;
}
function roomSVG(){const f=M.fixed(width,option);return `<svg viewBox="${-f.extra-11} -6 ${width+f.extra+14} ${f.D+14}" role="img" aria-label="${esc(M.options[option].short)} in vendor orientation: stage right, head left, kitchen route at bottom">${roomContent()}</svg>`;}
function cocktailDrawing(t){
 const low=t.kind==='low',r=(low?1.5:1.25)*VenuePlan.scale,occupied=(low?3.5:3)*VenuePlan.scale;
 let s=`<circle r="${occupied}" fill="none" stroke="#c8cfc4" stroke-width="1" stroke-dasharray="3 3"/>`;
 if(low)for(const [x,y,a] of [[0,-28,0],[28,0,90],[0,28,180],[-28,0,270]])s+=`<rect x="${x-7}" y="${y-7}" width="14" height="14" rx="3" fill="#e5eade" stroke="#91a28f" transform="rotate(${a} ${x} ${y})"/>`;
 s+=`<circle r="${r}" fill="${low?'#fffaf0':'#66836d'}" stroke="#617f69" stroke-width="1.5"/>`+svgText(0,4,low?'L':'H',11,'middle',low?'#405a47':'#fff','font-weight="700"');
 return `<g data-cocktail="${t.kind}" transform="translate(${t.x} ${t.y})"><title>${esc(VenuePlan.rooms[t.room].name)} · ${low?'low cocktail table, four chairs':'high cocktail table, standing'}</title>${s}</g>`;
}
function venueSVG(){
 const tx=(x,y,t,size=18,fill='#435b50')=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${fill}">${esc(t)}</text>`;
 const box=(x,y,w,h,fill='#f2f1eb')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#899b8c" stroke-width="2"/>`;
 let s=box(270,205,285,375)+box(270,705,285,440)+box(270,580,116,126,'#e7e7e1')+box(555,438,112,143,'#eeeee8')+box(555,581,112,102,'#eeeee8')+box(555,683,112,222,'#eeeee8')+box(667,438,83,467,'#fcfaf4')+box(750,438,150,467,'#e6e7df')+box(840,990,298,153,'#e7e7df')+box(1428,390,205,560,'#f3f0e7')+box(558,905,282,240,'#fcfaf4')+box(558,205,282,233,'#fcfaf4');
 for(const route of VenuePlan.routes)s+=`<polyline points="${route.points}" fill="none" stroke="#e4eff1" stroke-width="${route.width}" stroke-linejoin="round"/>`;
 for(const q of VenuePlan.queues.filter(q=>q.room!=='monza'))s+=`<g><title>${esc(q.id)}</title><rect x="${q.x}" y="${q.y}" width="${q.w}" height="${q.h}" fill="#f8eedc" stroke="#b79861" stroke-dasharray="4 3"/></g>`;
 s+=tx(412,192,'DORIA · 4 HIGH + 4 LOW',16)+tx(410,698,'ALBA · 4 HIGH + 3 LOW',16)+tx(1530,378,'PATIO · 4 HIGH + 3 LOW',15)+tx(608,631,'BRIDAL',14)+tx(608,651,'SUITE',14)+tx(708,667,'CORRIDOR',12)+tx(825,667,'RESTROOMS',17)+tx(327,646,'Catering',14)+tx(987,1070,'CATERING PREP',18);
 s+=VenuePlan.tables.map(cocktailDrawing).join('');
 s+=`<g transform="translate(900 350) scale(${520/width})">${roomContent(true)}</g>`;
 s+='<path d="M840 365v62 M840 914v62 M665 1145h74 M655 205h77 M556 1029v60 M556 250v62" stroke="#fffdf8" stroke-width="7"/>';
 for(const a of VenuePlan.stations){
  const fill=a.id==='mirror'?'#f9f6ee':a.id==='trio'?'#d9e7e9':a.id==='booth'?'#ece4d6':'#e3e9dc';
  s+=`<g data-station="${a.id}"><title>${esc(a.detail)}</title>`+(a.shape==='round'?`<circle cx="${a.x+a.w/2}" cy="${a.y+a.h/2}" r="${a.w/2}" fill="${fill}" stroke="#899b8c" stroke-width="2"/>`:box(a.x,a.y,a.w,a.h,fill));
  if(a.id==='mirror')s+=`<path d="M${a.x+3} ${a.y+24}l7-17" stroke="#b9c9c7" stroke-width="2"/>`;
  if(a.id==='boba')for(const x of [a.x+10,a.x+a.w-10])s+=`<circle cx="${x}" cy="${a.y+a.h+2}" r="2" fill="#617567"/>`;
  const large=a.id==='booth'||a.id==='trio';
  if(large)s+=tx(a.x+a.w/2,a.y+a.h/2,a.title,11)+tx(a.x+a.w/2,a.y+a.h/2+17,a.id==='booth'?'8 × 8 ft':'ALBA',10);
  else if(a.id==='bar')s+=tx(a.x+a.w/2,a.y+a.h/2+12,'BAR',11);
  const cx=a.x+a.w/2,cy=large||a.id==='bar'?a.y+14:a.y+a.h/2;
  s+=`<circle cx="${cx}" cy="${cy}" r="9" fill="#47695a"/>`+tx(cx,cy+3.6,a.n,10,'#fff')+'</g>';
 }
 s+=tx(686,366,'WELCOME LOBBY',10)+tx(686,380,'3 tables + welcome mirror',8);
 s+=tx(699,1110,'FRONT LOBBY',17)+tx(711,1178,'FRONT BUILDING ENTRY',13)+tx(699,183,'MAIN ENTRANCE · REAR OF BUILDING',12);
 s+='<path d="M697 214V279H747V395H838" fill="none" stroke="#628a96" stroke-width="2" stroke-dasharray="6 4"/><path d="M697 258l-5-9h10z M838 395l-9-5v10z" fill="#628a96"/>';
 s+=tx(1160,326,'MONZA · RECEPTION',19);
 const view=VenuePlan.views[venueView].box,[vx,vy,vw,vh]=view.split(' ').map(Number);
 return `<svg viewBox="${view}" style="overflow:hidden" role="img" aria-label="${esc(VenuePlan.views[venueView].label)}: rear main entrance with three display tables and welcome mirror; boba inside Monza near the rear-lobby door; cocktail tables in Doria, Alba and patio; jazz trio in Alba; photo booth near the unchanged bar"><defs><clipPath id="venue-crop"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}"/></clipPath></defs><g clip-path="url(#venue-crop)">${s}</g></svg>`;
}
function renderVenue(){
 $('venuePlan').innerHTML=venueSVG();
 $('venueViews').innerHTML=Object.entries(VenuePlan.views).map(([id,v])=>`<button type="button" class="quiet ${venueView===id?'active':''}" data-venue="${id}" aria-pressed="${venueView===id}">${esc(v.label)}</button>`).join('');
 $('venueStations').innerHTML=VenuePlan.stations.map(a=>`<li><span class="station-number">${a.n}</span><div><strong>${esc(a.title)}</strong><p>${esc(a.detail)}</p></div></li>`).join('');
 $('cocktailCounts').innerHTML=Object.entries(VenuePlan.counts).map(([id,c])=>`<article><h3>${esc(VenuePlan.rooms[id].name)}</h3><p><strong>${c.high} high · ${c.low} low</strong><br>${c.low*4} cocktail-hour chairs</p></article>`).join('');
}
function headSVG(){const x=17,y=8;let s=svgText(43,20,'BAND',.9)+`<path d="M39 21H45l-1-1 M45 21l-1 1" stroke="#789089" stroke-width=".18" fill="none"/>`;
 s+=svgText(24,2.5,'MEG / REAR-LOBBY SIDE',.88)+svgText(24,39,'ERIC / FRONT-LOBBY SIDE',.88)+headDrawing(option,x,y,true);
 return `<svg viewBox="-1 0 49 42" role="img" aria-label="25 named head seats; stage right, Eric lower half and Meg upper half, matching the vendor drawing">${s}</svg>`;
}
function badge(g){return `<span title="${esc(MEALS[g.meal])}" aria-label="${esc(MEALS[g.meal])}" class="badge ${g.meal==='?'?'unknown':g.meal==='VG'?'vegan':''}">${esc(g.meal==='?'?'TBD':g.meal)}</span>`;}
function headRoster(){const seats=headSeatPositions(option,0,0),parts=new Map();for(const s of seats){if(!parts.has(s.section))parts.set(s.section,[]);parts.get(s.section).push({...group('head').guests[s.index],seat:s.index+1});}return [...parts].map(([title,gs])=>`<div><h3>${esc(title)}</h3><ol>${gs.map(g=>`<li value="${g.seat}">${esc(g.name)} ${badge(g)}${g.id==='andrew-v'?' · Best man':g.id==='mabelle'?' · Maid of honor':''}</li>`).join('')}</ol></div>`).join('');}
function tableCard(t){
 const k=kindOf(t),rot=LAYOUTS[option][width].positions[t.id].rot,kind=k==='round'?'Round · up to 8':k==='small'?'One 6-ft table · long-side seating':'Two 6-ft tables · long-side seating';
 const view=k==='long'?(rot?'-5.5 -7 11 14':'-7 -5.5 14 11'):'-5.5 -5.5 11 11';
 const note=t.id==='t6'?'Sam and Adelia sit side by side. Danielle and Matt sit across from each other.':t.id==='t11'?'Seven-person round. Keep Tables 11 and 13 nearby.':t.id==='t13'?'Six guests at one 6-ft table. Preserve the displayed seat order and keep Table 11 nearby.':t.id==='t10'?'Ten guests at two joined 6-ft sections.':'';
 return `<article class="table-card" id="card-${t.id}"><header><div><h3>${label(t.id)} · ${esc(t.label)}</h3><small>${esc(kind)}</small></div><span class="badge">${t.guests.length} guests</span></header><div class="body"><svg viewBox="${view}" style="width:100%;max-height:235px" role="img" aria-label="${esc(label(t.id))} numbered seats, vendor orientation and floral arrangement">${tableDrawing(t,0,0,rot,true)}</svg><ul>${t.guests.map((g,i)=>`<li class="seatrow"><span><span class="num">${i+1}</span>${esc(g.name)}</span>${badge(g)}</li>`).join('')}</ul><p class="flower">Flowers: ${esc(t.flowers)}</p>${note?`<p class="flower">${esc(note)}</p>`:''}</div></article>`;
}
function renderTables(){const query=$('search').value.trim().toLowerCase();$('guestTables').innerHTML=DATA.groups.filter(t=>t.id!=='head'&&(!query||[label(t.id),t.label,...t.guests.map(g=>g.name)].join(' ').toLowerCase().includes(query))).map(tableCard).join('');}
function inventory(){const ks=DATA.groups.filter(t=>t.id!=='head').map(kindOf);const rounds=ks.filter(k=>k==='round').length,small=ks.filter(k=>k==='small').length,long=ks.filter(k=>k==='long').length;return {rounds,small,long,six:M.options[option].six+small+2*long};}
function renderFlorals(){
 const kinds=['Large','Compote','Taper trio','Runner'];
 $('floralCounts').innerHTML=kinds.map(kind=>{const tables=DATA.groups.filter(t=>t.id!=='head'&&t.flowers===kind);return `<article><h3>${tables.length} × ${esc(kind)}</h3><p>${tables.map(t=>esc(label(t.id))).join(' · ')}</p></article>`;}).join('');
 const sections=M.options[option].six;
 $('floralHead').textContent=`Head table · ${M.options[option].name}: ${sections} six-foot sections (${sections*6} linear ft of tabletop). Garland coverage and connections are for the florist to specify. Table 6 uses two joined sections; confirm runner coverage across its 12-ft surface.`;
}
function summaryHTML(){const a=LAYOUTS[option][width].audit,critical=a.issues.filter(i=>!i.hard&&i.gap<1.5),o=M.options[option],inv=inventory();
 let status=a.hard?`<strong>${a.hard} overlaps in this placement.</strong> Revise furniture or placement within the fixed room.`:critical.length?`<strong>Too tight for setup as drawn.</strong> ${critical.length} ${critical.length===1?'gap is':'gaps are'} below 1.5 ft between occupied spaces; the closest guest-table gap is ${a.minGap.toFixed(2)} ft.`:`<strong>No occupied-space overlaps.</strong> ${a.tight?a.tight+' gaps are below the 3-ft circulation target.':'All checked gaps meet the 3-ft model target.'} Confirm the actual dimensions with Milano.`;
 const issues=a.issues.slice().sort((x,y)=>x.gap-y.gap).slice(0,7),t=group(selected);
 const roster=t?`<div class="selected-roster"><h3>${esc(label(t.id))} · ${t.guests.length} guests</h3><p>${esc(t.label)}</p><ul>${t.guests.map(g=>`<li>${esc(g.name)} · ${esc(MEALS[g.meal])}</li>`).join('')}</ul><p><a href="${t.id==='head'?'#head':'#card-'+t.id}">See seats &amp; flowers</a></p></div>`:'';
 return `<span class="eyebrow">${option==='u'?'Option A':'Comparison option'}</span><h3>${esc(o.name)}</h3><p>${esc(o.trade)}</p><dl><dt>Head-table seats</dt><dd>25</dd><dt>Head-table 6-ft sections</dt><dd>${o.six}</dd><dt>Guest rounds</dt><dd>${inv.rounds}</dd><dt>Single 6-ft guest tables</dt><dd>${inv.small}</dd><dt>Joined guest tables</dt><dd>${inv.long} × 2 sections</dd><dt>Total dinner 6-ft sections</dt><dd>${inv.six}</dd></dl><p class="caption">Tables 6 and 10 each seat ten at two joined sections. Table 11 is a seven-person round; Table 13 seats six at one section. Display furniture and the cake table are additional.</p><div class="status ${a.hard||critical.length?'bad':''}">${status}</div><p class="route-status"><strong>${a.routeClear?'Kitchen, entry and boba spaces are clear in the model.':'A kitchen, entry or boba space has a conflict.'}</strong> Keep the blue areas free of chairs, displays and queues.</p><details><summary>Closest areas to check</summary><ol class="fit-list">${issues.map(i=>`<li>${esc(label(i.a))} / ${esc(label(i.b))}: ${i.gap<0?Math.abs(i.gap).toFixed(1)+'-ft overlap':i.gap.toFixed(1)+'-ft gap'}</li>`).join('')}</ol></details>${roster}`;
}
function render(){
 const inv=inventory();
 $('choices').innerHTML=Object.entries(M.options).map(([id,o])=>`<button type="button" class="choice ${id===option?'active':''}" data-option="${id}" aria-pressed="${id===option}"><span class="tag">${id==='u'?'U shape · one long table per side':id==='wide'?'Longer arms · no backs to band':'Smaller head-table fallback'}</span><strong>${esc(o.name)}</strong><small>${o.six} head sections · ${inv.rounds} rounds · ${inv.small} small · ${inv.long} joined</small></button>`).join('');
 $('roomPlan').innerHTML=roomSVG();renderVenue();renderFlorals();$('layoutSummary').innerHTML=summaryHTML();$('headPlan').innerHTML=headSVG();$('headRoster').innerHTML=headRoster();
 $('headTrade').textContent=option==='u'?'Compact U: 12 face the band, 11 sit side-on and 2 end seats face away. One arm has 6 people and the other 7, using both long sides plus an end seat. The table supports and corner place settings need checking.':M.usesU(option)?'The U keeps 12 guests facing the band and 13 side-on. Nobody sits directly with their back to the stage. Eric and Meg remain together in the centre; Andrew is beside Eric and Mabelle beside Meg.':'Twelve guests face the band; twelve in the opposite row have their backs toward it, and Oliver sits at the end. This uses four fewer head-table sections than the longer-arm U.';
 renderTables();
}
function zoom(which){const container={room:'roomPlan',venue:'venuePlan',head:'headPlan'}[which];$('zoomDrawing').innerHTML=$(container).innerHTML.replaceAll('venue-crop','venue-crop-zoom');$('zoomTitle').textContent={room:'Monza layout · '+M.options[option].short,venue:VenuePlan.views[venueView].label,head:'Head table · 25 named seats'}[which];$('zoomKey').textContent=which==='venue'?VenuePlan.stations.filter(a=>venueView==='all'||(venueView==='arrival'?a.n<=4:venueView==='boba'?a.id==='boba':a.n>=6)).map(a=>a.n+' '+a.title).join(' · '):'';$('zoomDialog').classList.remove('zoomed');$('zoomScale').textContent='Zoom in';$('zoomDialog').showModal();}
async function start(){
 const r=await Promise.all([fetch('seating-data.json',{cache:'no-store'}),fetch('layout-options.json',{cache:'no-store'})]);if(r.some(x=>!x.ok))throw Error('Could not load the seating plan');[DATA,LAYOUTS]=await Promise.all(r.map(x=>x.json()));
 const counts={O:0,C:0,V:0,VG:0,S:0,'?':0};for(const t of DATA.groups)for(const g of t.guests)counts[g.meal]++;
 $('stats').innerHTML=[[DATA.guests,'Guests in the plan'],[group('head').guests.length,'At the head table'],[DATA.groups.length-1,'Guest groups outside the head table'],[counts['?'],'Meal choices pending']].map(([n,l])=>`<div class="stat"><strong>${n}</strong><span>${l}</span></div>`).join('');
 $('updated').textContent='Coordinator & florist review · Revised '+DATA.updated;
 $('mealCounts').innerHTML=Object.entries(counts).map(([m,n])=>`<div class="meal-chip ${m==='VG'?'vegan':''}"><b>${n}</b>${esc(MEALS[m])}</div>`).join('');
 $('unknownMeals').textContent=DATA.groups.flatMap(t=>t.guests).filter(g=>g.meal==='?').map(g=>g.name).join(' · ');
 $('flowerSummary').textContent='Floral proposal: 2 large arrangements, 4 compotes, 6 taper trios, a Table 6 runner and head-table garland. See the florist section for quantities and locations.';
 render();
 $('showSpace').addEventListener('change',e=>{space=e.target.checked;render();});$('search').addEventListener('input',renderTables);$('print').addEventListener('click',()=>window.print());
 document.addEventListener('click',e=>{let c=e.target.closest('[data-venue]');if(c){venueView=c.dataset.venue;renderVenue();return;}c=e.target.closest('[data-option]');if(c){option=c.dataset.option;render();return;}c=e.target.closest('[data-zoom]');if(c){zoom(c.dataset.zoom);return;}c=e.target.closest('[data-table]');if(c){selected=c.dataset.table;$('layoutSummary').innerHTML=summaryHTML();}});
 document.addEventListener('keydown',e=>{const t=e.target.closest('[data-table]');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selected=t.dataset.table;$('layoutSummary').innerHTML=summaryHTML();}});
 $('zoomScale').addEventListener('click',()=>{const large=$('zoomDialog').classList.toggle('zoomed');$('zoomScale').textContent=large?'Fit to screen':'Zoom in';});
 $('closeZoom').addEventListener('click',()=>$('zoomDialog').close());

}
start().catch(e=>{$('stats').textContent='The seating data did not load. Please refresh the page.';console.error(e);});
