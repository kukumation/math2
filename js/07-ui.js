function goTo(id){document.querySelectorAll('.scr').forEach(function(s){s.classList.remove('on');});var s=$('s-'+id);if(s){s.classList.add('on');s.scrollTop=0;}S.screen=id;}
function toast(id,msg,dur){dur=dur||1600;var t=$(id);if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},dur);}
function confetti(){
  var sym=['⭐','🌟','💫','🪙','🍄','🎉'];
  for(var ci=0;ci<18;ci++){
    var d=document.createElement('div');d.className='confetti';d.textContent=sym[ci%6];
    d.style.setProperty('--dx',(Math.random()-.5)*600+'px');d.style.setProperty('--dy',(Math.random()-.5)*500+'px');d.style.setProperty('--rot',(Math.random()-.5)*720+'deg');
    d.style.left='50%';d.style.top='50%';d.style.animationDuration=(1.3+Math.random()*.6)+'s';d.style.animationDelay=(ci*.04)+'s';
    $('app').appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},2400);
  }
}
function coinPop(n,pid){pid=pid||'g-cpops';var c=$(pid);if(!c)return;var d=el('div','right:60px;top:90px;');d.className='cpop';d.textContent='+'+n;c.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},950);}
function spawnFire(combo){
  var ov=$('fire-overlay');if(!ov)return;ov.innerHTML='';
  var gs=$('s-game');
  if(combo<3){if(gs)gs.style.boxShadow='none';return;}
  var c=combo>=8?'rgba(180,0,255,.45)':combo>=5?'rgba(255,30,0,.4)':'rgba(255,120,0,.3)';
  if(gs)gs.style.boxShadow='inset 0 0 '+(50+combo*8)+'px '+c;
  var cnt=combo>=8?10:combo>=5?7:4;
  for(var fi=0;fi<cnt;fi++){
    var p=document.createElement('div');p.className='fp';
    p.style.left=(fi%2===0?rnd(0,10):rnd(90,100))+'%';p.style.bottom=rnd(5,70)+'%';
    p.style.setProperty('--sz',rnd(16,24)+'px');p.style.setProperty('--dur',(0.8+Math.random()*1.2)+'s');p.style.setProperty('--del',(-Math.random()*2)+'s');
    p.textContent=combo>=8?'⚡':'🔥';ov.appendChild(p);
  }
}
function renderQ(q,iconId,bodyId,choicesId,onAnswer,hintActive){
  var ic=$(iconId),bd=$(bodyId),ch=$(choicesId);if(!ic||!bd||!ch)return;
  var card=ic.closest('.q-card');
  if(card){card.classList.remove('card-enter');void card.offsetWidth;card.classList.add('card-enter');}
  ic.innerHTML='<span style="font-size:2.5rem">'+q.i+'</span>';
  if(q.render&&q.display)bd.innerHTML='<div style="width:100%;transform:scale(1)">'+q.display+'</div>';
  else bd.innerHTML='<div style="font-size:12px;font-family:var(--px);color:#374151;white-space:pre-line;line-height:2;">'+(q.q||'')+'</div>';
  var CBGS=['#E52521','#049CD8','#43B047','#e78c00'],CBDR=['#B01E19','#037BA0','#2E7D32','#b56800'];
  ch.innerHTML='';
  var allCh=q.ch||[];
  var numCh=allCh.length;
  var cols=numCh<=2?2:2;
  ch.style.cssText='display:grid;grid-template-columns:repeat('+cols+',1fr);gap:10px;width:100%;max-width:380px;';
  // Hint: find wrong answers to dim
  var dimIndices=[];
  if(hintActive){
    var wrongIdxs=[];
    allCh.forEach(function(c,i){if(c!==q.a)wrongIdxs.push(i);});
    var shuffledWrong=shuffle(wrongIdxs);
    dimIndices=shuffledWrong.slice(0,2);
  }
  if(q.gfxCh&&q.gfxCh.length){
    ch.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:380px;';
    q.gfxCh.forEach(function(gc,i){
      var b=document.createElement('button');
      b.className='choice-btn'+(dimIndices.indexOf(i)!==-1?' hint-out':'');
      b.style.cssText='background:#f8fafc;border:4px solid #333;padding:12px 6px;text-align:center;cursor:pointer;font-family:var(--px);color:#374151;opacity:0;animation:choiceIn .2s ease forwards;animation-delay:'+(i*0.06)+'s;box-shadow:5px 5px 0 #000;';
      b.innerHTML='<div style="font-size:11px;color:#64748b;margin-bottom:4px">'+gc.label+'</div>'+gc.html;
      b.onclick=function(){onAnswer(gc.label,b);};
      ch.appendChild(b);
    });
    return;
  }
  allCh.forEach(function(c,i){
    var b=document.createElement('button');
    b.className='choice-btn'+(dimIndices.indexOf(i)!==-1?' hint-out':'');
    b.style.background=CBGS[i%4];b.style.borderColor=CBDR[i%4];
    b.style.animationDelay=(i*0.06)+'s';
    b.textContent=c;
    b.onclick=function(){onAnswer(c,b);};
    ch.appendChild(b);
  });
}

