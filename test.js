import SpellChecker from './src/SpellChecker.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

(function main() {
    const sc = new SpellChecker();
    addDirToSpellChecker(sc, join(resolve(), 'data'));
    tests(sc);
})();

function addDirToSpellChecker(sc, dir, verbose = false) {
    try {
        for (const item of readdirSync(dir)) {
            const itemPath = `${dir}/${item}`;
            if (statSync(itemPath).isDirectory()) {
                verbose && console.log(`Recursing into ${itemPath}`);
                addDirToSpellChecker(sc, itemPath, verbose);
            } else {
                verbose && console.log(`Reading from ${itemPath}`);
                sc.addCorpus(readFileSync(itemPath).toString());
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function tests(sc) {

    // Variables
    let c, p, m, t;
    const ps = [], ms = [], n = sc.constructor.name;

    console.clear();
    console.log(`${n} Test Suite Started`);
    console.log();

    // Unit Tests Start
    c = 0;
    t = 'Unit';
    const UT = [
        ['speling', 'spelling'],
        ['korrectud', 'corrected'],
        ['bycycle', 'bicycle'],
        ['inconvient', 'inconvenient'],
        ['arrainged', 'arranged'],
        ['peotry', 'poetry'],
        ['peotryy', 'poetry'],
        ['word', 'word'],
        ['quintessential', 'quintessential'],
        ['teh', 'the']
    ];
    console.log(`${t} Tests:`);
    console.group();
    for (const [bad, good] of UT) {
        const pass = sc.correction(bad) === good && (c += 1);
        console.log(`${mark(pass)} : '${bad}' to '${good}'`);
    }
    console.groupEnd();
    p = cent(c, UT.length);
    m = message(t, p);
    ms.push(m);
    ps.push([c, UT.length]);
    console.log(m);
    console.log();
    // Unit Tests End

    // Performance Tests Start
    c = 0;
    t = 'Performance';
    const PT = [
        ['speling', 50],
        ['korrectud', 100],
        ['bycycle', 50],
        ['inconvient', 100],
        ['arrainged', 50],
        ['peotry', 50],
        ['peotryy', 100],
        ['word', 25],
        ['neverseen', 200],
        ['teh', 50]
    ];
    console.log(`${t} Tests:`);
    console.group();
    for (const [word, low] of PT) {
        const start = new Date();
        sc.correction(word);
        const time = new Date() - start;
        const pass = time <= low && (c += 1);
        console.log(`${mark(pass)} : '${word}' done in ${time}ms < ${low}ms`);
    }
    console.groupEnd();
    p = cent(c, PT.length);
    m = message(t, p);
    ms.push(m);
    ps.push([c, PT.length]);
    console.log(m);
    console.log();
    // Performance Tests End

    console.log(`${sc.constructor.name} Test Suite Finished`);
    console.group();
    for (const r of ms)
        console.log(r);
    console.groupEnd();
    let fp = 0, fc = 0;
    for (const [ap, ac] of ps)
        (fp += ap) && (fc += ac);
    console.log(message(`${n}`, cent(fp, fc)));
    console.log();

}

function message(t, c) {
    return `${t} Tests Result: ${c}%`;
}

function cent(c, t) {
    return `${(c / t * 100).toFixed(2)}`;
}

function mark(result) {
    return result ? '✓' : '✗';
}
