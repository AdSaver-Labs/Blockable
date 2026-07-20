# Blockable Optimization and Platform Blueprint

This blueprint preserves the current visual design. UI changes are limited to responsive behavior, accessibility, and controls required for touch input.

## Release Goals

- One shared game implementation for web, macOS, Windows, iOS, and Android.
- Smooth pointer, touch, keyboard, pause, resume, and background behavior.
- Reliable offline startup and updates without mixed-version cached files.
- Defensive persistence that cannot break the app when saved data is old or malformed.
- Repeatable builds with automated verification.

## P0: Runtime Reliability

- [x] Replace the 50 ms Tetris interval with a frame-synchronized loop and bounded frame deltas.
- [x] Pause game loops, timers, animation, and audio while the app is in the background.
- [x] Resume without a time jump when a phone or laptop wakes.
- [x] Validate and migrate local settings, records, and progress before use.
- [x] Handle storage quota and privacy-mode failures without crashing.
- [x] Use local calendar dates for daily challenges.
- [x] Centralize unbiased shared randomization helpers.
- [x] Add automated syntax, asset, manifest, and package checks.
- [ ] Consolidate duplicate translation concepts when the script is split into modules.

## P0: Mobile Interaction

- [x] Make Color Link dragging reliable on touch screens using pointer coordinates.
- [x] Add swipe controls to 2048 Merging.
- [x] Add an explicit touch-accessible reveal/flag mode to Minesweeper.
- [x] Respect left and right safe areas as well as the notch and home indicator.
- [x] Prevent accidental page gestures and delayed taps on game boards.
- [x] Stop continuous wallpaper animation when reduced motion is enabled.

## P0: Offline and Updates

- [x] Replace the catch-all service worker fallback with navigation-only fallback behavior.
- [x] Cache only successful same-origin responses and remove old release caches.
- [x] Prevent service-worker registration inside native containers.
- [x] Add a machine-readable version file and a real update check.
- [x] Add complete 192 px and 512 px install icons with maskable metadata.
- [x] Keep web, desktop, and mobile packages on the same release version.

## P0: Platform Delivery

- [x] Windows x64 and ARM64 Electron source and packaged builds exist.
- [x] Harden Windows lifecycle behavior and verify both package architectures.
- [x] Generate an iOS Capacitor/Xcode project from the shared web source.
- [x] Generate an Android Capacitor/Gradle project from the shared web source.
- [x] Add deterministic web-to-native synchronization commands.
- [x] Generate native icon and launch assets from the approved Blockable artwork.
- [x] Verify web/PWA, macOS, and Windows builds locally.
- [x] Verify native project configuration without modifying the current design.

## P1: Store Release Requirements

- [ ] Install full Xcode, select an Apple development team, and test on the iPhone 15 Pro.
- [ ] Create Apple signing certificates, App Store Connect listing, privacy details, and TestFlight build.
- [ ] Install Android Studio, JDK, and Android SDK; test on phone and emulator.
- [ ] Create a protected Android upload key and signed AAB for Google Play.
- [ ] Add Microsoft code signing and an MSIX installer for SmartScreen-friendly Windows installation.
- [ ] Replace ad-hoc macOS signing with Developer ID signing and notarization.

These checkpoints require developer accounts, private signing credentials, or native SDK installations. They cannot be safely embedded in the repository.

## P1: Maintainability and Performance

- [ ] Split the monolithic game script into app shell, settings, storage, audio, and per-game modules.
- [ ] Keep persistent grid elements and update changed cells instead of rebuilding full boards.
- [ ] Add deterministic unit tests for every game engine independently of the DOM.
- [ ] Add browser interaction tests for mouse, touch, keyboard, resize, offline, and resume flows.
- [x] Add CI verification for source syntax, assets, manifests, versions, and dependency security.
- [ ] Add unsigned native platform build jobs after signing and store workflows are selected.
- [ ] Add crash reporting and privacy-respecting performance telemetry before public release.

## P2: Product Integrity

- [ ] Replace random Sudoku removal with a uniqueness-checked puzzle generator.
- [ ] Add optional encrypted cloud progress sync across devices.
- [ ] Complete translation coverage and locale-aware formatting.
- [ ] Add accessible labels, focus order, contrast checks, and screen-reader game summaries.
- [ ] Define a save-data migration policy before changing game progress formats again.

## Acceptance Checks

- App starts offline after one successful web visit.
- No game advances while hidden; all games resume cleanly.
- Core games work with touch alone on an iPhone-sized viewport.
- Web, iOS, Android, macOS, and Windows consume the same checked web bundle.
- Existing settings and records survive the upgrade.
- No visual redesign is introduced by this work.
