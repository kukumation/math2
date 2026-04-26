// Generate all pixel art sprites for Castle Math Quest
// Run: node assets/generate_sprites.js
const fs = require('fs');
const path = require('path');

const PX = 4; // each pixel block
const SZ = 16; // sprite grid size (16x16)
const W = SZ * PX; // 64px output

function mkGrid() { return Array.from({ length: SZ }, () => Array(SZ).fill(null)); }

function gridToSvg(grid, w, h) {
  w = w || W; h = h || W;
  const cw = w / SZ, ch = h / SZ;
  let rects = '';
  for (let y = 0; y < grid.length; y++) {
    let x = 0;
    while (x < grid[y].length) {
      const c = grid[y][x];
      if (c) {
        let run = 1;
        while (x + run < grid[y].length && grid[y][x + run] === c) run++;
        rects += `<rect x="${x * cw}" y="${y * ch}" width="${run * cw}" height="${ch}" fill="${c}"/>`;
        x += run;
      } else { x++; }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges">${rects}</svg>`;
}

// Parse compact sprite string (each char → color)
function parseSprite(rows, palette) {
  const g = mkGrid();
  for (let y = 0; y < rows.length && y < SZ; y++) {
    for (let x = 0; x < rows[y].length && x < SZ; x++) {
      const ch = rows[y][x];
      if (ch !== '.' && palette[ch]) g[y][x] = palette[ch];
    }
  }
  return g;
}

// Drawing helpers
function fillRect(g, x, y, w, h, c) {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) {
    const gy = y + dy, gx = x + dx;
    if (gy >= 0 && gy < SZ && gx >= 0 && gx < SZ) g[gy][gx] = c;
  }
}
function fillCircle(g, cx, cy, r, c) {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (dx * dx + dy * dy <= r * r) {
      const gy = cy + dy, gx = cx + dx;
      if (gy >= 0 && gy < SZ && gx >= 0 && gx < SZ) g[gy][gx] = c;
    }
  }
}

const outDir = (dir) => path.join(__dirname, 'sprites', dir);

// ============================================================
// UI SPRITES
// ============================================================

function spriteHeartFull() {
  return parseSprite([
    '................',
    '..RR....RR......',
    '.RRRR..RRRR.....',
    '.RRRRRRRRRR.....',
    '.RRRRRRRRRR.....',
    '..RRRRRRRR......',
    '...RRRRRR.......',
    '....RRRR........',
    '.....RR.........',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ], { R: '#E53935' });
}

function spriteHeartEmpty() {
  return parseSprite([
    '................',
    '..RR....RR......',
    '.R..R..R..R.....',
    '.R..RRRR..R.....',
    '.R..R..R..R.....',
    '..R.R..R.R......',
    '...R....R.......',
    '....R..R........',
    '.....RR.........',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ], { R: '#555555' });
}

function spriteCoin() {
  const g = mkGrid();
  fillCircle(g, 8, 8, 6, '#FBD000');
  fillCircle(g, 8, 8, 4, '#FFE57A');
  fillCircle(g, 8, 8, 3, '#FBD000');
  // $ sign
  fillRect(g, 7, 4, 2, 1, '#E65100');
  fillRect(g, 6, 5, 2, 1, '#E65100');
  fillRect(g, 7, 6, 2, 1, '#E65100');
  fillRect(g, 6, 7, 2, 1, '#E65100');
  fillRect(g, 7, 8, 2, 1, '#E65100');
  fillRect(g, 8, 9, 2, 1, '#E65100');
  fillRect(g, 7, 10, 2, 1, '#E65100');
  fillRect(g, 8, 11, 2, 1, '#E65100');
  return g;
}

function spriteStar() {
  return parseSprite([
    '................',
    '.......YY.......',
    '......YYYY......',
    '......YYYY......',
    '....YYYYYYYY....',
    '..YYYYYYYYYYYY..',
    '.YYYYYYYYYYYYYY.',
    '.YYYYYYYYYYYYYY.',
    '....YYYYYYYY....',
    '...YYYY..YYYY...',
    '..YYYY....YYYY..',
    '..YYY......YYY..',
    '.YY..........YY.',
    '.Y............Y.',
    '................',
    '................',
  ], { Y: '#FFD700' });
}

function spriteStarEmpty() {
  return parseSprite([
    '................',
    '.......GG.......',
    '......GGGG......',
    '......GGGG......',
    '....GGGGGGGG....',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '....GGGGGGGG....',
    '...GGGG..GGGG...',
    '..GGGG....GGGG..',
    '..GGG......GGG..',
    '.GG..........GG.',
    '.G............G.',
    '................',
    '................',
  ], { G: '#555555' });
}

