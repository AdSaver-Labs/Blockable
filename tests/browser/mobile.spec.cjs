const { test, expect } = require("@playwright/test");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const modes = ["Blockable", "Tetris", "Sand Blocks", "Sudoku", "2048 Merging", "Minesweeper"];
const saves = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("blockable-sessions-v1") || "[]"));
const home = (page) => page.getByRole("button", { name: "Home", exact: true }).tap();
async function start(page, name, difficulty = "easy") {
  await page.locator(".game-card").filter({ has: page.locator("strong", { hasText: name }) }).tap();
  await page.locator(`[data-difficulty="${difficulty}"]`).tap();
}
async function style(page, value) {
  await page.evaluate((gameStyle) => localStorage.setItem("blockable-settings-v2", JSON.stringify({ gameStyle, glass: true, wallpaper: "kinetic", sound: false })), value);
  await page.reload();
}
async function ready(page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
  });
}

test("single touch taps navigate every mode, settings, and pause in both designs", async ({ page }, info) => {
  const errors = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  expect(info.project.use.hasTouch).toBe(true);
  for (const design of ["flat", "glossy"]) {
    await style(page, design);
    for (const mode of modes) {
      await start(page, mode);
      await page.getByRole("button", { name: "Settings", exact: true }).tap();
      await page.getByRole("button", { name: "Done", exact: true }).tap();
      await page.locator(".session-toolbar").getByRole("button", { name: "Pause" }).tap();
      await page.getByRole("button", { name: "Continue", exact: true }).tap();
      await expect(page.locator(".modal")).toHaveCount(0);
      await home(page);
    }
  }
  expect(errors).toEqual([]);
});

test("rapid Sudoku taps keep cells connected, select on one tap, and preserve notes", async ({ page }) => {
  await page.goto("/"); await start(page, "Sudoku");
  const initial = (await saves(page))[0].state;
  const empty = initial.board.flatMap((value, index) => value ? [] : [index]).slice(0, 3);
  const original = await page.locator(".sudoku-cell").first().elementHandle();
  await page.getByRole("button", { name: "Notes", exact: true }).tap();
  for (const index of empty) {
    await page.locator(".sudoku-cell").nth(index).tap();
    await expect(page.locator(".sudoku-cell").nth(index)).toHaveClass(/selected/);
    for (const number of [1, 2, 3]) await page.locator(".number-pad button").nth(number - 1).tap();
    await expect(page.locator(".sudoku-cell").nth(index)).toHaveText("1 2 3");
  }
  expect(await original.evaluate((cell) => cell.isConnected)).toBe(true);
  await home(page);
  for (const index of empty) expect((await saves(page))[0].state.notes[index]).toEqual([1, 2, 3]);
});

test("rapid Minesweeper flag taps keep the board stable and toggle once per tap", async ({ page }) => {
  await page.goto("/"); await start(page, "Minesweeper", "veryHard");
  const original = await page.locator(".mine-cell").first().elementHandle();
  await page.getByRole("button", { name: "Flag", exact: true }).tap();
  for (let index = 0; index < 6; index += 1) await page.locator(".mine-cell").nth(index).tap();
  for (let index = 0; index < 3; index += 1) await page.locator(".mine-cell").nth(index).tap();
  await expect(page.locator(".mine-cell.flagged")).toHaveCount(3);
  expect(await original.evaluate((cell) => cell.isConnected)).toBe(true);
  await home(page);
  expect((await saves(page))[0].state.flags).toEqual([3, 4, 5]);
});

async function seedBlocks(page) {
  await page.evaluate(() => localStorage.setItem("blockable-sessions-v1", JSON.stringify([{ id: "touch-block", mode: "block", difficulty: "easy", updatedAt: Date.now(), state: { grid: Array.from({ length: 8 }, () => Array(8).fill(null)), pieces: Array.from({ length: 3 }, () => ({ shape: [[1]], color: "#0f9d76", used: false })), score: 0 } }])));
  await page.reload();
  await page.locator(".game-card").filter({ has: page.locator("strong", { hasText: "Blockable" }) }).tap();
  await page.locator(".saved-resume").tap();
}

