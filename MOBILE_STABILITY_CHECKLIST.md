# Mobile Stability Audit: 1.6.2

The audit covers every active game, shared settings and navigation, persistence, the service worker, update UI, and mobile packaging. It is not a claim that every physical-device issue has been reproduced.

## Confirmed Problems and Fixes

| Priority | Finding | Fix | Status |
| --- | --- | --- | --- |
| P1 | Update detection only displayed a disappearing notice; there was no actionable installation UI. | Persistent update dialog with Update now, download state, timeout, retry, and native-download instructions. | Implemented; browser checks passed |
| P1 | Old cache-first version metadata could report a stale release. | Unique network-only metadata request and uncached worker update checks. | Implemented; browser checks passed |
| P1 | Worker activation could reload an active game without user consent. | Verify the installed worker version, save first, and reload only after Update now. Preserve compatibility with the old client for its one-time migration. | Implemented; browser checks passed |
| P1 | Block dragging used one-shot global pointer-up handlers: a second finger could consume the listener and leave the first drag stuck. | Stable pointer capture, primary-pointer identity, cancellation cleanup, and synthetic-click suppression. | Implemented; browser checks passed |
| P1 | Block drag artwork and placement used different sizes and offsets. | Board-sized ghost with the same anchor as its placement preview, including the finger lift. | Implemented; browser checks passed |
| P1 | Tetris/Sand buttons only acted on click after release; holding did nothing. | Immediate press, repeat for movement/drop, cancellation on pause/background/navigation, keyboard-click compatibility. | Implemented; browser checks passed |
| P1 | Multi-touch and a newly spawned falling piece could inherit an unfinished board gesture. | Shared captured gestures, pointer identity, cancellation when the piece changes, and matching Tetris board gestures. | Implemented; browser checks passed |
| P2 | Sudoku, Minesweeper, Merge, and the Blockable tray discarded their nodes during interactions. | Keep nodes stable and update their state instead. | Implemented; browser checks passed |
| P2 | Desktop hover rules and small controls were applied to touch devices. | Hover rules only for fine pointers, manipulation touch behavior, 44px non-grid controls, no text selection/callouts. | Implemented; browser checks passed |
| P2 | Tall falling-block boards pushed controls below phone viewports. | Stable-height viewport constraints keep boards and controls together. | Implemented; browser checks passed |
| P2 | Paused/hidden Tetris and Sand still scheduled animation callbacks; Sand redrew at display refresh rate rather than simulation rate. | Cancel paused loops, restart once, cap rendering to physics steps, and avoid unchanged DOM writes. | Implemented; browser checks passed |
| P2 | Rapid actions synchronously serialized all saves; selecting a block also wrote settings. | Coalesce action saves, flush immediately on pause/home/background/update, and write best-score settings only when changed. | Implemented; browser checks passed |
| P2 | Individual glass effects multiplied mobile compositing cost. | Group the blur for stats and control groups while preserving transparent surfaces and the existing design. | Implemented; browser checks passed |
| P2 | Offline installation downloaded obsolete icon assets; failed cache installation could leave a partial cache. | Cache only current runtime assets, cache-bypass fetches, delete failed installation caches, claim clients inside activation lifetime. | Implemented; browser checks passed |
| P2 | Existing phone tests only changed desktop viewport sizes. | Dedicated touch-enabled WebKit/iPhone and Chromium/Android projects; taps, pointer interruptions, update migration, and failure recovery. | Implemented; browser checks passed |

## Remaining Device Checks

Local verification: 13 core tests and 57 browser tests passed across desktop Chromium/WebKit and touch-enabled iPhone/Android profiles. One Chromium-only native touch-injection test is intentionally skipped in WebKit, whose Playwright driver only exposes single native taps. Pointer-hold tests use captured pointer input; this is not physical iPhone testing. Mac and both Windows architectures built successfully; native mobile asset synchronization completed. Dependency audit reported zero vulnerabilities.

Additional shared fixes: settings choices preserve the sheet's scroll position, checkbox labels are connected to their toggles, Minesweeper allows browser pinch zoom, and update restarts no longer restore a stale menu scroll position.

- Physical iPhone 15 Pro: Home Screen upgrade from the existing installation, rapid input, drag alignment, background/reopen, and Airplane Mode resume.
- Physical Android: equivalent checks, including device-specific gestures and OS back behavior.
- Measure sustained frame pacing, battery/thermal load, and memory with a near-full Sand board and each wallpaper/glass combination on actual hardware.
- Native iOS/Android compilation and signing require their toolchains and connected devices. Browser emulation does not verify these packages.
- iOS may evict web cache/storage. No browser-only change guarantees permanent offline availability or forces an existing Home Screen icon to refresh.

## Technical References

- [Service worker update and cache policy](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/updateViaCache)
- [Pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture)
- [Pointer cancellation](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointercancel_event)
