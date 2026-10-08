const fs = require("node:fs/promises");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const assets = path.join(root, "Assets");
const source = path.join(assets, "BlockablePuzzleLoopSource.png");
const background = "#2b2d31";
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

async function padded(size, fraction) {
  const inner = Math.round(size * fraction);
  const image = await sharp(source).resize(inner, inner).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: image, gravity: "centre" }]).removeAlpha().png().toBuffer();
}

async function main() {
  // The chosen artwork is unchanged; platform exports only resize, pad, or mask it.
  await sharp(source).resize(1024, 1024).removeAlpha().png().toFile(path.join(assets, "BlockableAppIcon.png"));
  const image = await sharp(source).resize(920, 920).png().toBuffer();
  const mask = Buffer.from('<svg width="1024" height="1024"><path fill="white" d="M282 52H742C896 52 972 128 972 282V742C972 896 896 972 742 972H282C128 972 52 896 52 742V282C52 128 128 52 282 52Z"/></svg>');
  const desktop = await sharp({ create: { width: 1024, height: 1024, channels: 4, background: transparent } })
    .composite([{ input: image, left: 52, top: 52 }]).png().toBuffer();
  await sharp(desktop).composite([{ input: mask, blend: "dest-in" }]).png().toFile(path.join(assets, "BlockableDesktopIcon.png"));

  const pwa = path.join(assets, "pwa");
  await fs.mkdir(pwa, { recursive: true });
  for (const size of [192, 512]) {
    await sharp(source).resize(size, size).removeAlpha().png().toFile(path.join(pwa, `app-${size}.png`));
    await fs.writeFile(path.join(pwa, `maskable-${size}.png`), await padded(size, 0.65));
  }
  await sharp(source).resize(180, 180).removeAlpha().png().toFile(path.join(pwa, "apple-touch-icon.png"));
  await sharp(source).resize(1024, 1024).removeAlpha().png().toFile(path.join(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"));

  for (const [density, size, adaptiveSize] of [["mdpi", 48, 108], ["hdpi", 72, 162], ["xhdpi", 96, 216], ["xxhdpi", 144, 324], ["xxxhdpi", 192, 432]]) {
    const folder = path.join(root, "android/app/src/main/res", `mipmap-${density}`);
    await sharp(source).resize(size, size).removeAlpha().png().toFile(path.join(folder, "ic_launcher.png"));
    await fs.writeFile(path.join(folder, "ic_launcher_round.png"), await padded(size, 0.65));
    await fs.writeFile(path.join(folder, "ic_launcher_foreground.png"), await padded(adaptiveSize, 60 / 108));
  }

  if (process.platform === "darwin") {
    const folder = path.join(assets, "AppIcon.iconset");
    await fs.mkdir(folder, { recursive: true });
    for (const size of [16, 32, 128, 256, 512]) for (const scale of [1, 2]) {
      await sharp(path.join(assets, "BlockableDesktopIcon.png")).resize(size * scale, size * scale).png()
        .toFile(path.join(folder, `icon_${size}x${size}${scale === 2 ? "@2x" : ""}.png`));
    }
    execFileSync("iconutil", ["-c", "icns", folder, "-o", path.join(assets, "Blockable.icns")]);
  }
  console.log("Exported the approved Puzzle Loop icon for web, desktop, iOS, and Android.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
