import SpellChecker from './src/SpellChecker.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

runTestSuites(SpellCheckerWithDirData());

function SpellCheckerWithDirData(
    sc = new SpellChecker(),
    dir = join(resolve(), 'data'),
    verbose = false
) {
    try {
        for (const item of readdirSync(dir)) {
            const itemPath = `${dir}/${item}`;
            if (statSync(itemPath).isDirectory()) {
                verbose && console.log(`Recursing into ${itemPath}`);
                SpellCheckerWithDirData(sc, itemPath, verbose);
            } else {
                verbose && console.log(`Reading from ${itemPath}`);
                sc.addCorpus(readFileSync(itemPath).toString());
            }
        }
        return sc;
    } catch (error) {
        console.error(error);
    }
}

function runTestSuites(sc, filter = []) {

    const name = sc.constructor.name;
    const threshold = 90;
    const suites = [
        {
            title: 'Unit',
            tests: [
                // Known
                ['word', 'word'],
                // 1 Edit
                ['teh', 'the'],
                ['peotry', 'poetry'],
                ['speling', 'spelling'],
                ['bycycle', 'bicycle'],
                ['arrainged', 'arranged'],
                // 2 Edits
                ['peotryy', 'poetry'],
                ['korrectud', 'corrected'],
                ['inconvient', 'inconvenient'],
                // Unknown
                ['neverseenyet', 'neverseenyet']
            ],
            count: 0,
            cond: (input, test) => sc.correction(input) === test,
            message: (c, i, t) => `${mark(c)} : '${i}' to '${t}'`
        },
        {
            title: 'Performance',
            tests: [
                // Known
                ['word', 1],
                // 1 Edit
                ['teh', 1],
                ['peotry', 1],
                ['speling', 1],
                ['bycycle', 1],
                ['arrainged', 1],
                // 2 Edits
                ['peotryy', 120],
                ['korrectud', 160],
                ['inconvient', 240],
                // Unknown
                ['neverseenyet', 360]
            ],
            count: 0,
            cond: (input, test) => {
                const count = 10;
                let time = 0;
                for (let i = 0; i < count; i++) {
                    const start = new Date();
                    sc.correction(input);
                    time += new Date() - start;
                }
                return time / count <= test;
            },
            message: (c, i, t) => `${mark(c)} : '${i}' corrected in <= ${t}ms`
        }
    ].filter(s => !filter.includes(s.title));

    startSuites() && suites.forEach(suite => runSuite(suite)) || finishSuites();

    function startSuites() {
        console.clear();
        console.log(`${name} Test Suites Initialization`);
        console.group();
        for (const s of suites) {
            if (verifySuite(s)) console.log(`${s.title} Test Suite Verified`);
            else return console.log(`${s.title} Test Suite Invalid`) && false;
        }
        console.groupEnd();
        console.log(`${name} Test Suites Start`);
        console.log();
        return true;
    }

    function runSuite(s) {
        console.log(`${s.title} Test Suite Start: `);
        console.group();
        for (const [input, test] of s.tests) {
            const cond = s.cond(input, test) && (s.count += 1);
            console.log(s.message(cond, input, test));
        }
        console.groupEnd();
        s.record = [s.count, s.tests.length];
        s.percentage = percent(s.count, s.tests.length);
        const result = pass(s.percentage);
        s.result = `${s.title} Test Suite ${result}: ${s.percentage}`;
        console.log(s.result);
        console.log();
        return true;
    }

    function finishSuites() {
        console.log(`${name} Test Suites Finished`);
        console.group();
        for (const suite of suites)
            console.log(suite.result);
        console.groupEnd();
        const { count, total } = suites.reduce((a, s) => ({
            count: a.count + s.count,
            total: a.total + s.tests.length
        }), { count: 0, total: 0 });
        const result = pass(percent(count, total));
        console.log(`${name} Test Suite ${result}: ${percent(count, total)}`);
        console.log();
    }

    function verifySuite(s) {
        return (
            s.title &&
            s.tests.length > 0 &&
            s.count === 0 &&
            s.cond &&
            s.message
        );
    }

    function percent(count, total) {
        return `${(count / total * 100).toFixed(2)}`;
    }

    function mark(result) {
        return result ? '✓' : '✗';
    }

    function pass(percentage) {
        return percentage >= threshold ? `Passed` : `Failed`;
    }

}
