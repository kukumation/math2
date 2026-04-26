function achMet(id){
  var tc=Object.values(S.stats).reduce(function(s,v){return s+(v.correct||0);},0);
  var tq=Object.values(S.stats).reduce(function(s,v){return s+(v.total||0);},0);
  var s3=Object.values(S.levelStars).filter(function(v){return v===3;}).length;
  var fp=CASTLE_PARTS.filter(function(p){return!p.free&&(S.partLevels[p.id]||0)>=MAX_PART_LEVEL;}).length;
  var shopCount=Object.values(S.shopOwned).reduce(function(s,v){return s+(v||0);},0);
  var totalBossWins=Object.values(S.bossWins).reduce(function(s,v){return s+(v||0);},0);
  var clk=(S.stats.clock?S.stats.clock.correct:0)+(S.stats.elapsed?S.stats.elapsed.correct:0)+(S.stats.timediff?S.stats.timediff.correct:0);
  var h=new Date().getHours();
  var filledSlots=S.decorSlots.filter(function(x){return x!==null;}).length;
  var allTopics=ALL_TYPES.filter(function(t){return GENS[t];}).every(function(t){return (S.stats[t]&&S.stats[t].correct>0);});
  if(id==='a_first')return tc>=1;
  if(id==='a_c10')return tc>=10;if(id==='a_c50')return tc>=50;if(id==='a_c100')return tc>=100;
  if(id==='a_c200')return tc>=200;if(id==='a_c500')return tc>=500;if(id==='a_c1000')return tc>=1000;if(id==='a_c2000')return tc>=2000;
  if(id==='a_combo3')return S.maxCombo>=3;if(id==='a_combo5')return S.maxCombo>=5;if(id==='a_combo10')return S.maxCombo>=10;
  if(id==='a_combo15')return S.maxCombo>=15;if(id==='a_combo20')return S.maxCombo>=20;if(id==='a_combo30')return S.maxCombo>=30;
  if(id==='a_perfect1')return s3>=1;if(id==='a_perfect3')return s3>=3;if(id==='a_perfect5')return s3>=5;
  if(id==='a_perfect10')return s3>=10;if(id==='a_perfect20')return s3>=20;
  if(id==='a_boss1')return S.bossDefeated.size>=1;if(id==='a_boss3')return S.bossDefeated.size>=3;
  if(id==='a_boss6')return S.bossDefeated.size>=6;if(id==='a_boss10')return totalBossWins>=10;
  if(id==='a_boss_fast'||id==='a_boss_rem'||id==='a_boss_perfect'||id==='a_no_hint_boss')return !!S.achievements[id];
  if(id==='a_build3')return fp>=3;if(id==='a_build5')return fp>=5;if(id==='a_build10')return fp>=10;
  if(id==='a_build15')return fp>=15;if(id==='a_build20')return fp>=20;
  if(id==='a_coins50')return S.totalCoins>=50;if(id==='a_coins100')return S.totalCoins>=100;
  if(id==='a_coins500')return S.totalCoins>=500;if(id==='a_coins1k')return S.totalCoins>=1000;
  if(id==='a_worlds2')return maxWorldIndex()>=2;if(id==='a_worlds6')return S.bossDefeated.size>=6;if(id==='a_worlds10')return maxWorldIndex()>=10;
  if(id==='a_stars5')return s3>=5;if(id==='a_stars15')return s3>=15;
  if(id==='a_level10')return S.completed.size>=10;if(id==='a_level30')return S.completed.size>=30;
  if(id==='a_level50')return S.completed.size>=50;if(id==='a_level100')return S.completed.size>=100;
  if(id==='a_clock10')return clk>=10;
  if(id==='a_logic10')return (S.stats.logic?S.stats.logic.correct:0)>=10;
  if(id==='a_word10')return (S.stats.word?S.stats.word.correct:0)>=10;
  if(id==='a_pattern10')return (S.stats.pattern?S.stats.pattern.correct:0)>=10;
  if(id==='a_lineup10')return (S.stats.lineup?S.stats.lineup.correct:0)>=10;
  if(id==='a_spatial10')return (S.stats.spatial?S.stats.spatial.correct:0)>=10;
  if(id==='a_shop1')return shopCount>=1;if(id==='a_shop5')return shopCount>=5;if(id==='a_shop10')return shopCount>=10;
  if(id==='a_sharp')return tq>=20&&tc/tq>=0.85;
  if(id==='a_sharp95')return tq>=50&&tc/tq>=0.95;
  if(id==='a_potion'||id==='a_hint'||id==='a_crystal'||id==='a_practice'||id==='a_comeback')return !!S.achievements[id];
  if(id==='a_no_pot')return S.noPotionCount>=5;
  if(id==='a_streak5')return S.levelWinStreak>=5;if(id==='a_streak10')return S.levelWinStreak>=10;if(id==='a_streak20')return S.levelWinStreak>=20;
  if(id==='a_night')return h>=21||h<6;
  if(id==='a_decor1')return filledSlots>=1;if(id==='a_decor5')return filledSlots>=5;if(id==='a_decor8')return filledSlots>=8;
  if(id==='a_mul_10')return (S.stats.mul?S.stats.mul.correct:0)>=20;
  if(id==='a_div_10')return (S.stats.div?S.stats.div.correct:0)>=20;
  if(id==='a_money10')return (S.stats.money?S.stats.money.correct:0)>=10;
  if(id==='a_all_topics')return allTopics;
  var allPartsBuilt=CASTLE_PARTS.filter(function(p){return!p.free;}).every(function(p){return(S.partLevels[p.id]||0)>=MAX_PART_LEVEL;});
  var allDecorOwned=SHOP_ITEMS.filter(function(i){return i.cat==='decor';}).every(function(i){return S.shopOwned[i.id];});
  var allCollOwned=SHOP_ITEMS.filter(function(i){return i.cat==='coll';}).every(function(i){return S.shopOwned[i.id];});
  if(id==='a_add50')return(S.stats.add?S.stats.add.correct:0)>=50;
  if(id==='a_mul50')return(S.stats.mul?S.stats.mul.correct:0)>=50;
  if(id==='a_div50')return(S.stats.div?S.stats.div.correct:0)>=50;
  if(id==='a_sub50')return(S.stats.sub?S.stats.sub.correct:0)>=50;
  if(id==='a_buildall')return allPartsBuilt;
  if(id==='a_alldecor')return allDecorOwned;
  if(id==='a_allcoll')return allCollOwned;
  if(id==='a_spend500')return(S.totalSpent||0)>=500;
  if(id==='a_divstreak5'||id==='a_mulstreak10'||id==='a_bossperf3'||id==='a_5topics'||id==='a_session100')return !!S.achievements[id];
  if(id==='a_noon')return !!S.achievements[id];
  if(id==='a_7days')return(S.playDays?S.playDays.size:0)>=7;
  if(id==='a_50first')return tq>=20&&tc/tq>=0.5;
  if(id==='a_mul_50')return(S.stats.mul?S.stats.mul.correct:0)>=50;
  if(id==='a_div_50')return(S.stats.div?S.stats.div.correct:0)>=50;
  if(id==='a_word50')return(S.stats.word?S.stats.word.correct:0)>=50;
  if(id==='a_money50')return(S.stats.money?S.stats.money.correct:0)>=50;
  if(id==='a_logic50')return(S.stats.logic?S.stats.logic.correct:0)>=50;
  if(id==='a_perfect50')return s3>=50;
  if(id==='a_coins5k')return S.totalCoins>=5000;
  if(id==='a_boss25')return totalBossWins>=25;
  return false;
}
var _achQueue=[],_achShowing=false;
function checkAchievements(){
  ACHIEVEMENTS.forEach(function(a){
    if(S.achievements[a.id])return;
    if(achMet(a.id)){S.achievements[a.id]=Date.now();_achQueue.push(a);}
  });
  if(_achQueue.length&&!_achShowing){save();processAchQueue();}
}
function processAchQueue(){if(!_achQueue.length){_achShowing=false;return;}_achShowing=true;showAchNotif(_achQueue.shift());}
function showAchNotif(a){
  var n=$('ach-notif');
  n.innerHTML='<div class="ach-card" style="background:linear-gradient(135deg,'+a.bg+'ee,'+a.bg+');--ac:'+a.color+';"><div style="font-size:2.8rem;flex-shrink:0;filter:drop-shadow(0 0 12px '+a.color+')">'+a.icon+'</div><div style="flex:1;min-width:0;"><div style="font-size:9px;color:'+a.color+';letter-spacing:2px;margin-bottom:3px;">ACHIEVEMENT!</div><div style="font-size:12px;color:#fff;font-family:var(--px);margin-bottom:3px;">'+a.name+'</div><div style="font-family:system-ui;font-size:13px;color:rgba(255,255,255,.65);line-height:1.3;">'+a.desc+'</div></div><div style="font-size:1.8rem;animation:spin 3s linear infinite;">✨</div></div>';
  sfx('power');speak('Achievement unlocked! '+a.name,1.2,.95);
  setTimeout(function(){n.style.top='20px';},50);
  setTimeout(function(){n.style.top='-200px';setTimeout(processAchQueue,500);},3800);
}
