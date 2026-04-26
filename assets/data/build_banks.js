// Node.js script to generate question bank JSON files per grade
// Run: cd math && node assets/data/build_banks.js
// This creates grade1.json through grade6.json in assets/data/

const fs = require('fs');
const path = require('path');

// Load all game code (simple eval approach for Node)
const loadOrder = [
  'js/01-utils.js',
  'js/02-save.js',
  'js/03-data.js',
  'js/04-achievements.js',
  'js/05-questions.js'
];

// Mock browser environment
global.document = {
  getElementById: () => ({ innerHTML: '', classList: { add: () => {}, remove: () => {} }, style: {}, textContent: '' }),
  querySelectorAll: () => [],
  createElement: () => ({ className: '', textContent: '', style: {}, innerHTML: '' }),
  addEventListener: () => {}
};
global.window = global;
global.localStorage = { getItem: () => null, setItem: () => {} };
global.navigator = { onLine: false };
global.confirm = () => true;
global.setTimeout = setTimeout;

// Load game code
const baseDir = path.join(__dirname, '..', '..');
let combined = '';
loadOrder.forEach(f => {
  combined += fs.readFileSync(path.join(baseDir, f), 'utf8') + '\n';
});
try {
  eval(combined);
} catch (e) {
  console.error('Error loading game code:', e.message);
  process.exit(1);
}

// Now we have access to GENS, ALL_TYPES, GRADE_TYPES, diff, mkC, etc.

const GRADE_DIFFICULTY = {
  1: [1, 2, 3],
  2: [2, 3, 4, 5],
  3: [3, 5, 6, 7],
  4: [5, 7, 8, 9],
  5: [7, 9, 10, 11],
  6: [9, 11, 12, 13]
};

const QUESTIONS_PER_TYPE = 20;
const outputDir = path.join(__dirname);

for (let grade = 1; grade <= 6; grade++) {
  S.grade = grade;
  const types = GRADE_TYPES[grade];
  const diffs = GRADE_DIFFICULTY[grade];
  const questions = [];
  const seenKeys = new Set();

  types.forEach(type => {
    if (!GENS[type]) return;
    for (let i = 0; i < QUESTIONS_PER_TYPE; i++) {
      const d = diffs[i % diffs.length];
      try {
        const q = GENS[type](d);
        if (q && !seenKeys.has(q.key)) {
          seenKeys.add(q.key);
          questions.push({
            type: q.type,
            key: q.key,
            icon: q.i,
            display: q.render && q.display ? q.display : null,
            a: q.a,
            ch: q.ch,
            tts: q.tts || null
          });
        }
      } catch (e) {
        // Skip failed question generation
      }
    }
  });

  const outputFile = path.join(outputDir, `grade${grade}.json`);
  const data = {
    grade: grade,
    ageRange: grade === 1 ? '6-7' : grade === 2 ? '7-8' : grade === 3 ? '8-9' : grade === 4 ? '9-10' : grade === 5 ? '10-11' : '11-12',
    types: types,
    totalQuestions: questions.length,
    questions: questions
  };

  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log(`Grade ${grade}: ${questions.length} questions (${types.length} types) → grade${grade}.json`);
}

console.log('\nDone! Question banks saved to assets/data/');