test("Blockable selects and places with single taps without replacing its tray", async ({ page }) => {
  await page.goto("/"); await seedBlocks(page);
  const slot = await page.locator(".piece-slot").first().elementHandle();
  await page.locator(".piece-slot").first().tap();
  await expect(page.locator(".piece-slot").first()).toHaveClass(/selected/);
  await page.locator('.block-cell[data-row="2"][data-column="2"]').tap();
  await expect(page.locator(".block-cell.filled")).toHaveCount(1);
  expect(await slot.evaluate((cell) => cell.isConnected)).toBe(true);
});

test("a second pointer cannot terminate a drag and cancellation removes its ghost", async ({ page }) => {
  await page.goto("/"); await seedBlocks(page);
  const slot = await page.locator(".piece-slot").first().boundingBox();
  await page.mouse.move(slot.x + slot.width / 2, slot.y + slot.height / 2); await page.mouse.down();
  await page.evaluate(() => window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 99, isPrimary: false })));
  await expect(page.locator(".drag-ghost")).toHaveCount(1);
  const target = await page.locator('.block-cell[data-row="3"][data-column="3"]').boundingBox();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 5 });
  await expect(page.locator(".preview-good")).toHaveCount(1);
  await page.mouse.up();
  await expect(page.locator(".block-cell.filled")).toHaveCount(1);
  const next = await page.locator(".piece-slot").nth(1).boundingBox();
  await page.mouse.move(next.x + next.width / 2, next.y + next.height / 2); await page.mouse.down();
  await page.locator(".piece-slot").nth(1).dispatchEvent("pointercancel", { pointerId: 1 });
  await expect(page.locator(".drag-ghost")).toHaveCount(0);
  await page.mouse.up();
});

test("real Chromium touch dragging matches its raised preview and placement", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Playwright exposes multi-step native touch injection through Chromium CDP only.");
  await page.goto("/"); await seedBlocks(page);
  const client = await context.newCDPSession(page);
  const slot = await page.locator(".piece-slot").first().boundingBox();
  const target = await page.locator('.block-cell[data-row="3"][data-column="4"]').boundingBox();
  const x = slot.x + slot.width / 2; const y = slot.y + slot.height / 2;
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 0 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: target.x + target.width / 2, y: target.y + target.height / 2 + 56, id: 0 }] });
  await expect(page.locator('.block-cell[data-row="3"][data-column="4"]')).toHaveClass(/preview-good/);
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator('.block-cell[data-row="3"][data-column="4"]')).toHaveClass(/filled/);
  await expect(page.locator(".drag-ghost")).toHaveCount(0);
});

test("held falling-game controls repeat and stop on release or settings", async ({ page }) => {
  await page.goto("/");
  for (const mode of ["Tetris", "Sand Blocks"]) {
    await start(page, mode);
    const button = page.getByRole("button", { name: "Move left", exact: true });
    const box = await button.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await expect(button).toHaveClass(/pressed/);
    await page.waitForTimeout(470); await page.mouse.up();
    await expect(button).not.toHaveClass(/pressed/);
    await page.mouse.down();
    // WebKit's desktop runner cannot mix a held mouse with a concurrent native touch.
    // Dispatch the settings activation to verify cancelling an already captured control.
    await page.getByRole("button", { name: "Settings", exact: true }).dispatchEvent("click");
    await expect(page.getByRole("button", { name: "Done", exact: true })).toBeVisible();
    await expect(button).not.toHaveClass(/pressed/);
    await page.mouse.up();
    const state = (await saves(page)).find((save) => save.mode === (mode === "Tetris" ? "tetris" : "sand")).state;
    expect(mode === "Tetris" ? state.current.column : state.current.x).toBeLessThan(mode === "Tetris" ? 3 : 26);
    await page.waitForTimeout(450);
    await page.getByRole("button", { name: "Done", exact: true }).tap(); await home(page);
  }
});

