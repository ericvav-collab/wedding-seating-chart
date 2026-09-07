const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'seating-data.json')));
const layouts = JSON.parse(fs.readFileSync(path.join(root, 'layout-options.json')));
const M = require('../model.js');
const guests = data.groups.flatMap(t => t.guests);
assert.equal(guests.length, 118);
assert.equal(new Set(guests.map(g => g.id)).size, 118);
assert.deepEqual(data.groups.map(t => t.guests.length), [25,7,7,6,7,6,10,7,7,7,10,9,6,4]);
const mealCounts = guests.reduce((a,g) => (a[g.meal]=(a[g.meal]||0)+1,a), {});
assert.deepEqual(mealCounts, {C:33,O:74,'?':7,V:3,VG:1});
for (const name of ['Jason','Haley']) assert.equal(guests.find(g=>g.name===name).meal,'O');
assert.equal(guests.find(g=>g.name==='Miranda').meal,'VG');
assert(!guests.some(g=>['Quan','Natalia','Stella','Gerry N.','Letty','Mahmoud'].includes(g.name)));
const context = vm.createContext({SeatingModel:M,document:{},console});
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
  assert(layouts[opt][38].audit.hard>0);
}

const atTable=id=>data.groups.find(t=>t.id===id);
assert(atTable('t7').guests.some(g=>g.id==='joe-messina'));
assert(atTable('t7').guests.some(g=>g.id==='diane-messina'));
assert.equal(data.unseated.length,3);
for(const id of ['t6','t10','t11']){
 const t=atTable(id),ss=vm.runInContext(`partySeats(group('${id}'),'long')`,context);
 assert(t.guests.length<=10);
 assert(ss.every(s=>Math.abs(s.y)===2.3&&Math.abs(s.x)<6));
 const names=Object.fromEntries(t.guests.map((g,i)=>[g.name,ss.find(s=>s.index===i)]));
 if(id==='t6')assert.equal(Math.abs(names.Sam.x-names.Adelia.x),2.4);
 if(id==='t11'){
  assert.equal(names['Joseph N.'].y,names.Phung.y);
  assert.equal(names['Joseph N.'].x,names.Miko.x);
  assert.equal(names.Phung.x,names.Maynard.x);
  assert(names.Miko.y>names['Joseph N.'].y);
 }
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
console.log('PASS: 118 unique guests; corrected groups and meals; 18 geometry audits; 25 head seats; couple and Neri placements; kitchen routes; 6-ft sections; vendor orientation.');
