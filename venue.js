/* Vendor drawing coordinates. Furniture uses the 50-ft working scale, not surveyed dimensions. */
(function(root){
 const scale=520/50;
 const M=typeof module!=='undefined'?require('./model.js'):root.SeatingModel;
 const monza=M.fixed(M.ROOM_WIDTH,'u');
 const venueRect=r=>({x:900+r.x*scale,y:350+r.y*scale,w:r.w*scale,h:r.h*scale});
 const rooms={
  doria:{name:'Doria',x:270,y:205,w:285,h:375},
  alba:{name:'Alba',x:270,y:705,w:285,h:440},
  patio:{name:'Patio',x:1428,y:390,w:205,h:560}
 };
 const tables=[];
 function add(room,kind,points){for(const [x,y] of points)tables.push({room,kind,x,y,id:room+'-'+kind+'-'+(tables.length+1)});}
 add('doria','high',[[326,238],[498,238],[326,342],[498,342]]);
 add('doria','low',[[326,436],[498,436],[326,536],[498,536]]);
 add('alba','high',[[326,760],[326,878],[498,878],[326,988]]);
 add('alba','low',[[498,988],[326,1105],[498,1105]]);
 add('patio','high',[[1475,448],[1586,448],[1475,760],[1586,760]]);
 add('patio','low',[[1475,604],[1586,604],[1586,898]]);
 const stations=[
  {id:'welcome',n:1,x:807,y:304,w:26,h:62,title:'SEATING CHART',lines:['Left as you enter','Eric & Meg photos'],detail:'One 6-ft table on your left as you enter, with the seating chart and photos of Eric and Meg. This is the right side of the vendor-oriented drawing.'},
  {id:'mirror',n:2,x:814,y:269,w:13,h:29,title:'WELCOME MIRROR',lines:['Beside station 1'],detail:'Freestanding welcome mirror beside seating-chart table 1 in the rear welcome lobby. Allow space for its stand and guests viewing the seating chart.'},
  {id:'memorial',n:3,x:584,y:402,w:62,h:26,title:'MEMORY TABLE',lines:['Back right as you enter'],detail:'One 6-ft memory table at the back right as you enter, in the quieter far corner. This is the lower-left corner of the vendor-oriented drawing.'},
  {id:'guestbook',n:4,x:676.2,y:303.2,w:41.6,h:41.6,shape:'round',title:'GUEST BOOK',lines:['Round table in the middle','Eric & Meg photos'],detail:'One round table in the middle of the entrance lobby for the guest book, photos of Eric and Meg, and the Polaroid camera, film and pens. A 4-ft diameter is shown; the walking routes pass around it.'},
  {id:'boba',n:5,...venueRect(monza.boba),title:'BOBA CART',lines:['Inside Monza','Near rear-lobby entry'],detail:'Boba cart inside Monza near the rear-lobby entry. A 6 × 2.5-ft cart, 2.5-ft staff space and separate 3.5-ft-deep queue are reserved alongside the 5-ft walking route. Confirm the supplier footprint and service direction.'},
  {id:'booth',n:6,x:568,y:916,w:83.2,h:83.2,title:'PHOTO BOOTH',lines:['8 × 8 ft working area'],detail:'Photo booth in the front lobby near the bar. Reserve an 8 × 8-ft working area and a separate 4 × 6-ft queue; confirm the actual booth footprint.'},
  {id:'bar',n:7,x:792,y:992,w:43,h:86,title:'BAR',lines:['Existing location'],detail:'Bar stays in its current front-lobby position. Keep its queue against this side of the lobby.'},
  {id:'trio',n:8,x:420,y:716,w:104,h:83.2,title:'JAZZ TRIO',lines:['Alba · cocktail hour'],detail:'Jazz trio at the upper end of Alba, facing into the room. Reserve an initial 10 × 8-ft area; confirm instruments, power and sound needs.'}
 ];
 // Blue routes and amber queues are kept separate from station furniture.
 const routes=[
  {id:'arrival',points:'697,205 697,279 747,279 747,395 840,395',width:42},
  {id:'arrival-doria',points:'697,269 620,269 620,290 555,290',width:40},
  {id:'arrival-corridor',points:'747,395 697,395 697,438',width:40},
  {id:'doria-entry',points:'555,290 410,290 410,577',width:40},
  {id:'alba-entry',points:'555,1046 410,1046 410,836',width:40},
  {id:'bar-lobby',points:'555,1046 726,1046 726,940 840,940',width:40}
 ];
 const queues=[
  {id:'boba-queue',...venueRect(monza.bobaQueue),room:'monza'},
  {id:'booth-queue',x:662,y:936,w:41.6,h:62.4},
  {id:'bar-queue',x:750,y:992,w:38,h:86}
 ];
 const counts=Object.fromEntries(Object.keys(rooms).map(id=>[id,{high:tables.filter(t=>t.room===id&&t.kind==='high').length,low:tables.filter(t=>t.room===id&&t.kind==='low').length}]));
 const views={all:{label:'Whole venue',box:'225 155 1440 1045'},arrival:{label:'Welcome lobby',box:'540 170 320 290'},boba:{label:'Monza entry & boba',box:'810 330 360 225'},alba:{label:'Alba & bar',box:'245 675 660 525'}};
 const api={scale,rooms,tables,stations,routes,queues,counts,views};
 if(typeof module!=='undefined')module.exports=api;else root.VenuePlan=api;
})(globalThis);