// ============================================================
// HOME
// ============================================================
function initHome(){
  audBtn('home-aud');renderNetIcon();autoBuiltCheck();
  if(S.onlineMode)checkNetwork();
  var statsData=[
    {i:S.hp>0?'❤️':'💔',v:S.hp+'/'+S.maxHp,l:'HEARTS'},
    {i:'🪙',v:S.totalCoins,l:'COINS'},
    {i:'🏆',v:Object.keys(S.achievements).length,l:'ACHVS'},
    {i:'🔥',v:S.maxCombo,l:'COMBO'}
  ];
  $('home-stats').innerHTML=statsData.map(function(it){return '<div class="pb" style="background:linear-gradient(145deg,rgba(30,30,60,.9),rgba(20,20,40,.9));border-color:rgba(255,255,255,.1);border-radius:10px;padding:9px 4px;text-align:center;box-shadow:3px 3px 0 #000,inset 1px 1px 0 rgba(255,255,255,.05);"><div style="font-size:1.5rem">'+it.i+'</div><div style="font-size:10px;color:var(--gold);margin-top:3px">'+it.v+'</div><div style="font-size:8px;color:#777;margin-top:2px">'+it.l+'</div></div>';}).join('');
  $('k-sub').textContent=buildCount()+'/'+CASTLE_PARTS.filter(function(p){return!p.free;}).length+' parts · '+(S.potionStock||0)+' pot · '+(S.hintStock||0)+' hints';
  $('k-notify').style.display=availableCount()>0?'block':'none';
  $('btn-kingdom').onclick=function(){sfx('tick');initBuilder();goTo('builder');};
  $('btn-review').onclick=function(){
    sfx('tick');
    if(!S.wrongLog||S.wrongLog.length===0){toast('g-toast','No wrong answers to review!',2000);return;}
    initReview();goTo('review');
  };
  $('btn-parent').onclick=function(){sfx('tick');initPin();goTo('pin');};
  // Update review button subtitle
  var rsub=$('r-sub');if(rsub)rsub.textContent=(S.wrongLog?S.wrongLog.length:0)+' questions to review';
  updateRegenUI();updateSaveTimeUI();
  // Export/Import buttons on home
  var expBtn=$('btn-save-export');if(expBtn)expBtn.onclick=function(){
    try{
      var data=localStorage.getItem(SK)||'';
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(data).then(function(){toast('g-toast','Save copied to clipboard!',2000);}).catch(function(){$('import-area').value=data;$('import-area').style.display='block';toast('g-toast','Copy from text box below',2000);});
      }else{$('import-area').value=data;$('import-area').style.display='block';toast('g-toast','Copy from text box below',2000);}
    }catch(e){toast('g-toast','Export failed',2000);}
  };
  var impBtn=$('btn-save-import');if(impBtn)impBtn.onclick=function(){
    var area=$('import-area');if(!area)return;
    if(area.style.display==='none'||area.style.display===''){area.style.display='block';$('import-confirm').style.display='block';toast('g-toast','Paste save data below',2000);}
    else{area.style.display='none';$('import-confirm').style.display='none';}
  };
  var doImp=$('btn-do-import');if(doImp)doImp.onclick=function(){
    var text=$('import-area').value.trim();
    if(!text){toast('g-toast','No data to import!',2000);return;}
    try{
      var p=decompressSave(text);if(!p.coins&&p.coins!==0)throw 0;
      if(!confirm('Replace current save?'))return;
      localStorage.setItem(SK,text);location.reload();
    }catch(e){toast('g-toast','Invalid save data!',2000);}
  };
  var cancelImp=$('btn-cancel-import');if(cancelImp)cancelImp.onclick=function(){
    $('import-area').style.display='none';$('import-confirm').style.display='none';$('import-area').value='';
  };
  var wl=$('world-list');if(wl)wl.innerHTML='';
  var showCount=Math.min(maxWorldIndex()+2,50);
  for(var wi=0;wi<showCount;wi++){
    (function(i){
      var w=getWorldData(i),unlocked=i===0||S.bossDefeated.has(i-1);
      var levsDone=0;for(var j=0;j<10;j++){if(S.completed.has(i+'-'+j))levsDone++;}
      var bDone=S.bossDefeated.has(i),pct=bDone?100:Math.round(levsDone/10*100);
      var card=document.createElement('div');
      card.style.cssText='background:rgba(0,0,0,.45);border:4px solid rgba(255,255,255,.12);border-radius:0;overflow:hidden;cursor:'+(unlocked?'pointer':'default')+';opacity:'+(unlocked?1:.5)+';box-shadow:6px 6px 0 rgba(0,0,0,.8),inset 1px 1px 0 rgba(255,255,255,.08);';
      var pctIcon=pct===100?'<span style="color:#4ade80">&#9733;</span>':pct>=70?'<span style="color:#fde047">&#9733;</span>':'';
      var progHtml=unlocked?'<div style="margin-top:12px"><div style="display:flex;align-items:center;gap:6px"><span style="font-family:var(--px);font-size:8px;color:#aaa;white-space:nowrap">LV</span><div class="prog-track" style="flex:1;height:14px"><div class="prog-fill" style="width:'+pct+'%"></div></div><span style="font-family:var(--px);font-size:8px;color:'+(pct===100?'#4ade80':'#ccc')+';white-space:nowrap">'+pct+'%</span></div><div style="font-family:var(--px);font-size:8px;color:rgba(255,255,255,.55);margin-top:6px;text-align:center">'+(bDone?'<span style="color:#4ade80">&#9733; COMPLETE &#9733;</span>':levsDone+'/10'+(levsDone===10&&!bDone?' &#9650; BOSS READY':''))+'</div></div>':'';
      card.innerHTML='<div style="background:'+w.hdrGrad+';padding:14px 16px"><div style="display:flex;align-items:center;gap:14px"><div style="width:52px;height:52px;background:rgba(0,0,0,.35);border:4px solid rgba(255,255,255,.25);box-shadow:3px 3px 0 rgba(0,0,0,.5),inset 1px 1px 0 rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0">'+(unlocked?w.icon:'🔒')+'</div><div style="flex:1;min-width:0"><div style="font-family:var(--px);font-size:7px;color:rgba(255,255,255,.6);letter-spacing:2px">WORLD '+(i+1)+'</div><div style="font-family:var(--px);font-size:11px;color:#fff;margin-top:4px;text-shadow:2px 2px 0 rgba(0,0,0,.5)">'+w.name+'</div><div style="font-family:var(--px);font-size:8px;color:rgba(255,255,255,.5);margin-top:3px">'+w.sub+'</div></div>'+(bDone?'<span style="font-size:2rem">'+w.badge.e+'</span>':'')+'</div>'+progHtml+'</div>';
      if(unlocked)card.onclick=function(){sfx('tick');S.region=i;playBg('w'+(i%6));initRegion();goTo('region');};
      wl.appendChild(card);
    })(wi);
  }
}

