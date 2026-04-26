var sv=load()||{};
var ALL_TYPES=['add','sub','mul','div','pattern','multistep','word','clock','elapsed','timediff','spatial','logic','money','evenodd','lineup','rotshape','shadow','shapeseq','oddone','mirror','fraction','decimal','percent','ratio','algebra','negative','probability','statistics','angle','area_perimeter'];
var GRADE_TYPES={
  1:['add','sub','evenodd','spatial','clock','lineup','shapeseq','oddone','rotshape','mirror'],
  2:['add','sub','mul','money','word','evenodd','lineup','clock','shapeseq','oddone','rotshape','shadow','mirror','fraction'],
  3:['add','sub','mul','div','word','pattern','elapsed','money','spatial','multistep','lineup','shapeseq','oddone','rotshape','shadow','mirror','fraction','area_perimeter'],
  4:['mul','div','multistep','pattern','timediff','logic','word','spatial','money','elapsed','shapeseq','oddone','rotshape','shadow','mirror','fraction','decimal','angle','area_perimeter'],
  5:['mul','div','multistep','pattern','timediff','logic','word','spatial','money','lineup','elapsed','shapeseq','oddone','rotshape','shadow','mirror','fraction','decimal','percent','ratio','probability','statistics','angle','area_perimeter','algebra'],
  6:['multistep','pattern','timediff','logic','word','money','lineup','mul','div','spatial','shapeseq','oddone','rotshape','shadow','mirror','fraction','decimal','percent','ratio','algebra','negative','probability','statistics','angle','area_perimeter']
};
// Default weights per grade: active types get weight 3, inactive get 0
var GRADE_DEFAULT_WEIGHTS={
  1:{add:5,sub:5,evenodd:3,spatial:3,clock:3,lineup:2,shapeseq:2,oddone:2,rotshape:2,mirror:2,mul:0,div:0,pattern:0,multistep:0,word:0,elapsed:0,timediff:0,logic:0,money:0,shadow:0,fraction:0,decimal:0,percent:0,ratio:0,algebra:0,negative:0,probability:0,statistics:0,angle:0,area_perimeter:0},
  2:{add:4,sub:4,mul:4,money:3,word:3,evenodd:2,lineup:2,clock:3,shapeseq:2,oddone:2,rotshape:2,shadow:2,mirror:2,fraction:2,div:0,pattern:0,multistep:0,elapsed:0,timediff:0,logic:0,spatial:0,decimal:0,percent:0,ratio:0,algebra:0,negative:0,probability:0,statistics:0,angle:0,area_perimeter:0},
  3:{add:3,sub:3,mul:3,div:3,word:3,pattern:2,elapsed:2,money:2,spatial:2,multistep:2,lineup:2,shapeseq:2,oddone:2,rotshape:2,shadow:2,mirror:2,fraction:3,area_perimeter:2,evenodd:0,timediff:0,logic:0,clock:0,decimal:0,percent:0,ratio:0,algebra:0,negative:0,probability:0,statistics:0,angle:0},
  4:{mul:4,div:4,multistep:3,pattern:3,timediff:2,logic:3,word:3,spatial:2,money:2,elapsed:2,shapeseq:2,oddone:2,rotshape:2,shadow:2,mirror:2,fraction:3,decimal:3,angle:3,area_perimeter:3,add:0,sub:0,evenodd:0,clock:0,lineup:0,percent:0,ratio:0,algebra:0,negative:0,probability:0,statistics:0},
  5:{mul:3,div:3,multistep:4,pattern:3,timediff:3,logic:4,word:3,spatial:2,money:2,lineup:2,elapsed:2,shapeseq:2,oddone:2,rotshape:2,shadow:2,mirror:2,fraction:3,decimal:3,percent:3,ratio:3,probability:2,statistics:3,angle:2,area_perimeter:2,algebra:3,add:0,sub:0,evenodd:0,clock:0,negative:0},
  6:{multistep:5,pattern:4,timediff:3,logic:5,word:4,money:2,lineup:2,mul:3,div:3,spatial:2,shapeseq:2,oddone:2,rotshape:2,shadow:2,mirror:2,fraction:3,decimal:3,percent:3,ratio:3,algebra:4,negative:3,probability:3,statistics:3,angle:2,area_perimeter:2,add:0,sub:0,evenodd:0,clock:0,elapsed:0}
};
function getGradeTypes(){return GRADE_TYPES[S.grade]||GRADE_TYPES[6];}
function getGradeActiveSet(){var gt=GRADE_TYPES[S.grade]||GRADE_TYPES[6];var s={};gt.forEach(function(t){s[t]=true;});return s;}
function applyGradeDefaults(){
  var defs=GRADE_DEFAULT_WEIGHTS[S.grade]||GRADE_DEFAULT_WEIGHTS[6];
  ALL_TYPES.forEach(function(t){
    S.typeWeights[t]=defs[t]!==undefined?defs[t]:3;
    if(defs[t]===0)S.topicEnabled[t]=false;
    else S.topicEnabled[t]=true;
  });
}
var _topicEnabled={};
ALL_TYPES.forEach(function(t){_topicEnabled[t]=true;});
if(sv.topicEnabled)Object.keys(sv.topicEnabled).forEach(function(k){_topicEnabled[k]=sv.topicEnabled[k];});
var _topicDiffLevel={};
ALL_TYPES.forEach(function(t){_topicDiffLevel[t]=1;});
if(sv.topicDiffLevel)Object.keys(sv.topicDiffLevel).forEach(function(k){_topicDiffLevel[k]=sv.topicDiffLevel[k];});
var _typeWeights={};
ALL_TYPES.forEach(function(t){_typeWeights[t]=3;});
if(sv.typeWeights)Object.keys(sv.typeWeights).forEach(function(k){_typeWeights[k]=sv.typeWeights[k];});

var _maxHp=sv.maxHp||3;
var _savedHp=sv.hp!=null?sv.hp:_maxHp;
var _defaultDecorSlots=[];
for(var _i=0;_i<8;_i++)_defaultDecorSlots.push(null);
var _defaultWeights={};
ALL_TYPES.forEach(function(t){_defaultWeights[t]=1;});

var S={
  coins:sv.coins||0,totalCoins:sv.totalCoins||0,
  maxUnlock:sv.maxUnlock||{0:0},
  completed:new Set(sv.completed||[]),levelStars:sv.levelStars||{},
  bossDefeated:new Set(sv.bossDefeated||[]),bossWins:sv.bossWins||{},
  badges:sv.badges||[],partLevels:sv.partLevels||{},stats:sv.stats||{},
  weights:Object.assign({},_defaultWeights,sv.weights||{}),
  wrongLog:sv.wrongLog||[],topicEnabled:_topicEnabled,topicDiffLevel:_topicDiffLevel,
  typeWeights:_typeWeights,muted:false,ttsMuted:sv.ttsMuted||false,screen:'home',region:0,level:0,
  questions:[],qIdx:0,levelWrong:0,answered:false,
  hp:_savedHp,maxHp:_maxHp,potionStock:sv.potionStock||0,
  hintStock:sv.hintStock||0,crystalStock:sv.crystalStock||0,
  hpRegenAt:sv.hpRegenAt||null,
  decorSlots:sv.decorSlots||_defaultDecorSlots,
  bossHP:6,playerHP:3,bossQ:null,bossAnswered:false,bossUsedKeys:new Set(),
  blTab:'castle',parTab:'overview',pinInput:'',newUnlocks:[],
  combo:0,maxCombo:sv.maxCombo||0,sessionMaxCombo:0,
  achievements:sv.achievements||{},shopOwned:sv.shopOwned||{},
  bossTimerVal:30,bossTimerInterval:null,
  levelWinStreak:sv.levelWinStreak||0,noPotionCount:sv.noPotionCount||0,
  lastTypes:[],practiceEntry:null,
  customQuestions:sv.customQuestions||[],
  lastSaveTime:sv.lastSaveTime||null,
  playDays:sv.playDays?new Set(sv.playDays):new Set(),
  totalSpent:sv.totalSpent||0,
  phoenixStock:sv.phoenixStock||0,luckyDiceStock:sv.luckyDiceStock||0,
  treasureMapActive:sv.treasureMapActive||false,
  onlineMode:sv.onlineMode!==undefined?sv.onlineMode:true,grade:sv.grade||1,character:sv.character||'🧒',
  sessionUsedKeys:new Set()
};
// On first load with new code, force grade defaults so old saves don't
// keep all types enabled. We track migration in a separate localStorage key.
var _migrated=localStorage.getItem('cmq8_gv2');
if(!_migrated){
  applyGradeDefaults();
  save();
  try{localStorage.setItem('cmq8_gv2','1');}catch(e){}
}

var QPL=5,QPB=6,PIN='1234',MAX_PART_LEVEL=5;
var HP_REGEN_MS=5*60*1000;

