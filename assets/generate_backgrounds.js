// Generate ANIMATED pixel-art SVG backgrounds for Castle Math Quest
// Run: node assets/generate_backgrounds.js
const fs=require('fs'),path=require('path');
const PX=8,W=480,H=640,COLS=W/PX,ROWS=H/PX; // 60x80 grid
const outDir=path.join(__dirname,'sprites','backgrounds');
fs.mkdirSync(outDir,{recursive:true});

// --- Grid helpers ---
function mkGrid(){return Array.from({length:ROWS},()=>Array(COLS).fill(null));}
function fillRect(g,x,y,w,h,c){for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++){const gy=y+dy,gx=x+dx;if(gy>=0&&gy<ROWS&&gx>=0&&gx<COLS)g[gy][gx]=c;}}
function fillCircle(g,cx,cy,r,c){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(dx*dx+dy*dy<=r*r){const gy=cy+dy,gx=cx+dx;if(gy>=0&&gy<ROWS&&gx>=0&&gx<COLS)g[gy][gx]=c;}}}
function gradientFill(g,colors){for(let y=0;y<ROWS;y++){const f=y/ROWS;let lo=colors[0],hi=colors[colors.length-1];for(let i=0;i<colors.length-1;i++){if(f>=colors[i][0]&&f<=colors[i+1][0]){lo=colors[i];hi=colors[i+1];break;}}g[y].fill(lerpColor(lo[1],hi[1],(f-lo[0])/(hi[0]-lo[0]||1)));}}
function hexToRgb(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function rgbToHex(r,g,b){return'#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');}
function lerpColor(c1,c2,t){const a=hexToRgb(c1),b=hexToRgb(c2);return rgbToHex(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t);}

// --- SVG assembly ---
function gridToRects(grid,px){
  let r='';
  for(let y=0;y<grid.length;y++){let x=0;while(x<grid[y].length){const c=grid[y][x];if(c){let run=1;while(x+run<grid[y].length&&grid[y][x+run]===c)run++;r+=`<rect x="${x*px}" y="${y*px}" width="${run*px}" height="${px}" fill="${c}"/>`;x+=run;}else x++;}}
  return r;
}

function makeAnimatedSvg(staticGrid, animElements, px){
  px=px||PX;
  const rects=gridToRects(staticGrid,px);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges">
<style>
@keyframes floatX{0%{transform:translateX(0)}100%{transform:translateX(${W}px)}}
@keyframes floatXneg{0%{transform:translateX(${W}px)}100%{transform:translateX(-80px)}}
@keyframes floatYup{0%{transform:translateY(0);opacity:.8}100%{transform:translateY(-${H}px);opacity:0}}
@keyframes floatYdown{0%{transform:translateY(-40px)}100%{transform:translateY(${H+40}px)}}
@keyframes fadeInOut{0%,100%{opacity:.15}50%{opacity:.7}}
@keyframes pulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
@keyframes sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes flash{0%,90%,100%{opacity:0}92%,96%{opacity:.8}}
@keyframes wave{0%{d:path('M0,0 Q60,-8 120,0 Q180,8 240,0 Q300,-8 360,0 Q420,8 480,0 L480,20 L0,20 Z')}50%{d:path('M0,0 Q60,8 120,0 Q180,-8 240,0 Q300,8 360,0 Q420,-8 480,0 L480,20 L0,20 Z')}100%{d:path('M0,0 Q60,-8 120,0 Q180,8 240,0 Q300,-8 360,0 Q420,8 480,0 L480,20 L0,20 Z')}}
</style>
${rects}
${animElements}
</svg>`;
}

// --- Animated element builders ---
function cloud(cx,cy,w,dur,opacity){
  const o=opacity||.6;
  return `<g style="animation:floatXneg ${dur}s linear infinite;opacity:${o}" transform="translate(${cx},${cy})">
<rect x="0" y="${w*.3}" width="${w}" height="${w*.3}" fill="#fff" rx="2"/>
<rect x="${w*.15}" y="${w*.1}" width="${w*.5}" height="${w*.3}" fill="#fff" rx="2"/>
<rect x="${w*.4}" y="0" width="${w*.35}" height="${w*.25}" fill="#fff" rx="2"/>
</g>`;}

function snowflake(x,dur,delay){
  const s=3+Math.random()*4;
  return `<rect x="${x}" y="-10" width="${s}" height="${s}" fill="#fff" opacity=".7" style="animation:floatYdown ${dur}s linear ${delay}s infinite"/>`;}

function raindrop(x,dur,delay){
  const s=2;
  return `<rect x="${x}" y="-10" width="${s}" height="${s*3}" fill="#6aa" opacity=".4" style="animation:floatYdown ${dur}s linear ${delay}s infinite"/>`;}

function bubble(x,dur,delay){
  const s=4+Math.random()*6;
  return `<rect x="${x}" y="${H+10}" width="${s}" height="${s}" fill="#4af" opacity=".3" rx="${s/2}" style="animation:floatYup ${dur}s ease-in ${delay}s infinite"/>`;}

function bird(x,y,dur,delay){
  return `<g style="animation:floatX ${dur}s linear ${delay}s infinite" transform="translate(${-40},${y})">
<rect x="0" y="0" width="4" height="2" fill="#333"/>
<rect x="4" y="-2" width="3" height="2" fill="#333"/>
<rect x="6" y="-3" width="2" height="2" fill="#333"/>
<rect x="7" y="-2" width="3" height="2" fill="#333"/>
</g>`;}

function star(x,y,dur,delay){
  const s=3;
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#ff8" style="animation:pulse ${dur}s ease-in-out ${delay}s infinite"/>`;}

