import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { fileCollectionFromPath } from 'filelist-utils';

import { getToc } from './getToc';

export async function processDataSet(path, options = {}) {
  const { pathToSave = join(__dirname, '../result') } = options;

  if (!existsSync(join(pathToSave, `jcamp`))) {
    mkdirSync(join(pathToSave, `jcamp`), { recursive: true });
  }

  const fileCollection = await fileCollectionFromPath(path);
  const result = [];
  // let nbSample = 0;
  for (const file of fileCollection) {
    if (!file.name.endsWith('.json')) continue;
    const tocs = getToc(JSON.parse(await file.text()));

    for (const toc of tocs) {
      const { jcampURL } = toc;
      if (!jcampURL) {
        continue;
      }
      const fileOfJcamp = fileCollection.files.find((file) =>
        file.relativePath.endsWith(jcampURL),
      );
      writeFileSync(join(pathToSave,'jcamp',fileOfJcamp.name), await fileOfJcamp.text());
      toc.jcampURL = `./jcamp/${fileOfJcamp.name}`;
      result.push(toc);
    }
    // if (nbSample > 20) break;
    // nbSample += 1;
  }
  writeFileSync(`${pathToSave}/toc.json`, JSON.stringify(result));
}
