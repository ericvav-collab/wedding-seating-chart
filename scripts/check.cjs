const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'seating-data.json')));
const layouts = JSON.parse(fs.readFileSync(path.join(root, 'layout-options.json')));
const M = require('../model.js');
const guests = data.groups.flatMap(t => t.guests);
assert.equal(guests.length, 119);
assert.equal(new Set(guests.map(g => g.id)).size, 119);
assert.deepEqual(data.groups.map(t => t.guests.length), [25,7,7,6,7,6,10,5,7,7,8,6,6,7,5]);
const mealCounts = guests.reduce((a,g) => (a[g.meal]=(a[g.meal]||0)+1,a), {});
assert.deepEqual(mealCounts, {C:33,O:74,'?':8,V:3,VG:1});
for (const name of ['Jason','Haley']) assert.equal(guests.find(g=>g.name===name).meal,'O');
assert.equal(guests.find(g=>g.name==='Miranda').meal,'VG');
assert(!guests.some(g=>['Quan','Natalia','Stella','Joe Messina','Diane Messina'].includes(g.name)));
const context = vm.createContext({SeatingModel:M,document:{},console});
// Load the actual drawing helpers without booting a browser or fetching data.
const source = fs.readFileSync(path.join(root,'app.js'),'utf8').split('start().catch')[0];
vm.runInContext(source,context);
context.inputData=data;
vm.runInContext('DATA=inputData;',context);
for (const opt of ['u','straight','mixed']) {
  const head=vm.runInContext(`headSeatPositions('${opt}',54-8,54*SeatingModel.ASPECT/2-12)`,context);
  assert.equal(head.length,25);
  assert.equal(new Set(head.map(p=>p.index)).size,25);
  assert(head.every(p=>p.index>=0&&p.index<25));
  const at=name=>head.find(p=>data.groups[0].guests[p.index].name===name);
  assert.equal(at('Meg').y-at('Eric').y,2);
  assert.equal(at('Eric').y-at('Andrew V.').y,2);
  assert.equal(at('Mabelle').y-at('Meg').y,2);
  assert.equal(at('Eric').angle,90);
  assert.equal(at('Meg').angle,90);
  assert(at('Jason').y<at('Eric').y);
  assert(at('Haley').y<at('Eric').y);
  for(const name of ['Merielle (MM)','James','Oliver']) assert(at(name).y>at('Meg').y);
  for (const [w,l] of Object.entries(layouts[opt])) {
    assert.equal(Object.keys(l.positions).length,14);
    assert.deepEqual(Object.keys(l.positions).sort(),data.groups.filter(t=>t.id!=='head').map(t=>t.id).sort());
    const audit=M.audit(+w,opt,l.positions);
    assert.equal(audit.hard,l.audit.hard);
    assert.equal(audit.tight,l.audit.tight);
    const f=M.fixed(+w,opt);
    assert.equal(f.dance.x,f.stage.x+f.stage.w);
    assert.equal(f.tables.length,opt==='u'?8:4);
    assert(f.tables.every(t=>Math.max(t.w,t.h)===6 && Math.min(t.w,t.h)===2.5));
    for(const t of data.groups.filter(t=>t.id!=='head'&&t.id!=='t6'))
      assert(t.guests.length<=(opt==='mixed'&&M.mix.has(t.id)?6:8));
    if(+w>=50) {
      assert.equal(audit.hard,0);
      for(const t of data.groups.filter(t=>t.id!=='head')) {
        const p=l.positions[t.id], b=M.bounds(M.shape(t.id,opt,p.x,p.y,p.rot));
        if(t.side==='eric') assert(b.b<=f.cy-9+.1);
        else assert(b.t>=f.cy+9-.1);
      }
    }
  }
  assert(layouts[opt][38].audit.hard>0);
}
const am=vm.runInContext("partySeats(group('t6'),'long')",context);
const a=am.find(s=>s.index===0),b=am.find(s=>s.index===1);
assert(Math.hypot(a.x-b.x,a.y-b.y)<3.5,'Sam and Adelia must remain adjacent at the corner');
console.log('PASS: 119 unique guests; meals; group sizes; all 18 layouts; 25 head seats; party sides; table counts; couple placement; attached dance floor.');
