import SpellChecker from '../src/SpellChecker.js';

document.getElementById("button").onclick = SpellCheckerWithCurlData;
const output = document.getElementById("output");

async function SpellCheckerWithCurlData(
    _,
    sc = new SpellChecker(),
    url = 'http://127.0.0.1:5500/data/big.txt'
) {
    try {
        output.innerHTML =
            '<div class="loading">Loading data into SpellChecker...</div>';
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = async function () {
            if (this.readyState === 4 && this.status === 200) {
                output.textContent = '';
                sc.addCorpus(this.responseText);
                await runTestSuites(sc);
            }
        };
        xhr.open('GET', url);
        xhr.send();
    } catch (error) {
        console.error(error);
    }
}

async function runTestSuites(sc, filter = []) {

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
        const section = createSection(`${name} Start`);
        output.appendChild(section);
        section.appendChild(createDiv(`${name} Test Suites Initialization`));
        const group = document.createElement('ul');
        section.appendChild(group);
        for (const s of suites) {
            if (verifySuite(s)) {
                group.appendChild(createDiv(`${s.title} Test Suite Verified`));
            } else {
                group.appendChild(createDiv(`${s.title} Test Suite Invalid`));
                return false;
            }
        }
        section.appendChild(createDiv(`${name} Test Suites Start`));
        return true;
    }

    function runSuite(s) {
        const section = createSection(`${name} ${s.title}`);
        output.appendChild(section);
        section.appendChild(createDiv(`${s.title} Test Suite Start: `));
        const group = document.createElement('ul');
        section.appendChild(group);
        for (const [input, test] of s.tests) {
            const cond = s.cond(input, test) && (s.count += 1);
            group.appendChild(createDiv(s.message(cond, input, test)));
        }
        s.record = [s.count, s.tests.length];
        s.percentage = percent(s.count, s.tests.length);
        const result = pass(s.percentage);
        s.result = `${s.title} Test Suite ${result}: ${s.percentage}`;
        section.appendChild(createDiv(s.result));
        return true;
    }

    function finishSuites() {
        const section = createSection(`${name} End`);
        output.appendChild(section);
        section.appendChild(createDiv(`${name} Test Suites Finished`));
        const group = document.createElement('ul');
        section.appendChild(group);
        for (const suite of suites)
            group.appendChild(createDiv(suite.result));
        const { count, total } = suites.reduce((a, s) => ({
            count: a.count + s.count,
            total: a.total + s.tests.length
        }), { count: 0, total: 0 });
        const result = pass(percent(count, total));
        section.appendChild(createDiv(`${name} Test Suite ${result}: ${percent(count, total)}`));
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
        return `${(count / total * 100).toFixed(2)}%`;
    }

    function mark(result) {
        return result ? '✓' : '✗';
    }

    function pass(percentage) {
        return percentage >= threshold ? `Passed` : `Failed`;
    }

    function createSection(text) {
        const section = document.createElement('section');
        section.className = text;
        return section;
    }

    function createDiv(text) {
        const div = document.createElement('div');
        div.innerHTML = text;
        return div;
    }

}
