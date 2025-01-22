// _data/recipes.js

import fs from "fs/promises";
import xml2js from "xml2js";

export default async function() {
    const files = await fs.readdir('./public/beerxml');
    const xmlFiles = files.filter((file) => file.endsWith('.xml'));
    const output = ( // read from each file
    await Promise.all(
      xmlFiles.map(async (file) => {
        const content = await fs.readFile(`./public/beerxml/${file}`, 'utf8');
        var parser = new xml2js.Parser({normalizeTags: true});
        const model = await parser.parseStringPromise(content);
        return {
          file: file.split('.').slice(0, -1).join('.'),
          model,
        }
      })
    )
  )
  return output;
};