import SpellChecker from '../src/SpellChecker.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

export default function SpellCheckerWithDirData(
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
