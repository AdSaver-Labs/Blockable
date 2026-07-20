const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "www");
const files = [
  "index.html",
  "styles.css",
  "game.js",
  "version.json",
  "manifest.webmanifest",
  "manifest-3d.webmanifest",
  "service-worker.js",
];
const assets = [
  "BlockableIcon.svg.png",
  "BlockableMinimalIcon.png",
  "pwa/glossy-192.png",
  "pwa/glossy-512.png",
  "pwa/minimal-192.png",
  "pwa/minimal-512.png",
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(output, file));
for (const asset of assets) {
  const destination = path.join(output, "Assets", asset);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, "Assets", asset), destination);
}

console.log(`Synced ${files.length} files and ${assets.length} assets to ${output}`);