// HP REGEN
var _regenInterval=null;
function applyPendingRegen(){
  if(S.hp>=S.maxHp){S.hpRegenAt=null;return;}
  if(!S.hpRegenAt){S.hpRegenAt=Date.now()+HP_REGEN_MS;save();return;}
  var now=Date.now();
  while(S.hp<S.maxHp&&now>=S.hpRegenAt){
    S.hp=Math.min(S.hp+1,S.maxHp);
    S.hpRegenAt=S.hp<S.maxHp?S.hpRegenAt+HP_REGEN_MS:null;
  }
  save();
}
function startRegenTimer(){
  if(_regenInterval)return;
  _regenInterval=setInterval(function(){
    if(S.hp>=S.maxHp){S.hpRegenAt=null;updateRegenUI();return;}
    if(!S.hpRegenAt){S.hpRegenAt=Date.now()+HP_REGEN_MS;save();}
    if(Date.now()>=S.hpRegenAt){
      S.hp=Math.min(S.hp+1,S.maxHp);
      S.hpRegenAt=S.hp<S.maxHp?Date.now()+HP_REGEN_MS:null;
      save();updateHpUI();updateRegenUI();
      toast('g-toast','Heart restored!',2000);
      if(S.screen==='fail')showFail();
      if(S.screen==='home')initHome();
    }else{updateRegenUI();}
  },1000);
}
function getRegenCountdown(){
  if(S.hp>=S.maxHp||!S.hpRegenAt)return null;
  var ms=Math.max(0,S.hpRegenAt-Date.now());
  var m=Math.floor(ms/60000),sec=Math.floor((ms%60000)/1000);
  return m+':'+(sec<10?'0'+sec:sec);
}
function updateRegenUI(){
  var cd=getRegenCountdown();
  var gr=$('g-regen');
  if(gr){gr.style.display=cd?'inline-flex':'none';if(cd)gr.textContent=cd;}
  var hrb=$('home-regen-bar');
  if(hrb){
    if(cd&&S.hp<S.maxHp){
      hrb.innerHTML='<div style="background:rgba(239,68,68,.15);border:2px solid #7f1d1d;border-radius:10px;padding:9px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:1.4rem">❤️</span><div style="flex:1"><div style="font-size:10px;color:#f87171">Hearts: '+S.hp+'/'+S.maxHp+'</div><div style="font-family:system-ui;font-size:12px;color:#888;margin-top:2px">+1 heart in '+cd+'</div></div><div style="font-size:14px;font-weight:bold;color:#f87171">'+cd+'</div></div>';
    }else{hrb.innerHTML='';}
  }
}
function renderFailRegenBox(){
  var box=$('fail-regen-box');if(!box)return;
  var cd=getRegenCountdown();
  if(S.hp>0){box.innerHTML='<div style="color:#22c55e;font-size:12px;font-family:var(--px)">Hearts available! Ready to play!</div>';return;}
  if(S.potionStock>0){box.innerHTML='<div style="color:#fca5a5;font-size:12px">You have <b>'+S.potionStock+'</b> potion'+(S.potionStock>1?'s':'')+' — use one!</div>';return;}
  var cdPart=cd?'<span style="color:#fbbf24">Free heart in <b style="font-size:16px">'+cd+'</b></span><br>':'';
  box.innerHTML='<div style="color:#888;font-size:11px;line-height:1.8">No hearts and no potions.<br>'+cdPart+'Buy a Life Potion in the Shop!</div>';
}

// WORLDS
var WORLDS=[
  {name:'Mushroom Kingdom',sub:'Where every hero begins',icon:'🍄',boss:'🌿',bossName:'Vine Colossus',bgClass:'wb0',nodeColor:'#22c55e',hdrGrad:'linear-gradient(135deg,#22c55e,#15803d)',badge:{e:'🦊',name:'Meadow Fox',desc:'Guardian of green pastures'},intro:'I am the Vine Colossus!',win:'Vines crumble! True hero!',lose:'Train harder!'},
  {name:'Koopa Beach',sub:'Dive into shimmering depths',icon:'🌊',boss:'🦈',bossName:'Reef Shark',bgClass:'wb1',nodeColor:'#38bdf8',hdrGrad:'linear-gradient(135deg,#0ea5e9,#0369a1)',badge:{e:'🐬',name:'Dolphin Rider',desc:'Master of the waves'},intro:'Surrender to the deep!',win:'You calmed the seas!',lose:'Swept away!'},
  {name:'Lava Ridge',sub:'Face the volcanic fury',icon:'🌋',boss:'🐉',bossName:'Magma Dragon',bgClass:'wb2',nodeColor:'#f97316',hdrGrad:'linear-gradient(135deg,#ef4444,#b91c1c)',badge:{e:'🔥',name:'Fire Drake',desc:'Conqueror of the inferno'},intro:'Numbers mean nothing here!',win:'Doused by math!',lose:'Melted!'},
  {name:'Ice Land',sub:'Conquer the icy realm',icon:'❄️',boss:'🧊',bossName:'Frost Colossus',bgClass:'wb3',nodeColor:'#818cf8',hdrGrad:'linear-gradient(135deg,#818cf8,#4f46e5)',badge:{e:'🦄',name:'Frost Unicorn',desc:'Champion of the tundra'},intro:"I'll freeze your mind!",win:'Thawed by brilliance!',lose:'Frozen!'},
  {name:'Sky World',sub:'Soar above the clouds',icon:'☁️',boss:'🦅',bossName:'Sky Warden',bgClass:'wb4',nodeColor:'#38bdf8',hdrGrad:'linear-gradient(135deg,#38bdf8,#0284c7)',badge:{e:'🦋',name:'Sky Dancer',desc:'Lord of the heavens'},intro:'None shall pass the sky!',win:'You soar highest!',lose:'Shot down!'},
  {name:"Bowser's Keep",sub:'Decode the final darkness',icon:'🏰',boss:'👑',bossName:'Dark King',bgClass:'wb5',nodeColor:'#a855f7',hdrGrad:'linear-gradient(135deg,#a855f7,#7e22ce)',badge:{e:'🌙',name:'Dark Conqueror',desc:'Slayer of the final boss'},intro:'Darkness consumes all!',win:'Light prevails!',lose:'Swallowed!'}
];
var EXTRA_WORLDS=[
  {name:'Crystal Caves',sub:'Glittering treasures await',icon:'💎',boss:'🦎',bossName:'Crystal Lizard',bgClass:'wb3',nodeColor:'#38bdf8',hdrGrad:'linear-gradient(135deg,#38bdf8,#0e7490)',badge:{e:'💎',name:'Crystal Gem',desc:'Found the deepest treasure'},intro:"You'll never escape!",win:'Crystals shatter!',lose:'Crystallized!'},
  {name:'Thunder Peak',sub:'Brave the storm heights',icon:'⚡',boss:'🦅',bossName:'Storm Eagle',bgClass:'wb5',nodeColor:'#a78bfa',hdrGrad:'linear-gradient(135deg,#a78bfa,#6d28d9)',badge:{e:'⚡',name:'Thunder Wing',desc:'Flew through the storm'},intro:'The storm shall silence you!',win:'Lightning fears you!',lose:'Struck down!'},
  {name:'Enchanted Forest',sub:'Magic trees hide secrets',icon:'🌲',boss:'🐗',bossName:'Shadow Boar',bgClass:'wb6',nodeColor:'#4ade80',hdrGrad:'linear-gradient(135deg,#4ade80,#16a34a)',badge:{e:'🍃',name:'Forest Spirit',desc:'Heard the trees whisper'},intro:'The forest will swallow you!',win:'Light breaks through!',lose:'Lost in shadows!'},
  {name:'Sunken Temple',sub:'Ancient math lurks below',icon:'🏛️',boss:'🐙',bossName:'Ink Kraken',bgClass:'wb1',nodeColor:'#22d3ee',hdrGrad:'linear-gradient(135deg,#22d3ee,#0284c7)',badge:{e:'🐚',name:'Pearl Diver',desc:'Found the sunken secrets'},intro:'My ink clouds your mind!',win:'The temple bows!',lose:'Dragged to the deep!'},
  {name:'Molten Core',sub:'The hottest challenge',icon:'🌋',boss:'🔥',bossName:'Fire Elemental',bgClass:'wb2',nodeColor:'#fb923c',hdrGrad:'linear-gradient(135deg,#fb923c,#c2410c)',badge:{e:'🌋',name:'Magma Heart',desc:'Survived the core'},intro:'Heat melts your brain!',win:'Forged in fire!',lose:'Melted to nothing!'},
  {name:'Frost Citadel',sub:'Only the sharpest mind wins',icon:'❄️',boss:'🐺',bossName:'Ice Wolf',bgClass:'wb3',nodeColor:'#93c5fd',hdrGrad:'linear-gradient(135deg,#93c5fd,#3b82f6)',badge:{e:'🐺',name:'Frost Fang',desc:'Bested the frozen wilds'},intro:'Your mind will freeze!',win:'Your wit melted the ice!',lose:'Frozen solid!'}
];
var ALL_WORLD_TEMPLATES=WORLDS.concat(EXTRA_WORLDS);
function getWorldData(i){
  var t=ALL_WORLD_TEMPLATES[i%ALL_WORLD_TEMPLATES.length];
  var cycle=Math.floor(i/ALL_WORLD_TEMPLATES.length);
  if(cycle===0)return t;
  var prefixes=['','Ancient ','Dark ','Legendary ','Mythic '];
  var pre=prefixes[cycle%prefixes.length];
  return Object.assign({},t,{name:pre+t.name,bossName:pre+t.bossName,badge:Object.assign({},t.badge,{name:pre+t.badge.name})});
}
function maxWorldIndex(){var m=0;S.bossDefeated.forEach(function(i){if(i+1>m)m=i+1;});return m;}
var LNAMES=['Pebble Path','Old Mill','Mossy Bridge','Firefly Glen','Foggy Trail','Ancient Well','Tall Spire','Echo Cliff','Summit Edge','Final Gate'];
var TINFO={
  add:{l:'Addition',s:'Add',i:'➕',tip:'Count on from the larger number!'},
  sub:{l:'Subtraction',s:'Sub',i:'➖',tip:'Count up from the smaller number.'},
  mul:{l:'Multiplication',s:'Mul',i:'✖️',tip:'Think of it as repeated groups!'},
  div:{l:'Division',s:'Div',i:'➗',tip:'How many groups fit into the total?'},
  pattern:{l:'Patterns',s:'Pat',i:'🔮',tip:'Find the rule — add, subtract, multiply?'},
  multistep:{l:'Multi-Step',s:'Multi',i:'🧮',tip:'Work step by step.'},
  word:{l:'Word Problems',s:'Word',i:'📖',tip:'Underline the numbers and key words.'},
  clock:{l:'Read the Clock',s:'Time',i:'🕐',tip:'Short hand = hours, long hand = minutes.'},
  elapsed:{l:'Elapsed Time',s:'Elpsd',i:'⏰',tip:'Count forward in hours!'},
  timediff:{l:'Time Difference',s:'TDiff',i:'⏱️',tip:'Subtract the earlier from the later time.'},
  length:{l:'Length Compare',s:'Len',i:'📏',tip:'Longer bar = bigger number!'},
  spatial:{l:'Shapes & Space',s:'Shape',i:'🔷',tip:'Look carefully at sides and symmetry.'},
  logic:{l:'Logic',s:'Logic',i:'🧩',tip:'Eliminate wrong answers step by step.'},
  money:{l:'Money',s:'$',i:'💰',tip:'Add up coins, then subtract price.'},
  evenodd:{l:'Even & Odd',s:'E/O',i:'🎲',tip:'Even ends in 0,2,4,6,8!'},
  compare:{l:'Compare Numbers',s:'Cmp',i:'⚖️',tip:'Put numbers on a number line!'},
  lineup:{l:'Queue & Order',s:'Queue',i:'👫',tip:'Count front + self + back!'},
  rotshape:{l:'Shape Rotation',s:'Rotate',i:'🔄',tip:'Imagine the shape turning in your mind!'},
  shadow:{l:'Shadow Match',s:'Shadow',i:'🌑',tip:'Look at the outline — which shape casts this shadow?'},
  shapeseq:{l:'Shape Patterns',s:'SPat',i:'🔶',tip:'Find what changes: shape, color, size, or position!'},
  oddone:{l:'Odd One Out',s:'Odd1',i:'🕵️',tip:'What makes one different from the rest?'},
  mirror:{l:'Mirror Image',s:'Mirror',i:'🪞',tip:'Flip it like looking in a mirror!'},
  fraction:{l:'Fractions',s:'Frac',i:'🍕',tip:'How many pieces out of the total?'},
  decimal:{l:'Decimals',s:'Dec',i:'🔢',tip:'The dot separates whole from parts!'},
  percent:{l:'Percentages',s:'%',i:'📈',tip:'Percent means per hundred!'},
  ratio:{l:'Ratios',s:'Ratio',i:'⚖️',tip:'Compare two amounts side by side!'},
  algebra:{l:'Algebra',s:'Alg',i:'🔤',tip:'Find the mystery number!'},
  negative:{l:'Negative Numbers',s:'Neg',i:'🌡️',tip:'Numbers below zero — think of a thermometer!'},
  probability:{l:'Probability',s:'Prob',i:'🎯',tip:'How likely is it to happen?'},
  statistics:{l:'Statistics',s:'Stats',i:'📊',tip:'Find the average, middle, or most common!'},
  angle:{l:'Angles',s:'Angle',i:'📐',tip:'Think about how far the lines open up!'},
  area_perimeter:{l:'Area & Perimeter',s:'Area',i:'📐',tip:'Perimeter = around the edge, Area = inside!'}
};

