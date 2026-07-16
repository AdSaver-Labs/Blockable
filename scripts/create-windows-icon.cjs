const fs = require("node:fs/promises");
const path = require("node:path");
const pngToIcoModule = require("png-to-ico");
const pngToIco = pngToIcoModule.default || pngToIcoModule;

const root = path.resolve(__dirname, "..");
const source = path.join(root, "Assets", "BlockableIcon.svg.png");
const destination = path.join(root, "Assets", "Blockable.ico");

pngToIco(source)
  .then((buffer) => fs.writeFile(destination, buffer))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
