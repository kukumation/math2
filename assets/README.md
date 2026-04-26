# Assets Directory Structure

## sprites/
Place pixel art PNG sprites here (16x16 or 32x32 preferred).

### Best free sources (CC0 / royalty-free):
- **Kenney.nl** (CC0, best overall):
  - https://kenney.nl/assets/new-platformer-pack (440 assets, tiles+characters+backgrounds)
  - https://kenney.nl/assets/pixel-platformer (200 assets, 18x18 tiles)
  - https://kenney.nl/assets/tiny-dungeon (130 assets, 16x16 dungeon tiles)
  - https://kenney.nl/assets/1-bit-pack (1078 assets, massive variety)
  - https://kenney.nl/assets/ui-pack-rpg-expansion (85 RPG UI elements)
  - https://kenney.nl/assets/game-icons (105 game icons)
- **CraftPix.net/freebies** (royalty-free):
  - Medieval Tileset, Castle Defense Tileset, Dungeon Objects
  - Chibi character sprites (Valkyrie, Skeleton, Pirate, Wizard, Fairy)
  - Fantasy Enemies pack, Slime sprites, Crystal assets
  - Volcano, Winter, Nature environment packs
  - https://craftpix.net/freebies/
- **OpenGameArt.org** (CC0, search "pixel art")
- **itch.io** (many free "commercial use" pixel art packs)

### Needed sprites:
- `characters/` - Player characters (knight, cat, pirate, fairy, wizard, etc.)
- `enemies/` - Boss sprites per world
- `ui/` - Buttons, icons, hearts, coins, stars
- `castle/` - Castle parts (walls, towers, gates, cannons, flags)
- `backgrounds/` - World backgrounds
- `items/` - Potions, crystals, scrolls, treasure maps

## audio/
Place music and sound effect files here (OGG format preferred).

### Best free sources (CC0 / royalty-free):
- **Kenney.nl** (CC0):
  - https://kenney.nl/assets/music-jingles (85 jingles/fanfares)
  - https://kenney.nl/assets/rpg-audio (50 medieval sounds)
  - https://kenney.nl/assets/interface-sounds (100 UI sounds)
  - https://kenney.nl/assets/ui-audio (50 button/click sounds)
- **Mixkit.co** (free license):
  - https://mixkit.co/free-sound-effects/game/ (36 game SFX)
  - https://mixkit.co/free-stock-music/game/ (16 game music tracks)
  - Best: "Winning a coin", "Game level completed", "Medieval show fanfare"
- **Incompetech.com** (CC-BY, Kevin MacLeod) - Full music tracks
- **Freesound.org** - Individual sound effects

### Music files needed:
- `music/home.ogg` - Home screen (cheerful, welcoming)
- `music/world_0.ogg` through `music/world_5.ogg` - World themes
- `music/boss.ogg` - Boss battle (intense, dramatic)
- `music/victory.ogg` - Victory fanfare
- `music/defeat.ogg` - Defeat theme

### Sound effects needed:
- `sfx/correct.ogg` - Correct answer (positive chime)
- `sfx/wrong.ogg` - Wrong answer (negative buzz)
- `sfx/coin.ogg` - Coin earned
- `sfx/tick.ogg` - Button click
- `sfx/power.ogg` - Power-up used
- `sfx/boss_hit.ogg` - Boss hit
- `sfx/boss_defeat.ogg` - Boss defeated (fanfare)
- `sfx/level_complete.ogg` - Level complete
- `sfx/achievement.ogg` - Achievement unlocked

## data/
Question bank JSON files per grade level.
- `grade1.json` through `grade6.json` (auto-generated)
- Run `node assets/data/build_banks.js` to regenerate
- Total: 1766 questions across all grades