// ============================================================
// CASTLE PARTS — ordered construction sequence
// ============================================================
var CASTLE_PARTS=[
  // --- GROUND & BASE (always visible) ---
  {id:'grnd',ord:0,r:6,c:0,w:9,label:'Castle Grounds',e:'🌿',bg:'#2D5A1B',free:true,desc:'The fertile ground on which all castles are built.',fun:'Even the mightiest fortress begins with a patch of grass!'},
  // --- FOUNDATION (levels 2-4) ---
  {id:'fl',ord:1,r:5,c:0,w:3,label:'Left Foundation',e:'🪨',bg:'#C4A875',req:{levels:2},cost:0,desc:'Solid stone anchors the left side.',fun:'Takes 300 workers two months to lay the foundations!'},
  {id:'fc',ord:2,r:5,c:3,w:3,label:'Centre Foundation',e:'🪨',bg:'#C4A875',req:{levels:3},cost:0,desc:'The heart of your castle rests here.',fun:'Deeper foundations mean taller buildings!'},
  {id:'fr',ord:3,r:5,c:6,w:3,label:'Right Foundation',e:'🪨',bg:'#C4A875',req:{levels:4},cost:0,desc:'The right side is now anchored.',fun:'Balance is key — a lopsided castle topples!'},
  // --- LOWER WALLS (levels 5-7) ---
  {id:'wl',ord:4,r:4,c:0,w:3,label:'Left Wall',e:'🧱',bg:'#9B8365',req:{levels:5},cost:0,desc:'Strong stone walls protect the left flank.',fun:'Each stone was carried up by hand!'},
  {id:'wr',ord:5,r:4,c:6,w:3,label:'Right Wall',e:'🧱',bg:'#9B8365',req:{levels:6},cost:0,desc:'The right wall stands firm.',fun:'Arrow slits let archers shoot unseen!'},
  {id:'gate',ord:6,r:4,c:3,w:3,label:'Castle Gate',e:'🚪',bg:'#2A2A2A',req:{levels:7},cost:0,desc:'The main oak-and-iron gate.',fun:'The portcullis gate weighs as much as 3 cars!'},
  // --- UPPER WALLS (levels 9-11) ---
  {id:'uwl',ord:7,r:3,c:0,w:3,label:'Upper Left Wall',e:'🧱',bg:'#8B7355',req:{levels:9},cost:0,desc:'Walls reach the second level!',fun:'From here you can see the entire kingdom!'},
  {id:'arch',ord:8,r:3,c:3,w:3,label:'Gate Arch',e:'🏰',bg:'#4A3220',req:{boss:0},cost:0,desc:'An impressive arched gateway above the entrance.',fun:'The arch is one of the strongest shapes ever invented!'},
  {id:'uwr',ord:9,r:3,c:6,w:3,label:'Upper Right Wall',e:'🧱',bg:'#8B7355',req:{levels:11},cost:0,desc:'The upper right wall stands tall.',fun:'Guards patrol these walls day and night!'},
  // --- TOWERS (boss 1) ---
  {id:'ltm',ord:10,r:2,c:0,w:3,label:'Left Tower',e:'🗼',bg:'#7A7A7A',req:{boss:1},cost:60,desc:'A tall tower watches over the western lands.',fun:'Towers could be 30 metres tall — 10 stories!'},
  {id:'batt',ord:11,r:2,c:3,w:3,label:'Battlements',e:'⚔️',bg:'#5A5A5A',req:{levels:16},cost:0,desc:'The crenellated top edge of the walls.',fun:'The gaps let archers shoot and duck for cover!'},
  {id:'rtm',ord:12,r:2,c:6,w:3,label:'Right Tower',e:'🗼',bg:'#7A7A7A',req:{boss:1},cost:60,desc:'A matching tower guards the east.',fun:'Two towers create a deadly crossfire!'},
  // --- TOWER TOPS & SPIRE (boss 2) ---
  {id:'ltt',ord:13,r:1,c:0,w:3,label:'Left Tower Top',e:'🏯',bg:'#8B3A3A',req:{boss:2},cost:90,desc:'The pointed roof of the left tower.',fun:'Conical roofs came from French castles in the 12th century!'},
  {id:'spir',ord:14,r:1,c:3,w:3,label:'Castle Spire',e:'⭐',bg:'#9B6540',req:{boss:2},cost:80,desc:'A grand spire rises above the great hall.',fun:'Spires were built to look like they touched the heavens!'},
  {id:'rtt',ord:15,r:1,c:6,w:3,label:'Right Tower Top',e:'🏯',bg:'#8B3A3A',req:{boss:2},cost:90,desc:'The right tower is fully complete!',fun:"Matching towers show the kingdom's great wealth!"},
  // --- MOAT (boss 2) ---
  {id:'moat',ord:16,r:7,c:0,w:9,label:'Castle Moat',e:'🌊',bg:'#1565C0',req:{boss:2},cost:40,desc:'A water-filled ditch — your first line of defence!',fun:'No crocodiles included... probably.'},
  // --- OUTER GATE (boss 3) ---
  {id:'og_l',ord:17,r:8,c:0,w:2,label:'Outer Gate Left',e:'🧱',bg:'#4A3000',req:{boss:3},cost:50,desc:'Outer gate left pillar.',fun:'Outer walls add a whole extra layer of protection!'},
  {id:'portc',ord:18,r:8,c:2,w:5,label:'Portcullis',e:'⚙️',bg:'#2a2000',req:{boss:3},cost:70,desc:'A heavy iron gate that drops to stop invaders.',fun:'The portcullis was like a medieval door lock!'},
  {id:'og_r',ord:19,r:8,c:7,w:2,label:'Outer Gate Right',e:'🧱',bg:'#4A3000',req:{boss:3},cost:50,desc:'Outer gate right pillar.',fun:'Symmetry makes a castle look even more impressive!'},
  // --- CROWN (boss 5) ---
  {id:'crown',ord:20,r:0,c:3,w:3,label:'Royal Crown',e:'👑',bg:'#8B0000',req:{boss:5},cost:0,desc:'The ultimate symbol of a completed kingdom!',fun:'Only the mightiest math champion earns a crown!'},
  // --- KEEP BUILDINGS (boss 3+) ---
  {id:'stables',ord:21,r:9,c:0,w:3,label:'Royal Stables',e:'🐴',bg:'#3a2800',req:{boss:2,levels:18},cost:55,desc:"Where the castle's horses prepare for battle.",fun:"A knight's horse was worth more than a whole village!"},
  {id:'train',ord:22,r:9,c:3,w:3,label:'Training Yard',e:'🏋️',bg:'#2a2a00',req:{boss:2,levels:20},cost:45,desc:'Where brave knights practice every day.',fun:'Knights trained for 7 years before earning their title!'},
  {id:'armory',ord:23,r:9,c:6,w:3,label:'Armory',e:'🗡️',bg:'#2a0000',req:{boss:2,levels:22},cost:60,desc:'A room full of weapons, armour, and shields.',fun:'A full suit of armour weighed 25 kg!'},
  {id:'dungeon',ord:24,r:10,c:0,w:3,label:'Dungeon',e:'⛓️',bg:'#0a0a0a',req:{boss:3,levels:25},cost:35,desc:'A dark dungeon beneath the castle.',fun:'Dungeons were often used to store food, not prisoners!'},
  {id:'hall',ord:25,r:10,c:3,w:3,label:'Great Hall',e:'🍽️',bg:'#3a2000',req:{boss:3,levels:26},cost:80,desc:'The grand feasting hall where the king holds court.',fun:'Great halls could fit 500 guests for a royal feast!'},
  {id:'library',ord:26,r:10,c:6,w:3,label:'Royal Library',e:'📚',bg:'#1a1a3a',req:{boss:3,levels:28},cost:70,desc:'A library of ancient scrolls and books.',fun:'In medieval times, one book cost as much as a farm!'},
  {id:'chapel',ord:27,r:11,c:0,w:5,label:'Castle Chapel',e:'⛪',bg:'#2a2a2a',req:{boss:4,levels:30},cost:75,desc:'A sacred chapel where the royal family prays.',fun:'Chapels were built in every castle for good luck!'},
  {id:'gardens',ord:28,r:11,c:5,w:4,label:'Royal Gardens',e:'🌷',bg:'#1a3a10',req:{boss:4,levels:32},cost:65,desc:'Beautiful gardens blooming year-round.',fun:'The castle gardens were used to grow medicine too!'},
  {id:'flag_l',ord:29,r:12,c:0,w:3,label:'Royal Flag',e:'🚩',bg:'#4a0000',req:{boss:5,levels:38},cost:30,desc:'The royal flag flies high above the outer walls.',fun:'Flags showed which kingdom the castle belonged to!'},
  {id:'market',ord:30,r:12,c:3,w:3,label:'Castle Market',e:'🏪',bg:'#3a2a00',req:{boss:5,levels:40},cost:90,desc:'A bustling market at the castle gates.',fun:'Castle markets were the supermarkets of the Middle Ages!'},
  {id:'flag_r',ord:31,r:12,c:6,w:3,label:'Victory Flag',e:'🏴',bg:'#00004a',req:{boss:5,levels:42},cost:30,desc:'A second flag signals total victory!',fun:'Double flags meant the castle was unconquerable!'},
  {id:'cannon_l',ord:32,r:13,c:0,w:3,label:'Left Cannon',e:'💣',bg:'#2a2a2a',req:{boss:4,levels:35},cost:55,desc:'A fearsome cannon guards the left flank.',fun:'Medieval cannons could fire a stone ball 500 metres!'},
  {id:'cannon_r',ord:33,r:13,c:6,w:3,label:'Right Cannon',e:'💣',bg:'#2a2a2a',req:{boss:4,levels:36},cost:55,desc:'A matching cannon on the right flank.',fun:'It took a crew of 5 men to fire a medieval cannon!'},
  {id:'throne',ord:34,r:13,c:3,w:3,label:'Throne Room',e:'👸',bg:'#4a0050',req:{boss:5,levels:44},cost:120,desc:'The magnificent throne room of the royal palace.',fun:'The throne was always placed on a raised platform!'},
  {id:'tower_secret',ord:35,r:14,c:0,w:4,label:'Secret Tower',e:'🕵️',bg:'#1a1a1a',req:{boss:5,levels:46},cost:100,desc:'A hidden tower known only to the king.',fun:'Secret passages were built into almost every castle!'},
  {id:'treasury',ord:36,r:14,c:5,w:4,label:'Royal Treasury',e:'💎',bg:'#3a2800',req:{boss:5,levels:48},cost:150,desc:'The vault where royal riches are stored.',fun:'The Crown Jewels are still kept in the Tower of London!'},
];
CASTLE_PARTS.forEach(function(p){if(p.free&&!S.partLevels[p.id])S.partLevels[p.id]=MAX_PART_LEVEL;});

