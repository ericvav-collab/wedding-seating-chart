const fs=require('fs'),M=require('../model.js');
const groups=JSON.parse(fs.readFileSync(require('path').join(__dirname,'../seating-data.json'))).groups.filter(g=>g.id!=='head');
let seed=372897;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function optimize(W,opt,previous){
 const f=M.fixed(W,opt),D=f.D;
 const prefs={t1:[14,D/2+20],t2:[W*.5,D-7],t3:[W*.76,D-7],t4:[W-7,D/2+17],t5:[W*.52,D/2+19],t6:[W*.75,D/2+25],t7:[14,D/2-20],t8:[11,7],t9:[W*.47,6],t10:[W*.52,D/2-17],t11:[W*.72,7],t12:[W-7,D/2-18],t13:[W*.32,6]};
 function init(k){return groups.map((g,i)=>{let p=prefs[g.id];if(previous&&k===0){const q=previous.positions[g.id],r=W/previous.width;return {id:g.id,x:q.x*r,y:q.y*r,rot:q.rot||0,side:g.side};}return {id:g.id,x:p[0]+(rand()-.5)*(k?10:2),y:p[1]+(rand()-.5)*(k?6:1),rot:0,side:g.side};});}
 function single(a,others){
  let sh=M.shape(a.id,opt,a.x,a.y,a.rot),b=M.bounds(sh),cost=0;
  for(const v of [b.l,W-b.r,b.t,D-b.b])if(v<1)cost+=20000*Math.max(0,-v)**2+3*Math.max(0,1-v)**2;
  const cross=a.side==='meg'?b.b-(f.cy-9):f.cy+9-b.t;
  if(cross>0)cost+=160*cross*cross;
  function penalty(gap,target){return 20000*Math.max(0,-gap)**2+4*Math.max(0,target-gap)**2+80*Math.max(0,Math.min(1.6,target)-gap)**2;}
  for(const fixed of f.blocks)cost+=penalty(M.distance(sh,fixed),['view-lane',...f.protectedAreas.map(x=>x.id)].includes(fixed.id)?0:3);
  for(const o of others)if(o!==a)cost+=penalty(M.distance(sh,M.shape(o.id,opt,o.x,o.y,o.rot)),3);
  const pref=prefs[a.id];cost+=((a.x-pref[0])**2+(a.y-pref[1])**2)*(['t1','t7'].includes(a.id)?.08:.007);
  return cost;
 }
 let best=null,bc=Infinity;
 for(let start=0;start<9;start++){
  let a=init(start);let total=a.reduce((s,p)=>s+single(p,a),0);
  for(let iter=0;iter<100000;iter++){
   const p=a[(rand()*a.length)|0];let old={...p};let before=single(p,a);
   let progress=iter/100000,temp=10*(1-progress)**3+.02,range=progress<.35?3:progress<.7?1:.22;
   p.x+=(rand()-.5)*range;p.y+=(rand()-.5)*range;
   if(M.kind(p.id,opt)!=='round'&&rand()<.008)p.rot=1-p.rot;
   const after=single(p,a),delta=after-before;
   if(delta>0&&rand()>Math.exp(-delta/temp))Object.assign(p,old);
  }
  total=a.reduce((s,p)=>s+single(p,a),0);
  if(total<bc){bc=total;best=a.map(p=>({...p}));}
 }
 const positions=Object.fromEntries(best.map(p=>[p.id,{x:+p.x.toFixed(2),y:+p.y.toFixed(2),rot:p.rot}]));
 const check=M.audit(W,opt,positions);console.log(opt,W,'hard',check.hard,'tight',check.tight,'route',check.routeClear,'gap',check.minGap.toFixed(1));
 return {width:W,depth:D,positions,audit:check};
}
const dest=require('path').join(__dirname,'../layout-options.json'),limited=process.argv[2];
if(process.argv[3])throw Error('Room size is fixed. Pass only an option name.');
if(limited&&!M.options[limited])throw Error('Unknown layout option.');
const out=JSON.parse(fs.readFileSync(dest));
for(const opt of limited?[limited]:Object.keys(M.options)){
 const W=M.ROOM_WIDTH,res=optimize(W,opt,out[opt][W]);
 out[opt]={[W]:res};
 fs.writeFileSync(dest,JSON.stringify(out));
}