function ember(x,dur,delay){
  const s=3+Math.random()*4;
  const c=Math.random()>.5?'#f60':'#fa0';
  return `<rect x="${x}" y="${H}" width="${s}" height="${s}" fill="${c}" opacity=".6" style="animation:floatYup ${dur}s ease-out ${delay}s infinite"/>`;}

function firefly(x,y,dur,delay){
  return `<rect x="${x}" y="${y}" width="3" height="3" fill="#ff0" opacity=".5" style="animation:pulse ${dur}s ease-in-out ${delay}s infinite"/>`;}

function bat(x,y,dur,delay){
  return `<g style="animation:floatX ${dur}s linear ${delay}s infinite" transform="translate(${-30},${y})">
<rect x="4" y="0" width="4" height="3" fill="#222"/>
<rect x="0" y="-3" width="4" height="4" fill="#222"/>
<rect x="8" y="-3" width="4" height="4" fill="#222"/>
<rect x="3" y="-4" width="2" height="2" fill="#222"/>
<rect x="7" y="-4" width="2" height="2" fill="#222"/>
</g>`;}

function lightning(x,dur,delay){
  return `<g style="animation:flash ${dur}s ease ${delay}s infinite" transform="translate(${x},0)">
<rect x="0" y="20" width="4" height="16" fill="#ff0" opacity=".7"/>
<rect x="4" y="36" width="4" height="12" fill="#ff0" opacity=".5"/>
<rect x="-4" y="48" width="4" height="10" fill="#ff0" opacity=".3"/>
</g>`;}

function seaweed(x,baseY,h,dur){
  return `<g transform="translate(${x},${baseY})" style="animation:sway ${dur}s ease-in-out infinite;transform-origin:center bottom">
<rect x="0" y="${-h}" width="${PX}" height="${h}" fill="#064"/>
<rect x="${PX}" y="${-h+PX}" width="${PX}" height="${h-PX}" fill="#075"/>
</g>`;}

function fish(x,y,dur,delay,dir){
  const dx=dir>0?-40:W+40;
  return `<g style="animation:floatX ${dur}s linear ${delay}s infinite" transform="translate(${dx},${y})">
<rect x="0" y="0" width="12" height="6" fill="${dir>0?'#269':'#48a'}"/>
<rect x="${dir>0?12:-4}" y="-2" width="4" height="10" fill="${dir>0?'#269':'#48a'}"/>
<rect x="${dir>0?2:8}" y="2" width="2" height="2" fill="#fff"/>
</g>`;}