// Castle visual grid layout (rows top→bottom, each cell has {id,span})
var CASTLE_ROWS=[
  [{id:'crown',span:3},{id:'crown',span:3},{id:'crown',span:3}],
  [{id:'ltt',span:3},{id:'spir',span:3},{id:'rtt',span:3}],
  [{id:'ltm',span:3},{id:'batt',span:3},{id:'rtm',span:3}],
  [{id:'uwl',span:3},{id:'arch',span:3},{id:'uwr',span:3}],
  [{id:'wl',span:3},{id:'gate',span:3},{id:'wr',span:3}],
  [{id:'fl',span:3},{id:'fc',span:3},{id:'fr',span:3}],
  [{id:'grnd',span:9}],
  [{id:'moat',span:9}],
  [{id:'og_l',span:2},{id:'portc',span:5},{id:'og_r',span:2}],
  [{id:'stables',span:3},{id:'train',span:3},{id:'armory',span:3}],
  [{id:'dungeon',span:3},{id:'hall',span:3},{id:'library',span:3}],
  [{id:'chapel',span:5},{id:'gardens',span:4}],
  [{id:'flag_l',span:3},{id:'market',span:3},{id:'flag_r',span:3}],
  [{id:'cannon_l',span:3},{id:'throne',span:3},{id:'cannon_r',span:3}],
  [{id:'tower_secret',span:4},{id:'treasury',span:4},{id:'',span:1}]
];
var CASTLE_ROW_H=[30,42,42,36,46,34,30,26,28,28,28,26,24,30,30];
var CASTLE_VIS={
  ltt:{bg:'#8B3A3A',bgu:'#1a1a1a',e:'🏯'},
  spir:{bg:'#9B6540',bgu:'#1a1a1a',e:'⭐'},
  rtt:{bg:'#8B3A3A',bgu:'#1a1a1a',e:'🏯'},
  ltm:{bg:'#7A7A7A',bgu:'#1a1a1a',e:'🗼'},
  batt:{bg:'#555555',bgu:'#1a1a1a',e:'⚔️'},
  rtm:{bg:'#7A7A7A',bgu:'#1a1a1a',e:'🗼'},
  uwl:{bg:'#8B7355',bgu:'#1a1a1a',e:'🧱'},
  arch:{bg:'#4A3220',bgu:'#1a1a1a',e:'🏰'},
  uwr:{bg:'#8B7355',bgu:'#1a1a1a',e:'🧱'},
  wl:{bg:'#9B8365',bgu:'#111',e:'🧱'},
  gate:{bg:'#2A2A2A',bgu:'#0a0a0a',e:'🚪'},
  wr:{bg:'#9B8365',bgu:'#111',e:'🧱'},
  fl:{bg:'#C4A875',bgu:'#1a1a1a',e:'🪨'},
  fc:{bg:'#C4A875',bgu:'#1a1a1a',e:'🪨'},
  fr:{bg:'#C4A875',bgu:'#1a1a1a',e:'🪨'},
  grnd:{bg:'#2D5A1B',bgu:'#2D5A1B',e:'🌿',free:true},
  moat:{bg:'#1565C0',bgu:'#0a1a3a',e:'🌊'},
  og_l:{bg:'#4A3000',bgu:'#1a1a1a',e:'🧱'},
  portc:{bg:'#2a2000',bgu:'#1a1a1a',e:'⚙️'},
  og_r:{bg:'#4A3000',bgu:'#1a1a1a',e:'🧱'},
  crown:{bg:'#8B0000',bgu:'#1a1a1a',e:'👑'},
  stables:{bg:'#3a2800',bgu:'#1a1a1a',e:'🐴'},
  train:{bg:'#2a2a00',bgu:'#1a1a1a',e:'🏋️'},
  armory:{bg:'#2a0000',bgu:'#1a1a1a',e:'🗡️'},
  dungeon:{bg:'#0a0a0a',bgu:'#0a0a0a',e:'⛓️'},
  hall:{bg:'#3a2000',bgu:'#1a1a1a',e:'🍽️'},
  library:{bg:'#1a1a3a',bgu:'#1a1a1a',e:'📚'},
  chapel:{bg:'#2a2a2a',bgu:'#1a1a1a',e:'⛪'},
  gardens:{bg:'#1a3a10',bgu:'#1a1a1a',e:'🌷'},
  flag_l:{bg:'#4a0000',bgu:'#1a1a1a',e:'🚩'},
  market:{bg:'#3a2a00',bgu:'#1a1a1a',e:'🏪'},
  flag_r:{bg:'#00004a',bgu:'#1a1a1a',e:'🏴'},
  cannon_l:{bg:'#2a2a2a',bgu:'#1a1a1a',e:'💣'},
  cannon_r:{bg:'#2a2a2a',bgu:'#1a1a1a',e:'💣'},
  throne:{bg:'#4a0050',bgu:'#1a1a1a',e:'👸'},
  tower_secret:{bg:'#1a1a1a',bgu:'#0a0a0a',e:'🕵️'},
  treasury:{bg:'#3a2800',bgu:'#1a1a1a',e:'💎'}
};

