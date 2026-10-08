# Private Offline Installation on iPhone

You do not need an App Store listing, approval, or a paid developer membership to install Blockable on your own iPhone for testing. There are two different routes, with different limitations.

## Native App: Free Xcode Personal Team

This is the route for a real installed app with its game code and assets bundled locally. It does not load the game from GitHub Pages while playing. Initial tools, signing, and installation require internet access; gameplay after installation does not.

1. On your Mac, install the full Xcode app. Command Line Tools alone cannot build and install the iOS app.
2. Open Xcode once and allow it to install its components and iOS platform support. In Xcode Settings > Accounts, add your Apple Account.
3. In Terminal, open the Blockable repository folder. With Node.js 22 or newer installed, run `npm ci`, then `npm run mobile:ios`. This copies the complete local web bundle and opens the existing iOS project.
4. Connect your iPhone 15 Pro by USB, unlock it, and trust the Mac when asked. Select your iPhone as Xcode's run destination.
5. In Xcode, select the App target > Signing & Capabilities. Enable Automatically manage signing and choose your Personal Team. If the bundle identifier is unavailable, change it to a unique identifier for your personal build.
6. Enable Settings > Privacy & Security > Developer Mode on the iPhone if prompted. Restart and confirm it when requested. If iOS asks to trust the developer, follow its prompt under Settings > General > VPN & Device Management.
7. Press Run in Xcode. Once installed, launch Blockable from its Home Screen icon.
8. For the offline check, start a game, pause it, close the app, enable Airplane Mode, disable Wi-Fi, and reopen it. Check that every game starts and your saved session resumes.

**Important:** Apple's free Personal Team provisioning expires after seven days. You will need to connect the phone and rebuild/reinstall through Xcode to keep using that native build. Keep the same bundle identifier and install over the existing app to retain its local data; deleting the app removes its saves. No ordinary unsigned IPA avoids Apple's signing requirement.

The repository is configured for locally bundled Capacitor assets, with no remote `server.url`. Actual signing, native compilation, and the Airplane Mode check still need to be performed with full Xcode and your physical phone. Browser tests are not a substitute for those steps.

Apple sources: [Account and Personal Team limits](https://developer.apple.com/help/account/basics/about-your-developer-account/), [Enabling Developer Mode](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device). Asset workflow: [Capacitor development workflow](https://capacitorjs.com/docs/basics/workflow).

## Home Screen Web App: No Signing or Weekly Expiry

### Updating an Existing Home Screen App

For the one-time migration from 1.6.1 or earlier, fully close the Home Screen app and reopen it while online. Check for updates, then close/reopen once more if the old client only shows a notice. Verify that the footer shows 1.6.2. Do not delete the app or clear website data to update it.

From 1.6.2 onward, Check for updates opens an actionable dialog. Tap Update now; the app verifies the downloaded worker, saves your current game, and restarts. Failed checks/downloads offer Try again, and a save failure prevents the restart. Existing settings and saved games are not reset.

iOS may keep the icon artwork that was captured when you first added the app. If it stays old, open the current site in Safari and use Share > Add to Home Screen again. Keep the old installation until you have verified the new icon and your saves; removing a Home Screen app or clearing site data can erase its stored progress. We cannot force-refresh an already pinned iPhone icon from JavaScript.

A native Xcode installation is different: publishing on GitHub does not replace its locally bundled files. Run `npm run mobile:ios` from the updated repository and rebuild/install over the existing app using the same bundle identifier.

This is an installed offline-capable web app, not a native iOS package. It opens in its own window without Safari's address bar and can play from its local cache after the first successful online load.

1. On your iPhone, open [Blockable](https://adsaver-labs.github.io/Blockable/) in Safari while connected to the internet.
2. Wait for the menu to load, then use Share > Add to Home Screen. Enable Open as Web App if your iOS version offers that switch, then tap Add.
3. Open the new icon once while online so its own cache is ready. Start a game, pause it, then return home.
4. Turn on Airplane Mode, turn Wi-Fi off, and open the Home Screen icon again. Verify the menu, all games, and resume functionality before relying on it while travelling.

There is no seven-day signing limit on this route. However, iOS can evict web storage, and clearing website data or removing the app can erase the cache and saves. Reopen online if the cache is lost. This route is convenient for personal use, but it is not an absolute guarantee of permanent offline availability.

## Verification Status for 1.6.2

- Core sand physics, connected-color clearing, persistence, and Sudoku uniqueness have automated unit tests.
- Desktop Chromium/WebKit and touch-enabled iPhone/Android browser projects cover game startup, difficulty, pause, resume, phone layouts, taps, pointer interruptions, update migration, retry, and offline cache startup.
- Native iOS and Android projects receive the same local assets through `npm run mobile:sync`.
- No claim of testing on a physical iPhone or Android phone is made. Native device tests and signing remain required.
