#!/bin/zsh
set -euo pipefail

ROOT="${0:A:h}"
OUTPUTS="${ROOT:h:h}/outputs"

cd "$ROOT"
npm install
npm run build:windows

mkdir -p "$OUTPUTS"
rm -f "$OUTPUTS/Blockable-1.4.0-Windows-x64.zip" "$OUTPUTS/Blockable-1.4.0-Windows-ARM64.zip"
ditto -c -k --norsrc --keepParent "$ROOT/dist/windows/Blockable-win32-x64" "$OUTPUTS/Blockable-1.4.0-Windows-x64.zip"
ditto -c -k --norsrc --keepParent "$ROOT/dist/windows/Blockable-win32-arm64" "$OUTPUTS/Blockable-1.4.0-Windows-ARM64.zip"

echo "Built Windows packages in $OUTPUTS"
