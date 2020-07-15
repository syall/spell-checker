# spell-checker

## Overview

`spell-checker` is an implementation of a per word Spell Checker, corrections based on edit disstance and word probability from large texts.

## Usage

To use the Spell Checker, only the file [`SpellChecker.js`](src/SpellChecker.js) is needed (with ES6 module support). The method of sourcing text for the SpellChecker is completely dependent on the user (Node.js read files, Browser fetch files, etc.).

```javascript
// Download and Import SpellChecker Class
import SpellChecker from '/path/to/SpellChecker.js';

const text = /* Get Text to Add to SpellChecker */;
const sc = new SpellChecker().addCorpus(text);

const sentence = /* Sentence to Spell Check */;
console.log(
  sentence
    // Split into Words
    .split(' ')
    // Replace Word with Correction
    .map(word => sc.correction(word))
    // Join Corrections into Sentence
    .join(' ')
);
```

## [Demo](https://spell-checker.syall.work)

The demo is a simple HTML/CSS/JS static page located in [`docs/`](docs/)and hosted by GitHub Pages: [`https://spell-checker.syall.work`](https://spell-checker.syall.work).

It should be mentioned that the words inputted may not be corrected to the words a user might expect, largely due to the word probability's weight in deciding on a correction.

For example, when testing a sentence, a user might purposefully mispell `to` as `ot`. However, instead of `to` being returned, `ot` is corrected to `of`. For the Spell Checker, `of` is certainly the best guess given no context; to the user forming the sentence, `of` could be nonsense.

For simplicity's sake, the output is completely lowercase as preserving letter case by position is quite difficult because of delete and insert edits.

## [SpellChecker.js](src/SpellChecker.js)

### Workflow

The workflow for an input word is as follows:

1. Call `correction` on the input word
2. Gather `candidates`:
    a.   If the word is known, go to e
    b.   Do 3, 4 with the word; if known, go to e
    c.   Do 3, 4 on every edit of the word; if known, go to e
    d.   The word is unknown
    e.   Go to 5
3. Gather edits with the given input from `editN`
    i.   Add `deleteEdit`
    ii.  Add `swapEdit`
    iii. Add `replaceEdit`
    iv.  Add `insertEdit`
4. Return edits that are `known`
5. Sort result from 2 with `probabilityComparison`
6. Return the correction with the highest probability

### Corrections

`correction` is the entry point of the Spell Checker. For an input word, the `candidates` are generated from least to most complex: if the word is known, if the words 1 edit away are known, if the words 2 edits away are known, and if the word is unknown. Candidates are arrays of sets, and `known` generates a new set with only known words from these arrays. From the final `known` set, the word with the highest probability is chosen as the correction.

### Simple Edits

Edits of a word from `editN` (`54n+25`) are made by a single operation: either deleting a letter (`n`), swapping two adjacent letters (`n-1`), replacing a letter (`26n`), or inserting a letter (`26(n+1)`). By assuming the word is incorrect, the correct word should be a certain number of edits away (edit distance), assuming less edits correlates with higher correctness. However, to have practical time and space complexity, only words with an edit distance of 2 are considered.

### Text Processing

To add a text, `addCorpus` is called. `processText` first transforms the text to lowercase, then split into words using the regex `/w+/gi`. Once processed, each word is added to the dictionary, updating the word count and total count.

To process the input word for a correction, `processWord` filters out input that do not contain exactly one word, then trimming whitespace from the word and transforming the word to lowercase.

### Probability

Given a set of candidates, the deciding factor for the best correction is each word's probability in the dictionary. The candidates are sorted with `probabilityComparison`, each `getProbability` calculated by `getCount` divided by the total `count`. The candidate with the highest probability is chosen as the correction.

## [Utilities](utils/)

To avoid code repetition, [`SpellCheckerWithDirData`](`utils/SpellCheckerWithDirData.js`) is a Node.js function that adds files from [`data/`](data/) recursively to a Spell Checker. The function is used in the [Node.js test](test/node/test.js) and the [Metrics Script](metrics/stats.js), configured by three parameters:

- `sc`: Spell Checker, default value [`new SpellChecker()`](src/SpellChecker.js)
- `dir`: Directory to read files from, default value [`data/`](data/)
- `verbose`: boolean that logs files, default value `false`

## [Testing](test/)

The testing framework is defined in the function `runTestSuites`. Each run is composed of Test Suites structured with at least these properties:

```javascript
// Suite
{
    title: 'Type of Test Suite', // e.g. 'Unit'
    tests: [
        // [input, test] pair to be passed into cond
        ['teh', 'the'] // e.g. 'teh' corrected to 'the'
        // ...
    ],
    count: 0, // count of tests correct
    // cond: condition for test to pass, e.g. corrected input equal to test
    cond: (input, test) => sc.correction(input) === test,
    // message to output per test, e.g. (Passed|Failed): 'input' to 'test'
    message: (c, i, t) => `${mark(c)} : '${i}' to '${t}'`
}
```

Other features of the framework include:

- Suite Filtering by title via `filter` parameter
- Suite Verification by definition via `verifySuite`
- Starting, Running, Ending Hooks for the process
- Configurable Test Threshold with `90`% default
- Record of Total Test Suites' Results

### Unit Test

Unit Tests are designed to test correction accuracy across different candidate cases.

- For example, `korrectud` requires two edits to correct to `corrected`: replacing `k` with `c` and `u` with `e`.
- On the otherhand, `neverseenyet` is an unknown word, meaning  `neverseenyet` is returned.

### Performance Tests

Performance Tests are designed to ensure an upper bound of time is not passed when generating a correction.

There are two factors that determine performance: word length and edit distance:

- Word length determines the size of the candidate set: the longer the word, the more edits are generated
- The edit distance can be separated into tiers of performance:
  - If the word is known, only one `Map.get` is needed and is constant time : `O(1)`
  - If the word requires one edit, then the calculations are linear: `O(54n+25)`
  - If the word requires two edits or is unknown, run-time is polynomial: `O((54n+25)^2)`

In general, words that are known or require one edit take 1ms or less. Words that require two edits or are unknown polynomially increase with word length. Because of this, each correction can run for across a varied range of times. To prevent tests from failing due to outliers, each test is compared to the average of ten correction runs.

### [Node.js](test/node/)

The test script for Node.js can be run using `yarn test`, results outputting to the terminal.

### [Browser](test/browser)

The browser test can be run using the [Live Server Extension](https://ritwickdey.github.io/vscode-live-server/) in [Visual Studio Code](https://code.visualstudio.com/).

- Host the directory with the Live Server Extension
- Go to [`http://127.0.0.1:5500/test/browser/test.html`](http://127.0.0.1:5500/test/browser/test.html)
- Click the `Run SpellChecker Test Suites` button

The function will fetch [`big.txt`](data/big.txt) from the server and load the data into a SpellChecker to run the test suites. The output will be underneath the button when the test suites are done.

## [Data](data/)

The word counts are calculated by scanning these files in [`data/`](data/):

- [`big.txt`](data/big.txt) used in the original article found on [Norvig's site](https://norvig.com/big.txt)
- [`shakespeare.txt`](data/shakespeare.txt), renamed from `t8.shakespeare.txt`, provided by [MIT's OpenCourseWare](https://ocw.mit.edu/ans7870/6/6.006/s08/lecturenotes/files/t8.shakespeare.txt)
- [anc's `MASC (500K) – data only` zip](http://www.anc.org/data/masc/downloads/data-download/), a vast collection of files ranging from emails to court transcripts

Using these texts provides over 58,000 unique words and over 2.5 million scanned words.

## [Metrics](metrics/)

As the decision making is determined by the data, ensuring the data is semantically correct and consistent is crucial. For the Spell Checker, the chosen metrics are the:

- Top 10 Words' Count & Probability
- Unique Word Count
- Total Word Count

By running `yarn metrics`, the script [`stats.js`](metrics/stats.js) will print to the terminal and write the file `metrics-report_<time-stamp>.txt`.

## Notes

### Inspiration

The project is inspired by [Norvig's guide to writing a Spelling Corrector](https://norvig.com/spell-correct.html). The article has been around since 2007 and has stood the test of time for good reason. However, translating Python into corresponding JavaScript was difficult due to Python's List Comprehensions.

### Motivation

To be honest, the reason I implemented this Spell Checker was because I found the article interesting.

Anyways, I did not realize the methods used formed a simple AI! I had taken [Intro to AI at Rutgers](https://www.cs.rutgers.edu/academics/undergraduate/course-synopses/course-details/01-198-440-introduction-to-artificial-intelligence) and hated it due to the amount of math and probability involved. Not only that, the fields I do enjoy (Programming Language Design and Compilers) are essentially all deterministic, a.k.a. the opposite. Somehow, the article had "tricked" me into enjoying AI. Taking words and keeping word count from the data was training the model stored in a simple JavaScript Map. From there, the heuristics of edit distance and word probability were slipped in: finding known words with as few edits as possible. So, with a single JavaScript class, all of these seemingly complex topics I hated were now implemented by my own hands.
