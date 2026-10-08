const { test, expect } = require("@playwright/test");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const modes = { block: "Blockable", tetris: "Tetris", sand: "Sand Blocks", sudoku: "Sudoku", merge: "2048 Merging", mines: "Minesweeper" };
const levels = ["easy", "medium", "hard", "veryHard"];
const getSaves = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("blockable-sessions-v1") || "[]"));
async function openMode(page, name) { await page.locator(".game-card").filter({ has: page.locator("strong", { hasText: name }) }).click(); }
async function pause(page) { await page.locator(".session-toolbar").getByRole("button", { name: "Pause", exact: true }).click(); }

test("home contains only the six requested modes and Sand Blocks precedes Sudoku", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".game-card strong")).toHaveText(Object.values(modes));
  await page.screenshot({ path: "test-results/home-iphone.png", fullPage: true });
});

test("the official Puzzle Loop icon remains the same in Minimal and 3D styles", async ({ page }) => {
  await page.goto("/");
  for (const style of ["flat", "glossy"]) {
    await page.evaluate((gameStyle) => { const settings = JSON.parse(localStorage.getItem("blockable-settings-v2") || "{}"); settings.gameStyle = gameStyle; localStorage.setItem("blockable-settings-v2", JSON.stringify(settings)); }, style);
    await page.reload();
    await expect(page.locator(".brand-logo")).toHaveAttribute("src", "./Assets/BlockableDesktopIcon.png");
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "./Assets/pwa/apple-touch-icon.png");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "./manifest.webmanifest");
    expect(await page.locator(".brand-logo").evaluate((image) => image.complete && image.naturalWidth === 1024)).toBe(true);
  }
});

test("all 24 mode/difficulty combinations start, pause, save, and resume", async ({ page }) => {
  const errors = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const [mode, name] of Object.entries(modes)) for (const difficulty of levels) {
    await openMode(page, name);
    await expect(page.locator(".difficulty-grid button")).toHaveCount(4);
    await page.locator(`[data-difficulty="${difficulty}"]`).click();
    await expect(page.locator(".session-toolbar .difficulty-tag")).toHaveText({ easy: "Easy", medium: "Medium", hard: "Hard", veryHard: "Very Hard" }[difficulty]);
    await pause(page);
    const saves = await getSaves(page);
    const current = saves.filter((save) => save.mode === mode && save.difficulty === difficulty).at(-1);
    expect(current).toBeTruthy();
    await page.getByRole("button", { name: "Save & home", exact: true }).click();
    await openMode(page, name);
    const resume = page.locator(".saved-resume").filter({ has: page.locator(".difficulty-tag", { hasText: { easy: "Easy", medium: "Medium", hard: "Hard", veryHard: "Very Hard" }[difficulty] }) });
    await expect(resume).toHaveCount(1);
    await resume.click();
    await pause(page);
    const after = (await getSaves(page)).find((save) => save.id === current.id);
    expect(after.state.score || 0).toBe(current.state.score || 0);
    if (["block", "merge", "sudoku"].includes(mode)) expect(after.state.grid || after.state.board).toEqual(current.state.grid || current.state.board);
    await page.getByRole("button", { name: "Save & home", exact: true }).click();
  }
  expect((await getSaves(page)).length).toBe(24);
  await page.reload();
  await openMode(page, "Sand Blocks");
  await expect(page.locator(".saved-resume")).toHaveCount(4);
  expect(errors).toEqual([]);
});

test("sand pieces are monochrome, land as grains, and stop while paused", async ({ page }) => {
  await page.goto("/"); await openMode(page, "Sand Blocks");
  await page.locator('[data-difficulty="easy"]').click();
  let state = (await getSaves(page))[0].state;
  expect(new Set(state.current.colors.flat().filter(Boolean)).size).toBe(1);
  await page.getByRole("button", { name: "Hard drop", exact: true }).click();
  await expect(page.locator(".sand-canvas")).not.toHaveAttribute("data-grains", "0");
  await pause(page);
  state = (await getSaves(page))[0].state;
  await page.waitForTimeout(1100);
  await page.getByRole("button", { name: "Save & home", exact: true }).click();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  const after = (await getSaves(page))[0].state;
  expect(after).toEqual(state);
  await openMode(page, "Sand Blocks"); await page.locator(".saved-resume").click();
  await page.screenshot({ path: "test-results/sand-iphone.png", fullPage: true });
  const pixels = await page.locator("canvas").evaluate((canvas) => Array.from(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data).filter((_, index) => index % 4 === 3 && canvas.getContext("2d")).reduce((sum, value) => sum + (value > 0 ? 1 : 0), 0));
  expect(pixels).toBeGreaterThan(200);
});

