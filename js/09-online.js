// ONLINE / GRADE SYSTEM
// ============================================================
var _onlineCache=[];
var _netStatus=false;
function checkNetwork(cb){
  try{
    var ctrl=new AbortController();
    setTimeout(function(){ctrl.abort();},3000);
    fetch('https://api.mathjs.org/v4/?expr=1%2B1',{signal:ctrl.signal,mode:'cors',cache:'no-store'}).then(function(r){
      _netStatus=r.ok;if(cb)cb(r.ok);updateNetIcon();
    }).catch(function(){
      // Fallback: try a lighter endpoint
      var c2=new AbortController();
      setTimeout(function(){c2.abort();},3000);
      fetch('https://dns.google/resolve?name=example.com',{signal:c2.signal,cache:'no-store'}).then(function(r){
        _netStatus=!!r;if(cb)cb(_netStatus);updateNetIcon();
      }).catch(function(){_netStatus=false;if(cb)cb(false);updateNetIcon();});
    });
  }catch(e){_netStatus=false;if(cb)cb(false);updateNetIcon();}
}
function updateNetIcon(){
  var el=$('net-icon');
  if(!el)return;
  el.textContent=_netStatus?'📶':'📵';
  el.style.color=_netStatus?'#22c55e':'#ef4444';
  el.style.textShadow=_netStatus?'0 0 8px #22c55e':'0 0 8px #ef4444';
}
function renderNetIcon(){
  var wrap=$('home-net');
  if(!wrap)return;
  wrap.innerHTML='';
  var icon=el('div','cursor:pointer;font-size:1.4rem;transition:transform .15s;','',
    {id:'net-icon',click:function(){sfx('tick');S.onlineMode=!S.onlineMode;save();renderNetIcon();updateNetIcon();if(S.onlineMode)checkNetwork();}});
  wrap.appendChild(icon);
  updateNetIcon();
  var lbl=el('div','font-size:7px;color:'+(S.onlineMode?(_netStatus?'#22c55e':'#f59e0b'):'#666')+';text-align:center;margin-top:2px;',
    S.onlineMode?(_netStatus?'ONLINE':'CHECKING...'):'OFFLINE');
  wrap.appendChild(lbl);
}
function fetchOnlineQuestions(grade,count){
  count=count||100;
  // Cap cache at 500 to avoid memory bloat
  if(_onlineCache.length>=500)_onlineCache=_onlineCache.slice(-300);
  var qs=[];
  var qs=[];
  for(var i=0;i<count;i++){
    var q=genGradeQuestion(grade);
    if(q)qs.push(q);
  }
  // If online, try to verify answers via mathjs (bonus confidence)
  if(_netStatus&&navigator.onLine){
    var promises=qs.map(function(q){
      if(!q._expr)return Promise.resolve(q);
      return fetch('https://api.mathjs.org/v4/?expr='+encodeURIComponent(q._expr),{mode:'cors'})
        .then(function(r){return r.text();})
        .then(function(ans){
          var num=parseFloat(ans);
          if(!isNaN(num)&&Math.abs(num-q.a)<0.01){q._verified=true;}
          return q;
        }).catch(function(){return q;});
    });
    return Promise.all(promises);
  }
  return Promise.resolve(qs);
}
function genGradeQuestion(grade){
  var pool;
  if(grade<=1)pool=['add','sub','evenodd','spatial','clock','lineup'];
  else if(grade<=2)pool=['add','sub','mul','money','word','evenodd','lineup'];
  else if(grade<=3)pool=['add','sub','mul','div','word','pattern','elapsed','money','spatial','multistep'];
  else if(grade<=4)pool=['mul','div','multistep','pattern','timediff','logic','word','spatial','money'];
  else if(grade<=5)pool=['mul','div','multistep','pattern','timediff','logic','word','spatial','money','lineup'];
  else pool=['multistep','pattern','timediff','logic','word','money','lineup','mul','div'];
  // Respect typeWeights=0 (OFF) and topicEnabled=false
  pool=pool.filter(function(t){
    var tw=S.typeWeights[t];return tw!==0&&S.topicEnabled[t]!==false;
  });
  if(!pool.length)pool=['add','sub'];
  var type=pick(pool);
  if(type==='add'||type==='sub'||type==='mul'||type==='div'){
    return genGradeArithmetic(grade,type);
  }
  var diffMap={1:1,2:2,3:4,4:6,5:8,6:10};
  var d=diffMap[grade]||3;
  if(GENS[type])return GENS[type](d);
  return genGradeArithmetic(grade,'add');
}
function genGradeArithmetic(grade,type){
  var opMap={add:'+',sub:'−',mul:'×',div:'÷'};
  var iconMap={add:'➕',sub:'➖',mul:'✖️',div:'➗'};
  var op=opMap[type];
  var a,b,ans,expr;
  if(type==='add'){
    var max=grade<=1?20:grade<=2?100:grade<=3?1000:grade<=4?10000:100000;
    a=rnd(1,max);b=rnd(1,max);ans=a+b;expr=a+'%2B'+b;
  }else if(type==='sub'){
    var max2=grade<=1?20:grade<=2?100:grade<=3?1000:10000;
    a=rnd(1,max2);b=rnd(1,a);ans=a-b;expr=a+'-'+b;
  }else if(type==='mul'){
    var maxA=grade<=1?5:grade<=2?10:grade<=3?12:grade<=4?20:grade<=5?25:30;
    var maxB=grade<=1?5:grade<=2?5:grade<=3?12:grade<=4?15:grade<=5?20:25;
    a=rnd(2,maxA);b=rnd(2,maxB);ans=a*b;expr=a+'*'+b;
  }else{
    var maxDiv=grade<=1?5:grade<=2?10:grade<=3?12:grade<=4?20:grade<=5?25:30;
    b=rnd(2,maxDiv);ans=rnd(2,maxDiv);a=b*ans;expr=a+'%2F'+b;
  }
  var wrongs=[];
  for(var j=0;j<3;j++){
    var off=rnd(1,Math.max(3,Math.abs(Math.floor(ans*0.15))));
    if(off<1)off=1;
    var w=ans+(Math.random()<0.5?off:-off);
    if(w!==ans&&wrongs.indexOf(w)===-1)wrongs.push(w);
    else{w=ans+rnd(1,10);if(w!==ans&&wrongs.indexOf(w)===-1)wrongs.push(w);else j--;}
  }
  return{type:type,key:'gq:'+grade+':'+a+op+b+':'+Math.random(),render:true,i:iconMap[type]||'📝',
    display:'<div class="eq-row"><span class="num-display">'+a+'</span><span class="op-sign">'+op+'</span><span class="num-display">'+b+'</span><span class="op-sign">=</span><span class="blank-box">?</span></div>',
    a:String(ans),ch:shuffle([String(ans)].concat(wrongs.map(String))),
    _expr:expr};
}
function getGradeLabel(g){var ages={1:'6-7',2:'7-8',3:'8-9',4:'9-10',5:'10-11',6:'11-12'};return 'Grade '+g+' ('+ages[g]+')';}