function spritePotion() {
  return parseSprite([
    '................',
    '......CC........',
    '......CC........',
    '.....CGGC.......',
    '.....CGGC.......',
    '......CC........',
    '.....PRP........',
    '....PPPPP.......',
    '...PPPPPPP......',
    '..PPPPPPPPP.....',
    '..PPPPPPPPP.....',
    '..PPPPPPPPP.....',
    '...PPPPPPP......',
    '....PPPPP.......',
    '................',
    '................',
  ], { C: '#888888', G: '#AAAAAA', P: '#E53935', R: '#FFFFFF' });
}

function spriteCrystal() {
  return parseSprite([
    '................',
    '.......BB.......',
    '......BBBB......',
    '.....BBLBBB.....',
    '....BBLLBBB.....',
    '...BBBLBBBB.....',
    '...BBBLBBBB.....',
    '...BBBLBBBB.....',
    '....BBLLBB......',
    '....BBLLBB......',
    '.....BLLBB......',
    '......BLB.......',
    '.......B........',
    '................',
    '................',
    '................',
  ], { B: '#42A5F5', L: '#BBDEFB' });
}

function spriteHintScroll() {
  return parseSprite([
    '................',
    '..DDDDDDDD......',
    '.DFFFFFFFD......',
    '.DFFFFFFFFD.....',
    '.DF.DDD.FFD.....',
    '.DF.FFF.FFD.....',
    '.DF.DDD.FFD.....',
    '.DF.FFF.FFD.....',
    '.DF.DDD.FFD.....',
    '.DF.FFF.FFD.....',
    '.DFFFFFFFD......',
    '.DFFFFFFFD......',
    '..DDDDDDDD......',
    '................',
    '................',
    '................',
  ], { D: '#8B6914', F: '#F5E6D3' });
}

function spriteTreasureMap() {
  const g = mkGrid();
  fillRect(g, 3, 2, 10, 12, '#D4A437');
  fillRect(g, 4, 3, 8, 10, '#F5DEB3');
  // X marks the spot
  fillRect(g, 7, 5, 1, 1, '#E53935');
  fillRect(g, 8, 6, 1, 1, '#E53935');
  fillRect(g, 9, 7, 1, 1, '#E53935');
  fillRect(g, 8, 8, 1, 1, '#E53935');
  fillRect(g, 7, 9, 1, 1, '#E53935');
  fillRect(g, 6, 8, 1, 1, '#E53935');
  fillRect(g, 5, 7, 1, 1, '#E53935');
  fillRect(g, 6, 6, 1, 1, '#E53935');
  // Compass
  fillRect(g, 5, 4, 1, 1, '#333');
  return g;
}

// ============================================================
// ITEM SPRITES
// ============================================================

function spriteLifePotion() {
  return parseSprite([
    '................',
    '......CC........',
    '.....CC........',
    '.....CGGC.......',
    '......CC........',
    '.....GPPG.......',
    '....GPPPPG......',
    '...GPPPPPPG.....',
    '..GPPPPPPPPG....',
    '..GPPPPPPPPG....',
    '..GPPPPPPPPG....',
    '...GPPPPPPG.....',
    '....GPPPPG......',
    '.....GGGG.......',
    '................',
    '................',
  ], { C: '#888888', G: '#66BB6A', P: '#43A047' });
}

function spriteStarBoost() {
  const g = mkGrid();
  fillCircle(g, 8, 8, 6, '#FF8F00');
  fillCircle(g, 8, 8, 4, '#FFB300');
  fillCircle(g, 8, 8, 2, '#FFD54F');
  fillRect(g, 7, 5, 2, 6, '#FFFFFF');
  fillRect(g, 5, 7, 6, 2, '#FFFFFF');
  return g;
}

function spriteTimeCrystal() {
  const g = mkGrid();
  fillCircle(g, 8, 8, 6, '#1565C0');
  fillCircle(g, 8, 8, 5, '#42A5F5');
  fillCircle(g, 8, 8, 3, '#90CAF9');
  fillRect(g, 7, 4, 2, 1, '#E3F2FD');
  fillRect(g, 7, 5, 2, 1, '#BBDEFB');
  fillRect(g, 6, 7, 1, 2, '#E3F2FD');
  fillRect(g, 8, 8, 1, 2, '#E3F2FD');
  return g;
}

// ============================================================
// CHARACTER SPRITES (16x16 pixel art)
// ============================================================

function spriteKnight() {
  return parseSprite([
    '................',
    '......SSSS......',
    '.....SSSSSS.....',
    '.....SFWWSF.....',
    '.....SWWWWS.....',
    '......SWWS......',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '....GG.SS.GG....',
    '....GG.SS.GG....',
    '....GGGGGGGG....',
    '.....GGGGGG.....',
    '.....BB..BB.....',
    '.....BB..BB.....',
    '.....BB..BB.....',
    '................',
  ], { S: '#78909C', F: '#B0BEC5', W: '#FFCC80', G: '#5C6BC0', B: '#795548' });
}

