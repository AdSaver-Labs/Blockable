const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  projects: [{ name: "chromium", use: { browserName: "chromium" } }, { name: "webkit", use: { browserName: "webkit" } }],
  use: { baseURL: "http://127.0.0.1:8766", viewport: { width: 393, height: 852 }, trace: "retain-on-failure" },
  webServer: { command: "python3 -m http.server 8766", url: "http://127.0.0.1:8766", reuseExistingServer: false },
});
