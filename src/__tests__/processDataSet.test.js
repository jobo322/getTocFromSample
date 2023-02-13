import { existsSync, readFileSync, rmdirSync } from 'fs';
import { join } from 'path';

import { processDataSet } from "../processDataSet";

describe('process Data set', () => {
  it('simple dataset', async () => {
    const pathToSave = join(__dirname, 'result');
    await processDataSet(join(__dirname, 'dataTest'), { pathToSave });

    expect(existsSync(join(pathToSave, 'toc.json'))).toBe(true);
    expect(existsSync(join(pathToSave, 'jcamp'))).toBe(true);
    expect(existsSync(join(pathToSave, 'jcamp/HMDB0000001_1022.jdx'))).toBe(true);

    const toc = JSON.parse(readFileSync(join(pathToSave, 'toc.json')));

    expect(toc[0].smiles).toBe("CN1C=NC(C[C@H](N)C(O)=O)=C1");
    rmdirSync(join(__dirname, 'result'), { recursive: true, force: true });
  })
})