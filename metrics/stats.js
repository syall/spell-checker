import SpellCheckerWithDirData from '../utils/SpellCheckerWithDirData.js';

const sc = SpellCheckerWithDirData();
const arraySc = Array.from(sc.dictionary);

console.log(`Metrics Report:`);

const top = 10;
const tw = arraySc.sort(([_1, v1], [_2, v2]) => v2 - v1).slice(0, top);
const tp = tw.map(([k, _]) => sc.getProbability(k));
console.log(`- Top ${top} Words:`);
console.group();
for (let i = 0; i < top; i++) {
    const word = tw[i][0];
    const count = tw[i][1].toLocaleString();
    const cent = `${(tp[i] * 100).toFixed(2)}%`;
    console.log(`- ${word}: ${count} at ${cent}`);
}
console.groupEnd();

const uniqueWordCount = sc.dictionary.size;
console.log(`- Unique Word Count: ${uniqueWordCount.toLocaleString()}`);

const totalWordCount = arraySc.reduce((t, [_, v1]) => t + v1, 0);
console.log(`- Total Words Scanned: ${totalWordCount.toLocaleString()}`);
