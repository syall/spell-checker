export default class SpellChecker {

    dictionary = new Map();
    textToWords = /\w+/gi;
    letters = [...'abcdefghijklmnopqrstuvwxyz'];
    count = 0;

    correction(word) {
        const result = Array.from(this.candidates(word));
        result.sort(this.probabilityComparison);
        return result[0];
    }

    candidates(word) {
        return (
            this.known([new Set([word])]) ||
            this.known(this.editN(word, 1)) ||
            this.known(this.editN(word, 2)) ||
            [word]
        );
    }

    known(wordSets) {
        const result = new Set();
        for (const wordSet of wordSets) {
            wordSet.forEach(w => this.dictionary.get(w) && result.add(w));
        }
        return result.size !== 0 ? result : false;
    }

    editN(word, n) {
        /** 1 Edit Case: 54n+25 */
        if (n === 1) {
            // Delete 1 letter: n
            const deletes = this.deleteEdit(word);
            // Swap 2 letters: n-1
            const swaps = this.swapEdit(word);
            // Replace 1 letter: 26n
            const replaces = this.replaceEdit(word);
            // Insert 1 letter: 26(n+1)
            const inserts = this.insertEdit(word);
            return [new Set([...swaps, ...deletes, ...replaces, ...inserts])];
        }
        /** 2 Edits Case: */
        else if (n === 2) {
            const result = [];
            for (const wordSet of this.editN(word, 1))
                wordSet.forEach(w => result.push(...this.editN(w, 1)));
            return result;
        }
        /** Error Case */
        else throw new Error(`n must be 1 or 2, got ${n}`);
    }

    deleteEdit(word) {
        const result = new Set();
        for (let i = 0; i < word.length; i++)
            result.add(`${word.slice(0, i)}${word.slice(i + 1)}`);
        return result;
    }

    swapEdit(w) {
        const result = new Set();
        for (let i = 0; i < w.length - 1; i++) {
            const before = w.slice(0, i), after = w.slice(i + 2);
            const swap1 = w.slice(i, i + 1), swap2 = w.slice(i + 1, i + 2);
            result.add(`${before}${swap2}${swap1}${after}`);
        }
        return result;
    }

    replaceEdit(word) {
        const result = new Set();
        for (let i = 0; i < word.length; i++) for (const l of this.letters)
            result.add(`${word.slice(0, i)}${l}${word.slice(i + 1)}`);
        return result;
    }

    insertEdit(word) {
        const result = new Set();
        for (let i = 0; i <= word.length; i++) for (const l of this.letters)
            result.add(`${word.slice(0, i)}${l}${word.slice(i)}`);
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
        const r = word.match(this.textToWords);
        return r && r.length === 1 ? word.trim().toLowerCase() : false;
    }

    getProbability(word) {
        return this.getCount(word) / this.count;
    }

    getCount(word) {
        return this.dictionary.get(this.processWord(word)) || 0;
    }

    probabilityComparison = (word1, word2) => {
        return this.getProbability(word2) - this.getProbability(word1);
    };

}