test("one touch on hard drop places one falling piece, not two", async ({ page }) => {
  await page.goto("/");
  for (const mode of ["Tetris", "Sand Blocks"]) {
    await start(page, mode);
    const name = mode === "Tetris" ? "tetris" : "sand";
    const initial = (await saves(page)).find((save) => save.mode === name).state;
    const blocks = initial.current.shape.flat().filter(Boolean).length;
    await page.getByRole("button", { name: "Hard drop", exact: true }).tap(); await home(page);
    const after = (await saves(page)).find((save) => save.mode === name).state;
    if (name === "tetris") expect(after.grid.flat().filter(Boolean)).toHaveLength(blocks);
    else { expect(after.score).toBe(10); expect(after.cells.filter(Boolean)).toHaveLength(blocks * 64); }
  }
});

test("settings choices retain scroll position and tapping a toggle label works", async ({ page }) => {
  await page.goto("/"); await page.getByRole("button", { name: "Settings", exact: true }).tap();
  const choice = page.getByRole("button", { name: "3D", exact: true });
  await choice.scrollIntoViewIfNeeded();
  const before = await page.locator(".sheet").evaluate((sheet) => sheet.scrollTop);
  await choice.tap();
  expect(await page.locator(".sheet").evaluate((sheet) => sheet.scrollTop)).toBeCloseTo(before, 0);
  await expect(page.getByRole("checkbox", { name: "Sound", exact: true })).toBeChecked();
  await page.locator(".setting label").filter({ hasText: /^Sound$/ }).tap();
  await expect(page.getByRole("checkbox", { name: "Sound", exact: true })).not.toBeChecked();
});

test("pause stops scheduled animation work and resumes a single loop", async ({ page }) => {
  await page.addInitScript(() => {
    const request = window.requestAnimationFrame; const cancel = window.cancelAnimationFrame;
    window.pendingFrames = new Set();
    window.requestAnimationFrame = (callback) => { const id = request((time) => { window.pendingFrames.delete(id); callback(time); }); window.pendingFrames.add(id); return id; };
    window.cancelAnimationFrame = (id) => { window.pendingFrames.delete(id); cancel(id); };
  });
  await page.goto("/");
  for (const mode of ["Tetris", "Sand Blocks"]) {
    await start(page, mode);
    await page.getByRole("button", { name: "Settings", exact: true }).tap();
    await expect.poll(() => page.evaluate(() => window.pendingFrames.size)).toBe(0);
    await page.getByRole("button", { name: "Done", exact: true }).tap();
    await expect.poll(() => page.evaluate(() => window.pendingFrames.size)).toBe(1);
    await home(page);
    await expect.poll(() => page.evaluate(() => window.pendingFrames.size)).toBe(0);
  }
});

test("falling boards and controls fit short and tall phones without scrolling", async ({ page }, info) => {
  await page.goto("/");
  for (const height of [667, 852, 932]) {
    await page.setViewportSize({ width: 393, height });
    for (const design of ["flat", "glossy"]) {
      await style(page, design);
      for (const mode of ["Tetris", "Sand Blocks"]) {
        await start(page, mode);
        const bounds = await page.locator(".tetris-controls").boundingBox();
        expect(bounds.y + bounds.height, `${mode} ${design} height ${height}`).toBeLessThanOrEqual(height);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        if (height === 852) await page.screenshot({ path: `test-results/${info.project.name}-${mode.replaceAll(" ", "-")}-${design}.png` });
        await home(page);
      }
    }
  }
});

async function releaseServer({ legacy = false } = {}) {
  const root = path.resolve(__dirname, "../..");
  let upgraded = false; let metadataFailure = false; let assetFailure = false;
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json" };
  const server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const relative = pathname === "/" ? "index.html" : pathname.slice(1);
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    if (metadataFailure && relative === "version.json" || assetFailure && relative === "app-updates.js") { response.writeHead(503).end(); return; }
    try {
      let data;
      if (legacy && !upgraded && ["index.html", "game.js", "styles.css", "service-worker.js", "version.json"].includes(relative)) data = await fs.readFile(path.join(root, "tests/fixtures/1.6.1", relative));
      else {
        data = await fs.readFile(filename);
        if (!legacy && upgraded && ["game.js", "service-worker.js", "version.json"].includes(relative)) data = Buffer.from(data.toString().replaceAll('"1.6.2"', '"1.6.3"'));
      }
      response.writeHead(200, { "Content-Type": types[path.extname(filename)] || "application/octet-stream", "Cache-Control": "no-store" }); response.end(data);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { url: `http://127.0.0.1:${server.address().port}/`, upgrade: () => { upgraded = true; }, metadata: (failed) => { metadataFailure = failed; }, asset: (failed) => { assetFailure = failed; }, close: async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); } };
}

