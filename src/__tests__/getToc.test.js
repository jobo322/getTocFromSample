import { readFileSync } from 'fs';
import { join } from 'path';

import { getToc } from '../getToc';

describe('getToc', () => {
  it('one sample json', async () => {
    const sample = JSON.parse(readFileSync(join(__dirname, 'dataTest/HMDB0000001/sample.json')));
    const toc = getToc(sample);
    expect(toc[0].smiles).toBe("CN1C=NC(C[C@H](N)C(O)=O)=C1");
  });
});
