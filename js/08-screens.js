// REGION
var _rgnNodes=[];var _rgnSel=-1;var _rgnAnimId=null;var _rgnWorld=null;
function initRegion(){
  var w=getWorldData(S.region);_rgnWorld=w;
  var scr=$('s-region');scr.className='scr on '+(w.bgClass||'wb-dark');
  audBtn('map-aud');
  var unlv=S.maxUnlock[S.region]||0,levsDone=0;
  for(var j=0;j<10;j++){if(S.completed.has(S.region+'-'+j))levsDone++;}
  var bDone=S.bossDefeated.has(S.region),totalBossWins=S.bossWins[S.region]||0;
  $('map-wname').textContent=w.name;$('map-wsub').textContent=w.sub;$('map-badge-icon').textContent=bDone?w.badge.e:'';
  $('map-stat-row').innerHTML=[{l:levsDone+'/10',s:'Levels'},{l:bDone?'Done':'Ready',s:'Boss'},{l:bDone?w.badge.e:'Locked',s:'Badge'}].map(function(p){return '<div style="background:rgba(255,255,255,.08);border:4px solid rgba(255,255,255,.15);border-radius:0;padding:10px 6px;text-align:center;box-shadow:3px 3px 0 rgba(0,0,0,.5),inset 1px 1px 0 rgba(255,255,255,.08)"><div style="font-family:var(--px);font-size:12px;color:#fff;text-shadow:2px 2px 0 #000">'+p.l+'</div><div style="font-family:var(--px);font-size:7px;color:rgba(255,255,255,.5);margin-top:4px">'+p.s+'</div></div>';}).join('');
  // Bag button
  var xstarN=S.shopOwned['xstar']||0;
  var totalBag=S.potionStock+S.hintStock+S.crystalStock+xstarN;
  var bagBtn=$('map-bag-btn');
  if(bagBtn){
    var bc=$('map-bag-count');
    if(totalBag>0){bc.style.display='block';bc.textContent=totalBag;}else{bc.style.display='none';}
    bagBtn.onclick=function(){sfx('tick');showBagPopup();};
  }
  $('btn-map-back').onclick=function(){sfx('tick');if(_rgnAnimId){cancelAnimationFrame(_rgnAnimId);_rgnAnimId=null;}stopBg();playBg('home');initHome();goTo('home');};
  // Build node positions — Mario 3 winding S-curve path
  _rgnNodes=[];
  var nodePos2=[
    {x:0.10,y:0.22},{x:0.28,y:0.22},{x:0.46,y:0.22},{x:0.64,y:0.22},{x:0.82,y:0.22},
    {x:0.82,y:0.48},{x:0.64,y:0.48},{x:0.46,y:0.48},{x:0.28,y:0.48},{x:0.10,y:0.48}
  ];
  for(var li=0;li<10;li++){
    var pos=nodePos2[li];
    var key=S.region+'-'+li;
    var isDone=S.completed.has(key),isUnlocked=li<=unlv;
    var isCurrent=li===Math.min(unlv,9)&&!isDone;
    var stars=S.levelStars[key]||0;
    _rgnNodes.push({x:pos.x,y:pos.y,idx:li,isDone:isDone,isUnlocked:isUnlocked,isCurrent:isCurrent,stars:stars,name:LNAMES[li],icon:isCurrent?(S.character||'🧒'):isDone?'✅':isUnlocked?w.icon:'🔒'});
  }
  // Boss castle node at bottom center
  var bossUnlocked=unlv>=10;
  _rgnNodes.push({x:0.46,y:0.82,idx:10,isBoss:true,isDone:bDone,isUnlocked:bossUnlocked,isCurrent:false,stars:0,name:w.bossName+' Castle',icon:bDone?w.badge.e:bossUnlocked?'🏰':'🔒'});
  _rgnSel=-1;
  $('region-map-info').style.display='none';
  // Canvas click handler — enlarged hit radius for bigger nodes
  var canvas=$('region-map-canvas');
  canvas.onclick=function(e){
    var rect=canvas.getBoundingClientRect();
    var mx=(e.clientX-rect.left)/rect.width;
    var my=(e.clientY-rect.top)/rect.height;
    var hit=-1;
    for(var ni=0;ni<_rgnNodes.length;ni++){
      var nd=_rgnNodes[ni];
      var dx=mx-nd.x,dy=my-nd.y;
      var hitR=nd.isBoss?0.10:0.08;
      if(Math.sqrt(dx*dx+dy*dy)<hitR){hit=ni;break;}
    }
    if(hit>=0){
      sfx('tick');_rgnSel=hit;
      showRegionInfo(_rgnNodes[hit],w,totalBossWins);
    }
  };
  // Animate
  if(_rgnAnimId)cancelAnimationFrame(_rgnAnimId);
  var frame=0;
  function animLoop(){frame++;if(frame%3===0)drawRegionMap(frame);_rgnAnimId=requestAnimationFrame(animLoop);}
  animLoop();
}
function showRegionInfo(nd,w,totalBossWins){
  var info=$('region-map-info');info.style.display='block';
  var locked=!nd.isUnlocked;
  $('rmi-icon').textContent=nd.icon;
  if(nd.isBoss){
    $('rmi-name').textContent=nd.name+(nd.isDone?' — CLEARED!':locked?' — LOCKED':'');
    if(locked){$('rmi-stars').innerHTML='<span style="font-size:14px;color:#888;">Beat all levels to unlock!</span>';}
    else{$('rmi-stars').innerHTML='<span style="font-size:14px;color:#f87171;text-shadow:1px 1px 0 #000;">'+(totalBossWins>0?totalBossWins+' wins':'Boss Battle')+'</span>';}
    $('rmi-btn').textContent=locked?'LOCKED':nd.isDone?'REMATCH':'FIGHT';
    $('rmi-btn').style.background=locked?'#555':nd.isDone?'linear-gradient(135deg,#7c3aed,#6d28d9)':'linear-gradient(135deg,#dc2626,#991b1b)';
    $('rmi-btn').onclick=locked?null:function(){sfx('tick');startBoss();};
    $('rmi-btn').style.opacity=locked?'0.5':'1';
    $('rmi-btn').style.cursor=locked?'default':'pointer';
  }else{
    $('rmi-name').textContent=locked?'Level '+(nd.idx+1)+': ???':'Level '+(nd.idx+1)+': '+nd.name;
    if(locked){$('rmi-stars').innerHTML='<span style="font-size:14px;color:#888;">Locked</span>';}
    else if(nd.isDone){
      var sh='';for(var si=0;si<3;si++)sh+='<span style="font-size:22px;opacity:'+(si<nd.stars?1:.2)+'">⭐</span>';
      $('rmi-stars').innerHTML=sh;
    }else if(nd.isCurrent){
      $('rmi-stars').innerHTML='<span style="font-size:14px;color:#fbbf24;text-shadow:0 0 8px rgba(251,191,36,.5);">READY!</span>';
    }else{
      $('rmi-stars').innerHTML='';
    }
    $('rmi-btn').textContent=locked?'LOCKED':nd.isDone?'REPLAY':'PLAY';
    $('rmi-btn').style.background=locked?'#555':'linear-gradient(135deg,#f59e0b,#d97706)';
    $('rmi-btn').onclick=locked?null:function(){sfx('tick');startLevel(nd.idx);};
    $('rmi-btn').style.opacity=locked?'0.5':'1';
    $('rmi-btn').style.cursor=locked?'default':'pointer';
  }
}
function showBagPopup(){
  var xstarN=S.shopOwned['xstar']||0;
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);';
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  var box=document.createElement('div');
  box.style.cssText='background:linear-gradient(135deg,#1a1a2e,#16213e);border:3px solid #a78bfa;border-radius:14px;padding:18px 20px;max-width:320px;width:90%;box-shadow:0 0 30px rgba(167,139,250,.4);';
  var rows=[];
  // Potion
  if(S.potionStock>0){
    var canHeal=S.hp<S.maxHp;
    rows.push({icon:'❤️',name:'Potion',count:S.potionStock,tag:S.hp+'/'+S.maxHp+' HP',tagColor:'#f87171',action:canHeal?'USE':null,onUse:function(){sfx('power');S.potionStock--;S.hp=S.maxHp;S.hpRegenAt=null;S.achievements['a_potion']=Date.now();S.noPotionCount=0;save();checkAchievements();toast('b-toast','Hearts restored! ❤️',1500);refreshBag();}});
  }
  // Star Boost
  if(xstarN>0){
    rows.push({icon:'⭐',name:'2x Coins',count:xstarN,tag:'ACTIVE',tagColor:'#fbbf24',action:null});
  }
  // Hint
  if(S.hintStock>0){
    rows.push({icon:'💡',name:'Hint Scroll',count:S.hintStock,tag:'IN-GAME',tagColor:'#60a5fa',action:null});
  }
  // Crystal
  if(S.crystalStock>0){
    rows.push({icon:'🔮',name:'Time Crystal',count:S.crystalStock,tag:'BOSS',tagColor:'#a78bfa',action:null});
  }
  if(!rows.length){box.innerHTML='<div style="text-align:center;color:#888;font-family:var(--px);padding:20px;">No items yet!<br><span style="font-size:11px;">Visit the Shop to buy items.</span></div>';}
  else{
    var h='<div style="font-family:var(--px);font-size:14px;color:#e0e7ff;text-align:center;margin-bottom:14px;text-shadow:1px 1px 0 #000;">🎒 INVENTORY</div>';
    for(var ri=0;ri<rows.length;ri++){
      var r=rows[ri];
      h+='<div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 12px;margin-bottom:8px;">';
      h+='<span style="font-size:1.6rem;">'+r.icon+'</span>';
      h+='<div style="flex:1;"><div style="color:#fff;font-family:var(--px);font-size:12px;">'+r.name+'</div><div style="color:'+r.tagColor+';font-size:10px;">'+r.tag+'</div></div>';
      h+='<div style="color:#e5e7eb;font-family:var(--px);font-size:13px;">x'+r.count+'</div>';
      h+='<div class="bag-use-'+ri+'" style="display:none;"></div>';
      h+='</div>';
    }
    box.innerHTML=h;
    ov.appendChild(box);document.body.appendChild(ov);
    // Wire up USE buttons
    for(var bi=0;bi<rows.length;bi++){
      if(rows[bi].action&&rows[bi].onUse){
        var btn=document.createElement('div');
        btn.style.cssText='padding:4px 12px;background:linear-gradient(135deg,#22c55e,#15803d);border-radius:10px;font-size:10px;color:#fff;font-family:var(--px);cursor:pointer;text-shadow:1px 1px 0 #000;';
        btn.textContent=rows[bi].action;
        (function(idx){btn.onclick=function(e){e.stopPropagation();rows[idx].onUse();};})(bi);
        var slot=box.querySelector('.bag-use-'+bi);
        if(slot){slot.style.display='block';slot.appendChild(btn);}
      }
    }
    return;
  }
  ov.appendChild(box);document.body.appendChild(ov);
  function refreshBag(){ov.remove();showBagPopup();var x2=S.shopOwned['xstar']||0;var t=S.potionStock+S.hintStock+S.crystalStock+x2;if(t>0){$('map-bag-btn').style.display='flex';$('map-bag-count').textContent=t;}else{$('map-bag-btn').style.display='none';}}
}
function drawRegionMap(frame){
  frame=frame||0;
  var canvas=$('region-map-canvas');if(!canvas)return;
  var wrap=$('region-map-wrap');if(!wrap)return;
  var dpr=window.devicePixelRatio||1;
  var W=wrap.clientWidth,H=wrap.clientHeight;
  canvas.width=W*dpr;canvas.height=H*dpr;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  var ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  var w=_rgnWorld;if(!w)return;
  var s=Math.min(W,H)/420;

  // ===== THEMED BACKGROUND =====
  var themes={
    wb0:{sky1:'#6EC6FF',sky2:'#A8E6A0',ground:'#4A8C3F',groundDk:'#2E6B28',water:null,pathC:'#D4A437'},
    wb1:{sky1:'#00B4D8',sky2:'#006994',ground:'#C2A66B',groundDk:'#8B7340',water:'#0096C7',pathC:'#E8D5A3'},
    wb2:{sky1:'#FF4500',sky2:'#8B0000',ground:'#4A2000',groundDk:'#2A0A00',water:null,pathC:'#8B4513'},
    wb3:{sky1:'#D6EEFF',sky2:'#9EC8E8',ground:'#E8F0F8',groundDk:'#B8C8D8',water:null,pathC:'#8899AA'},
    wb4:{sky1:'#87CEEB',sky2:'#4A90B8',ground:'#8BC34A',groundDk:'#5A8A2A',water:null,pathC:'#D4A437'},
    wb5:{sky1:'#1A0050',sky2:'#0D002A',ground:'#2D1B4E',groundDk:'#1A0A30',water:null,pathC:'#6A3D9A'},
    wb6:{sky1:'#2E7D32',sky2:'#1B5E20',ground:'#33691E',groundDk:'#1A3A0A',water:null,pathC:'#8BC34A'},
    wb7:{sky1:'#5D4037',sky2:'#3E2723',ground:'#795548',groundDk:'#4E342E',water:null,pathC:'#A1887F'},
    wb8:{sky1:'#0D1B2A',sky2:'#1B2838',ground:'#2A3A4A',groundDk:'#152535',water:'#0A1628',pathC:'#4A6A8A'}
  };
  var t=themes[w.bgClass]||themes.wb0;
  var groundY=H*0.7;

  // Sky gradient
  var sky=ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,t.sky1);sky.addColorStop(1,t.sky2);
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,groundY+20);

  // Sun / Moon
  var sunX=W*0.85,sunY=H*0.1,sunR=18*s;
  ctx.fillStyle=w.bgClass==='wb5'||w.bgClass==='wb8'?'#DDD':'#FFD700';
  ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=20;
  ctx.beginPath();ctx.arc(sunX,sunY,sunR,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;

  // Clouds
  function drawCloud(cx2,cy2,cw2){
    ctx.fillStyle='rgba(255,255,255,0.7)';
    ctx.beginPath();ctx.ellipse(cx2,cy2,cw2*0.4,cw2*0.15,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(cx2-cw2*0.2,cy2-cw2*0.05,cw2*0.25,cw2*0.12,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(cx2+cw2*0.15,cy2-cw2*0.03,cw2*0.2,cw2*0.1,0,0,Math.PI*2);ctx.fill();
  }
  var cloudPositions=[[0.15,0.08,50],[0.55,0.05,60],[0.8,0.12,45],[0.35,0.15,35]];
  for(var ci=0;ci<cloudPositions.length;ci++){
    var cp=cloudPositions[ci];
    var cx3=(cp[0]*W+frame*0.15)%((W+200))-50;
    drawCloud(cx3,cp[1]*H,cp[2]*s);
  }

  // Distant hills
  ctx.fillStyle=t.ground+'88';
  ctx.beginPath();ctx.moveTo(0,groundY);
  ctx.quadraticCurveTo(W*0.15,groundY-H*0.12,W*0.3,groundY);
  ctx.quadraticCurveTo(W*0.5,groundY-H*0.18,W*0.7,groundY);
  ctx.quadraticCurveTo(W*0.85,groundY-H*0.1,W,groundY);
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();

  // Main ground
  var grd=ctx.createLinearGradient(0,groundY,0,H);
  grd.addColorStop(0,t.ground);grd.addColorStop(1,t.groundDk);
  ctx.fillStyle=grd;
  ctx.beginPath();ctx.moveTo(0,groundY+5);
  for(var gx=0;gx<=W;gx+=5){
    var gy=groundY+5+Math.sin(gx*0.012)*4+Math.sin(gx*0.003)*8;
    ctx.lineTo(gx,gy);
  }
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();

  // Water area at bottom (if applicable)
  if(t.water){
    var waterY=H*0.88;
    ctx.fillStyle=t.water+'66';
    ctx.beginPath();ctx.moveTo(0,waterY);
    for(var wx=0;wx<=W;wx+=3){
      ctx.lineTo(wx,waterY+Math.sin(wx*0.03+frame*0.05)*3);
    }
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
    // Water sparkles
    ctx.fillStyle='rgba(255,255,255,.2)';
    for(var wi2=0;wi2<8;wi2++){
      var wsx=(wi2*0.13*W+frame*0.4)%W;
      var wsy=waterY+5+Math.sin(frame*0.03+wi2*2)*3;
      ctx.beginPath();ctx.arc(wsx,wsy,1.5*s,0,Math.PI*2);ctx.fill();
    }
  }

  // ===== DECORATIONS =====
  // Seeded random for consistent placement
  var _ds=12345;
  function drand(){_ds=(_ds*16807)%2147483647;return(_ds-1)/2147483646;}

  // Trees
  function drawTree(tx,ty,sz){
    // Trunk
    ctx.fillStyle='#6D4C2A';ctx.fillRect(tx-sz*0.08,ty-sz*0.3,sz*0.16,sz*0.35);
    // Leaves — layered circles
    var leafC=w.bgClass==='wb6'||w.bgClass==='wb0'?'#2D8B2D':w.bgClass==='wb3'?'#6B9FAA':'#3AA03A';
    ctx.fillStyle=leafC;
    ctx.beginPath();ctx.arc(tx,ty-sz*0.45,sz*0.25,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(tx-sz*0.12,ty-sz*0.35,sz*0.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(tx+sz*0.1,ty-sz*0.38,sz*0.18,0,Math.PI*2);ctx.fill();
  }
  // Place trees in background
  _ds=12345;
  for(var tri=0;tri<8;tri++){
    var ttx=drand()*W;
    var tty=groundY-5+drand()*15;
    var ttsz=25+drand()*25;
    // Don't overlap nodes
    var tooClose=false;
    for(var tni=0;tni<_rgnNodes.length;tni++){
      var dx=ttx-_rgnNodes[tni].x*W,dy=tty-_rgnNodes[tni].y*H;
      if(Math.sqrt(dx*dx+dy*dy)<55*s)tooClose=true;
    }
    if(!tooClose)drawTree(ttx,tty,ttsz*s);
  }

  // Flowers / Mushrooms
  function drawFlower(fx,fy,sz2,kind){
    if(kind===0){ // Flower
      ctx.strokeStyle='#3A7D2A';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx,fy-sz2*0.5);ctx.stroke();
      var colors=['#FF6B6B','#FFD93D','#FF9F43','#FF69B4','#87CEEB'];
      ctx.fillStyle=colors[Math.floor(fx+fy)%5];
      for(var pi=0;pi<5;pi++){
        var ang=pi/5*Math.PI*2+frame*0.01;
        ctx.beginPath();ctx.arc(fx+Math.cos(ang)*sz2*0.15,fy-sz2*0.5+Math.sin(ang)*sz2*0.15,sz2*0.1,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(fx,fy-sz2*0.5,sz2*0.07,0,Math.PI*2);ctx.fill();
    }else if(kind===1){ // Mushroom
      ctx.fillStyle='#F5E6D3';ctx.fillRect(fx-sz2*0.06,fy-sz2*0.15,sz2*0.12,sz2*0.2);
      ctx.fillStyle='#E53935';ctx.beginPath();ctx.ellipse(fx,fy-sz2*0.2,sz2*0.18,sz2*0.12,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#FFF';ctx.beginPath();ctx.arc(fx-sz2*0.06,fy-sz2*0.24,sz2*0.04,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(fx+sz2*0.05,fy-sz2*0.18,sz2*0.03,0,Math.PI*2);ctx.fill();
    }
  }
  _ds=77777;
  for(var fi=0;fi<12;fi++){
    var ffx=drand()*W;
    var ffy=groundY+8+drand()*30;
    drawFlower(ffx,ffy,(8+drand()*8)*s,fi%3===2?1:0);
  }

  // Rocks
  function drawRock(rx,ry,rsz){
    ctx.fillStyle='#9E9E9E';
    ctx.beginPath();ctx.ellipse(rx,ry,rsz*0.5,rsz*0.3,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#BDBDBD';
    ctx.beginPath();ctx.ellipse(rx-rsz*0.1,ry-rsz*0.08,rsz*0.25,rsz*0.15,0,0,Math.PI*2);ctx.fill();
  }
  _ds=55555;
  for(var ri=0;ri<5;ri++){
    drawRock(drand()*W,groundY+5+drand()*20,(6+drand()*8)*s);
  }

  // ===== ANIMATED ANIMALS =====
  // Bird flying across
  function drawBird(bx,by,wingUp){
    ctx.strokeStyle='#333';ctx.lineWidth=1.5*s;
    ctx.beginPath();ctx.moveTo(bx-5*s,by+(wingUp?-3:1)*s);
    ctx.quadraticCurveTo(bx,by-2*s,bx+5*s,by+(wingUp?-3:1)*s);ctx.stroke();
  }
  for(var bi2=0;bi2<3;bi2++){
    var bbx=(frame*0.3+bi2*250)%((W+200))-50;
    var bby=H*0.08+bi2*H*0.06+Math.sin(frame*0.03+bi2*5)*8;
    drawBird(bbx,bby,Math.sin(frame*0.15+bi2*3)>0);
  }

  // Butterfly
  function drawButterfly(bfx,bfy,bfAng){
    ctx.fillStyle='#FF69B4';
    ctx.save();ctx.translate(bfx,bfy);
    var wing=Math.abs(Math.sin(frame*0.12+bfAng))*0.6+0.4;
    ctx.beginPath();ctx.ellipse(-3*s*wing,0,4*s*wing,3*s,-0.3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(3*s*wing,0,4*s*wing,3*s,0.3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#333';ctx.fillRect(-0.5*s,-3*s,1*s,6*s);
    ctx.restore();
  }
  _ds=33333;
  for(var bfi=0;bfi<3;bfi++){
    var bfx2=W*0.1+drand()*W*0.8+Math.sin(frame*0.02+bfi*4)*20;
    var bfy2=groundY-20+Math.sin(frame*0.025+bfi*3)*15+drand()*20;
    drawButterfly(bfx2,bfy2,bfi*2);
  }

  // Squirrel / small animal on ground
  function drawSquirrel(sx,sy,dir){
    ctx.fillStyle='#8B6914';
    ctx.beginPath();ctx.ellipse(sx,sy,6*s,4*s,0,0,Math.PI*2);ctx.fill(); // body
    ctx.beginPath();ctx.arc(sx+dir*5*s,sy-3*s,3*s,0,Math.PI*2);ctx.fill(); // head
    ctx.fillStyle='#FFD700';
    ctx.beginPath();ctx.arc(sx+dir*6*s,sy-4*s,1*s,0,Math.PI*2);ctx.fill(); // eye
    // Tail
    ctx.strokeStyle='#8B6914';ctx.lineWidth=2*s;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(sx-dir*5*s,sy-2*s);
    ctx.quadraticCurveTo(sx-dir*10*s,sy-12*s+Math.sin(frame*0.05)*2,sx-dir*7*s,sy-14*s);
    ctx.stroke();
  }
  _ds=99999;
  for(var ssi=0;ssi<2;ssi++){
    var ssx=(drand()*W*0.6+W*0.2+Math.sin(frame*0.008+ssi*10)*30)%(W-40)+20;
    var ssy=groundY+12+drand()*10;
    drawSquirrel(ssx,ssy,ssi===0?1:-1);
  }

  // ===== MARIO 3 DECORATIONS =====
  // Question Mark Block
  function drawQBlock(qx,qy,qsz,bobOff){
    var by2=qy+Math.sin(frame*0.04+bobOff)*3*s;
    ctx.fillStyle='#E5A100';
    ctx.fillRect(qx-qsz/2,by2-qsz/2,qsz,qsz);
    ctx.strokeStyle='#8B5E00';ctx.lineWidth=2*s;
    ctx.strokeRect(qx-qsz/2,by2-qsz/2,qsz,qsz);
    // Inner highlight
    ctx.fillStyle='#FFD54F';
    ctx.fillRect(qx-qsz/2+2*s,by2-qsz/2+2*s,qsz-4*s,3*s);
    // Rivets
    ctx.fillStyle='#8B5E00';
    var rv2=3*s;
    ctx.fillRect(qx-qsz/2+rv2,by2-qsz/2+rv2,rv2,rv2);
    ctx.fillRect(qx+qsz/2-rv2*2,by2-qsz/2+rv2,rv2,rv2);
    ctx.fillRect(qx-qsz/2+rv2,by2+qsz/2-rv2*2,rv2,rv2);
    ctx.fillRect(qx+qsz/2-rv2*2,by2+qsz/2-rv2*2,rv2,rv2);
    // ? mark
    ctx.font='bold '+(qsz*0.55)+'px var(--px)';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='#fff';ctx.shadowColor='#8B5E00';ctx.shadowBlur=1;
    ctx.fillText('?',qx,by2+1);ctx.shadowBlur=0;
  }
  // Place floating ? blocks (bigger, more of them)
  var qBlockPositions=[[0.22,0.18],[0.65,0.22],[0.42,0.45],[0.78,0.50],[0.15,0.65],[0.55,0.35],[0.85,0.28]];
  for(var qbi=0;qbi<qBlockPositions.length;qbi++){
    drawQBlock(qBlockPositions[qbi][0]*W,qBlockPositions[qbi][1]*H,28*s,qbi*1.7);
  }

  // Green Pipe
  function drawPipe(px2,py2,psz,pdir){
    var pw=psz*0.5,ph=psz*0.8;
    // Pipe rim (top)
    ctx.fillStyle='#2E8B2E';
    var rimW=pw*1.3,rimH=ph*0.25;
    if(pdir==='up'){
      ctx.fillRect(px2-rimW/2,py2-rimH,rimW,rimH);
      ctx.fillStyle='#3CB043';ctx.fillRect(px2-rimW/2,py2-rimH,rimW,rimH*0.4);
      // Pipe body
      ctx.fillStyle='#2E8B2E';ctx.fillRect(px2-pw/2,py2,ph,pw);
      ctx.fillStyle='#3CB043';ctx.fillRect(px2-pw/2,py2,pw*0.35,ph);
      // Highlight
      ctx.fillStyle='#5DD55D';ctx.fillRect(px2-pw/2+2*s,py2+2*s,4*s,ph-4*s);
    }else{
      ctx.fillRect(px2-rimW/2,py2,rimW,rimH);
      ctx.fillStyle='#3CB043';ctx.fillRect(px2-rimW/2,py2+rimH*0.6,rimW,rimH*0.4);
      ctx.fillStyle='#2E8B2E';ctx.fillRect(px2-pw/2,py2-ph,pw,ph);
      ctx.fillStyle='#3CB043';ctx.fillRect(px2-pw/2,py2-ph,pw*0.35,ph);
    }
  }
  drawPipe(W*0.92,groundY+2,45*s,'up');
  drawPipe(W*0.05,groundY+2,35*s,'up');

  // Floating Coins with spin
  function drawCoin2(cx2,cy2,csz2,phase){
    var scaleX=Math.abs(Math.cos(frame*0.06+phase));
    ctx.save();ctx.translate(cx2,cy2);ctx.scale(scaleX,1);
    ctx.fillStyle='#FFD700';ctx.beginPath();
    ctx.ellipse(0,0,csz2*0.4,csz2*0.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#FFF176';ctx.beginPath();
    ctx.ellipse(-csz2*0.08,-csz2*0.12,csz2*0.12,csz2*0.18,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  var coinPositions2=[[0.35,0.15],[0.72,0.18],[0.50,0.38],[0.20,0.52],[0.85,0.42],[0.60,0.65]];
  for(var cpi2=0;cpi2<coinPositions2.length;cpi2++){
    drawCoin2(coinPositions2[cpi2][0]*W,coinPositions2[cpi2][1]*H,10*s,cpi2*1.2);
  }

  // Super Mushroom
  function drawMushroom(mx2,my2,msz){
    var bobY=Math.sin(frame*0.035)*4*s;
    my2+=bobY;
    // Stem
    ctx.fillStyle='#F5E6D3';ctx.fillRect(mx2-msz*0.15,my2,msz*0.3,msz*0.25);
    // Cap
    ctx.fillStyle='#E53935';
    ctx.beginPath();ctx.ellipse(mx2,my2,msz*0.35,msz*0.22,0,Math.PI,0);ctx.fill();
    // White spots
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(mx2-msz*0.12,my2-msz*0.1,msz*0.08,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(mx2+msz*0.1,my2-msz*0.08,msz*0.06,0,Math.PI*2);ctx.fill();
    // Eyes
    ctx.fillStyle='#000';
    ctx.fillRect(mx2-msz*0.08,my2+msz*0.05,2*s,2*s);
    ctx.fillRect(mx2+msz*0.04,my2+msz*0.05,2*s,2*s);
  }
  drawMushroom(W*0.30,groundY-5,24*s);
  drawMushroom(W*0.75,groundY+8,20*s);

  // Star Power-up
  function drawStar5(sx2,sy2,ssz2,phase2){
    var rot2=frame*0.03+phase2;
    var bobY2=Math.sin(frame*0.05+phase2)*5*s;
    ctx.save();ctx.translate(sx2,sy2+bobY2);ctx.rotate(rot2);
    ctx.fillStyle='#FFD700';ctx.shadowColor='#FFD700';ctx.shadowBlur=8*s;
    ctx.beginPath();
    for(var si2=0;si2<5;si2++){
      var ang2=si2*Math.PI*2/5-Math.PI/2;
      var ox2=Math.cos(ang2)*ssz2*0.45,oy2=Math.sin(ang2)*ssz2*0.45;
      if(si2===0)ctx.moveTo(ox2,oy2);else ctx.lineTo(ox2,oy2);
      var ang2b=ang2+Math.PI/5;
      ctx.lineTo(Math.cos(ang2b)*ssz2*0.18,Math.sin(ang2b)*ssz2*0.18);
    }
    ctx.closePath();ctx.fill();
    // Eye
    ctx.fillStyle='#000';ctx.shadowBlur=0;
    ctx.beginPath();ctx.arc(-ssz2*0.06,-ssz2*0.02,ssz2*0.05,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(ssz2*0.1,-ssz2*0.02,ssz2*0.05,0,Math.PI*2);ctx.fill();
    ctx.restore();ctx.shadowBlur=0;
  }
  drawStar5(W*0.50,groundY-30*s,20*s,0);
  drawStar5(W*0.15,groundY-22*s,16*s,2.5);

  // 1-UP Mushroom (green)
  function draw1UPMushroom(ux2,uy2,usz){
    var bobU=Math.sin(frame*0.04+1)*3*s;
    uy2+=bobU;
    ctx.fillStyle='#F5E6D3';ctx.fillRect(ux2-usz*0.12,uy2,usz*0.24,usz*0.2);
    ctx.fillStyle='#43B047';
    ctx.beginPath();ctx.ellipse(ux2,uy2,usz*0.28,usz*0.18,0,Math.PI,0);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold '+(usz*0.2)+'px var(--px)';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('1',ux2-usz*0.06,uy2-usz*0.04);
    ctx.fillText('UP',ux2+usz*0.04,uy2-usz*0.04);
  }
  draw1UPMushroom(W*0.88,groundY-8*s,20*s);

  // ===== EXTRA MARIO 3 DECORATIONS =====
  // Goomba walking
  function drawGoomba(gx,gy,gsz,gPhase){
    var walkOff=Math.sin(frame*0.06+gPhase)*3*s;
    gy+=walkOff;
    // Body
    ctx.fillStyle='#8B4513';
    ctx.beginPath();ctx.ellipse(gx,gy,gsz*0.4,gsz*0.3,0,0,Math.PI*2);ctx.fill();
    // Head (darker dome)
    ctx.fillStyle='#6B3410';
    ctx.beginPath();ctx.ellipse(gx,gy-gsz*0.2,gsz*0.45,gsz*0.25,0,Math.PI,0);ctx.fill();
    // Eyes (white + pupil)
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.ellipse(gx-gsz*0.12,gy-gsz*0.15,gsz*0.1,gsz*0.12,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(gx+gsz*0.12,gy-gsz*0.15,gsz*0.1,gsz*0.12,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#000';
    ctx.beginPath();ctx.arc(gx-gsz*0.1,gy-gsz*0.13,gsz*0.05,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(gx+gsz*0.14,gy-gsz*0.13,gsz*0.05,0,Math.PI*2);ctx.fill();
    // Angry eyebrows
    ctx.strokeStyle='#000';ctx.lineWidth=2*s;
    ctx.beginPath();ctx.moveTo(gx-gsz*0.2,gy-gsz*0.28);ctx.lineTo(gx-gsz*0.05,gy-gsz*0.2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(gx+gsz*0.2,gy-gsz*0.28);ctx.lineTo(gx+gsz*0.05,gy-gsz*0.2);ctx.stroke();
    // Feet
    ctx.fillStyle='#3B2010';
    var footW=Math.sin(frame*0.1+gPhase)*gsz*0.08;
    ctx.fillRect(gx-gsz*0.3+footW,gy+gsz*0.15,gsz*0.2,gsz*0.1);
    ctx.fillRect(gx+gsz*0.1-footW,gy+gsz*0.15,gsz*0.2,gsz*0.1);
  }
  drawGoomba(W*0.45,groundY+10,22*s,0);
  drawGoomba(W*0.70,groundY+14,18*s,2.5);
  drawGoomba(W*0.18,groundY+8,20*s,4.0);

  // Koopa Shell
  function drawKoopaShell(kx,ky,ksz,kPhase){
    var spinAngle=frame*0.04+kPhase;
    var bobY=Math.sin(frame*0.04+kPhase)*3*s;
    ky+=bobY;
    // Shell body
    ctx.fillStyle='#2E8B2E';
    ctx.beginPath();ctx.ellipse(kx,ky,ksz*0.45,ksz*0.35,0,0,Math.PI*2);ctx.fill();
    // Shell highlight
    ctx.fillStyle='#4CAF50';
    ctx.beginPath();ctx.ellipse(kx-ksz*0.1,ky-ksz*0.08,ksz*0.2,ksz*0.15,-0.3,0,Math.PI*2);ctx.fill();
    // Shell lines
    ctx.strokeStyle='#1B5E20';ctx.lineWidth=1.5*s;
    ctx.beginPath();ctx.moveTo(kx,ky-ksz*0.35);ctx.lineTo(kx,ky+ksz*0.35);ctx.stroke();
    ctx.beginPath();ctx.ellipse(kx,ky,ksz*0.3,ksz*0.25,0,0,Math.PI*2);ctx.stroke();
    // Belly
    ctx.fillStyle='#F5DEB3';
    ctx.beginPath();ctx.ellipse(kx,ky+ksz*0.1,ksz*0.25,ksz*0.2,0,0,Math.PI);ctx.fill();
  }
  drawKoopaShell(W*0.62,groundY+12,18*s,1.5);
  drawKoopaShell(W*0.12,groundY+18,14*s,3.0);

  // Brick Block (Mario 3 style)
  function drawBrickBlock(bx,by,bsz){
    ctx.fillStyle='#C87533';
    ctx.fillRect(bx-bsz/2,by-bsz/2,bsz,bsz);
    ctx.strokeStyle='#8B4513';ctx.lineWidth=2*s;
    ctx.strokeRect(bx-bsz/2,by-bsz/2,bsz,bsz);
    // Brick lines
    var half=bsz/2;
    ctx.beginPath();ctx.moveTo(bx-half,by);ctx.lineTo(bx+half,by);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx,by-half);ctx.lineTo(bx,by);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx-half/2,by);ctx.lineTo(bx-half/2,by+half);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx+half/2,by);ctx.lineTo(bx+half/2,by+half);ctx.stroke();
    // Highlight
    ctx.fillStyle='rgba(255,255,255,.15)';
    ctx.fillRect(bx-half+2*s,by-half+2*s,bsz-4*s,3*s);
  }
  // Stack of bricks
  var brickBase=groundY-5;
  drawBrickBlock(W*0.38,brickBase-12*s,16*s);
  drawBrickBlock(W*0.38+16*s,brickBase-12*s,16*s);
  drawBrickBlock(W*0.38+8*s,brickBase-28*s,16*s);

  // Piranha Plant coming from pipe
  function drawPiranha(ppx,ppy,psz){
    var emergeY=Math.sin(frame*0.04)*psz*0.3;
    // Stem
    ctx.fillStyle='#2E8B2E';
    ctx.fillRect(ppx-psz*0.08,ppy+emergeY-psz*0.3,psz*0.16,psz*0.4);
    // Spots on stem
    ctx.fillStyle='#1B5E20';
    ctx.beginPath();ctx.arc(ppx-psz*0.02,ppy+emergeY-psz*0.1,psz*0.03,0,Math.PI*2);ctx.fill();
    // Head
    ctx.fillStyle='#E53935';
    ctx.beginPath();ctx.ellipse(ppx,ppy+emergeY-psz*0.4,psz*0.25,psz*0.2,0,0,Math.PI*2);ctx.fill();
    // Lips
    ctx.fillStyle='#C62828';
    ctx.beginPath();ctx.ellipse(ppx,ppy+emergeY-psz*0.25,psz*0.2,psz*0.06,0,0,Math.PI*2);ctx.fill();
    // White dots
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(ppx-psz*0.08,ppy+emergeY-psz*0.42,psz*0.04,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(ppx+psz*0.1,ppy+emergeY-psz*0.38,psz*0.03,0,Math.PI*2);ctx.fill();
    // Teeth
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.moveTo(ppx-psz*0.12,ppy+emergeY-psz*0.3);
    ctx.lineTo(ppx-psz*0.06,ppy+emergeY-psz*0.22);ctx.lineTo(ppx,ppy+emergeY-psz*0.3);ctx.fill();
    ctx.beginPath();ctx.moveTo(ppx,ppy+emergeY-psz*0.3);
    ctx.lineTo(ppx+psz*0.06,ppy+emergeY-psz*0.22);ctx.lineTo(ppx+psz*0.12,ppy+emergeY-psz*0.3);ctx.fill();
    // Eyes
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.ellipse(ppx-psz*0.08,ppy+emergeY-psz*0.48,psz*0.05,psz*0.07,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(ppx+psz*0.08,ppy+emergeY-psz*0.48,psz*0.05,psz*0.07,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#000';
    ctx.beginPath();ctx.arc(ppx-psz*0.08,ppy+emergeY-psz*0.47,psz*0.025,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(ppx+psz*0.08,ppy+emergeY-psz*0.47,psz*0.025,0,Math.PI*2);ctx.fill();
  }
  // Piranha coming from right pipe
  drawPiranha(W*0.92,groundY-25*s,35*s);

  // Fire Flower power-up
  function drawFireFlower(ffx,ffy,ffsz){
    var bobY2=Math.sin(frame*0.05)*4*s;
    ffy+=bobY2;
    // Stem
    ctx.fillStyle='#2E8B2E';ctx.fillRect(ffx-1.5*s,ffy,3*s,ffsz*0.35);
    // Petals
    var petalColors=['#FF6B00','#FF8C00','#FF4500','#FF6B00'];
    for(var pi2=0;pi2<4;pi2++){
      var ang2=pi2/4*Math.PI*2+frame*0.02;
      ctx.fillStyle=petalColors[pi2];
      ctx.beginPath();ctx.ellipse(ffx+Math.cos(ang2)*ffsz*0.12,ffy-ffsz*0.15+Math.sin(ang2)*ffsz*0.12,ffsz*0.1,ffsz*0.08,ang2,0,Math.PI*2);ctx.fill();
    }
    // Center
    ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(ffx,ffy-ffsz*0.15,ffsz*0.06,0,Math.PI*2);ctx.fill();
    // Leaf
    ctx.fillStyle='#43B047';
    ctx.beginPath();ctx.ellipse(ffx+ffsz*0.12,ffy+ffsz*0.1,ffsz*0.08,ffsz*0.04,0.5,0,Math.PI*2);ctx.fill();
  }
  drawFireFlower(W*0.55,groundY-8*s,20*s);
  drawFireFlower(W*0.82,groundY-5*s,16*s);

  // Floating cloud platforms (Mario 3 style pixel clouds)
  function drawPixelCloud(pcx,pcy,pcsz){
    ctx.fillStyle='rgba(255,255,255,.85)';
    // Blocky pixel cloud
    var cs=pcsz*0.2;
    ctx.fillRect(pcx-pcsz*0.5,pcy,cs*3,cs*2);
    ctx.fillRect(pcx-pcsz*0.3,pcy-cs,cs*4,cs*2);
    ctx.fillRect(pcx-pcsz*0.1,pcy-cs*2,cs*3,cs*2);
    // Eyes (cute face)
    ctx.fillStyle='#333';
    ctx.fillRect(pcx-cs*0.8,pcy-cs*0.3,cs*0.5,cs*0.5);
    ctx.fillRect(pcx+cs*0.3,pcy-cs*0.3,cs*0.5,cs*0.5);
    // Blush
    ctx.fillStyle='rgba(255,150,150,.4)';
    ctx.fillRect(pcx-cs*1.5,pcy+cs*0.2,cs*0.8,cs*0.4);
    ctx.fillRect(pcx+cs*0.8,pcy+cs*0.2,cs*0.8,cs*0.4);
  }
  drawPixelCloud(W*0.28,H*0.25,30*s);
  drawPixelCloud(W*0.72,H*0.20,35*s);
  drawPixelCloud(W*0.50,H*0.12,25*s);

  // Coin trail (line of coins like Mario 3 coin heaven)
  function drawCoinTrail(cctx,cty,ctsz,ctPhase){
    for(var cti=0;cti<5;cti++){
      var cx2=(cti*W*0.12+W*0.15+frame*0.3)%(W*0.7)+W*0.15;
      var ctyi=cty+Math.sin(frame*0.05+cti*0.8+ctPhase)*5*s;
      var scX=Math.abs(Math.cos(frame*0.06+cti*0.7+ctPhase));
      cctx.save();cctx.translate(cx2,ctyi);cctx.scale(scX,1);
      cctx.fillStyle='#FFD700';cctx.beginPath();
      cctx.ellipse(0,0,ctsz*0.35,ctsz*0.45,0,0,Math.PI*2);cctx.fill();
      cctx.fillStyle='#FFF176';cctx.beginPath();
      cctx.ellipse(-ctsz*0.06,-ctsz*0.1,ctsz*0.1,ctsz*0.15,0,0,Math.PI*2);cctx.fill();
      cctx.restore();
    }
  }
  drawCoinTrail(ctx,groundY-40*s,10*s,0);
  drawCoinTrail(ctx,groundY-65*s,8*s,3);

  // Spinning fire bars near boss castle
  function drawFireBar(fbx,fby,fblen){
    var fireAngle=frame*0.05;
    for(var fbi=0;fbi<4;fbi++){
      var fa=fireAngle+fbi*Math.PI/2;
      var fdx=Math.cos(fa)*fblen;
      var fdy=Math.sin(fa)*fblen;
      ctx.fillStyle=fbi%2===0?'#FF4500':'#FFD700';
      ctx.beginPath();ctx.arc(fbx+fdx,fby+fdy,4*s,0,Math.PI*2);ctx.fill();
      ctx.shadowColor=fbi%2===0?'#FF4500':'#FFD700';ctx.shadowBlur=6*s;
      ctx.fill();ctx.shadowBlur=0;
    }
    // Center
    ctx.fillStyle='#666';ctx.beginPath();ctx.arc(fbx,fby,3*s,0,Math.PI*2);ctx.fill();
  }
  drawFireBar(W*0.40,groundY-60*s,22*s);
  drawFireBar(W*0.60,groundY-55*s,18*s);

  // ===== DOTTED PATH (Mario 3 style) =====
  function nodePos(nd){return{x:nd.x*W,y:nd.y*H};}
  var pathOrder=[0,1,2,3,4,5,6,7,8,9,10];
  // Draw path connecting nodes sequentially
  for(var poi=1;poi<pathOrder.length;poi++){
    var pp1=nodePos(_rgnNodes[pathOrder[poi-1]]),pp2=nodePos(_rgnNodes[pathOrder[poi]]);
    var isUnlockedPath=_rgnNodes[pathOrder[poi]].isUnlocked;
    // Thick pixel-style dotted line
    var dx2=pp2.x-pp1.x,dy2=pp2.y-pp1.y;
    var dist=Math.sqrt(dx2*dx2+dy2*dy2);
    var dotSpacing=16*s;
    var numDots=Math.floor(dist/dotSpacing);
    for(var di=0;di<=numDots;di++){
      var t2=di/numDots;
      var dotX=pp1.x+dx2*t2, dotY=pp1.y+dy2*t2;
      var dotSize=isUnlockedPath?6*s:3*s;
      ctx.fillStyle=isUnlockedPath?t.pathC+'CC':t.pathC+'33';
      ctx.fillRect(dotX-dotSize,dotY-dotSize,dotSize*2,dotSize*2);
      if(isUnlockedPath){
        ctx.fillStyle='rgba(255,255,255,.3)';
        ctx.fillRect(dotX-dotSize*0.4,dotY-dotSize*0.4,dotSize*0.8,dotSize*0.8);
      }
    }
  }
  ctx.setLineDash([]);

  // ===== LEVEL NODES =====
  var nodeR=30*s;
  for(var ni=0;ni<_rgnNodes.length;ni++){
    var nd=_rgnNodes[ni];var np=nodePos(nd);var isSel=ni===_rgnSel;
    if(nd.isBoss){
      drawCastle(ctx,np.x,np.y,W,H,nd,frame,isSel,s);
    }else{
      drawLevelNode(ctx,np.x,np.y,nodeR,nd,w,frame,isSel,s);
    }
  }
}
function drawLevelNode(ctx,x,y,r,nd,w,frame,isSel,s){
  s=s||1;
  var bw=r*2, bh=r*2;
  // Drop shadow (offset pixel block)
  ctx.fillStyle='rgba(0,0,0,.35)';
  ctx.fillRect(x-r+4*s,y-r+4*s,bw,bh);
  ctx.fillStyle='rgba(0,0,0,.2)';
  ctx.fillRect(x-r+7*s,y-r+7*s,bw,bh);

  if(!nd.isUnlocked){
    // Locked: dark brick block
    ctx.fillStyle='#2a2a2a';ctx.fillRect(x-r,y-r,bw,bh);
    // brick mortar lines
    ctx.strokeStyle='#3a3a3a';ctx.lineWidth=1;
    for(var by2=y-r;by2<y+r;by2+=r*0.5){
      ctx.beginPath();ctx.moveTo(x-r,by2);ctx.lineTo(x+r,by2);ctx.stroke();
    }
    ctx.strokeStyle='#444';ctx.lineWidth=3*s;ctx.strokeRect(x-r,y-r,bw,bh);
    ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.strokeRect(x-r+1,y-r+1,bw-2,bh-2);
    ctx.font=(r*0.7)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='#555';ctx.fillText('🔒',x,y);
    return;
  }

  // Glow for active/done nodes
  if(nd.isDone||nd.isCurrent||isSel){
    ctx.shadowColor=nd.isDone?'#4ade80':'#fde047';ctx.shadowBlur=isSel?22:12;
  }

  var baseColor=nd.isDone?'#16a34a':nd.isCurrent?'#d97706':w.nodeColor;
  var darkColor=nd.isDone?'#0f6f30':nd.isCurrent?'#92400e':'#1a3a6a';
  var lightColor=nd.isDone?'#22c55e':nd.isCurrent?'#f59e0b':'#60a5fa';

  // Main block fill
  ctx.fillStyle=baseColor;ctx.fillRect(x-r,y-r,bw,bh);

  // Brick texture pattern
  ctx.fillStyle='rgba(0,0,0,.12)';
  var brickH=r*0.4, brickW=r*0.8;
  for(var row=0;row<Math.ceil(bh/brickH);row++){
    var ry2=y-r+row*brickH;
    var offset=(row%2===0)?0:brickW*0.5;
    ctx.fillRect(x-r,ry2,bw,1);
    for(var col=0;col<Math.ceil(bw/brickW)+1;col++){
      var rx=x-r+col*brickW+offset;
      if(rx>=x-r&&rx<=x+r)ctx.fillRect(rx,ry2,1,brickH);
    }
  }

  // Top highlight bevel
  ctx.fillStyle=lightColor;ctx.globalAlpha=0.35;
  ctx.fillRect(x-r,y-r,bw,r*0.25);
  ctx.globalAlpha=1;
  // Bottom dark bevel
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(x-r,y+r-r*0.2,bw,r*0.2);
  // Left highlight edge
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x-r,y-r,r*0.1,bh);
  // Right dark edge
  ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(x+r-r*0.1,y-r,r*0.1,bh);

  // Outer border (double pixel border for depth)
  ctx.strokeStyle='#000';ctx.lineWidth=3*s;ctx.strokeRect(x-r,y-r,bw,bh);
  ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=1;ctx.strokeRect(x-r+2,y-r+2,bw-4,bh-4);
  ctx.shadowBlur=0;

  // Inner decorative corner dots (pixel rivets)
  ctx.fillStyle='rgba(255,255,255,.2)';
  var cd=r*0.12;
  ctx.fillRect(x-r+r*0.2,y-r+r*0.2,cd*2,cd*2);
  ctx.fillRect(x+r-r*0.2-cd*2,y-r+r*0.2,cd*2,cd*2);
  ctx.fillRect(x-r+r*0.2,y+r-r*0.2-cd*2,cd*2,cd*2);
  ctx.fillRect(x+r-r*0.2-cd*2,y+r-r*0.2-cd*2,cd*2,cd*2);

  // Level number — big bold pixel text with 3D shadow
  ctx.textAlign='center';ctx.textBaseline='middle';
  var numStr=String(nd.idx+1);
  var numSize=r*0.85;
  ctx.font='bold '+numSize+'px var(--px)';
  // Shadow text
  ctx.fillStyle=darkColor;
  ctx.fillText(numStr,x+2*s,y+2*s);
  // Outline
  ctx.fillStyle='#000';
  for(var tox=-1;tox<=1;tox++){
    for(var toy=-1;toy<=1;toy++){
      if(tox||toy)ctx.fillText(numStr,x+tox,y+toy);
    }
  }
  ctx.fillStyle='#fff';
  ctx.fillText(numStr,x,y);

  // Selection ring — animated pixel double box
  if(isSel){
    var rr=r+10+Math.sin(frame*0.08)*4;
    ctx.strokeStyle='rgba(251,208,0,'+(0.7+0.3*Math.sin(frame*0.12)).toFixed(2)+')';
    ctx.lineWidth=4*s;
    ctx.strokeRect(x-rr,y-rr,rr*2,rr*2);
    ctx.strokeStyle='rgba(255,255,255,'+(0.3+0.2*Math.sin(frame*0.15)).toFixed(2)+')';
    ctx.lineWidth=2*s;
    ctx.strokeRect(x-rr-3,y-rr-3,rr*2+6,rr*2+6);
    // Corner sparkles
    var sp=Math.sin(frame*0.1)*3;
    ctx.fillStyle='#FBD000';
    ctx.fillRect(x-rr-5,y-rr-5,4+sp,4+sp);
    ctx.fillRect(x+rr+1,y-rr-5,4+sp,4+sp);
    ctx.fillRect(x-rr-5,y+rr+1,4+sp,4+sp);
    ctx.fillRect(x+rr+1,y+rr+1,4+sp,4+sp);
  }

  // Player bouncing on current level
  if(nd.isCurrent){
    var bounceY=Math.abs(Math.sin(frame*0.06))*14*s;
    ctx.font=(24*s)+'px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(S.character||'🧒',x,y-r-12*s-bounceY);
  }

  // Stars for completed levels — pixel style
  if(nd.isDone){
    var stx=x+r*0.6, sty=y-r*0.6, stz=r*0.25;
    ctx.fillStyle='#FBD000';
    ctx.beginPath();ctx.moveTo(stx,sty-stz);ctx.lineTo(stx+stz*0.3,sty-stz*0.3);
    ctx.lineTo(stx+stz,sty);ctx.lineTo(stx+stz*0.3,sty+stz*0.3);
    ctx.lineTo(stx,sty+stz);ctx.lineTo(stx-stz*0.3,sty+stz*0.3);
    ctx.lineTo(stx-stz,sty);ctx.lineTo(stx-stz*0.3,sty-stz*0.3);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#B8860B';ctx.lineWidth=1;ctx.stroke();
  }
}
function drawCastle(ctx,x,y,W,H,nd,frame,isSel,s){
  s=s||1;
  // Shadow
  ctx.fillStyle='rgba(0,0,0,.25)';
  ctx.beginPath();ctx.ellipse(x,y+22*s,55*s,12*s,0,0,Math.PI*2);ctx.fill();

  var cw=100*s,ch=90*s;
  if(!nd.isUnlocked){
    ctx.globalAlpha=0.4;
  }
  // Main wall
  ctx.fillStyle=nd.isDone?'#6D5D4B':'#4A3520';
  ctx.fillRect(x-cw/2,y-ch*0.35,cw,ch*0.5);
  // Brick lines
  ctx.strokeStyle=nd.isDone?'#5A4A3A':'#3A2510';ctx.lineWidth=0.5;
  for(var bli=0;bli<4;bli++){
    var bly=y-ch*0.35+bli*ch*0.12;
    ctx.beginPath();ctx.moveTo(x-cw/2,bly);ctx.lineTo(x+cw/2,bly);ctx.stroke();
  }
  // Left tower
  var tw2=20*s,th2=35*s;
  ctx.fillStyle=nd.isDone?'#7D6D5B':'#5A4530';
  ctx.fillRect(x-cw/2,y-ch*0.35-th2,tw2,ch*0.5+th2);
  // Right tower
  ctx.fillRect(x+cw/2-tw2,y-ch*0.35-th2,tw2,ch*0.5+th2);
  // Tower crenellations
  ctx.fillStyle=nd.isDone?'#8D7D6B':'#6A5540';
  for(var tci=0;tci<2;tci++){
    var tcx=tci===0?x-cw/2:x+cw/2-tw2;
    for(var cci=0;cci<3;cci++){
      ctx.fillRect(tcx+cci*(tw2/3),y-ch*0.35-th2-6*s,tw2/4.5,6*s);
    }
    // Tower window
    ctx.fillStyle=nd.isDone?'#FFD700':'#FF8C00';
    ctx.fillRect(tcx+tw2*0.3,y-ch*0.35-th2+10*s,tw2*0.35,tw2*0.35);
  }
  // Center battlement
  ctx.fillStyle=nd.isDone?'#8D7D6B':'#6A5540';
  for(var mi=0;mi<5;mi++){
    ctx.fillRect(x-cw/2+mi*(cw/5),y-ch*0.35-5*s,cw/7,5*s);
  }
  // Gate arch
  ctx.fillStyle=nd.isDone?'#2A1A08':'#0A0402';
  ctx.beginPath();
  ctx.moveTo(x-14*s,y+ch*0.15);ctx.lineTo(x-14*s,y-ch*0.05);
  ctx.arc(x,y-ch*0.05,14*s,Math.PI,0,false);
  ctx.lineTo(x+14*s,y+ch*0.15);ctx.fill();
  // Portcullis bars
  ctx.strokeStyle='#666';ctx.lineWidth=1.5*s;
  for(var bri=0;bri<4;bri++){
    var brx=x-10*s+bri*7*s;
    ctx.beginPath();ctx.moveTo(brx,y-ch*0.05);ctx.lineTo(brx,y+ch*0.15);ctx.stroke();
  }
  ctx.beginPath();ctx.moveTo(x-12*s,y+ch*0.02);ctx.lineTo(x+12*s,y+ch*0.02);ctx.stroke();

  // Boss emoji above castle
  ctx.textAlign='center';ctx.textBaseline='middle';
  if(!nd.isUnlocked){
    ctx.font=(20*s)+'px sans-serif';ctx.fillStyle='#666';ctx.fillText('🔒',x,y-ch*0.2);
  }else if(nd.isDone){
    ctx.font=(28*s)+'px sans-serif';ctx.fillText(nd.icon,x,y-ch*0.25);
  }else{
    var pulse=1+0.1*Math.sin(frame*0.08);
    ctx.save();ctx.translate(x,y-ch*0.25);ctx.scale(pulse,pulse);
    ctx.font=(28*s)+'px sans-serif';ctx.fillText(_rgnWorld.boss,0,0);ctx.restore();
    // Red glow
    ctx.shadowColor='#ff0000';ctx.shadowBlur=10+5*Math.sin(frame*0.06);
    ctx.strokeStyle='rgba(255,0,0,.25)';ctx.lineWidth=2;
    ctx.strokeRect(x-cw/2-3,y-ch*0.35-th2-8*s,cw+6,ch*0.5+th2+12*s);
    ctx.shadowBlur=0;
  }
  // Flag on left tower
  ctx.strokeStyle='#666';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x-cw/2+tw2/2,y-ch*0.35-th2-6*s);
  ctx.lineTo(x-cw/2+tw2/2,y-ch*0.35-th2-22*s);ctx.stroke();
  ctx.fillStyle=nd.isDone?'#22c55e':'#dc2626';
  var flagWave=Math.sin(frame*0.06)*2*s;
  ctx.beginPath();
  ctx.moveTo(x-cw/2+tw2/2,y-ch*0.35-th2-22*s);
  ctx.lineTo(x-cw/2+tw2/2+12*s+flagWave,y-ch*0.35-th2-18*s);
  ctx.lineTo(x-cw/2+tw2/2,y-ch*0.35-th2-14*s);ctx.fill();

  // Label
  ctx.font='bold '+(12*s)+'px var(--px)';ctx.fillStyle='#fff';ctx.textAlign='center';
  ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=3;
  ctx.fillText(nd.isDone?'CLEARED':nd.isUnlocked?'BOSS':'LOCKED',x,y+ch*0.15+18*s);
  ctx.shadowBlur=0;

  // Selection ring — pixel box style
  if(isSel){
    var sr2=55*s+Math.sin(frame*0.08)*3;
    ctx.strokeStyle='rgba(251,208,0,'+(0.6+0.3*Math.sin(frame*0.12)).toFixed(2)+')';
    ctx.lineWidth=4*s;
    ctx.strokeRect(x-sr2,y-ch*0.1-sr2,sr2*2,sr2*2);
  }
  ctx.globalAlpha=1;
}

// GAME — animated scene strip
function renderScene(bgClass){
  var el=$('g-scene');if(!el)return;el.innerHTML='';
  var svg='http://www.w3.org/2000/svg';
  var sv=document.createElementNS(svg,'svg');
  sv.setAttribute('viewBox','0 0 480 80');sv.setAttribute('width','100%');sv.setAttribute('height','100%');
  sv.style.cssText='display:block;';
  var idx=parseInt((bgClass.match(/wb(\d)/)||[])[1]||'0');
  var defs=document.createElementNS(svg,'defs');
  var styleEl=document.createElementNS(svg,'style');
  styleEl.textContent='@keyframes sFloatR{0%{transform:translateX(-40px)}100%{transform:translateX(520px)}}@keyframes sFloatL{0%{transform:translateX(520px)}100%{transform:translateX(-40px)}}@keyframes sFloatU{0%{transform:translateY(10px)}100%{transform:translateY(-20px)}}@keyframes sFloatD{0%{transform:translateY(-10px)}100%{transform:translateY(10px)}}@keyframes sPulse{0%,100%{opacity:.3}50%{opacity:1}}@keyframes sBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes sFlash{0%,90%,100%{opacity:0}95%{opacity:1}}';
  defs.appendChild(styleEl);sv.appendChild(defs);
  // Wrapper shifts all elements down 20px so they appear below the progress bar
  var wrap=document.createElementNS(svg,'g');wrap.setAttribute('transform','translate(0,20)');
  var rng=function(a,b){return a+Math.random()*(b-a);};
  var w=wrap; // shorthand
  if(idx===0){
    for(var i=0;i<3;i++){var c=document.createElementNS(svg,'g');c.innerHTML='<ellipse cx="0" cy="0" rx="'+rng(18,30)+'" ry="'+rng(8,14)+'" fill="rgba(255,255,255,.45)"/><ellipse cx="'+rng(-12,12)+'" cy="'+rng(-6,-2)+'" rx="'+rng(14,22)+'" ry="'+rng(6,10)+'" fill="rgba(255,255,255,.5)"/>';c.style.cssText='animation:sFloatR '+(14+i*4)+'s linear infinite;animation-delay:'+(-i*5)+'s;transform-origin:0 0;';c.setAttribute('transform','translate('+rng(50,200)+','+rng(10,40)+')');w.appendChild(c);}
    for(var i=0;i<2;i++){var b=document.createElementNS(svg,'text');b.textContent='🐦';b.setAttribute('font-size','12');b.setAttribute('x','0');b.setAttribute('y','0');b.style.cssText='animation:sFloatR '+(7+i*3)+'s linear infinite;animation-delay:'+(-i*3)+'s;';b.setAttribute('transform','translate('+rng(0,200)+','+rng(15,45)+')');w.appendChild(b);}
    for(var i=0;i<4;i++){var f=document.createElementNS(svg,'text');f.textContent='✨';f.setAttribute('font-size',rng(6,10).toFixed(0));f.setAttribute('x','0');f.setAttribute('y','0');f.style.cssText='animation:sPulse '+(1.5+Math.random())+'s ease-in-out infinite;animation-delay:'+(-i*.7)+'s;';f.setAttribute('transform','translate('+rng(20,460)+','+rng(30,55)+')');w.appendChild(f);}
  }else if(idx===1){
    for(var i=0;i<3;i++){var wv=document.createElementNS(svg,'path');wv.setAttribute('d','M0,'+(25+i*12)+' Q60,'+(15+i*12)+' 120,'+(25+i*12)+' T240,'+(25+i*12)+' T360,'+(25+i*12)+' T480,'+(25+i*12));wv.setAttribute('fill','none');wv.setAttribute('stroke','rgba(255,255,255,'+(0.15+i*0.08)+')');wv.setAttribute('stroke-width','2');wv.style.cssText='animation:sFloatR '+(8+i*2)+'s linear infinite;animation-delay:'+(-i*2)+'s;';w.appendChild(wv);}
    for(var i=0;i<3;i++){var bb=document.createElementNS(svg,'circle');bb.setAttribute('r',rng(2,5).toFixed(1));bb.setAttribute('fill','rgba(255,255,255,.25)');bb.style.cssText='animation:sFloatU '+(3+Math.random()*2)+'s ease-in-out infinite;animation-delay:'+(-i*1.2)+'s;';bb.setAttribute('cx',rng(50,430).toFixed(0));bb.setAttribute('cy',rng(40,55).toFixed(0));w.appendChild(bb);}
  }else if(idx===2){
    for(var i=0;i<6;i++){var em=document.createElementNS(svg,'circle');em.setAttribute('r',rng(1.5,3.5).toFixed(1));em.setAttribute('fill','rgba(255,'+Math.floor(rng(100,200))+',0,.6)');em.style.cssText='animation:sFloatU '+(1.5+Math.random()*2)+'s ease-in-out infinite;animation-delay:'+(-i*.5)+'s;';em.setAttribute('cx',rng(20,460).toFixed(0));em.setAttribute('cy',rng(30,55).toFixed(0));w.appendChild(em);}
    for(var i=0;i<2;i++){var lg=document.createElementNS(svg,'rect');lg.setAttribute('width','100%');lg.setAttribute('height','3');lg.setAttribute('fill','rgba(255,80,0,.12)');lg.style.cssText='animation:sPulse 2s ease-in-out infinite;animation-delay:'+(-i)+'s;';lg.setAttribute('y',(rng(45,55)).toFixed(0));w.appendChild(lg);}
  }else if(idx===3){
    for(var i=0;i<8;i++){var sn=document.createElementNS(svg,'text');sn.textContent='❄';sn.setAttribute('font-size',rng(6,12).toFixed(0));sn.setAttribute('fill','rgba(255,255,255,.5)');sn.style.cssText='animation:sFloatD '+(3+Math.random()*3)+'s ease-in-out infinite;animation-delay:'+(-i*.6)+'s;';sn.setAttribute('x',rng(10,470).toFixed(0));sn.setAttribute('y',rng(10,50).toFixed(0));w.appendChild(sn);}
    var au=document.createElementNS(svg,'ellipse');au.setAttribute('cx','240');au.setAttribute('cy','20');au.setAttribute('rx','200');au.setAttribute('ry','15');au.setAttribute('fill','none');au.setAttribute('stroke','rgba(100,200,255,.12)');au.setAttribute('stroke-width','6');au.style.cssText='animation:sPulse 4s ease-in-out infinite;';w.appendChild(au);
  }else if(idx===4){
    for(var i=0;i<3;i++){var c=document.createElementNS(svg,'g');c.innerHTML='<ellipse cx="0" cy="0" rx="'+rng(20,35)+'" ry="'+rng(8,14)+'" fill="rgba(255,255,255,.4)"/><ellipse cx="'+rng(-10,10)+'" cy="'+rng(-6,-2)+'" rx="'+rng(15,25)+'" ry="'+rng(6,10)+'" fill="rgba(255,255,255,.5)"/>';c.style.cssText='animation:sFloatR '+(12+i*5)+'s linear infinite;animation-delay:'+(-i*4)+'s;';c.setAttribute('transform','translate('+rng(50,200)+','+rng(10,45)+')');w.appendChild(c);}
    for(var i=0;i<3;i++){var rd=document.createElementNS(svg,'text');rd.textContent='☀';rd.setAttribute('font-size','16');rd.style.cssText='animation:sPulse 3s ease-in-out infinite;animation-delay:'+(-i)+'s;';rd.setAttribute('x',rng(350,440).toFixed(0));rd.setAttribute('y',rng(10,30).toFixed(0));w.appendChild(rd);}
  }else if(idx===5){
    var mn=document.createElementNS(svg,'text');mn.textContent='🌙';mn.setAttribute('font-size','20');mn.setAttribute('x','420');mn.setAttribute('y','25');mn.style.cssText='animation:sBob 4s ease-in-out infinite;';w.appendChild(mn);
    for(var i=0;i<3;i++){var bt=document.createElementNS(svg,'text');bt.textContent='🦇';bt.setAttribute('font-size',rng(8,14).toFixed(0));bt.style.cssText='animation:sFloatL '+(5+Math.random()*3)+'s linear infinite;animation-delay:'+(-i*2)+'s;';bt.setAttribute('transform','translate('+rng(100,400)+','+rng(10,50)+')');w.appendChild(bt);}
    for(var i=0;i<5;i++){var st=document.createElementNS(svg,'circle');st.setAttribute('r',rng(1,2).toFixed(1));st.setAttribute('fill','rgba(255,255,255,.5)');st.style.cssText='animation:sPulse '+(1+Math.random()*2)+'s ease-in-out infinite;animation-delay:'+(-i*.4)+'s;';st.setAttribute('cx',rng(10,470).toFixed(0));st.setAttribute('cy',rng(5,50).toFixed(0));w.appendChild(st);}
  }else if(idx===6){
    for(var i=0;i<6;i++){var ff=document.createElementNS(svg,'circle');ff.setAttribute('r',rng(1.5,3).toFixed(1));ff.setAttribute('fill','rgba(150,255,100,.5)');ff.style.cssText='animation:sBob '+(2+Math.random()*2)+'s ease-in-out infinite;animation-delay:'+(-i*.6)+'s;';ff.setAttribute('cx',rng(20,460).toFixed(0));ff.setAttribute('cy',rng(15,55).toFixed(0));w.appendChild(ff);}
    for(var i=0;i<3;i++){var sp=document.createElementNS(svg,'text');sp.textContent='🍃';sp.setAttribute('font-size',rng(8,12).toFixed(0));sp.style.cssText='animation:sFloatR '+(8+Math.random()*4)+'s linear infinite;animation-delay:'+(-i*3)+'s;';sp.setAttribute('transform','translate('+rng(0,200)+','+rng(15,50)+')');w.appendChild(sp);}
  }else if(idx===7){
    for(var i=0;i<10;i++){var rn=document.createElementNS(svg,'line');rn.setAttribute('x1',rng(0,480).toFixed(0));rn.setAttribute('y1','0');rn.setAttribute('x2',rng(-5,5).toFixed(0));rn.setAttribute('y2','12');rn.setAttribute('stroke','rgba(150,180,255,.3)');rn.setAttribute('stroke-width','1.5');rn.style.cssText='animation:sFloatD '+(0.4+Math.random()*0.4)+'s linear infinite;animation-delay:'+(-i*.15)+'s;';rn.setAttribute('transform','translate(0,'+rng(0,45).toFixed(0)+')');w.appendChild(rn);}
    var lt=document.createElementNS(svg,'polygon');lt.setAttribute('points','240,5 248,28 244,28 252,48 236,22 241,22');lt.setAttribute('fill','rgba(255,255,200,.7)');lt.style.cssText='animation:sFlash 5s linear infinite;';w.appendChild(lt);
  }else if(idx===8){
    for(var i=0;i<4;i++){var bb=document.createElementNS(svg,'circle');bb.setAttribute('r',rng(2,5).toFixed(1));bb.setAttribute('fill','none');bb.setAttribute('stroke','rgba(100,180,255,.3)');bb.setAttribute('stroke-width','1');bb.style.cssText='animation:sFloatU '+(3+Math.random()*2)+'s ease-in-out infinite;animation-delay:'+(-i*1)+'s;';bb.setAttribute('cx',rng(30,450).toFixed(0));bb.setAttribute('cy',rng(35,55).toFixed(0));w.appendChild(bb);}
    for(var i=0;i<2;i++){var fi=document.createElementNS(svg,'text');fi.textContent=i===0?'🐟':'🐠';fi.setAttribute('font-size','12');fi.style.cssText='animation:sFloatR '+(8+i*3)+'s linear infinite;animation-delay:'+(-i*4)+'s;';fi.setAttribute('transform','translate('+rng(0,150)+','+rng(20,45)+')');w.appendChild(fi);}
    for(var i=0;i<3;i++){var sw=document.createElementNS(svg,'path');sw.setAttribute('d','M'+(80+i*140)+',60 Q'+(80+i*140+8)+',45 '+(80+i*140)+',35 Q'+(80+i*140-6)+',25 '+(80+i*140)+',15');sw.setAttribute('fill','none');sw.setAttribute('stroke','rgba(50,150,80,.35)');sw.setAttribute('stroke-width','3');sw.style.cssText='animation:sBob 3s ease-in-out infinite;animation-delay:'+(-i*.8)+'s;';w.appendChild(sw);}
  }else{
    for(var i=0;i<4;i++){var ff=document.createElementNS(svg,'circle');ff.setAttribute('r',rng(1,2.5).toFixed(1));ff.setAttribute('fill','rgba(255,200,100,.4)');ff.style.cssText='animation:sPulse '+(1.5+Math.random())+'s ease-in-out infinite;animation-delay:'+(-i*.5)+'s;';ff.setAttribute('cx',rng(20,460).toFixed(0));ff.setAttribute('cy',rng(10,55).toFixed(0));w.appendChild(ff);}
  }
  sv.appendChild(wrap);
  el.appendChild(sv);
}

// GAME
function startLevel(lIdx){
  if(S.hp<=0){S.level=lIdx;S.levelWrong=0;showFail();return;}
  S.level=lIdx;S.qIdx=0;S.answered=false;S.levelWrong=0;S.combo=0;S.sessionMaxCombo=0;
  var d=diff(S.region,lIdx),w=getWorldData(S.region);
  S.questions=buildQs(d,QPL);audBtn('g-aud');
  $('g-world').innerHTML='<div style="color:#aaa;font-size:10px">W'+(S.region+1)+'-L'+(lIdx+1)+'</div>';
  $('g-coins').textContent=S.coins;
  updateHpUI();updateHintBtn();
  $('g-band').style.background=w.hdrGrad;$('g-lname').textContent=LNAMES[lIdx];
  $('s-game').className='scr on '+(w.bgClass||'wb-dark');$('s-game').style.boxShadow='none';
  $('fire-overlay').innerHTML='';$('g-combo').style.display='none';bgSpeedMult=1.0;
  renderScene(w.bgClass||'wb-dark');
  checkAchievements();goTo('game');loadQ();
}
function updateHpUI(){var l=$('g-lives');if(!l)return;var html='';for(var hi=0;hi<S.maxHp;hi++){var heart=hi<S.hp?'❤️':'🖤';var sp=emojiToSprite(hi<S.hp?'❤️':'🖤',24,24);html+='<span style="font-size:'+(hi<S.hp?'1.6rem':'1.1rem')+';opacity:'+(hi<S.hp?1:.2)+'">'+(sp||heart)+'</span>';}l.innerHTML=html;}
function updateHintBtn(){
  var hb=$('g-hint-btn');if(!hb)return;
  if(S.hintStock>0){
    hb.style.display='block';
    hb.innerHTML='<div class="hint-btn" id="hint-activate">💡 '+S.hintStock+'</div>';
    var ha=$('hint-activate');
    if(ha)ha.onclick=function(){
      sfx('tick');S.hintStock--;save();
      S.achievements['a_hint']=Date.now();
      checkAchievements();
      loadQ(true);// reload with hint
      updateHintBtn();
    };
  }else{hb.style.display='none';}
}
function loadQ(withHint){
  var q=S.questions[S.qIdx];if(!q)return;S.answered=false;
  $('g-prog').style.width=(S.qIdx/QPL*100)+'%';$('g-qnum').textContent=(S.qIdx+1)+'/'+QPL;
  renderQ(q,'q-icon','q-body','choices',function(choice,btn){
    if(S.answered)return;S.answered=true;
    var ok=choice===q.a;
    addStat(q.type,ok);
    document.querySelectorAll('#choices .choice-btn').forEach(function(b){
      b.disabled=true;
      if(b.textContent===q.a)b.classList.add('ok');
      else if(b===btn&&!ok)b.classList.add('ng');
    });
    if(ok){
      S.combo++;
      if(S.combo>S.maxCombo){S.maxCombo=S.combo;save();}
      if(S.combo>S.sessionMaxCombo)S.sessionMaxCombo=S.combo;
      var mult=getComboMult();
      var earnedBase=(S.shopOwned['xstar']||0)>0?2:1;
      var luckyMult=((S.shopOwned['luckystar']||0)>0&&Math.random()<.5)?2:1;
      var earned=mult*earnedBase*luckyMult;
      if((S.shopOwned['xstar']||0)>0){S.shopOwned['xstar']=Math.max(0,(S.shopOwned['xstar']||0)-1);}
      S.coins+=earned;S.totalCoins+=earned;$('g-coins').textContent=S.coins;
      coinPop(earned,'g-cpops');sfx(mult>=2?'combo2x':'coin');
      if(S.combo>=4){if(bgSpeedMult<1.25)setMusicSpeed(1.25);if(S.combo===4){sfx('combo2x');speak('Combo times two! Double coins!',1.4,1.0);}}
      else if(S.combo===3){sfx('combo');speak('On fire! Three in a row!',1.3,1.0);}
      updateComboUI();spawnFire(S.combo);
      var msgs=['Wahoo! Correct!','Well done!','Perfect!','Brilliant!'];
      var m=mult>=2?'x'+S.combo+' — 2x COINS!':pick(msgs);
      toast('g-toast',m);if(mult<2)speak(m,1.5,1.1);
      save();checkAchievements();
    }else{
      S.combo=0;S.levelWrong++;setMusicSpeed(1.0);updateComboUI();spawnFire(0);
      S.hp--;updateHpUI();sfx('ng');
      if(!S.hpRegenAt&&S.hp<S.maxHp){S.hpRegenAt=Date.now()+HP_REGEN_MS;}
      S.wrongLog.unshift({type:q.type,i:q.i,q:q.tts||'',display:q.display||null,ch:q.ch||[],correct:q.a,given:choice,world:getWorldData(S.region).name,level:LNAMES[S.level],time:new Date().toLocaleTimeString()});
      if(S.hp<=0){
        toast('g-toast','Out of hearts!',1200);speak('Out of hearts!',0.9,.9);
        // Achievement: comeback (completed a level after losing 2 hearts)
        setTimeout(function(){S.levelWinStreak=0;save();showFail();},900);return;
      }
      toast('g-toast','Correct answer: '+q.a,2000);speak('Not quite! The answer is '+q.a,.9,.95);save();
    }
    setTimeout(function(){
      var ni=S.qIdx+1;
      if(ni>=QPL){
        var tw=S.levelWrong,stars=tw===0?3:tw<=1?2:tw<=2?1:0;
        var starsEarned=(S.shopOwned['xp_scroll']||0)>0?3:stars;
        if((S.shopOwned['xp_scroll']||0)>0){S.shopOwned['xp_scroll']=Math.max(0,(S.shopOwned['xp_scroll']||0)-1);}
        var key=S.region+'-'+S.level;
        S.levelStars[key]=Math.max(S.levelStars[key]||0,starsEarned);
        S.completed.add(key);
        S.maxUnlock[S.region]=Math.max(S.maxUnlock[S.region]||0,S.level<9?S.level+1:10);
        S.levelWinStreak++;S.noPotionCount++;
        if(S.levelWrong>=2)S.achievements['a_comeback']=Date.now();
        var hadUnlocks=autoBuiltCheck();save();checkAchievements();
        if(starsEarned===3)sfx('power');else sfx('done');
        showVictory(starsEarned,hadUnlocks);
      }else{S.qIdx=ni;loadQ();sfx('tick');}
    },ok?1000:1600);
  },withHint);
  speakQ(qTTS(q));
}
function getComboMult(){return S.combo>3?2:1;}
function updateComboUI(){var g=$('g-combo');if(!g)return;if(S.combo>=3){g.style.display='flex';g.textContent=S.combo>=4?'x'+S.combo+' — 2x coins':'x'+S.combo+' COMBO';}else g.style.display='none';}

// FAIL SCREEN
// WRONG ANSWER REVIEW
var _revIdx=0,_revQs=[],_revScore=0,_revTotal=0;
function initReview(){
  audBtn('rev-aud');
  _revQs=S.wrongLog.slice(0,20).map(function(w){
    return{type:w.type,key:'rev:'+w.correct+':'+Math.random(),i:w.i||'📝',
      render:!!w.display,display:w.display,
      q:w.q||'What is the answer?',
      a:String(w.correct),ch:w.ch&&w.ch.length>=3?w.ch.map(String):[String(w.correct),String(parseInt(w.correct)+1),String(parseInt(w.correct)-1),String(parseInt(w.correct)+2)],
      _wrongGiven:String(w.given)};
  });
  if(!_revQs.length){toast('rev-toast','No questions to review!',2000);return;}
  _revIdx=0;_revScore=0;_revTotal=_revQs.length;
  $('rev-sub').textContent='Redo the questions you got wrong!';
  $('btn-rev-back').onclick=function(){sfx('tick');stopBg();playBg('home');initHome();goTo('home');};
  playBg('w0');
  loadRevQ();
}
function loadRevQ(){
  if(_revIdx>=_revQs.length){showRevResults();return;}
  var q=_revQs[_revIdx];
  updateRevProgress();
  renderQ(q,'rev-icon','rev-body','rev-choices',function(choice,btn){
    document.querySelectorAll('#rev-choices .choice-btn').forEach(function(b){b.disabled=true;
      if(b.textContent===q.a)b.classList.add('ok');
      else if(b===btn&&choice!==q.a)b.classList.add('ng');
    });
    var ok=choice===q.a;
    if(ok){_revScore++;sfx('ok');toast('rev-toast','Correct! +1',1000);}
    else{sfx('ng');toast('rev-toast','The answer was: '+q.a,2000);}
    setTimeout(function(){_revIdx++;loadRevQ();},ok?800:1500);
  },false);
  speakQ(q.tts||q.q);
}
function updateRevProgress(){
  var p=$('rev-progress');if(!p)return;p.innerHTML='';
  for(var i=0;i<_revTotal;i++){
    var dot=document.createElement('div');
    dot.style.cssText='width:12px;height:12px;border-radius:3px;border:2px solid '+(i<_revIdx?'#22c55e':i===_revIdx?'#fbbf24':'#333')+';background:'+(i<_revIdx?'rgba(34,197,94,.4)':i===_revIdx?'rgba(251,208,0,.3)':'rgba(0,0,0,.3)')+';transition:all .2s;';
    p.appendChild(dot);
  }
}
function showRevResults(){
  var pct=_revTotal>0?Math.round(_revScore/_revTotal*100):0;
  var card=$('rev-card');if(!card)return;
  card.innerHTML='<div style="font-size:3rem;margin-bottom:8px;">'+(pct>=80?'🎉':pct>=50?'👍':'💪')+'</div>'+
    '<div style="font-size:16px;color:#1e293b;font-weight:bold;">Review Complete!</div>'+
    '<div style="font-size:12px;color:#374151;margin-top:6px;">'+_revScore+'/'+_revTotal+' correct ('+pct+'%)</div>'+
    '<div style="font-size:11px;color:#64748b;margin-top:8px;">'+(pct>=80?'Amazing! You mastered them!':pct>=50?'Good progress! Keep practising!':'Keep trying — you will get them next time!')+'</div>';
  $('rev-choices').innerHTML='';
  var coinsEarned=_revScore*2;
  if(coinsEarned>0){S.coins+=coinsEarned;S.totalCoins+=coinsEarned;save();}
  // Remove reviewed questions from wrongLog
  var reviewed=S.wrongLog.splice(0,Math.min(20,_revTotal));
  save();
  // Button to go home
  var btns=$('rev-choices');
  var homeBtn=document.createElement('div');
  homeBtn.className='pb';
  homeBtn.style.cssText='background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:10px;padding:14px 24px;font-size:11px;color:#fff;';
  homeBtn.textContent='HOME +'+coinsEarned+' coins';
  homeBtn.onclick=function(){sfx('tick');stopBg();playBg('home');initHome();goTo('home');};
  btns.appendChild(homeBtn);
  if(_revScore<_revTotal){
    var retryBtn=document.createElement('div');
    retryBtn.className='pb';
    retryBtn.style.cssText='background:linear-gradient(135deg,#f97316,#ea580c);border-radius:10px;padding:14px 24px;font-size:11px;color:#fff;margin-left:10px;';
    retryBtn.textContent='RETRY WRONG ONES';
    retryBtn.onclick=function(){sfx('tick');initReview();};
    btns.style.cssText='display:flex;gap:10px;justify-content:center;width:100%;max-width:380px;';
    btns.appendChild(retryBtn);
  }
  sfx('done');
  if(pct>=80)confetti();
}

function showFail(){
  spawnFire(0);var gs=$('s-game');if(gs)gs.style.boxShadow='none';
  var fo=$('fire-overlay');if(fo)fo.innerHTML='';bgSpeedMult=1.0;
  $('fail-sub').innerHTML='Level: <b style="color:#fff">'+(LNAMES[S.level]||'?')+'</b> &nbsp; Hearts: <b style="color:#f87171">'+S.hp+'/'+S.maxHp+'</b>';
  renderFailRegenBox();
  var btns=$('fail-btns');btns.innerHTML='';
  if(S.potionStock>0&&S.hp<=0){
    var pb=el('div','background:#15803d;border-radius:10px;padding:14px 18px;font-size:11px;color:#fff;cursor:pointer;width:100%;text-align:center;','USE POTION ('+S.potionStock+' left)',{class:'pb'});
    pb.onclick=function(){sfx('power');S.potionStock--;S.hp=S.maxHp;S.hpRegenAt=null;S.achievements['a_potion']=Date.now();S.noPotionCount=0;save();checkAchievements();speak('Potion used! Hearts fully restored!',1.3,1.0);startLevel(S.level);};
    btns.appendChild(pb);
  }
  if(S.coins>=3){
    var bb=el('div','background:#7c3aed;border-radius:10px;padding:14px 18px;font-size:11px;color:#fff;cursor:pointer;width:100%;text-align:center;','BUY POTION (3 coins)',{class:'pb'});
    bb.onclick=function(){sfx('build');S.coins-=3;S.potionStock++;save();speak('Potion purchased!',1.2,1.0);showFail();};
    btns.appendChild(bb);
  }
  var sb=el('div','background:#374151;border-radius:10px;padding:14px 18px;font-size:11px;color:#fff;cursor:pointer;text-align:center;','SHOP',{class:'pb'});
  sb.onclick=function(){sfx('tick');S.blTab='shop';initBuilder();goTo('builder');};
  btns.appendChild(sb);
  var mb=el('div','background:#374151;border-radius:10px;padding:14px 18px;font-size:11px;color:#fff;cursor:pointer;text-align:center;','MAP',{class:'pb'});
  mb.onclick=function(){sfx('tick');initRegion();goTo('region');};
  btns.appendChild(mb);
  goTo('fail');
}
function showVictory(stars,hadUnlocks){
  spawnFire(0);$('s-game').style.boxShadow='none';$('fire-overlay').innerHTML='';bgSpeedMult=1.0;
  goTo('victory');
  $('vic-icon').innerHTML=stars===3?'🌟':stars>=1?emojiToSprite('⭐',48,48)||'⭐':'😅';
  $('vic-lname').textContent=LNAMES[S.level];
  $('vic-stars').innerHTML=[0,1,2].map(function(i){return '<span style="font-size:2rem;opacity:'+(i<stars?1:.2)+'">'+(emojiToSprite('⭐',28,28)||'⭐')+'</span>';}).join('');
  var earned=stars===3?6:stars>=1?3:1;
  $('vic-coins').textContent='+'+earned+' COINS EARNED';
  S.coins+=earned;S.totalCoins+=earned;save();checkAchievements();
  if(stars===3){confetti();speak('Three stars! Wahoo!',1.4,1.1);}else speak('Level complete!',1.3,.95);
  $('vic-hp-status').textContent=S.hp<S.maxHp?'Hearts: '+S.hp+'/'+S.maxHp+' (HP carries over!)':'';
  $('vic-combo-best').textContent=S.sessionMaxCombo>=3?'Best combo: x'+S.sessionMaxCombo+(S.sessionMaxCombo>=4?' — 2x coins!':''):'';
  $('vic-unlock').textContent=S.newUnlocks.length>0?(S.newUnlocks.length+' Castle Part'+(S.newUnlocks.length>1?'s':'')+' Unlocked!'):'';
  S.newUnlocks=[];
  var btns=$('vic-btns');btns.innerHTML='';
  var canNext=S.maxUnlock[S.region]>S.level&&S.level<9;
  var canBoss=S.level===9&&(S.maxUnlock[S.region]||0)>=10&&!S.bossDefeated.has(S.region);
  var btnDefs=[
    {l:'MAP',fn:function(){sfx('tick');initRegion();goTo('region');},bg:'#374151'},
    {l:'RETRY',fn:function(){sfx('coin');startLevel(S.level);},bg:'#374151'},
    {l:'BUILD',fn:function(){sfx('tick');initBuilder();goTo('builder');},bg:'#4338ca'}
  ];
  if(canNext)btnDefs.push({l:'NEXT',fn:function(){sfx('coin');startLevel(S.level+1);},bg:'#15803d'});
  if(canBoss)btnDefs.push({l:'BOSS!',fn:function(){sfx('tick');startBoss();},bg:'#dc2626'});
  btnDefs.forEach(function(bd){var b=el('div','background:'+bd.bg+';border-radius:8px;padding:12px 16px;font-size:10px;color:#fff;cursor:pointer;',bd.l,{class:'pb'});b.onclick=bd.fn;btns.appendChild(b);});
}

// BOSS
var _bossUsedCrystal=false;
function startBoss(){
  S.bossHP=QPB;S.playerHP=3;S.bossAnswered=false;S.bossUsedKeys=new Set();S.combo=0;S.sessionMaxCombo=0;
  _bossUsedCrystal=false;var _bossUsedPotion=false;
  var w=getWorldData(S.region);
  stopBg();playBg('boss');audBtn('boss-aud');
  $('boss-name').textContent=w.bossName;$('boss-spr').innerHTML=emojiToSprite(w.boss,96,96)||w.boss;updateBossHUD();
  // Crystal button
  var crystalDiv=$('boss-crystal-btn');
  if(crystalDiv){
    updateCrystalBtn();
  }
  // Boss battle — no exit allowed
  goTo('boss');sfx('bossentry');
  // Dramatic entrance — red flash + screen shake
  var flash=document.createElement('div');
  flash.style.cssText='position:fixed;inset:0;background:rgba(255,0,0,.6);z-index:999;pointer-events:none;transition:opacity .6s;';
  document.body.appendChild(flash);
  setTimeout(function(){flash.style.opacity='0';},100);
  setTimeout(function(){if(flash.parentNode)flash.parentNode.removeChild(flash);},800);
  var bossScr=$('s-boss');
  if(bossScr){bossScr.style.animation='bossShake .15s ease 3';setTimeout(function(){bossScr.style.animation='';},500);}
  setTimeout(function(){showBubble(w.intro,3000);},900);
  setTimeout(function(){loadBossQ();},1200);
}
function updateCrystalBtn(){
  var cb=$('boss-crystal-btn');if(!cb)return;
  if(S.crystalStock>0){
    cb.style.display='block';
    cb.innerHTML='<div class="crystal-btn">🔮 +15s ('+S.crystalStock+')</div>';
    cb.onclick=function(){
      if(S.crystalStock<=0)return;
      sfx('power');S.crystalStock--;S.bossTimerVal+=15;
      updateBossTimer();_bossUsedCrystal=true;
      S.achievements['a_crystal']=Date.now();
      save();checkAchievements();updateCrystalBtn();
      toast('b-toast','+15 seconds!',1500);
    };
  }else{cb.style.display='none';}
}
function updateBossHUD(){
  $('boss-hp-bar').style.width=(S.bossHP/QPB*100)+'%';$('boss-hp-txt').textContent=S.bossHP+'/'+QPB;
  var html='';for(var bhi=0;bhi<3;bhi++){var bh=emojiToSprite('❤️',22,22)||'❤️';html+='<span style="font-size:1.1rem;opacity:'+(bhi<S.playerHP?1:.2)+'">'+bh+'</span>';}
  $('boss-php').innerHTML=html;
}
function showBubble(t,d){d=d||2500;var b=$('boss-bubble');b.textContent=t;b.style.display='block';speakBoss(t);setTimeout(function(){b.style.display='none';},d);}
var BOSS_HURT=['AARGH!','Lucky hit!','Impossible!','GRAAAH!','Not yet!','You DARE?!'];
var BOSS_TAUNT=['HA! Too slow!','Take THAT!','HAHAHAHA!','Bow before me!'];
var BOSS_DEFEAT=['This cannot be! I will return!','NOOO! Impossible! This is not over!','Curse you! I shall have my revenge!','Defeated?! By a mere child?! NEVER!','GAAAAH! My power... fading... I will be back!','You think this is the end?! You are wrong!'];
var _bossHitFast=false;
function loadBossQ(){
  clearInterval(S.bossTimerInterval);S.bossQ=genBossQ();S.bossAnswered=false;_bossHitFast=true;
  renderQ(S.bossQ,'bq-icon','bq-body','b-choices',function(choice,btn){
    if(S.bossAnswered)return;S.bossAnswered=true;clearInterval(S.bossTimerInterval);
    var ok=choice===S.bossQ.a;
    addStat(S.bossQ.type,ok);
    document.querySelectorAll('#b-choices .choice-btn').forEach(function(b){
      b.disabled=true;
      if(b.textContent===S.bossQ.a)b.classList.add('ok');
      else if(b===btn&&!ok)b.classList.add('ng');
    });
    if(ok){
      var mult=getComboMult(),earned=3*mult;
      S.bossHP--;S.coins+=earned;S.totalCoins+=earned;S.combo++;
      if(S.combo>S.maxCombo){S.maxCombo=S.combo;save();}
      if(_bossHitFast&&S.bossTimerVal>=20){S.achievements['a_boss_fast']=Date.now();}
      // Boss hit animation
      var bossSpr=$('boss-spr');if(bossSpr){bossSpr.style.animation='none';void bossSpr.offsetWidth;bossSpr.style.animation='bossHitRecoil .5s ease-out';setTimeout(function(){bossSpr.style.animation='';},500);}
      var bossScr2=$('s-boss');if(bossScr2){var hf=document.createElement('div');hf.style.cssText='position:fixed;inset:0;z-index:998;pointer-events:none;animation:bossHitFlash .3s ease-out forwards;';bossScr2.appendChild(hf);setTimeout(function(){if(hf.parentNode)hf.parentNode.removeChild(hf);},350);}
      sfx('boss');showBubble(pick(BOSS_HURT),2000);
      toast('b-toast','HIT! +'+earned+(mult>1?' (2x COMBO!)':''),1000);
      save();checkAchievements();
    }else{
      S.playerHP--;sfx('ng');
      // Boss attack animation — RPG style
      var bossSpr=$('boss-spr');
      if(bossSpr){bossSpr.style.animation='none';void bossSpr.offsetWidth;bossSpr.style.animation='bossAttack .6s ease-out';setTimeout(function(){bossSpr.style.animation='';},600);}
      // Player area shake
      var bqCard=$('bq-card');
      if(bqCard){bqCard.style.animation='none';void bqCard.offsetWidth;bqCard.style.animation='playerHit .5s ease-out';setTimeout(function(){bqCard.style.animation='';},500);}
      // Red flash on screen
      var bossScr=$('s-boss');
      if(bossScr){var rf=document.createElement('div');rf.style.cssText='position:fixed;inset:0;background:rgba(255,0,0,.4);z-index:998;pointer-events:none;transition:opacity .4s;';bossScr.appendChild(rf);setTimeout(function(){rf.style.opacity='0';},150);setTimeout(function(){if(rf.parentNode)rf.parentNode.removeChild(rf);},500);}
      showBubble(pick(BOSS_TAUNT),1600);
    }
    updateBossHUD();
    setTimeout(function(){
      if(ok&&S.bossHP<=0){
        if(!_bossUsedCrystal&&S.playerHP===3)S.achievements['a_no_hint_boss']=Date.now();
        if(S.playerHP===3)S.achievements['a_boss_perfect']=Date.now();
        bossWin();
      }else if(!ok&&S.playerHP<=0){bossLose();}
      else loadBossQ();
    },1300);
  });
  S.bossTimerVal=30;updateBossTimer();
  S.bossTimerInterval=setInterval(function(){
    S.bossTimerVal--;updateBossTimer();_bossHitFast=false;
    if(S.bossTimerVal<=0){
      clearInterval(S.bossTimerInterval);
      if(!S.bossAnswered){
        if(S.crystalStock>0){
          showBossCrystalPrompt();
        }else{
          bossTimerPenalty();
        }
      }
    }
  },1000);
}
function bossTimerPenalty(){
  S.bossAnswered=true;S.playerHP--;sfx('ng');
  showBubble('TOO SLOW! HAHAHA!',1800);updateBossHUD();
  setTimeout(function(){if(S.playerHP<=0)bossLose();else loadBossQ();},1400);
}
function showBossCrystalPrompt(){
  sfx('tick');
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);';
  var box=document.createElement('div');
  box.style.cssText='background:linear-gradient(135deg,#1e1b4b,#312e81);border:3px solid #a78bfa;border-radius:12px;padding:20px 24px;text-align:center;max-width:300px;width:90%;box-shadow:0 0 30px rgba(167,139,250,.5);';
  box.innerHTML='<div style="font-size:2.5rem;">🔮</div><div style="color:#e0e7ff;font-family:var(--px);font-size:15px;margin:10px 0;">TIME\'S UP!</div><div style="color:#c4b5fd;font-size:12px;margin-bottom:14px;">Use a Time Crystal for +15 seconds?</div><div style="color:#a78bfa;font-size:11px;margin-bottom:14px;">You have <b style="color:#e0e7ff;">'+S.crystalStock+'</b> crystal'+(S.crystalStock>1?'s':'')+'</div><div style="display:flex;gap:10px;justify-content:center;"></div>';
  var btns=box.querySelector('div:last-child');
  var yBtn=document.createElement('div');
  yBtn.style.cssText='flex:1;padding:10px;background:linear-gradient(135deg,#7c3aed,#6d28d9);border:2px solid #a78bfa;border-radius:8px;color:#fff;font-family:var(--px);font-size:13px;cursor:pointer;text-shadow:1px 1px 0 #000;';
  yBtn.textContent='🔮 USE CRYSTAL';
  yBtn.onclick=function(){
    sfx('power');S.crystalStock--;S.bossTimerVal=15;
    S.bossAnswered=false;
    save();updateBossTimer();updateCrystalBtn();
    if(ov.parentNode)ov.parentNode.removeChild(ov);
    S.bossTimerInterval=setInterval(function(){
      S.bossTimerVal--;updateBossTimer();_bossHitFast=false;
      if(S.bossTimerVal<=0){
        clearInterval(S.bossTimerInterval);
        if(!S.bossAnswered){bossTimerPenalty();}
      }
    },1000);
    toast('b-toast','+15 seconds! Go!',1500);
  };
  var nBtn=document.createElement('div');
  nBtn.style.cssText='flex:1;padding:10px;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2);border-radius:8px;color:#ccc;font-family:var(--px);font-size:13px;cursor:pointer;';
  nBtn.textContent='❌ SKIP';
  nBtn.onclick=function(){if(ov.parentNode)ov.parentNode.removeChild(ov);bossTimerPenalty();};
  btns.appendChild(yBtn);btns.appendChild(nBtn);
  ov.appendChild(box);document.body.appendChild(ov);
}
function updateBossTimer(){
  var n=$('boss-timer-num'),bar=$('boss-timer-bar');if(!n||!bar)return;
  n.textContent=S.bossTimerVal+'s';n.style.color=S.bossTimerVal<=10?'#ef4444':S.bossTimerVal<=20?'#eab308':'#22c55e';
  bar.style.width=(Math.min(S.bossTimerVal,30)/30*100)+'%';
}
function bossWin(){
  clearInterval(S.bossTimerInterval);
  var w=getWorldData(S.region),isFirstWin=!S.bossDefeated.has(S.region);
  S.bossWins[S.region]=(S.bossWins[S.region]||0)+1;
  if(isFirstWin){
    S.bossDefeated.add(S.region);S.badges=S.badges.filter(function(b){return b.name!==w.badge.name;}).concat([w.badge]);
    if(S.region<99)S.maxUnlock[S.region+1]=S.maxUnlock[S.region+1]||0;
  }else{S.achievements['a_boss_rem']=Date.now();}
  var bonusCoins=isFirstWin?15:8;S.coins+=bonusCoins;S.totalCoins+=bonusCoins;
  var hadUnlocks=isFirstWin?autoBuiltCheck():false;
  save();checkAchievements();
  // Boss defeat animation + last words
  var defeatLine=pick(BOSS_DEFEAT);
  var bossSpr=$('boss-spr');
  if(bossSpr){
    bossSpr.style.animation='bossDefeated 1.2s ease-in forwards';
    // Explosion particles around boss
    var bossRect=bossSpr.getBoundingClientRect();
    var parts=['💥','✨','⭐','🔥','💫','⚡'];
    for(var ei=0;ei<12;ei++){
      var ep=document.createElement('div');
      ep.textContent=parts[ei%parts.length];
      ep.style.cssText='position:fixed;font-size:'+(16+Math.random()*20)+'px;pointer-events:none;z-index:600;animation:bossExplode '+(0.5+Math.random()*0.5)+'s ease-out forwards;';
      ep.style.left=(bossRect.left+bossRect.width/2-10)+'px';
      ep.style.top=(bossRect.top+bossRect.height/2-10)+'px';
      ep.style.setProperty('--dx',(Math.random()-.5)*300+'px');
      ep.style.setProperty('--dy',(Math.random()-.5)*300+'px');
      document.body.appendChild(ep);
      setTimeout(function(el){return function(){if(el.parentNode)el.parentNode.removeChild(el);};}(ep),1200);
    }
  }
  sfx('power');
  showBubble(defeatLine,4000);
  // Screen shake
  var bossScr3=$('s-boss');
  if(bossScr3){bossScr3.style.animation='bossShake .1s ease 6';setTimeout(function(){bossScr3.style.animation='';},700);}
  // Wait for boss to finish speaking, then show victory
  function showVictory(){
    confetti();speak(w.win,1.4,1.0);
    stopBg();playBg('w'+(S.region%6));S.combo=0;bgSpeedMult=1.0;
    $('bv-icon').textContent=w.badge.e;$('bv-sub').textContent=w.name+' conquered!';
    $('bv-badge').innerHTML='<span style="font-size:3rem">'+w.badge.e+'</span><div><div style="font-size:9px;color:#aaa">'+(isFirstWin?'NEW BADGE!':'BADGE EARNED')+'</div><div style="font-size:11px;color:var(--gold);margin-top:3px">'+w.badge.name+'</div><div style="font-family:system-ui;font-size:13px;color:#ccc;margin-top:2px">'+w.badge.desc+'</div></div>';
    $('bv-reward').textContent='+'+bonusCoins+' BOSS COINS'+(isFirstWin?' (first win bonus!)':' (rematch reward!)');
    $('bv-castle-unlock').textContent=hadUnlocks?'New castle parts unlocked!':'';
    var btns=$('bv-btns');btns.innerHTML='';
    var bvDefs=[
      {l:'REMATCH',fn:function(){sfx('tick');startBoss();},bg:'#dc2626'},
      {l:'BUILD',fn:function(){sfx('tick');initBuilder();goTo('builder');},bg:'#4338ca'},
      {l:'HOME',fn:function(){sfx('tick');stopBg();playBg('home');initHome();goTo('home');},bg:'#374151'}
    ];
    if(isFirstWin&&S.region<49)bvDefs.push({l:'NEXT WORLD',fn:function(){S.region++;playBg('w'+(S.region%6));initRegion();goTo('region');},bg:'#15803d'});
    bvDefs.forEach(function(bd){var b=el('div','background:'+bd.bg+';border-radius:8px;padding:12px 16px;font-size:10px;color:#fff;cursor:pointer;',bd.l,{class:'pb'});b.onclick=bd.fn;btns.appendChild(b);});
    goTo('bvic');
  }
  speakBoss(defeatLine,showVictory);
}
function bossLose(){
  clearInterval(S.bossTimerInterval);stopBg();playBg('w'+(S.region%6));
  speakBoss(getWorldData(S.region).lose);S.combo=0;bgSpeedMult=1.0;
  $('btn-bl-map').onclick=function(){sfx('tick');initRegion();goTo('region');};
  $('btn-bl-retry').onclick=function(){sfx('tick');startBoss();};
  goTo('blose');
}

// CASTLE BUILDER
function buildCount(){return CASTLE_PARTS.filter(function(p){return!p.free&&(S.partLevels[p.id]||0)>=MAX_PART_LEVEL;}).length;}
function totalLevels(){return S.completed.size;}
function bossCount(){return S.bossDefeated.size;}
function partState(p){
  if(p.free)return'built';
  var lv=S.partLevels[p.id]||0;
  if(lv>=MAX_PART_LEVEL)return'built';
  var req=p.req||{};
  var levOk=req.levels===undefined||totalLevels()>=req.levels;
  var bossOk=req.boss===undefined||bossCount()>=req.boss;
  if(!levOk||!bossOk)return'locked';
  if(p.cost===0)return'auto';
  if(S.coins>=p.cost)return'avail';
  return'need-coins';
}
function autoBuiltCheck(){
  var any=false;
  CASTLE_PARTS.forEach(function(p){
    if(p.free)return;
    var lv=S.partLevels[p.id]||0;
    if(lv>0)return;
    if(partState(p)==='auto'){S.partLevels[p.id]=MAX_PART_LEVEL;S.newUnlocks.push(p);any=true;}
  });
  if(any)save();return any;
}
function availableCount(){return CASTLE_PARTS.filter(function(p){return!p.free&&(S.partLevels[p.id]||0)<MAX_PART_LEVEL&&partState(p)==='avail';}).length;}
function initBuilder(){
  playBg('castle');audBtn('bld-aud');renderBuilderTabs();
  $('btn-bld-back').onclick=function(){sfx('tick');stopBg();playBg('home');initHome();goTo('home');};
}
function renderBuilderTabs(){
  var tabs=[{k:'castle',l:'Castle'},{k:'shop',l:'Shop'},{k:'decor',l:'Court'},{k:'collection',l:'Collect'},{k:'progress',l:'Stats'}];
  $('bld-tabs').innerHTML=tabs.map(function(t){var active=S.blTab===t.k;return '<div data-tab="'+t.k+'" class="pb" style="flex:1;padding:9px 2px;text-align:center;font-size:9px;border-radius:6px;cursor:pointer;background:'+(active?'var(--gold)':'rgba(255,255,255,.08)')+';color:'+(active?'#1a1a1a':'#fff')+';opacity:'+(active?1:.65)+';min-width:0;">'+t.l+'</div>';}).join('');
  $('bld-tabs').querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){sfx('tick');S.blTab=b.dataset.tab;renderBuilderTabs();renderBuilderContent();};});
  renderBuilderContent();
}
function renderBuilderContent(){
  var c=$('bld-content');c.innerHTML='';$('bld-coins').textContent=S.coins;
  var fp=buildCount(),tot=CASTLE_PARTS.filter(function(p){return!p.free;}).length;
  $('bld-sub').textContent=fp+'/'+tot+' parts · '+(S.potionStock||0)+' pot · '+(S.hintStock||0)+' hints';
  if(S.blTab==='castle')renderCastle(c);
  else if(S.blTab==='shop')renderShop(c);
  else if(S.blTab==='decor')renderDecorCourt(c);
  else if(S.blTab==='collection')renderCollection(c);
  else renderProgress(c);
}

// CASTLE VISUAL GRID
function renderCastleVisualGrid(container){
  var W=9,COLS=9,cw=56;
  var totalW=COLS*cw;
  var rowHs=CASTLE_ROW_H.slice();
  var skyH=36;
  var totalH=rowHs.reduce(function(a,b){return a+b;},0)+skyH;
  var wrap=el('div','border:3px solid #2a2a2a;border-radius:10px;overflow:hidden;position:relative;background:#0a0a0a;');
  var canvas=document.createElement('canvas');
  canvas.width=totalW;canvas.height=totalH;
  canvas.style.cssText='width:100%;display:block;image-rendering:pixelated;';
  wrap.appendChild(canvas);
  var ctx=canvas.getContext('2d');
  var _animFrame=null;
  function draw(time){
    time=time||0;
    ctx.clearRect(0,0,totalW,totalH);
    // Sky gradient
    var skyGrad=ctx.createLinearGradient(0,0,0,skyH);
    skyGrad.addColorStop(0,'#0d1b3e');skyGrad.addColorStop(0.5,'#1a2a5e');skyGrad.addColorStop(1,'#2a3a7e');
    ctx.fillStyle=skyGrad;ctx.fillRect(0,0,totalW,skyH);
    // Stars in sky
    var starPositions=[[15,8],[55,14],[95,6],[135,16],[175,10],[215,18],[255,8],[295,14],[335,6],[375,10],[415,16],[455,8]];
    starPositions.forEach(function(s,i){
      var twinkle=Math.sin(time/800+i*2)*0.3+0.7;
      ctx.fillStyle='rgba(255,255,200,'+twinkle+')';
      ctx.beginPath();ctx.arc(s[0],s[1],1.5,0,Math.PI*2);ctx.fill();
    });
    // Clouds
    var cloudX=(time/80)%totalW;
    ctx.fillStyle='rgba(255,255,255,0.06)';
    ctx.beginPath();ctx.ellipse(cloudX,16,25,10,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse((cloudX+200)%totalW,22,20,7,0,0,Math.PI*2);ctx.fill();
    // Crown
    var crownBuilt=(S.partLevels['crown']||0)>=MAX_PART_LEVEL;
    ctx.font='16px serif';ctx.textAlign='center';
    if(crownBuilt){
      var cy=8+Math.sin(time/500)*3;
      ctx.fillStyle='#FFD700';ctx.fillText('👑',totalW-24,cy+10);
    }else{
      ctx.globalAlpha=0.2;ctx.fillStyle='#888';ctx.fillText('👑',totalW-24,18);ctx.globalAlpha=1;
    }
    // Draw castle rows
    var yOff=skyH;
    CASTLE_ROWS.forEach(function(rowCells,ri){
      var rh=rowHs[ri];
      var xOff=0;
      rowCells.forEach(function(cell){
        var vis=CASTLE_VIS[cell.id]||{bg:'#555',bgu:'#1a1a1a',e:'?'};
        var part=CASTLE_PARTS.filter(function(p){return p.id===cell.id;})[0];
        var cw2=cell.span*cw;
        var lv=S.partLevels[cell.id]||0;
        var isBuilt=lv>=MAX_PART_LEVEL||vis.free;
        var isPartial=lv>0&&lv<MAX_PART_LEVEL;
        var pct=isBuilt?1:isPartial?lv/MAX_PART_LEVEL:0;
        // Background
        if(isBuilt||isPartial){
          ctx.globalAlpha=isBuilt?1:0.4+pct*0.5;
          var bgC=vis.bg;
          // Draw brick pattern for walls
          if(cell.id==='wl'||cell.id==='wr'||cell.id==='uwl'||cell.id==='uwr'||cell.id==='fl'||cell.id==='fc'||cell.id==='fr'){
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
            // Bricks
            ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=0.5;
            var bH=rh>36?8:6;var bW=10;
            for(var by=0;by<rh;by+=bH){
              var offset=(Math.floor(by/bH)%2)*bW/2;
              for(var bx=-bW;bx<cw2+bW;bx+=bW){
                ctx.strokeRect(xOff+bx+offset,yOff+by,bW,bH);
              }
            }
            // Windows (lit yellow) on upper walls
            if((cell.id==='wl'||cell.id==='wr'||cell.id==='uwl'||cell.id==='uwr')&&rh>30){
              ctx.fillStyle='rgba(255,230,100,0.7)';
              ctx.fillRect(xOff+cw2*0.35,yOff+rh*0.25,cw2*0.12,rh*0.3);
              ctx.fillRect(xOff+cw2*0.6,yOff+rh*0.25,cw2*0.12,rh*0.3);
              ctx.fillStyle='rgba(255,230,100,0.15)';
              ctx.beginPath();ctx.arc(xOff+cw2*0.41,yOff+rh*0.35,cw2*0.15,0,Math.PI*2);ctx.fill();
              ctx.beginPath();ctx.arc(xOff+cw2*0.66,yOff+rh*0.35,cw2*0.15,0,Math.PI*2);ctx.fill();
            }
          }else if(cell.id==='gate'){
            // Gate: dark arch with portcullis bars
            ctx.fillStyle='#1a1a1a';ctx.fillRect(xOff,yOff,cw2,rh);
            ctx.strokeStyle='#555';ctx.lineWidth=1;
            // Arch
            ctx.beginPath();ctx.arc(xOff+cw2/2,yOff+rh*0.6,cw2*0.35,Math.PI,0);ctx.stroke();
            // Portcullis bars
            for(var gx=xOff+cw2*0.2;gx<xOff+cw2*0.8;gx+=6){
              ctx.beginPath();ctx.moveTo(gx,yOff+2);ctx.lineTo(gx,yOff+rh-2);ctx.stroke();
            }
          }else if(cell.id==='arch'){
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
            // Arch shape
            ctx.fillStyle='#2A2A2A';
            ctx.beginPath();ctx.arc(xOff+cw2/2,yOff+rh,cw2*0.3,Math.PI,0);ctx.fill();
          }else if(cell.id==='ltm'||cell.id==='rtm'){
            // Towers: stone blocks
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
            ctx.strokeStyle='rgba(0,0,0,0.25)';ctx.lineWidth=0.5;
            for(var ty=0;ty<rh;ty+=7){for(var tx=0;tx<cw2;tx+=9){
              var to=(Math.floor(ty/7)%2)*4.5;
              ctx.strokeRect(xOff+tx+to,yOff+ty,9,7);
            }}
          }else if(cell.id==='ltt'||cell.id==='rtt'){
            // Tower tops: conical roofs
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff+rh*0.4,cw2,rh*0.6);
            // Triangle roof
            ctx.beginPath();ctx.moveTo(xOff,yOff+rh*0.45);ctx.lineTo(xOff+cw2/2,yOff);ctx.lineTo(xOff+cw2,yOff+rh*0.45);ctx.closePath();ctx.fill();
            // Roof detail lines
            ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=0.5;
            ctx.beginPath();ctx.moveTo(xOff+cw2*0.2,yOff+rh*0.3);ctx.lineTo(xOff+cw2/2,yOff+3);ctx.lineTo(xOff+cw2*0.8,yOff+rh*0.3);ctx.stroke();
          }else if(cell.id==='spir'){
            // Spire: pointed
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff+rh*0.35,cw2,rh*0.65);
            ctx.beginPath();ctx.moveTo(xOff+5,yOff+rh*0.4);ctx.lineTo(xOff+cw2/2,yOff);ctx.lineTo(xOff+cw2-5,yOff+rh*0.4);ctx.closePath();ctx.fill();
            ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(xOff+cw2/2,yOff+4,3,0,Math.PI*2);ctx.fill();
          }else if(cell.id==='batt'){
            // Battlements: zigzag top
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff+rh*0.25,cw2,rh*0.75);
            var bWid=cw2/6;
            for(var bx2=0;bx2<6;bx2++){
              if(bx2%2===0){ctx.fillStyle=bgC;ctx.fillRect(xOff+bx2*bWid,yOff,bWid,rh*0.3);}
            }
          }else if(cell.id==='grnd'){
            // Ground: grass with blades
            var gGrad=ctx.createLinearGradient(0,yOff,0,yOff+rh);
            gGrad.addColorStop(0,'#2D5A1B');gGrad.addColorStop(1,'#1a3a10');
            ctx.fillStyle=gGrad;ctx.fillRect(xOff,yOff,cw2,rh);
            // Grass blades
            ctx.strokeStyle='#3a7a2a';ctx.lineWidth=1;
            for(var gx2=0;gx2<cw2;gx2+=3){
              var h2=2+Math.sin(gx2*7.3+time/2000)*2;
              ctx.beginPath();ctx.moveTo(xOff+gx2,yOff);ctx.lineTo(xOff+gx2-1,yOff-h2);ctx.stroke();
            }
          }else if(cell.id==='moat'){
            // Moat: animated water
            var mGrad=ctx.createLinearGradient(0,yOff,0,yOff+rh);
            mGrad.addColorStop(0,'#1565C0');mGrad.addColorStop(1,'#0D47A1');
            ctx.fillStyle=mGrad;ctx.fillRect(xOff,yOff,cw2,rh);
            // Animated waves
            ctx.strokeStyle='rgba(100,180,255,0.3)';ctx.lineWidth=1;
            for(var wy=0;wy<rh;wy+=5){
              ctx.beginPath();
              for(var wx=0;wx<cw2;wx++){
                var wave=Math.sin((wx+time/300+wy*20)*0.1)*2;
                if(wx===0)ctx.moveTo(xOff+wx,yOff+wy+wave);
                else ctx.lineTo(xOff+wx,yOff+wy+wave);
              }
              ctx.stroke();
            }
          }else if(cell.id==='cannon_l'||cell.id==='cannon_r'){
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
            ctx.fillStyle='#444';ctx.fillRect(xOff+cw2*0.1,yOff+rh*0.3,cw2*0.5,rh*0.25);
            ctx.fillStyle='#333';
            var cDir=cell.id==='cannon_l'?1:-1;
            var cEnd=cell.id==='cannon_l'?xOff+cw2*0.65:xOff+cw2*0.15;
            ctx.fillRect(cell.id==='cannon_l'?xOff+cw2*0.55:xOff+cw2*0.1,yOff+rh*0.33,cw2*0.35,rh*0.19);
            // Wheels
            ctx.fillStyle='#5a3a1a';
            ctx.beginPath();ctx.arc(xOff+cw2*0.25,yOff+rh*0.75,rh*0.14,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(xOff+cw2*0.55,yOff+rh*0.75,rh*0.14,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#888';
            ctx.beginPath();ctx.arc(xOff+cw2*0.25,yOff+rh*0.75,rh*0.06,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(xOff+cw2*0.55,yOff+rh*0.75,rh*0.06,0,Math.PI*2);ctx.fill();
          }else if(cell.id==='armory'){
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
            // Weapon rack
            ctx.fillStyle='#5a3a1a';ctx.fillRect(xOff+cw2*0.15,yOff+rh*0.15,cw2*0.7,2);
            ctx.fillRect(xOff+cw2*0.15,yOff+rh*0.85,cw2*0.7,2);
            // Swords
            ctx.strokeStyle='#ccc';ctx.lineWidth=1;
            for(var swi=0;swi<4;swi++){
              var swX=xOff+cw2*(0.25+swi*0.15);
              ctx.beginPath();ctx.moveTo(swX,yOff+rh*0.15);ctx.lineTo(swX,yOff+rh*0.85);ctx.stroke();
              ctx.fillStyle='#8B4513';ctx.fillRect(swX-2,yOff+rh*0.48,4,3);
            }
            // Shield
            ctx.fillStyle='#c00';
            ctx.beginPath();ctx.moveTo(xOff+cw2*0.75,yOff+rh*0.2);ctx.lineTo(xOff+cw2*0.9,yOff+rh*0.35);ctx.lineTo(xOff+cw2*0.9,yOff+rh*0.6);ctx.lineTo(xOff+cw2*0.825,yOff+rh*0.75);ctx.lineTo(xOff+cw2*0.75,yOff+rh*0.6);ctx.closePath();ctx.fill();
          }else if(cell.id==='portc'){
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
            // Iron bars
            ctx.fillStyle='#1a1a1a';ctx.fillRect(xOff,yOff,cw2,rh);
            ctx.strokeStyle='#666';ctx.lineWidth=2;
            for(var px=xOff+cw2*0.15;px<xOff+cw2*0.85;px+=8){
              ctx.beginPath();ctx.moveTo(px,yOff);ctx.lineTo(px,yOff+rh);ctx.stroke();
            }
            for(var py=yOff+rh*0.2;py<yOff+rh;py+=8){
              ctx.beginPath();ctx.moveTo(xOff+cw2*0.1,py);ctx.lineTo(xOff+cw2*0.9,py);ctx.stroke();
            }
          }else if(cell.id==='throne'){
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
            // Throne silhouette
            ctx.fillStyle='#6a0080';
            ctx.fillRect(xOff+cw2*0.2,yOff+rh*0.1,cw2*0.6,rh*0.8);
            ctx.fillRect(xOff+cw2*0.15,yOff+rh*0.05,cw2*0.7,rh*0.2);
            ctx.fillStyle='#FFD700';
            ctx.beginPath();ctx.arc(xOff+cw2*0.5,yOff+rh*0.15,3,0,Math.PI*2);ctx.fill();
            // Steps
            ctx.fillStyle='#8a60a0';
            ctx.fillRect(xOff+cw2*0.25,yOff+rh*0.85,cw2*0.5,rh*0.15);
          }else if(cell.id==='flag_l'||cell.id==='flag_r'){
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
            // Flag pole
            ctx.strokeStyle='#8B4513';ctx.lineWidth=2;
            var fpX=xOff+cw2*0.5;
            ctx.beginPath();ctx.moveTo(fpX,yOff+rh);ctx.lineTo(fpX,yOff+2);ctx.stroke();
            // Flag
            var fWave=Math.sin(time/200+(cell.id==='flag_l'?0:3))*2;
            ctx.fillStyle=cell.id==='flag_l'?'#dc2626':'#1e40af';
            ctx.beginPath();ctx.moveTo(fpX,yOff+2);ctx.lineTo(fpX+12,yOff+6+fWave);ctx.lineTo(fpX,yOff+12);ctx.fill();
          }else if(cell.id==='gardens'){
            ctx.fillStyle='#1a3a10';ctx.fillRect(xOff,yOff,cw2,rh);
            for(var fli=0;fli<6;fli++){
              var flx=xOff+cw2*0.1+fli*cw2*0.15;
              var fly=yOff+rh*0.3+Math.sin(fli*2+time/1000)*rh*0.1;
              ctx.fillStyle=['#ff6b9d','#ffd700','#ff4444','#ff69b4','#ffaa00','#ff5555'][fli];
              ctx.beginPath();ctx.arc(flx,fly,2,0,Math.PI*2);ctx.fill();
            }
            ctx.fillStyle='#2D5A1B';
            for(var fti=0;fti<4;fti++){
              ctx.fillRect(xOff+cw2*(0.15+fti*0.2),yOff+rh*0.2,1,rh*0.5);
              ctx.beginPath();ctx.arc(xOff+cw2*(0.15+fti*0.2),yOff+rh*0.2,3,0,Math.PI*2);ctx.fillStyle='#3a7a2a';ctx.fill();
            }
          }else if(cell.id==='og_l'||cell.id==='og_r'){
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
            ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=0.5;
            for(var oby=0;oby<rh;oby+=7){for(var obx=0;obx<cw2;obx+=9){
              var obo=(Math.floor(oby/7)%2)*4.5;
              ctx.strokeRect(xOff+obx+obo,yOff+oby,9,7);
            }}
          }else{
            ctx.fillStyle=bgC;ctx.fillRect(xOff,yOff,cw2,rh);
          }
          // Label at bottom
          if(part&&rh>28){
            ctx.globalAlpha=isBuilt?0.5:0.3;
            ctx.fillStyle='#fff';ctx.font='5px var(--px)';
            ctx.textAlign='center';
            ctx.fillText(part.label.split(' ')[0],xOff+cw2/2,yOff+rh-2);
          }
          ctx.globalAlpha=1;
          // Built animated details
          if(isBuilt){
            // Flags on towers (waving)
            if(cell.id==='ltt'||cell.id==='rtt'){
              var flagX=cell.id==='ltt'?xOff+cw2*0.7:xOff+cw2*0.3;
              var flagY=yOff+rh*0.1;
              ctx.strokeStyle='#8B4513';ctx.lineWidth=1;
              ctx.beginPath();ctx.moveTo(flagX,flagY);ctx.lineTo(flagX,flagY-8);ctx.stroke();
              var wave=Math.sin(time/200+ri*3)*2;
              ctx.fillStyle=cell.id==='ltt'?'#dc2626':'#2563eb';
              ctx.beginPath();ctx.moveTo(flagX,flagY-8);ctx.lineTo(flagX+6,flagY-5+wave);ctx.lineTo(flagX,flagY-2);ctx.fill();
            }
            // Torch flames on walls
            if((cell.id==='wl'||cell.id==='wr')&&rh>30){
              for(var ti=0;ti<2;ti++){
                var tx=xOff+cw2*(0.3+ti*0.4);
                var ty=yOff+rh*0.15;
                ctx.fillStyle='#8B4513';ctx.fillRect(tx-1,ty,2,5);
                var flicker=Math.sin(time/100+ti*5+ri)*1.5;
                ctx.fillStyle='rgba(255,160,0,0.8)';ctx.beginPath();ctx.arc(tx+flicker,ty-2,2.5,0,Math.PI*2);ctx.fill();
                ctx.fillStyle='rgba(255,255,100,0.5)';ctx.beginPath();ctx.arc(tx+flicker*0.5,ty-3,1.5,0,Math.PI*2);ctx.fill();
              }
            }
            // Smoke from gate
            if(cell.id==='gate'){
              for(var si=0;si<3;si++){
                var sx2=xOff+cw2*0.4+si*cw2*0.1;
                var smokeY=yOff-2-((time/40+si*15)%20);
                var smokeA=1-((time/40+si*15)%20)/20;
                ctx.globalAlpha=smokeA*0.15;
                ctx.fillStyle='#aaa';ctx.beginPath();ctx.arc(sx2+Math.sin(time/300+si)*2,smokeY,2+si,0,Math.PI*2);ctx.fill();
              }
              ctx.globalAlpha=1;
            }
            // Battlement flags
            if(cell.id==='batt'){
              var bfX=xOff+cw2*0.5;
              var bfY=yOff;
              ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bfX,bfY);ctx.lineTo(bfX,bfY-6);ctx.stroke();
              var bfwave=Math.sin(time/250)*1.5;
              ctx.fillStyle='#FBD000';
              ctx.beginPath();ctx.moveTo(bfX,bfY-6);ctx.lineTo(bfX+5,bfY-3+bfwave);ctx.lineTo(bfX,bfY);ctx.fill();
            }
            // Spire sparkle
            if(cell.id==='spir'){
              var spX=xOff+cw2/2;
              var spY=yOff+4;
              var sparkleT=(time%1500)/1500;
              if(sparkleT<0.5){
                ctx.globalAlpha=1-sparkleT*2;
                ctx.strokeStyle='#FFD700';ctx.lineWidth=1;
                ctx.beginPath();ctx.moveTo(spX-3-sparkleT*5,spY);ctx.lineTo(spX+3+sparkleT*5,spY);ctx.stroke();
                ctx.beginPath();ctx.moveTo(spX,spY-3-sparkleT*5);ctx.lineTo(spX,spY+3+sparkleT*5);ctx.stroke();
              }
              ctx.globalAlpha=1;
            }
            // Cannon smoke
            if(cell.id==='cannon_l'||cell.id==='cannon_r'){
              for(var csi=0;csi<3;csi++){
                var csPhase=(time/600+csi*1.5)%1;
                if(csPhase<0.5){
                  var csmX=cell.id==='cannon_l'?xOff+cw2*0.7:xOff+cw2*0.1;
                  var csmY=yOff+rh*0.35;
                  ctx.globalAlpha=(0.5-csPhase)*0.4;
                  ctx.fillStyle='#bbb';
                  ctx.beginPath();ctx.arc(csmX+csPhase*15*(cell.id==='cannon_l'?1:-1),csmY-csPhase*10,2+csPhase*5,0,Math.PI*2);ctx.fill();
                }
              }
              ctx.globalAlpha=1;
            }
          }
          // Partial build: animated construction overlay
          if(isPartial){
            // Pulsing progress bar
            var pulseBright=0.7+Math.sin(time/300)*0.3;
            ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(xOff,yOff+rh-3,cw2,3);
            ctx.fillStyle='rgba(251,208,0,'+pulseBright+')';ctx.fillRect(xOff,yOff+rh-3,cw2*pct,3);
            // Animated construction sparkles
            var sparkCount=Math.ceil(pct*4);
            for(var sci=0;sci<sparkCount;sci++){
              var scPhase=(time/500+sci*1.7)%1;
              if(scPhase<0.4){
                var scX=xOff+cw2*0.2+sci*cw2*0.2;
                var scY=yOff+rh*0.3+Math.sin(time/200+sci)*rh*0.2;
                ctx.globalAlpha=1-scPhase/0.4;
                ctx.fillStyle='#FFD700';ctx.font='6px serif';ctx.textAlign='center';
                ctx.fillText('✦',scX,scY);
              }
            }
            ctx.globalAlpha=1;
            // Hammer icon pulsing
            var hammerBob=Math.sin(time/250)*3;
            ctx.font='8px serif';ctx.textAlign='center';
            ctx.fillStyle='rgba(255,255,255,'+(0.5+Math.sin(time/400)*0.3)+')';
            ctx.fillText('🔨',xOff+cw2/2,yOff+rh/2+hammerBob);
          }
        }else{
          // Unbuilt: dark
          ctx.globalAlpha=0.12;
          ctx.fillStyle=vis.bgu||'#1a1a1a';ctx.fillRect(xOff,yOff,cw2,rh);
          ctx.fillStyle='#666';ctx.font='10px serif';ctx.textAlign='center';
          ctx.fillText('🔒',xOff+cw2/2,yOff+rh/2+3);
          ctx.globalAlpha=1;
        }
        xOff+=cw2;
      });
      yOff+=rh;
    });
    // Pixel art sprite definitions for decorations
    var SPRITES={
      fountain:[[0,0,'#4FC3F7',0,0],[0,'#4FC3F7','#4FC3F7','#4FC3F7',0],[0,'#1565C0','#1565C0','#1565C0',0],[0,0,'#90CAF9',0,0],[0,'#90CAF9','#90CAF9','#90CAF9',0]],
      garden:[[0,'#43B047','#E53935','#43B047',0],['#43B047','#FFEB3B','#43B047','#FF9800','#43B047'],['#43B047','#43B047','#43B047','#43B047','#43B047'],[0,'#795548',0,'#795548',0]],
      statue:[[0,0,'#9E9E9E',0,0],[0,'#BDBDBD','#BDBDBD','#BDBDBD',0],[0,'#9E9E9E','#9E9E9E','#9E9E9E',0],[0,0,'#757575',0,0]],
      well:[[0,'#795548',0,'#795548',0],['#795548','#4FC3F7','#4FC3F7','#795548','#795548'],['#795548',0,0,'#795548',0],['#795548','#795548','#795548','#795548',0]],
      windmill:[[0,0,'#FFF',0,0],['#FFF',0,'#F5F5DC',0,'#FFF'],[0,0,'#8D6E63',0,0],[0,'#8D6E63','#8D6E63','#8D6E63',0]],
      lanterns:[[0,'#FF5722',0,'#FF5722',0],['#FF5722','#FFEB3B','#FF5722','#FFEB3B','#FF5722'],[0,'#333',0,'#333',0],['#333',0,'#333',0,'#333']],
      rainbow:[['#F44336','#FF9800','#FFEB3B','#43B047','#2196F3'],['#E91E63','#FF5722','#FFC107','#4CAF50','#3F51B5'],[0,0,0,0,0]],
      sunflower:[[0,0,'#FFEB3B',0,0],[0,'#43B047','#FFEB3B','#43B047',0],['#43B047','#43B047','#795548','#43B047','#43B047'],[0,'#43B047',0,'#43B047',0]],
      treehouse:[[0,'#43B047','#43B047','#43B047',0],[0,'#8D6E63','#8D6E63','#8D6E63',0],['#8D6E63','#F5F5DC','#8D6E63','#F5F5DC','#8D6E63'],[0,'#795548','#795548','#795548',0]],
      carousel:[[0,'#E91E63',0,'#E91E63',0],['#E91E63','#FFF','#FFF','#FFF','#E91E63'],['#F44336','#F44336','#F44336','#F44336','#F44336'],[0,'#F44336','#F44336','#F44336',0]],
      dragon_s:[[0,0,'#4CAF50',0,0],[0,'#4CAF50','#F44336','#4CAF50',0],['#4CAF50','#F44336','#FF9800','#F44336','#4CAF50'],[0,'#4CAF50','#4CAF50','#4CAF50',0]],
      peacock:[[0,0,'#2196F3','#2196F3',0],[0,'#2196F3','#43B047','#2196F3',0],['#2196F3','#43B047','#FFEB3B','#43B047','#2196F3'],[0,0,'#2196F3',0,0]],
      firework:[[0,0,'#F44336',0,0],[0,'#FFEB3B','#FF9800','#FFEB3B',0],['#F44336','#FF9800','#FFEB3B','#FF9800','#F44336'],[0,0,'#FF5722',0,0]],
      shrine:[[0,'#E91E63','#E91E63','#E91E63',0],[0,'#BDBDBD','#BDBDBD','#BDBDBD',0],['#BDBDBD','#BDBDBD','#BDBDBD','#BDBDBD','#BDBDBD'],[0,'#9E9E9E','#9E9E9E','#9E9E9E',0]],
      hot_air:[[0,'#FF9800','#FF9800','#FF9800',0],[0,'#FFF','#2196F3','#FFF',0],[0,'#FFF','#2196F3','#FFF',0],[0,0,'#795548',0,0]],
      turtle_pond:[[0,0,'#4CAF50',0,0],[0,'#4CAF50','#4FC3F7','#4CAF50',0],['#4FC3F7','#4FC3F7','#4FC3F7','#4FC3F7','#4FC3F7'],[0,'#795548','#795548','#795548',0]],
      mini_volcano:[[0,0,'#8D6E63',0,0],[0,'#8D6E63','#8D6E63','#8D6E63',0],['#8D6E63','#FF5722','#8D6E63','#FF5722','#8D6E63'],[0,'#795548','#795548','#795548',0]],
      mermaid_f:[[0,'#2196F3','#2196F3','#2196F3',0],[0,'#FFCC80','#2196F3','#FFCC80',0],[0,0,'#2196F3',0,0],[0,0,'#4FC3F7',0,0]],
      circus:[[0,'#FFF','#F44336','#FFF',0],['#F44336','#FFF','#F44336','#FFF','#F44336'],['#F44336','#F44336','#F44336','#F44336','#F44336'],[0,'#F44336','#F44336','#F44336',0]],
      mini_castle:[[0,0,'#BDBDBD',0,0],[0,'#BDBDBD','#F44336','#BDBDBD',0],['#BDBDBD','#BDBDBD','#BDBDBD','#BDBDBD','#BDBDBD'],[0,'#9E9E9E','#9E9E9E','#9E9E9E',0]],
      piano:[[0,'#212121','#212121','#212121',0],['#212121','#FFF','#212121','#FFF','#212121'],['#212121','#212121','#212121','#212121','#212121'],[0,'#212121','#212121','#212121',0]],
      ice_sculpture:[[0,0,'#B3E5FC',0,0],[0,'#B3E5FC','#E1F5FE','#B3E5FC',0],[0,'#E1F5FE','#B3E5FC','#E1F5FE',0],[0,0,'#81D4FA',0,0]],
      bookshelf:[['#795548','#FFF','#795548','#FFF','#795548'],['#795548','#FFF','#795548','#FFF','#795548'],['#795548','#795548','#795548','#795548','#795548'],[0,'#795548','#795548','#795548',0]],
      portal:[[0,0,'#9C27B0',0,0],[0,'#9C27B0','#E040FB','#9C27B0',0],['#9C27B0','#E040FB','#FF80AB','#E040FB','#9C27B0'],[0,'#9C27B0','#E040FB','#9C27B0',0]],
      eternal_flame:[[0,0,'#FF9800',0,0],[0,'#FF5722','#FFEB3B','#FF5722',0],['#F44336','#FF5722','#FFEB3B','#FF5722','#F44336'],[0,0,'#9E9E9E',0,0]],
      golden_gate:[[0,'#FFD700','#FFD700','#FFD700',0],[0,'#FFD700','#B8860B','#FFD700',0],['#FFD700','#B8860B','#B8860B','#B8860B','#FFD700'],[0,'#FFD700','#FFD700','#FFD700',0]],
      cosmic_throne:[[0,'#7C4DFF','#7C4DFF','#7C4DFF',0],['#7C4DFF','#FFD700','#B9F6CA','#FFD700','#7C4DFF'],[0,'#7C4DFF','#7C4DFF','#7C4DFF',0],['#7C4DFF','#7C4DFF','#7C4DFF','#7C4DFF','#7C4DFF']],
      crystal_g:[[0,'#B9F6CA','#B9F6CA','#B9F6CA',0],[0,'#B9F6CA','#E1F5FE','#B9F6CA',0],['#B9F6CA','#E1F5FE','#B9F6CA','#E1F5FE','#B9F6CA'],[0,'#B9F6CA','#B9F6CA','#B9F6CA',0]],
      maze:[[0,'#F44336','#FFF','#F44336',0],['#F44336',0,'#F44336','#FFF','#F44336'],['#FFF','#F44336','#FFF','#F44336','#FFF'],[0,'#F44336','#FFF','#F44336',0]],
      observatory:[[0,0,'#BDBDBD',0,0],[0,'#BDBDBD','#BDBDBD','#BDBDBD',0],['#BDBDBD','#BDBDBD','#BDBDBD','#BDBDBD','#BDBDBD'],[0,'#9E9E9E','#9E9E9E','#9E9E9E',0]],
      enchanted_clock:[[0,'#FFD700','#FFD700','#FFD700',0],['#FFD700','#212121','#F44336','#FFD700','#FFD700'],[0,'#FFD700','#FFD700','#FFD700',0],['#FFD700','#FFD700','#FFD700','#FFD700','#FFD700']],
      magic_carpet:[[0,'#9C27B0','#FFD700','#9C27B0',0],['#9C27B0','#FFD700','#9C27B0','#FFD700','#9C27B0'],['#9C27B0','#FFD700','#9C27B0','#FFD700','#9C27B0'],[0,'#9C27B0','#FFD700','#9C27B0',0]],
      celestial_globe:[[0,0,'#B3E5FC',0,0],[0,'#B3E5FC','#1565C0','#B3E5FC',0],['#B3E5FC','#1565C0','#B3E5FC','#1565C0','#B3E5FC'],[0,'#795548','#795548','#795548',0]],
      obsidian:[[0,0,'#424242',0,0],[0,'#424242','#616161','#424242',0],['#424242','#616161','#757575','#616161','#424242'],[0,'#424242','#424242','#424242',0]]
    };
    var defaultSprite=[[0,'#FF9800','#FF9800','#FF9800',0],[0,'#FF9800','#FFF','#FF9800',0],[0,'#FF9800','#FF9800','#FF9800',0]];
    function drawPixelSprite(spr,x,y,ps){
      for(var r=0;r<spr.length;r++){
        for(var c=0;c<spr[r].length;c++){
          if(spr[r][c]){ctx.fillStyle=spr[r][c];ctx.fillRect(x+c*ps,y+r*ps,ps,ps);}
        }
      }
    }
    // Draw placed decorations as pixel art on the grass
    var placedDecors=S.decorSlots.filter(function(d){return d!==null;});
    if(placedDecors.length>0){
      var grndY2=32+42+42+36+46+34;
      var grndH2=30;
      var pxSize=4;
      var maxShow=Math.min(placedDecors.length,5);
      var spriteW=5*pxSize;
      var spriteGap=Math.floor((totalW-maxShow*spriteW)/(maxShow+1));
      placedDecors.forEach(function(dId,idx){
        if(idx>=5)return;
        var spr=SPRITES[dId]||defaultSprite;
        var sprH=spr.length*pxSize;
        var sx=spriteGap+idx*(spriteW+spriteGap);
        var sy=grndY2+Math.floor((grndH2-sprH)/2);
        // tiny shadow under sprite
        ctx.fillStyle='rgba(0,0,0,0.18)';
        ctx.fillRect(sx+1,sy+sprH,spriteW-2,2);
        drawPixelSprite(spr,sx,sy,pxSize);
      });
    }
    // Shadow overlay at bottom
    var shGrad=ctx.createLinearGradient(0,totalH-20,0,totalH);
    shGrad.addColorStop(0,'rgba(0,0,0,0)');shGrad.addColorStop(1,'rgba(0,0,0,0.3)');
    ctx.fillStyle=shGrad;ctx.fillRect(0,totalH-20,totalW,20);
    _animFrame=requestAnimationFrame(draw);
  }
  draw(0);
  // Click handler
  canvas.onclick=function(ev){
    var rect=canvas.getBoundingClientRect();
    var scaleX=totalW/rect.width;
    var mx=(ev.clientX-rect.left)*scaleX;
    var my=(ev.clientY-rect.top)*(totalH/rect.height);
    if(my<skyH)return; // clicked sky
    var yO=skyH;
    for(var ri=0;ri<CASTLE_ROWS.length;ri++){
      var rh=rowHs[ri];
      if(my>=yO&&my<yO+rh){
        var xO=0;
        for(var ci=0;ci<CASTLE_ROWS[ri].length;ci++){
          var cell=CASTLE_ROWS[ri][ci];
          var cw2=cell.span*cw;
          if(mx>=xO&&mx<xO+cw2){
            var part=CASTLE_PARTS.filter(function(p){return p.id===cell.id;})[0];
            if(part)showPartDetail(part);
            return;
          }
          xO+=cw2;
        }
      }
      yO+=rh;
    }
  };
  // Cleanup: store anim frame ref for cancellation
  var origGoTo=goTo;
  wrap._cleanup=function(){if(_animFrame)cancelAnimationFrame(_animFrame);};
  container.appendChild(wrap);
}
function blendHex(colorA,colorB,t){
  // simple 6-char hex blend
  function parse(c){c=c.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];return[parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];}
  function toHex(v){v=Math.round(clamp(v,0,255));return(v<16?'0':'')+v.toString(16);}
  var a=parse(colorA),b=parse(colorB);
  return'#'+toHex(a[0]*(t)+b[0]*(1-t))+toHex(a[1]*(t)+b[1]*(1-t))+toHex(a[2]*(t)+b[2]*(1-t));
}

function renderCastle(container){
  // Stats bar
  var fp=buildCount(),tot=CASTLE_PARTS.filter(function(p){return!p.free;}).length;
  var pctStr=tot>0?Math.round(fp/tot*100):0;
  container.appendChild(el('div','padding:12px 14px 8px;','<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px"><div style="font-size:9px;color:var(--gold)">CASTLE PROGRESS</div><div style="font-size:11px;color:#fff">'+fp+'/'+tot+' parts</div></div><div class="prog-track" style="height:14px"><div class="prog-fill" style="width:'+pctStr+'%"></div></div>'));
  // Visual castle grid
  var gridWrap=el('div','padding:0 14px 12px;');
  renderCastleVisualGrid(gridWrap);
  container.appendChild(gridWrap);
  // Ordered build sections
  var avail=CASTLE_PARTS.filter(function(p){return!p.free&&(S.partLevels[p.id]||0)<MAX_PART_LEVEL&&partState(p)==='avail';}).sort(function(a,b){return a.ord-b.ord;});
  var inProg=CASTLE_PARTS.filter(function(p){return!p.free&&(S.partLevels[p.id]||0)>0&&(S.partLevels[p.id]||0)<MAX_PART_LEVEL;}).sort(function(a,b){return a.ord-b.ord;});
  var needCoins=CASTLE_PARTS.filter(function(p){return!p.free&&(S.partLevels[p.id]||0)<MAX_PART_LEVEL&&partState(p)==='need-coins';}).sort(function(a,b){return a.ord-b.ord;});
  var locked=CASTLE_PARTS.filter(function(p){return!p.free&&(S.partLevels[p.id]||0)<MAX_PART_LEVEL&&partState(p)==='locked';}).sort(function(a,b){return a.ord-b.ord;});
  if(inProg.length){container.appendChild(el('div','padding:8px 14px 5px;','<div style="font-size:9px;color:var(--gold)">IN PROGRESS ('+inProg.length+')</div>'));var g1=el('div','display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 14px 6px;');inProg.forEach(function(p){g1.appendChild(mkPartCard(p));});container.appendChild(g1);}
  if(avail.length){container.appendChild(el('div','padding:8px 14px 5px;','<div style="font-size:9px;color:#00ff88;display:flex;align-items:center;gap:7px"><div style="width:8px;height:8px;background:#00ff88;border-radius:50%;box-shadow:0 0 6px #00ff88;"></div>READY TO BUILD ('+avail.length+')</div>'));var g2=el('div','display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 14px 6px;');avail.forEach(function(p){g2.appendChild(mkPartCard(p));});container.appendChild(g2);}
  if(needCoins.length){container.appendChild(el('div','padding:6px 14px 4px;','<div style="font-size:9px;color:var(--gold)">NEED COINS ('+needCoins.length+')</div>'));var g3=el('div','display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:0 14px 6px;');needCoins.slice(0,6).forEach(function(p){g3.appendChild(mkPartCard(p));});container.appendChild(g3);}
  if(locked.length){container.appendChild(el('div','padding:6px 14px 4px;','<div style="font-size:9px;color:#555">LOCKED ('+locked.length+')</div>'));var g4=el('div','display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 14px 8px;');locked.slice(0,8).forEach(function(p){g4.appendChild(mkPartCard(p));});container.appendChild(g4);}
  // Construction guide
  var nextToBuild=CASTLE_PARTS.filter(function(p){return!p.free&&(S.partLevels[p.id]||0)===0&&partState(p)!=='locked';}).sort(function(a,b){return a.ord-b.ord;}).slice(0,4);
  if(nextToBuild.length){
    var guide=el('div','padding:0 14px 16px;');
    guide.innerHTML='<div style="font-size:9px;color:#818cf8;margin-bottom:8px">🏗️ CONSTRUCTION ORDER (next up)</div>';
    nextToBuild.forEach(function(p,idx){
      guide.innerHTML+='<div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border-radius:10px;padding:10px;margin-bottom:6px;border:2px solid rgba(99,102,241,.3);"><span style="background:#4f46e5;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-family:var(--px);font-size:10px;flex-shrink:0">'+(idx+1)+'</span><span style="font-size:1.3rem;">'+p.e.split('')[0]+'</span><div style="flex:1"><div style="font-size:10px;color:#fff">'+p.label+'</div><div style="font-size:9px;color:#555;margin-top:2px">'+((p.cost||0)>0?(p.cost||0)+' coins':'Free')+'</div></div></div>';
    });
    container.appendChild(guide);
  }
}
function mkPartCard(p){
  var lv=S.partLevels[p.id]||0,st=partState(p);
  var isAvail=st==='avail'||st==='auto',isNeed=st==='need-coins',isLocked=st==='locked';
  var card=document.createElement('div');
  card.style.cssText='background:'+(isAvail?'rgba(0,255,100,.08)':isNeed?'rgba(251,208,0,.06)':isLocked?'rgba(0,0,0,.3)':'rgba(255,255,255,.05)')+';border:2px solid '+(isAvail?'rgba(0,255,100,.4)':isNeed?'rgba(251,208,0,.3)':isLocked?'#222':'rgba(255,255,255,.15)')+';border-radius:12px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;text-align:center;cursor:'+(isAvail||lv>0?'pointer':'default')+';'+(lv>0&&lv<MAX_PART_LEVEL?'animation:buildPulse 1.5s ease-in-out infinite;':'');
  var hammers='';for(var hi=0;hi<MAX_PART_LEVEL;hi++){hammers+='<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:3px;font-size:10px;background:'+(hi<lv?'rgba(251,208,0,.2)':'rgba(255,255,255,.05)')+';border:1px solid '+(hi<lv?'#FBD000':'#333')+';">'+(hi<lv?'■':'□')+'</span>';}
  var _cost=p.cost!=null?p.cost:0;
  var statusText=lv+'/'+MAX_PART_LEVEL+(isAvail&&_cost>0?' — '+_cost+' coins':isNeed?' — Need '+_cost:isLocked?' locked':lv>=MAX_PART_LEVEL?' done':'');
  card.innerHTML='<div style="font-size:1.8rem;margin-bottom:5px;opacity:'+(isLocked?.3:1)+';'+(lv>0&&lv<MAX_PART_LEVEL?'animation:buildHammer 0.8s ease-in-out infinite;display:inline-block;':'')+'">'+(lv>0&&lv<MAX_PART_LEVEL?'🔨':p.e.split('')[0])+'</div><div style="font-size:9px;color:'+(isLocked?'#555':'#fff')+';margin-bottom:6px">'+p.label+'</div><div style="display:flex;gap:2px;margin-bottom:7px">'+hammers+'</div><div style="font-size:9px;color:'+(isAvail?'#00ff88':isNeed?'var(--gold)':isLocked?'#333':'#888')+'">'+statusText+'</div>';
  if(isAvail||lv>0){card.onclick=function(){showPartDetail(p);};}
  return card;
}
function showPartDetail(p){
  var lv=S.partLevels[p.id]||0,st=partState(p),_cost=p.cost!=null?p.cost:0;
  var canBuild=lv<MAX_PART_LEVEL&&st!=='locked',canAfford=S.coins>=_cost;
  $('sheet-title').textContent=p.label;
  var hammers='';for(var hi=0;hi<MAX_PART_LEVEL;hi++){hammers+='<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:4px;font-size:14px;background:'+(hi<lv?'rgba(251,208,0,.2)':'rgba(255,255,255,.05)')+';border:1px solid '+(hi<lv?'#FBD000':'#333')+';">'+(hi<lv?'■':'□')+'</span>';}
  var reqText='';if(p.req){if(p.req.levels)reqText+='Requires: '+p.req.levels+' levels cleared. ';if(p.req.boss!==undefined)reqText+='Requires: '+p.req.boss+' boss'+(p.req.boss!==1?'es':'')+' defeated.';}
  var actionHtml='';
  if(canBuild&&canAfford)actionHtml='<button onclick="executeBuild(\''+p.id+'\')" style="width:100%;padding:16px;background:linear-gradient(135deg,#22c55e,#15803d);border:3px solid #15803d;border-radius:10px;box-shadow:4px 4px 0 #000;font-family:var(--px);font-size:11px;color:#fff;cursor:pointer;">'+(_cost===0?'BUILD FREE!':'BUILD — '+_cost+' coins')+'</button>';
  else if(canBuild&&!canAfford)actionHtml='<div style="background:rgba(251,208,0,.1);border:2px solid #444;border-radius:10px;padding:12px;font-size:11px;color:#888">Need '+_cost+' coins (you have '+S.coins+')</div>';
  else if(lv>=MAX_PART_LEVEL)actionHtml='<div style="color:#22c55e;font-size:12px;padding:12px">✅ FULLY BUILT!</div>';
  else actionHtml='<div style="color:#555;font-size:10px;padding:10px;line-height:1.8">'+reqText+'</div>';
  $('sheet-body').innerHTML='<div style="text-align:center;padding:14px 0 10px"><div style="font-size:4rem;margin-bottom:8px">'+p.e.split('')[0]+'</div><div style="font-size:12px;color:#fff;margin-bottom:5px">'+p.label+'</div><div style="font-family:system-ui;font-size:13px;color:#888;margin-bottom:10px;line-height:1.5">'+p.desc+'</div><div style="background:rgba(255,215,0,.1);border:2px solid rgba(255,215,0,.3);border-radius:10px;padding:10px;margin-bottom:12px;font-family:system-ui;font-size:13px;color:#ffd700;line-height:1.6;">'+p.fun+'</div><div style="display:flex;gap:5px;justify-content:center;margin-bottom:10px">'+hammers+'</div><div style="font-size:11px;color:#aaa;margin-bottom:14px">Level '+lv+' / '+MAX_PART_LEVEL+'</div>'+actionHtml+'</div>';
  $('bld-ov').classList.add('on');$('bld-sheet').classList.remove('off');
  $('btn-sheet-x').onclick=closeSheet;$('bld-ov').onclick=closeSheet;
}
function closeSheet(){$('bld-ov').classList.remove('on');$('bld-sheet').classList.add('off');}
window.executeBuild=function(id){
  var p=CASTLE_PARTS.filter(function(pp){return pp.id===id;})[0];if(!p)return;
  var lv=S.partLevels[p.id]||0;if(lv>=MAX_PART_LEVEL)return;
  if(p.cost>0&&S.coins<p.cost){closeSheet();return;}
  if(p.cost>0){S.coins-=p.cost;$('bld-coins').textContent=S.coins;}
  closeSheet();
  // Animated step-by-step build like Mario Maker 2
  animateCastleBuild(p,lv+1);
};

function animateCastleBuild(part,targetLv){
  var currentLv=S.partLevels[part.id]||0;
  if(currentLv>=targetLv){renderBuilderContent();return;}

  // Show construction overlay on castle grid
  var container=$('bld-content');
  // Render the castle first so we can animate on top
  renderBuilderContent();

  // Find the cell in the visual grid for this part
  var cells=container.querySelectorAll('.castle-cell, [data-part-id="'+part.id+'"]');

  // Step-by-step build with animation
  function buildStep(lv){
    if(lv>targetLv){
      // Build complete!
      if(targetLv>=MAX_PART_LEVEL){confetti();sfx('power');speak(part.label+' complete!',1.3,1.0);}
      else{sfx('build');speak(part.label+' level '+targetLv+'!',1.2,1.0);}
      checkAchievements();return;
    }
    // Play hammer sound
    sfx('tick');
    // Spawn build particles on the castle area
    spawnBuildParticles(part);
    // Increment level
    S.partLevels[part.id]=lv;save();
    // Re-render to show the change
    renderBuilderContent();
    // Flash the built cell
    setTimeout(function(){
      var grid=container.querySelector('[data-part-id="'+part.id+'"]');
      if(grid){grid.classList.add('just-built');setTimeout(function(){grid.classList.remove('just-built');},500);}
      // Next step after delay
      setTimeout(function(){buildStep(lv+1);},400);
    },100);
  }

  // Start animation with a brief pause
  setTimeout(function(){
    // Show hammer animation on screen
    showBuildOverlay(part,function(){
      buildStep(currentLv+1);
    });
  },300);
}

function showBuildOverlay(part,callback){
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:500;display:flex;align-items:center;justify-content:center;';
  var card=document.createElement('div');
  card.style.cssText='background:linear-gradient(145deg,#1a1a2e,#16213e);border:2px solid rgba(251,208,0,.5);border-radius:20px;padding:28px 36px;text-align:center;min-width:280px;box-shadow:0 0 40px rgba(251,208,0,.15),inset 0 0 30px rgba(0,0,0,.3);';
  card.innerHTML='<div style="font-size:3.5rem;animation:bounce .5s ease infinite alternate;" id="build-icon">'+(part.e||'🏗️').split('')[0]+'</div>'+
    '<div style="font-size:13px;color:var(--gold);font-family:var(--px);margin:10px 0 16px;text-shadow:2px 2px 0 #000;">Building '+part.label+'</div>'+
    '<div style="width:100%;height:14px;background:#111;border-radius:7px;overflow:hidden;border:1px solid #333;margin-bottom:12px;">'+
      '<div id="build-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#F59E0B,#FBD000,#F59E0B);border-radius:7px;transition:width .3s;"></div>'+
    '</div>'+
    '<div style="display:flex;gap:6px;justify-content:center;margin-bottom:12px;" id="build-stars"></div>'+
    '<div style="font-size:11px;color:#aaa;font-family:var(--px);" id="build-status">Preparing...</div>';
  ov.appendChild(card);
  document.body.appendChild(ov);

  var currentLv=S.partLevels[part.id]||0;
  var starsDiv=ov.querySelector('#build-stars');
  var bar=ov.querySelector('#build-bar');
  var status=ov.querySelector('#build-status');
  var iconEl=ov.querySelector('#build-icon');
  for(var i=0;i<MAX_PART_LEVEL;i++){
    var s=document.createElement('span');
    s.id='bstar-'+i;
    s.style.cssText='font-size:18px;opacity:.2;transition:opacity .3s,transform .3s;';
    s.textContent='⭐';
    starsDiv.appendChild(s);
  }

  var msgs=['Hammering...','Placing bricks...','Adding mortar...','Reinforcing...','Final touches!'];
  var step=0,total=MAX_PART_LEVEL;
  var fillSt=currentLv;
  function shake(){
    card.style.transform='translateX(-3px)';
    setTimeout(function(){card.style.transform='translateX(3px)';},50);
    setTimeout(function(){card.style.transform='';},100);
  }
  function advanceStep(){
    if(fillSt>=total){
      bar.style.width='100%';
      status.textContent='Complete!';
      status.style.color='#FBD000';
      iconEl.textContent='🎉';
      sfx('power');
      coinShower(ov);
      sparkleRing(ov);
      setTimeout(function(){
        ov.style.transition='opacity .4s';ov.style.opacity='0';
        setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},500);
      },900);
      callback();
      return;
    }
    var pct=Math.round(((fillSt+1)/total)*100);
    bar.style.width=pct+'%';
    var st=$('bstar-'+fillSt);
    if(st){st.style.opacity='1';st.style.transform='scale(1.3)';setTimeout(function(){if(st)st.style.transform='scale(1)';},200);}
    status.textContent=msgs[fillSt%msgs.length];
    shake();
    fillSt++;
    setTimeout(advanceStep,420);
  }
  setTimeout(advanceStep,400);
}

function coinShower(parent){
  for(var i=0;i<12;i++){
    (function(idx){
      var c=document.createElement('div');
      c.textContent='🪙';
      c.style.cssText='position:absolute;font-size:16px;left:'+(40+Math.random()*20)+'%;bottom:50%;z-index:501;transition:all .7s cubic-bezier(.2,.8,.3,1);opacity:1;';
      parent.appendChild(c);
      setTimeout(function(){
        c.style.transform='translate('+(Math.random()-.5)*120+'px,'+(-80-Math.random()*100)+'px) scale(.5)';
        c.style.opacity='0';
      },idx*60+50);
      setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c);},idx*60+800);
    })(i);
  }
}

function sparkleRing(parent){
  for(var i=0;i<8;i++){
    (function(idx){
      var sp=document.createElement('div');
      sp.textContent='✨';
      var ang=(idx/8)*Math.PI*2;
      sp.style.cssText='position:absolute;font-size:14px;left:50%;top:50%;z-index:501;transition:all .6s ease-out;opacity:1;';
      parent.appendChild(sp);
      setTimeout(function(){
        sp.style.transform='translate('+Math.cos(ang)*80+'px,'+Math.sin(ang)*80+'px) scale(1.5)';
        sp.style.opacity='0';
      },100);
      setTimeout(function(){if(sp.parentNode)sp.parentNode.removeChild(sp);},800);
    })(i);
  }
}

function spawnBuildParticles(part){
  var grid=$('bld-content');if(!grid)return;
  var emojis=['🧱','🔨','✨','💪','⚡','🏗️','🌟','💎'];
  for(var i=0;i<10;i++){
    var p=document.createElement('div');p.className='build-particle';
    p.textContent=emojis[i%emojis.length];
    p.style.left=(20+Math.random()*60)+'%';
    p.style.top=(20+Math.random()*40)+'%';
    p.style.setProperty('--sx',(Math.random()-.5)*140+'px');
    p.style.setProperty('--sy',(-40-Math.random()*80)+'px');
    p.style.animationDelay=(i*0.06)+'s';
    grid.appendChild(p);
    setTimeout(function(){if(p.parentNode)p.parentNode.removeChild(p);},900);
  }
}

// DECORATION COURT
function renderDecorCourt(container){
  var decorItems=SHOP_ITEMS.filter(function(it){return it.cat==='decor';});
  var ownedDecor=decorItems.filter(function(it){return(S.shopOwned[it.id]||0)>0;});
  container.appendChild(el('div','padding:16px 14px 10px;','<div style="font-size:12px;color:var(--gold);margin-bottom:5px">DECORATION COURT</div><div style="font-family:system-ui;font-size:13px;color:#888;margin-bottom:12px;">Tap a slot to place decorations you own!</div>'));
  var grid=el('div','display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 14px 16px;');
  for(var si=0;si<8;si++){
    (function(i){
      var slotId=S.decorSlots[i],item=slotId?SHOP_ITEMS.filter(function(it){return it.id===slotId;})[0]:null;
      var slot=document.createElement('div');
      slot.style.cssText='background:'+(item?'rgba(255,255,255,.12)':'rgba(255,255,255,.04)')+';border:2px '+(item?'solid rgba(251,208,0,.5)':'dashed #333')+';border-radius:14px;padding:14px 6px;text-align:center;cursor:pointer;min-height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;';
      if(item){
        slot.innerHTML='<div style="font-size:2.4rem">'+item.icon+'</div><div style="font-size:9px;color:#ccc">'+item.name+'</div><div style="font-size:8px;color:#fbd000">Placed</div>';
        slot.onclick=function(){showDecorSlotDetail(i,item);};
      }else{
        slot.innerHTML='<div style="font-size:1.6rem;opacity:.25">+</div><div style="font-size:9px;color:#444">Empty</div>';
        slot.onclick=function(){showDecorPicker(i,ownedDecor);};
      }
      grid.appendChild(slot);
    })(si);
  }
  container.appendChild(grid);
  if(ownedDecor.length===0){
    container.appendChild(el('div','padding:0 14px 16px;','<div style="background:rgba(0,0,0,.4);border:2px dashed #333;border-radius:12px;padding:20px;text-align:center;"><div style="font-size:2.5rem;margin-bottom:8px">🛒</div><div style="font-family:system-ui;font-size:14px;color:#555;line-height:1.6">Buy decorations from the Shop to place them here!</div></div>'));
  }else{
    container.appendChild(el('div','padding:0 14px 8px;','<div style="font-size:10px;color:var(--gold)">YOUR DECORATIONS</div>'));
    var owned=el('div','display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 14px 16px;');
    ownedDecor.forEach(function(it){
      var inCourt=S.decorSlots.indexOf(it.id)!==-1;
      var c=document.createElement('div');
      c.style.cssText='background:'+(inCourt?'rgba(34,197,94,.12)':'rgba(255,255,255,.06)')+';border:2px solid '+(inCourt?'#22c55e':'#333')+';border-radius:12px;padding:10px 6px;text-align:center;cursor:pointer;';
      c.innerHTML='<div style="font-size:2rem">'+it.icon+'</div><div style="font-size:9px;color:#aaa;margin-top:4px">'+it.name.split(' ').slice(0,2).join(' ')+'</div><div style="font-size:8px;margin-top:3px;color:'+(inCourt?'#22c55e':'#555')+'">'+(inCourt?'In court':'Available')+'</div>';
      c.onclick=function(){
        if(!inCourt){var emptySlot=S.decorSlots.indexOf(null);if(emptySlot!==-1){S.decorSlots[emptySlot]=it.id;save();sfx('build');checkAchievements();renderBuilderContent();}else{toast('g-toast','No empty slots! Remove one first.',1800);}}
      };
      owned.appendChild(c);
    });
    container.appendChild(owned);
  }
}
function showDecorSlotDetail(slotIdx,item){
  $('sheet-title').textContent=item.name;
  $('sheet-body').innerHTML='<div style="text-align:center;padding:14px 0 10px"><div style="font-size:4.5rem;margin-bottom:10px">'+item.icon+'</div><div style="font-size:12px;color:#fff;margin-bottom:6px">'+item.name+'</div><div style="font-family:system-ui;font-size:13px;color:#888;margin-bottom:10px;line-height:1.5">'+item.desc+'</div><div style="background:rgba(255,215,0,.1);border:2px solid rgba(255,215,0,.3);border-radius:10px;padding:10px;margin-bottom:14px;font-family:system-ui;font-size:13px;color:#ffd700;">'+item.fun+'</div><button onclick="removeDecor('+slotIdx+')" style="width:100%;padding:14px;background:#7f1d1d;border:3px solid #991b1b;border-radius:10px;box-shadow:4px 4px 0 #000;font-family:var(--px);font-size:11px;color:#f87171;cursor:pointer;">REMOVE FROM COURT</button></div>';
  $('bld-ov').classList.add('on');$('bld-sheet').classList.remove('off');
  $('btn-sheet-x').onclick=closeSheet;$('bld-ov').onclick=closeSheet;
}
function showDecorPicker(slotIdx,ownedDecor){
  $('sheet-title').textContent='Place Decoration';
  var avail=ownedDecor.filter(function(it){return S.decorSlots.indexOf(it.id)===-1;});
  var html='<div style="padding-bottom:8px;"><div style="font-family:system-ui;font-size:13px;color:#888;margin-bottom:14px">Choose a decoration for slot '+(slotIdx+1)+':</div>';
  if(!avail.length){html+='<div style="text-align:center;padding:20px;font-family:system-ui;font-size:13px;color:#555">All your decorations are already placed!<br><br>Buy more in the Shop tab.</div></div>';}
  else{html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';avail.forEach(function(it){html+='<div onclick="placeDecor('+slotIdx+',\''+it.id+'\')" style="background:rgba(255,255,255,.07);border:2px solid #333;border-radius:12px;padding:14px 8px;text-align:center;cursor:pointer;"><div style="font-size:2.4rem;margin-bottom:6px">'+it.icon+'</div><div style="font-size:10px;color:#fff">'+it.name+'</div></div>';});html+='</div></div>';}
  $('sheet-body').innerHTML=html;
  $('bld-ov').classList.add('on');$('bld-sheet').classList.remove('off');
  $('btn-sheet-x').onclick=closeSheet;$('bld-ov').onclick=closeSheet;
}
window.placeDecor=function(slotIdx,itemId){S.decorSlots[slotIdx]=itemId;save();sfx('build');speak('Decoration placed!',1.2,1.0);checkAchievements();closeSheet();renderBuilderContent();};
window.removeDecor=function(slotIdx){S.decorSlots[slotIdx]=null;save();sfx('tick');closeSheet();renderBuilderContent();};

// SHOP
function renderShop(container){
  container.appendChild(el('div','padding:14px 14px 10px;','<div style="font-size:12px;color:var(--gold);margin-bottom:6px">ROYAL SHOP</div><div style="display:flex;align-items:center;gap:10px;background:rgba(251,208,0,.1);border:2px solid rgba(251,208,0,.3);border-radius:10px;padding:10px 14px;"><div class="coin-orb bounce"></div><div style="font-size:13px;color:var(--gold);font-family:var(--px)">'+S.coins+' coins</div><div style="margin-left:auto;font-size:11px;color:#f87171">❤️ '+S.potionStock+' | 💡 '+S.hintStock+' | 🔮 '+S.crystalStock+'</div></div>'));
  var cats=[['ALL','all'],['⚔️ CHARS','character'],['🧪 ITEMS','potion,boost'],['🏰 DECOR','decor'],['💎 COLLECT','coll']];
  var tabRow=el('div','display:flex;gap:6px;padding:8px 14px 4px;flex-wrap:wrap;');
  var activeCat='all';
  function renderCat(){
    tabRow.innerHTML='';
    cats.forEach(function(c){
      var btn=el('div','display:inline-block;padding:6px 14px;border-radius:20px;font-size:11px;cursor:pointer;font-family:var(--px);text-shadow:1px 1px 0 #000;transition:all .15s;');
      if(c[1]===activeCat){btn.style.cssText+='background:linear-gradient(135deg,#fbbf24,#d97706);color:#fff;border:2px solid #d97706;';}
      else{btn.style.cssText+='background:rgba(255,255,255,.08);color:#aaa;border:2px solid #333;';}
      btn.textContent=c[0];
      btn.onclick=function(){sfx('tick');activeCat=c[1];renderCat();};
      tabRow.appendChild(btn);
    });
    var gridWrap=$('shop-grid-wrap');
    if(!gridWrap){gridWrap=el('div','','');gridWrap.id='shop-grid-wrap';container.appendChild(gridWrap);}
    gridWrap.innerHTML='';
    var catArr=activeCat==='all'?null:activeCat.split(',');
    var items=catArr?SHOP_ITEMS.filter(function(it){return catArr.indexOf(it.cat)!==-1;}):SHOP_ITEMS;
    if(activeCat==='all'){
      var secCats=[['⚔️ CHARACTERS','character'],['🧪 POTIONS & BOOSTS','potion,boost'],['🏰 DECORATIONS','decor'],['💎 COLLECTIBLES','coll']];
      secCats.forEach(function(sc){
        var scArr=sc[1].split(',');
        var scItems=items.filter(function(it){return scArr.indexOf(it.cat)!==-1;});
        if(!scItems.length)return;
        gridWrap.appendChild(el('div','padding:10px 0 5px;','<div style="font-size:11px;color:var(--gold)">'+sc[0]+'</div>'));
        var grid=el('div','display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 0 10px;');
        scItems.forEach(function(it){grid.appendChild(mkShopCard(it));});
        gridWrap.appendChild(grid);
      });
    }else{
      var grid=el('div','display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 0;');
      items.forEach(function(it){grid.appendChild(mkShopCard(it));});
      gridWrap.appendChild(grid);
    }
  }
  container.appendChild(tabRow);
  renderCat();
}
function mkShopCard(it){
  var owned=S.shopOwned[it.id]||0;
  var isMaxed=it.maxOwned&&owned>=it.maxOwned;
  var isOwned=!it.repeatable&&!it.maxOwned&&owned>0;
  var isEquipped=it.cat==='character'&&S.character===it.icon;
  var canBuy=!isOwned&&!isMaxed&&S.coins>=it.cost;
  var card=document.createElement('div');
  card.className='shop-item'+(isOwned||isMaxed?' owned':'')+(it.cost>=150?' shop-legendary':it.cost>=100?' shop-epic':'');
  var badge;
  if(isEquipped)badge='<div style="font-size:9px;color:#fbbf24;border:2px solid #fbbf24;border-radius:20px;padding:4px 10px">EQUIPPED</div>';
  else if(isOwned||isMaxed)badge='<div style="font-size:9px;color:#22c55e;border:2px solid #22c55e;border-radius:20px;padding:4px 10px">'+(isMaxed?'MAX':'OWNED')+'</div>';
  else if(it.repeatable&&owned>0)badge='<div style="font-size:9px;color:#60a5fa;margin-bottom:3px">In bag: '+owned+'</div><div style="font-size:9px;color:'+(canBuy?'var(--gold)':'#555')+';border:2px solid '+(canBuy?'#22c55e':'#333')+';border-radius:20px;padding:4px 10px">'+it.cost+' coins</div>';
  else badge='<div style="font-size:9px;color:'+(canBuy?'var(--gold)':'#555')+';border:2px solid '+(canBuy?'#22c55e':'#333')+';border-radius:20px;padding:4px 10px">'+it.cost+' coins</div>';
  card.innerHTML='<div style="font-size:2.6rem;margin-bottom:5px">'+it.icon+'</div><div style="font-size:11px;color:#fff;margin-bottom:4px">'+it.name+'</div><div style="font-family:system-ui;font-size:12px;color:#888;margin-bottom:8px;line-height:1.4">'+it.desc+'</div>'+badge;
  card.onclick=function(){showShopDetail(it);};
  return card;
}
function showShopDetail(it){
  var owned=S.shopOwned[it.id]||0;
  var isMaxed=it.maxOwned&&owned>=it.maxOwned;
  var isOwned=!it.repeatable&&!it.maxOwned&&owned>0;
  var isEquipped=it.cat==='character'&&S.character===it.icon;
  var canBuy=!isOwned&&!isMaxed&&S.coins>=it.cost;
  $('sheet-title').textContent=it.name;
  var actionHtml;
  if(isEquipped)actionHtml='<div style="color:#fbbf24;font-size:12px">Currently equipped!</div>';
  else if(it.cat==='character'&&isOwned)actionHtml='<button onclick="equipCharacter(\''+it.id+'\')" style="width:100%;padding:16px;background:linear-gradient(135deg,#fbbf24,#d97706);border:3px solid #d97706;border-radius:10px;box-shadow:4px 4px 0 #000;font-family:var(--px);font-size:11px;color:#fff;cursor:pointer;">EQUIP</button>';
  else if(isOwned||isMaxed)actionHtml='<div style="color:#22c55e;font-size:12px">'+(isMaxed?'Maximum owned!':'Already in collection!')+'</div>';
  else if(canBuy)actionHtml='<button onclick="buyShopItem(\''+it.id+'\')" style="width:100%;padding:16px;background:linear-gradient(135deg,#22c55e,#15803d);border:3px solid #15803d;border-radius:10px;box-shadow:4px 4px 0 #000;font-family:var(--px);font-size:11px;color:#fff;cursor:pointer;">BUY — '+it.cost+' coins</button>';
  else actionHtml='<div style="background:rgba(255,0,0,.1);border:2px solid #444;border-radius:10px;padding:12px;font-size:11px;color:#888">Need '+it.cost+' coins (you have '+S.coins+')</div>';
  var bagNote=(it.repeatable&&owned>0)?'<div style="font-size:12px;color:#60a5fa;margin-bottom:10px">In bag: '+owned+'</div>':'';
  $('sheet-body').innerHTML='<div style="text-align:center;padding:14px 0 10px"><div style="font-size:4rem;margin-bottom:8px">'+it.icon+'</div><div style="font-size:12px;color:#fff;margin-bottom:6px">'+it.name+'</div><div style="font-family:system-ui;font-size:13px;color:#888;margin-bottom:10px;line-height:1.6">'+it.desc+'</div><div style="background:rgba(255,215,0,.1);border:2px solid rgba(255,215,0,.3);border-radius:10px;padding:10px;margin-bottom:12px;font-family:system-ui;font-size:13px;color:#ffd700;line-height:1.6;">'+it.fun+'</div><div style="font-size:13px;color:var(--gold);font-weight:bold;margin-bottom:14px">'+it.cost+' coins</div>'+bagNote+'<div>'+actionHtml+'</div></div>';
  $('bld-ov').classList.add('on');$('bld-sheet').classList.remove('off');
  $('btn-sheet-x').onclick=closeSheet;$('bld-ov').onclick=closeSheet;
}
window.buyShopItem=function(id){
  var it=SHOP_ITEMS.filter(function(i){return i.id===id;})[0];
  if(!it||S.coins<it.cost)return;
  var owned=S.shopOwned[it.id]||0;
  if(!it.repeatable&&!it.maxOwned&&owned>0)return;
  if(it.maxOwned&&owned>=it.maxOwned)return;
  S.coins-=it.cost;S.totalSpent=(S.totalSpent||0)+it.cost;S.shopOwned[it.id]=(owned+1);
  if(it.effect==='potion1'){S.potionStock+=1;speak('One potion added!',1.2,1.0);}
  else if(it.effect==='potion3'){S.potionStock+=3;speak('Three potions added!',1.3,1.0);}
  else if(it.effect==='potion5'){S.potionStock+=5;speak('Five potions! Amazing!',1.3,1.0);}
  else if(it.effect==='doubleCoin'){speak('Star Boost! Double coins next level!',1.2,1.0);}
  else if(it.effect==='bossCrystal'){S.crystalStock+=1;speak('Time Crystal added! Use it in a boss battle!',1.2,1.0);}
  else if(it.effect==='hint'){S.hintStock+=1;speak('Hint Scroll added! Use it to remove two wrong answers!',1.2,1.0);}
  else if(it.effect==='addMaxHp2'){S.maxHp=Math.min(S.maxHp+2,8);S.hp=Math.min(S.hp+2,S.maxHp);speak('Golden Shield! Two extra max hearts!',1.3,1.0);}
  else if(it.effect==='addMaxHp3'){S.maxHp=Math.min(S.maxHp+3,10);S.hp=Math.min(S.hp+3,S.maxHp);speak('Titan Shield! Three extra max hearts!',1.3,1.0);}
  else if(it.effect==='treasureMap'){S.treasureMapActive=true;speak('Treasure Map! Bonus coins hidden in your next level!',1.2,1.0);}
  else if(it.cat==='character'){S.character=it.icon;speak('Character unlocked! You are now '+it.name+'!',1.3,1.0);}
  else speak(it.name+' added!',1.2,1.0);
  save();sfx('build');confetti();$('bld-coins').textContent=S.coins;
  checkAchievements();closeSheet();renderBuilderContent();
};

window.equipCharacter=function(id){
  var it=SHOP_ITEMS.filter(function(i){return i.id===id;})[0];
  if(!it)return;
  S.character=it.icon;save();sfx('done');
  speak(it.name+' equipped!',1.2,1.0);
  closeSheet();renderBuilderContent();
};

// COLLECTION
function renderCollection(container){
  var shopOwned=SHOP_ITEMS.filter(function(it){return(S.shopOwned[it.id]||0)>0;});
  var numBadges=Math.min(maxWorldIndex()+2,14);
  var bossBadges=[];
  for(var bi=0;bi<numBadges;bi++){var wd=getWorldData(bi);bossBadges.push(Object.assign({},wd.badge,{world:wd.name,unlocked:S.bossDefeated.has(bi)}));}
  var uc=achCount(),at=achTotal();
  var statCards=[{i:'Badges',v:bossBadges.filter(function(b){return b.unlocked;}).length},{i:'Achievements',v:uc+'/'+at},{i:'Shop Items',v:shopOwned.length}];
  var statHtml=statCards.map(function(p){return '<div style="background:rgba(0,0,0,.4);border-radius:10px;padding:10px 4px;text-align:center;border:2px solid #333;"><div style="font-size:11px;color:var(--gold);margin-top:3px">'+p.v+'</div><div style="font-size:9px;color:#555;margin-top:2px">'+p.i+'</div></div>';}).join('');
  container.appendChild(el('div','padding:14px 14px 10px;','<div style="font-size:12px;color:var(--gold);margin-bottom:12px">MY COLLECTION</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+statHtml+'</div>'));
  container.appendChild(el('div','padding:10px 14px 5px;','<div style="font-size:11px;color:var(--gold)">WORLD BADGES</div>'));
  var bg=el('div','display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 14px 10px;');
  bossBadges.forEach(function(b){
    var card=document.createElement('div');
    card.style.cssText='background:rgba(255,255,255,.04);border:2px solid '+(b.unlocked?'rgba(251,208,0,.4)':'#333')+';border-radius:12px;padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer;';
    card.innerHTML='<div style="font-size:2.4rem;filter:'+(b.unlocked?'none':'grayscale(1)')+'">'+( b.unlocked?b.e:'🔒')+'</div><div style="flex:1;min-width:0"><div style="font-size:9px;color:'+(b.unlocked?'#fff':'#555')+';font-family:var(--px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+b.name+'</div><div style="font-family:system-ui;font-size:11px;color:#666;margin-top:2px">'+b.world+'</div><div style="font-size:10px;color:'+(b.unlocked?'#22c55e':'#444')+';margin-top:2px">'+(b.unlocked?'Earned':'Beat boss')+'</div></div>';
    card.onclick=function(){$('sheet-title').textContent='Badge';$('sheet-body').innerHTML='<div style="text-align:center;padding:14px 0"><div style="font-size:5rem;margin-bottom:10px;filter:'+(b.unlocked?'none':'grayscale(1)')+'">'+( b.unlocked?b.e:'🔒')+'</div><div style="font-size:12px;color:#fff;margin-bottom:6px">'+b.name+'</div><div style="font-family:system-ui;font-size:13px;color:#888;margin-bottom:8px">'+b.world+'</div><div style="font-size:11px;color:'+(b.unlocked?'#22c55e':'#555')+'">'+(b.unlocked?'Badge Earned!':'Defeat this world boss to earn!')+'</div></div>';$('bld-ov').classList.add('on');$('bld-sheet').classList.remove('off');$('btn-sheet-x').onclick=closeSheet;$('bld-ov').onclick=closeSheet;};
    bg.appendChild(card);
  });
  container.appendChild(bg);
  // Achievements — show all with tier progress
  container.appendChild(el('div','padding:8px 14px 5px;','<div style="font-size:11px;color:var(--gold)">ACHIEVEMENTS ('+uc+'/'+at+')</div>'));
  var ag=el('div','display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 14px 8px;');
  ACHIEVEMENTS.forEach(function(a){
    var card=document.createElement('div');
    var done=!!S.achievements[a.id];
    if(a.tiers){
      var cur=achTier(a);
      var ct=a.tiers[cur>=0?cur:0];
      var icon=cur>=0?ct.icon:a.icon;
      var name=a.name;
      var tierStr='';
      if(cur>=0){
        tierStr='<div style="font-size:7px;color:'+a.color+';margin-bottom:1px">'+TIER_LABELS[Math.min(cur,3)]+' Lv'+(cur+1)+'/'+a.tiers.length+'</div>';
      }
      var nextStr='';
      if(cur<a.tiers.length-1){
        var nt=a.tiers[cur+1];
        nextStr='<div style="font-size:8px;color:#555;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Next: '+nt.cond+'</div>';
      }
      card.style.cssText='background:'+(cur>=0?a.bg+'aa':'rgba(0,0,0,.3)')+';border:2px solid '+(cur>=0?a.color:'#222')+';border-radius:8px;padding:7px 6px;display:flex;align-items:flex-start;gap:6px;cursor:pointer;overflow:hidden;';
      card.innerHTML='<div style="font-size:1.6rem;flex-shrink:0;filter:'+(cur>=0?'drop-shadow(0 0 6px '+a.color+')':'grayscale(1)')+'">'+icon+'</div><div style="flex:1;min-width:0;overflow:hidden;">'+tierStr+'<div style="font-size:8px;color:'+(cur>=0?a.color:'#555')+';font-family:var(--px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+name+'</div>'+(cur>=0?'<div style="font-size:9px;color:#888;margin-top:1px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+ct.desc+'</div>':'<div style="font-size:9px;color:#444;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+a.tiers[0].cond+'</div>')+nextStr+'</div>';
    }else{
      card.style.cssText='background:'+(done?a.bg+'aa':'rgba(0,0,0,.3)')+';border:2px solid '+(done?a.color:'#222')+';border-radius:8px;padding:7px 6px;display:flex;align-items:flex-start;gap:6px;cursor:pointer;overflow:hidden;'+(done?'':'opacity:.6;');
      card.innerHTML='<div style="font-size:1.6rem;flex-shrink:0;filter:'+(done?'drop-shadow(0 0 6px '+a.color+')':'grayscale(1)')+'">'+(done?a.icon:'🔒')+'</div><div style="flex:1;min-width:0;overflow:hidden;"><div style="font-size:8px;color:'+(done?a.color:'#555')+';font-family:var(--px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+a.name+'</div><div style="font-size:9px;color:#888;margin-top:1px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(done?a.desc:a.cond)+'</div></div>';
    }
    card.onclick=function(){showAchDetail(a);};ag.appendChild(card);
  });
  container.appendChild(ag);
}
function showAchDetail(a){
  var done=!!S.achievements[a.id];
  $('sheet-title').textContent='Achievement';
  var html='<div style="text-align:center;padding:14px 0 10px">';
  if(a.tiers){
    var cur=achTier(a);
    html+='<div style="font-size:4rem;margin-bottom:8px;filter:'+(cur>=0?'drop-shadow(0 0 16px '+a.color+')':'grayscale(1)')+'">'+a.icon+'</div>';
    html+='<div style="font-size:12px;color:'+a.color+';margin-bottom:5px">'+a.name+'</div>';
    html+='<div style="font-family:system-ui;font-size:13px;color:#888;margin-bottom:10px;line-height:1.5">'+a.desc+'</div>';
    html+='<div style="background:rgba(255,215,0,.08);border:2px solid rgba(255,215,0,.2);border-radius:10px;padding:10px;margin-bottom:10px;text-align:left;">';
    a.tiers.forEach(function(t,i){
      var unlocked=cur>=i;
      var isCurrent=cur===i-1||(cur===-1&&i===0);
      html+='<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);'+(unlocked?'':'opacity:.5;')+'">';
      html+='<span style="font-size:1.2rem">'+(unlocked?t.icon:'🔒')+'</span>';
      html+='<span style="flex:1;font-family:system-ui;font-size:12px;color:'+(unlocked?'#fff':'#555')+'">'+t.name+' — '+t.cond+'</span>';
      html+='<span style="font-size:10px;color:'+(unlocked?'#22c55e':'#444')+'">'+(unlocked?'DONE':(isCurrent?'NEXT':''))+'</span>';
      html+='</div>';
    });
    html+='</div>';
    if(cur>=0){
      html+='<div style="font-size:11px;color:#22c55e;padding:8px 16px;border:2px solid #22c55e;border-radius:22px;display:inline-block">'+TIER_LABELS[Math.min(cur,3)]+' Level '+(cur+1)+'/'+a.tiers.length+'</div>';
    }else{
      html+='<div style="font-size:11px;color:#555;padding:8px 16px;border:2px solid #333;border-radius:22px;display:inline-block">Not yet unlocked</div>';
    }
  }else{
    html+='<div style="font-size:4rem;margin-bottom:8px;filter:'+(done?'drop-shadow(0 0 16px '+a.color+')':'grayscale(1)')+'">'+(done?a.icon:'🔒')+'</div>';
    html+='<div style="font-size:12px;color:'+(done?a.color:'#555')+';margin-bottom:5px">'+a.name+'</div>';
    html+='<div style="font-family:system-ui;font-size:13px;color:#888;margin-bottom:10px;line-height:1.5">'+a.desc+'</div>';
    html+='<div style="background:rgba(255,215,0,.08);border:2px solid rgba(255,215,0,.2);border-radius:10px;padding:10px;margin-bottom:10px;font-family:system-ui;font-size:13px;color:#ffd700;">HOW TO UNLOCK:<br>'+a.cond+'</div>';
    html+='<div style="font-size:11px;color:'+(done?'#22c55e':'#555')+';padding:8px 16px;border:2px solid '+(done?'#22c55e':'#333')+';border-radius:22px;display:inline-block">'+(done?'UNLOCKED!':'Not yet unlocked')+'</div>';
  }
  html+='</div>';
  $('sheet-body').innerHTML=html;
  $('bld-ov').classList.add('on');$('bld-sheet').classList.remove('off');
  $('btn-sheet-x').onclick=closeSheet;$('bld-ov').onclick=closeSheet;
}

// PROGRESS
function renderProgress(container){
  var tot=Object.values(S.stats).reduce(function(s,v){return s+(v.total||0);},0);
  var cor=Object.values(S.stats).reduce(function(s,v){return s+(v.correct||0);},0);
  var fp=buildCount(),total=CASTLE_PARTS.filter(function(p){return!p.free;}).length;
  var items=[{i:'Questions',v:tot},{i:'Correct',v:cor},{i:'Accuracy',v:tot>0?Math.round(cor/tot*100)+'%':'0%'},{i:'Total Coins',v:S.totalCoins},{i:'Max Combo',v:S.maxCombo},{i:'Parts Built',v:fp+'/'+total}];
  var statsHtml=items.map(function(it){return '<div style="background:rgba(255,255,255,.05);border-radius:10px;padding:10px 4px;text-align:center"><div style="font-size:11px;color:var(--gold);margin-top:3px">'+it.v+'</div><div style="font-size:9px;color:#555;margin-top:2px">'+it.i+'</div></div>';}).join('');
  var hdr=el('div','padding:14px;');
  hdr.innerHTML='<div style="background:rgba(0,0,0,.4);border:2px solid #333;border-radius:12px;padding:14px;margin-bottom:12px"><div style="font-size:11px;color:var(--gold);margin-bottom:9px">OVERALL STATS</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">'+statsHtml+'</div></div>';
  if(S.badges.length>0){hdr.innerHTML+='<div style="background:rgba(0,0,0,.4);border:2px solid #333;border-radius:12px;padding:12px;margin-bottom:12px"><div style="font-size:11px;color:var(--gold);margin-bottom:8px">EARNED BADGES</div><div style="display:flex;flex-wrap:wrap;gap:8px">'+S.badges.map(function(b){return '<div style="background:rgba(255,255,255,.07);border:2px solid #333;border-radius:10px;padding:8px 10px;display:flex;align-items:center;gap:8px"><span style="font-size:1.8rem">'+b.e+'</span><div><div style="font-size:9px;color:#fff">'+b.name+'</div><div style="font-size:9px;color:#666;margin-top:2px">'+b.desc+'</div></div></div>';}).join('')+'</div></div>';}
  var worldsHtml='';
  for(var wi=0;wi<=maxWorldIndex();wi++){var wd=getWorldData(wi);var wlv=0;for(var wj=0;wj<10;wj++){if(S.completed.has(wi+'-'+wj))wlv++;}var wbd=S.bossDefeated.has(wi);var wpct=wbd?100:Math.round(wlv/10*100);worldsHtml+='<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;font-size:9px;color:#888;margin-bottom:3px"><span>'+wd.icon+' '+wd.name+'</span><span style="color:'+(wbd?'#22c55e':'#aaa')+'">'+(wbd?'Done':wlv+'/10')+'</span></div><div class="prog-track" style="height:9px"><div class="prog-fill" style="width:'+wpct+'%;background:'+wd.hdrGrad+'"></div></div></div>';}
  hdr.innerHTML+='<div style="background:rgba(0,0,0,.4);border:2px solid #333;border-radius:12px;padding:12px"><div style="font-size:11px;color:var(--gold);margin-bottom:8px">WORLD PROGRESS</div>'+worldsHtml+'</div>';
  container.appendChild(hdr);
  container.appendChild(el('div','padding:0 14px 16px;','<button onclick="resetAll()" style="width:100%;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:12px;padding:14px;font-weight:700;font-size:13px;cursor:pointer">Reset All Progress</button>'));
}

// PIN
function initPin(){
  S.pinInput='';renderPinDots();$('pin-err').textContent='';
  var pad=$('pin-pad');pad.innerHTML='';
  var keys=[1,2,3,4,5,6,7,8,9,'',0,'X'];
  keys.forEach(function(n){
    var b=document.createElement('div');
    b.style.cssText='padding:14px;border-radius:8px;font-size:14px;text-align:center;cursor:'+(n===''?'default':'pointer')+';background:'+(n===''?'transparent':n==='X'?'rgba(220,38,38,.3)':'rgba(79,70,229,.4)')+';border:'+(n===''?'none':'2px solid '+(n==='X'?'rgba(220,38,38,.5)':'rgba(99,102,241,.5)'))+';color:#fff;';
    b.textContent=String(n);
    if(n!==''){b.onclick=function(){sfx('tick');if(n==='X'){S.pinInput=S.pinInput.slice(0,-1);$('pin-err').textContent='';}else if(S.pinInput.length<4){S.pinInput+=String(n);if(S.pinInput.length===4){if(S.pinInput===PIN){sfx('done');initParent();goTo('parent');}else{sfx('ng');$('pin-err').textContent='WRONG PIN';S.pinInput='';}}}renderPinDots();};}
    pad.appendChild(b);
  });
  $('btn-pin-back').onclick=function(){sfx('tick');goTo('home');};
}
function renderPinDots(){$('pin-dots').innerHTML=[0,1,2,3].map(function(i){return '<div style="width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;background:'+(S.pinInput.length>i?'#4f46e5':'#2d2d50')+';border:2px solid '+(S.pinInput.length>i?'#6366f1':'#444')+';">'+(S.pinInput.length>i?'●':'·')+'</div>';}).join('');}

// PARENT DASHBOARD
function initParent(){
  $('btn-par-back').onclick=function(){sfx('tick');goTo('home');};
  S.parTab='overview';renderParTabs();
}
function renderParTabs(){
  var tabs=[{k:'overview',l:'Stats'},{k:'grade',l:'Grade'},{k:'coins',l:'Coins'},{k:'topics',l:'Topics'},{k:'weak',l:'Weak'},{k:'log',l:'Log'},{k:'questions',l:'QBank'},{k:'save',l:'Save'}];
  $('par-tabs').innerHTML=tabs.map(function(t){var active=S.parTab===t.k;return '<div data-tab="'+t.k+'" class="pb" style="flex:1;padding:8px 2px;text-align:center;font-size:8px;border-radius:6px;cursor:pointer;background:'+(active?'var(--gold)':'rgba(255,255,255,.08)')+';color:'+(active?'#1a1a1a':'#fff')+';opacity:'+(active?1:.65)+'">'+t.l+'</div>';}).join('');
  $('par-tabs').querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){sfx('tick');S.parTab=b.dataset.tab;renderParTabs();renderParContent();};});
  renderParContent();
}
function renderParContent(){
  var c=$('par-content');c.innerHTML='';
  if(S.parTab==='overview')renderParOverview(c);
  else if(S.parTab==='grade')renderParGrade(c);
  else if(S.parTab==='coins')renderParCoins(c);
  else if(S.parTab==='topics')renderParTopics(c);
  else if(S.parTab==='weak')renderParWeak(c);
  else if(S.parTab==='questions')renderParQuestions(c);
  else if(S.parTab==='save')renderParSave(c);
  else renderParLog(c);
}
function renderParCoins(c){
  c.appendChild(el('div','margin-bottom:16px;','<div style="font-size:16px;font-weight:900;color:#1e293b;margin-bottom:6px">Coin Manager</div><div style="font-family:system-ui;font-size:13px;color:#64748b;line-height:1.5">Add or remove coins for the player. Use responsibly!</div>'));
  var coinCard=el('div','background:#fff;border-radius:16px;padding:20px;text-align:center;box-shadow:0 1px 6px rgba(0,0,0,.06);margin-bottom:14px;');
  coinCard.innerHTML='<div style="font-size:14px;color:#1e293b;font-weight:900;margin-bottom:4px">Current Coins</div><div style="font-size:48px;font-weight:900;color:#f59e0b;margin-bottom:4px">'+S.coins+'</div><div style="font-size:12px;color:#94a3b8">Total earned (lifetime): '+S.totalCoins+'</div>';
  c.appendChild(coinCard);
  var addBtns=[
    {v:5,col:'#22c55e',label:'+5'},{v:10,col:'#3b82f6',label:'+10'},{v:25,col:'#8b5cf6',label:'+25'},
    {v:50,col:'#f59e0b',label:'+50'},{v:100,col:'#f97316',label:'+100'},
    {v:-5,col:'#ef4444',label:'-5'},{v:-10,col:'#dc2626',label:'-10'},{v:-25,col:'#b91c1c',label:'-25'}
  ];
  var btnGrid=el('div','display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;');
  addBtns.forEach(function(b){
    var btn=el('div','background:'+b.col+';color:#fff;border-radius:10px;padding:12px 4px;text-align:center;cursor:pointer;font-size:13px;font-weight:900;border:2px solid rgba(0,0,0,.15);',b.label);
    btn.onclick=function(){
      sfx('coin');
      var prev=S.coins;
      S.coins=Math.max(0,S.coins+b.v);
      if(b.v>0)S.totalCoins+=b.v;
      save();
      coinCard.innerHTML='<div style="font-size:14px;color:#1e293b;font-weight:900;margin-bottom:4px">Current Coins</div><div style="font-size:48px;font-weight:900;color:#f59e0b;margin-bottom:4px">'+S.coins+'</div><div style="font-size:12px;color:#94a3b8">Total earned (lifetime): '+S.totalCoins+'</div>';
    };
    btnGrid.appendChild(btn);
  });
  c.appendChild(btnGrid);
  // Custom amount
  var customCard=el('div','background:#fff;border-radius:16px;padding:16px;box-shadow:0 1px 6px rgba(0,0,0,.06);');
  customCard.innerHTML='<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:10px">Custom Amount</div><div style="display:flex;gap:8px;"><input id="custom-coin-input" type="number" placeholder="Amount" style="flex:1;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;color:#1e293b;"><button onclick="addCustomCoins(1)" style="background:#22c55e;color:#fff;border:none;border-radius:8px;padding:10px 14px;cursor:pointer;font-weight:700;font-size:14px;">Add</button><button onclick="addCustomCoins(-1)" style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:10px 14px;cursor:pointer;font-weight:700;font-size:14px;">Remove</button></div>';
  c.appendChild(customCard);
  c.appendChild(el('div','padding:10px 0;','<div style="font-family:system-ui;font-size:12px;color:#94a3b8;text-align:center;">Note: Adding coins reduces the challenge. Use to unlock features when your child has earned them!</div>'));
}
window.addCustomCoins=function(sign){
  var input=$('custom-coin-input');
  var val=parseInt(input.value)||0;
  if(val<=0)return;
  sfx('coin');
  var actual=sign*val;
  S.coins=Math.max(0,S.coins+actual);
  if(actual>0)S.totalCoins+=actual;
  save();renderParContent();input.value='';
};
var TDIFF_DESC={
  add:['Within 20','Within 60','Within 99+'],sub:['Within 20','Within 60','Within 99+'],
  mul:['Tables x2-5','Tables x2-9','Tables x2-15'],div:['Divide by 2-4','Divide by 2-9','Divide by 2-12'],
  pattern:['Simple +/-','Mixed patterns','Complex sequences'],multistep:['2 operations','3 operations','Full chain'],
  word:['Short & simple','Moderate','Complex'],clock:['Hour only','Quarter hours','Any time'],
  elapsed:['Whole hours','Half hours','Mixed'],timediff:['Hours only','Hours & halves','Mixed'],
  length:['2 bars','3 bars','4 bars'],spatial:['Identify shapes','Symmetry & compose','Grids & nets'],
  logic:['Simple','2-step','3-step'],money:['Up to $10','Up to $50','Up to $100'],
  evenodd:['Within 10','Within 99','4-digit numbers'],
  lineup:['front+back=total','position problems','complex ordering'],
  rotshape:['90° turns','180° turns','Mixed rotations'],
  shadow:['Simple shapes','Composed shapes','3D objects'],
  shapeseq:['2 attributes','3 attributes','Complex patterns'],
  oddone:['By shape','By color/size','Multi-attribute'],
  mirror:['Horizontal flip','Vertical flip','Combined flips'],
  fraction:['Identify fractions','Add/subtract','Multiply/divide'],
  decimal:['Read decimals','Add/subtract','Multiply/divide'],
  percent:['Find percentage','Percent of amount','Increase/decrease'],
  ratio:['Simple ratios','Equivalent','Word problems'],
  algebra:['Find missing #','One-step equations','Two-step equations'],
  negative:['Compare','Add/subtract','Multiply/divide'],
  probability:['Certain/impossible','Simple events','Combined events'],
  statistics:['Mean (average)','Median & mode','Range & interpret'],
  angle:['Identify types','Measure angles','Calculate missing'],
  area_perimeter:['Rectangle','Triangles & shapes','Compound shapes']
};
function renderParTopics(c){
  var activeSet=getGradeActiveSet();
  c.appendChild(el('div','margin-bottom:16px;','<div style="font-size:16px;font-weight:900;color:#1e293b;margin-bottom:6px">Topics & Frequency — Grade '+S.grade+'</div><div style="font-family:system-ui;font-size:13px;color:#64748b;line-height:1.5">Toggle topics, set difficulty and frequency. Manually enabled topics appear in questions regardless of grade.</div>'));
  var DL=['Easy','Medium','Hard'],DC=['#22c55e','#f59e0b','#ef4444'],DB=['#f0fdf4','#fffbeb','#fef2f2'];
  var sortedTypes=ALL_TYPES.filter(function(k){return !!GENS[k];}).slice().sort(function(a,b){
    var ea=S.topicEnabled[a]!==false&&S.typeWeights[a]!==0;
    var eb=S.topicEnabled[b]!==false&&S.typeWeights[b]!==0;
    if(ea!==eb)return ea?-1:1;
    var aa=activeSet[a]?0:1,bb=activeSet[b]?0:1;
    return aa-bb;
  });
  sortedTypes.forEach(function(key){
    var info=TINFO[key],isEnabled=S.topicEnabled[key]!==false;
    var dl=S.topicDiffLevel[key]!==undefined?S.topicDiffLevel[key]:1;
    var w=S.typeWeights[key]!==undefined?S.typeWeights[key]:3;
    var isActiveGrade=activeSet[key];
    var isEffectivelyOn=isEnabled&&w>0;
    var dimStyle=isEffectivelyOn?'':'opacity:0.5;';
    var card=el('div','background:#fff;border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.07);'+dimStyle);
    var hdr=document.createElement('div');hdr.style.cssText='display:flex;align-items:center;gap:10px;';
    var badge;
    if(isActiveGrade){
      badge='<span style="font-size:9px;background:#dbeafe;color:#2563eb;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:6px;">G'+S.grade+'</span>';
    }else if(isEffectivelyOn){
      badge='<span style="font-size:9px;background:#fef3c7;color:#d97706;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:6px;">+Extra</span>';
    }else{
      badge='<span style="font-size:9px;background:#f1f5f9;color:#94a3b8;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:6px;">OFF</span>';
    }
    hdr.innerHTML='<span style="font-size:1.6rem;flex-shrink:0;">'+info.i+'</span><div style="flex:1;"><div style="font-size:14px;font-weight:800;color:#1e293b;">'+info.l+badge+'</div><div style="font-size:11px;color:#64748b;margin-top:2px;font-weight:600;">'+info.tip+'</div></div>';
    var tog=document.createElement('div');tog.className='topic-toggle';tog.style.background=isEnabled?'#22c55e':'#cbd5e1';
    var knob=document.createElement('div');knob.className='topic-toggle-knob';knob.style.left=isEnabled?'24px':'2px';
    tog.appendChild(knob);var _ie=isEnabled;
    tog.onclick=function(){sfx('tick');var newVal=!_ie;S.topicEnabled[key]=newVal;if(newVal&&S.typeWeights[key]===0){S.typeWeights[key]=3;}save();renderParContent();};
    hdr.appendChild(tog);card.appendChild(hdr);
    if(isEnabled){
      card.appendChild(el('div','height:1px;background:#f1f5f9;margin:10px 0;'));
      var dlLabel=document.createElement('div');dlLabel.style.cssText='font-size:10px;font-weight:700;color:#94a3b8;margin-bottom:4px;';dlLabel.textContent='Difficulty';
      card.appendChild(dlLabel);
      var dr=document.createElement('div');dr.style.cssText='display:flex;gap:6px;margin-bottom:10px;';
      DL.forEach(function(label,i){
        var active=dl===i;
        var btn=document.createElement('div');
        btn.style.cssText='flex:1;padding:8px 4px;border-radius:8px;text-align:center;font-size:11px;font-weight:700;cursor:pointer;background:'+(active?DB[i]:'#f8fafc')+';color:'+(active?DC[i]:'#94a3b8')+';border:2px solid '+(active?DC[i]:'#e2e8f0')+';';
        btn.textContent=label;var _i=i;
        btn.onclick=function(){sfx('tick');S.topicDiffLevel[key]=_i;save();renderParContent();};
        dr.appendChild(btn);
      });
      card.appendChild(dr);
      var frLabel=document.createElement('div');frLabel.style.cssText='font-size:10px;font-weight:700;color:#94a3b8;margin-bottom:4px;';frLabel.textContent='Frequency';
      card.appendChild(frLabel);
      var sr=document.createElement('div');sr.style.cssText='display:flex;gap:4px;';
      [0,1,2,3,4,5].forEach(function(v){
        var btn=document.createElement('div');
        btn.style.cssText='flex:1;padding:8px 0;border-radius:7px;text-align:center;font-size:11px;font-weight:700;cursor:pointer;background:'+(v===0?w===0?'#fef2f2':'#f8fafc':v<=w?'#dbeafe':'#f8fafc')+';color:'+(v===0?w===0?'#ef4444':'#94a3b8':v<=w?'#2563eb':'#94a3b8')+';border:2px solid '+(v===0?w===0?'#ef4444':'#e2e8f0':v<=w?'#3b82f6':'#e2e8f0')+';';
        btn.textContent=v===0?'OFF':String(v);var _v=v;
        btn.onclick=function(){sfx('tick');S.typeWeights[key]=_v;if(_v===0){S.topicEnabled[key]=false;}save();renderParContent();};
        sr.appendChild(btn);
      });
      card.appendChild(sr);
    }
    c.appendChild(card);
  });
}
function renderParGrade(c){
  var h='<div style="background:#fff;border-radius:12px;padding:18px;margin-bottom:14px;border:2px solid #e5e7eb;">';
  h+='<div style="font-size:14px;font-weight:bold;color:#1e293b;margin-bottom:10px;">Grade Level</div>';
  h+='<div style="font-size:13px;color:#64748b;margin-bottom:14px;">Select grade to adjust question difficulty and content.</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;">';
  for(var g=1;g<=6;g++){
    var sel=S.grade===g;
    h+='<div class="pb" style="padding:12px 4px;text-align:center;border-radius:10px;background:'+(sel?'linear-gradient(135deg,#4338ca,#7c3aed)':'#f1f5f9')+';color:'+(sel?'#fff':'#334155')+';font-size:11px;font-weight:bold;'+(sel?'box-shadow:0 4px 12px rgba(67,56,202,.4);':'')+'" id="grade-btn-'+g+'">'+getGradeLabel(g)+'</div>';
  }
  h+='</div>';
  // Grade description
  var gDescs={
    1:'Addition & subtraction within 20, even/odd, shapes, clock, ordering',
    2:'Two-digit add/sub, multiplication tables, money, word problems, fractions intro',
    3:'All 4 operations, division, patterns, elapsed time, fractions, area & perimeter',
    4:'Long multiply/divide, multi-step, decimals, fractions, angles, area & perimeter',
    5:'Fractions, decimals, percentages, ratios, probability, statistics, algebra intro',
    6:'Algebra, negative numbers, ratios, percentages, probability, statistics, advanced word problems'
  };
  h+='<div style="background:#f0f4ff;border-radius:8px;padding:10px 14px;margin-bottom:16px;border:1px solid #dbeafe;">';
  h+='<div style="font-size:10px;color:#4338ca;font-weight:bold;margin-bottom:4px;">Grade '+S.grade+' topics:</div>';
  h+='<div style="font-size:11px;color:#475569;line-height:1.6;">'+(gDescs[S.grade]||'')+'</div>';
  h+='</div>';
  // Online mode toggle
  h+='<div style="display:flex;align-items:center;justify-content:space-between;background:#f8fafc;border:2px solid #e5e7eb;border-radius:10px;padding:12px 16px;margin-bottom:12px;">';
  h+='<div><div style="font-size:13px;color:#1e293b;font-weight:bold;">Online Mode</div><div style="font-size:11px;color:#64748b;margin-top:2px;">'+(_netStatus&&S.onlineMode?'Connected — click Fetch to get questions':'Generate questions locally')+'</div></div>';
  h+='<div class="topic-toggle" style="background:'+(S.onlineMode?'#22c55e':'#cbd5e1')+';width:52px;height:28px;border-radius:14px;cursor:pointer;position:relative;" id="online-toggle"><div class="topic-toggle-knob" style="width:24px;height:24px;position:absolute;top:2px;left:'+(S.onlineMode?'26px':'2px')+';"></div></div>';
  h+='</div>';
  // Manual Fetch button
  if(S.onlineMode){
    h+='<div id="fetch-section" style="text-align:center;">';
    h+='<div class="pb" id="btn-fetch-q" style="background:linear-gradient(135deg,#0ea5e9,#2563eb);border-radius:10px;padding:12px 24px;font-size:11px;color:#fff;width:100%;">📥 Fetch Grade '+S.grade+' Questions</div>';
    h+='<div id="fetch-status" style="font-size:10px;color:#64748b;margin-top:8px;">Cached: '+_onlineCache.length+' questions ready</div>';
    h+='</div>';
  }
  h+='</div>';
  c.innerHTML=h;
  for(var g2=1;g2<=6;g2++){
    (function(gg){
      var b=$('grade-btn-'+gg);
      if(b)b.onclick=function(){sfx('tick');S.grade=gg;applyGradeDefaults();_onlineCache=[];S.questions=[];S.qIdx=0;S.sessionUsedKeys=new Set();save();renderParGrade(c);if(S.onlineMode){checkNetwork(function(ok){if(ok)fetchOnlineQuestions(S.grade,100).then(function(qs){_onlineCache=_onlineCache.concat(qs);});});}};
    })(g2);
  }
  var ot=$('online-toggle');
  if(ot){
    ot.onclick=function(){sfx('tick');S.onlineMode=!S.onlineMode;save();renderParGrade(c);if(S.onlineMode)checkNetwork();};
  }
  var fb=$('btn-fetch-q');
  if(fb){
    fb.onclick=function(){
      sfx('tick');
      fb.textContent='Fetching...';fb.style.opacity='0.6';
      checkNetwork(function(ok){
        if(!ok){
          fb.textContent='No connection';fb.style.opacity='1';fb.style.background='linear-gradient(135deg,#dc2626,#991b1b)';
          setTimeout(function(){fb.textContent='📥 Fetch Grade '+S.grade+' Questions';fb.style.background='linear-gradient(135deg,#0ea5e9,#2563eb)';fb.style.opacity='1';},2000);
          return;
        }
        fetchOnlineQuestions(S.grade,100).then(function(qs){
          _onlineCache=_onlineCache.concat(qs);
          fb.textContent='Got '+qs.length+' questions!';fb.style.background='linear-gradient(135deg,#16a34a,#15803d)';fb.style.opacity='1';
          sfx('done');
          setTimeout(function(){
            fb.textContent='📥 Fetch Grade '+S.grade+' Questions';
            fb.style.background='linear-gradient(135deg,#0ea5e9,#2563eb)';
            var fs=$('fetch-status');if(fs)fs.textContent='Cached: '+_onlineCache.length+' questions ready';
          },1500);
        });
      });
    };
  }
}
function renderParOverview(c){
  var tot=Object.values(S.stats).reduce(function(s,v){return s+(v.total||0);},0);
  var cor=Object.values(S.stats).reduce(function(s,v){return s+(v.correct||0);},0);
  var acc=tot>0?Math.round(cor/tot*100):0;
  var grid=el('div','display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;');
  var ovItems=[{i:'Questions',v:tot},{i:'Correct',v:cor},{i:'Accuracy',v:acc+'%'},{i:'Coins',v:S.totalCoins},{i:'Max Combo',v:S.maxCombo},{i:'Achvs',v:Object.keys(S.achievements).length}];
  ovItems.forEach(function(it){grid.appendChild(el('div','background:#fff;border-radius:14px;padding:14px 6px;text-align:center;box-shadow:0 1px 6px rgba(0,0,0,.06)','<div style="font-size:20px;font-weight:900;color:#1e293b;margin-top:4px">'+it.v+'</div><div style="font-size:11px;color:#94a3b8;font-weight:600">'+it.i+'</div>'));});
  c.appendChild(grid);
  var chartData=Object.keys(S.stats).filter(function(k){return S.stats[k].total>0;}).map(function(k){var v=S.stats[k];return{name:(TINFO[k]&&TINFO[k].s)||k,acc:Math.round(v.correct/v.total*100),total:v.total,icon:(TINFO[k]&&TINFO[k].i)||'?'};});
  if(chartData.length>0){
    var chart=el('div','background:#fff;border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:0 1px 6px rgba(0,0,0,.06)');
    chart.innerHTML='<div style="font-size:14px;font-weight:900;color:#1e293b;margin-bottom:12px">Accuracy by Topic</div>';
    chartData.forEach(function(d){
      var col=d.acc>=80?'#22c55e':d.acc>=60?'#eab308':'#ef4444';
      chart.innerHTML+='<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:#475569;margin-bottom:3px"><span>'+d.icon+' '+d.name+' ('+d.total+'q)</span><span style="color:'+col+'">'+d.acc+'%</span></div><div style="height:10px;background:#f1f5f9;border-radius:5px;overflow:hidden"><div style="height:100%;width:'+d.acc+'%;background:'+col+';border-radius:5px"></div></div></div>';
    });
    c.appendChild(chart);
  }
  c.appendChild(el('div','','<button onclick="resetAll()" style="width:100%;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:12px;padding:14px;font-weight:700;font-size:13px;cursor:pointer">Reset All Save Data</button>'));
}
var SUGG={add:'Count on from the larger number.',sub:'Count up from the smaller number.',mul:'Think: repeated groups.',div:'Ask: how many groups fit in?',pattern:'Find the rule first!',multistep:'Do multiply/divide before add/subtract.',word:'Underline numbers, circle key words.',clock:'Short hand = hours, long hand = minutes.',elapsed:'Count forward by hours.',timediff:'Subtract the earlier from the later time.',length:'Compare bars directly.',spatial:'Count sides and corners slowly.',logic:'Eliminate wrong options one by one.',money:'Add total cost, then subtract from budget.',evenodd:'Even ends 0,2,4,6,8.',compare:'Use a number line!',lineup:'Count front + self + back!'};
function renderParWeak(c){
  var weak=Object.keys(S.stats).filter(function(k){var v=S.stats[k];return v.total>=2&&v.correct/v.total<.65;}).map(function(k){var v=S.stats[k];return{key:k,label:(TINFO[k]&&TINFO[k].l)||k,icon:(TINFO[k]&&TINFO[k].i)||'?',pct:Math.round(v.correct/v.total*100)};}).sort(function(a,b){return a.pct-b.pct;});
  if(!Object.keys(S.stats).length){c.innerHTML='<div style="text-align:center;color:#94a3b8;padding:40px 0;font-size:14px">Play some levels first!</div>';return;}
  if(!weak.length){c.innerHTML='<div style="background:#f0fdf4;border-radius:16px;padding:24px;text-align:center"><div style="font-size:3rem;margin-bottom:8px">🏆</div><div style="font-size:17px;font-weight:900;color:#15803d">All topics above 65%!</div></div>';return;}
  weak.forEach(function(w){
    var col=w.pct<40?'#ef4444':w.pct<60?'#f97316':'#eab308';
    c.appendChild(el('div','background:#fff;border-radius:16px;padding:16px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.06)','<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:15px;font-weight:900;color:#1e293b">'+w.icon+' '+w.label+'</span><span style="font-weight:900;font-size:14px;padding:4px 10px;border-radius:20px;background:'+col+'22;color:'+col+'">'+w.pct+'%</span></div><div style="height:8px;background:#f1f5f9;border-radius:3px;overflow:hidden;margin-bottom:8px"><div style="height:100%;width:'+w.pct+'%;background:'+col+';border-radius:3px"></div></div><div style="font-size:12px;color:#64748b">Tip: '+(SUGG[w.key]||'Practice regularly!')+'</div>'));
  });
}
function renderParLog(c){
  var n=S.wrongLog.length;
  var hdr=el('div','display:flex;align-items:center;justify-content:space-between;margin-bottom:12px');
  hdr.innerHTML='<div style="font-size:14px;font-weight:700;color:#475569">'+n+' mistake'+(n!==1?'s':'')+' logged</div>';
  if(n>0){var clr=el('button','background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:8px 12px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer','Clear');clr.onclick=function(){S.wrongLog=[];save();renderParContent();};hdr.appendChild(clr);}
  c.appendChild(hdr);
  if(!n){c.innerHTML+='<div style="text-align:center;color:#94a3b8;padding:40px 0;font-size:14px">No mistakes yet!</div>';return;}
  S.wrongLog.slice(0,80).forEach(function(w,idx){
    var card=document.createElement('div');card.style.cssText='background:#fff;border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.06)';
    var headerHtml='<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="font-size:1.4rem">'+(w.i||'?')+'</span><div style="flex:1"><div style="font-size:12px;font-weight:700;color:#475569">'+((TINFO[w.type]&&TINFO[w.type].l)||w.type)+'</div><div style="font-size:11px;color:#94a3b8">'+(w.world||'')+' · '+(w.level||'')+' · '+(w.time||'')+'</div></div></div>';
    var displayHtml=w.display?'<div style="background:#f8fafc;border-radius:10px;padding:12px;margin-bottom:10px;overflow:hidden;max-height:120px;text-align:center">'+w.display+'</div>':w.q?'<div style="font-size:12px;color:#334155;white-space:pre-line;background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:10px;line-height:1.7">'+w.q+'</div>':'';
    var ansHtml='<div style="display:flex;gap:8px;margin-bottom:10px"><div style="flex:1;background:#fef2f2;border-radius:8px;padding:8px;text-align:center"><div style="font-size:11px;color:#f87171;font-weight:700">Your Answer</div><div style="font-size:17px;font-weight:900;color:#dc2626">'+(w.given||'?')+'</div></div><div style="flex:1;background:#f0fdf4;border-radius:8px;padding:8px;text-align:center"><div style="font-size:11px;color:#4ade80;font-weight:700">Correct</div><div style="font-size:17px;font-weight:900;color:#16a34a">'+(w.correct||'?')+'</div></div></div>';
    var practHtml=w.ch&&w.ch.length?'<button onclick="openPractice('+idx+')" style="width:100%;background:linear-gradient(135deg,#4338ca,#7c3aed);border:2px solid #4338ca;border-radius:10px;padding:12px;font-family:var(--px);font-size:11px;color:#fff;cursor:pointer;">Practice This Question</button>':'';
    card.innerHTML=headerHtml+displayHtml+ansHtml+practHtml;c.appendChild(card);
  });
}

// PRACTICE MODAL
window.openPractice=function(logIdx){
  var entry=S.wrongLog[logIdx];if(!entry)return;
  S.practiceEntry={entry:entry,logIdx:logIdx};
  $('practice-result').innerHTML='';
  var qDiv=$('practice-q');
  if(entry.display)qDiv.innerHTML='<div style="font-size:1.8rem;margin-bottom:6px">'+(entry.i||'?')+'</div><div>'+entry.display+'</div>';
  else qDiv.innerHTML='<div style="font-size:1.8rem;margin-bottom:6px">'+(entry.i||'?')+'</div><div style="font-family:var(--px);font-size:13px;color:#fff;white-space:pre-line;line-height:1.8">'+(entry.q||'Practice question')+'</div>';
  var ch=$('practice-choices');ch.innerHTML='';
  var CBGS=['#E52521','#049CD8','#43B047','#e78c00'];
  var choices=entry.ch&&entry.ch.length?entry.ch:mkC(entry.correct,[]);
  choices.forEach(function(cv,i){
    var b=document.createElement('button');b.className='choice-btn';b.style.background=CBGS[i%4];b.textContent=cv;
    b.onclick=function(){
      ch.querySelectorAll('.choice-btn').forEach(function(btn){btn.disabled=true;if(btn.textContent===entry.correct)btn.classList.add('ok');else if(btn===b&&cv!==entry.correct)btn.classList.add('ng');});
      if(cv===entry.correct){$('practice-result').innerHTML='<div style="color:#22c55e;font-size:13px;padding:10px;background:rgba(34,197,94,.1);border-radius:8px;">Correct! Well done! +1 coin</div>';sfx('ok');S.coins+=1;S.totalCoins+=1;S.achievements['a_practice']=Date.now();save();checkAchievements();}
      else{$('practice-result').innerHTML='<div style="color:#f87171;font-size:13px;padding:10px;background:rgba(239,68,68,.1);border-radius:8px;">The answer is <b>'+entry.correct+'</b>. Keep practising!</div>';sfx('ng');}
    };ch.appendChild(b);
  });
  $('practice-modal').classList.add('on');
};
window.closePractice=function(){$('practice-modal').classList.remove('on');};
window.resetAll=function(){if(!confirm('Reset all save data?'))return;try{localStorage.removeItem(SK);}catch(e){}location.reload();};

// CUSTOM QUESTION EDITOR
function renderParQuestions(c){
  c.appendChild(el('div','margin-bottom:16px;','<div style="font-size:16px;font-weight:900;color:#1e293b;margin-bottom:6px">Custom Question Bank</div><div style="font-family:system-ui;font-size:13px;color:#64748b;line-height:1.5">Add your own questions! They will appear randomly during gameplay (about 20% of the time).</div>'));
  // Add question form
  var form=el('div','background:#fff;border-radius:16px;padding:16px;box-shadow:0 1px 6px rgba(0,0,0,.06);margin-bottom:14px;');
  form.innerHTML='<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:10px">Add New Question</div>'+
    '<input id="cq-q" class="cq-input" placeholder="Question text (e.g. What is 7 x 8?)">'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'+
    '<input id="cq-a" class="cq-input" placeholder="Correct answer" style="border-color:#22c55e;margin-bottom:0;">'+
    '<input id="cq-w1" class="cq-input" placeholder="Wrong answer 1" style="border-color:#ef4444;margin-bottom:0;">'+
    '<input id="cq-w2" class="cq-input" placeholder="Wrong answer 2" style="border-color:#ef4444;margin-bottom:0;">'+
    '<input id="cq-w3" class="cq-input" placeholder="Wrong answer 3" style="border-color:#ef4444;margin-bottom:0;">'+
    '</div>'+
    '<div style="display:flex;gap:8px;align-items:center;">'+
    '<select id="cq-icon" class="cq-select"><option value="📝">📝 Text</option><option value="➕">➕ Add</option><option value="➖">➖ Sub</option><option value="✖️">✖️ Mul</option><option value="➗">➗ Div</option><option value="🧩">🧩 Logic</option><option value="📖">📖 Word</option><option value="🧮">🧮 Multi</option><option value="💰">💰 Money</option><option value="🎲">🎲 Even/Odd</option></select>'+
    '<div id="btn-add-cq" class="pb" style="background:#22c55e;border-radius:8px;padding:10px 18px;font-size:11px;color:#fff;cursor:pointer;">ADD</div>'+
    '</div>';
  c.appendChild(form);
  // Wire add button
  setTimeout(function(){
    var btn=$('btn-add-cq');if(!btn)return;
    btn.onclick=function(){
      var q=$('cq-q').value.trim(),a=$('cq-a').value.trim();
      var w1=$('cq-w1').value.trim(),w2=$('cq-w2').value.trim(),w3=$('cq-w3').value.trim();
      var icon=$('cq-icon').value;
      if(!q||!a||!w1||!w2||!w3){alert('Please fill in all fields!');return;}
      if(!S.customQuestions)S.customQuestions=[];
      S.customQuestions.push({q:q,a:a,w1:w1,w2:w2,w3:w3,icon:icon,type:'custom',added:new Date().toLocaleDateString()});
      save();sfx('build');
      $('cq-q').value='';$('cq-a').value='';$('cq-w1').value='';$('cq-w2').value='';$('cq-w3').value='';
      renderParContent();
    };
  },100);
  // List existing custom questions
  var cqs=S.customQuestions||[];
  if(cqs.length){
    c.appendChild(el('div','margin-bottom:8px;','<div style="font-size:13px;font-weight:700;color:#1e293b">Your Questions ('+cqs.length+')</div>'));
    cqs.forEach(function(cq,idx){
      var card=el('div','background:#fff;border-radius:12px;padding:12px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,.06);');
      card.innerHTML='<div style="display:flex;align-items:flex-start;gap:10px;">'+
        '<span style="font-size:1.6rem;flex-shrink:0;">'+(cq.icon||'📝')+'</span>'+
        '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:4px">'+cq.q+'</div>'+
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">'+
        '<span style="background:#f0fdf4;border:1px solid #22c55e;border-radius:6px;padding:2px 8px;font-size:11px;color:#15803d;">'+cq.a+' (correct)</span>'+
        '<span style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:2px 8px;font-size:11px;color:#dc2626;">'+cq.w1+'</span>'+
        '<span style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:2px 8px;font-size:11px;color:#dc2626;">'+cq.w2+'</span>'+
        '<span style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:2px 8px;font-size:11px;color:#dc2626;">'+cq.w3+'</span>'+
        '</div></div>'+
        '<div class="pb" style="background:#ef4444;border-radius:6px;padding:6px 10px;font-size:10px;color:#fff;cursor:pointer;flex-shrink:0;" id="cq-del-'+idx+'">DEL</div></div>';
      c.appendChild(card);
      setTimeout(function(){
        var del=$('cq-del-'+idx);if(del)del.onclick=function(){S.customQuestions.splice(idx,1);save();renderParContent();};
      },50);
    });
  }
  // Quick add batch
  var batchCard=el('div','background:#fff;border-radius:16px;padding:16px;box-shadow:0 1px 6px rgba(0,0,0,.06);margin-top:8px;');
  batchCard.innerHTML='<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:8px">Quick Add (one per line: question | answer | wrong1 | wrong2 | wrong3)</div>'+
    '<textarea id="cq-batch" class="cq-input" style="height:100px;font-size:11px;" placeholder="What is 5+3? | 8 | 7 | 9 | 6\nWhat is 12-4? | 8 | 6 | 9 | 3"></textarea>'+
    '<div id="btn-batch-cq" class="pb" style="background:#4f46e5;border-radius:8px;padding:10px 18px;font-size:11px;color:#fff;cursor:pointer;margin-top:6px;">BATCH ADD</div>';
  c.appendChild(batchCard);
  setTimeout(function(){
    var bb=$('btn-batch-cq');if(!bb)return;
    bb.onclick=function(){
      var text=$('cq-batch').value.trim();if(!text)return;
      var lines=text.split('\n');var added=0;
      lines.forEach(function(line){
        var parts=line.split('|').map(function(s){return s.trim();});
        if(parts.length>=5&&parts[0]&&parts[1]&&parts[2]&&parts[3]&&parts[4]){
          if(!S.customQuestions)S.customQuestions=[];
          S.customQuestions.push({q:parts[0],a:parts[1],w1:parts[2],w2:parts[3],w3:parts[4],icon:'📝',type:'custom',added:new Date().toLocaleDateString()});
          added++;
        }
      });
      if(added>0){save();sfx('build');$('cq-batch').value='';renderParContent();}
      else alert('No valid questions found. Use format: question | answer | wrong1 | wrong2 | wrong3');
    };
  },100);
}

// SAVE MANAGEMENT (Parent Dashboard)
function renderParSave(c){
  c.appendChild(el('div','margin-bottom:16px;','<div style="font-size:16px;font-weight:900;color:#1e293b;margin-bottom:6px">Save Data Management</div><div style="font-family:system-ui;font-size:13px;color:#64748b;line-height:1.5">Export your save to keep it safe, or import to restore. On OpenWrt, browser data can be lost — export regularly!</div>'));
  // Current save info
  var infoCard=el('div','background:#fff;border-radius:16px;padding:20px;box-shadow:0 1px 6px rgba(0,0,0,.06);margin-bottom:14px;');
  var saveSize=0;try{saveSize=(localStorage.getItem(SK)||'').length;}catch(e){}
  infoCard.innerHTML='<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:10px">Current Save</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">'+
    '<div style="background:#f8fafc;border-radius:10px;padding:10px;text-align:center;"><div style="font-size:10px;color:#64748b;">Last Saved</div><div style="font-size:13px;font-weight:700;color:#1e293b;">'+(S.lastSaveTime?new Date(S.lastSaveTime).toLocaleString():'Never')+'</div></div>'+
    '<div style="background:#f8fafc;border-radius:10px;padding:10px;text-align:center;"><div style="font-size:10px;color:#64748b;">Save Size</div><div style="font-size:13px;font-weight:700;color:#1e293b;">'+Math.round(saveSize/1024)+' KB</div></div>'+
    '<div style="background:#f8fafc;border-radius:10px;padding:10px;text-align:center;"><div style="font-size:10px;color:#64748b;">Levels Done</div><div style="font-size:13px;font-weight:700;color:#1e293b;">'+S.completed.size+'</div></div>'+
    '<div style="background:#f8fafc;border-radius:10px;padding:10px;text-align:center;"><div style="font-size:10px;color:#64748b;">Total Coins</div><div style="font-size:13px;font-weight:700;color:#f59e0b;">'+S.totalCoins+'</div></div>'+
    '</div>'+
    '<div style="display:flex;gap:8px;">'+
    '<div id="par-export-btn" class="pb" style="flex:1;background:#22c55e;border-radius:10px;padding:12px;text-align:center;font-size:12px;color:#fff;cursor:pointer;">EXPORT (Copy)</div>'+
    '<div id="par-download-btn" class="pb" style="flex:1;background:#3b82f6;border-radius:10px;padding:12px;text-align:center;font-size:12px;color:#fff;cursor:pointer;">DOWNLOAD FILE</div>'+
    '</div>';
  c.appendChild(infoCard);
  // Import section
  var importCard=el('div','background:#fff;border-radius:16px;padding:16px;box-shadow:0 1px 6px rgba(0,0,0,.06);margin-bottom:14px;');
  importCard.innerHTML='<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:10px">Import Save Data</div>'+
    '<textarea id="par-import-area" class="cq-input" style="height:80px;font-size:10px;font-family:monospace;" placeholder="Paste exported save data here..."></textarea>'+
    '<div id="par-import-btn" class="pb" style="width:100%;background:#f59e0b;border-radius:10px;padding:12px;text-align:center;font-size:12px;color:#fff;cursor:pointer;margin-top:6px;">IMPORT SAVE</div>'+
    '<div id="par-import-status" style="font-size:11px;margin-top:6px;min-height:18px;"></div>';
  c.appendChild(importCard);
  // Wire buttons
  setTimeout(function(){
    var expBtn=$('par-export-btn');
    if(expBtn)expBtn.onclick=function(){
      try{
        var data=localStorage.getItem(SK)||'';
        navigator.clipboard.writeText(data).then(function(){
          $('par-import-status').textContent='Save data copied to clipboard!';
          $('par-import-status').style.color='#22c55e';
        }).catch(function(){
          // Fallback: show in textarea
          $('par-import-area').value=data;
          $('par-import-status').textContent='Copy the text from the box above.';
          $('par-import-status').style.color='#3b82f6';
        });
      }catch(e){$('par-import-status').textContent='Export failed: '+e.message;$('par-import-status').style.color='#ef4444';}
    };
    var dlBtn=$('par-download-btn');
    if(dlBtn)dlBtn.onclick=function(){
      try{
        var data=localStorage.getItem(SK)||'';
        var blob=new Blob([data],{type:'application/json'});
        var url=URL.createObjectURL(blob);
        var a=document.createElement('a');a.href=url;a.download='castle_math_save_'+new Date().toISOString().slice(0,10)+'.json';
        document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
        $('par-import-status').textContent='File downloaded!';
        $('par-import-status').style.color='#22c55e';
      }catch(e){$('par-import-status').textContent='Download failed: '+e.message;$('par-import-status').style.color='#ef4444';}
    };
    var impBtn=$('par-import-btn');
    if(impBtn)impBtn.onclick=function(){
      var text=$('par-import-area').value.trim();
      if(!text){$('par-import-status').textContent='Please paste save data first!';$('par-import-status').style.color='#ef4444';return;}
      try{
        var parsed=JSON.parse(text);
        if(!parsed.coins&&parsed.coins!==0)throw new Error('Invalid save data');
        if(!confirm('This will REPLACE your current save! Are you sure?'))return;
        localStorage.setItem(SK,text);
        $('par-import-status').textContent='Save imported! Reloading...';$('par-import-status').style.color='#22c55e';
        setTimeout(function(){location.reload();},1000);
      }catch(e){$('par-import-status').textContent='Invalid save data: '+e.message;$('par-import-status').style.color='#ef4444';}
    };
  },100);
}