function spriteCat() {
  return parseSprite([
    '................',
    '..OO......OO....',
    '.OOO....OOOO....',
    '.OOOOOOOOOO.....',
    '.OGWOOOOWGO.....',
    '.OWWOOOOWWO.....',
    '.OOWOOOOWOO.....',
    '..OOWWWWWOO.....',
    '...OWKWOWO......',
    '...OOWWWOO......',
    '..OOOOOOOOO.....',
    '..OOOOOOOOO.....',
    '...OO...OO......',
    '...OO...OO......',
    '................',
    '................',
  ], { O: '#FF8A65', W: '#FFFFFF', G: '#4CAF50', K: '#333333' });
}

function spritePirate() {
  return parseSprite([
    '................',
    '......RR........',
    '.....RRRR.......',
    '.....BWWB.......',
    '.....BWOWB......',
    '......WW........',
    '.....RRRR.......',
    '....RRRRRR......',
    '....RR.RR.R.....',
    '....RRRRRR......',
    '.....RRRR.......',
    '.....BB.BB......',
    '.....BB.BB......',
    '.....BB.BB......',
    '................',
    '................',
  ], { R: '#E53935', B: '#333333', W: '#FFCC80', O: '#111111' });
}

function spriteFairy() {
  return parseSprite([
    '................',
    '..WW....WW......',
    '.WPPW..WPPW.....',
    '..WW....WW......',
    '.....PPPP.......',
    '....PPPPPP......',
    '....PFPPFP......',
    '....PPPPPP......',
    '...PPPPPPPP.....',
    '..PPPGPPGPP.....',
    '..PPPPPPPP......',
    '...PPPPPP.......',
    '...PP..PP.......',
    '...PP..PP.......',
    '................',
    '................',
  ], { W: '#E1F5FE', P: '#CE93D8', F: '#FFCC80', G: '#F48FB1' });
}

function spriteMonkey() {
  return parseSprite([
    '................',
    '..BB....BB......',
    '.BBBB.BBBB......',
    '.BBBBBBBBB......',
    '.BBWBBBWBB......',
    '.BBBBBBBBB......',
    '..BBBBBBB.......',
    '...BWBBWB.......',
    '...BBBBB........',
    '..MMMMMMM.......',
    '..MMMMMMMM......',
    '...MMMMM........',
    '...MM.MM........',
    '...MM.MM........',
    '................',
    '................',
  ], { B: '#8D6E63', W: '#FFFFFF', M: '#A1887F' });
}

function spriteWizard() {
  return parseSprite([
    '......PP........',
    '.....PPPP.......',
    '....PPPPPP......',
    '....PPPPPP......',
    '.....BWWB.......',
    '.....BWOWB......',
    '......WW........',
    '.....PPPP.......',
    '....PPPPPP......',
    '....PPYPPY......',
    '....PPPPPP......',
    '.....PPPP.......',
    '.....BB.BB......',
    '.....BB.BB......',
    '.....BB.BB......',
    '................',
  ], { P: '#5C6BC0', B: '#333333', W: '#FFCC80', O: '#FFFFFF', Y: '#FFD54F' });
}

function spritePrincess() {
  return parseSprite([
    '................',
    '....CCCCCC......',
    '....CCCCCC......',
    '....CCCCCC......',
    '.....BWWB.......',
    '.....BWOWB......',
    '......WW........',
    '.....PPPP.......',
    '....PPPPPP......',
    '...PPPPPPPP.....',
    '...PPRPPPR......',
    '...PPPPPPPP.....',
    '....PPPP........',
    '....PP.PP.......',
    '....PP.PP.......',
    '................',
  ], { C: '#FFD54F', B: '#333333', W: '#FFCC80', O: '#E53935', P: '#EC407A', R: '#F48FB1' });
}

function spriteNinja() {
  return parseSprite([
    '................',
    '................',
    '.....BBBB.......',
    '....BBBBBB......',
    '....BWWWWB......',
    '....BWBBWB......',
    '....BWWWWB......',
    '.....BBBB.......',
    '....BBBBBB......',
    '...BBBBBBBB.....',
    '...BB.BB.BB.....',
    '...BBBBBBBB.....',
    '....BBBBBB......',
    '....BB..BB......',
    '....BB..BB......',
    '................',
  ], { B: '#212121', W: '#424242' });
}