// ============================================================
// SHOP ITEMS
// ============================================================
var SHOP_ITEMS=[
  // --- POTIONS ---
  {id:'hp1',icon:'❤️',name:'Life Potion',desc:'Adds 1 heart potion to your bag.',fun:'Brewed from enchanted strawberries and pure courage!',cost:3,cat:'potion',repeatable:true,effect:'potion1'},
  {id:'hp3',icon:'💖',name:'Mega Elixir',desc:'Adds 3 heart potions at once!',fun:'A triple-strength recipe from the royal healers!',cost:8,cat:'potion',repeatable:true,effect:'potion3'},
  {id:'hp5',icon:'💝',name:'Super Elixir',desc:'5 heart potions — mega value!',fun:'Ancient formula from the dragon healers!',cost:12,cat:'potion',repeatable:true,effect:'potion5'},
  // --- BOOSTS ---
  {id:'xstar',icon:'⭐',name:'Star Boost',desc:'Earn 2x coins for your next level!',fun:'Catching a falling star gives extraordinary luck!',cost:15,cat:'boost',repeatable:true,effect:'doubleCoin'},
  {id:'timecrystal',icon:'🔮',name:'Time Crystal',desc:'Extends the boss timer by +15 seconds!',fun:'Crystallised from captured moments of bravery!',cost:12,cat:'boost',repeatable:true,effect:'bossCrystal'},
  {id:'hintscroll',icon:'💡',name:'Hint Scroll',desc:'Removes 2 wrong answers in the next question!',fun:'A wise owl whispers which answers are wrong!',cost:8,cat:'boost',repeatable:true,effect:'hint'},
  {id:'treasure_map',icon:'🗺️',name:'Treasure Map',desc:'Hidden bonus coins appear in your next level!',fun:'Drawn by pirates who were actually math teachers!',cost:16,cat:'boost',repeatable:true,effect:'treasureMap'},
  // --- DECORATIONS ---
  {id:'fountain',icon:'⛲',name:'Royal Fountain',desc:'A crystalline centrepiece.',fun:'The sound of water keeps the castle cool!',cost:50,cat:'decor'},
  {id:'garden',icon:'🌸',name:'Cherry Garden',desc:'Enchanted blossoms all year round.',fun:'Cherry trees planted by the first queen!',cost:40,cat:'decor'},
  {id:'peacock',icon:'🦚',name:'Royal Peacock',desc:'A symbol of majesty.',fun:'Peacocks warned castles of strangers!',cost:70,cat:'decor'},
  {id:'lanterns',icon:'🏮',name:'Lantern Path',desc:'Golden lanterns that never go out.',fun:'Lit since 1066!',cost:60,cat:'decor'},
  {id:'statue',icon:'🗿',name:'Stone Guardian',desc:'A stone sentinel.',fun:'Legend says it winks at passing dragons!',cost:90,cat:'decor'},
  {id:'carousel',icon:'🎠',name:'Magic Carousel',desc:'A spinning wonder.',fun:'Powered by captured laughter!',cost:200,cat:'decor'},
  {id:'firework',icon:'🎆',name:'Fireworks Tower',desc:'Celebrates every victory!',fun:'Each explosion spells a math formula!',cost:190,cat:'decor'},
  {id:'shrine',icon:'⛩️',name:'Ancient Shrine',desc:'Sacred and mysterious.',fun:'Monks have meditated here for 1,000 years!',cost:240,cat:'decor'},
  {id:'dragon_s',icon:'🐲',name:'Dragon Statue',desc:'A fearsome guardian.',fun:'Breathes real fire at midnight!',cost:360,cat:'decor'},
  {id:'rainbow',icon:'🌈',name:'Rainbow Bridge',desc:'Built from pure light.',fun:'Walk across and shoes sparkle for a week!',cost:320,cat:'decor'},
  {id:'well',icon:'🪣',name:'Wishing Well',desc:'Toss a coin and make a wish!',fun:'Every wish here has come true!',cost:55,cat:'decor'},
  {id:'windmill',icon:'🏭',name:'Windmill',desc:'Spins in the breeze.',fun:'Spinning for 300 years!',cost:65,cat:'decor'},
  {id:'hot_air',icon:'🎈',name:'Hot Air Balloon',desc:'Floats above the castle.',fun:'The royal family spies on enemies from it!',cost:180,cat:'decor'},
  {id:'theatre',icon:'🎭',name:'Royal Theatre',desc:'Knights perform math plays.',fun:'The dragon always plays the villain!',cost:80,cat:'decor'},
  {id:'turtle_pond',icon:'🐢',name:'Turtle Pond',desc:'Wise old turtles.',fun:'These turtles can live to 150 years!',cost:50,cat:'decor'},
  {id:'mini_volcano',icon:'🌋',name:'Mini Volcano',desc:'Tiny erupting volcano!',fun:'Erupts every 42 minutes. Nobody knows why.',cost:170,cat:'decor'},
  {id:'mermaid_f',icon:'🧜',name:'Mermaid Fountain',desc:'A singing mermaid statue.',fun:'She only sings correct answers!',cost:190,cat:'decor'},
  {id:'circus',icon:'🎪',name:'Royal Circus',desc:'Acrobats and math magicians!',fun:'Strongman lifts 1000x his weight in numbers!',cost:260,cat:'decor'},
  {id:'sunflower',icon:'🌻',name:'Sunflower Garden',desc:'Giant sunflowers.',fun:'55 spirals — always Fibonacci!',cost:45,cat:'decor'},
  {id:'mini_castle',icon:'🏯',name:'Castle Model',desc:'Tiny replica — meta!',fun:'A tinier castle inside THAT castle!',cost:300,cat:'decor'},
  {id:'piano',icon:'🎹',name:'Enchanted Piano',desc:'Plays on perfect scores!',fun:'Favourite song: Multiplication Tables Rap!',cost:200,cat:'decor'},
  {id:'obsidian',icon:'🌑',name:'Obsidian Obelisk',desc:'Dark monument.',fun:'Absorbs wrong answers!',cost:440,cat:'decor'},
  {id:'crystal_g',icon:'💠',name:'Crystal Garden',desc:'Crystals in every colour.',fun:'Each hums at a different note!',cost:400,cat:'decor'},
  {id:'maze',icon:'🌀',name:'Hedge Maze',desc:'Changes shape every full moon.',fun:'Centre holds a genius-only treasure!',cost:340,cat:'decor'},
  {id:'observatory',icon:'🔭',name:'Royal Observatory',desc:'Discover constellations.',fun:'Telescope sees numbers in the stars!',cost:500,cat:'decor'},
  {id:'treehouse',icon:'🏡',name:'Enchanted Treehouse',desc:'Cozy home in a magical tree.',fun:'Tree grows math on its leaves!',cost:280,cat:'decor'},
  {id:'portal',icon:'🌀',name:'Magic Portal',desc:'Gateway to other dimensions.',fun:'Step through: 1+1=3!',cost:600,cat:'decor'},
  {id:'ice_sculpture',icon:'🧊',name:'Ice Sculpture',desc:'Never melts.',fun:'Carved by a frost giant!',cost:240,cat:'decor'},
  {id:'golden_gate',icon:'🚪',name:'Golden Gate',desc:'Magnificent golden gate.',fun:'Opens only for times table masters!',cost:700,cat:'decor'},
  {id:'enchanted_clock',icon:'🕰️',name:'Enchanted Clock',desc:'Slows time.',fun:'Extra seconds in boss battles!',cost:480,cat:'decor'},
  {id:'magic_carpet',icon:'🧞',name:'Flying Carpet',desc:'Soars above the castle!',fun:'Fractal pattern goes forever!',cost:560,cat:'decor'},
  {id:'bookshelf',icon:'📚',name:'Infinite Bookshelf',desc:'Every math book ever written.',fun:'Books write themselves as you solve!',cost:360,cat:'decor'},
  {id:'cosmic_throne',icon:'🪑',name:'Cosmic Throne',desc:'Woven from starlight.',fun:'Ruler of all numbers!',cost:700,cat:'decor'},
  {id:'eternal_flame',icon:'🔥',name:'Eternal Flame',desc:'Heat of a thousand suns.',fun:'Powered by correct answers!',cost:600,cat:'decor'},
  {id:'celestial_globe',icon:'🌍',name:'Celestial Globe',desc:'Miniature orbiting planet.',fun:'Inhabitants solve math for fun!',cost:560,cat:'decor'},
  {id:'hot_spring',icon:'♨️',name:'Dragon Hot Spring',desc:'Steaming spring heated by dragons.',fun:'Always exactly 42 degrees Celsius!',cost:320,cat:'decor'},
  {id:'ferris',icon:'🎡',name:'Ferris Wheel',desc:'Powered by equations.',fun:'Each cabin shows a times table!',cost:400,cat:'decor'},
  {id:'dojo',icon:'⛩️',name:'Ninja Dojo',desc:'Secret training hall.',fun:'Students learn mental math at lightning speed!',cost:360,cat:'decor'},
  {id:'aquarium',icon:'🐠',name:'Royal Aquarium',desc:'Fish in geometric patterns.',fun:'The octopus solves any equation!',cost:380,cat:'decor'},
  // --- COLLECTIBLES ---
  {id:'crystal',icon:'🔮',name:'Crystal Orb',desc:'Reveals hidden truths!',fun:"See tomorrow's questions!",cost:45,cat:'coll'},
  {id:'crown_i',icon:'👑',name:'Golden Crown',desc:'True champion only.',fun:'Worth more than 1,000 dragons!',cost:120,cat:'coll'},
  {id:'sword',icon:'⚔️',name:"Hero's Sword",desc:'Dragon-forged, never dulls.',fun:'Sings on hard problems!',cost:55,cat:'coll'},
  {id:'wiz_staff',icon:'🪄',name:"Wizard's Staff",desc:'Master of all numbers.',fun:'Tap 3x and wrong answers vanish!',cost:150,cat:'coll'},
  {id:'trophy',icon:'🏆',name:'Champion Trophy',desc:'Conquered every challenge.',fun:'Engraved with every boss defeated!',cost:220,cat:'coll'},
  {id:'dragon_egg',icon:'🥚',name:'Dragon Egg',desc:'Glowing mountain dragon egg.',fun:'Something is growing inside!',cost:75,cat:'coll'},
  {id:'medal_gold',icon:'🥇',name:'Gold Medal',desc:'Finest mathematician.',fun:'1 in 1,000,000 ever wins one!',cost:65,cat:'coll'},
  {id:'ancient_coin',icon:'🪙',name:'Ancient Coin',desc:'From the First Kingdom.',fun:'Older than counting itself!',cost:35,cat:'coll'},
  {id:'fairy',icon:'🧚',name:'Enchanted Fairy',desc:'Tiny magical companion.',fun:'Whispers answers in your ear!',cost:160,cat:'coll'},
  {id:'rune',icon:'🧿',name:'Magic Rune',desc:'Wards off wrong answers!',fun:'Carved by a 100% scorer!',cost:50,cat:'coll'},
  {id:'ancient_map',icon:'🗺️',name:'Ancient Map',desc:'Secret castle passages.',fun:'X marks genius treasure!',cost:50,cat:'coll'},
  {id:'unicorn',icon:'🦄',name:'Unicorn Horn',desc:'Pure math energy.',fun:'Touch it for instant long division!',cost:180,cat:'coll'},
  {id:'baby_dragon',icon:'🐲',name:'Baby Dragon',desc:'Loves homework!',fun:'Fire when excited about fractions!',cost:150,cat:'coll'},
  {id:'moonstone',icon:'🌙',name:'Moon Stone',desc:'Thousand moons glow.',fun:'Shooting star + textbook!',cost:65,cat:'coll'},
  {id:'crystal_ball2',icon:'🔮',name:'Master Crystal Ball',desc:'Shows tomorrow!',fun:'Shows you will get an A+!',cost:200,cat:'coll'},
  {id:'ench_mirror',icon:'🪞',name:'Enchanted Mirror',desc:'True math champion.',fun:'Compliments hair AND arithmetic!',cost:160,cat:'coll'},
  {id:'star_gem',icon:'💠',name:'Star Gem',desc:'From a dying star.',fun:'Glows on correct answers!',cost:240,cat:'coll'},
  {id:'time_sand',icon:'⏳',name:'Time Sand',desc:'Hourglass of time.',fun:'One grain = one second, forever!',cost:280,cat:'coll'},
  {id:'shadow_cloak',icon:'🧥',name:'Shadow Cloak',desc:'Invisible on perfect scores.',fun:'Woven by the midnight tailor!',cost:260,cat:'coll'},
  {id:'infinity_ring',icon:'💍',name:'Infinity Ring',desc:'Infinity symbol ring.',fun:'Unlimited math power!',cost:400,cat:'coll'},
  {id:'phoenix_crown',icon:'👑',name:'Phoenix Crown',desc:'Living flames crown.',fun:'Greatest champion only!',cost:500,cat:'coll'},
  {id:'world_egg',icon:'🥚',name:'World Egg',desc:'Tiny universe inside.',fun:'Runs on pure mathematics!',cost:350,cat:'coll'},
  {id:'void_crystal',icon:'💎',name:'Void Crystal',desc:'Between dimensions.',fun:'Shows every possible answer!',cost:420,cat:'coll'},
  {id:'gravity_orb',icon:'🔮',name:'Gravity Orb',desc:'Bends space-time.',fun:'Numbers float in the air!',cost:320,cat:'coll'},
  {id:'dimension_key',icon:'🗝️',name:'Dimension Key',desc:'Doors to math magic.',fun:'Different arithmetic rules!',cost:400,cat:'coll'},
  {id:'soul_gem',icon:'💎',name:'Soul Gem',desc:'1000 mathematicians wisdom.',fun:'Whispers ancient solutions!',cost:500,cat:'coll'},
  {id:'shield2',icon:'🛡️',name:'Golden Shield',desc:'+2 permanent max hearts!',fun:'Dragon scale dipped in starlight!',cost:60,cat:'coll',maxOwned:2,effect:'addMaxHp2'},
  {id:'titan_shield',icon:'🛡️',name:'Titan Shield',desc:'+3 max hearts! (LEGENDARY!)',fun:'World Turtle shell!',cost:200,cat:'coll',maxOwned:1,effect:'addMaxHp3'},
  // --- CHARACTERS ---
  {id:'char_knight',icon:'⚔️',name:'Brave Knight',desc:'Fearless knight in shining armor!',fun:'Never lost a battle or a math test!',cost:100,cat:'character'},
  {id:'char_cat',icon:'🐱',name:'Professor Whiskers',desc:'A cat who teaches by paw!',fun:'Purrs at correct, hisses at wrong!',cost:120,cat:'character'},
  {id:'char_pirate',icon:'🏴‍☠️',name:'Captain Calculator',desc:'Sails the seas of math!',fun:'Parrot squawks times tables!',cost:150,cat:'character'},
  {id:'char_fairy',icon:'🧚',name:'Star Fairy',desc:'Giant math powers!',fun:'Pixie dust fixes wrong answers!',cost:180,cat:'character'},
  {id:'char_monkey',icon:'🐵',name:'Monkey Genius',desc:'Clever monkey loves puzzles!',fun:'Juggles 5 multiplication problems!',cost:200,cat:'character'},
  {id:'char_wizard',icon:'🧙',name:'Number Wizard',desc:'Master of math magic!',fun:'Multiplies 3-digit in his sleep!',cost:250,cat:'character'},
  {id:'char_princess',icon:'👸',name:'Princess Algebra',desc:'Royal ruler of numbers!',fun:'First equation solved at age 3!',cost:250,cat:'character'},
  {id:'char_ninja',icon:'🗡️',name:'Shadow Ninja',desc:'Lightning-speed answers!',fun:'Silent, swift, always correct!',cost:300,cat:'character'},
  {id:'char_robot',icon:'🤖',name:'Math-O-Tron',desc:'Robot for equations!',fun:'Runs on pure logic fuel!',cost:350,cat:'character'},
  {id:'char_panda',icon:'🐼',name:'Panda Professor',desc:'Wise panda solves equations.',fun:'Eats 1000 math problems for breakfast!',cost:350,cat:'character'},
  {id:'char_dragon',icon:'🐉',name:'Baby Dragon',desc:'Friendly number lover!',fun:'Fire-shaped numbers when excited!',cost:400,cat:'character'},
  {id:'char_phoenix',icon:'🔥',name:'Phoenix Rising',desc:'Reborn stronger each time!',fun:'Wrong answers make it smarter!',cost:450,cat:'character'},
  {id:'char_ghost',icon:'👻',name:'Phantom Solver',desc:'Haunts wrong answers away!',fun:'Appears before you make mistakes!',cost:400,cat:'character'},
  {id:'char_astronaut',icon:'👨‍🚀',name:'Space Explorer',desc:'Calculates rocket paths!',fun:'Calculated Mars distance for fun!',cost:500,cat:'character'},
  {id:'char_samurai',icon:'⛩️',name:'Math Samurai',desc:'Slices problems with precision!',fun:'One cut, one answer — bushido!',cost:500,cat:'character'},
  {id:'char_mermaid',icon:'🧜',name:'Mermaid Scholar',desc:'Counts pearls and solves!',fun:'Calculates volume of any ocean!',cost:550,cat:'character'},
  {id:'char_dinosaur',icon:'🦖',name:'T-Rex Scholar',desc:'Tiny arms, giant brain!',fun:'Hiding in libraries!',cost:600,cat:'character'},
  {id:'char_viking',icon:'🪓',name:'Viking Calculator',desc:'Conquers numbers!',fun:'Battle cry: times tables to 20!',cost:600,cat:'character'},
  {id:'char_alien',icon:'👽',name:'Galaxy Brain',desc:'Brain the size of a planet!',fun:'Quantum equations for fun!',cost:700,cat:'character'},
  {id:'char_unicorn',icon:'🦄',name:'Uni-Math-Corn',desc:'Horn of pure geometry!',fun:'Horn is a perfect cone!',cost:800,cat:'character'}
];

