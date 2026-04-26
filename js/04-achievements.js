// Migrate old flat achievements to new tiered format
var _oldAchMap={
  'a_first':{id:'at_correct',t:0},'a_c10':{id:'at_correct',t:1},'a_c50':{id:'at_correct',t:2},
  'a_c100':{id:'at_correct',t:3},'a_c200':{id:'at_correct',t:4},'a_c500':{id:'at_correct',t:5},
  'a_c1000':{id:'at_correct',t:6},'a_c2000':{id:'at_correct',t:7},
  'a_combo3':{id:'at_combo',t:0},'a_combo5':{id:'at_combo',t:1},'a_combo10':{id:'at_combo',t:2},
  'a_combo15':{id:'at_combo',t:3},'a_combo20':{id:'at_combo',t:4},'a_combo30':{id:'at_combo',t:5},
  'a_perfect1':{id:'at_perfect',t:0},'a_perfect3':{id:'at_perfect',t:1},'a_perfect5':{id:'at_perfect',t:2},
  'a_perfect10':{id:'at_perfect',t:3},'a_perfect20':{id:'at_perfect',t:4},'a_perfect50':{id:'at_perfect',t:5},
  'a_boss1':{id:'at_boss',t:0},'a_boss3':{id:'at_boss',t:1},'a_boss6':{id:'at_boss',t:2},
  'a_boss10':{id:'at_boss',t:3},'a_boss25':{id:'at_boss',t:4},
  'a_build3':{id:'at_build',t:0},'a_build5':{id:'at_build',t:1},'a_build10':{id:'at_build',t:2},
  'a_build15':{id:'at_build',t:3},'a_build20':{id:'at_build',t:4},
  'a_coins50':{id:'at_coins',t:0},'a_coins100':{id:'at_coins',t:1},'a_coins500':{id:'at_coins',t:2},
  'a_coins1k':{id:'at_coins',t:3},'a_coins5k':{id:'at_coins',t:4},
  'a_worlds2':{id:'at_worlds',t:0},'a_worlds6':{id:'at_worlds',t:1},'a_worlds10':{id:'at_worlds',t:2},
  'a_stars5':{id:'at_stars',t:0},'a_stars15':{id:'at_stars',t:1},
  'a_level10':{id:'at_levels',t:0},'a_level30':{id:'at_levels',t:1},'a_level50':{id:'at_levels',t:2},
  'a_level100':{id:'at_levels',t:3},
  'a_streak5':{id:'at_streak',t:0},'a_streak10':{id:'at_streak',t:1},'a_streak20':{id:'at_streak',t:2},
  'a_shop1':{id:'at_shop',t:0},'a_shop5':{id:'at_shop',t:1},'a_shop10':{id:'at_shop',t:2},
  'a_decor1':{id:'at_decor',t:0},'a_decor5':{id:'at_decor',t:1},'a_decor8':{id:'at_decor',t:2},
  'a_sharp':{id:'at_accuracy',t:0},'a_sharp95':{id:'at_accuracy',t:2},
  'a_7days':{id:'at_days',t:1},
  'a_no_pot':{id:'at_nopot',t:1},
  'a_spend500':{id:'at_spend',t:1},
  'a_mul_10':{id:'a_mul50'},'a_mul_50':{id:'a_mul50'},
  'a_div_10':{id:'a_div50'},'a_div_50':{id:'a_div50'},
  'a_clock10':{id:'a_clock50'},'a_logic10':{id:'a_logic50'},
  'a_word10':{id:'a_word50'},'a_money10':{id:'a_money50'},
  'a_pattern10':{id:'a_pattern50'},'a_spatial10':{id:'a_spatial50'},'a_lineup10':{id:'a_pattern50'}
};
function migrateAch(){
  if(S._achMigrated)return;
  var changed=false;
  Object.keys(_oldAchMap).forEach(function(oldId){
    if(!S.achievements[oldId])return;
    var m=_oldAchMap[oldId];
    var cur=S.achievements[m.id];
    if(typeof cur!=='number'||cur<m.t){
      S.achievements[m.id]=m.t;changed=true;
    }
    delete S.achievements[oldId];
  });
  // Clean up any remaining old IDs
  var validIds={};
  ACHIEVEMENTS.forEach(function(a){validIds[a.id]=true;});
  Object.keys(S.achievements).forEach(function(k){
    if(!validIds[k]&&typeof S.achievements[k]!=='number'){delete S.achievements[k];changed=true;}
  });
  S._achMigrated=true;
  if(changed)save();
}

