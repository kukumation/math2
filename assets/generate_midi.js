// Generate MIDI music and SFX for Castle Math Quest
// Run: node assets/generate_midi.js
// Output: assets/audio/music/*.mid, assets/audio/sfx/*.mid

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ============================================================
// MIDI Builder
// ============================================================
class MidiBuilder {
  constructor(bpm = 120, ppqn = 480) {
    this.ppqn = ppqn;
    this.tempo = Math.round(60000000 / bpm); // microseconds per quarter
    this.tracks = [];
  }

  // Variable-length quantity encoding
  vlq(value) {
    if (value < 0) value = 0;
    const bytes = [];
    bytes.push(value & 0x7F);
    value >>= 7;
    while (value > 0) {
      bytes.push((value & 0x7F) | 0x80);
      value >>= 7;
    }
    return Buffer.from(bytes.reverse());
  }

  // Convert note name to MIDI number
  static note(name) {
    const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const match = name.match(/^([A-G])(#?)(\d)$/);
    if (!match) return 60;
    return (parseInt(match[3]) + 1) * 12 + map[match[1]] + (match[2] === '#' ? 1 : 0);
  }

  // Build a single track from events
  buildTrack(events) {
    const parts = [];
    // Tempo meta event
    parts.push(Buffer.from([0x00, 0xFF, 0x51, 0x03]));
    parts.push(Buffer.from([
      (this.tempo >> 16) & 0xFF,
      (this.tempo >> 8) & 0xFF,
      this.tempo & 0xFF
    ]));

    let prevTime = 0;
    for (const ev of events) {
      const delta = Math.max(0, Math.round(ev.time - prevTime));
      parts.push(this.vlq(delta));

      if (ev.type === 'program') {
        parts.push(Buffer.from([0xC0, ev.value & 0x7F]));
      } else if (ev.type === 'note') {
        const noteNum = typeof ev.note === 'string' ? MidiBuilder.note(ev.note) : ev.note;
        const vel = ev.vel || 100;
        parts.push(Buffer.from([0x90, noteNum & 0x7F, vel & 0x7F])); // note on
        // note off will be handled by duration
      } else if (ev.type === 'noteoff') {
        const noteNum = typeof ev.note === 'string' ? MidiBuilder.note(ev.note) : ev.note;
        parts.push(Buffer.from([0x80, noteNum & 0x7F, 0]));
      } else if (ev.type === 'control') {
        parts.push(Buffer.from([0xB0, ev.cc & 0x7F, ev.val & 0x7F]));
      } else if (ev.type === 'end') {
        parts.push(Buffer.from([0xFF, 0x2F, 0x00]));
      }
      prevTime = ev.time;
    }

    const trackData = Buffer.concat(parts);
    const header = Buffer.from('MTrk');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(trackData.length);
    return Buffer.concat([header, len, trackData]);
  }

  // Convenience: add notes as [note, start, duration, velocity]
  addNotes(notes) {
    const events = [];
    for (const n of notes) {
      const noteNum = typeof n[0] === 'string' ? MidiBuilder.note(n[0]) : n[0];
      const start = n[1];
      const dur = n[2] || this.ppqn;
      const vel = n[3] || 100;
      events.push({ type: 'note', note: noteNum, time: start, vel });
      events.push({ type: 'noteoff', note: noteNum, time: start + dur, vel: 0 });
    }
    events.sort((a, b) => a.time - b.time || (a.type === 'noteoff' ? -1 : 1));
    events.push({ type: 'end', time: (events.length > 0 ? events[events.length - 1].time : 0) + this.ppqn });
    return events;
  }

  // Build complete MIDI file
  build(tracks) {
    const allTracks = tracks.map(t => this.buildTrack(t));
    const header = Buffer.from('MThd');
    const hlen = Buffer.alloc(4); hlen.writeUInt32BE(6);
    const format = Buffer.alloc(2); format.writeUInt16BE(0);
    const ntrk = Buffer.alloc(2); ntrk.writeUInt16BE(allTracks.length);
    const div = Buffer.alloc(2); div.writeUInt16BE(this.ppqn);
    return Buffer.concat([header, hlen, format, ntrk, div, ...allTracks]);
  }
}

// ============================================================
// Music Compositions
// ============================================================

const P = ppqn => ppqn; // quarter
const H = ppqn => ppqn * 2; // half
const W = ppqn => ppqn * 4; // whole
const E = ppqn => ppqn / 2; // eighth
const S = ppqn => ppqn / 4; // sixteenth
const D = (dur, ppqn) => dur(ppqn) * 1.5; // dotted

// Note helpers
const N = (name, octave) => name + octave;

// Scale degrees for common scales
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];
const PENTA = [0, 2, 4, 7, 9];

function scaleNote(root, scale, degree, octave) {
  const oct = octave + Math.floor(degree / scale.length);
  const deg = ((degree % scale.length) + scale.length) % scale.length;
  return root + scale[deg] + (oct + 1) * 12;
}

// ============================================================
// HOME THEME - Cheerful, welcoming, C major
// ============================================================
function composeHome() {
  const bpm = 132, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn), s = S(ppqn);

