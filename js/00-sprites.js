// Sprite loader for Castle Math Quest
// Replaces emoji-based rendering with pixel art sprites
// Falls back to emoji if sprites aren't available

var SPRITE_BASE = 'assets/sprites/';
var _spriteCache = {};
var _spriteLoaded = {};

function loadSprite(name, cb) {
  if (_spriteCache[name]) { if (cb) cb(_spriteCache[name]); return _spriteCache[name]; }
  var img = new Image();
  img.onload = function() { _spriteCache[name] = img; _spriteLoaded[name] = true; if (cb) cb(img); };
  img.onerror = function() { _spriteCache[name] = null; _spriteLoaded[name] = false; if (cb) cb(null); };
  img.src = SPRITE_BASE + name + '.png';
  return null;
}

function spriteImg(name, w, h, fallback) {
  w = w || 32; h = h || 32;
  if (_spriteLoaded[name] && _spriteCache[name]) {
    return '<img src="' + SPRITE_BASE + name + '.png" width="' + w + '" height="' + h + '" style="image-rendering:pixelated;" alt="' + (fallback || '') + '">';
  }
  return fallback || '';
}

// Preload all sprites
function preloadSprites() {
  var sprites = [
    // Characters
    'characters/knight', 'characters/cat', 'characters/pirate', 'characters/fairy',
    'characters/monkey', 'characters/wizard', 'characters/princess', 'characters/ninja',
    'characters/robot', 'characters/panda', 'characters/dragon', 'characters/phoenix',
    'characters/ghost', 'characters/astronaut', 'characters/samurai', 'characters/mermaid',
    'characters/dinosaur', 'characters/viking', 'characters/alien', 'characters/unicorn',
    // Enemies (bosses)
    'enemies/vine_colossus', 'enemies/reef_shark', 'enemies/magma_dragon',
    'enemies/frost_colossus', 'enemies/sky_warden', 'enemies/dark_king',
    'enemies/crystal_lizard', 'enemies/storm_eagle', 'enemies/shadow_boar',
    'enemies/ink_kraken', 'enemies/fire_elemental', 'enemies/ice_wolf',
    // UI
    'ui/heart_full', 'ui/heart_empty', 'ui/coin', 'ui/star', 'ui/star_empty',
    'ui/potion', 'ui/crystal', 'ui/hint_scroll', 'ui/treasure_map',
    'ui/button_play', 'ui/button_fight', 'ui/button_back',
    // Items
    'items/life_potion', 'items/star_boost', 'items/time_crystal', 'items/hint_scroll',
    // Castle
    'castle/wall', 'castle/tower', 'castle/gate', 'castle/cannon',
    'castle/flag', 'castle/crown', 'castle/moat', 'castle/throne'
  ];
  sprites.forEach(function(s) { loadSprite(s); });
}

// Audio loader
var AUDIO_BASE = 'assets/audio/';
var _audioCache = {};

function loadAudio(name) {
  if (_audioCache[name]) return _audioCache[name];
  try {
    // Try .mid first (generated), fall back to .ogg
    var a = new Audio(AUDIO_BASE + name + '.mid');
    a.addEventListener('error', function() {
      try { a.src = AUDIO_BASE + name + '.ogg'; } catch(e) {}
    }, { once: true });
    _audioCache[name] = a;
    return a;
  } catch(e) { return null; }
}

function playAudio(name, vol) {
  var a = loadAudio(name);
  if (a) { a.volume = vol || 0.5; a.currentTime = 0; a.play().catch(function(){}); return true; }
  return false;
}

// Try to play external audio, fall back to procedural
function sfxWithFallback(name) {
  if (playAudio('sfx/' + name, 0.6)) return; // external file worked
  sfx(name); // fall back to procedural audio (defined in 06-audio.js)
}
