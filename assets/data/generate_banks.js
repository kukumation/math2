// Question bank generator for Castle Math Quest
// Run with: node generate_banks.js
// This pre-generates question banks per grade for offline use

// We extract the core question generation logic from 05-questions.js
// to generate JSON banks that can be loaded at runtime.

// Each bank file: assets/data/grade{N}.json
// Format: { questions: [ { type, key, icon, display, a, ch, tts } ] }

const GRADE_DIFFICULTY = {
  1: [1, 2, 3],
  2: [2, 3, 4, 5],
  3: [3, 5, 6, 7],
  4: [5, 7, 8, 9],
  5: [7, 9, 10, 11],
  6: [9, 11, 12, 13]
};

const GRADE_TYPES = {
  1: ['add','sub','evenodd','spatial','clock','lineup','shapeseq','oddone','rotshape','mirror'],
  2: ['add','sub','mul','money','word','evenodd','lineup','clock','shapeseq','oddone','rotshape','shadow','mirror','fraction'],
  3: ['add','sub','mul','div','word','pattern','elapsed','money','spatial','multistep','lineup','shapeseq','oddone','rotshape','shadow','mirror','fraction','area_perimeter'],
  4: ['mul','div','multistep','pattern','timediff','logic','word','spatial','money','elapsed','shapeseq','oddone','rotshape','shadow','mirror','fraction','decimal','angle','area_perimeter'],
  5: ['mul','div','multistep','pattern','timediff','logic','word','spatial','money','lineup','elapsed','shapeseq','oddone','rotshape','shadow','mirror','fraction','decimal','percent','ratio','probability','statistics','angle','area_perimeter','algebra'],
  6: ['multistep','pattern','timediff','logic','word','money','lineup','mul','div','spatial','shapeseq','oddone','rotshape','shadow','mirror','fraction','decimal','percent','ratio','algebra','negative','probability','statistics','angle','area_perimeter']
};

// Instructions:
// 1. Include this in the game's loading logic
// 2. On first load, generate N questions per type per difficulty level
// 3. Cache the results in localStorage or IndexedDB
// 4. On subsequent loads, use the cached bank
// 5. The bank is supplemented by online fetch when available

module.exports = { GRADE_DIFFICULTY, GRADE_TYPES };