test("Update now upgrades the cached app without automatic reload or losing saves", async ({ page }) => {
  const server = await releaseServer();
  try {
    await page.goto(server.url); await ready(page); await start(page, "2048 Merging"); await home(page);
    const before = await saves(page); server.upgrade();
    await page.getByRole("button", { name: "Check for updates", exact: true }).tap();
    await expect(page.getByRole("button", { name: "Update now", exact: true })).toBeVisible();
    await expect(page.locator(".home-footer")).toContainText("v1.6.2");
    await page.screenshot({ path: "test-results/update-now-phone.png" });
    await page.getByRole("button", { name: "Update now", exact: true }).tap();
    await expect(page.locator(".home-footer")).toContainText("v1.6.3");
    expect(await saves(page)).toEqual(before);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  } finally { await server.close(); }
});

test("the actual 1.6.1 cached app migrates to 1.6.2 with its saves intact", async ({ page }) => {
  const server = await releaseServer({ legacy: true });
  try {
    await page.goto(server.url); await ready(page); await page.reload();
    await start(page, "2048 Merging"); await home(page);
    await expect(page.locator(".home-footer")).toContainText("v1.6.1");
    const before = await saves(page); server.upgrade();
    await page.getByRole("button", { name: "Check for updates", exact: true }).tap();
    await expect(page.locator(".home-footer")).toContainText("v1.6.2");
    expect(await saves(page)).toEqual(before);
  } finally { await server.close(); }
});

test("failed update checks provide retry without breaking the installed app", async ({ page }) => {
  const server = await releaseServer();
  try {
    await page.goto(server.url); await ready(page); server.metadata(true);
    await page.getByRole("button", { name: "Check for updates", exact: true }).tap();
    await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
    await expect(page.locator(".update-status")).toHaveText("Could not check for updates.");
    server.metadata(false); await page.getByRole("button", { name: "Try again", exact: true }).tap();
    await expect(page.locator(".update-modal")).toHaveCount(0);
    await expect(page.locator(".game-card")).toHaveCount(6);
  } finally { await server.close(); }
});

test("storage failure blocks an update restart and offers another attempt", async ({ page }) => {
  const server = await releaseServer();
  try {
    await page.goto(server.url); await ready(page); await start(page, "2048 Merging");
    await page.getByRole("button", { name: "Settings", exact: true }).tap(); server.upgrade();
    await page.getByRole("button", { name: "Check for updates", exact: true }).tap();
    await expect(page.getByRole("button", { name: "Update now", exact: true })).toBeVisible();
    await page.evaluate(() => { window.originalStorageWrite = Storage.prototype.setItem; Storage.prototype.setItem = () => { throw new Error("QuotaExceededError"); }; });
    await page.getByRole("button", { name: "Update now", exact: true }).tap();
    await expect(page.locator(".update-status")).toContainText("could not be saved");
    await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageWrite; });
    await page.getByRole("button", { name: "Update now", exact: true }).tap();
    await expect(page.locator(".home-footer")).toContainText("v1.6.3");
    expect((await saves(page))[0].mode).toBe("merge");
  } finally { await server.close(); }
});

test("a failed asset download preserves the old cache and update can be retried", async ({ page }) => {
  test.setTimeout(60000);
  const server = await releaseServer();
  try {
    await page.goto(server.url); await ready(page); server.asset(true); server.upgrade();
    await page.getByRole("button", { name: "Check for updates", exact: true }).tap();
    await expect(page.getByRole("button", { name: "Update now", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Update now", exact: true }).tap();
    await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible({ timeout: 25000 });
    expect(await page.evaluate(() => caches.keys())).toContain("blockable-1.6.2");
    expect(await page.evaluate(() => caches.keys())).not.toContain("blockable-1.6.3");
    server.asset(false); await page.getByRole("button", { name: "Try again", exact: true }).tap();
    await page.getByRole("button", { name: "Update now", exact: true }).tap();
    await expect(page.locator(".home-footer")).toContainText("v1.6.3");
  } finally { await server.close(); }
});