// ============================================================
// ACHIEVEMENTS (80+)
// ============================================================
var ACHIEVEMENTS=[
  {id:'a_first',icon:'⭐',name:'First Star',desc:'Answer your first question correctly',cond:'Get 1 correct answer',color:'#fbbf24',bg:'#451a03'},
  {id:'a_c10',icon:'📝',name:'Getting Started',desc:'Answer 10 questions correctly',cond:'10 correct answers',color:'#84cc16',bg:'#1a2e05'},
  {id:'a_c50',icon:'🚀',name:'Half Century',desc:'Answer 50 questions correctly',cond:'50 correct answers',color:'#10b981',bg:'#064e3b'},
  {id:'a_c100',icon:'🏅',name:'Century',desc:'Answer 100 questions correctly',cond:'100 correct answers',color:'#22c55e',bg:'#052e16'},
  {id:'a_c200',icon:'🌟',name:'Double Century',desc:'Answer 200 questions correctly',cond:'200 correct answers',color:'#f59e0b',bg:'#451a03'},
  {id:'a_c500',icon:'💫',name:'Master Scholar',desc:'Answer 500 questions correctly',cond:'500 correct answers',color:'#a855f7',bg:'#2e1065'},
  {id:'a_c1000',icon:'🌌',name:'Math Legend',desc:'Answer 1000 questions correctly',cond:'1000 correct answers',color:'#fbbf24',bg:'#1a0a00'},
  {id:'a_c2000',icon:'🧙',name:'Grand Wizard',desc:'Answer 2000 questions correctly',cond:'2000 correct answers',color:'#f43f5e',bg:'#4c0519'},
  {id:'a_combo3',icon:'🔥',name:'On Fire',desc:'Get a 3x combo streak',cond:'3 correct in a row',color:'#f97316',bg:'#431407'},
  {id:'a_combo5',icon:'💥',name:'Blazing',desc:'Get a 5x combo streak',cond:'5 correct in a row',color:'#ef4444',bg:'#450a0a'},
  {id:'a_combo10',icon:'⚡',name:'Lightning',desc:'Get a 10x combo streak',cond:'10 correct in a row',color:'#a855f7',bg:'#2e1065'},
  {id:'a_combo15',icon:'🌪️',name:'Tornado',desc:'Get a 15x combo streak',cond:'15 correct in a row',color:'#38bdf8',bg:'#082f49'},
  {id:'a_combo20',icon:'☄️',name:'Unstoppable',desc:'Get a 20x combo streak',cond:'20 correct in a row',color:'#fbbf24',bg:'#1a0000'},
  {id:'a_combo30',icon:'🌠',name:'Infinite Power',desc:'Get a 30x combo streak',cond:'30 correct in a row — VERY HARD!',color:'#f43f5e',bg:'#4c0519'},
  {id:'a_perfect1',icon:'💎',name:'Flawless Victory',desc:'Complete a level with zero mistakes',cond:'Level with 0 wrong answers',color:'#06b6d4',bg:'#083344'},
  {id:'a_perfect3',icon:'🌟',name:'Triple Crown',desc:'Complete 3 levels perfectly',cond:'3 levels with 0 mistakes',color:'#22c55e',bg:'#052e16'},
  {id:'a_perfect5',icon:'👑',name:'Perfection King',desc:'Complete 5 levels perfectly',cond:'5 levels with 0 mistakes',color:'#f59e0b',bg:'#451a03'},
  {id:'a_perfect10',icon:'🏆',name:'Perfect Master',desc:'Complete 10 levels perfectly',cond:'10 levels with 0 mistakes',color:'#a855f7',bg:'#2e1065'},
  {id:'a_perfect20',icon:'✨',name:'Untouchable',desc:'Complete 20 levels perfectly',cond:'20 levels with 0 mistakes — VERY HARD!',color:'#fbbf24',bg:'#451a03'},
  {id:'a_boss1',icon:'⚔️',name:'Boss Slayer',desc:'Defeat your first world boss',cond:'Defeat 1 boss',color:'#dc2626',bg:'#450a0a'},
  {id:'a_boss3',icon:'🗡️',name:'Dragon Tamer',desc:'Defeat 3 different bosses',cond:'Defeat 3 different bosses',color:'#7c3aed',bg:'#2e1065'},
  {id:'a_boss6',icon:'👑',name:'World Champion',desc:'Defeat all 6 original bosses',cond:'Defeat bosses 1-6',color:'#fbbf24',bg:'#451a03'},
  {id:'a_boss10',icon:'🦸',name:'Boss Hunter',desc:'Win 10 boss battles total',cond:'10 total boss wins (rematches count)',color:'#22c55e',bg:'#052e16'},
  {id:'a_boss_fast',icon:'⚡',name:'Speed Slayer',desc:'Answer a boss question with 20+ sec left',cond:'Answer within 10 seconds',color:'#38bdf8',bg:'#082f49'},
  {id:'a_boss_rem',icon:'🔄',name:'Rematched',desc:'Win a boss rematch',cond:'Beat a boss a second time',color:'#f97316',bg:'#431407'},
  {id:'a_boss_perfect',icon:'🎯',name:'Flawless Boss',desc:'Defeat a boss without losing a heart',cond:'Beat a boss with 3/3 HP remaining',color:'#fbbf24',bg:'#451a03'},
  {id:'a_build3',icon:'🔨',name:'First Bricks',desc:'Fully build 3 castle parts',cond:'3 parts at max level',color:'#84cc16',bg:'#1a2e05'},
  {id:'a_build5',icon:'🏗️',name:'Apprentice Builder',desc:'Fully build 5 castle parts',cond:'5 parts at max level',color:'#10b981',bg:'#064e3b'},
  {id:'a_build10',icon:'🏰',name:'Castle Builder',desc:'Fully build 10 castle parts',cond:'10 parts at max level',color:'#f59e0b',bg:'#451a03'},
  {id:'a_build15',icon:'🏯',name:'Master Builder',desc:'Fully build 15 castle parts',cond:'15 parts at max level',color:'#a855f7',bg:'#2e1065'},
  {id:'a_build20',icon:'🌟',name:'Grand Architect',desc:'Fully build 20 castle parts',cond:'20 parts at max level — HARD!',color:'#fbbf24',bg:'#1a0000'},
  {id:'a_coins50',icon:'🪙',name:'Coin Finder',desc:'Earn 50 total coins',cond:'Earn 50 lifetime coins',color:'#fbbf24',bg:'#451a03'},
  {id:'a_coins100',icon:'💰',name:'Treasure Hunter',desc:'Earn 100 total coins',cond:'Earn 100 lifetime coins',color:'#f59e0b',bg:'#451a03'},
  {id:'a_coins500',icon:'💎',name:"Dragon's Hoard",desc:'Earn 500 total coins',cond:'Earn 500 lifetime coins',color:'#06b6d4',bg:'#083344'},
  {id:'a_coins1k',icon:'💰',name:'Gold Mountain',desc:'Earn 1000 total coins',cond:'Earn 1000 lifetime coins — HARD!',color:'#22c55e',bg:'#052e16'},
  {id:'a_worlds2',icon:'🌍',name:'Explorer',desc:'Unlock 2 worlds',color:'#22c55e',cond:'Beat World 1 boss',bg:'#052e16'},
  {id:'a_worlds6',icon:'🌏',name:'World Traveller',desc:'Beat all 6 original bosses',cond:'Defeat all 6 original bosses',color:'#f59e0b',bg:'#451a03'},
  {id:'a_worlds10',icon:'🌌',name:'Galaxy Explorer',desc:'Reach World 10',cond:'Defeat 9 bosses',color:'#a855f7',bg:'#2e1065'},
  {id:'a_stars5',icon:'🌠',name:'Star Collector',desc:'Earn 3 stars on 5 levels',cond:'5 levels with perfect 3 stars',color:'#f59e0b',bg:'#451a03'},
  {id:'a_stars15',icon:'🌌',name:'Galaxy Brain',desc:'Earn 3 stars on 15 levels',cond:'15 levels with 3 stars',color:'#a855f7',bg:'#2e1065'},
  {id:'a_level10',icon:'🔟',name:'Level 10 Hero',desc:'Complete 10 levels',cond:'10 levels cleared',color:'#84cc16',bg:'#1a2e05'},
  {id:'a_level30',icon:'💫',name:'Veteran',desc:'Complete 30 levels',cond:'30 levels cleared',color:'#f97316',bg:'#431407'},
  {id:'a_level50',icon:'🌟',name:'Elite Player',desc:'Complete 50 levels',cond:'50 levels cleared',color:'#a855f7',bg:'#2e1065'},
  {id:'a_level100',icon:'🏆',name:'Centurion',desc:'Complete 100 levels',cond:'100 levels cleared — VERY HARD!',color:'#fbbf24',bg:'#451a03'},
  {id:'a_clock10',icon:'⏰',name:'Time Wizard',desc:'Answer 10 clock questions correctly',cond:'10 correct clock/time answers',color:'#818cf8',bg:'#1e1b4b'},
  {id:'a_logic10',icon:'🧩',name:'Logic Thinker',desc:'Answer 10 logic questions correctly',cond:'10 correct logic answers',color:'#34d399',bg:'#064e3b'},
  {id:'a_word10',icon:'📖',name:'Storyteller',desc:'Answer 10 word problems correctly',cond:'10 correct word problems',color:'#fb923c',bg:'#431407'},
  {id:'a_pattern10',icon:'🔮',name:'Pattern Seeker',desc:'Answer 10 pattern questions correctly',cond:'10 correct pattern answers',color:'#a78bfa',bg:'#2e1065'},
  {id:'a_lineup10',icon:'👫',name:'Queue Master',desc:'Answer 10 queue/order questions correctly',cond:'10 correct lineup answers',color:'#f472b6',bg:'#500724'},
  {id:'a_spatial10',icon:'🔷',name:'Shape Expert',desc:'Answer 10 spatial questions correctly',cond:'10 correct spatial answers',color:'#22d3ee',bg:'#083344'},
  {id:'a_shop1',icon:'🛍️',name:'First Purchase',desc:'Buy your first item from the shop',cond:'Make 1 shop purchase',color:'#ec4899',bg:'#500724'},
  {id:'a_shop5',icon:'🛒',name:'Shopaholic',desc:'Buy 5 items from the shop',cond:'5 total shop purchases',color:'#f43f5e',bg:'#4c0519'},
  {id:'a_shop10',icon:'🏪',name:'Big Spender',desc:'Buy 10 items from the shop',cond:'10 total shop purchases',color:'#a855f7',bg:'#2e1065'},
  {id:'a_sharp',icon:'🎯',name:'Sharpshooter',desc:'Reach 85%+ accuracy (min 20 questions)',cond:'85% accuracy over 20+ questions',color:'#38bdf8',bg:'#082f49'},
  {id:'a_sharp95',icon:'🎯',name:'Eagle Eye',desc:'Reach 95%+ accuracy (min 50 questions)',cond:'95% accuracy over 50+ questions — HARD!',color:'#fbbf24',bg:'#451a03'},
  {id:'a_potion',icon:'❤️',name:'Survivor',desc:'Use a Life Potion to continue',cond:'Use 1 life potion',color:'#f87171',bg:'#450a0a'},
  {id:'a_no_pot',icon:'💪',name:'Iron Will',desc:'Complete 5 levels without using a potion',cond:'5 levels without potions',color:'#22c55e',bg:'#052e16'},
  {id:'a_streak5',icon:'🔥',name:'Level Streak',desc:'Complete 5 levels in a row without failing',cond:'5-level winning streak',color:'#f97316',bg:'#431407'},
  {id:'a_streak10',icon:'💥',name:'Unstoppable Streak',desc:'Complete 10 levels in a row without failing',cond:'10-level winning streak — HARD!',color:'#ef4444',bg:'#450a0a'},
  {id:'a_streak20',icon:'🌟',name:'Invincible',desc:'Complete 20 levels in a row without failing',cond:'20-level winning streak — EXTREME!',color:'#fbbf24',bg:'#451a03'},
  {id:'a_night',icon:'🌙',name:'Night Owl',desc:'Play between 9pm and 6am',cond:'Play after 9pm or before 6am',color:'#818cf8',bg:'#1e1b4b'},
  {id:'a_decor1',icon:'🌸',name:'Interior Decorator',desc:'Place your first decoration',cond:'Place 1 decoration in the court',color:'#ec4899',bg:'#500724'},
  {id:'a_decor5',icon:'🎨',name:'Castle Designer',desc:'Fill 5 decoration slots',cond:'5 decoration slots filled',color:'#f43f5e',bg:'#4c0519'},
  {id:'a_decor8',icon:'🏡',name:'Dream Castle',desc:'Fill all 8 decoration slots',cond:'All 8 decoration slots filled',color:'#a855f7',bg:'#2e1065'},
  {id:'a_practice',icon:'📚',name:'Dedicated Learner',desc:'Practice a wrong answer from the log',cond:'Use the Practice button in error log',color:'#22c55e',bg:'#052e16'},
  {id:'a_hint',icon:'💡',name:'Clever Clogs',desc:'Use a Hint Scroll',cond:'Activate a Hint Scroll in a level',color:'#fbbf24',bg:'#451a03'},
  {id:'a_crystal',icon:'🔮',name:'Time Bender',desc:'Use a Time Crystal in a boss battle',cond:'Activate Time Crystal vs a boss',color:'#38bdf8',bg:'#082f49'},
  {id:'a_mul_10',icon:'✖️',name:'Times Tables Pro',desc:'Answer 20 multiplication questions correctly',cond:'20 correct multiplication answers',color:'#f59e0b',bg:'#451a03'},
  {id:'a_div_10',icon:'➗',name:'Division Master',desc:'Answer 20 division questions correctly',cond:'20 correct division answers',color:'#6d28d9',bg:'#2e1065'},
  {id:'a_money10',icon:'💰',name:'Banker',desc:'Answer 10 money questions correctly',cond:'10 correct money answers',color:'#22c55e',bg:'#052e16'},
  {id:'a_all_topics',icon:'🌈',name:'All-Rounder',desc:'Get at least 1 correct in every topic',cond:'Score in all 17 topics',color:'#fbbf24',bg:'#451a03'},
  {id:'a_comeback',icon:'🌅',name:'Comeback Kid',desc:'Win a level after losing 2 hearts',cond:'Complete a level after losing 2 lives',color:'#f97316',bg:'#431407'},
  {id:'a_no_hint_boss',icon:'💪',name:'Unaided Champion',desc:'Defeat a boss without using any items',cond:'Beat a boss with 0 crystals/potions used',color:'#22c55e',bg:'#052e16'},
  {id:'a_add50',icon:'➕',name:'Addition Ace',desc:'Answer 50 addition questions correctly',cond:'50 correct addition answers',color:'#22c55e',bg:'#052e16'},
  {id:'a_mul50',icon:'✖️',name:'Multiplication Master',desc:'Answer 50 multiplication questions correctly',cond:'50 correct multiplication answers',color:'#f59e0b',bg:'#451a03'},
  {id:'a_div50',icon:'➗',name:'Division Champion',desc:'Answer 50 division questions correctly',cond:'50 correct division answers',color:'#a855f7',bg:'#2e1065'},
  {id:'a_sub50',icon:'➖',name:'Subtraction Star',desc:'Answer 50 subtraction questions correctly',cond:'50 correct subtraction answers',color:'#38bdf8',bg:'#082f49'},
  {id:'a_buildall',icon:'🏛️',name:'Kingdom Complete',desc:'Fully build every castle part',cond:'All castle parts at max level — EXTREME!',color:'#fbbf24',bg:'#1a0a00'},
  {id:'a_alldecor',icon:'🎨',name:'Master Decorator',desc:'Own every decoration item',cond:'Purchase all decorations from the shop',color:'#ec4899',bg:'#500724'},
  {id:'a_allcoll',icon:'💎',name:'Royal Collection',desc:'Own every collection item',cond:'Purchase all collection items from the shop',color:'#06b6d4',bg:'#083344'},
  {id:'a_spend500',icon:'💸',name:'Big Wallet',desc:'Spend a total of 500 coins in the shop',cond:'Spend 500 lifetime coins',color:'#fbbf24',bg:'#451a03'},
  {id:'a_divstreak5',icon:'🔥',name:'Division Streak',desc:'Answer 5 division questions correctly in a row',cond:'5 division correct in a row',color:'#f97316',bg:'#431407'},
  {id:'a_mulstreak10',icon:'⚡',name:'Times Table Terror',desc:'Answer 10 multiplication questions in a row',cond:'10 multiplication correct in a row',color:'#a855f7',bg:'#2e1065'},
  {id:'a_bossperf3',icon:'🌟',name:'Boss Annihilator',desc:'Beat 3 bosses in a row without losing a heart',cond:'3 consecutive perfect boss battles',color:'#fbbf24',bg:'#451a03'},
  {id:'a_session100',icon:'📚',name:'Marathon Scholar',desc:'Answer 100 questions in one session',cond:'100 questions in a single play session',color:'#22c55e',bg:'#052e16'},
  {id:'a_5topics',icon:'🌈',name:'Topic Explorer',desc:'Answer questions from 5 different topics in one level',cond:'5 unique topics in a single level',color:'#38bdf8',bg:'#082f49'},
  {id:'a_noon',icon:'☀️',name:'Midday Hero',desc:'Play a level between 11am and 1pm',cond:'Complete a level at midday',color:'#fbbf24',bg:'#451a03'},
  {id:'a_7days',icon:'📅',name:'Dedicated Player',desc:'Play on 7 different days',cond:'Play on 7 unique days',color:'#22c55e',bg:'#052e16'},
  {id:'a_50first',icon:'🎯',name:'Quick Thinker',desc:'50% of your answers are correct on first try',cond:'50%+ first-try accuracy (min 20 questions)',color:'#f97316',bg:'#431407'},
  {id:'a_mul_50',icon:'🔢',name:'Times Table King',desc:'Answer 50 multiplication questions correctly',cond:'50 correct multiplication answers',color:'#f59e0b',bg:'#451a03'},
  {id:'a_div_50',icon:'📐',name:'Division Grandmaster',desc:'Answer 50 division questions correctly',cond:'50 correct division answers',color:'#6d28d9',bg:'#2e1065'},
  {id:'a_word50',icon:'📖',name:'Story Master',desc:'Answer 50 word problems correctly',cond:'50 correct word problem answers',color:'#fb923c',bg:'#431407'},
  {id:'a_money50',icon:'🏦',name:'Bank President',desc:'Answer 50 money questions correctly',cond:'50 correct money answers',color:'#22c55e',bg:'#052e16'},
  {id:'a_logic50',icon:'🧠',name:'Logic Genius',desc:'Answer 50 logic questions correctly',cond:'50 correct logic answers',color:'#34d399',bg:'#064e3b'},
  {id:'a_perfect50',icon:'💎',name:'Diamond Standard',desc:'Complete 50 levels perfectly',cond:'50 levels with 0 wrong answers — EXTREME!',color:'#06b6d4',bg:'#083344'},
  {id:'a_coins5k',icon:'👑',name:'Dragon Hoard',desc:'Earn 5000 total coins',cond:'Earn 5000 lifetime coins — LEGENDARY!',color:'#fbbf24',bg:'#1a0000'},
  {id:'a_boss25',icon:'⚔️',name:'Boss Legend',desc:'Win 25 boss battles total',cond:'25 total boss wins',color:'#dc2626',bg:'#450a0a'}
];