// ============================================================
// WB0 - Meadow (clouds drift, birds fly, flowers sway)
// ============================================================
function genWB0(){
  const g=mkGrid();
  gradientFill(g,[[0,'#4A9FE5'],[.35,'#7EC8A4'],[.50,'#5DB36A'],[.65,'#4A8C3F'],[1,'#2E6B28']]);
  fillCircle(g,65,7,5,'#FFE57A');fillCircle(g,65,7,3,'#FFFDE7');
  fillRect(g,0,52,COLS,1,'#3D7A2A');
  // Trees
  const tc='#6D4C2A',lc='#2D8B2D',lh='#3AA03A';
  [[8,52],[30,52],[50,52],[68,52]].forEach(([tx,ty])=>{
    fillRect(g,tx,ty-4,2,4,tc);fillRect(g,tx-2,ty-6,6,2,lc);fillRect(g,tx-3,ty-8,8,2,lc);fillRect(g,tx-2,ty-10,6,2,lh);fillRect(g,tx-1,ty-11,4,1,lh);
  });
  // Flowers
  const fc=['#FF6B9D','#FFD700','#FF4444','#FF69B4','#FFAA00'];
  for(let i=0;i<15;i++){const fx=2+i*4,fy=53+(i%3);g[fy][fx]=fc[i%5];g[fy-1][fx]='#3A7A2A';}
  // Mushrooms
  [[12,55],[35,54],[55,55],[70,54]].forEach(([mx,my],i)=>{
    fillRect(g,mx,my,2,2,'#F5E6D3');fillRect(g,mx-1,my-2,4,2,i%2?'#E53935':'#FDD835');fillRect(g,mx,my-3,2,1,'#fff');
  });
  let anim=cloud(20,30,40,20,.7)+cloud(200,15,50,28,.5)+cloud(400,40,35,24,.6);
  for(let i=0;i<3;i++) anim+=bird(0,60+i*40,18+i*4,i*3);
  for(let i=0;i<4;i++) anim+=firefly(50+i*100,200+i*80,2+i*.5,i*1.2);
  return makeAnimatedSvg(g,anim);
}

// ============================================================
// WB1 - Beach (waves, seagulls, palm sway, bubbles)
// ============================================================
function genWB1(){
  const g=mkGrid();
  gradientFill(g,[[0,'#00B4D8'],[.30,'#48CAE4'],[.55,'#F5DEB3'],[.65,'#DEB887'],[.75,'#C2A66B'],[.85,'#0096C7'],[1,'#005F8A']]);
  fillCircle(g,65,6,5,'#FFE57A');
  // Palms
  const tc='#6D4C2A',lc='#2E8B2E';
  [[10,40],[62,41],[25,42]].forEach(([tx,ty])=>{
    fillRect(g,tx,ty-4,2,5,tc);fillRect(g,tx+2,ty-5,3,1,tc);fillRect(g,tx+4,ty-6,2,1,tc);
    fillRect(g,tx+1,ty-7,3,1,lc);fillRect(g,tx+3,ty-8,5,1,lc);fillRect(g,tx+2,ty-9,3,1,lc);fillRect(g,tx+5,ty-7,3,1,lc);
  });
  // Wave foam line
  for(let x=0;x<COLS;x++){const wy=52+Math.floor(Math.sin(x*.3)*1.5);if(wy>=0&&wy<ROWS){g[wy][x]='#fff';if(x%3===0&&wy+1<ROWS)g[wy+1][x]='#B0E0E6';}}
  let anim='';
  // Animated wave overlay
  anim+=`<path fill="#0096C7" opacity=".3" style="animation:wave 3s ease-in-out infinite" d="M0,0 Q60,-8 120,0 Q180,8 240,0 Q300,-8 360,0 Q420,8 480,0 L480,20 L0,20 Z" transform="translate(0,${52*PX})"/>`;
  anim+=cloud(50,25,45,22,.5)+cloud(300,10,40,30,.4);
  for(let i=0;i<4;i++) anim+=bird(0,80+i*50,16+i*3,i*2.5);
  for(let i=0;i<6;i++) anim+=bubble(40+i*70,8+i*2,i*.8,i*1.5);
  return makeAnimatedSvg(g,anim);
}

