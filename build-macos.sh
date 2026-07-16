#!/bin/zsh
set -euo pipefail
ROOT="${0:A:h}"
APP="$ROOT/Blockable.app"
CONTENTS="$APP/Contents"
rm -rf "$APP"
mkdir -p "$CONTENTS/MacOS" "$CONTENTS/Resources"
swiftc "$ROOT/BlockableApp.swift" -o "$CONTENTS/MacOS/Blockable" -framework Cocoa -framework WebKit
cp "$ROOT/index.html" "$ROOT/styles.css" "$ROOT/game.js" "$CONTENTS/Resources/"
mkdir -p "$CONTENTS/Resources/Assets"
cp "$ROOT/Assets/BlockableIcon.svg.png" "$ROOT/Assets/BlockableMinimalIcon.png" "$CONTENTS/Resources/Assets/"
cp "$ROOT/Assets/Blockable.icns" "$CONTENTS/Resources/"
cp "$ROOT/Info.plist" "$CONTENTS/"
xattr -cr "$APP"
codesign --force --deep --sign - "$APP"
echo "Built $APP"
