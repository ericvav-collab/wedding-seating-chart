const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'seating-data.json')));
const layouts = JSON.parse(fs.readFileSync(path.join(root, 'layout-options.json')));
const M = require('../model.js');
const V = require('../venue.js');
const guests = data.groups.flatMap(t => t.guests);
assert.equal(guests.length, 118); // Julie and Bob Delia out Oct 6
assert.equal(new Set(guests.map(g => g.id)).size, 118);
assert.deepEqual(data.groups.map(t => t.guests.length), [25,6,6,7,6,6,10,6,6,7,7,6,6,7,7]);
const mealCounts = guests.reduce((a,g) => (a[g.meal]=(a[g.meal]||0)+1,a), {});
assert.deepEqual(mealCounts, {C:37,O:74,S:2,V:3,VG:1,K:1}); // K = Oliver's kids meal
for (const [id,meal] of [['joe-m','C'],['diane-m','C'],['pablo','C'],['meli','O'],['reina','O'],['gerry-n','C'],['letty','C'],['irma','O'],['oliver','K']]) assert.equal(guests.find(g=>g.id===id).meal,meal);
assert(!guests.some(g=>g.id==='pits')); // Pits removed in Meg's Sep 20 chart
for (const name of ['Jason','Haley']) assert.equal(guests.find(g=>g.name===name).meal,'O');
assert.equal(guests.find(g=>g.name==='Miranda').meal,'VG');
for(const id of ['eric','meg'])assert.equal(guests.find(g=>g.id===id).meal,'S');
const context = vm.createContext({SeatingModel:M,VenuePlan:V,document:{},console});
// Load the actual drawing helpers without booting a browser or fetching data.
const source = fs.readFileSync(path.join(root,'app.js'),'utf8').split('start().catch')[0];
vm.runInContext(source,context);
context.inputData=data;
vm.runInContext('DATA=inputData;',context);
for (const opt of ['fay','u','wide','rounds','d']) {
  const head=vm.runInContext(`headSeatPositions('${opt}',7,54*SeatingModel.ASPECT/2-12)`,context);
  assert.equal(head.length,25);
  assert.equal(new Set(head.map(p=>p.index)).size,25);
  assert(head.every(p=>p.index>=0&&p.index<25));
  const at=name=>head.find(p=>data.groups[0].guests[p.index].name===name);
  assert.equal(at('Eric').y-at('Meg').y,2);
  assert.equal(at('Andrew V.').y-at('Eric').y,2);
  assert.equal(at('Meg').y-at('Mabelle').y,2);
  assert.equal(at('Eric').angle,-90);
  assert.equal(at('Meg').angle,-90);
  assert(at('Jason').y>at('Eric').y);
  assert(at('Haley').y>at('Eric').y);
  for(const name of ['Merielle (MM)','James','Oliver']) assert(at(name).y<at('Meg').y);
  if(opt==='fay'){// Oct 4 seat requests on the head-table arms.
    const gap=(a,b)=>Math.hypot(at(a).x-at(b).x,at(a).y-at(b).y);
    assert(gap('PJ','Austin')<=2.01);
    assert(gap('Vivian','Lorraine')<=1.72);
    assert(gap('Oliver','James')<=1.72&&gap('Oliver','Merielle (MM)')<=1.72);
    assert(['Merielle (MM)','Oliver','Tony','Vivian','Lorraine','Fortune'].every(n=>gap('James','Drake')<gap(n,'Drake')));
  }
  for (const [w,l] of Object.entries(layouts[opt])) {
    const expected=data.groups.filter(t=>t.id!=='head').map(t=>t.id).sort();
    assert.equal(Object.keys(l.positions).length,14);
    assert.deepEqual(Object.keys(l.positions).sort(),expected);
    const audit=M.audit(+w,opt,l.positions);
    assert.equal(audit.hard,l.audit.hard);
    assert.equal(audit.tight,l.audit.tight);
    const f=M.fixed(+w,opt);
    assert.equal(f.dance.x+f.dance.w,f.stage.x);
    assert.equal(f.tables.length,M.compactU(opt)?6:opt==='wide'||opt==='fay'?8:4);
    assert(f.tables.every(t=>Math.max(t.w,t.h)===6 && Math.min(t.w,t.h)===2.5));
    for(const t of data.groups.filter(t=>t.id!=='head'&&!M.long.has(t.id)))
      assert(t.guests.length<=8);
    if(+w>=50) {
      // Option B (wide) does not fit Meg's Sep 20 all-round layout; its overlaps are shown honestly.
      if(opt!=='wide') assert.equal(audit.hard,0);
      const laneOK=new Set((M.options[opt]||{}).laneTables||[]);
      for(const t of data.groups.filter(t=>t.id!=='head'&&l.positions[t.id])) {
        const p=l.positions[t.id], b=M.bounds(M.shape(t.id,opt,p.x,p.y,p.rot));
        // Lane tables (option D parents) may enter the keep-open lane up to the centreline.
        if(t.side==='meg') assert(b.b<=(laneOK.has(t.id)?f.cy+1.5:f.cy-9+.1));
        else assert(b.t>=(laneOK.has(t.id)?f.cy-1.5:f.cy+9-.1));
      }
    }
  }
  assert.deepEqual(Object.keys(layouts[opt]),[String(M.ROOM_WIDTH)]);
}