// ============================================================
// WB2 - Lava (embers rise, smoke, lava glow pulse)
// ============================================================
function genWB2(){
  const g=mkGrid();
  gradientFill(g,[[0,'#1a0000'],[.20,'#5B0E00'],[.40,'#CC3300'],[.55,'#FF6600'],[.65,'#CC3300'],[.80,'#4A2000'],[1,'#1a0a00']]);
  // Mountains
  for(let dy=0;dy<18;dy++){const hw=Math.floor((1-dy/18)*15);for(let dx=-hw;dx<=hw;dx++){const gx=25+dx;if(gx>=0&&gx<COLS&&52-dy>=0)g[52-dy][gx]=dy<4?'#FF4500':'#3D1500';}}
  for(let dy=0;dy<14;dy++){const hw=Math.floor((1-dy/14)*12);for(let dx=-hw;dx<=hw;dx++){const gx=55+dx;if(gx>=0&&gx<COLS&&52-dy>=0)g[52-dy][gx]=dy<3?'#FF6600':'#2A0A00';}}
  // Lava streams on ground
  for(let x=22;x<28;x++)for(let y=48;y<52;y++){g[y][x]=Math.random()>.3?'#FF4500':'#FFAA00';}
  // Cracks
  for(let x=5;x<COLS-5;x+=7+Math.floor(Math.random()*5)){const cy=50+Math.floor(Math.random()*8);fillRect(g,x,cy,3,1,'#FF4500');fillRect(g,x+1,cy-1,1,1,'#FFAA00');}
  let anim='';
  for(let i=0;i<20;i++) anim+=ember(20+i*22,5+i*.8,i*1.1);
  anim+=`<rect x="${22*PX}" y="${48*PX}" width="${6*PX}" height="${4*PX}" fill="#f60" opacity=".4" style="animation:pulse 2s ease-in-out infinite"/>`;
  for(let i=0;i<5;i++) anim+=star(15+i*90,10+i*15,1.5+i*.3,i*.7);
  return makeAnimatedSvg(g,anim);
}

// ============================================================
// WB3 - Ice (snowflakes fall, aurora, sparkle)
// ============================================================
function genWB3(){
  const g=mkGrid();
  gradientFill(g,[[0,'#E0F4FF'],[.25,'#B3D9FF'],[.45,'#8EC6FF'],[.60,'#D6EEFF'],[.75,'#E8F0F8'],[1,'#B8C8D8']]);
  // Snowy mountains
  for(let dy=0;dy<18;dy++){const hw=Math.floor((1-dy/18)*16);for(let dx=-hw;dx<=hw;dx++){const gx=20+dx;if(gx>=0&&gx<COLS&&52-dy>=0)g[52-dy][gx]=dy<5?'#fff':'#C8D8E8';}}
  for(let dy=0;dy<14;dy++){const hw=Math.floor((1-dy/14)*13);for(let dx=-hw;dx<=hw;dx++){const gx=55+dx;if(gx>=0&&gx<COLS&&52-dy>=0)g[52-dy][gx]=dy<4?'#F0F8FF':'#B8C8D8';}}
  // Snow ground
  fillRect(g,0,52,COLS,3,'#E8F0F8');fillRect(g,0,55,COLS,3,'#D0DEE8');
  // Pine trees
  [[8,52],[22,52],[35,52],[48,52],[62,52]].forEach(([tx,ty])=>{
    fillRect(g,tx,ty-4,2,4,'#5C4033');fillRect(g,tx-2,ty-6,6,2,'#E8F0F8');fillRect(g,tx-3,ty-8,8,2,'#D6EEFF');fillRect(g,tx-2,ty-10,6,2,'#E8F0F8');fillRect(g,tx-1,ty-11,4,1,'#fff');
  });
  let anim='';
  for(let i=0;i<30;i++) anim+=snowflake(10+i*16,4+Math.random()*3,i*.4);
  // Aurora shimmer
  anim+=`<rect x="0" y="0" width="${W}" height="80" fill="#8cf" opacity=".08" style="animation:fadeInOut 6s ease-in-out infinite"/>`;
  anim+=`<rect x="${W*.2}" y="10" width="${W*.6}" height="40" fill="#fcf" opacity=".06" style="animation:fadeInOut 8s ease-in-out 2s infinite"/>`;
  for(let i=0;i<6;i++) anim+=star(20+i*80,5+i*12,1.8+i*.3,i*.5);
  return makeAnimatedSvg(g,anim);
}