function spriteRobot() {
  return parseSprite([
    '................',
    '.....AAAA.......',
    '....AAAAAA......',
    '....AAGGA.......',
    '....AGGGGA......',
    '....AAGGA.......',
    '.....AAAA.......',
    '....CCCCCC......',
    '...CCCCCCCC.....',
    '...CC.CC.CC.....',
    '...CCCCCCCC.....',
    '....CCCCCC......',
    '....CC..CC......',
    '....CC..CC......',
    '....CC..CC......',
    '................',
  ], { A: '#90A4AE', C: '#78909C', G: '#76FF03' });
}

function spritePanda() {
  return parseSprite([
    '................',
    '..BB....BB......',
    '.BBBB..BBBB.....',
    '.BBBBBBBBBB.....',
    '.BBWWBBWWBB.....',
    '.BBBWBWB BBB....',
    '.BBWWBBWWBB.....',
    '..BBBBBBBB......',
    '...BWBWBW.......',
    '...BBBBBB.......',
    '..WWWWWWWWW.....',
    '..WWWWWWWWW.....',
    '...WW..WW.......',
    '...WW..WW.......',
    '................',
    '................',
  ], { B: '#212121', W: '#FFFFFF' });
}

function spriteDragon() {
  return parseSprite([
    '................',
    '..D.....D.......',
    '.DDDDDDDD.......',
    '.DDGDDGDD.......',
    '.DDDDDDDD.......',
    '..DDDDDDD.......',
    '...DDDDDD.......',
    '..DDDDDDDDD.....',
    '.DDDDDDDDDDD....',
    '.DDDDDDDDDDDD...',
    '.DDDDDDDDDDDD...',
    '..DDDDDDDDD.....',
    '...DDD..DDD.....',
    '...DDD..DDD.....',
    '................',
    '................',
  ], { D: '#388E3C', G: '#FFD54F' });
}

function spritePhoenix() {
  return parseSprite([
    '................',
    '......RR........',
    '.....RYYR.......',
    '....RYYYR.......',
    '....RYOYR.......',
    '...RRYYYRR......',
    '..RRRYYYRRR.....',
    '.RRRRRRRRRRR....',
    '..RRRRRRRRRR....',
    '...RRRRRRRRR....',
    '....RRRRRRRR....',
    '...RRRRRRRR.....',
    '..RR.RR.RR......',
    '.RR..RR..RR.....',
    '................',
    '................',
  ], { R: '#E53935', Y: '#FF9800', O: '#FFD54F' });
}

function spriteGhost() {
  return parseSprite([
    '................',
    '................',
    '....FFFFFF......',
    '...FFFFFFFF.....',
    '..FFF.FF.FFF....',
    '..FF..FF..FF....',
    '..FFFFFFFFF.....',
    '..FFFFFFFFF.....',
    '..FFFFFFFFF.....',
    '..FFFFFFFFF.....',
    '..FFFFFFFFF.....',
    '..FFFFFFFFF.....',
    '..FF.FF.FF......',
    '..F..F..F.......',
    '................',
    '................',
  ], { F: '#E0E0E0' });
}

function spriteAstronaut() {
  return parseSprite([
    '................',
    '.....GGGG.......',
    '....GGGGGG......',
    '....GGBBGG......',
    '....GGGGGG......',
    '.....GGGG.......',
    '....FFFFFF......',
    '...FFFFFFFF.....',
    '...FF.FF.FF.....',
    '...FFFFFFFF.....',
    '....FFFFFF......',
    '....FF..FF......',
    '....FF..FF......',
    '....WW..WW......',
    '................',
    '................',
  ], { G: '#B0BEC5', F: '#ECEFF1', B: '#42A5F5', W: '#78909C' });
}

function spriteSamurai() {
  return parseSprite([
    '................',
    '....BBBBBB......',
    '...BBBBBBBB.....',
    '...BBBBBBBB.....',
    '....BWWWWB......',
    '....BWBBWB......',
    '.....WWWW.......',
    '....RRRRRR......',
    '...RRRRRRRR.....',
    '...RRRRRRRR.....',
    '....RRRRRR......',
    '.....RRRR.......',
    '.....RR.RR......',
    '.....RR.RR......',
    '................',
    '................',
  ], { B: '#212121', W: '#FFCC80', R: '#B71C1C' });
}

function spriteMermaid() {
  return parseSprite([
    '................',
    '......SS........',
    '.....SSSS.......',
    '.....SWWS.......',
    '......SS........',
    '.....PPPP.......',
    '....PPPPPP......',
    '...PPPPPPPP.....',
    '...PPPPPPPPP....',
    '....PPPPPPPPP...',
    '....PP.PP.PPP...',
    '.....PP.PP.PP...',
    '......PP.PP.....',
    '.......PPP......',
    '................',
    '................',
  ], { S: '#FFD54F', W: '#FFCC80', P: '#EC407A' });
}

