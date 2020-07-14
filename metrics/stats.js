import SpellCheckerWithDirData from '../utils/SpellCheckerWithDirData.js';
import { writeFileSync } from 'fs';
import { resolve, join } from 'path';

const sc = SpellCheckerWithDirData();
const arraySc = Array.from(sc.dictionary);
const file = [];

// Title
writeLine(`Metrics Report:`);

// Top 10
const top = 10;
const tw = arraySc.sort(([_1, v1], [_2, v2]) => v2 - v1).slice(0, top);
const tp = tw.map(([k, _]) => sc.getProbability(k));
writeLine(`- Top ${top} Words:`);
for (let i = 0; i < top; i++) {
    const word = tw[i][0];
    const count = tw[i][1].toLocaleString();
    const cent = `${(tp[i] * 100).toFixed(2)}%`;
    writeLine(`  - ${word}: ${count} at ${cent}`);
}

// Unique Word Count
const uniqueWordCount = sc.dictionary.size;
writeLine(`- Unique Word Count: ${uniqueWordCount.toLocaleString()}`);

// Total Word Count
const totalWordCount = arraySc.reduce((t, [_, v1]) => t + v1, 0);
writeLine(`- Total Words Scanned: ${totalWordCount.toLocaleString()}`);

// Create Metrics Report
createMetricsReport();

// Helper Functions
function writeLine(line) {
    console.log(line);
    file.push(line);
}
function createMetricsReport() {
    writeFileSync(join(resolve(), 'metrics', 'metrics-report.txt'), file.join('\n'));
}