// ============================================================
// WB4 - Sky (clouds drift, birds, sun rays, rainbow)
// ============================================================
function genWB4(){
  const g=mkGrid();
  gradientFill(g,[[0,'#F0F9FF'],[.20,'#87CEEB'],[.50,'#B8E0F0'],[.70,'#87CEEB'],[1,'#2A6A9A']]);
  fillCircle(g,65,8,6,'#FFE57A');fillCircle(g,65,8,4,'#FFF9C4');
  // Cloud platforms
  [[15,48,12],[50,53,14],[28,58,10]].forEach(([x,y,w])=>{
    fillRect(g,x,y,w,2,'#fff');fillRect(g,x+1,y-2,w-2,2,'#f0f0f0');
  });
  // Rainbow
  const rb=['#FF0000','#FF8800','#FFFF00','#00FF00','#0088FF','#8800FF'];
  rb.forEach((c,i)=>{for(let x=52;x<65;x++)g[40+i][x]=c;});
  let anim='';
  anim+=cloud(0,20,55,16,.7)+cloud(150,8,50,22,.6)+cloud(350,30,45,18,.5);
  for(let i=0;i<5;i++) anim+=bird(0,100+i*60,14+i*3,i*2);
  // Rotating sun rays
  anim+=`<g transform="translate(${65*PX},${8*PX})" style="animation:sway 10s ease-in-out infinite;transform-origin:center">
${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,r=40;return`<rect x="${Math.cos(a)*r}" y="${Math.sin(a)*r}" width="6" height="6" fill="#FFE57A" opacity=".4" rx="3"/>`;}).join('')}
</g>`;
  return makeAnimatedSvg(g,anim);
}

// ============================================================
// WB5 - Dark Castle (bats, stars twinkle, lightning)
// ============================================================
function genWB5(){
  const g=mkGrid();
  gradientFill(g,[[0,'#050010'],[.30,'#1a0050'],[.60,'#3d0080'],[.80,'#1a0030'],[1,'#0d0020']]);
  // Castle silhouette
  fillRect(g,15,43,50,12,'#0a0015');fillRect(g,15,33,6,22,'#0a0015');fillRect(g,59,33,6,22,'#0a0015');
  // Crenellations
  for(let tx=15;tx<21;tx+=2) fillRect(g,tx,31,1,2,'#0a0015');
  for(let tx=59;tx<65;tx+=2) fillRect(g,tx,31,1,2,'#0a0015');
  // Spire
  fillRect(g,37,35,2,8,'#0a0015');fillRect(g,36,33,4,2,'#0a0015');fillRect(g,37,31,2,2,'#0a0015');
  // Gate
  fillRect(g,36,48,8,7,'#1a0020');fillCircle(g,40,48,4,'#1a0020');
  // Lit windows
  [[22,44],[30,44],[48,44],[56,44],[17,37],[61,37]].forEach(([wx,wy])=>fillRect(g,wx,wy,2,2,'#FFCC00'));
  // Ground
  fillRect(g,0,55,COLS,ROWS-55,'#0a0015');
  let anim='';
  // Moon
  anim+=`<circle cx="${68*PX}" cy="${10*PX}" r="${6*PX}" fill="#e8e8f0"/><circle cx="${72*PX}" cy="${9*PX}" r="${5*PX}" fill="#1a0050"/>`;
  for(let i=0;i<40;i++){const sx=Math.floor(Math.random()*COLS)*PX,sy=Math.floor(Math.random()*40)*PX;anim+=`<rect x="${sx}" y="${sy}" width="2" height="2" fill="${Math.random()>.5?'#fff':'#ccf'}" style="animation:pulse ${1.5+Math.random()*3}s ease-in-out ${Math.random()*5}s infinite"/>`;}
  for(let i=0;i<4;i++) anim+=bat(0,80+i*70,12+i*2,i*3);
  anim+=lightning(180,8,3)+lightning(320,10,5);
  return makeAnimatedSvg(g,anim);
}