function spriteDinosaur() {
  return parseSprite([
    '................',
    '...GGGGGGG......',
    '..GGGGGGGGG.....',
    '..GGWGGWGGG.....',
    '..GGGGGGGGG.....',
    '..GGGGGGGGG.....',
    '..GGGGGGGGG.....',
    '..GGGGGGGGGG....',
    '..GGGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '...GGGGGGGGG....',
    '....GGGGGG......',
    '....GG..GG......',
    '....GG..GG......',
    '................',
    '................',
  ], { G: '#66BB6A', W: '#FFFFFF' });
}

function spriteViking() {
  return parseSprite([
    '................',
    '...CCCCCC.......',
    '..CCCCCCC.......',
    '..CCCCCCC.......',
    '...BWWWWB.......',
    '...BWBBWB.......',
    '....WWWW........',
    '...BBBBBB.......',
    '..BBBBBBBB......',
    '..BBBBBBBB......',
    '...BBBBBB.......',
    '....BBBB........',
    '....BB.BB.......',
    '....BB.BB.......',
    '................',
    '................',
  ], { C: '#FFD54F', B: '#5D4037', W: '#FFCC80' });
}

function spriteAlien() {
  return parseSprite([
    '................',
    '.....GGGG.......',
    '....GGGGGG......',
    '...GGGGGGGG.....',
    '...GGWGGWGG.....',
    '...GGGGGGGG.....',
    '....GGGGGG......',
    '....GGGGGG......',
    '...GGGGGGGG.....',
    '..GGGGGGGGGG....',
    '..GGGGGGGGGG....',
    '...GGGGGGGG.....',
    '....GG..GG......',
    '....GG..GG......',
    '................',
    '................',
  ], { G: '#69F0AE', W: '#000000' });
}

function spriteUnicorn() {
  return parseSprite([
    '......YY........',
    '.....YYYY.......',
    '.....WWWW.......',
    '....WWWWWW......',
    '....WGWWGW......',
    '....WWWWWW......',
    '.....WWWW.......',
    '....FFFFFF......',
    '...FFFFFFFF.....',
    '..FFFFFFFFFF....',
    '..FF.FF.FFF.....',
    '..FFFFFFFFFF....',
    '...FFFFFFFF.....',
    '....FF..FF......',
    '....FF..FF......',
    '................',
  ], { Y: '#FFD54F', W: '#F8BBD0', G: '#CE93D8', F: '#FFFFFF' });
}

// ============================================================
// ENEMY / BOSS SPRITES (16x16, more detailed)
// ============================================================

function spriteVineColossus() {
  return parseSprite([
    '..GG....GG......',
    '.GGGG..GGGG.....',
    '.GGGGGGGGGG.....',
    '.GGWGGGGWGG.....',
    '.GGGGGGGGGG.....',
    '..GGRGGRGG......',
    '...GGGGGG.......',
    '..GGGGGGGG......',
    '.GGGGGGGGGG.....',
    '.GGGGGGGGGG.....',
    '.GGGGGGGGGGG....',
    '..GGGGGGGGGG....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '..GGGG..GGGG....',
    '................',
  ], { G: '#2E7D32', W: '#FF0000', R: '#880E4F' });
}

function spriteReefShark() {
  return parseSprite([
    '................',
    '................',
    '.....BBBBB......',
    '....BBBBBBB.....',
    '...BBBWBBBB.....',
    '..BBBBBBBBBB....',
    '.BBBBBBBBBBBB...',
    '.BBBBBBBBBBBBB..',
    '.BBBBBBBBBBBB...',
    '..BBBBBBBBBB....',
    '...BBBBBBBBB....',
    '....BBBBBB......',
    '.....BBBB.......',
    '................',
    '................',
    '................',
  ], { B: '#1565C0', W: '#FFFFFF' });
}

function spriteMagmaDragon() {
  return parseSprite([
    '..R.....R.......',
    '.RRRRRRRR.......',
    '.RROOORRR.......',
    '.RRRRRRRR.......',
    '..RRRRRRRR......',
    '...RRRRRRRR.....',
    '..RRRRRRRRRR....',
    '.RRRRRRRRRRRR...',
    '.RRRRRRRRRRRR...',
    '..RRRRRRRRRRR...',
    '...RRRRRRRRR....',
    '....RRR.RRR.....',
    '....RRR.RRR.....',
    '...RRRR.RRRR....',
    '................',
    '................',
  ], { R: '#BF360C', O: '#FF6D00' });
}

function spriteFrostColossus() {
  return parseSprite([
    '................',
    '....BBBBBB......',
    '...BBBBBBBB.....',
    '...BBWBBWBB.....',
    '...BBBBBBBB.....',
    '....BBBBBB......',
    '...BBBBBBBB.....',
    '..BBBBBBBBBB....',
    '.BBBBBBBBBBBB...',
    '.BBBBBBBBBBBB...',
    '.BBBBBBBBBBBB...',
    '..BBBBBBBBBB....',
    '...BBB..BBB.....',
    '...BBB..BBB.....',
    '..BBBB..BBBB....',
    '................',
  ], { B: '#B3E5FC', W: '#E3F2FD' });
}