test("multiple unfinished games of the same mode survive closing and reopening", async ({ page }) => {
  await page.goto("/");
  for (let index = 0; index < 3; index += 1) {
    await openMode(page, "Sudoku"); await page.locator('[data-difficulty="easy"]').click();
    await pause(page); await page.getByRole("button", { name: "Save & home", exact: true }).click();
  }
  await page.reload(); await openMode(page, "Sudoku");
  await expect(page.locator(".saved-resume")).toHaveCount(3);
  await expect(page.locator(".saved-resume .difficulty-tag")).toHaveText(["Easy", "Easy", "Easy"]);
  await page.screenshot({ path: "test-results/saved-games-iphone.png", fullPage: true });
});

test("Minesweeper first reveal is safe and touch flags survive resume", async ({ page }) => {
  await page.goto("/"); await openMode(page, "Minesweeper"); await page.locator('[data-difficulty="veryHard"]').click();
  await expect(page.locator(".mine-cell")).toHaveCount(144);
  await page.locator(".mine-cell").first().click();
  await expect(page.locator(".notice")).not.toHaveText("Game over");
  await page.getByRole("button", { name: "Flag", exact: true }).click();
  const hidden = page.locator(".mine-cell:not(.revealed)"); await hidden.first().click();
  await expect(page.locator(".mine-cell.flagged")).toHaveCount(1);
  await pause(page); await page.getByRole("button", { name: "Save & home", exact: true }).click();
  await openMode(page, "Minesweeper"); await page.locator(".saved-resume").click();
  await expect(page.locator(".mine-cell.flagged")).toHaveCount(1);
});

test("all screens fit phone and desktop viewports in both block styles", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 393, 1280]) for (const style of ["flat", "glossy"]) {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 852 });
    await page.evaluate((gameStyle) => { const settings = JSON.parse(localStorage.getItem("blockable-settings-v2") || "{}"); settings.gameStyle = gameStyle; localStorage.setItem("blockable-settings-v2", JSON.stringify(settings)); }, style);
    await page.reload();
    for (const name of Object.values(modes)) {
      await openMode(page, name); await page.locator('[data-difficulty="veryHard"]').click();
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      expect(fits, `${name} ${style} ${width}`).toBe(true);
      await page.getByRole("button", { name: "Home", exact: true }).click();
    }
  }
});

test("cached application launches and all games work with its origin server stopped", async ({ page }) => {
  const errors = []; page.on("pageerror", (error) => errors.push(error.message));
  const root = path.resolve(__dirname, "../..");
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json" };
  const server = http.createServer(async (request, response) => {
    const filename = path.resolve(root, `.${new URL(request.url, "http://localhost").pathname}`);
    if (filename !== root && !filename.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
    const file = filename === root ? path.join(root, "index.html") : filename;
    try { const body = await fs.readFile(file); response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" }); response.end(body); }
    catch { response.writeHead(404).end(); }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  try {
    await page.goto(url);
    await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true })); });
    // WebKit's offline-emulation flag rejects even literal worker responses (Playwright #42775).
    // Stopping the real server tests offline caching without that test-runner limitation.
    server.closeAllConnections(); await new Promise((resolve) => server.close(resolve));
    await expect(page.request.get(url, { timeout: 1000 })).rejects.toThrow();
    await page.reload();
    await expect(page.locator(".game-card")).toHaveCount(6);
    for (const name of Object.values(modes)) {
      await openMode(page, name); await page.locator('[data-difficulty="medium"]').click();
      await pause(page); await page.getByRole("button", { name: "Save & home", exact: true }).click();
    }
    expect(errors).toEqual([]);
  } finally {
    if (server.listening) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
  }
});

