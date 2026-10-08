const { defineConfig, devices } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  projects: [
    { name: "chromium", testIgnore: "**/mobile.spec.cjs", use: { browserName: "chromium" } },
    { name: "webkit", testIgnore: "**/mobile.spec.cjs", use: { browserName: "webkit" } },
    { name: "iphone-touch", testMatch: "**/mobile.spec.cjs", use: { ...devices["iPhone 15 Pro"], browserName: "webkit" } },
    { name: "android-touch", testMatch: "**/mobile.spec.cjs", use: { ...devices["Pixel 7"], browserName: "chromium" } },
  ],
  use: { baseURL: "http://127.0.0.1:8766", viewport: { width: 393, height: 852 }, trace: "retain-on-failure" },
  webServer: { command: "python3 -m http.server 8766", url: "http://127.0.0.1:8766", reuseExistingServer: false, stdout: "ignore", stderr: "ignore" },
});