function spriteSkyWarden() {
  return parseSprite([
    '......BB........',
    '.....BBBB.......',
    '....BBWBBB......',
    '.....BBBB.......',
    '...BBBBBBBB.....',
    '..BBBBBBBBBB....',
    '.BBBBBBBBBBBB...',
    'BBBBBBBBBBBBBB..',
    '.BBBBBBBBBBBB...',
    '..BBBBBBBBBB....',
    '...BBBBBBBB.....',
    '....BBBBB.......',
    '....BB.BB.......',
    '................',
    '................',
    '................',
  ], { B: '#0288D1', W: '#FFFFFF' });
}

function spriteDarkKing() {
  return parseSprite([
    '..PP....PP......',
    '.PPPP..PPPP.....',
    '.PPPPPPPPPP.....',
    '.PPWPPPPWPP.....',
    '.PPPPPPPPPP.....',
    '..PPPPPPPP......',
    '...PPPPPP.......',
    '..PPPPPPPP......',
    '.PPPPPPPPPP.....',
    '.PPPPPPPPPP.....',
    '..PPPPPPPP......',
    '...PPPPPP.......',
    '...PP..PP.......',
    '...PP..PP.......',
    '................',
    '................',
  ], { P: '#4A148C', W: '#FFD54F' });
}

function spriteCrystalLizard() {
  return parseSprite([
    '................',
    '..CCCCC.........',
    '.CCCCCCC........',
    '.CCWCCCC........',
    '.CCCCCCCC.......',
    '..CCCCCCCC......',
    '...CCCCCCCC.....',
    '...CCCCCCCCC....',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '....CCCCCCCC....',
    '.....CCCCCC.....',
    '......CC.CC.....',
    '......CC.CC.....',
    '................',
    '................',
  ], { C: '#4DD0E1', W: '#E0F7FA' });
}

function spriteStormEagle() {
  return parseSprite([
    '......BB........',
    '.....BBBB.......',
    '....BBYBB.......',
    '...BBBBBBB......',
    '..BBBBBBBBB.....',
    '.BBBBBBBBBBBB...',
    'BBBBBBBBBBBBBB..',
    '.BBBBBBBBBBBB...',
    '..BBBBBBBBBB....',
    '...BBBBBBBB.....',
    '....BBBBB.......',
    '.....BBB........',
    '.....BB.........',
    '................',
    '................',
    '................',
  ], { B: '#5D4037', Y: '#FFD54F' });
}

function spriteShadowBoar() {
  return parseSprite([
    '................',
    '..BB....BB......',
    '.BBBB.BBBB......',
    '.BBBBBBBBB......',
    '.BBWBBBWBB......',
    '.BBBBBBBBB......',
    '..BBBBBBB.......',
    '..BBBBBBB.......',
    '.BBBBBBBBB......',
    '.BBBBBBBBB......',
    '..BBBBBBB.......',
    '...BB.BB........',
    '...BB.BB........',
    '................',
    '................',
    '................',
  ], { B: '#37474F', W: '#FF0000' });
}

function spriteInkKraken() {
  return parseSprite([
    '................',
    '.....BBBB.......',
    '....BBBBBB......',
    '...BBBBBBBB.....',
    '...BBWBBWBB.....',
    '...BBBBBBBB.....',
    '....BBBBBB......',
    '...BBBBBBBB.....',
    '..BBBBBBBBBB....',
    '.BBBBBBBBBBBB...',
    '..BBBBBBBBBB....',
    '...BBBBBBBB.....',
    '................',
    '................',
    '................',
    '................',
  ], { B: '#1A237E', W: '#E3F2FD' });
}

function spriteFireElemental() {
  return parseSprite([
    '..R....RR.......',
    '.RRR..RRRR......',
    '.RROORRRR.......',
    '.RRRRRRRR.......',
    '..RRRRRRR.......',
    '...RRRRRR.......',
    '..RORRROR.......',
    '.RRRRRRRRRR.....',
    '.RRRRRRRRRRR....',
    '..RRRRRRRRR.....',
    '...RRRRRRR......',
    '....RRRRR.......',
    '....RR.RR.......',
    '...RRR.RRR......',
    '................',
    '................',
  ], { R: '#E65100', O: '#FFD54F' });
}