  const melody = [];
  let t = 0;

  // Simple cheerful melody in C major
  const notes = [
    // Phrase 1: C E G C5 B G E C
    ['C4', q], ['E4', q], ['G4', q], ['C5', h], ['B4', e], ['G4', e], ['E4', q], ['C4', q],
    // Phrase 2: D4 F A D5 C5 A F D
    ['D4', q], ['F4', q], ['A4', q], ['D5', h], ['C5', e], ['A4', e], ['F4', q], ['D4', q],
    // Phrase 3: E4 G C5 E5 D5 B4 G4 E4
    ['E4', q], ['G4', q], ['C5', q], ['E5', h], ['D5', e], ['B4', e], ['G4', q], ['E4', q],
    // Phrase 4: F4 A C5 F5 E5 C5 G4 C5
    ['F4', q], ['A4', q], ['C5', q], ['F5', h], ['E5', e], ['C5', e], ['G4', q], ['C5', w],
  ];

  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 100]);
    t += dur;
  }

  // Bass line
  const bass = [];
  const bassNotes = ['C3', 'C3', 'G2', 'C3', 'D3', 'D3', 'A2', 'D3',
                     'E3', 'E3', 'C3', 'E3', 'F3', 'F3', 'G2', 'C3'];
  let bt = 0;
  for (const bn of bassNotes) {
    bass.push([MidiBuilder.note(bn), bt, h, 70]);
    bt += h;
  }

  const melodyEvents = [{ type: 'program', time: 0, value: 1 }]; // Bright piano
  melodyEvents.push(...mb.addNotes(melody, []));
  // We need to re-structure: addNotes returns events, but we prepend program change
  const melEvents = [{ type: 'program', time: 0, value: 1 }, ...mb.addNotes(melody)];
  const bassEvents = [{ type: 'program', time: 0, value: 33 }, ...mb.addNotes(bass)]; // Bass

  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 0 - Forest Meadow (peaceful, G major, flute-like)
