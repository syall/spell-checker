import SpellChecker from './SpellChecker.js';

(async () => {
    console.log('Loading in SpellChecker');

    const input = document.getElementById("input");
    const output = document.getElementById("output");
    const button = document.getElementById("button");
    const clear = document.getElementById("clear");

    const SpellCheckerWithCurlData = async (
        _,
        sc = new SpellChecker(),
        url = 'https://spell-checker.syall.work/big.txt'
    ) => {
        try {
            return sc.addCorpus(await (await fetch(url)).text());
        } catch (error) {
            console.error(error);
        }
    };
    const spellChecker = await SpellCheckerWithCurlData();

    const createSpellCheckInput = sc => () => {
        const text = input.value;
        output.value = '';
        let corrected = '';
        let cur = '';
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            // If c is not part of a word, add c to cur
            if (c.match(/\w/)) cur += c;
            // If not part of a word
            else {
                // If cur is not '', add corrected cur and reset
                if (cur.length > 0) {
                    corrected += sc.correction(cur);
                    cur = '';
                }
                // Add c to corrected
                corrected += c;
            }
        }
        // If text ends with a word, add corrected word
        if (cur.length > 0)
            corrected += sc.correction(cur);
        output.value = corrected;
    };
    button.onclick = createSpellCheckInput(spellChecker);
    clear.onclick = () => output.value = '';

    input.value = [
        'hlep me out!',
        'I konw dnot hoq to spel ym anme.',
        'smauel?',
        'I sstand korrectud.'
    ].join(' ');

    console.log('Finished loading in SpellChecker');
    return spellChecker;
})();
