const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const required = [
  "index.html", "styles.css", "game.js", "service-worker.js", "version.json",
  "manifest.webmanifest", "manifest-3d.webmanifest", "electron-main.cjs",
  "capacitor.config.json", "Assets/BlockableMinimalIcon.png", "Assets/BlockableIcon.svg.png",
  "Assets/pwa/minimal-192.png", "Assets/pwa/minimal-512.png",
  "Assets/pwa/glossy-192.png", "Assets/pwa/glossy-512.png",
];

for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `Missing ${file}`);
execFileSync(process.execPath, ["--check", path.join(root, "game.js")], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", path.join(root, "electron-main.cjs")], { stdio: "inherit" });

const version = JSON.parse(fs.readFileSync(path.join(root, "version.json"), "utf8")).version;
const packageVersion = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
const gameSource = fs.readFileSync(path.join(root, "game.js"), "utf8");
assert.equal(version, packageVersion, "version.json and package.json differ");
assert.match(gameSource, new RegExp(`const VERSION = ["']${version.replaceAll(".", "\\.")}["']`), "game.js version differs");

for (const manifestName of ["manifest.webmanifest", "manifest-3d.webmanifest"]) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestName), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
}

console.log(`Blockable ${version} verification passed.`);
