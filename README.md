# Blockable
An offline-capable puzzle collection for web, macOS, Windows, and locally bundled iOS/Android projects.

## Version 1.6.1

Puzzle Loop is the official app icon across Minimal and 3D styles, macOS, Windows, iOS, Android, and Home Screen web apps. The approved source is preserved under `Assets/BlockablePuzzleLoopSource.png`; `npm run icons` reproducibly exports platform sizes and the macOS ICNS without regenerating the artwork.

Games, in menu order: Blockable, Tetris, Sand Blocks, Sudoku, 2048 Merging, and Minesweeper. Each game has Easy, Medium, Hard, and Very Hard difficulties. Unfinished games are saved independently with their difficulty, and can be resumed from the game's chooser. Use Pause > Save & home before closing when possible; autosaving also runs during play and when the app backgrounds.

Sand Blocks uses single-color falling shapes by default. On landing, they become simulated sand. A connected region of one color clears when it reaches both side walls. Mixed-color shapes are an optional Hard/Very Hard setting, never enabled on Easy/Medium.

Minimal/3D block styles, light/dark appearance, wallpapers, and other existing design preferences are preserved. ColorLink, Memory Blocks, Daily Logic, and Lights Out have been removed from the menu and runtime.

## Play and Install

- Web: [Play Blockable](https://adsaver-labs.github.io/Blockable/).
- macOS/Windows: download a packaged build from [Releases](https://github.com/AdSaver-Labs/Blockable/releases), not the repository's source ZIP. On Windows, extract the whole ZIP before running `Blockable.exe`.
- iPhone: [Private offline installation guide](PRIVATE_IPHONE_INSTALL.md), including free Xcode installation without the App Store and the Home Screen web app alternative.
- Android: `npm run mobile:android` opens the local-assets project in Android Studio. Build an APK and install on your own device; a Play Store listing is not needed for personal installation. Native SDK setup and device testing are still required.

## Develop and Verify

Use Node.js 22 or newer. Run `npm ci`, `npm test`, and `npm run verify`. For browser tests, run `npx playwright install chromium webkit` then `npm run test:browser`. The test runner starts and stops its own local server.

For manual web development, run `python3 -m http.server 8766` and open `http://localhost:8766`. Changes to bundled mobile assets require `npm run mobile:sync` and rebuilding the native app. `npm run build:vendor` regenerates the checked-in Sudoku engine bundle; it is not downloaded at runtime.

On macOS, `./build-macos.sh` produces `Blockable.app`. `./build-windows.sh` creates versioned x64 and ARM64 ZIPs under the workspace's outputs directory. Cross-packaging Windows builds on macOS does not replace testing on an actual Windows machine.

## Third-Party Code

Sudoku generation uses MIT-licensed `sudoku-gen`, bundled locally. Sand gravity rules are adapted from Marllon Freitas's MIT-licensed sand-simulation-js. License notices and attribution are retained under `vendor/` and included in packaged builds.
