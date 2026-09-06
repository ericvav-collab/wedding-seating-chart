/* Physical planning assumptions, not surveyed dimensions. Units: feet. */
(function(root){
const ASPECT=635/520, R=4.5, GAP=3;
const mix=new Set(['t3','t5','t7','t11','t12','t14']);
const options={
 u:{name:'A · U with seats on both sides',short:'Double-sided U',six:8,trade:'Keeps the U. Seats on the inner arms face the other guests; the centre stays open. Largest head-table footprint.'},
 straight:{name:'B · Straight head table',short:'Straight double-sided',six:4,trade:'Best option to measure first. The same 25 people share four joined 6-ft tables. The opposite row turns to watch the stage.'},
 mixed:{name:'C · Straight head + smaller group tables',short:'Mixed table shapes',six:4,trade:'Same guest groups. Six groups of 5–6 get their own 6-ft table instead of a round. Smaller footprints, with more rectangular linens needed.'}
};
function rect(id,x,y,w,h,label){return {id,type:'rect',x,y,w,h,label:label||id};}
function fixed(W,option){
 const D=W*ASPECT, cy=D/2, stageDepth=W*.246;
 const stage=rect('stage',0,D*.321,stageDepth,D*.369,'Band stage');
 const dance=rect('dance',stageDepth,cy-9,12,18,'Dance floor');
 const wallX=W-8;
 const wallTop=cy-12;
 let tables=[],blocks=[],chairs=[];
 if(option==='u'){
  for(let i=0;i<4;i++)tables.push(rect('H'+(i+1),wallX,wallTop+i*6,2.5,6));
  for(let j=0;j<2;j++)for(let i=0;i<2;i++) tables.push(rect('H'+(5+j*2+i),wallX-12+i*6,wallTop+j*21.5,6,2.5));
  blocks.push(rect('head-back',wallX-2,wallTop-2,6.5,28,'Head table + chairs'));
  blocks.push(rect('head-north',wallX-14,wallTop-2,14,6.5,'Head north arm + chairs'));
  blocks.push(rect('head-south',wallX-14,wallTop+19.5,14,6.5,'Head south arm + chairs'));
 }else{
  for(let i=0;i<4;i++) tables.push(rect('H'+(i+1),wallX,wallTop+i*6,2.5,6));
  blocks.push(rect('head',wallX-2,wallTop-2,6.5,28,'Head table + chairs'));
 }
 // Cake at the stage wall, on Eric's/top side. No dining table in the view corridor.
 const cake={id:'cake',type:'circle',x:2.1,y:stage.y-3.4,r:1.4,label:'Cake'};
 const viewEnd= option==='u'?wallX-14:wallX-2;
 const lane=rect('view-lane',dance.x+dance.w,cy-9,Math.max(0,viewEnd-dance.x-dance.w),18,'Clear view / access to head table');
 const doors=[rect('front-entry',W-3,0,3,8,'Front entrance approach'),rect('rear-entry',W-3,D-8,3,8,'Rear entrance approach'),rect('patio',0,0,6,6,'Stage-side door approach'),rect('service',0,D-6,6,6,'Stage-side door approach')];
 const boba=rect('boba',W+.4,D*.08,3,2,'Boba cart');
 return {W,D,cy,stage,dance,cake,lane,tables,headBlocks:blocks,doors,boba,blocks:[stage,dance,cake,lane,...blocks,...doors]};
}
function shape(id,option,x,y,rot=0){
 if(id==='t6')return rect(id,x-8,y-3.25,16,6.5,'A&M table + chairs');
 if(option==='mixed'&&mix.has(id))return rect(id,x-(rot?3.25:5),y-(rot?5:3.25),rot?6.5:10,rot?10:6.5,'Table '+id.slice(1)+' + chairs');
 return {id,type:'circle',x,y,r:R,label:'Table '+id.slice(1)+' + chairs'};
}
function bounds(a){return a.type==='circle'?{l:a.x-a.r,r:a.x+a.r,t:a.y-a.r,b:a.y+a.r}:{l:a.x,r:a.x+a.w,t:a.y,b:a.y+a.h};}
function distance(a,b){
 if(a.type==='circle'&&b.type==='circle')return Math.hypot(a.x-b.x,a.y-b.y)-a.r-b.r;
 if(a.type==='circle'||b.type==='circle'){
  if(a.type!=='circle')[a,b]=[b,a]; const z=bounds(b);
  const dx=Math.max(z.l-a.x,0,a.x-z.r),dy=Math.max(z.t-a.y,0,a.y-z.b);
  if(dx===0&&dy===0)return -a.r-Math.min(a.x-z.l,z.r-a.x,a.y-z.t,z.b-a.y);
  return Math.hypot(dx,dy)-a.r;
 }
 const A=bounds(a),B=bounds(b),dx=Math.max(A.l-B.r,B.l-A.r),dy=Math.max(A.t-B.b,B.t-A.b);
 return dx>0||dy>0?Math.hypot(Math.max(dx,0),Math.max(dy,0)):Math.max(dx,dy);
}
function audit(W,option,positions){
 const f=fixed(W,option),items=Object.entries(positions).map(([id,p])=>shape(id,option,p.x,p.y,p.rot)),issues=[];
 for(let i=0;i<items.length;i++){
  const a=items[i],b=bounds(a); const edge=Math.min(b.l,W-b.r,b.t,f.D-b.b);
  if(edge<-.05)issues.push({a:a.id,b:'wall',gap:edge,hard:true});
  for(const ob of f.blocks){const d=distance(a,ob); if(d<-.05)issues.push({a:a.id,b:ob.id,gap:d,hard:true});else if(d<GAP && !ob.id.includes('entry') && !['patio','service','view-lane'].includes(ob.id))issues.push({a:a.id,b:ob.id,gap:d,hard:false});}
  for(let j=i+1;j<items.length;j++){let d=distance(a,items[j]);if(d<GAP-.05)issues.push({a:a.id,b:items[j].id,gap:d,hard:d<-.05});}
 }
 for(const h of f.headBlocks){let d=distance(h,f.dance);if(d<0)issues.push({a:h.id,b:'dance',gap:d,hard:true});}
 const minGap=Math.min(...items.flatMap((a,i)=>items.slice(i+1).map(b=>distance(a,b))));
 return {hard:issues.filter(x=>x.hard).length,tight:issues.filter(x=>!x.hard).length,minGap,issues};
}
const api={ASPECT,R,GAP,options,mix,fixed,shape,bounds,distance,audit};
if(typeof module!=='undefined')module.exports=api;else root.SeatingModel=api;
})(globalThis);
