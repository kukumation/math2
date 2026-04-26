var SK='cmq8';
// Short key mapping for compressed saves
var _SK={c:'coins',tc:'totalCoins',mu:'maxUnlock',cp:'completed',ls:'levelStars',bd:'bossDefeated',bw:'bossWins',bg:'badges',pl:'partLevels',st:'stats',wt:'weights',wl:'wrongLog',te:'topicEnabled',td:'topicDiffLevel',tw:'typeWeights',mc:'maxCombo',ac:'achievements',so:'shopOwned',mh:'maxHp',ps:'potionStock',lw:'levelWinStreak',np:'noPotionCount',hp:'hp',hr:'hpRegenAt',ds:'decorSlots',hs:'hintStock',cs:'crystalStock',cq:'customQuestions',lt:'lastSaveTime',pd:'playDays',ts:'totalSpent',px:'phoenixStock',ld:'luckyDiceStock',tm:'treasureMapActive',om:'onlineMode',gr:'grade',ch:'character',tm2:'ttsMuted'};
var _SKR={};Object.keys(_SK).forEach(function(k){_SKR[_SK[k]]=k;});
function compressSave(obj){
  var o={};Object.keys(obj).forEach(function(k){var sk=_SKR[k]||k;var v=obj[k];if(v instanceof Set)v=Array.from(v);o[sk]=v;});
  var j=JSON.stringify(o);
  try{return btoa(unescape(encodeURIComponent(j)));}catch(e){return j;}
}
function decompressSave(raw){
  var j;try{j=decodeURIComponent(escape(atob(raw)));}catch(e){j=raw;}
  var o=JSON.parse(j);var out={};Object.keys(o).forEach(function(k){var lk=_SK[k]||k;out[lk]=o[k];});return out;
}
function load(){try{var r=localStorage.getItem(SK);return r?decompressSave(r):null;}catch(e){try{var r2=localStorage.getItem(SK);return r2?JSON.parse(r2):null;}catch(e2){return null;}}}
function save(){
  try{
    S.lastSaveTime=Date.now();
    var obj={
      coins:S.coins,totalCoins:S.totalCoins,maxUnlock:S.maxUnlock,
      completed:Array.from(S.completed),levelStars:S.levelStars,
      bossDefeated:Array.from(S.bossDefeated),bossWins:S.bossWins,
      badges:S.badges,partLevels:S.partLevels,stats:S.stats,weights:S.weights,
      wrongLog:S.wrongLog.slice(0,80),topicEnabled:S.topicEnabled,
      topicDiffLevel:S.topicDiffLevel,typeWeights:S.typeWeights,
      maxCombo:S.maxCombo,achievements:S.achievements,shopOwned:S.shopOwned,
      maxHp:S.maxHp,potionStock:S.potionStock,levelWinStreak:S.levelWinStreak,
      noPotionCount:S.noPotionCount,hp:S.hp,hpRegenAt:S.hpRegenAt,
      decorSlots:S.decorSlots,hintStock:S.hintStock,crystalStock:S.crystalStock,
      customQuestions:(S.customQuestions||[]).slice(0,50),lastSaveTime:S.lastSaveTime,
      playDays:S.playDays?Array.from(S.playDays):[],totalSpent:S.totalSpent||0,
      phoenixStock:S.phoenixStock||0,luckyDiceStock:S.luckyDiceStock||0,
      treasureMapActive:S.treasureMapActive||false,
      onlineMode:S.onlineMode!==undefined?S.onlineMode:true,grade:S.grade||1,character:S.character||'🧒',ttsMuted:S.ttsMuted||false
    };
    localStorage.setItem(SK,compressSave(obj));
    showSaveIndicator();
  }catch(e){}
}
function showSaveIndicator(){
  var ind=$('save-indicator');if(!ind)return;
  ind.style.opacity='1';ind.textContent='SAVED';
  setTimeout(function(){ind.classList.add('fade');},1200);
  setTimeout(function(){ind.style.opacity='0';ind.classList.remove('fade');},1800);
  updateSaveTimeUI();
}
function updateSaveTimeUI(){
  var el=$('save-time');if(!el)return;
  if(S.lastSaveTime){var d=new Date(S.lastSaveTime);el.textContent='Last save: '+d.toLocaleString();}
  else el.textContent='Not saved yet';
}
