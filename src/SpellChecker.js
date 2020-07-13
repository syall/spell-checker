export default class SpellChecker {

    dictionary = new Map();
    textToWords = /\w+/gi;
    letters = [...'abcdefghijklmnopqrstuvwxyz'];

    correction(word) {
        const result = this.candidates(word);
        result.sort(this.probabilityComparison);
        return result[0];
    }

    candidates(word) {
        return (
            this.known([word]) ||
            this.known(this.editN(word, 1)) ||
            this.known(this.editN(word, 2)) ||
            [word]
        );
    }

    known(words) {
        const result = [];
        for (const word of words)
            if (this.dictionary.get(word))
                result.push(word);
        return result.length !== 0
            ? result
            : false;
    }

    editN(word, n) {

        if (n < 1)
            throw new Error(`n must be >= 1, got ${n}`);

        const result = [];
        // Recursive Case
        if (n > 1)
            for (const p of this.editN(word, n - 1))
                result.push(p, ...this.editN(p, n - 1));
        // Base Case: 54n+25
        for (let i = 0; i <= word.length; i++) {
            if (i < word.length - 1)
                // Swap 2 letters: n-1
                result.push(`${word.slice(0, i)}${word.slice(i + 1, i + 2)}${word.slice(i, i + 1)}${word.slice(i + 2)}`);
            if (i < word.length) {
                // Delete 1 letter: n
                result.push(`${word.slice(0, i)}${word.slice(i + 1)}`);
                // Replace 1 letter: 26n
                for (const l of this.letters)
                    result.push(`${word.slice(0, i)}${l}${word.slice(i + 1)}`);
            }
            if (i <= word.length)
                // Insert 1 letter: 26(n+1)
                for (const l of this.letters)
                    result.push(`${word.slice(0, i)}${l}${word.slice(i)}`);
        }

        return result;
    }

    addCorpus(text) {
        for (const word of this.processText(text)) {
            const exists = this.dictionary.get(word);
            this.dictionary.set(word, exists ? exists + 1 : 1);
            this.count += 1;
        }
        return this;
    }

    processText(text) {
        return text.toLowerCase().match(this.textToWords);
    }

    processWord(word) {
        const result = word.match(this.textToWords);
        return result && result.length === 1
            ? word.trim().toLowerCase()
            : false;
    }

    getProbability(word) {
        return this.getCount(word) / this.dictionary.size;
    }

    getCount(word) {
        return this.dictionary.get(this.processWord(word)) || 0;
    }

    probabilityComparison = (word1, word2) => {
        return this.getProbability(word2) - this.getProbability(word1);
    };

}
