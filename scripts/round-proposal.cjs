/* Separate furniture proposal. Does not change the confirmed guest-group data. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),M=require('../model.js'),V=require('../venue.js');
const settings={roundGuests:true,bobaAtEntry:true},W=M.ROOM_WIDTH,D=W*M.ASPECT;
const data=JSON.parse(fs.readFileSync(path.join(root,'seating-data.json')));
const f=M.fixed(W,'mixed',settings);
const columns=[
 ['t1','t7',9.5,D-10.51,7],['t2','t8',25.58,56.55,7],
 ['t3','t12',18.95,44.03,6],['t4','t9',40.72,48.32,7],
 ['t5','t11',29.99,46.25,6],['t6','t10',38,D-3.25,10]
];
const positions=Object.fromEntries(columns.flatMap(([e,m,x,y])=>[[e,{x,y,rot:0}],[m,{x,y:D-y,rot:0}]]));
const audit=M.audit(W,'mixed',positions,settings);
assert.equal(audit.hard,0);assert(audit.routeClear);assert(audit.minGap>=1.7);
assert(audit.issues.every(i=>i.gap>=1.5));
for(const [e,m] of columns){assert.equal(positions[e].x,positions[m].x);assert(Math.abs(positions[e].y+positions[m].y-D)<1e-9);}
assert.equal(columns.reduce((a,c)=>a+c[4],0)+5*8+10+25,118);
for(const [id,p]of Object.entries(positions)){
 const shape=M.shape(id,'mixed',p.x,p.y,p.rot,settings),b=M.bounds(shape);
 assert(b.l>=0&&b.r<=W&&b.t>=0&&b.b<=D,'Guest furniture must remain inside Monza');
 for(const block of f.blocks)assert(M.distance(shape,block)>=-1e-8,'Proposal conflicts with '+block.id);
}
const ctx=vm.createContext({SeatingModel:M,VenuePlan:V,document:{},console,inputData:data});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8').split('start().catch')[0],ctx);vm.runInContext('DATA=inputData;',ctx);
const head=vm.runInContext(`headSeatPositions('mixed',${f.wallX},${f.wallTop})`,ctx);
const n=v=>+v.toFixed(3),text=(x,y,t,size=.85,fill='#263b36')=>`<text x="${n(x)}" y="${n(y)}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${size}" fill="${fill}">${t}</text>`;
const rect=(r,fill,stroke='#7a9180',dash='')=>`<rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.w)}" height="${n(r.h)}" fill="${fill}" stroke="${stroke}" stroke-width=".12" ${dash?'stroke-dasharray=".3 .3"':''}/>`;
const chair=(x,y,a)=>`<rect x="${n(x-.8)}" y="${n(y-.85)}" width="1.6" height="1.7" rx=".2" fill="#e5eade" stroke="#8ba08c" stroke-width=".07" transform="rotate(${a} ${n(x)} ${n(y)})"/>`;
let s=`<title>Proposed symmetrical layout: ten rounds, two long guest tables, straight head table for 25</title><desc>Meg's round-table assignments require regrouping. Guest-table gaps reach 1.74 feet and the closest head-table gap is about 1.52 feet. Vendor confirmation required.</desc>`;
s+=`<polygon points="${-f.extra},0 50,0 50,${D} ${-f.extra},${D} ${-f.extra},${D*.88} 0,${D*.88} 0,${D*.14} ${-f.extra},${D*.14}" fill="#fffdf8" stroke="#536b5d" stroke-width=".23"/>`;
for(const r of [f.wallRoute,f.serviceLane,f.catering,f.bobaService])s+=rect(r,'#e5f0f3','#95b7bf',true);
s+=rect(f.bobaQueue,'#f8eedc','#b79861',true)+rect(f.boba,'#e3e9dc');
s+=text(10.25,3.4,'BOBA',.58)+text(7.25,3.4,'Queue',.52)+text(12.75,3.4,'Staff',.52);
for(const y of [1.5,D-7.5])s+=`<path d="M${-f.extra} ${y}v6" stroke="white" stroke-width=".6"/>`;
s+=text(-3,10,'Rear lobby',.64)+text(-3,11,'entry',.64)+text(-3,D-9,'Front lobby',.64)+text(-3,D-8,'entry',.64);
s+=rect(f.stage,'#e5dfd1')+text(f.stage.x+f.stage.w/2,f.cy-.3,'BAND / STAGE',.9);
s+=rect(f.dance,'#f2eee5','#9cac99',true)+text(f.dance.x+6,f.cy,'DANCE',1)+text(f.dance.x+6,f.cy+1.4,'12 × 18 ft',.8);
s+=`<circle cx="${f.cake.x}" cy="${f.cake.y}" r="${f.cake.r}" fill="#f7e6d7" stroke="#b79c7d" stroke-width=".1"/>`+text(f.cake.x,f.cake.y+.25,'Cake',.6);
for(const r of f.tables)s+=rect(r,'#e4ecdf');
for(const p of head)s+=chair(p.x,p.y,p.angle);
s+=`<text x="${f.wallX+1.25}" y="${f.cy}" text-anchor="middle" font-size=".7" font-family="system-ui" transform="rotate(-90 ${f.wallX+1.25} ${f.cy})">HEAD · 25 · FOUR 6-FT SECTIONS</text>`;
columns.forEach(([e,m,x,y,count],i)=>{
 for(const [id,yy,side,nSeats]of [[e,y,'E',count],[m,D-y,'M',i===5?10:8]]){
  const long=i===5,fill=side==='E'?'#edf3ec':'#f1ebe1';
  if(long){for(let j=0;j<10;j++)s+=chair(x+(j%5-2)*2.4,yy+(j<5?-2.3:2.3),j<5?0:180);s+=rect({x:x-6,y:yy-1.25,w:12,h:2.5},fill)+`<path d="M${x} ${yy-1.25}v2.5" stroke="#8ca18c" stroke-width=".12"/>`+text(x,yy+.28,`${side} LONG · 10`,.75);}
  else{for(let j=0;j<nSeats;j++){const a=j*2*Math.PI/nSeats-Math.PI/2+Math.PI/nSeats;s+=chair(x+3.6*Math.cos(a),yy+3.6*Math.sin(a),a*180/Math.PI+90);}s+=`<circle cx="${x}" cy="${yy}" r="2.5" fill="${fill}" stroke="#7a9180" stroke-width=".13"/>`+text(x,yy,`${side}${i+1}`,1.05)+text(x,yy+1.05,`${nSeats} seats`,.65);}
 }
});
s+=text(25,-3,'PROPOSAL · MEG / REAR-LOBBY HALF',.95)+text(25,D+2.6,'ERIC / FRONT-LOBBY HALF',.95);
s+=text(25,-1.4,'Working footprint: approximately 50 × 61 ft',.68);
s+=text(f.kitchenX,D+4.6,'KITCHEN / CATERING · KEEP CLEAR',.72);
s+=text(25,D+6.3,'Meg: five groups of eight pending · vendor spacing review required',.68);
s+=text(25,D+7.7,'Closest chair-space gaps: guest tables 1.74 ft / head table 1.52 ft',.65);
s+=text(2.5,f.cy,'5-ft route',.6);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-7 -5 60 ${D+14}" role="img">${s}</svg>`;
fs.writeFileSync(path.join(root,'round-table-proposal.svg'),svg);
fs.writeFileSync(path.join(root,'round-table-proposal.json'),JSON.stringify({status:'Proposal; Meg round-table assignments pending',settings,width:W,depth:D,headSeats:25,rounds:10,longTables:2,positions,audit},null,2)+'\n');
console.log(JSON.stringify({rounds:10,longTables:2,guests:118,minGuestGap:audit.minGap,minHeadGap:Math.min(...audit.issues.filter(i=>i.b==='head-back').map(i=>i.gap)),routeClear:audit.routeClear}));
