#!/bin/zsh
set -euo pipefail

ROOT="${0:A:h}"
OUTPUTS="${ROOT:h:h}/outputs"

cd "$ROOT"
npm ci
npm run build:windows
VERSION="$(node -p 'require("./package.json").version')"

mkdir -p "$OUTPUTS"
ditto -c -k --norsrc --keepParent "$ROOT/dist/windows/Blockable-win32-x64" "$OUTPUTS/Blockable-$VERSION-Windows-x64.zip"
ditto -c -k --norsrc --keepParent "$ROOT/dist/windows/Blockable-win32-arm64" "$OUTPUTS/Blockable-$VERSION-Windows-ARM64.zip"

echo "Built Windows packages in $OUTPUTS"
