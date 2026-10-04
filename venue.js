/* Vendor drawing coordinates. Furniture uses the 50-ft working scale, not surveyed dimensions. */
(function(root){
 const scale=520/50;
 const rooms={
  doria:{name:'Doria',x:270,y:205,w:285,h:375},
  alba:{name:'Alba',x:270,y:705,w:285,h:440},
  patio:{name:'Patio',x:1428,y:390,w:205,h:560}
 };
 const tables=[];
 function add(room,kind,points){for(const [x,y] of points)tables.push({room,kind,x,y,id:room+'-'+kind+'-'+(tables.length+1)});}
 add('doria','high',[[326,238],[498,238],[326,342],[498,342]]);
 add('doria','low',[[326,436],[498,436],[326,536],[498,536]]);
 add('alba','high',[[326,760],[326,830],[498,760],[498,878]]);
 add('alba','low',[[326,1030],[498,988],[312,1106]]);
 add('patio','high',[[1475,448],[1586,448],[1475,760],[1586,760]]);
 add('patio','low',[[1475,604],[1586,604],[1586,898]]);
 const stations=[
  {id:'welcome',n:1,x:807,y:304,w:26,h:62,title:'SEATING CHART',lines:['Left as you enter','Eric & Meg photos'],detail:'Seating chart and photos of Eric and Meg, on the left as guests walk in.'},
  {id:'mirror',n:2,x:814,y:269,w:13,h:29,title:'WELCOME MIRROR',lines:['Beside station 1'],detail:'Welcome mirror beside the seating-chart table.'},
  {id:'memorial',n:3,x:584,y:402,w:62,h:26,title:'MEMORY TABLE',lines:['Back right as you enter'],detail:'Memory table at the back right as guests walk in.'},
  {id:'guestbook',n:4,x:676.2,y:303.2,w:41.6,h:41.6,shape:'round',title:'GUEST BOOK',lines:['Round table in the middle','Eric & Meg photos'],detail:'Round table in the middle with the guest book, photos of Eric and Meg, and the Instax camera, film and pens.'},
  {id:'bar',n:5,x:274,y:880,w:43,h:86,title:'BAR',lines:['Far wall of Alba'],detail:'Bar on the far wall of Alba, across from the door to the front lobby.'},
  {id:'boba',n:6,x:381,y:1099,w:62.4,h:26,title:'BOBA CART',lines:['Front of Alba','By the windows'],detail:'Boba cart at the front of Alba by the windows. Staff stand behind the cart; the line forms beside it.'},
  {id:'booth',n:7,x:568,y:916,w:83.2,h:83.2,title:'PHOTO BOOTH',lines:['8 × 8 ft working area'],detail:'Photo booth in the front lobby.'},
  {id:'trio',n:8,x:562,y:1082,w:80,h:60,title:'JAZZ TRIO',lines:['Front lobby corner · cocktail hour'],detail:'Jazz trio in the corner of the front lobby for cocktail hour.'}
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
  {id:'boba-queue',x:449,y:1093,w:62.4,h:36},
  {id:'booth-queue',x:662,y:936,w:41.6,h:62.4},
  {id:'bar-queue',x:321,y:880,w:38,h:86}
 ];
 const counts=Object.fromEntries(Object.keys(rooms).map(id=>[id,{high:tables.filter(t=>t.room===id&&t.kind==='high').length,low:tables.filter(t=>t.room===id&&t.kind==='low').length}]));
 const views={all:{label:'Whole venue',box:'225 155 1440 1045'},arrival:{label:'Welcome lobby',box:'540 170 320 290'},alba:{label:'Alba · bar & boba',box:'245 680 330 490'},lobby:{label:'Front lobby · photo booth & trio',box:'540 890 320 270'}};
 const api={scale,rooms,tables,stations,routes,queues,counts,views};
 if(typeof module!=='undefined')module.exports=api;else root.VenuePlan=api;
})(globalThis);