// ============================================================
// WB6 - Enchanted Forest (fireflies, glow mushrooms, light rays)
// ============================================================
function genWB6(){
  const g=mkGrid();
  gradientFill(g,[[0,'#001500'],[.20,'#003300'],[.40,'#004400'],[.60,'#005500'],[.80,'#003300'],[1,'#001a00']]);
  // Canopy
  fillRect(g,0,0,COLS,12,'#001500');
  for(let x=0;x<COLS;x+=3){const h=8+Math.floor(Math.random()*5);fillRect(g,x,0,3,h,'#002200');}
  // Light rays
  for(let i=0;i<4;i++){const rx=10+i*14;for(let y=5;y<40;y++){const sp=Math.floor((y-5)*.3);for(let dx=-sp;dx<=sp;dx++){const gx=rx+dx;if(gx>0&&gx<COLS&&y<ROWS&&Math.random()>.6)g[y][gx]=lerpColor(g[y][gx]||'#003300','#4CAF50',.25);}}}
  // Trees
  [[10,55],[35,55],[55,55],[72,55]].forEach(([tx,ty])=>{
    fillRect(g,tx,ty-4,2,4,'#3D2B1F');fillRect(g,tx-2,ty-6,6,2,'#1B4D1B');fillRect(g,tx-3,ty-8,8,2,'#1B4D1B');fillRect(g,tx-2,ty-10,6,2,'#1A3A1A');
  });
  // Ground
  fillRect(g,0,55,COLS,2,'#1A3A0A');fillRect(g,0,57,COLS,ROWS-57,'#0D2A05');
  // Glowing mushrooms
  const mc=['#FF69B4','#00FF88','#88FF00','#FF00FF','#00FFFF'];
  [[8,57],[20,58],[40,56],[58,57],[70,58]].forEach(([mx,my],i)=>{
    fillRect(g,mx,my,2,2,'#F5E6D3');fillRect(g,mx-1,my-2,4,2,mc[i]);fillRect(g,mx,my-3,2,1,lerpColor(mc[i],'#fff',.4));
  });
  let anim='';
  for(let i=0;i<30;i++) anim+=firefly(Math.random()*W,100+Math.random()*300,1.5+Math.random()*2,Math.random()*5);
  // Floating spores
  for(let i=0;i<8;i++) anim+=`<rect x="${40+i*55}" y="${H}" width="3" height="3" fill="#8f8" opacity=".3" style="animation:floatYup ${6+i}s ease-out ${i*1.5}s infinite"/>`;
  return makeAnimatedSvg(g,anim);
}

// ============================================================
// WB7 - Thunder (rain, lightning, clouds)
// ============================================================
function genWB7(){
  const g=mkGrid();
  gradientFill(g,[[0,'#1a0a00'],[.20,'#3D1500'],[.40,'#5A2A00'],[.60,'#7A3000'],[.80,'#4A2000'],[1,'#1a0a00']]);
  // Rocky mountains
  for(let dy=0;dy<16;dy++){const hw=Math.floor((1-dy/16)*14);for(let dx=-hw;dx<=hw;dx++){const gx=20+dx;if(gx>=0&&gx<COLS&&55-dy>=0)g[55-dy][gx]='#3D1500';}}
  for(let dy=0;dy<12;dy++){const hw=Math.floor((1-dy/12)*11);for(let dx=-hw;dx<=hw;dx++){const gx=55+dx;if(gx>=0&&gx<COLS&&55-dy>=0)g[55-dy][gx]='#4A2000';}}
  // Ground
  fillRect(g,0,55,COLS,2,'#2A1A0A');fillRect(g,0,57,COLS,ROWS-57,'#1A0A00');
  // Rocks
  for(let i=0;i<6;i++){const rx=5+i*10,ry=56+Math.floor(Math.random()*4);fillRect(g,rx,ry,2,2,'#4A3020');fillRect(g,rx+1,ry-1,1,1,'#5A4030');}
  let anim='';
  for(let i=0;i<50;i++) anim+=raindrop(10+i*10,2+Math.random()*1.5,Math.random()*3);
  anim+=lightning(100,7,4)+lightning(250,9,6)+lightning(400,8,3.5);
  anim+=cloud(0,10,60,12,.3)+cloud(200,5,50,15,.25)+cloud(380,15,45,10,.2);
  for(let i=0;i<4;i++) anim+=ember(30+i*100,6+i,Math.random()*3);
  return makeAnimatedSvg(g,anim);
}