// Get current tier for an achievement (returns -1 if none unlocked)
function achTier(a){
  var v=S.achievements[a.id];
  if(v===undefined||v===null)return -1;
  if(a.tiers)return(typeof v==='number')?v:-1;
  return v?-1:-1; // flat: just check truthy
}
// Is a flat achievement unlocked?
function achFlatDone(a){return!!S.achievements[a.id];}

function achMet(a){
  if(a.tiers){
    // Tiered: check if next tier is met
    var cur=achTier(a);
    var next=cur+1;
    if(next>=a.tiers.length)return false;
    var val=a.getVal();
    // Special handling for accuracy
    if(a.id==='at_accuracy'){
      var tc=Object.values(S.stats).reduce(function(s,v){return s+(v.correct||0);},0);
      var tq=Object.values(S.stats).reduce(function(s,v){return s+(v.total||0);},0);
      var minQ=next<=1?20:50;
      return tq>=minQ&&tc/tq>=a.tiers[next].threshold/100;
    }
    return val>=a.tiers[next].threshold;
  }
  // Flat achievements — same logic as before
  var tc=Object.values(S.stats).reduce(function(s,v){return s+(v.correct||0);},0);
  var tq=Object.values(S.stats).reduce(function(s,v){return s+(v.total||0);},0);
  var s3=Object.values(S.levelStars).filter(function(v){return v===3;}).length;
  var totalBossWins=Object.values(S.bossWins).reduce(function(s,v){return s+(v||0);},0);
  var h=new Date().getHours();
  var allTopics=ALL_TYPES.filter(function(t){return GENS[t];}).every(function(t){return(S.stats[t]&&S.stats[t].correct>0);});
  var id=a.id;
  if(id==='a_potion'||id==='a_hint'||id==='a_crystal'||id==='a_practice'||id==='a_comeback')return!!S.achievements[id];
  if(id==='a_boss_fast'||id==='a_boss_rem'||id==='a_boss_perfect'||id==='a_no_hint_boss')return!!S.achievements[id];
  if(id==='a_divstreak5'||id==='a_mulstreak10'||id==='a_bossperf3'||id==='a_session100')return!!S.achievements[id];
  if(id==='a_noon')return!!S.achievements[id];
  if(id==='a_5topics')return!!S.achievements[id];
  if(id==='a_50first')return tq>=20&&tc/tq>=0.5;
  if(id==='a_all_topics')return allTopics;
  if(id==='a_add50')return(S.stats.add?S.stats.add.correct:0)>=50;
  if(id==='a_sub50')return(S.stats.sub?S.stats.sub.correct:0)>=50;
  if(id==='a_mul50')return(S.stats.mul?S.stats.mul.correct:0)>=50;
  if(id==='a_div50')return(S.stats.div?S.stats.div.correct:0)>=50;
  if(id==='a_word50')return(S.stats.word?S.stats.word.correct:0)>=50;
  if(id==='a_money50')return(S.stats.money?S.stats.money.correct:0)>=50;
  if(id==='a_logic50')return(S.stats.logic?S.stats.logic.correct:0)>=50;
  if(id==='a_pattern50')return(S.stats.pattern?S.stats.pattern.correct:0)>=50;
  if(id==='a_clock50'){var clk=(S.stats.clock?S.stats.clock.correct:0)+(S.stats.elapsed?S.stats.elapsed.correct:0)+(S.stats.timediff?S.stats.timediff.correct:0);return clk>=50;}
  if(id==='a_spatial50')return(S.stats.spatial?S.stats.spatial.correct:0)>=50;
  if(id==='a_buildall')return CASTLE_PARTS.filter(function(p){return!p.free;}).every(function(p){return(S.partLevels[p.id]||0)>=MAX_PART_LEVEL;});
  if(id==='a_alldecor')return SHOP_ITEMS.filter(function(i){return i.cat==='decor';}).every(function(i){return S.shopOwned[i.id];});
  if(id==='a_allcoll')return SHOP_ITEMS.filter(function(i){return i.cat==='coll';}).every(function(i){return S.shopOwned[i.id];});
  if(id==='a_night')return h>=21||h<6;
  return false;
}

