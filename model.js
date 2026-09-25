/* Vendor orientation: stage right, front lobby below. Distances in feet are planning assumptions. */
(function(root){
const ASPECT=635/520,ROOM_WIDTH=50,R=4.5,GAP=3;
const mix=new Set([]);
const long=new Set(['t6']);
const usesU=option=>option==='u'||option==='wide'||option==='d'||option==='fay';
const compactU=option=>option==='u'||option==='d';
// Milano's Sep 25 plan seats the head table on the outside of the U only, and the boba cart leaves Monza for the bar.
const outsideOnly=option=>option==='fay';
const bobaInMonza=option=>option!=='fay';
const kind=(id,option)=>long.has(id)?'long':'round';
const options={
 fay:{name:'Milano\u2019s Sep 25 floorplan \u00b7 8-table U, all 25 facing the dance floor',short:'Milano plan (Sep 25)',six:8,trade:'Fay\u2019s final floorplan: four 6-ft tables along the wall and two per arm, with chairs only on the outside of the U, so all 25 head-table guests face the dance floor and band. Seven tables seat 3 and one seats 4. The boba cart moves out of Monza to the bar.'},
 u:{name:'A · Compact U head table + all rounds',short:'Compact U',six:6,trade:'Four 6-ft sections across the back and one per arm. Keeps 25 together; two end seats face away from the band. Check the arm-table supports and corner comfort.'},
 wide:{name:'B · Longer-arm U head table + all rounds',short:'Longer-arm U',six:8,trade:'Longer arms give the head-table guests more space. No head-table guests have their backs to the band; it needs six more feet of arm length than A and squeezes the guest tables hardest.'},
 rounds:{name:'C · Straight head table + all rounds',short:'Straight head table',six:4,trade:'Smallest head-table footprint, which gives the 13 rounds the most breathing room \u2014 but twelve head seats face away from the band.'},
 d:{name:'D · Compact U + parents\u2019 rounds in the open centre',short:'U + parents centred',six:6,laneTables:['t1','t7'],trade:'Same compact U as A, but BOTH parents\u2019 tables (1 and 7) sit in the keep-open lane, mirrored in front of the couple. The side bands breathe; the trade is one pinch point where Table 1\u2019s chairs pass the dance-floor edge (~0.5 ft in the model \u2014 confirm on site).'}
};
function rect(id,x,y,w,h,label){return {id,type:'rect',x,y,w,h,label:label||id};}
const optionSettings=(option,settings={})=>Object.assign({},(options[option]||{}).settings,settings);
function fixed(W,option,settings={}){
 settings=optionSettings(option,settings);
 const D=W*ASPECT,cy=D/2,stageDepth=W*.246,extra=W*60/520;
 const stage=rect('stage',W-stageDepth,D*.321,stageDepth,D*.369,'Band stage');
 const dance=rect('dance',stage.x-12,cy-9,12,18,'Dance floor');
 const wallX=7,wallTop=cy-12;
 const tables=[],headBlocks=[];
 for(let i=0;i<4;i++)tables.push(rect('H'+(i+1),wallX,wallTop+i*6,2.5,6));
 headBlocks.push(rect('head-back',wallX-2,wallTop-2,6.5,28,'Head table + chairs'));
 const armSections=compactU(option)?1:2,armLength=armSections*6;
 if(usesU(option)){
  for(let j=0;j<2;j++)for(let i=0;i<armSections;i++)tables.push(rect('H'+(5+j*2+i),wallX+2.5+i*6,wallTop+j*21.5,6,2.5));
  if(outsideOnly(option)){
   headBlocks.push(rect('head-rear',wallX+2.5,wallTop-2,armLength,4.5,'Rear-lobby arm + chairs'));
   headBlocks.push(rect('head-front',wallX+2.5,wallTop+21.5,armLength,4.5,'Front-lobby arm + chairs'));
  }else{
   headBlocks.push(rect('head-rear',wallX+2.5,wallTop-2,armLength+2,6.5,'Rear-lobby arm + chairs'));
   headBlocks.push(rect('head-front',wallX+2.5,wallTop+19.5,armLength+2,6.5,'Front-lobby arm + chairs'));
  }
 }
 const headEnd=usesU(option)?wallX+4.5+armLength:wallX+4.5;
 const lane=rect('view-lane',headEnd,cy-9,Math.max(0,dance.x-headEnd),18,'Keep centre open');
 const cake={id:'cake',type:'circle',x:W-2.1,y:stage.y+stage.h+3.4,r:1.4,label:'Cake'};
 // Opening visible on the PDF at about x=1070–1110, between the kitchen and Monza.
 const kitchenX=W*188/520;
 const catering=rect('catering-apron',kitchenX-3,D-8,6,8,'Kitchen door / turning space');
 const serviceLane=rect('service-lane',0,D-4,kitchenX+3,4,'4-ft catering route');
 const wallRoute=rect('wall-route',0,0,5,D,'5-ft route behind head table');
 // Boba: STAFF against the rear (top) wall in the corner by the rear-lobby door,
 // cart in front of them (may intrude on the blue reserved space). The QUEUE runs
 // along the blue 5-ft wall-route strip on the left wall, south of the door opening.
 const inside=bobaInMonza(option);
 const bobaService=inside?rect('boba-service',0,0,6,2.5,'Boba staff space (against the wall)'):null;
 const boba=inside?rect('boba',0,2.5,6,2.5,'Boba cart'):null;
 const bobaQueue=inside?rect('boba-queue',0,8.5,3.5,6,'Boba queue (on the wall-route strip)'):null;
 const bobaArea=inside?rect('boba-working',0,0,6,5,'Boba cart and staff'):null;
 const doors=[rect('front-entry',-extra,D*.88,extra+5,D*.12,'Front lobby approach'),rect('rear-entry',-extra,0,extra+5,D*.14,'Rear lobby approach'),rect('patio-front',W-6,D-6,6,6,'Patio-side approach'),rect('patio-rear',W-6,0,6,6,'Patio-side approach')];
 const protectedAreas=[catering,serviceLane,wallRoute,...(bobaArea?[bobaArea]:[]),...doors];
 return {W,D,cy,extra,stage,dance,cake,lane,tables,headBlocks,wallX,wallTop,doors,kitchenX,catering,serviceLane,wallRoute,boba,bobaService,bobaQueue,bobaArea,protectedAreas,blocks:[stage,dance,cake,lane,...headBlocks,...protectedAreas]};
}
function shape(id,option,x,y,rot=0,settings={}){
 settings=optionSettings(option,settings);
 const k=settings.roundGuests&&!long.has(id)?'round':kind(id,option);
 // Banquet guests sit on long sides only. No chairs project past the table ends.
 if(k!=='round'){const w=k==='long'?12:6,h=6.5;return rect(id,x-(rot?h:w)/2,y-(rot?w:h)/2,rot?h:w,rot?w:h,'Table '+id.slice(1)+' + chairs');}
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
function audit(W,option,positions,settings={}){
 const f=fixed(W,option,settings),items=Object.entries(positions).map(([id,p])=>shape(id,option,p.x,p.y,p.rot,settings)),issues=[];
 const protectedIds=new Set([...f.protectedAreas.map(x=>x.id),'view-lane']);
 const laneOK=new Set((options[option]||{}).laneTables||[]);
 for(let i=0;i<items.length;i++){
  const a=items[i],b=bounds(a),edge=Math.min(b.l,W-b.r,b.t,f.D-b.b);
  if(edge<-.05)issues.push({a:a.id,b:'wall',gap:edge,hard:true});
  for(const ob of f.blocks){if(ob.id==='view-lane'&&laneOK.has(a.id))continue;const d=distance(a,ob);if(d<-.05)issues.push({a:a.id,b:ob.id,gap:d,hard:true});else if(d<GAP-.05&&!protectedIds.has(ob.id))issues.push({a:a.id,b:ob.id,gap:d,hard:false});}
  for(let j=i+1;j<items.length;j++){const d=distance(a,items[j]);if(d<GAP-.05)issues.push({a:a.id,b:items[j].id,gap:d,hard:d<-.05});}
 }
 for(const h of f.headBlocks)for(const ob of [f.dance,...f.protectedAreas]){const d=distance(h,ob);if(d<-.05)issues.push({a:h.id,b:ob.id,gap:d,hard:true});}
 const minGap=Math.min(...items.flatMap((a,i)=>items.slice(i+1).map(b=>distance(a,b))));
 const routeClear=!issues.some(i=>i.hard&&['catering-apron','service-lane','wall-route','front-entry','rear-entry','boba-working'].includes(i.b));
 return {hard:issues.filter(x=>x.hard).length,tight:issues.filter(x=>!x.hard).length,minGap,routeClear,issues};
}
const api={ASPECT,ROOM_WIDTH,R,GAP,options,mix,long,usesU,compactU,outsideOnly,bobaInMonza,kind,fixed,shape,bounds,distance,audit};
if(typeof module!=='undefined')module.exports=api;else root.SeatingModel=api;
})(globalThis);
