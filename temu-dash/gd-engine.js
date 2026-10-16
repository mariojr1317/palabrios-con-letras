/* Temu Dash: parser de Geometry Dash y motor Canvas 2D.
   Las físicas son aproximadas; no usan código interno de RobTop. */
(() => {
'use strict';
const $=s=>document.querySelector(s),canvas=$('#c'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,FLOOR=438,TILE=30,PLAYER_X=164,SIZE=28,SPEED=330,G=1750;
const MODE_NAMES={cube:'Cubo',ship:'Nave',ball:'Bola',ufo:'UFO',wave:'Wave',robot:'Robot',spider:'Araña',swing:'Swing'};
const PORTALS={
  12:['mode','cube','#50ff98'],13:['mode','ship','#ff55e8'],47:['mode','ball','#ffad45'],111:['mode','ufo','#50efff'],
  660:['mode','wave','#c96aff'],745:['mode','robot','#ff9a52'],1331:['mode','spider','#c8d4e8'],1933:['mode','swing','#d18bff'],
  10:['gravity',-1,'#4b9dff'],11:['gravity',1,'#ffe35b'],99:['size',1,'#64f78c'],101:['size',.55,'#ff78d7'],
  200:['speed',.72,'#63a7ff'],201:['speed',1,'#e9f1ff'],202:['speed',1.28,'#ffad45'],203:['speed',1.58,'#ff73a9'],1334:['speed',1.86,'#c96aff'],
  286:['dual',1,'#ffe45a'],287:['dual',0,'#4b9dff'],747:['teleport',0,'#4b9dff'],749:['teleport',0,'#ffe45a']
};
const HAZARDS=new Set([8,9,39,61,88,89,98,103,135,144,145,151,152,153,154,155,156,392,394,397,398,399,400,401,402,403,404,405,406,1715]);
const SAWS=new Set([88,89,98,392,394,397,398,399,400,401,402,403,404,405,406]);
const SOLIDS=new Set([1,2,3,4,5,6,7,40,62,63,64,65,66,68,69,70,71,72,73,74,75,76,77,78,80,81,82,83,90,91,92,93,94,95,96,116,117,118,119,120,121,122,143,146,147]);
const ORBS={36:['jump',1,'#ffe45c'],141:['jump',.66,'#ff70de'],84:['gravity',-1,'#58aaff'],1022:['gravity',1,'#65ff78'],1333:['jump',1.25,'#ff5252'],1330:['gravity',1,'#292d3d'],1704:['dash',1,'#62ff61'],1751:['dash',-1,'#ff5a8a']};
const PADS={35:['jump',1,'#ffe45c'],140:['jump',.7,'#ff70de'],67:['gravity',-1,'#58aaff'],1332:['jump',1.25,'#ff5252']};
const COINS=new Set([1329,142,1324]);
const S={objects:[],name:'Entrega Express',id:'',width:2700,x:90,y:0,vy:0,mode:'cube',gravity:1,speed:1,size:1,grounded:true,active:false,paused:false,dead:false,complete:false,held:false,progress:0,tries:0,coins:0,time:0,activated:new Set(),usedOrbs:new Set(),pads:new Set(),lastInput:false,dual:false,source:'demo'};
let musicUrl=null,lastTime=0;
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
 S.x=90;S.y=0;S.vy=0;S.mode='cube';S.gravity=1;S.speed=1;S.size=1;S.grounded=true;S.active=true;S.paused=false;S.dead=false;S.complete=false;S.held=false;S.progress=0;S.time=0;S.activated.clear();S.usedOrbs.clear();S.pads.clear();S.lastInput=false;S.dual=false;S.tries++;$('#pause').textContent='PAUSAR';stats();
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
 if(!('DecompressionStream'in window))throw new Error('Este navegador no puede descomprimir gzip. Actualiza Chrome.');
 s=s.replace(/\s/g,'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';
 const run=async(b64)=>{const bin=atob(b64),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));return new Response(stream).text()};
 try{return await run(s)}catch(_){try{return await run('H4sIAAAAAAAAA'+s)}catch(__){throw new Error('No pude descomprimir el nivel. Puede ser un formato oficial truncado o distinto.')}}}
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
function drawBlock(o,x,y,size){
 ctx.fillStyle=o.id===1?'#46c6df':['#6078c9','#5669af','#374c90','#4563aa','#34517e','#293c70'][Math.abs(o.id)%6];ctx.fillRect(x-size/2,y-size/2,size,size);
 ctx.strokeStyle='#8befff';ctx.lineWidth=2;ctx.strokeRect(x-size/2+1,y-size/2+1,size-2,size-2);ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(x-size/2+3,y-size/2+3,size-6,5)
}
function drawHazard(o,x,y,z){
 ctx.save();ctx.translate(x,y);ctx.rotate((o.r||0)*Math.PI/180);
 if(SAWS.has(o.id)){ctx.rotate(S.time*3);ctx.fillStyle='#ff4f84';ctx.strokeStyle='#ffd6e0';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12,r=(i%2?z*.36:z*.51),xx=Math.cos(a)*r,yy=Math.sin(a)*r;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#1b2442';ctx.beginPath();ctx.arc(0,0,z*.18,0,Math.PI*2);ctx.fill();}
 else{ctx.fillStyle='#ff4fc8';ctx.strokeStyle='#ffd0f1';ctx.lineWidth=1.5;ctx.beginPath();if(o.fy){ctx.moveTo(-z/2,-z/2);ctx.lineTo(z/2,-z/2);ctx.lineTo(0,z/2)}else{ctx.moveTo(-z/2,z/2);ctx.lineTo(z/2,z/2);ctx.lineTo(0,-z/2)}ctx.closePath();ctx.fill();ctx.stroke()}
 ctx.restore()
}
function drawObj(o){
 if(!onScreen(o))return;const x=PLAYER_X+o.x-S.x,y=scrY(o.y),z=30*(o.scale||1),p=PORTALS[o.id];
 if(p){ctx.save();ctx.translate(x,y);ctx.strokeStyle=p[2];ctx.lineWidth=5;ctx.shadowColor=p[2];ctx.shadowBlur=14;ctx.beginPath();ctx.ellipse(0,0,13,33,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=.22;ctx.fillStyle=p[2];ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText(p[0]==='mode'?p[1].toUpperCase():p[0].toUpperCase(),0,48);ctx.restore();return}
 if(HAZARDS.has(o.id)){drawHazard(o,x,y,z);return}
 if(ORBS[o.id]){ctx.strokeStyle=ORBS[o.id][2];ctx.lineWidth=4;ctx.shadowColor=ORBS[o.id][2];ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;return}
 if(PADS[o.id]){ctx.fillStyle=PADS[o.id][2];ctx.beginPath();ctx.moveTo(x-16,y+7);ctx.lineTo(x+16,y+7);ctx.lineTo(x+9,y-6);ctx.lineTo(x-9,y-6);ctx.closePath();ctx.fill();return}
 if(COINS.has(o.id)){ctx.strokeStyle='#ffe56a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.stroke();return}
 if(SOLIDS.has(o.id)){drawBlock(o,x,y,z);return}
 ctx.fillStyle='rgba(180,194,230,.35)';ctx.fillRect(x-4,y-4,8,8)
}
function drawPlayer(){
 const w=SIZE*S.size,h=w,x=PLAYER_X,y=scrY(S.y)-h;ctx.save();ctx.translate(x+w/2,y+h/2);
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
function box(){const h=SIZE*S.size;return{l:S.x-h/2,r:S.x+h/2,b:S.y,t:S.y+h}}
function obox(o){const z=30*(o.scale||1);return{l:o.x-z/2,r:o.x+z/2,b:o.y-z/2,t:o.y+z/2}}
function hit(a,b){return a.l<b.r&&a.r>b.l&&a.b<b.t&&a.t>b.b}
function die(why){if(S.dead||S.complete)return;S.active=false;S.dead=true;$('#music').pause();$('#musicStatus').textContent='Intento fallido';setStatus('Fallaste: '+why+'. Pulsa JUGAR / REINTENTAR.')}
function portal(o,i){const p=PORTALS[o.id],k='portal'+i;if(!p||S.activated.has(k))return;S.activated.add(k);if(p[0]==='mode'){S.mode=p[1];S.vy=0;S.grounded=false}else if(p[0]==='gravity'){S.gravity=p[1];S.vy=0;S.grounded=false}else if(p[0]==='speed')S.speed=p[1];else if(p[0]==='size')S.size=p[1];else if(p[0]==='dual')S.dual=!!p[1];stats()}
function orbs(){
 if(!S.held)return;
 S.objects.forEach((o,i)=>{const orb=ORBS[o.id],k='orb'+i;if(!orb||S.usedOrbs.has(k))return;if(Math.abs(o.x-S.x)<42&&Math.abs(o.y-(S.y+SIZE/2))<52){S.usedOrbs.add(k);if(orb[0]==='jump'){S.vy=590*orb[1]*S.gravity;S.grounded=false}else if(orb[0]==='gravity'){S.gravity=orb[1];S.vy=0;S.grounded=false}else if(orb[0]==='dash')S.x+=orb[1]*75;}})
}
function physics(dt){
 S.time+=dt;S.x+=SPEED*S.speed*dt;const h=SIZE*S.size,prev=S.y,ceiling=FLOOR-28;S.grounded=false;
 if(S.mode==='ship'||S.mode==='swing'){S.vy+=-G*S.gravity*dt;if(S.held)S.vy+=2700*S.gravity*dt;S.vy=Math.max(-470,Math.min(470,S.vy))}
 else if(S.mode==='wave')S.vy=(S.held?1:-1)*(S.gravity<0?-1:1)*SPEED*S.speed*(S.size<1?1.5:1);
 else{S.vy+=-G*S.gravity*dt;if(S.mode==='robot'&&S.held&&S.vy*S.gravity>0)S.vy=S.gravity*Math.min(S.vy*S.gravity+600*dt,760)}
 S.y+=S.vy*dt;
 if(S.gravity>0&&S.y<=0){S.y=0;S.vy=0;S.grounded=true}
 if(S.gravity<0&&S.y+h>=ceiling){S.y=ceiling-h;S.vy=0;S.grounded=true}
 for(let i=0;i<S.objects.length;i++){
  const o=S.objects[i],dx=o.x-S.x;
  if(Math.abs(dx)<25&&Math.abs(o.y-(S.y+SIZE*S.size/2))<70&&PORTALS[o.id])portal(o,i);
  if(COINS.has(o.id)&&Math.abs(dx)<22&&Math.abs(o.y-(S.y+h/2))<45){const k='coin'+i;if(!S.activated.has(k)){S.activated.add(k);S.coins++;stats()}}
  if(PADS[o.id]){const k='pad'+i;if(hit(box(),obox(o))&&!S.pads.has(k)){S.pads.add(k);const v=PADS[o.id];if(v[0]==='jump'){S.vy=610*v[1]*S.gravity;S.grounded=false}else{S.gravity=v[1];S.vy=0;S.grounded=false}}}
  if(HAZARDS.has(o.id)&&hit(box(),obox(o))){die('objeto peligroso #'+o.id);return}
  if(SOLIDS.has(o.id)){const b=obox(o),p=box();if(!hit(p,b))continue;if(S.gravity>0&&S.vy<=0&&prev>=b.t-1&&S.y<=b.t+1){S.y=b.t;S.vy=0;S.grounded=true}else if(S.gravity<0&&S.vy>=0&&prev+h<=b.b+1&&S.y+h>=b.b-1){S.y=b.b-h;S.vy=0;S.grounded=true}else{die('bloque #'+o.id);return}}
 }
 if(S.mode==='ball'&&S.grounded&&S.lastInput){S.gravity*=-1;S.grounded=false;S.vy=0;S.lastInput=false}
 if(S.mode==='spider'&&S.lastInput){S.gravity*=-1;S.y=S.gravity>0?0:ceiling-h;S.vy=0;S.grounded=true;S.lastInput=false}
 if(S.mode==='swing'&&S.lastInput){S.gravity*=-1;S.vy=0;S.lastInput=false}
 orbs();
 if(S.y < -120||S.y>ceiling+120){die('saliste de la zona jugable');return}
 S.progress=Math.max(0,Math.min(100,(S.x-90)/(S.width-90)*100));
 if(S.x>=S.width-30){S.progress=100;S.active=false;S.complete=true;$('#music').pause();$('#musicStatus').textContent='Nivel completado';setStatus('¡Completaste '+S.name+'!')}
 stats()
}
function frame(t){if(!lastTime)lastTime=t;const dt=Math.min(.035,(t-lastTime)/1000||0);lastTime=t;if(S.active&&!S.paused)physics(dt);draw();requestAnimationFrame(frame)}
function press(){
 if(!S.active||S.paused)return;if(['ball','spider','swing'].includes(S.mode))S.lastInput=true;
 if((S.mode==='cube'||S.mode==='robot')&&S.grounded){S.vy=(S.mode==='robot'?520:600)*S.gravity;S.grounded=false}
 else if(S.mode==='ufo'){S.vy=465*S.gravity;S.grounded=false}
 orbs()
}
function down(e){if(['INPUT','TEXTAREA','SELECT'].includes((e.target.tagName||'').toUpperCase()))return;if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat){S.held=true;press()}}}
window.addEventListener('keydown',down);window.addEventListener('keyup',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code))S.held=false});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();S.held=true;press()});window.addEventListener('pointerup',()=>S.held=false);
$('#start').addEventListener('click',()=>{if(!S.objects.length)demo('Entrega Express');else reset()});
$('#pause').addEventListener('click',()=>{if(!S.active&&!S.paused)return;S.paused=!S.paused;$('#pause').textContent=S.paused?'CONTINUAR':'PAUSAR';if(S.paused)$('#music').pause();else if($('#music').src)$('#music').play().catch(()=>{})});
document.querySelectorAll('.level').forEach(b=>b.addEventListener('click',()=>demo(b.dataset.n)));
$('#searchLevels').addEventListener('click',()=>search(false));$('#testProxy').addEventListener('click',()=>search(true));
$('#loadLevelFile').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{let payload=await f.text();if(f.name.toLowerCase().endsWith('.json')){try{payload=JSON.parse(payload)}catch(_){throw new Error('El JSON está dañado')}}await loadPayload(payload,(payload&&payload.name)||f.name.replace(/\.[^.]+$/,''),(payload&&payload.id)||'','archivo local')}catch(err){setStatus('No se pudo cargar: '+err.message)}});
async function search(test){
 const q=$('#levelQuery').value.trim();
 if(!q&&test){const probe=$('#testProxy');probe.disabled=true;$('#levelStatus').textContent='Probando la API de GDBrowser…';try{const pr=await fetch('https://gdbrowser.com/api/level/128',{headers:{Accept:'application/json'}});if(!pr.ok)throw new Error('HTTP '+pr.status);await pr.json();$('#levelStatus').textContent='La API respondió correctamente. Escribe el nombre o ID de un nivel para buscarlo.'}catch(err){$('#levelStatus').textContent='No se pudo acceder a GDBrowser desde este navegador: '+err.message+'. Puede ser una restricción CORS del servidor.'}finally{probe.disabled=false}return}
 if(!q){setStatus('Escribe el nombre de un nivel o su ID.');return}
 const button=test?$('#testProxy'):$('#searchLevels');button.disabled=true;$('#levelResults').replaceChildren();$('#levelStatus').textContent='Consultando la API pública de GDBrowser…';
 try{
  if(/^\d+$/.test(q)){await onlineLevel(q);return}
  const r=await fetch('https://gdbrowser.com/api/search/'+encodeURIComponent(q)+'?count=10',{headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error('HTTP '+r.status);const list=await r.json();if(!Array.isArray(list)||!list.length)throw new Error('No se encontraron niveles.');
  $('#levelStatus').textContent='Resultados recibidos: '+list.length;
  list.forEach(l=>{const card=document.createElement('div');card.className='level-result';const b=document.createElement('b');b.textContent=(l.name||'Nivel')+' · ID '+l.id;const sm=document.createElement('small');sm.textContent='Creador: '+(l.author||'desconocido')+' · Descargas: '+(l.downloads||0)+' · '+(l.difficulty||'Sin dificultad');const btn=document.createElement('button');btn.textContent='DESCARGAR Y JUGAR';btn.addEventListener('click',()=>onlineLevel(String(l.id),l.name));card.append(b,sm,btn);$('#levelResults').append(card)})
 }catch(err){$('#levelStatus').textContent='La API no respondió desde este navegador: '+err.message+'. Puedes cargar un JSON que ya tengas.'}
 finally{button.disabled=false}
}
async function onlineLevel(id,name){
 $('#levelStatus').textContent='Descargando nivel '+id+' desde GDBrowser…';
 try{const r=await fetch('https://gdbrowser.com/api/level/'+encodeURIComponent(id)+'?download=1',{headers:{Accept:'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);const p=await r.json();await loadPayload(p,name||p.name||('Nivel '+id),id,'GDBrowser API');$('#levelStatus').textContent='Nivel cargado: '+S.objects.length+' objetos.'}
 catch(e){$('#levelStatus').textContent='No se pudo descargar el nivel '+id+': '+e.message+'. Carga un JSON descargado anteriormente si la API bloquea CORS.'}
}
$('#load').addEventListener('click',()=>{const f=$('#file').files[0],u=$('#url').value.trim(),m=$('#music');if(musicUrl){URL.revokeObjectURL(musicUrl);musicUrl=null}if(f){musicUrl=URL.createObjectURL(f);m.src=musicUrl;$('#musicStatus').textContent='Archivo cargado: '+f.name}else if(/^https?:\/\//i.test(u)){m.src=u;$('#musicStatus').textContent='URL cargada'}else{setStatus('Selecciona un archivo de audio o pega una URL directa.');return}m.load();m.oncanplay=()=>$('#musicStatus').textContent='Canción lista';m.onerror=()=>$('#musicStatus').textContent='No se pudo cargar; prueba con un archivo local.'});
$('#play').addEventListener('click',()=>{const m=$('#music');if(!m.src){setStatus('Carga una canción primero.');return}if(m.paused)m.play().then(()=>$('#musicStatus').textContent='Reproduciendo').catch(()=>$('#musicStatus').textContent='No se pudo reproducir');else{m.pause();$('#musicStatus').textContent='En pausa'}});
$('#stop').addEventListener('click',()=>{$('#music').pause();$('#music').currentTime=0;$('#musicStatus').textContent='Canción detenida'});
window.TemuDash={loadPayload,parseObjects,ids:{portals:PORTALS,hazards:Array.from(HAZARDS),orbs:ORBS,pads:PADS}};
demo('Entrega Express');S.active=false;S.tries=0;stats();setStatus('Nivel local listo. Pulsa JUGAR / REINTENTAR cuando quieras empezar.');requestAnimationFrame(frame);
})();