var _achQueue=[],_achShowing=false;
function checkAchievements(){
  migrateAch();
  ACHIEVEMENTS.forEach(function(a){
    if(a.tiers){
      var cur=achTier(a);
      if(achMet(a)){
        var next=cur+1;
        S.achievements[a.id]=next;
        _achQueue.push({ach:a,tier:next});
      }
    }else{
      if(!S.achievements[a.id]&&achMet(a)){
        S.achievements[a.id]=Date.now();
        _achQueue.push({ach:a,tier:-1});
      }
    }
  });
  if(_achQueue.length&&!_achShowing){save();processAchQueue();}
}
function processAchQueue(){if(!_achQueue.length){_achShowing=false;return;}_achShowing=true;showAchNotif(_achQueue.shift());}
function showAchNotif(item){
  var a=item.ach,tier=item.tier;
  var n=$('ach-notif');
  var displayIcon,displayName,displayDesc,displayColor;
  if(tier>=0&&a.tiers){
    var t=a.tiers[tier];
    displayIcon=t.icon;displayName=t.name;displayDesc=t.desc;displayColor=a.color;
  }else{
    displayIcon=a.icon;displayName=a.name;displayDesc=a.desc;displayColor=a.color;
  }
  var tierBadge='';
  if(tier>=0&&a.tiers){tierBadge='<span style="font-size:10px;color:'+a.color+'">'+TIER_LABELS[Math.min(tier,3)]+' Lv'+(tier+1)+'</span>';}
  n.innerHTML='<div class="ach-card" style="background:linear-gradient(135deg,'+a.bg+'ee,'+a.bg+');--ac:'+displayColor+';"><div style="font-size:2.8rem;flex-shrink:0;filter:drop-shadow(0 0 12px '+displayColor+')">'+displayIcon+'</div><div style="flex:1;min-width:0;">'+tierBadge+'<div style="font-size:9px;color:'+displayColor+';letter-spacing:2px;margin-bottom:3px;">ACHIEVEMENT!</div><div style="font-size:12px;color:#fff;font-family:var(--px);margin-bottom:3px;">'+displayName+'</div><div style="font-family:system-ui;font-size:13px;color:rgba(255,255,255,.65);line-height:1.3;">'+displayDesc+'</div></div><div style="font-size:1.8rem;animation:spin 3s linear infinite;">✨</div></div>';
  sfx('power');speak('Achievement unlocked! '+displayName,1.2,.95);
  setTimeout(function(){n.style.top='20px';},50);
  setTimeout(function(){n.style.top='-200px';setTimeout(processAchQueue,500);},3800);
}
// Helper: get total unlocked tier count for display
function achCount(){
  var c=0;
  ACHIEVEMENTS.forEach(function(a){
    if(a.tiers){var t=achTier(a);if(t>=0)c+=t+1;}
    else if(S.achievements[a.id])c++;
  });
  return c;
}
function achTotal(){
  var t=0;
  ACHIEVEMENTS.forEach(function(a){t+=a.tiers?a.tiers.length:1;});
  return t;
}
