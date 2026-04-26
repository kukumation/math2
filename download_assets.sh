#!/bin/bash
# Download free game assets for Castle Math Quest
# Run this script to fetch CC0/public domain assets
# Requires: curl, unzip

ASSETS_DIR="$(dirname "$0")/assets"
SPRITE_DIR="$ASSETS_DIR/sprites"
AUDIO_DIR="$ASSETS_DIR/audio"

echo "=== Downloading Castle Math Quest Assets ==="
echo ""

# ---- KENNEY NL (CC0) ----
echo "[1/4] Downloading Kenney Interface Sounds..."
mkdir -p /tmp/kenney_ui
curl -sL "https://kenney.nl/media/13370/kenney_interfaceandsounds.zip" -o /tmp/kenney_ui/ui.zip
if [ -f /tmp/kenney_ui/ui.zip ]; then
  unzip -qo /tmp/kenney_ui/ui.zip -d /tmp/kenney_ui/
  # Copy relevant sounds
  cp /tmp/kenney_ui/Audio/click*.ogg "$AUDIO_DIR/sfx/tick.ogg" 2>/dev/null || true
  cp /tmp/kenney_ui/Audio/switch*.ogg "$AUDIO_DIR/sfx/switch.ogg" 2>/dev/null || true
  echo "  Done."
else
  echo "  Failed to download."
fi

echo ""
echo "[2/4] Downloading Kenney Music Jingles..."
mkdir -p /tmp/kenney_music
curl -sL "https://kenney.nl/media/13739/kenney_musicjingles.zip" -o /tmp/kenney_music/music.zip
if [ -f /tmp/kenney_music/music.zip ]; then
  unzip -qo /tmp/kenney_music/music.zip -d /tmp/kenney_music/
  echo "  Done."
else
  echo "  Failed to download."
fi

echo ""
echo "[3/4] Downloading Kenney RPG Audio..."
mkdir -p /tmp/kenney_rpg
curl -sL "https://kenney.nl/media/13732/kenney_rpgaudio.zip" -o /tmp/kenney_rpg/rpg.zip
if [ -f /tmp/kenney_rpg/rpg.zip ]; then
  unzip -qo /tmp/kenney_rpg/rpg.zip -d /tmp/kenney_rpg/
  echo "  Done."
else
  echo "  Failed to download."
fi

echo ""
echo "[4/4] Downloading Kenney Game Assets..."
mkdir -p /tmp/kenney_game
curl -sL "https://kenney.nl/media/13736/kenney_gameaudio.zip" -o /tmp/kenney_game/game.zip
if [ -f /tmp/kenney_game/game.zip ]; then
  unzip -qo /tmp/kenney_game/game.zip -d /tmp/kenney_game/
  echo "  Done."
else
  echo "  Failed to download."
fi

echo ""
echo "=== Asset download complete ==="
echo "Please manually organize the downloaded files into:"
echo "  $AUDIO_DIR/music/  (background music OGG files)"
echo "  $AUDIO_DIR/sfx/    (sound effect OGG files)"
echo "  $SPRITE_DIR/       (pixel art PNG files)"