test("Blockable click and drag place pieces, and clearing a line preserves square geometry", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("blockable-sessions-v1", JSON.stringify([{ id: "block-test", mode: "block", difficulty: "easy", updatedAt: Date.now(), state: { grid: Array.from({ length: 8 }, (_, row) => Array.from({ length: 8 }, (_, column) => row === 0 && column < 7 ? "#2383e2" : null)), pieces: Array.from({ length: 3 }, () => ({ shape: [[1]], color: "#0f9d76", used: false })), score: 0 } }])));
  await page.reload(); await openMode(page, "Blockable"); await page.locator(".saved-resume").click();
  const before = await page.locator(".block-board").boundingBox();
  await page.locator(".piece-slot").first().click();
  await page.locator('.block-cell[data-row="0"][data-column="7"]').click();
  await expect(page.locator(".block-cell.filled")).toHaveCount(0);
  const after = await page.locator(".block-board").boundingBox();
  expect(Math.abs(after.width - after.height)).toBeLessThan(1);
  expect(after.height).toBeCloseTo(before.height, 0);
  const slot = await page.locator(".piece-slot").nth(1).boundingBox();
  const target = await page.locator('.block-cell[data-row="3"][data-column="3"]').boundingBox();
  await page.mouse.move(slot.x + slot.width / 2, slot.y + slot.height / 2); await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
  await expect(page.locator(".preview-good")).toHaveCount(1);
  await page.mouse.up();
  await expect(page.locator(".block-cell.filled")).toHaveCount(1);
  await pause(page);
  expect((await getSaves(page))[0].state.grid[3][3]).toBe("#0f9d76");
});

test("Tetris falls, settings freeze it, and pause/resume retains its active piece", async ({ page }) => {
  await page.goto("/"); await openMode(page, "Tetris"); await page.locator('[data-difficulty="medium"]').click();
  await page.waitForTimeout(950);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const state = (await getSaves(page))[0].state;
  expect(state.current.row).toBeGreaterThan(0);
  await page.waitForTimeout(1100);
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await pause(page);
  expect((await getSaves(page))[0].state.current.row).toBe(state.current.row);
});

test("Sudoku notes and errors persist, and completed games leave the unfinished list", async ({ page }) => {
  await page.goto("/"); await openMode(page, "Sudoku"); await page.locator('[data-difficulty="easy"]').click();
  const state = (await getSaves(page))[0].state;
  const index = state.board.findIndex((value) => value === 0);
  await page.locator(".sudoku-cell").nth(index).click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.locator(".number-pad button").first().click();
  await expect(page.locator(".sudoku-cell").nth(index)).toHaveClass(/notes-cell/);
  await pause(page); await page.getByRole("button", { name: "Save & home", exact: true }).click();
  await page.reload(); await openMode(page, "Sudoku"); await page.locator(".saved-resume").click();
  await expect(page.locator(".sudoku-cell").nth(index)).toHaveClass(/notes-cell/);
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  const wrong = state.solution[index] % 9 + 1;
  await page.locator(".number-pad button").nth(wrong - 1).click();
  await expect(page.locator(".sudoku-cell").nth(index)).toHaveClass(/wrong/);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.evaluate(() => { const key = "blockable-sessions-v1"; const saves = JSON.parse(localStorage.getItem(key)); const state = saves[0].state; state.board = [...state.solution]; state.board[state.selected] = 0; localStorage.setItem(key, JSON.stringify(saves)); });
  await page.reload(); await openMode(page, "Sudoku"); await page.locator(".saved-resume").click();
  await page.locator(".number-pad button").nth(state.solution[index] - 1).click();
  await expect(page.locator(".notice")).toContainText("Complete!");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".notice")).toHaveCount(1);
  expect(await getSaves(page)).toHaveLength(0);
});

test("mixed sand colors are opt-in on hard difficulties only", async ({ page }) => {
  await page.goto("/"); await openMode(page, "Sand Blocks");
  await page.getByRole("checkbox", { name: "Mixed-color pieces" }).check();
  await page.locator('[data-difficulty="easy"]').click();
  expect((await getSaves(page))[0].options.mixedColors).toBe(false);
  await page.getByRole("button", { name: "Home", exact: true }).click(); await openMode(page, "Sand Blocks");
  await page.getByRole("checkbox", { name: "Mixed-color pieces" }).check(); await page.locator('[data-difficulty="hard"]').click();
  expect((await getSaves(page)).find((save) => save.difficulty === "hard").options.mixedColors).toBe(true);
});

test("deleting a saved game requires confirmation", async ({ page }) => {
  await page.goto("/"); await openMode(page, "2048 Merging"); await page.locator('[data-difficulty="easy"]').click();
  await page.getByRole("button", { name: "Home", exact: true }).click(); await openMode(page, "2048 Merging");
  await page.getByRole("button", { name: "Delete", exact: true }).click(); await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".saved-resume")).toHaveCount(1);
  await page.getByRole("button", { name: "Delete", exact: true }).click(); await page.locator(".sheet").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.locator(".saved-resume")).toHaveCount(0);
});