function spriteIceWolf() {
  return parseSprite([
    '..BB....BB......',
    '.BBBB..BBBB.....',
    '.BBBBBBBBBB.....',
    '.BBWBBBWBB......',
    '.BBBBBBBBB......',
    '..BBBBBBB.......',
    '..BBBBBBB.......',
    '.BBBBBBBBB......',
    '.BBBBBBBBBB.....',
    '..BBBBBBB.......',
    '...BBBBB........',
    '....BBB.........',
    '...BB.BB........',
    '...BB.BB........',
    '................',
    '................',
  ], { B: '#B0BEC5', W: '#E3F2FD' });
}

// ============================================================
// CASTLE SPRITES
// ============================================================

function spriteCastleWall() {
  return parseSprite([
    'BBBBBBBBBBBBBBB.',
    'BBRBBBRBBRBBBRB.',
    'BBRBBBRBBRBBBRB.',
    'BBBBBBBBBBBBBBB.',
    'BBRBBBRBBRBBBRB.',
    'BBRBBBRBBRBBBRB.',
    'BBBBBBBBBBBBBBB.',
    'BBRBBBRBBRBBBRB.',
    'BBRBBBRBBRBBBRB.',
    'BBBBBBBBBBBBBBB.',
    'BBRBBBRBBRBBBRB.',
    'BBRBBBRBBRBBBRB.',
    'BBBBBBBBBBBBBBB.',
    'BBRBBBRBBRBBBRB.',
    'BBRBBBRBBRBBBRB.',
    'BBBBBBBBBBBBBBB.',
  ], { B: '#9B8365', R: '#7B6345' });
}

function spriteCastleTower() {
  return parseSprite([
    '...BB..BB.......',
    '..BBBBBBBB......',
    '..B.BBBB.B......',
    '..BBBBBBBB......',
    '..B.BBBB.B......',
    '..BBBBBBBB......',
    '..B.BBBB.B......',
    '..BBBBBBBB......',
    '..B.BBBB.B......',
    '..BBBBBBBB......',
    '..B.BBBB.B......',
    '..BBBBBBBB......',
    '..B.BBBB.B......',
    '..BBBBBBBB......',
    '..B.BBBB.B......',
    '..BBBBBBBB......',
  ], { B: '#78909C' });
}

function spriteCastleGate() {
  return parseSprite([
    'BBBBBBBBBBBBBBB.',
    'BBRBBBRBBRBBBRB.',
    'BBBBBBBBBBBBBBB.',
    'BBRBBBRBBRBBBRB.',
    'BBBBBDDDDBBBBB.',
    'BBRBDDDDDDDbrb.',
    'BBBBDDDDDDDbbb.',
    'BBRBDDDDDDDbrb.',
    'BBBBDDDDDDDbbb.',
    'BBRBDDDDDDDbrb.',
    'BBBBDDDDDDDbbb.',
    'BBRBDDDDDDDbrb.',
    'BBBBDDDDDDDbbb.',
    'BBBBDDDDDDDBBB.',
    'BBBBDDDDDDDBBB.',
    'BBBBBBBBBBBBBBB.',
  ], { B: '#5D4037', R: '#3E2723', D: '#1a1a1a' });
}

function spriteCastleCannon() {
  return parseSprite([
    '................',
    '................',
    '......CCCC......',
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '...CCCCCCCCCC...',
    '...CCCCCCCCCC...',
    '....CCCCCCCC....',
    '.....CCCCCC.....',
    '......CCCC......',
    '....WW....WW....',
    '...WWWW..WWWW...',
    '..WWWWWWWWWWWW..',
    '................',
    '................',
    '................',
  ], { C: '#424242', W: '#795548' });
}

function spriteCastleFlag() {
  return parseSprite([
    '..DD............',
    '..DDRRRR........',
    '..DDRRRR........',
    '..DDRRRR........',
    '..DD............',
    '..DD............',
    '..DD............',
    '..DD............',
    '..DD............',
    '..DD............',
    '..DD............',
    '..DD............',
    '..DD............',
    '..DD............',
    '..DD............',
    '................',
  ], { D: '#5D4037', R: '#E53935' });
}

function spriteCastleCrown() {
  return parseSprite([
    '................',
    '................',
    '.Y.Y.Y.Y.Y.Y...',
    '.YYYYYYYYYYYYY..',
    '.Y.YYYYYYYYY.Y..',
    '.YYYYYYYYYYYYY..',
    '.YYYYYYYYYYYYY..',
    '.YYYYYYYYYYYYY..',
    '..YYYYYYYYYYY...',
    '..YYYYYYYYYYY...',
    '...YYYYYYYYY....',
    '...YYYYYYYYY....',
    '....YYYYYYY.....',
    '....YYYYYYY.....',
    '.....YYYYY......',
    '................',
  ], { Y: '#FFD54F' });
}

