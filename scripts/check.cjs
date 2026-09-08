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
assert.equal(guests.length, 118);
assert.equal(new Set(guests.map(g => g.id)).size, 118);
assert.deepEqual(data.groups.map(t => t.guests.length), [25,7,7,6,7,6,10,7,7,7,10,7,6,6]);
const mealCounts = guests.reduce((a,g) => (a[g.meal]=(a[g.meal]||0)+1,a), {});
assert.deepEqual(mealCounts, {C:33,O:74,S:2,V:3,VG:1,'?':5});
for (const name of ['Jason','Haley']) assert.equal(guests.find(g=>g.name===name).meal,'O');
assert.equal(guests.find(g=>g.name==='Miranda').meal,'VG');
for(const id of ['eric','meg'])assert.equal(guests.find(g=>g.id===id).meal,'S');
const context = vm.createContext({SeatingModel:M,VenuePlan:V,document:{},console});
// Load the actual drawing helpers without booting a browser or fetching data.
const source = fs.readFileSync(path.join(root,'app.js'),'utf8').split('start().catch')[0];
vm.runInContext(source,context);
context.inputData=data;
vm.runInContext('DATA=inputData;',context);
for (const opt of ['u','wide','mixed']) {
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
  for (const [w,l] of Object.entries(layouts[opt])) {
    assert.equal(Object.keys(l.positions).length,13);
    assert.deepEqual(Object.keys(l.positions).sort(),data.groups.filter(t=>t.id!=='head').map(t=>t.id).sort());
    const audit=M.audit(+w,opt,l.positions);
    assert.equal(audit.hard,l.audit.hard);
    assert.equal(audit.tight,l.audit.tight);
    const f=M.fixed(+w,opt);
    assert.equal(f.dance.x+f.dance.w,f.stage.x);
    assert.equal(f.tables.length,opt==='u'?6:opt==='wide'?8:4);
    assert(f.tables.every(t=>Math.max(t.w,t.h)===6 && Math.min(t.w,t.h)===2.5));
    for(const t of data.groups.filter(t=>t.id!=='head'&&!M.long.has(t.id)))
      assert(t.guests.length<=(M.mix.has(t.id)?6:8));
    if(+w>=50) {
      assert.equal(audit.hard,0);
      for(const t of data.groups.filter(t=>t.id!=='head')) {
        const p=l.positions[t.id], b=M.bounds(M.shape(t.id,opt,p.x,p.y,p.rot));
        if(t.side==='meg') assert(b.b<=f.cy-9+.1);
        else assert(b.t>=f.cy+9-.1);
      }
    }
  }
  assert.deepEqual(Object.keys(layouts[opt]),[String(M.ROOM_WIDTH)]);
}

const atTable=id=>data.groups.find(t=>t.id===id);
assert(atTable('t7').guests.some(g=>g.id==='joe-m'));
assert(atTable('t7').guests.some(g=>g.id==='diane-m'));
assert(!Object.hasOwn(data,'unseated'));
for(const id of ['t6','t10']){
 const t=atTable(id),ss=vm.runInContext(`partySeats(group('${id}'),'long')`,context);
 assert(t.guests.length<=10);
 assert(ss.every(s=>Math.abs(s.y)===2.3&&Math.abs(s.x)<6));
 const names=Object.fromEntries(t.guests.map((g,i)=>[g.name,ss.find(s=>s.index===i)]));
 if(id==='t6')assert.equal(Math.abs(names.Sam.x-names.Adelia.x),2.4);
}
assert.deepEqual(atTable('t11').guests.map(g=>g.id),['nathan','neal','mae','joseph-o','lan','miko','maynard']);
assert.deepEqual(new Set(atTable('t13').guests.map(g=>g.id)),new Set(['miranda','reina','pablo','meli','joseph-n','phung']));
assert.equal(M.kind('t11','u'),'round');
assert.deepEqual(data.groups.filter(g=>g.side==='meg'&&M.kind(g.id,'u')==='long').map(g=>g.id),['t10']);
const neriSeats=vm.runInContext("partySeats(group('t13'),'small')",context);
const neriSeat=id=>neriSeats.find(s=>atTable('t13').guests[s.index].id===id);
assert.equal(neriSeat('joseph-n').y,neriSeat('phung').y);
assert.equal(Math.abs(neriSeat('joseph-n').x-neriSeat('phung').x),2);
for(const opt of Object.keys(M.options)){
 const pos=layouts[opt][M.ROOM_WIDTH].positions;
 const gap=M.distance(M.shape('t11',opt,pos.t11.x,pos.t11.y,pos.t11.rot),M.shape('t13',opt,pos.t13.x,pos.t13.y,pos.t13.rot));
 assert(gap>=0&&gap<=4.2,'Tables 11 and 13 should be nearby without overlapping');
}
for(const opt of ['u','wide','mixed']){
 const head=vm.runInContext(`headSeatPositions('${opt}',7,15)`,context);
 assert.equal(head.filter(s=>s.angle===-90).length,12);
 assert.equal(head.filter(s=>s.angle===90).length,opt==='u'?2:opt==='wide'?0:12);
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
const boba=V.stations.find(s=>s.id==='boba'),f=M.fixed(M.ROOM_WIDTH,'u');
assert.equal(boba.x,900+f.boba.x*V.scale);
assert.equal(boba.y,350+f.boba.y*V.scale);
assert(boba.x>=900&&boba.y>=350);
for(const opt of Object.keys(M.options)){const fixed=M.fixed(M.ROOM_WIDTH,opt);for(const b of [fixed.boba,fixed.bobaService,fixed.bobaQueue]){for(const route of [fixed.wallRoute,fixed.serviceLane,fixed.catering,...fixed.doors])assert(M.distance(b,route)>=0,'Boba must not block an entrance or service route');for(const h of fixed.headBlocks)assert(M.distance(b,h)>=0,'Boba must clear head chairs');}}
assert.equal(V.stations.find(s=>s.id==='trio').x<555,true);
assert.equal(V.stations.find(s=>s.id==='bar').x,792);
console.log('PASS: 118 guests; fixed room size across 3 options; 25 head seats; kitchen routes; cocktail furniture and lobby paths.');