// ============================================================
function composeWorld0() {
  const bpm = 100, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['G4', e], ['A4', e], ['B4', q], ['D5', q], ['B4', q], ['G4', h],
    ['E4', e], ['G4', e], ['A4', q], ['B4', q], ['A4', q], ['G4', h],
    ['D5', q], ['E5', q], ['D5', e], ['B4', e], ['G4', q], ['A4', q], ['B4', h],
    ['A4', e], ['G4', e], ['E4', q], ['D4', q], ['G4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 90]);
    t += dur;
  }

  const bass = [];
  const bn = ['G2','G2','E3','G2','C3','C3','D3','G2','G2','E3','D3','G2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 65]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 73 }, ...mb.addNotes(melody)]; // Flute
  const bassEvents = [{ type: 'program', time: 0, value: 40 }, ...mb.addNotes(bass)]; // Violin
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 1 - Crystal Cave (mystical, E minor, bells)
// ============================================================
function composeWorld1() {
  const bpm = 108, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['B4', e], ['E5', q], ['D5', e], ['B4', q], ['A4', e], ['G4', q], ['E4', h],
    ['G4', e], ['A4', e], ['B4', q], ['E5', h], ['D5', q], ['B4', h],
    ['C5', e], ['B4', e], ['A4', q], ['G4', q], ['A4', q], ['B4', h],
    ['E4', e], ['G4', e], ['A4', q], ['B4', q], ['E4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 85]);
    t += dur;
  }

  const bass = [];
  const bn = ['E2','E2','A2','E2','G2','G2','B2','E2','E2','A2','G2','E2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 60]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 14 }, ...mb.addNotes(melody)]; // Tubular bells
  const bassEvents = [{ type: 'program', time: 0, value: 38 }, ...mb.addNotes(bass)]; // Synth bass
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 2 - Lava Lands (dramatic, D minor, brass)
// ============================================================
function composeWorld2() {
  const bpm = 120, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn), s = S(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['D4', q], ['F4', q], ['A4', h], ['G4', q], ['F4', q], ['E4', h],
    ['D4', e], ['E4', e], ['F4', q], ['G4', q], ['A4', q], ['Bb4', q], ['A4', h],
    ['Bb4', q], ['A4', q], ['G4', q], ['F4', q], ['E4', q], ['F4', q], ['D4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 95]);
    t += dur;
  }

  const bass = [];
  const bn = ['D2','D2','A2','D2','G2','G2','D2','D2','Bb2','Bb2','A2','D2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 70]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 61 }, ...mb.addNotes(melody)]; // Brass
  const bassEvents = [{ type: 'program', time: 0, value: 33 }, ...mb.addNotes(bass)]; // Bass
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 3 - Sky Castle (majestic, A major, strings)
// ============================================================
function composeWorld3() {
  const bpm = 96, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['A4', h], ['C#5', q], ['E5', h], ['D5', q], ['C#5', q], ['B4', h],
    ['A4', q], ['B4', q], ['C#5', q], ['E5', h], ['D5', q], ['C#5', h],
    ['E5', h], ['F#5', q], ['E5', q], ['D5', q], ['C#5', q], ['B4', q], ['A4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 88]);
    t += dur;
  }

  const bass = [];
  const bn = ['A2','A2','E3','A2','B2','B2','E3','A2','A2','F#2','E3','A2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 65]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 48 }, ...mb.addNotes(melody)]; // Strings
  const bassEvents = [{ type: 'program', time: 0, value: 44 }, ...mb.addNotes(bass)]; // Tremolo strings
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 4 - Ocean Depths (flowing, F major, marimba)
// ============================================================
function composeWorld4() {
  const bpm = 88, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['F4', e], ['A4', e], ['C5', q], ['A4', q], ['F4', q], ['G4', h],
    ['A4', e], ['C5', e], ['F5', q], ['E5', q], ['C5', q], ['A4', h],
    ['Bb4', e], ['A4', e], ['G4', q], ['F4', q], ['G4', q], ['A4', h],
    ['C5', q], ['A4', q], ['F4', q], ['G4', q], ['F4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 82]);
    t += dur;
  }

  const bass = [];
  const bn = ['F2','F2','C3','F2','Bb2','Bb2','C3','F2','F2','C3','G2','F2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 60]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 12 }, ...mb.addNotes(melody)]; // Marimba
  const bassEvents = [{ type: 'program', time: 0, value: 32 }, ...mb.addNotes(bass)]; // Acoustic bass
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 5 - Shadow Realm (dark, B minor, organ)
// ============================================================
function composeWorld5() {
  const bpm = 112, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['B3', q], ['D4', q], ['F#4', h], ['E4', q], ['D4', q], ['C#4', h],
    ['B3', e], ['D4', e], ['E4', q], ['F#4', q], ['G4', q], ['F#4', q], ['E4', h],
    ['D4', q], ['E4', q], ['F#4', h], ['E4', q], ['D4', q], ['C#4', q], ['B3', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 92]);
    t += dur;
  }

  const bass = [];
  const bn = ['B2','B2','F#3','B2','E2','E2','F#3','B2','B2','F#3','E2','B2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 68]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 19 }, ...mb.addNotes(melody)]; // Church organ
  const bassEvents = [{ type: 'program', time: 0, value: 19 }, ...mb.addNotes(bass)];
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// BOSS THEME - Intense, A minor, fast, driving
// ============================================================
function composeBoss() {
  const bpm = 160, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn), s = S(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    // Driving eighth note pattern
    ['A4', e], ['A4', e], ['E5', e], ['E5', e], ['D5', e], ['D5', e], ['E5', e], ['E5', e],
    ['A4', e], ['A4', e], ['C5', e], ['C5', e], ['B4', e], ['B4', e], ['A4', e], ['A4', e],
    ['E4', e], ['E4', e], ['A4', e], ['A4', e], ['G4', e], ['G4', e], ['A4', e], ['A4', e],
    ['B4', e], ['B4', e], ['C5', e], ['C5', e], ['B4', e], ['B4', e], ['A4', e], ['A4', e],

    ['A4', s], ['B4', s], ['C5', s], ['B4', s], ['A4', s], ['G4', s], ['A4', e],
    ['E5', q], ['D5', q], ['C5', q], ['B4', q],
    ['A4', e], ['C5', e], ['E5', e], ['A5', e], ['E5', e], ['C5', e], ['A4', e], ['E4', e],
    ['A4', q], ['E4', q], ['A4', h],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 110]);
    t += dur;
  }

  // Driving bass
  const bass = [];
  let bt = 0;
  const bassPattern = [
    ['A2', e], ['A2', e], ['A2', e], ['A2', e],
    ['E2', e], ['E2', e], ['E2', e], ['E2', e],
    ['G2', e], ['G2', e], ['G2', e], ['G2', e],
    ['A2', e], ['A2', e], ['E2', e], ['E2', e],
  ];
  for (let rep = 0; rep < 4; rep++) {
    for (const [n, d] of bassPattern) {
      bass.push([MidiBuilder.note(n), bt, d, 80]);
      bt += d;
    }
  }

  const melEvents = [{ type: 'program', time: 0, value: 80 }, ...mb.addNotes(melody)]; // Synth lead
  const bassEvents = [{ type: 'program', time: 0, value: 38 }, ...mb.addNotes(bass)]; // Synth bass
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// VICTORY FANFARE - Triumphant, C major, bright brass
// ============================================================
function composeVictory() {
  const bpm = 140, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['C5', e], ['E5', e], ['G5', q], ['E5', e], ['G5', e], ['C6', h],
    ['B5', e], ['A5', e], ['G5', q], ['E5', q],
    ['F5', e], ['A5', e], ['G5', q], ['F5', e], ['E5', e], ['D5', h],
    ['C5', e], ['E5', e], ['G5', e], ['C6', h], ['G5', e], ['C6', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 115]);
    t += dur;
  }

  // Chord stabs
  const chords = [];
  let ct = 0;
  const chordPairs = [
    [['C4','E4','G4'], q], [['E4','G4','B4'], q], [['F4','A4','C5'], q], [['G4','B4','D5'], q],
    [['C4','E4','G4'], h], [['C4','E4','G4','C5'], w],
  ];
  for (const [chord, dur] of chordPairs) {
    for (const n of chord) {
      chords.push([MidiBuilder.note(n), ct, dur, 80]);
    }
    ct += dur;
  }

  const melEvents = [{ type: 'program', time: 0, value: 61 }, ...mb.addNotes(melody)]; // Brass
  const chordEvents = [{ type: 'program', time: 0, value: 61 }, ...mb.addNotes(chords)];
  return mb.build([melEvents, chordEvents]);
}

// ============================================================
// DEFEAT - Sad, D minor, slow, oboe
// ============================================================
function composeDefeat() {
  const bpm = 72, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['D4', h], ['F4', q], ['A4', h], ['G4', q], ['F4', h],
    ['E4', q], ['F4', q], ['G4', h], ['F4', q], ['E4', q],
    ['D4', h], ['C4', q], ['D4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 80]);
    t += dur;
  }

  const bass = [];
  const bn = ['D2','D2','A2','D2','G2','D2','D2','A2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 55]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 68 }, ...mb.addNotes(melody)]; // Oboe
  const bassEvents = [{ type: 'program', time: 0, value: 42 }, ...mb.addNotes(bass)]; // Cello
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// SOUND EFFECTS (very short MIDI files)
// ============================================================

function composeSfxCorrect() {
  const mb = new MidiBuilder(160, 480);
  const notes = [
    [MidiBuilder.note('C5'), 0, 120, 100],
    [MidiBuilder.note('E5'), 120, 120, 100],
    [MidiBuilder.note('G5'), 240, 360, 110],
  ];
  const events = [{ type: 'program', time: 0, value: 10 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

function composeSfxWrong() {
  const mb = new MidiBuilder(120, 480);
  const notes = [
    [MidiBuilder.note('Bb3'), 0, 240, 100],
    [MidiBuilder.note('A3'), 240, 480, 90],
  ];
  const events = [{ type: 'program', time: 0, value: 10 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

function composeSfxCoin() {
  const mb = new MidiBuilder(180, 480);
  const notes = [
    [MidiBuilder.note('E5'), 0, 80, 100],
    [MidiBuilder.note('G5'), 80, 80, 100],
    [MidiBuilder.note('C6'), 160, 240, 110],
  ];
  const events = [{ type: 'program', time: 0, value: 72 }, ...mb.addNotes(notes)]; // Piccolo
  return mb.build([events]);
}

function composeSfxTick() {
  const mb = new MidiBuilder(200, 480);
  const notes = [
    [MidiBuilder.note('C5'), 0, 60, 80],
  ];
  const events = [{ type: 'program', time: 0, value: 115 }, ...mb.addNotes(notes)]; // Woodblock
  return mb.build([events]);
}

function composeSfxPower() {
  const mb = new MidiBuilder(140, 480);
  const notes = [
    [MidiBuilder.note('C4'), 0, 120, 80],
    [MidiBuilder.note('E4'), 100, 120, 85],
    [MidiBuilder.note('G4'), 200, 120, 90],
    [MidiBuilder.note('C5'), 300, 240, 100],
    [MidiBuilder.note('E5'), 400, 240, 105],
  ];
  const events = [{ type: 'program', time: 0, value: 81 }, ...mb.addNotes(notes)]; // Synth
  return mb.build([events]);
}

function composeSfxBossHit() {
  const mb = new MidiBuilder(100, 480);
  const notes = [
    [MidiBuilder.note('C3'), 0, 200, 120],
    [MidiBuilder.note('E3'), 100, 200, 110],
    [MidiBuilder.note('G2'), 200, 400, 100],
  ];
  const events = [{ type: 'program', time: 0, value: 33 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

function composeSfxBossDefeat() {
  const mb = new MidiBuilder(160, 480);
  const notes = [
    [MidiBuilder.note('C4'), 0, 120, 100],
    [MidiBuilder.note('E4'), 100, 120, 100],
    [MidiBuilder.note('G4'), 200, 120, 100],
    [MidiBuilder.note('C5'), 300, 120, 110],
    [MidiBuilder.note('E5'), 400, 120, 110],
    [MidiBuilder.note('G5'), 500, 120, 115],
    [MidiBuilder.note('C6'), 600, 480, 120],
  ];
  const events = [{ type: 'program', time: 0, value: 61 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

function composeSfxLevelComplete() {
  const mb = new MidiBuilder(150, 480);
  const notes = [
    [MidiBuilder.note('G4'), 0, 160, 90],
    [MidiBuilder.note('C5'), 160, 160, 95],
    [MidiBuilder.note('E5'), 320, 160, 100],
    [MidiBuilder.note('G5'), 480, 480, 110],
  ];
  const events = [{ type: 'program', time: 0, value: 1 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

function composeSfxAchievement() {
  const mb = new MidiBuilder(160, 480);
  const notes = [
    [MidiBuilder.note('C5'), 0, 80, 90],
    [MidiBuilder.note('E5'), 80, 80, 95],
    [MidiBuilder.note('G5'), 160, 80, 100],
    [MidiBuilder.note('C6'), 240, 80, 105],
    [MidiBuilder.note('E6'), 320, 320, 115],
  ];
  const events = [{ type: 'program', time: 0, value: 10 }, ...mb.addNotes(notes)]; // Glockenspiel
  return mb.build([events]);
}

// ============================================================
// Main - write all files
// ============================================================
const baseDir = path.join(__dirname);
const musicDir = path.join(baseDir, 'audio', 'music');
const sfxDir = path.join(baseDir, 'audio', 'sfx');

fs.mkdirSync(musicDir, { recursive: true });
fs.mkdirSync(sfxDir, { recursive: true });

// ============================================================
// WORLD 6 - Crystal Caves (sparkling, C major, celesta)
// ============================================================
function composeWorld6() {
  const bpm = 104, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['E5', e], ['G5', e], ['C6', q], ['B5', e], ['G5', e], ['E5', q], ['D5', h],
    ['C5', e], ['E5', e], ['G5', q], ['C6', h], ['B5', q], ['A5', h],
    ['G5', e], ['A5', e], ['B5', q], ['C6', q], ['B5', q], ['G5', h],
    ['E5', e], ['G5', e], ['C6', q], ['B5', q], ['C6', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 88]);
    t += dur;
  }

  const bass = [];
  const bn = ['C3','C3','G2','C3','A2','A2','F2','C3','C3','G2','G2','C3'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 60]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 8 }, ...mb.addNotes(melody)]; // Celesta
  const bassEvents = [{ type: 'program', time: 0, value: 38 }, ...mb.addNotes(bass)];
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 7 - Thunder Peak (electric, Bb major, synth)
// ============================================================
function composeWorld7() {
  const bpm = 144, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn), s = S(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['Bb4', e], ['D5', e], ['F5', q], ['Eb5', e], ['D5', e], ['C5', q], ['Bb4', h],
    ['F5', q], ['Eb5', e], ['D5', e], ['C5', q], ['D5', q], ['Eb5', h],
    ['F5', e], ['G5', e], ['F5', e], ['Eb5', e], ['D5', q], ['C5', q], ['Bb4', h],
    ['C5', e], ['D5', e], ['Eb5', q], ['F5', q], ['Bb4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 95]);
    t += dur;
  }

  const bass = [];
  const bn = ['Bb2','Bb2','F2','Bb2','Eb2','Eb2','F2','Bb2','Bb2','F2','Eb2','Bb2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 70]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 80 }, ...mb.addNotes(melody)]; // Synth lead
  const bassEvents = [{ type: 'program', time: 0, value: 38 }, ...mb.addNotes(bass)];
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 8 - Enchanted Forest (magical, Ab major, harp)
// ============================================================
function composeWorld8() {
  const bpm = 92, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['Ab4', e], ['C5', e], ['Eb5', q], ['C5', q], ['Ab4', h],
    ['Bb4', e], ['C5', e], ['Eb5', q], ['F5', q], ['Eb5', h],
    ['C5', e], ['Eb5', e], ['Ab5', q], ['G5', e], ['F5', e], ['Eb5', q], ['C5', h],
    ['Bb4', e], ['Ab4', e], ['C5', q], ['Eb5', q], ['Ab4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 82]);
    t += dur;
  }

  const bass = [];
  const bn = ['Ab2','Ab2','Eb3','Ab2','Bb2','Bb2','Eb3','Ab2','Ab2','Eb3','Bb2','Ab2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 58]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 46 }, ...mb.addNotes(melody)]; // Orchestral harp
  const bassEvents = [{ type: 'program', time: 0, value: 42 }, ...mb.addNotes(bass)]; // Cello
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 9 - Sunken Temple (mysterious, Eb minor, gamelan-like)
// ============================================================
function composeWorld9() {
  const bpm = 96, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['Eb4', q], ['Gb4', q], ['Bb4', h], ['Ab4', q], ['Gb4', h],
    ['Eb4', e], ['F4', e], ['Gb4', q], ['Ab4', q], ['Bb4', h],
    ['Cb5', q], ['Bb4', q], ['Ab4', q], ['Gb4', q], ['Eb4', h],
    ['Gb4', e], ['Ab4', e], ['Bb4', q], ['Eb4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 85]);
    t += dur;
  }

  const bass = [];
  const bn = ['Eb2','Eb2','Bb2','Eb2','Ab2','Ab2','Bb2','Eb2','Eb2','Bb2','Ab2','Eb2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 62]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 111 }, ...mb.addNotes(melody)]; // Fiddle
  const bassEvents = [{ type: 'program', time: 0, value: 34 }, ...mb.addNotes(bass)]; // Electric bass
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 10 - Molten Core (aggressive, E phyrygian, distortion)
// ============================================================
function composeWorld10() {
  const bpm = 152, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn), s = S(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['E4', e], ['F4', e], ['G4', q], ['A4', e], ['B4', e], ['C5', q], ['B4', e], ['A4', e], ['G4', q], ['F4', e], ['E4', e],
    ['E4', s], ['F4', s], ['G4', s], ['A4', s], ['B4', e], ['C5', e], ['B4', h],
    ['A4', e], ['G4', e], ['F4', q], ['E4', q], ['F4', q], ['G4', h],
    ['A4', e], ['B4', e], ['C5', q], ['B4', q], ['E4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 100]);
    t += dur;
  }

  const bass = [];
  let bt = 0;
  const bp = [['E2', e], ['E2', e], ['F2', e], ['E2', e], ['A2', e], ['A2', e], ['B2', e], ['E2', e]];
  for (let r = 0; r < 5; r++) { for (const [n, d] of bp) { bass.push([MidiBuilder.note(n), bt, d, 75]); bt += d; } }

  const melEvents = [{ type: 'program', time: 0, value: 29 }, ...mb.addNotes(melody)]; // Overdriven guitar
  const bassEvents = [{ type: 'program', time: 0, value: 33 }, ...mb.addNotes(bass)];
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// WORLD 11 - Frost Citadel (epic, G minor, choir)
// ============================================================
function composeWorld11() {
  const bpm = 84, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    ['G4', h], ['Bb4', q], ['D5', h], ['C5', q], ['Bb4', h],
    ['A4', q], ['G4', q], ['F4', q], ['G4', h], ['Bb4', q],
    ['D5', h], ['Eb5', q], ['D5', q], ['C5', q], ['Bb4', q], ['A4', h],
    ['G4', q], ['F4', q], ['G4', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 90]);
    t += dur;
  }

  const bass = [];
  const bn = ['G2','G2','D3','G2','F2','F2','G2','G2','G2','Eb2','D3','G2'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 65]); bt += h; }

  const melEvents = [{ type: 'program', time: 0, value: 52 }, ...mb.addNotes(melody)]; // Choir aahs
  const bassEvents = [{ type: 'program', time: 0, value: 42 }, ...mb.addNotes(bass)];
  return mb.build([melEvents, bassEvents]);
}

// ============================================================
// CASTLE / BUILDER - Warm, cozy, building vibe, F major, accordion
// ============================================================
function composeCastle() {
  const bpm = 108, ppqn = 480;
  const mb = new MidiBuilder(bpm, ppqn);
  const q = P(ppqn), h = H(ppqn), w = W(ppqn), e = E(ppqn);

  const melody = [];
  let t = 0;
  const notes = [
    // Warm building melody
    ['F4', q], ['A4', q], ['C5', h], ['A4', q], ['G4', q], ['F4', h],
    ['Bb4', q], ['A4', q], ['G4', q], ['F4', q], ['G4', q], ['A4', h],
    ['C5', q], ['D5', q], ['C5', q], ['A4', q], ['G4', q], ['F4', h],
    ['A4', e], ['G4', e], ['F4', q], ['G4', q], ['A4', q], ['C5', w],
  ];
  for (const [note, dur] of notes) {
    melody.push([MidiBuilder.note(note), t, dur, 85]);
    t += dur;
  }

  const bass = [];
  const bn = ['F3','F3','C3','F3','Bb2','Bb2','C3','F3','F3','C3','G2','F3'];
  let bt = 0;
  for (const n of bn) { bass.push([MidiBuilder.note(n), bt, h, 60]); bt += h; }

  // Chords for richness
  const chords = [];
  let ct = 0;
  const chordList = [
    [['F3','A3','C4'], w],
    [['Bb2','D3','F3'], w],
    [['C3','E3','G3'], w],
    [['F3','A3','C4'], w],
    [['F3','A3','C4'], h],
    [['G3','Bb3','D4'], h],
    [['C3','E3','G3'], w],
    [['F3','A3','C4'], w],
  ];
  for (const [chord, dur] of chordList) {
    for (const n of chord) {
      chords.push([MidiBuilder.note(n), ct, dur, 50]);
    }
    ct += dur;
  }

  const melEvents = [{ type: 'program', time: 0, value: 21 }, ...mb.addNotes(melody)]; // Accordion
  const bassEvents = [{ type: 'program', time: 0, value: 40 }, ...mb.addNotes(bass)]; // Violin
  const chordEvents = [{ type: 'program', time: 0, value: 48 }, ...mb.addNotes(chords)]; // Strings
  return mb.build([melEvents, bassEvents, chordEvents]);
}

// ============================================================
// ADDITIONAL SFX - matching actual game sfx() names
// ============================================================

// "ok" - correct answer (ascending arpeggio, bright)
function composeSfxOk() {
  const mb = new MidiBuilder(160, 480);
  const notes = [
    [MidiBuilder.note('C5'), 0, 70, 90],
    [MidiBuilder.note('E5'), 70, 70, 95],
    [MidiBuilder.note('G5'), 140, 70, 100],
    [MidiBuilder.note('C6'), 210, 150, 105],
  ];
  const events = [{ type: 'program', time: 0, value: 10 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "ng" - wrong / damage (descending buzz)
function composeSfxNg() {
  const mb = new MidiBuilder(100, 480);
  const notes = [
    [MidiBuilder.note('A3'), 0, 300, 100],
    [MidiBuilder.note('E3'), 100, 300, 90],
  ];
  const events = [{ type: 'program', time: 0, value: 81 }, ...mb.addNotes(notes)]; // Sawtooth-ish
  return mb.build([events]);
}

// "done" - level complete (triumphant ascending)
function composeSfxDone() {
  const mb = new MidiBuilder(140, 480);
  const notes = [
    [MidiBuilder.note('C5'), 0, 80, 90],
    [MidiBuilder.note('E5'), 80, 80, 92],
    [MidiBuilder.note('G5'), 160, 80, 95],
    [MidiBuilder.note('C6'), 240, 80, 98],
    [MidiBuilder.note('E6'), 320, 80, 100],
    [MidiBuilder.note('G6'), 400, 80, 105],
    [MidiBuilder.note('C7'), 480, 400, 110],
  ];
  const events = [{ type: 'program', time: 0, value: 1 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "bossentry" - boss entrance (dramatic rising)
function composeSfxBossEntry() {
  const mb = new MidiBuilder(120, 480);
  const notes = [
    [MidiBuilder.note('A2'), 0, 70, 100],
    [MidiBuilder.note('C3'), 70, 70, 100],
    [MidiBuilder.note('E3'), 140, 70, 105],
    [MidiBuilder.note('A3'), 210, 70, 105],
    [MidiBuilder.note('C4'), 280, 70, 110],
    [MidiBuilder.note('E4'), 350, 70, 110],
    [MidiBuilder.note('A4'), 420, 70, 115],
    [MidiBuilder.note('E5'), 490, 300, 120],
  ];
  const events = [{ type: 'program', time: 0, value: 81 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "build" - castle build (hammer/tap ascending)
function composeSfxBuild() {
  const mb = new MidiBuilder(160, 480);
  const notes = [
    [MidiBuilder.note('C4'), 0, 60, 80],
    [MidiBuilder.note('E4'), 50, 60, 85],
    [MidiBuilder.note('G4'), 100, 60, 88],
    [MidiBuilder.note('C5'), 150, 60, 92],
    [MidiBuilder.note('E5'), 200, 60, 95],
    [MidiBuilder.note('G5'), 250, 250, 100],
  ];
  const events = [{ type: 'program', time: 0, value: 115 }, ...mb.addNotes(notes)]; // Woodblock/perc
  return mb.build([events]);
}

// "combo" - 3 combo (short fanfare)
function composeSfxCombo() {
  const mb = new MidiBuilder(160, 480);
  const notes = [
    [MidiBuilder.note('E5'), 0, 50, 95],
    [MidiBuilder.note('G5'), 50, 50, 100],
    [MidiBuilder.note('C6'), 100, 150, 108],
  ];
  const events = [{ type: 'program', time: 0, value: 80 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "combo2x" - 4+ combo (bigger fanfare)
function composeSfxCombo2x() {
  const mb = new MidiBuilder(180, 480);
  const notes = [
    [MidiBuilder.note('C5'), 0, 50, 90],
    [MidiBuilder.note('E5'), 50, 50, 95],
    [MidiBuilder.note('G5'), 100, 50, 100],
    [MidiBuilder.note('C6'), 150, 50, 105],
    [MidiBuilder.note('E6'), 200, 250, 115],
  ];
  const events = [{ type: 'program', time: 0, value: 80 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "heal" - potion use (gentle sparkle)
function composeSfxHeal() {
  const mb = new MidiBuilder(140, 480);
  const notes = [
    [MidiBuilder.note('G4'), 0, 80, 80],
    [MidiBuilder.note('B4'), 60, 80, 85],
    [MidiBuilder.note('D5'), 120, 80, 90],
    [MidiBuilder.note('G5'), 180, 80, 95],
    [MidiBuilder.note('B5'), 240, 80, 100],
    [MidiBuilder.note('D6'), 300, 300, 105],
  ];
  const events = [{ type: 'program', time: 0, value: 8 }, ...mb.addNotes(notes)]; // Celesta
  return mb.build([events]);
}

// "unlock" - new world unlocked
function composeSfxUnlock() {
  const mb = new MidiBuilder(140, 480);
  const notes = [
    [MidiBuilder.note('C5'), 0, 80, 85],
    [MidiBuilder.note('E5'), 60, 80, 90],
    [MidiBuilder.note('G5'), 120, 120, 95],
    [MidiBuilder.note('C6'), 200, 120, 100],
    [MidiBuilder.note('E6'), 280, 120, 105],
    [MidiBuilder.note('G6'), 360, 120, 110],
    [MidiBuilder.note('C7'), 440, 400, 115],
  ];
  const events = [{ type: 'program', time: 0, value: 61 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "warning" - low HP warning
function composeSfxWarning() {
  const mb = new MidiBuilder(100, 480);
  const notes = [
    [MidiBuilder.note('E4'), 0, 120, 90],
    [MidiBuilder.note('E4'), 180, 120, 90],
    [MidiBuilder.note('E4'), 360, 200, 95],
  ];
  const events = [{ type: 'program', time: 0, value: 81 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "shop" - purchase sound
function composeSfxShop() {
  const mb = new MidiBuilder(150, 480);
  const notes = [
    [MidiBuilder.note('G4'), 0, 60, 85],
    [MidiBuilder.note('C5'), 60, 60, 90],
    [MidiBuilder.note('E5'), 120, 60, 95],
    [MidiBuilder.note('G5'), 180, 200, 100],
  ];
  const events = [{ type: 'program', time: 0, value: 10 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "whoosh" - transition sound
function composeSfxWhoosh() {
  const mb = new MidiBuilder(120, 480);
  const notes = [
    [MidiBuilder.note('C3'), 0, 100, 80],
    [MidiBuilder.note('C4'), 50, 100, 85],
    [MidiBuilder.note('C5'), 100, 100, 90],
    [MidiBuilder.note('C6'), 150, 200, 80],
  ];
  const events = [{ type: 'program', time: 0, value: 81 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "star" - earning a star
function composeSfxStar() {
  const mb = new MidiBuilder(160, 480);
  const notes = [
    [MidiBuilder.note('E5'), 0, 40, 90],
    [MidiBuilder.note('G5'), 30, 40, 95],
    [MidiBuilder.note('B5'), 60, 40, 100],
    [MidiBuilder.note('E6'), 90, 300, 110],
  ];
  const events = [{ type: 'program', time: 0, value: 8 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

// "miss" - wrong answer subtle
function composeSfxMiss() {
  const mb = new MidiBuilder(100, 480);
  const notes = [
    [MidiBuilder.note('Bb3'), 0, 150, 75],
    [MidiBuilder.note('Ab3'), 120, 150, 70],
    [MidiBuilder.note('G3'), 240, 200, 65],
  ];
  const events = [{ type: 'program', time: 0, value: 68 }, ...mb.addNotes(notes)];
  return mb.build([events]);
}

const musicFiles = [
  ['home.mid', composeHome],
  ['world_0.mid', composeWorld0],
  ['world_1.mid', composeWorld1],
  ['world_2.mid', composeWorld2],
  ['world_3.mid', composeWorld3],
  ['world_4.mid', composeWorld4],
  ['world_5.mid', composeWorld5],
  ['world_6.mid', composeWorld6],
  ['world_7.mid', composeWorld7],
  ['world_8.mid', composeWorld8],
  ['world_9.mid', composeWorld9],
  ['world_10.mid', composeWorld10],
  ['world_11.mid', composeWorld11],
  ['castle.mid', composeCastle],
  ['boss.mid', composeBoss],
  ['victory.mid', composeVictory],
  ['defeat.mid', composeDefeat],
];

const sfxFiles = [
  // Core game sfx (matching sfx() function names)
  ['coin.mid', composeSfxCoin],
  ['ok.mid', composeSfxOk],
  ['ng.mid', composeSfxNg],
  ['done.mid', composeSfxDone],
  ['boss.mid', composeSfxBossHit],
  ['bossentry.mid', composeSfxBossEntry],
  ['power.mid', composeSfxPower],
  ['build.mid', composeSfxBuild],
  ['tick.mid', composeSfxTick],
  ['combo.mid', composeSfxCombo],
  ['combo2x.mid', composeSfxCombo2x],
  // Extra sfx
  ['correct.mid', composeSfxCorrect],
  ['wrong.mid', composeSfxWrong],
  ['boss_defeat.mid', composeSfxBossDefeat],
  ['level_complete.mid', composeSfxLevelComplete],
  ['achievement.mid', composeSfxAchievement],
  ['heal.mid', composeSfxHeal],
  ['unlock.mid', composeSfxUnlock],
  ['warning.mid', composeSfxWarning],
  ['shop.mid', composeSfxShop],
  ['whoosh.mid', composeSfxWhoosh],
  ['star.mid', composeSfxStar],
  ['miss.mid', composeSfxMiss],
];

console.log('=== Generating Music ===');
for (const [name, fn] of musicFiles) {
  const filePath = path.join(musicDir, name);
  const data = fn();
  fs.writeFileSync(filePath, data);
  console.log(`  ${name} (${data.length} bytes)`);
}

console.log('\n=== Generating SFX ===');
for (const [name, fn] of sfxFiles) {
  const filePath = path.join(sfxDir, name);
  const data = fn();
  fs.writeFileSync(filePath, data);
  console.log(`  ${name} (${data.length} bytes)`);
}

console.log(`\nDone! ${musicFiles.length} music + ${sfxFiles.length} SFX files generated.`);
