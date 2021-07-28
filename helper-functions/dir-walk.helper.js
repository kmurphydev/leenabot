const fs = require("fs");
const path = require("path");

const appDir = path.dirname(require.main.filename);

/**
 * 
 * @param {string} dir - relative path to search through
 * @param {string} ext - extension (e.g. .js) to search for
 * @returns list of files in the directory and all subfolders matching ext
 */
module.exports = function crawl(dir, ext) {
  let fileList = [];

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const relPath = `${dir}/${file}`;
    const fullDir = `${appDir}/${relPath}`;
    if (fs.statSync(fullDir).isDirectory()) {
      fileList= fileList.concat(crawl(relPath, ext));
    } else {
      if (file.endsWith(ext)) {
        console.log(`HIT: ${relPath}`);
        fileList.push(relPath);
      }
    }
  }

  return fileList;
};