const atTable=id=>data.groups.find(t=>t.id===id);
// Oct 4 renumbering: parents' tables sit closest to the head table (5 and 9).
assert(atTable('t5').guests.some(g=>g.id==='susan')&&atTable('t5').guests.some(g=>g.id==='paul'));
assert(atTable('t9').guests.some(g=>g.id==='nelia')&&atTable('t9').guests.some(g=>g.id==='noli'));
assert(atTable('t9').guests.some(g=>g.id==='joe-m'));
assert(atTable('t9').guests.some(g=>g.id==='diane-m'));
assert(atTable('t9').guests.some(g=>g.id==='irma'));
assert(!Object.hasOwn(data,'unseated'));
{// Table 6 is the only long table (A&M group of ten): four chairs per long side, Sam and John on the ends.
 const t=atTable('t6'),ss=vm.runInContext("partySeats(group('t6'),'long')",context);
 assert.equal(t.guests.length,10);
 assert.equal(new Set(ss.map(s=>s.index)).size,10);
 assert.equal(ss.filter(s=>s.y===-2.3&&Math.abs(s.x)<6).length,4);
 assert.equal(ss.filter(s=>s.y===2.3&&Math.abs(s.x)<6).length,4);
 const at=Object.fromEntries(t.guests.map((g,i)=>[g.id,ss.find(s=>s.index===i)]));
 for(const id of ['sam','john']) assert(at[id].y===0&&Math.abs(at[id].x)>6,id+' sits on an end');
 const next=(a,b)=>Math.hypot(at[a].x-at[b].x,at[a].y-at[b].y)<3.5; // side neighbours or around a corner
 const across=(a,b)=>at[a].x===at[b].x&&at[a].y===-at[b].y;
 for(const [a,b] of [['sam','adelia'],['april','baley'],['taylor','john'],['danielle','matt-w'],['lauren','trey']]) assert(next(a,b),a+' and '+b+' sit together');
 assert(next('taylor','april'));
 assert(across('adelia','danielle')&&across('baley','matt-w')&&next('sam','danielle'));
 assert(across('april','lauren')&&across('taylor','trey'));
}
assert.deepEqual(atTable('t13').guests.map(g=>g.id),['nathan','neal','mae','lan','joseph-o','miko','maynard']);
{// Oct 4 seat requests.
 const idx=(t,id)=>atTable(t).guests.findIndex(g=>g.id===id);
 assert.equal(Math.abs(idx('t5','marie')-idx('t5','dennis')),1);
 assert.equal(Math.abs(idx('t13','joseph-o')-idx('t13','lan')),1);
 assert.equal(Math.abs(idx('t13','joseph-o')-idx('t13','miko')),1);
}
{// Oct 7: Jaclyn sits beside her mom Louise, not beside Deacon Dennis (round table wraps).
 const g=atTable('t5').guests.map(x=>x.id), n=g.length, at=id=>g.indexOf(id);
 const beside=(a,b)=>[1,n-1].includes((at(a)-at(b)+n)%n);
 assert(beside('jaclyn','louise')&&!beside('jaclyn','dennis'));
}
assert.deepEqual(new Set(atTable('t12').guests.map(g=>g.id)),new Set(['miranda','reina','pablo','meli','joseph-n','phung']));
assert.equal(atTable('t8').guests[0].id,'andrew-d');
assert.equal(atTable('t8').guests.length,6);
assert.equal(M.kind('t11','u'),'round');
assert.equal(M.kind('t10','u'),'round');
assert.deepEqual(data.groups.filter(g=>g.side==='meg'&&M.kind(g.id,'u')==='long').map(g=>g.id),[]);
for(const opt of ['fay','u','wide','rounds','d']){
 const head=vm.runInContext(`headSeatPositions('${opt}',7,15)`,context);
 assert.equal(head.filter(s=>s.angle===-90).length,12);
 assert.equal(head.filter(s=>s.angle===90).length,M.compactU(opt)?2:opt==='wide'||opt==='fay'?0:12);
 if(M.outsideOnly(opt)){
  // Milano's plan: arm chairs sit only on the outside (above the rear arm, below the front arm).
  assert.equal(head.filter(s=>s.angle===0&&s.y===14).length,7);
  assert.equal(head.filter(s=>s.angle===180&&s.y===40).length,6);
 }
 const chair=s=>M.bounds({type:'rect',x:s.x-(Math.abs(s.angle)===90?.85:.8),y:s.y-(Math.abs(s.angle)===90?.8:.85),w:Math.abs(s.angle)===90?1.7:1.6,h:Math.abs(s.angle)===90?1.6:1.7});
 for(let i=0;i<head.length;i++)for(let j=i+1;j<head.length;j++){
  const a=chair(head[i]),b=chair(head[j]);
  assert(!(a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t),'Head chairs must not overlap');
 }
}
// Check the new cocktail furniture and actual drawn routes, not just the table counts.
assert.equal(V.tables.filter(t=>t.kind==='high').length,12);
assert.equal(V.tables.filter(t=>t.kind==='low').length,10);
const asRect=a=>({...a,type:'rect'});
const routeBlocks=V.routes.flatMap(r=>{const p=r.points.split(' ').map(s=>s.split(',').map(Number));return p.slice(1).map(([x,y],i)=>asRect({x:Math.min(x,p[i][0])-r.width/2,y:Math.min(y,p[i][1])-r.width/2,w:Math.abs(x-p[i][0])+r.width,h:Math.abs(y-p[i][1])+r.width}));});
// Flat path ends stop at door thresholds; do not extend them into neighbouring rooms.
for(const t of V.tables){const r=V.rooms[t.room],s={type:'circle',x:t.x,y:t.y,r:(t.kind==='low'?3.5:3)*V.scale},b=M.bounds(s);assert(b.l>=r.x&&b.r<=r.x+r.w&&b.t>=r.y&&b.b<=r.y+r.h);for(const route of routeBlocks)assert(M.distance(s,route)>=0,'Cocktail space blocks a drawn walking route: '+t.id);}
for(let i=0;i<V.tables.length;i++)for(const b of V.tables.slice(i+1)){
 const a=V.tables[i],shape=t=>({type:'circle',x:t.x,y:t.y,r:(t.kind==='low'?3.5:3)*V.scale});
 assert(M.distance(shape(a),shape(b))>=0,'Cocktail occupied spaces overlap');
}
for(const a of V.stations)for(const r of routeBlocks){const shape=a.shape==='round'?{type:'circle',x:a.x+a.w/2,y:a.y+a.h/2,r:a.w/2}:asRect(a);assert(M.distance(shape,r)>=0,'Station blocks a walking route: '+a.id);}
for(const a of V.queues)for(const r of routeBlocks)assert(M.distance(asRect(a),r)>=0,'Queue blocks a walking route: '+a.id);
// Photo booth and jazz trio sit in the front lobby (x 558-840, y 905-1145), clear of the front door opening
// (x 665-739 on the bottom wall); the trio is in the lower-left corner. Bar and boba are in Alba.
const frontLobby={type:'rect',x:558,y:905,w:282,h:240},frontDoor={type:'rect',x:665,y:1105,w:74,h:40};
const inside=(s,room)=>{const b=M.bounds(s),z=M.bounds(room);return b.l>=z.l&&b.r<=z.r&&b.t>=z.t&&b.b<=z.b;};
const station=id=>asRect(V.stations.find(a=>a.id===id));
for(const id of ['booth','trio']){assert(inside(station(id),frontLobby),id+' must be in the front lobby');assert(M.distance(station(id),frontDoor)>=0,id+' must clear the front door');}
assert(station('trio').x-frontLobby.x<=6&&frontLobby.y+frontLobby.h-(station('trio').y+station('trio').h)<=6,'trio sits in the front lobby corner');
const alba={type:'rect',...V.rooms.alba};
for(const id of ['bar','boba']) assert(inside(station(id),alba),id+' must be in Alba');
assert(station('bar').x-alba.x<=6,'bar is on the far wall of Alba');
assert(alba.y+alba.h-(station('boba').y+station('boba').h)<=25,'boba is at the front of Alba');
for(const t of V.tables){const s={type:'circle',x:t.x,y:t.y,r:(t.kind==='low'?3.5:3)*V.scale};for(const a of [...V.stations.filter(a=>a.shape!=='round').map(asRect),...V.queues.map(asRect)])assert(M.distance(s,a)>=0,'Cocktail table '+t.id+' overlaps a station or line');}
for(const q of V.queues)assert(M.distance(asRect(q),frontDoor)>=0,'Queue must clear the front door: '+q.id);
for(let i=0;i<V.stations.length;i++)for(const b of V.stations.slice(i+1))assert(M.distance(asRect(V.stations[i]),asRect(b))>=0||V.stations[i].shape==='round'||b.shape==='round','Stations overlap: '+V.stations[i].id+'/'+b.id);
assert.equal(M.fixed(M.ROOM_WIDTH,'fay').boba,null);
// Earlier options kept boba inside Monza; it must still clear the kitchen, the other doors and the head table there.
for(const opt of Object.keys(M.options).filter(M.bobaInMonza)){const fixed=M.fixed(M.ROOM_WIDTH,opt);const otherDoors=fixed.doors.filter(d=>d.id!=='rear-entry');for(const b of [fixed.boba,fixed.bobaService,fixed.bobaQueue]){for(const route of [fixed.serviceLane,fixed.catering,...otherDoors])assert(M.distance(b,route)>=0,'Boba must not block the kitchen or another entrance');for(const h of fixed.headBlocks)assert(M.distance(b,h)>=0,'Boba must clear head chairs');}}
console.log('PASS: 118 guests; fixed room size across 5 layouts (Milano plan selected); 25 head seats; kitchen routes; bar and boba in Alba; photo booth and trio in the front lobby; cocktail furniture and paths.');
