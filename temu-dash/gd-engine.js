/* Temu Dash: parser de Geometry Dash y motor Canvas 2D.
   Las físicas son aproximadas; no usan código interno de RobTop. */
(() => {
'use strict';
const $=s=>document.querySelector(s),canvas=$('#c'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,FLOOR=438,TILE=30,PLAYER_X=164,SIZE=30,PHYSICS_HZ=240,STEP=1/240,Y_SCALE=.225,WORLD_CEILING=FLOOR-28;
const MODE_NAMES={cube:'Cubo',ship:'Nave',ball:'Bola',ufo:'UFO',wave:'Wave',robot:'Robot',spider:'Araña',swing:'Swing'};
const PORTALS={
  45:['mirror',1,'#ff9833'],46:['mirror',-1,'#4b9dff'],
  12:['mode','cube','#50ff98'],13:['mode','ship','#ff55e8'],47:['mode','ball','#ffad45'],111:['mode','ufo','#50efff'],
  660:['mode','wave','#c96aff'],745:['mode','robot','#ff9a52'],1331:['mode','spider','#c8d4e8'],1933:['mode','swing','#d18bff'],
  10:['gravity',-1,'#4b9dff'],11:['gravity',1,'#ffe35b'],99:['size',1,'#64f78c'],101:['size',.6,'#ff78d7'],
  200:['speed',.7,'#63a7ff'],201:['speed',.9,'#e9f1ff'],202:['speed',1.1,'#ffad45'],203:['speed',1.3,'#ff73a9'],1334:['speed',1.6,'#c96aff'],
  286:['dual',1,'#ffe45a'],287:['dual',0,'#4b9dff'],747:['teleport',0,'#4b9dff'],749:['teleport',0,'#ffe45a']
};
const INVISIBLE_HAZARDS=new Set([144,145,459,740,741,742]);
const INVISIBLE_SOLIDS=new Set([146,147,204,206,673,674]);
const SPIKE_SIZE={39:.65,103:.65,145:.55,177:1,178:.65,179:.5,216:1,217:.65,218:.5,392:.35,458:.35,459:.35};
const HAZARDS=new Set([8,9,39,61,88,89,98,103,135,144,145,151,152,153,154,155,156,177,178,179,216,217,218,243,244,363,364,365,366,367,368,392,397,398,399,421,422,446,447,458,459,667,720,740,741,742,768,918,919,991,1327,1328,1701,1702,1703,1705,1706,1707,1708,1709,1710,1711,1712,1713,1714,1715,1716,1717,1718,1719,1720,1721,1722,1723,1724,1725,1726,1727,1728,1729,1730,1731,1732,1733,1734,1735,1736]);
const SAWS=new Set([88,89,98,154,155,156,740,741,742,1705,1706,1707,1734,1735,1736]);
const CIRCLE_HAZARDS=new Set([...SAWS,446,447,1702,1728,1729]);
const WIDE_RECT_HAZARDS=new Set([421,422,768,918,919,1328,1725,1726,1727]);
const SAW_RADII={88:21.6,89:32.3,98:12,154:21.6,155:15,156:10,446:15,447:11,740:21.6,741:15,742:10,1702:15,1705:21.6,1706:32.3,1707:12,1728:15,1729:15,1734:32,1735:17.51,1736:12};
const SLOPES=new Set([289,291,294,295,305,307,326,327,349,351,371,372,665,666,673,674,713,714,715,716,730,731,732,733,762,763,771,772,877,878,888,889,895,896,1014,1015,1033,1034,1338,1339,1743,1744,1745,1746,1747,1748,1749,1750]);
const SLOPE_WIDE=new Set([291,295,307,351,372,666,674,714,716,731,733,763,772,878,889,896,1015,1339,1744,1746,1748,1750]);
const SLOPE_HAZARDS=new Set([363,364,366,367,991,1717,1718,1723,1724,1732,1733]);
const RECT_HAZARDS=new Set([9,151,152,153,243,244,365,368,397,398,399,421,422,667,720,768,918,919,1327,1328,1701,1708,1709,1710,1711,1712,1713,1714,1715,1716,1719,1720,1721,1722,1725,1726,1727,1730,1731]);
const ONE_WAY_SOLIDS=new Set([143]);
const SOLIDS=new Set([1,2,3,4,5,6,7,40,62,63,64,65,66,68,69,70,71,72,73,74,75,76,77,78,80,81,82,83,90,91,92,93,94,95,96,116,117,118,119,120,121,122,143,146,147,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,192,195,196,197,204,206,207,208,209,210,211,212,213,215,219,220,247,248,249,250,251,252,253,255,256,257,258,259,260,261,263,264,265,266,267,268,269,270,271,272,274,275,279,280,281,282,369,370,467,468,469,470,471,472,653,654,655,656,657,658,659,661,662,663,664,722,723,724,734,735,736,737,738,769,770,807,808,809,810,811,812,880,881,882,883,884,885,890,891,903,904,905,911,916,917,1903]);
const HALF_HEIGHT_BLOCKS=new Set([40,68,147,192,196,204,215,219,369,370,662,663,664,735]);
const SMALL_BLOCKS=new Set([195,206,220,724,736,916,917]);
const THREE_QUARTER_WIDTH_BLOCKS=new Set([197]);
const ORBS={36:['jump',1,'#ffe45c'],141:['jump',.66,'#ff70de'],84:['gravity',-1,'#58aaff'],1022:['gravity',1,'#65ff78'],1333:['jump',1.25,'#ff5252'],1330:['gravity',1,'#292d3d'],1704:['dash',1,'#62ff61'],1751:['dash',-1,'#ff5a8a']};
const PADS={35:['jump',1,'#ffe45c'],140:['jump',.7,'#ff70de'],67:['gravity',-1,'#58aaff'],1332:['jump',1.25,'#ff5252']};
const COINS=new Set([1329,142]);
const S={objects:[],name:'Entrega Express',id:'',width:2700,x:90,y:0,vy:0,mode:'cube',gravity:1,speed:1,size:1,grounded:true,active:false,paused:false,dead:false,complete:false,held:false,pendingPress:false,progress:0,tries:0,coins:0,time:0,activated:new Set(),usedOrbs:new Set(),pads:new Set(),lastInput:false,dual:false,robotHoverTicks:0,robotHoverEnded:false,source:'demo'};
let musicUrl=null,lastTime=0,accumulator=0;
function setStatus(t){$('#gameStatus').textContent=t}
function stats(){$('#progress').textContent=Math.floor(S.progress)+'%';$('#attempts').textContent=S.tries;$('#coins').textContent=S.coins;$('#modeLabel').textContent=MODE_NAMES[S.mode]+(S.gravity<0?' · gravedad invertida':'')}
function obj(id,x,y,extra){return Object.assign({id,x,y,r:0,fx:0,fy:0,scale:1,raw:{}},extra||{})}
function demos(name){
 const a=[],add=(id,x,y,e)=>a.push(obj(id,x,y,e));
 if(name==='Reembolso Imposible'){[[1,330,15],[1,360,15],[8,460,15],[35,580,15],[8,700,15],[141,835,92],[8,965,15],[13,1110,45],[8,1330,15],[1,1440,45],[1,1470,45],[8,1610,15],[12,1800,45],[88,1970,50],[8,2130,15],[34,2520,15]].forEach(v=>add(...v));}
 else if(name==='Descuento del 99%'){[[1,300,15],[8,410,15],[8,470,15],[36,565,76],[8,680,15],[111,790,45],[35,930,15],[8,1050,15],[660,1170,45],[1,1320,75],[1,1350,75],[8,1490,15],[47,1620,45],[745,1770,45],[1331,1910,45],[1933,2050,45],[34,2450,15]].forEach(v=>add(...v));}
 else {[[1,310,15],[8,420,15],[8,535,15],[35,650,15],[8,765,15],[36,850,90],[8,975,15],[1,1090,15],[1,1120,15],[8,1240,15],[13,1390,45],[8,1580,15],[12,1720,45],[1,1840,15],[8,1980,15],[34,2350,15]].forEach(v=>add(...v));}
 return a.sort((a,b)=>a.x-b.x)
}
function reset(){
 S.x=90;S.y=0;S.vy=0;S.mode='cube';S.gravity=1;S.speed=.9;S.size=1;S.grounded=true;S.active=true;S.paused=false;S.dead=false;S.complete=false;S.held=false;S.pendingPress=false;S.progress=0;S.time=0;S.activated.clear();S.usedOrbs.clear();S.pads.clear();S.lastInput=false;S.dual=false;S.robotHoverTicks=0;S.robotHoverEnded=false;accumulator=0;$('#pause').textContent='PAUSAR';stats();
 const m=$('#music');$('#musicStatus').textContent=m.src?'Nivel iniciado':'Nivel iniciado · sin música';if(m.src){try{m.currentTime=0;m.play().catch(()=>{})}catch(_){}}
 setStatus('¡A jugar! Los modos, las físicas y algunas colisiones son aproximados.')
}
function demo(name){S.name=name;S.id='';S.objects=demos(name);S.width=Math.max(2700,...S.objects.map(o=>o.x+130));S.source='demo';$('#loadedLevel').textContent='Nivel de prueba local';reset()}
function loadParsed(name,id,objects,source){
 if(!objects.length)throw new Error('No encontré objetos válidos dentro de los datos.');
 S.name=name||'Nivel descargado';S.id=id||'';S.objects=objects.sort((a,b)=>a.x-b.x);S.width=Math.max(1200,...objects.map(o=>o.x+120));S.source=source||'archivo';
 $('#loadedLevel').textContent=S.name+(S.id?' · ID '+S.id:'')+' · '+objects.length+' objetos';reset();
 setStatus('Nivel cargado con '+objects.length+' objetos. Las físicas y triggers avanzados todavía son aproximados.')
}
function parseObjects(text){
 const out=[];
 for(const piece of String(text).split(';')){
  const t=piece.split(',');if(t.length<6||t.length%2)continue;const raw={};
  for(let i=0;i+1<t.length;i+=2)if(/^\d+$/.test(t[i].trim()))raw[t[i].trim()]=t[i+1].trim();
  const id=Number(raw[1]),x=Number(raw[2]),y=Number(raw[3]);if(!raw[1]||![id,x,y].every(Number.isFinite))continue;
  out.push(obj(id,x,y,{r:Number(raw[6]||0),fx:Number(raw[4]||0),fy:Number(raw[5]||0),scale:Number(raw[32]||1),raw}))
 }
 return out
}
function responsePairs(raw){const out={},t=String(raw).split('#')[0].split(':');for(let i=0;i+1<t.length;i+=2)out[t[i]]=t[i+1];return out}
function extractPayload(p){
 if(p&&typeof p==='object'){
  if(typeof p.data==='string')return p.data;if(typeof p.levelData==='string')return p.levelData;
  if(typeof p.encodedLevel==='string'){let s=p.encodedLevel;if(s.includes('4:')&&s.includes('#')){const q=responsePairs(s);if(q[4])return q[4]}return s}
  if(typeof p.level==='string')return p.level;
 }
 if(typeof p==='string'){const s=p.trim();if(s.startsWith('{')){try{return extractPayload(JSON.parse(s))}catch(_){}}
  if(s.includes('#')&&s.includes('4:')){const q=responsePairs(s);if(q[4])return q[4]}return s}
 throw new Error('No encontré los datos del nivel en el archivo.')
}
async function decodeLevel(p){
 let s=extractPayload(p).trim();
 if(s.includes(';')&&s.includes(',')&&!/^[A-Za-z0-9_+/=-]+$/.test(s))return s;
 if(s.startsWith('kA4,')||s.startsWith('1,'))return s;
 if(!('DecompressionStream'in window))throw new Error('Este navegador no puede descomprimir los datos del nivel. Actualiza Chrome.');
 s=s.replace(/\s/g,'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';
 const run=async(b64,format)=>{const bin=atob(b64),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));return new Response(stream).text()};
 const formats=['gzip','deflate','deflate-raw'];
 for(const format of formats){try{return await run(s,format)}catch(_){}}
 // Algunos formatos históricos pueden contener un prefijo gzip incompleto.
 const candidates=['H4sIAAAAAAAAA'+s,'H4sIAAAAAAAAC'+s];
 for(const candidate of candidates){for(const format of formats){try{return await run(candidate,format)}catch(_){}}}
 throw new Error('Los datos llegaron, pero no se pudieron descomprimir como GZIP/Deflate. Puede ser un formato distinto o un nivel truncado.')
}
async function loadPayload(p,n,id,source){const inner=await decodeLevel(p);loadParsed(n||(p&&p.name)||'Nivel descargado',id||(p&&p.id)||'',parseObjects(inner),source)}
function scrY(y){return FLOOR-y}
function onScreen(o){const x=PLAYER_X+o.x-S.x;return x>-100&&x<W+100}
function background(){
 const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#172449');grad.addColorStop(1,'#070b18');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(82,111,178,.20)';const off=S.x%TILE;
 for(let x=-off;x<W;x+=TILE){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
 for(let y=0;y<H;y+=TILE){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 ctx.fillStyle='#101a34';ctx.fillRect(0,FLOOR,W,H-FLOOR);ctx.fillStyle='#50f6ff';ctx.fillRect(0,FLOOR,W,4)
}
function drawBlock(o,x,y,size,height=size){
 ctx.fillStyle=o.id===1?'#46c6df':['#6078c9','#5669af','#374c90','#4563aa','#34517e','#293c70'][Math.abs(o.id)%6];ctx.fillRect(x-size/2,y-height/2,size,height);
 ctx.strokeStyle='#8befff';ctx.lineWidth=2;ctx.strokeRect(x-size/2+1,y-height/2+1,Math.max(0,size-2),Math.max(0,height-2));ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(x-size/2+3,y-height/2+3,Math.max(0,size-6),Math.min(5,Math.max(0,height-6)))
}
function drawHazard(o,x,y,z){
 ctx.save();ctx.translate(x,y);ctx.rotate((o.r||0)*Math.PI/180);
 if(SLOPE_HAZARDS.has(o.id)){const w=SLOPE_WIDE.has(o.id)?z*2:z;ctx.fillStyle='#ff4f84';ctx.strokeStyle='#ffd6e0';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-w/2,z/2);ctx.lineTo(w/2,z/2);ctx.lineTo(w/2,-z/2);ctx.closePath();ctx.fill();ctx.stroke();}
 else if(RECT_HAZARDS.has(o.id)){const w=WIDE_RECT_HAZARDS.has(o.id)?z*2:z;ctx.fillStyle='#ff4f84';ctx.strokeStyle='#ffd6e0';ctx.lineWidth=1.5;ctx.fillRect(-w/2,-z/2,w,z);ctx.strokeRect(-w/2,-z/2,w,z);}
 else if(SAWS.has(o.id)){ctx.rotate(S.time*3);ctx.fillStyle='#ff4f84';ctx.strokeStyle='#ffd6e0';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12,r=(i%2?z*.36:z*.51),xx=Math.cos(a)*r,yy=Math.sin(a)*r;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#1b2442';ctx.beginPath();ctx.arc(0,0,z*.18,0,Math.PI*2);ctx.fill();}
 else if(CIRCLE_HAZARDS.has(o.id)){ctx.fillStyle='#ff4f84';ctx.strokeStyle='#ffd6e0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,z*.46,0,Math.PI*2);ctx.fill();ctx.stroke();}
 else{ctx.fillStyle='#ff4fc8';ctx.strokeStyle='#ffd0f1';ctx.lineWidth=1.5;ctx.beginPath();if(o.fy){ctx.moveTo(-z/2,-z/2);ctx.lineTo(z/2,-z/2);ctx.lineTo(0,z/2)}else{ctx.moveTo(-z/2,z/2);ctx.lineTo(z/2,z/2);ctx.lineTo(0,-z/2)}ctx.closePath();ctx.fill();ctx.stroke()}
 ctx.restore()
}
function drawSlope(o){
 const pts=slopeVertices(o).map(v=>[PLAYER_X+v.x-S.x,FLOOR-v.y]);
 ctx.fillStyle='#4563aa';ctx.strokeStyle='#8befff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.stroke();
}
function drawObj(o){
 if(!onScreen(o))return;const x=PLAYER_X+o.x-S.x,y=scrY(o.y),z=30*(o.scale||1),p=PORTALS[o.id];
 if(INVISIBLE_HAZARDS.has(o.id)||INVISIBLE_SOLIDS.has(o.id))return;
 if(p){ctx.save();ctx.translate(x,y);ctx.strokeStyle=p[2];ctx.lineWidth=5;ctx.shadowColor=p[2];ctx.shadowBlur=14;ctx.beginPath();ctx.ellipse(0,0,13,33,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=.22;ctx.fillStyle=p[2];ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText(p[0]==='mode'?p[1].toUpperCase():p[0].toUpperCase(),0,48);ctx.restore();return}
 if(HAZARDS.has(o.id)){const hz=z*(SPIKE_SIZE[o.id]||1);drawHazard(o,x,y,CIRCLE_HAZARDS.has(o.id)?Math.max(hz,sawRadius(o)*2):hz);return}
 if(ORBS[o.id]){ctx.strokeStyle=ORBS[o.id][2];ctx.lineWidth=4;ctx.shadowColor=ORBS[o.id][2];ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;return}
 if(PADS[o.id]){ctx.fillStyle=PADS[o.id][2];ctx.beginPath();ctx.moveTo(x-16,y+7);ctx.lineTo(x+16,y+7);ctx.lineTo(x+9,y-6);ctx.lineTo(x-9,y-6);ctx.closePath();ctx.fill();return}
 if(COINS.has(o.id)){ctx.strokeStyle='#ffe56a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.stroke();return}
 if(SOLIDS.has(o.id)){const hs=objectHalfSize(o);drawBlock(o,x,y,hs.hx*2,hs.hy*2);return}
 if(SLOPES.has(o.id)){drawSlope(o);return}
 ctx.fillStyle='rgba(180,194,230,.35)';ctx.fillRect(x-4,y-4,8,8)
}
function drawPlayer(){
 const w=SIZE*S.size,h=w,x=PLAYER_X-w/2,y=scrY(S.y)-h;ctx.save();ctx.translate(x+w/2,y+h/2);
 if(['cube','robot'].includes(S.mode)){ctx.rotate(S.grounded?Math.round(S.x/30)*Math.PI/2:S.time*5);ctx.fillStyle='#50f6ff';ctx.shadowColor='#50f6ff';ctx.shadowBlur=15;ctx.fillRect(-w/2,-h/2,w,h);ctx.shadowBlur=0;ctx.fillStyle='#10172b';ctx.fillRect(-w*.25,-h*.1,w*.16,h*.16);ctx.fillRect(w*.09,-h*.1,w*.16,h*.16);}
 else if(S.mode==='ball'){ctx.fillStyle='#ffad45';ctx.strokeStyle='#fff1c9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,w*.48,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#5a2d27';ctx.beginPath();ctx.moveTo(-w*.35,0);ctx.lineTo(w*.35,0);ctx.stroke()}
 else if(S.mode==='ufo'){ctx.fillStyle='#50efff';ctx.beginPath();ctx.ellipse(0,0,w*.45,h*.28,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(0,-h*.17,w*.22,h*.22,0,Math.PI,Math.PI*2);ctx.fill()}
 else if(S.mode==='wave'){ctx.fillStyle='#c96aff';ctx.beginPath();ctx.moveTo(-w*.45,-h*.35);ctx.lineTo(w*.48,0);ctx.lineTo(-w*.45,h*.35);ctx.closePath();ctx.fill()}
 else if(S.mode==='ship'||S.mode==='swing'){ctx.fillStyle=S.mode==='ship'?'#ff55e8':'#d18bff';ctx.beginPath();ctx.moveTo(w*.48,0);ctx.lineTo(-w*.4,-h*.35);ctx.lineTo(-w*.2,0);ctx.lineTo(-w*.4,h*.35);ctx.closePath();ctx.fill()}
 else{ctx.fillStyle='#c8d4e8';ctx.fillRect(-w*.35,-h*.35,w*.7,h*.7);ctx.strokeStyle='#c8d4e8';ctx.lineWidth=3;for(let i of [-1,1]){ctx.beginPath();ctx.moveTo(i*w*.25,h*.22);ctx.lineTo(i*w*.48,h*.47);ctx.stroke()}}
 ctx.restore()
}
function draw(){
 background();S.objects.forEach(drawObj);drawPlayer();
 ctx.fillStyle='rgba(4,8,20,.55)';ctx.fillRect(15,14,300,55);ctx.fillStyle='#fff';ctx.font='bold 16px system-ui';ctx.fillText(S.name,27,36);ctx.fillStyle='#aebde0';ctx.font='12px system-ui';ctx.fillText(MODE_NAMES[S.mode]+' · velocidad x'+S.speed.toFixed(2)+(S.gravity<0?' · INVERSA':''),27,56);
 if(!S.active||S.paused||S.dead||S.complete){ctx.fillStyle='rgba(3,6,17,.58)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle=S.complete?'#66ffac':'#50f6ff';ctx.font='bold 34px system-ui';ctx.fillText(S.complete?'¡NIVEL COMPLETADO!':S.dead?'¡INTÉNTALO OTRA VEZ!':S.paused?'PAUSADO':'TEMU DASH',W/2,H/2-8);ctx.fillStyle='#e7edff';ctx.font='16px system-ui';ctx.fillText(S.complete?'Pulsa JUGAR para repetir':S.dead?'Pulsa JUGAR para reintentar':S.paused?'Pulsa CONTINUAR':'Elige un nivel y pulsa JUGAR',W/2,H/2+26);ctx.textAlign='left'}
}
function playerHalfX(){
 const scale=S.size;
 if(S.mode==='wave')return S.size<1?2:5;
 if(S.mode==='spider')return 13.5*scale;
 return 15*scale;
}
function playerHalfY(){
 const scale=S.size;
 if(S.mode==='wave')return S.size<1?2:5;
 if(S.mode==='spider')return 13.5*scale;
 return 15*scale;
}
function box(){
 const hx=playerHalfX(),hy=playerHalfY();
 return {l:S.x-hx,r:S.x+hx,b:S.y,t:S.y+2*hy,cx:S.x,cy:S.y+hy,hx,hy};
}
function objectHalfSize(o){
 const scale=o.scale||1,size=30*scale;
 if(o.id===143)return {hx:size/2,hy:size/2};
 if(SLOPES.has(o.id))return {hx:(SLOPE_WIDE.has(o.id)?30:15)*scale,hy:15*scale};
 if(SMALL_BLOCKS.has(o.id))return {hx:size*.25,hy:size*.25};
 const hx=THREE_QUARTER_WIDTH_BLOCKS.has(o.id)?size*.375:size/2;
 const hy=HALF_HEIGHT_BLOCKS.has(o.id)?size*.25:size/2;
 return {hx,hy};
}
function obox(o){
 const hs=objectHalfSize(o);
 return {l:o.x-hs.hx,r:o.x+hs.hx,b:o.y-hs.hy,t:o.y+hs.hy,cx:o.x,cy:o.y,hx:hs.hx,hy:hs.hy};
}
function hit(a,b){return a.l<b.r&&a.r>b.l&&a.b<b.t&&a.t>b.b;}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function qVy(v){return Math.round(v*1000)/1000;}
function speedDx(speed){
 if(speed<.8)return 251.16/240;
 if(speed<1)return 1.29825044;
 if(speed<1.2)return 1.6142578;
 if(speed<1.45)return 468/240;
 return 576/240;
}
function cubePhysics(){
 if(S.speed>1.2)return {jump:11.23,gravity:.216};
 if(S.speed>1)return {jump:11.42,gravity:.215};
 if(S.speed<.8)return {jump:10.62,gravity:.212};
 return {jump:11.18,gravity:.216};
}
function modeGravityScale(){
 if(S.mode==='ball'||S.mode==='spider')return .6;
 if(S.mode==='robot')return .9;
 return 1;
}
function sawRadius(o){
 const base=SAW_RADII[o.id];
 return base ? base*(o.scale||1) : 12*(o.scale||1);
}
function spikeGeometry(o){
 const z=30*(o.scale||1)*(SPIKE_SIZE[o.id]||1),angle=-(o.r||0)*Math.PI/180;
 // Como en Geometry Dash, el pincho tiene un rectángulo pequeño y elevado hacia la punta.
 const offset=(o.fy?-1:1)*z*.24;
 return {cx:o.x-Math.sin(angle)*offset,cy:o.y+Math.cos(angle)*offset,hx:z*.20,hy:z*.16,angle};
}
function slopeVertices(o){
 const scale=o.scale||1,w=(SLOPE_WIDE.has(o.id)?60:30)*scale,h=30*scale,fx=o.fx?-1:1,fy=o.fy?-1:1;
 return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2]].map(v=>({x:o.x+v[0]*fx,y:o.y+v[1]*fy}));
}
function polygonRectHit(player,vertices){
 const rect=[{x:player.l,y:player.b},{x:player.r,y:player.b},{x:player.r,y:player.t},{x:player.l,y:player.t}];
 const axes=[{x:1,y:0},{x:0,y:1}];
 for(let i=0;i<vertices.length;i++){const a=vertices[i],b=vertices[(i+1)%vertices.length],dx=b.x-a.x,dy=b.y-a.y;axes.push({x:-dy,y:dx});}
 for(const axis of axes){const mag=Math.hypot(axis.x,axis.y)||1,ux=axis.x/mag,uy=axis.y/mag;let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;
  for(const p of rect){const v=p.x*ux+p.y*uy;amin=Math.min(amin,v);amax=Math.max(amax,v);}
  for(const p of vertices){const v=p.x*ux+p.y*uy;bmin=Math.min(bmin,v);bmax=Math.max(bmax,v);}
  if(amax<=bmin||bmax<=amin)return false;
 }
 return true;
}
function slopeYRangeAtX(vertices,x){
 const minX=Math.min(...vertices.map(p=>p.x)),maxX=Math.max(...vertices.map(p=>p.x)),sample=clamp(x,minX,maxX),ys=[];
 for(let i=0;i<vertices.length;i++){
  const a=vertices[i],b=vertices[(i+1)%vertices.length],dx=b.x-a.x;
  if(Math.abs(dx)<1e-8){if(Math.abs(sample-a.x)<1e-7)ys.push(a.y,b.y);continue;}
  if(sample>=Math.min(a.x,b.x)-1e-7&&sample<=Math.max(a.x,b.x)+1e-7)ys.push(a.y+(sample-a.x)*(b.y-a.y)/dx);
 }
 return ys.length?{min:Math.min(...ys),max:Math.max(...ys),minX,maxX}:null;
}
function orientedRectHit(player,shape){
 const dx=player.cx-shape.cx,dy=player.cy-shape.cy;
 const a=shape.angle||0,c=Math.cos(a),s=Math.sin(a);
 const lx=dx*c+dy*s,ly=-dx*s+dy*c;
 const rX=player.hx*Math.abs(c)+player.hy*Math.abs(s);
 const rY=player.hx*Math.abs(s)+player.hy*Math.abs(c);
 return Math.abs(lx)<shape.hx+rX && Math.abs(ly)<shape.hy+rY;
}
function circleRectHit(player,cx,cy,radius){
 const nx=clamp(cx,player.l,player.r),ny=clamp(cy,player.b,player.t);
 const dx=cx-nx,dy=cy-ny;
 return dx*dx+dy*dy<radius*radius;
}
function hazardHit(o,player){
 if(CIRCLE_HAZARDS.has(o.id))return circleRectHit(player,o.x,o.y,sawRadius(o));
 if(SLOPE_HAZARDS.has(o.id))return polygonRectHit(player,slopeVertices(o));
 if(RECT_HAZARDS.has(o.id))return orientedRectHit(player,{cx:o.x,cy:o.y,hx:(WIDE_RECT_HAZARDS.has(o.id)?30:15)*(o.scale||1),hy:15*(o.scale||1),angle:-(o.r||0)*Math.PI/180});
 // Los pinchos comunes usan un rectángulo pequeño, girado y elevado hacia la punta.
 return orientedRectHit(player,spikeGeometry(o));
}
function portalBox(o){
 return {l:o.x-12*(o.scale||1),r:o.x+12*(o.scale||1),b:o.y-30*(o.scale||1),t:o.y+30*(o.scale||1)};
}
function orbTouches(o,player){
 const radius=12*(o.scale||1);
 return circleRectHit(player,o.x,o.y,radius+1);
}
function activateOrb(o,index){
 const k='orb'+index;
 if(S.usedOrbs.has(k))return false;
 S.usedOrbs.add(k);
 if(o.id===84||o.id===1330){
   S.gravity*=-1;
   S.vy=-S.gravity*(o.id===84?4.568:3.0);
   S.grounded=false;
 }else if(o.id===1022){
   S.vy=12.5*S.gravity;S.grounded=false;
 }else if(o.id===1704||o.id===1751){
   // Dash orbs propel the player horizontally and vertically; this basic pass
   // models their strong launch without attempting every trigger combination.
   S.vy=(o.id===1704?8:-8)*S.gravity;S.grounded=false;
 }else{
   const p=cubePhysics();
   const factor=o.id===141?.8:o.id===1333?1.35:1;
   S.vy=p.jump*factor*(S.size<1?.8:1)*S.gravity;
   S.grounded=false;
 }
 return true;
}
function tryActivateOrb(tap,player){
 if(!tap)return false;
 for(let i=0;i<S.objects.length;i++){
  const o=S.objects[i];
  if(ORBS[o.id]&&orbTouches(o,player))return activateOrb(o,i);
 }
 return false;
}
function setMiniScale(next){
 const centerBefore=S.y+playerHalfY();
 S.size=next;
 S.y=centerBefore-playerHalfY();
}
function portal(o,i){
 const p=PORTALS[o.id],k='portal'+i;
 if(!p||S.activated.has(k))return;
 S.activated.add(k);
 if(p[0]==='mode'){
  S.mode=p[1];S.vy=0;S.grounded=false;S.robotHoverTicks=0;S.robotHoverEnded=false;
 }else if(p[0]==='gravity'){
  S.gravity=p[1];S.grounded=false;
 }else if(p[0]==='speed'){
  S.speed=p[1];
 }else if(p[0]==='size'){
  setMiniScale(p[1]);
 }else if(p[0]==='dual'){
  S.dual=!!p[1];
 }
 stats();
}
function die(why){
 if(S.dead||S.complete)return;
 S.active=false;S.dead=true;$('#music').pause();$('#musicStatus').textContent='Intento fallido';
 setStatus('Fallaste: '+why+'. Pulsa JUGAR / REINTENTAR.');
}
function handleInputTap(){
 if(!S.pendingPress)return {jumpFired:false,orbFired:false};
 const tap=true;S.pendingPress=false;
 const orbFired=tryActivateOrb(tap,box());
 if(orbFired)return {jumpFired:false,orbFired:true};
 let jumpFired=false;
 if((S.mode==='cube'||S.mode==='robot')&&S.grounded){
  const base=cubePhysics().jump*(S.mode==='robot'?.5:1)*(S.size<1?.8:1);
  S.vy=base*S.gravity;S.grounded=false;jumpFired=true;
  if(S.mode==='robot'){S.robotHoverTicks=67;S.robotHoverEnded=false;}
 }else if(S.mode==='ball'){
  S.gravity*=-1;S.vy=-S.gravity*3.354*(S.size<1?.8:1);S.grounded=false;jumpFired=true;
 }else if(S.mode==='spider'&&S.grounded){
  S.gravity*=-1;const height=2*playerHalfY();
  S.y=S.gravity>0?0:WORLD_CEILING-height;S.vy=0;S.grounded=true;jumpFired=true;
 }else if(S.mode==='swing'){
  const playerVy=S.vy*S.gravity;
  S.gravity*=-1;S.vy=(-.8*playerVy)*S.gravity;jumpFired=true;
 }
 return {jumpFired,orbFired:false};
}
function resolveFloorAndSolids(prevY,prevX,wasGrounded){
 const height=2*playerHalfY();
 const ceiling=WORLD_CEILING;
 let p=box();
 if(S.gravity>0){
  if(S.y<0 && (S.vy<=0||prevY>=0)){S.y=0;S.vy=0;S.grounded=true;p=box();}
 }else{
  if(S.y+height>ceiling && (S.vy>=0||prevY+height<=ceiling)){S.y=ceiling-height;S.vy=0;S.grounded=true;p=box();}
 }
 for(let i=0;i<S.objects.length;i++){
  const o=S.objects[i];
  if(!SOLIDS.has(o.id)&&!ONE_WAY_SOLIDS.has(o.id)&&!SLOPES.has(o.id))continue;
  if(Math.abs(o.x-S.x)>playerHalfX()+objectHalfSize(o).hx+6)continue;
  const b=obox(o);
  if(SLOPES.has(o.id)){
   const vertices=slopeVertices(o),yr=slopeYRangeAtX(vertices,S.x),oldYr=slopeYRangeAtX(vertices,prevX);
   if(!yr||p.r<=yr.minX||p.l>=yr.maxX)continue;
   const ridingFloor=wasGrounded&&((oldYr&&Math.abs(prevY-oldYr.max)<=1.5)||(!oldYr&&yr.max<=prevY+height+1))&&Math.abs(prevY-yr.max)<=height+3;
   const ridingCeiling=wasGrounded&&((oldYr&&Math.abs(prevY+height-oldYr.min)<=1.5)||(!oldYr&&yr.min>=prevY-1&&yr.min<=prevY+height+1))&&Math.abs((prevY+height)-yr.min)<=height+3;
   if(S.gravity>0&&S.vy<=0&&(ridingFloor||(oldYr&&prevY>=oldYr.max-.05&&S.y<=yr.max+.05)||(prevY>=yr.max-.05&&S.y<=yr.max+.05))){S.y=yr.max;S.vy=0;S.grounded=true;p=box();continue;}
   if(S.gravity<0&&S.vy>=0&&(ridingCeiling||(oldYr&&prevY+height<=oldYr.min+.05&&S.y+height>=yr.min-.05)||(prevY+height<=yr.min+.05&&S.y+height>=yr.min-.05))){S.y=yr.min-height;S.vy=0;S.grounded=true;p=box();continue;}
   if(polygonRectHit(p,vertices)){die('colisión con pendiente #'+o.id);return false;}
   continue;
  }
  const xOverlap=p.l<b.r&&p.r>b.l;
  if(!xOverlap)continue;
  if(ONE_WAY_SOLIDS.has(o.id)){
   if(S.gravity>0&&S.vy<=0&&prevY>=b.t-.05&&S.y<=b.t+.05){S.y=b.t;S.vy=0;S.grounded=true;p=box();}
   continue;
  }
  if(S.gravity>0&&S.vy<=0&&prevY>=b.t-.05&&S.y<=b.t+.05){
   S.y=b.t;S.vy=0;S.grounded=true;p=box();continue;
  }
  if(S.gravity<0&&S.vy>=0&&prevY+height<=b.b+.05&&S.y+height>=b.b-.05){
   S.y=b.b-height;S.vy=0;S.grounded=true;p=box();continue;
  }
  if(hit(p,b)){die('colisión lateral o inferior con bloque #'+o.id);return false;}
 }
 return true;
}
function physicsTick(){
 if(!S.active||S.paused)return;
 S.time+=STEP;
 let prevY=S.y;
 const prevX=S.x;
 const dx=speedDx(S.speed);
 const wasGrounded=S.grounded;
 S.x+=dx;

 // A mode/trigger input is consumed once, on a deterministic 240-Hz tick.
 const {jumpFired}=handleInputTap();
 const currentMode=S.mode;
 if(currentMode==='spider'&&jumpFired)prevY=S.y;
 S.grounded=(currentMode==='spider'&&jumpFired&&wasGrounded);
 if(currentMode==='wave'){
  const rise=(S.held?1:-1)*(S.gravity<0?-1:1)*dx;
  S.vy=rise/Y_SCALE;
  S.y+=rise;
 }else if(currentMode==='ship'){
  let pv=S.vy*S.gravity;
  const threshold=S.speed<.8?1.880398:S.speed<1?1.916398:S.speed<1.2?1.914398:1.922398;
  const switchAt=S.gravity<0?-threshold:threshold;
  const mini=S.size<1;
  const holdStrong=mini?.127:.108,holdWeak=mini?.101:.086,releaseStrong=mini?-.122:-.103,releaseWeak=mini?-.081:-.069;
  const accel=S.held?(pv<=switchAt?holdStrong:holdWeak):(pv>switchAt?releaseStrong:releaseWeak);
  pv=qVy(pv+accel);
  const factor=S.size<1?.85:1;
  pv=clamp(pv,mini?-7.529:-6.4,mini?9.412:8);
  S.vy=pv*S.gravity;
  S.y+=Y_SCALE*S.vy;
 }else if(currentMode==='ufo'){
  let pv=S.vy*S.gravity;
  const mini=S.size<1;
  const threshold=S.speed<.8?1.880398:S.speed<1?1.916398:S.speed<1.2?1.914398:1.922398;
  if(jumpFired&&pv<(mini?6.8:7.0))pv=mini?6.8:7.0;
  const accel=pv<=(S.gravity<0?-threshold:threshold)?(mini?-.101:-.086):(mini?-.152:-.129);
  pv=qVy(pv+accel);
  pv=clamp(pv,mini?-7.529:-6.4,mini?9.412:8);
  S.vy=pv*S.gravity;
  S.y+=Y_SCALE*S.vy;
 }else if(currentMode==='swing'){
  let pv=S.vy*S.gravity;
  pv=qVy(pv-(S.size<1?.129:.086));
  pv=clamp(pv,-8,8);
  S.vy=pv*S.gravity;
  S.y+=Y_SCALE*S.vy;
 }else if(currentMode==='ball'){
  if(!jumpFired)S.vy=qVy(S.vy-(.129)*S.gravity);
  S.vy=clamp(S.vy,-15,15);
  S.y+=Y_SCALE*S.vy;
 }else{
  const gravity=cubePhysics().gravity*modeGravityScale();
  if(!jumpFired){
   const before=S.vy;
   S.vy=qVy(S.vy-gravity*S.gravity);
   if(currentMode==='robot'&&S.held&&!S.robotHoverEnded&&S.robotHoverTicks>0){
    // GD's robot hover cancels normal gravity for a limited number of ticks.
    S.vy=before;S.robotHoverTicks--;
   }
  }
  S.vy=clamp(S.vy,-15,15);
  S.y+=Y_SCALE*S.vy;
 }

 // Pads are automatic; orbs are pressed. Collision is evaluated every physics tick.
 for(let i=0;i<S.objects.length;i++){
  const o=S.objects[i];
  if(PORTALS[o.id]&&hit(box(),portalBox(o)))portal(o,i);
  if(COINS.has(o.id)&&hit(box(),obox(o))){
   const k='coin'+i;if(!S.activated.has(k)){S.activated.add(k);S.coins++;stats();}
  }
  if(PADS[o.id]&&hit(box(),obox(o))){
   const k='pad'+i;
   if(!S.pads.has(k)){
    S.pads.add(k);
    if(o.id===67){S.gravity*=-1;S.vy=-S.gravity*16*(S.size<1?.8:1);}
    else {
     const impulse=o.id===35?16:o.id===140?11.2:20;
     S.vy=impulse*(S.size<1?.8:1)*S.gravity;
    }
    S.grounded=false;
   }
  }
 }

 const player=box();
 for(let i=0;i<S.objects.length;i++){
  const o=S.objects[i];
  if(!HAZARDS.has(o.id))continue;
  const close=Math.abs(o.x-player.cx)<player.hx+45;
  if(close&&hazardHit(o,player)){die('hitbox peligrosa #'+o.id);return;}
 }
 if(!resolveFloorAndSolids(prevY,prevX,wasGrounded))return;
 if(S.y < -100 || S.y > WORLD_CEILING+100){die('saliste de la zona jugable');return}
 S.progress=Math.max(0,Math.min(100,(S.x-90)/(S.width-90)*100));
 if(S.x>=S.width-30){
  S.progress=100;S.active=false;S.complete=true;$('#music').pause();$('#musicStatus').textContent='Nivel completado';
  setStatus('¡Completaste '+S.name+'!');
 }
 stats();
}
function drawHitboxes(){
 const checkbox=$('#showHitboxes');
 if(!checkbox||!checkbox.checked)return;
 const p=box(),px=PLAYER_X-p.hx,py=FLOOR-p.t;
 ctx.save();ctx.lineWidth=1.5;ctx.strokeStyle='#6dff88';ctx.strokeRect(px,py,p.r-p.l,p.t-p.b);
 for(const o of S.objects){
  if(!onScreen(o))continue;
  const sx=PLAYER_X+o.x-S.x,sy=FLOOR-o.y;
  if(CIRCLE_HAZARDS.has(o.id)){
   const r=sawRadius(o);ctx.strokeStyle='#ffd166';ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.stroke();
  }else if(SLOPE_HAZARDS.has(o.id)){
   const pts=slopeVertices(o).map(v=>[PLAYER_X+v.x-S.x,FLOOR-v.y]);ctx.strokeStyle='#ff647c';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(v=>ctx.lineTo(v[0],v[1]));ctx.closePath();ctx.stroke();
  }else if(RECT_HAZARDS.has(o.id)){
   const z=30*(o.scale||1),w=WIDE_RECT_HAZARDS.has(o.id)?z*2:z,a=(o.r||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);const pts=[[-w/2,-z/2],[w/2,-z/2],[w/2,z/2],[-w/2,z/2]].map(v=>[sx+v[0]*c-v[1]*s,sy-v[0]*s-v[1]*c]);ctx.strokeStyle='#ff647c';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(v=>ctx.lineTo(v[0],v[1]));ctx.closePath();ctx.stroke();
  }else if(HAZARDS.has(o.id)){
   const g=spikeGeometry(o),a=g.angle,c=Math.cos(a),s=Math.sin(a);
   const pts=[[-g.hx,-g.hy],[g.hx,-g.hy],[g.hx,g.hy],[-g.hx,g.hy]].map(v=>[PLAYER_X+g.cx-S.x+v[0]*c-v[1]*s,FLOOR-(g.cy+v[0]*s+v[1]*c)]);
   ctx.strokeStyle='#ff647c';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(v=>ctx.lineTo(v[0],v[1]));ctx.closePath();ctx.stroke();
  }else if(SOLIDS.has(o.id)||ONE_WAY_SOLIDS.has(o.id)){
   const b=obox(o);ctx.strokeStyle='#77b8ff';ctx.strokeRect(sx-(o.x-b.l),FLOOR-b.t,b.r-b.l,b.t-b.b);
  }else if(SLOPES.has(o.id)||SLOPE_HAZARDS.has(o.id)){
   const pts=slopeVertices(o).map(v=>[PLAYER_X+v.x-S.x,FLOOR-v.y]);ctx.strokeStyle=SLOPE_HAZARDS.has(o.id)?'#ff647c':'#77b8ff';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(v=>ctx.lineTo(v[0],v[1]));ctx.closePath();ctx.stroke();
  }else if(PORTALS[o.id]){
   const b=portalBox(o);ctx.strokeStyle='#c38bff';ctx.strokeRect(sx-(o.x-b.l),FLOOR-b.t,b.r-b.l,b.t-b.b);
  }
 }
 ctx.restore();
}
function frame(t){if(!lastTime)lastTime=t;const elapsed=Math.min(.1,Math.max(0,(t-lastTime)/1000||0));lastTime=t;accumulator+=elapsed;let count=0;while(accumulator>=STEP&&count<32){physicsTick();accumulator-=STEP;count++;}draw();drawHitboxes();requestAnimationFrame(frame)}
function press(){if(!S.active||S.paused)return;S.held=true;S.pendingPress=true;}
function releaseInput(){S.held=false;if(S.mode==='robot'&&!S.grounded){S.robotHoverEnded=true;S.robotHoverTicks=0;}}
function down(e){if(['INPUT','TEXTAREA','SELECT'].includes((e.target.tagName||'').toUpperCase()))return;if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat)press();}}
window.addEventListener('keydown',down);window.addEventListener('keyup',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code))releaseInput();});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();press();});window.addEventListener('pointerup',releaseInput);
$('#start').addEventListener('click',()=>{if(!S.objects.length)demo('Entrega Express');else reset()});
$('#pause').addEventListener('click',()=>{if(!S.active&&!S.paused)return;S.paused=!S.paused;$('#pause').textContent=S.paused?'CONTINUAR':'PAUSAR';if(S.paused)$('#music').pause();else if($('#music').src)$('#music').play().catch(()=>{})});
document.querySelectorAll('.level').forEach(b=>b.addEventListener('click',()=>demo(b.dataset.n)));
$('#searchLevels').addEventListener('click',()=>search(false));$('#testProxy').addEventListener('click',()=>search(true));
$('#loadLevelFile').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{let payload=await f.text();if(f.name.toLowerCase().endsWith('.json')){try{payload=JSON.parse(payload)}catch(_){throw new Error('El JSON está dañado')}}await loadPayload(payload,(payload&&payload.name)||f.name.replace(/\.[^.]+$/,''),(payload&&payload.id)||'','archivo local')}catch(err){setStatus('No se pudo cargar: '+err.message)}});
function apiEndpoint(mode, params){
 let base=$('#apiBase').value.trim().replace(/\/+$/,'');
 if(!base){
  const host=window.location.hostname||'';
  if(host.endsWith('github.io'))throw new Error('GitHub Pages no puede ejecutar la API del servidor. Despliega temu-dash en Vercel y pega su dominio en “Servidor API (opcional)”.');
  base=window.location.origin;
 }
 let url;
 try{url=new URL(base)}catch(_){throw new Error('La URL de API no es válida. Pega solo el dominio HTTPS de tu despliegue Vercel.')}
 if(url.protocol!=='https:'&&url.hostname!=='localhost')throw new Error('La API debe usar HTTPS.');
 url.pathname=url.pathname.replace(/\/+$/,'')+'/api/levels';url.search='';url.hash='';
 url.searchParams.set('mode',mode);Object.entries(params||{}).forEach(([k,v])=>url.searchParams.set(k,String(v)));
 return url.href;
}
async function apiRequest(mode,params){
 const response=await fetch(apiEndpoint(mode,params),{headers:{Accept:'application/json'}});
 const raw=await response.text();let data;
 try{data=JSON.parse(raw)}catch(_){throw new Error('La API no devolvió JSON (HTTP '+response.status+'). Comprueba que el dominio Vercel sea correcto.')}
 if(!response.ok)throw new Error(data.error||('HTTP '+response.status));
 if(data&&data.error)throw new Error(data.error);
 return data;
}
try{
 const apiInput=$('#apiBase');
 apiInput.value=window.localStorage.getItem('temuDashApiBase')||'';
 apiInput.addEventListener('change',()=>window.localStorage.setItem('temuDashApiBase',apiInput.value.trim()));
}catch(_){}
async function search(test){
 const q=$('#levelQuery').value.trim();
 const button=test?$('#testProxy'):$('#searchLevels');button.disabled=true;
 if(test){
  $('#levelStatus').textContent='Probando conexión con Boomlings y GD Proxy…';
  try{const data=await apiRequest('test',{});$('#levelStatus').textContent='¡API conectada! Servidor: '+String(data.server||'Geometry Dash')+'. Respuesta recibida; muestras: '+(data.sampleCount||0)+'.'}
  catch(err){$('#levelStatus').textContent='No se pudo conectar: '+err.message}
  finally{button.disabled=false}
  return;
 }
 if(!q){setStatus('Escribe el nombre de un nivel o su ID.');button.disabled=false;return}
 $('#levelResults').replaceChildren();$('#levelStatus').textContent='Buscando en los servidores de Geometry Dash…';
 try{
  if(/^\d+$/.test(q)){await onlineLevel(q);return}
  const list=await apiRequest('search',{q});
  if(!Array.isArray(list)||!list.length)throw new Error('No se encontraron niveles con ese nombre. Prueba otro texto o un ID numérico.');
  $('#levelStatus').textContent='Resultados recibidos: '+list.length;
  list.forEach(l=>{const card=document.createElement('div');card.className='level-result';const b=document.createElement('b');b.textContent=(l.name||'Nivel')+' · ID '+l.id;const sm=document.createElement('small');sm.textContent='Creador: '+(l.author||'desconocido')+' · Descargas: '+(l.downloads||0)+' · '+(l.difficulty||'Sin dificultad');const btn=document.createElement('button');btn.textContent='DESCARGAR Y JUGAR';btn.addEventListener('click',()=>onlineLevel(String(l.id),l.name));card.append(b,sm,btn);$('#levelResults').append(card)})
 }catch(err){$('#levelStatus').textContent='No se pudo buscar el nivel: '+err.message}
 finally{button.disabled=false}
}
async function onlineLevel(id,name){
 $('#levelStatus').textContent='Descargando nivel '+id+' desde los servidores de Geometry Dash…';
 try{const p=await apiRequest('download',{id});await loadPayload(p,name||p.name||('Nivel '+id),id,p.source||'Boomlings / GD Proxy');$('#levelStatus').textContent='Nivel cargado: '+S.objects.length+' objetos.'}
 catch(e){$('#levelStatus').textContent='No se pudo descargar el nivel '+id+': '+e.message+'. Comprueba el dominio de API o carga un archivo local.'}
}
$('#load').addEventListener('click',()=>{const f=$('#file').files[0],u=$('#url').value.trim(),m=$('#music');if(musicUrl){URL.revokeObjectURL(musicUrl);musicUrl=null}if(f){musicUrl=URL.createObjectURL(f);m.src=musicUrl;$('#musicStatus').textContent='Archivo cargado: '+f.name}else if(/^https?:\/\//i.test(u)){m.src=u;$('#musicStatus').textContent='URL cargada'}else{setStatus('Selecciona un archivo de audio o pega una URL directa.');return}m.load();m.oncanplay=()=>$('#musicStatus').textContent='Canción lista';m.onerror=()=>$('#musicStatus').textContent='No se pudo cargar; prueba con un archivo local.'});
$('#play').addEventListener('click',()=>{const m=$('#music');if(!m.src){setStatus('Carga una canción primero.');return}if(m.paused)m.play().then(()=>$('#musicStatus').textContent='Reproduciendo').catch(()=>$('#musicStatus').textContent='No se pudo reproducir');else{m.pause();$('#musicStatus').textContent='En pausa'}});
$('#stop').addEventListener('click',()=>{$('#music').pause();$('#music').currentTime=0;$('#musicStatus').textContent='Canción detenida'});
window.TemuDash={loadPayload,parseObjects,ids:{portals:PORTALS,hazards:Array.from(HAZARDS),orbs:ORBS,pads:PADS},physics:{start:reset,press:press,release:releaseInput,step:physicsTick,box:box,hazardHit:hazardHit,spikeGeometry:spikeGeometry,speedDx:speedDx,cubeParams:cubePhysics,state:()=>({x:S.x,y:S.y,vy:S.vy,mode:S.mode,gravity:S.gravity,speed:S.speed,size:S.size,grounded:S.grounded,progress:S.progress})}};
try{$('#showHitboxes').addEventListener('change',()=>draw());}catch(_){}
demo('Entrega Express');S.active=false;S.tries=0;stats();setStatus('Motor con simulación fija de 240 Hz. Pulsa JUGAR / REINTENTAR para empezar.');requestAnimationFrame(frame);
})();