function spriteCastleMoat() {
  return parseSprite([
    'BBBBBBBBBBBBBBB.',
    'BBlBBBlBBBlBBBl.',
    'BBBBBBBBBBBBBBB.',
    'BlBBBlBBBlBBBlB.',
    'BBBBBBBBBBBBBBB.',
    'BBlBBBlBBBlBBBl.',
    'BBBBBBBBBBBBBBB.',
    'BlBBBlBBBlBBBlB.',
    'BBBBBBBBBBBBBBB.',
    'BBlBBBlBBBlBBBl.',
    'BBBBBBBBBBBBBBB.',
    'BlBBBlBBBlBBBlB.',
    'BBBBBBBBBBBBBBB.',
    'BBlBBBlBBBlBBBl.',
    'BBBBBBBBBBBBBBB.',
    'BlBBBlBBBlBBBlB.',
  ], { B: '#1565C0', l: '#42A5F5' });
}

function spriteCastleThrone() {
  return parseSprite([
    '..PPPPPPPPPPPP..',
    '..PPPPPPPPPPPP..',
    '..PPYPPYPPYPP...',
    '..PPPPPPPPPPPP..',
    '..PPPPPPPPPPPP..',
    '...PPPPPPPPPP...',
    '...PPPPPPPPPP...',
    '...PPPPPPPPPP...',
    '...PPPPPPPPPP...',
    '...PPPPPPPPPP...',
    '...PPPPPPPPPP...',
    '...PPPPPPPPPP...',
    '...PPPPPPPPPP...',
    '....PPPPPPPP....',
    '................',
    '................',
  ], { P: '#6A1B9A', Y: '#FFD54F' });
}

// ============================================================
// Generate all sprites
// ============================================================

const spriteDefs = {
  'ui/heart_full': spriteHeartFull,
  'ui/heart_empty': spriteHeartEmpty,
  'ui/coin': spriteCoin,
  'ui/star': spriteStar,
  'ui/star_empty': spriteStarEmpty,
  'ui/potion': spritePotion,
  'ui/crystal': spriteCrystal,
  'ui/hint_scroll': spriteHintScroll,
  'ui/treasure_map': spriteTreasureMap,
  'items/life_potion': spriteLifePotion,
  'items/star_boost': spriteStarBoost,
  'items/time_crystal': spriteTimeCrystal,
  'characters/knight': spriteKnight,
  'characters/cat': spriteCat,
  'characters/pirate': spritePirate,
  'characters/fairy': spriteFairy,
  'characters/monkey': spriteMonkey,
  'characters/wizard': spriteWizard,
  'characters/princess': spritePrincess,
  'characters/ninja': spriteNinja,
  'characters/robot': spriteRobot,
  'characters/panda': spritePanda,
  'characters/dragon': spriteDragon,
  'characters/phoenix': spritePhoenix,
  'characters/ghost': spriteGhost,
  'characters/astronaut': spriteAstronaut,
  'characters/samurai': spriteSamurai,
  'characters/mermaid': spriteMermaid,
  'characters/dinosaur': spriteDinosaur,
  'characters/viking': spriteViking,
  'characters/alien': spriteAlien,
  'characters/unicorn': spriteUnicorn,
  'enemies/vine_colossus': spriteVineColossus,
  'enemies/reef_shark': spriteReefShark,
  'enemies/magma_dragon': spriteMagmaDragon,
  'enemies/frost_colossus': spriteFrostColossus,
  'enemies/sky_warden': spriteSkyWarden,
  'enemies/dark_king': spriteDarkKing,
  'enemies/crystal_lizard': spriteCrystalLizard,
  'enemies/storm_eagle': spriteStormEagle,
  'enemies/shadow_boar': spriteShadowBoar,
  'enemies/ink_kraken': spriteInkKraken,
  'enemies/fire_elemental': spriteFireElemental,
  'enemies/ice_wolf': spriteIceWolf,
  'castle/wall': spriteCastleWall,
  'castle/tower': spriteCastleTower,
  'castle/gate': spriteCastleGate,
  'castle/cannon': spriteCastleCannon,
  'castle/flag': spriteCastleFlag,
  'castle/crown': spriteCastleCrown,
  'castle/moat': spriteCastleMoat,
  'castle/throne': spriteCastleThrone,
};

let total = 0;
for (const [name, fn] of Object.entries(spriteDefs)) {
  const dir = outDir(name.split('/')[0]);
  const filename = name.split('/')[1];
  fs.mkdirSync(dir, { recursive: true });
  const grid = fn();
  const svg = gridToSvg(grid);
  const filePath = path.join(dir, `${filename}.svg`);
  fs.writeFileSync(filePath, svg);
  total++;
}

console.log(`Done! Generated ${total} sprites:`);
['ui', 'items', 'characters', 'enemies', 'castle'].forEach(cat => {
  const dir = outDir(cat);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
  console.log(`  ${cat}/: ${files.join(', ')}`);
});