// ============================================================
// WB8 - Deep Ocean (bubbles, fish, seaweed sway, light rays)
// ============================================================
function genWB8(){
  const g=mkGrid();
  gradientFill(g,[[0,'#000020'],[.15,'#000040'],[.35,'#000060'],[.55,'#000080'],[.70,'#000050'],[.85,'#000030'],[1,'#00001a']]);
  // Light rays from above
  for(let i=0;i<3;i++){const rx=12+i*18;for(let y=0;y<35;y++){const sp=Math.floor(y*.2);for(let dx=-sp;dx<=sp;dx++){const gx=rx+dx;if(gx>0&&gx<COLS&&y<ROWS&&Math.random()>.7)g[y][gx]=lerpColor(g[y][gx]||'#000040','#0044AA',.15);}}}
  // Ocean floor
  fillRect(g,0,55,COLS,3,'#001520');fillRect(g,0,58,COLS,ROWS-58,'#000A15');
  // Treasure chest
  fillRect(g,40,58,4,3,'#8B6914');fillRect(g,40,57,4,1,'#B8860B');g[57][42]='#FFD700';
  // Coral
  ['#FF4040','#FF6B6B','#FF8888','#CC3333'].forEach((c,i)=>{fillRect(g,5+i*14,56,1,3,c);fillRect(g,6+i*14,55,1,2,c);fillRect(g,7+i*14,56,1,1,c);});
  let anim='';
  // Seaweed
  for(let i=0;i<8;i++) anim+=seaweed(30+i*55,55*PX,60+Math.random()*40,3+Math.random()*2);
  // Bubbles
  for(let i=0;i<15;i++) anim+=bubble(20+i*30,7+i*1.5,i*1.2);
  // Fish
  for(let i=0;i<5;i++) anim+=fish(0,150+i*80,10+i*2,i*3,i%2?1:-1);
  // Light shimmer
  anim+=`<rect x="0" y="0" width="${W}" height="120" fill="#06a" opacity=".04" style="animation:fadeInOut 7s ease-in-out infinite"/>`;
  for(let i=0;i<3;i++) anim+=`<rect x="${50+i*160}" y="0" width="40" height="${H*.5}" fill="#08b" opacity=".03" style="animation:fadeInOut ${5+i*2}s ease-in-out ${i*2}s infinite"/>`;
  return makeAnimatedSvg(g,anim);
}

// ============================================================
const bgs=[['wb0',genWB0,'Meadow'],['wb1',genWB1,'Beach'],['wb2',genWB2,'Lava'],['wb3',genWB3,'Ice'],['wb4',genWB4,'Sky'],['wb5',genWB5,'Dark Castle'],['wb6',genWB6,'Forest'],['wb7',genWB7,'Thunder'],['wb8',genWB8,'Ocean']];
console.log('=== Animated Backgrounds ===\n');
for(const [name,fn,desc] of bgs){
  const svg=fn();
  const fp=path.join(outDir,`${name}.svg`);
  fs.writeFileSync(fp,svg);
  console.log(`  ${name}.svg (${(Buffer.byteLength(svg)/1024).toFixed(1)} KB) - ${desc}`);
}
console.log(`\nDone! ${bgs.length} animated backgrounds.`);
