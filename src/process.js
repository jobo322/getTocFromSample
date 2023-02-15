const { processDataSet } = require('../lib/index');
const { join } = require('path');
const { readFileSync } = require('fs');

// processDataSet(join(__dirname, '../../../icl/data'), { pathToSave: join(__dirname, '../icl')});
processDataSet(join(__dirname, '../data'), { pathToSave: join(__dirname, '../hmdb')});
// const toc = JSON.parse(readFileSync(join(__dirname, '../icl/toc.json'),'utf-8'))

// console.log(toc.length)