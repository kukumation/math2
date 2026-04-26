// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded',function(){
  document.addEventListener('touchstart',function(){try{AC();}catch(e){}},{once:true,passive:true});
  document.addEventListener('click',function(){try{AC();}catch(e){}},{once:true});
  try{preloadSprites();}catch(e){}
  applyPendingRegen();startRegenTimer();autoBuiltCheck();
  S.playDays=S.playDays||new Set();
  var today=new Date().toISOString().slice(0,10);
  S.playDays.add(today);
  if(S.playDays.size>60){var arr=Array.from(S.playDays).sort();S.playDays=new Set(arr.slice(-60));}
  save();
  initHome();playBg('home');goTo('home');
  // Auto-check network and fetch questions on start
  checkNetwork(function(ok){
    if(ok){
      fetchOnlineQuestions(S.grade,100).then(function(qs){
        _onlineCache=_onlineCache.concat(qs);
        var fs=$('fetch-status');if(fs)fs.textContent='Cached: '+_onlineCache.length+' questions ready';
      });
    }
  });
});
