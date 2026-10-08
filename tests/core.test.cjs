const test = require("node:test");
const assert = require("node:assert/strict");
const { SandBoard, SessionStore, CONFIG, DIFFICULTIES, validState } = require("../game-core.js");
const { getSudoku } = require("sudoku-gen");
const sharp = require("sharp");
const path = require("node:path");
const { newer } = require("../app-updates.js");

test("updates compare semantic versions without downgrading or accepting invalid releases", () => {
  assert.equal(newer("1.6.3", "1.6.2"), true);
  assert.equal(newer("1.10.0", "1.9.9"), true);
  assert.equal(newer("2.0.0", "1.99.99"), true);
  assert.equal(newer("1.6.2", "1.6.2"), false);
  assert.equal(newer("1.6.1", "1.6.2"), false);
  assert.equal(newer("bad", "1.6.2"), false);
});

test("official platform icons have correct sizes, opaque phone artwork, and transparent desktop corners", async () => {
  const root = path.resolve(__dirname, "..");
  for (const [file, size] of [["Assets/BlockableAppIcon.png", 1024], ["Assets/BlockableDesktopIcon.png", 1024], ["Assets/pwa/apple-touch-icon.png", 180], ["Assets/pwa/app-192.png", 192], ["Assets/pwa/app-512.png", 512], ["ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", 1024]]) {
    const meta = await sharp(path.join(root, file)).metadata();
    assert.equal(meta.width, size, file); assert.equal(meta.height, size, file);
    if (!file.includes("Desktop")) assert.equal(meta.hasAlpha, false, file);
  }
  const { data, info } = await sharp(path.join(root, "Assets/BlockableDesktopIcon.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(data[3], 0);
  assert.equal(data[((512 * info.width + 512) * 4) + 3], 255);
});

test("sand gravity conserves each color and keeps every grain inside the board", () => {
  const board = new SandBoard(32, 48);
  for (let index = 0; index < 300; index += 1) board.cells[index] = index % 5 + 1;
  const counts = () => [1, 2, 3, 4, 5].map((color) => board.cells.filter((value) => value === color).length);
  const before = counts();
  for (let frame = 0; frame < 400; frame += 1) board.step();
  assert.deepEqual(counts(), before);
  assert.equal(board.cells.length, 32 * 48);
  assert.ok(board.cells.slice(0, 32).every((cell) => cell === 0));
});

test("only a same-color connected component spanning both walls clears", () => {
  const board = new SandBoard(8, 8);
  const path = [0, 1, 2, 10, 11, 12, 20, 21, 22, 23];
  for (const index of path) board.cells[index] = 2;
  board.cells[63] = 3;
  const result = board.clearConnections();
  assert.equal(result.groups, 1);
  assert.equal(result.pixels, path.length);
  assert.equal(board.cells[63], 3);
  assert.ok(path.every((index) => board.cells[index] === 0));
  for (let x = 0; x < 8; x += 1) board.cells[56 + x] = x < 4 ? 1 : 2;
  assert.equal(board.clearConnections().groups, 0);
});

test("disconnected and diagonal-only paths do not clear", () => {
  const board = new SandBoard(8, 8);
  for (let x = 0; x < 8; x += 1) board.cells[x * 8 + x] = 1;
  assert.equal(board.clearConnections().pixels, 0);
});

test("piece collision and deposition preserve one-color pieces", () => {
  const board = new SandBoard(16, 24);
  const shape = [[1, 0], [1, 1]];
  const colors = [[3, 0], [3, 3]];
  assert.equal(board.fits(shape, -1, 0, 4), false);
  assert.equal(board.fits(shape, 12, 0, 4), false);
  assert.equal(board.deposit(shape, colors, 4, 16, 4), true);
  assert.equal(board.cells.filter(Boolean).length, 48);
  assert.equal(board.fits(shape, 4, 16, 4), false);
  assert.ok(board.cells.every((color) => color === 0 || color === 3));
});

test("sand saves accept a fractional resting position and reject out-of-bounds pieces", () => {
  const piece = { shape: [[1]], colors: [[1]], x: 36, y: 136.5 };
  const state = { cells: Array(80 * 144).fill(0), current: piece, next: { ...piece, y: 0 }, score: 0, clears: 0 };
  assert.equal(validState("sand", "easy", state), true);
  assert.equal(validState("sand", "easy", { ...state, current: { ...piece, y: 137 } }), false);
  assert.equal(validState("sand", "easy", { ...state, current: { ...piece, x: 73 } }), false);
});

const memory = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
};
const mergeSave = (id, difficulty, time = 1) => ({ id, mode: "merge", difficulty, updatedAt: time, state: { grid: Array.from({ length: CONFIG[difficulty].mergeSize }, () => Array(CONFIG[difficulty].mergeSize).fill(0)), score: 0 } });

test("multiple saves retain difficulty and remain independent after reopening", () => {
  const adapter = memory(); const store = new SessionStore(adapter);
  assert.equal(store.save(mergeSave("a", "easy", 1)), true);
  assert.equal(store.save(mergeSave("b", "veryHard", 2)), true);
  const reopened = new SessionStore(adapter);
  assert.deepEqual(reopened.list("merge").map((session) => session.difficulty), ["veryHard", "easy"]);
  assert.equal(reopened.remove("b"), true);
  assert.equal(new SessionStore(adapter).list("merge").length, 1);
});

test("corrupt or unsupported saves cannot crash the app", () => {
  assert.deepEqual(new SessionStore({ getItem: () => "not json" }).sessions, []);
  assert.deepEqual(new SessionStore({ getItem: () => JSON.stringify([{ id: "bad", mode: "sand", difficulty: "easy", state: {} }]) }).sessions, []);
  const store = new SessionStore(memory());
  assert.equal(store.save({ ...mergeSave("a", "easy"), state: { grid: [], score: 0 } }), false);
  for (const shape of [[], [null], [[]], "bad"]) {
    assert.doesNotThrow(() => store.save({ id: "bad", mode: "sand", difficulty: "easy", state: { cells: Array(80 * 144).fill(0), current: { shape }, next: { shape }, score: 0, clears: 0 } }));
  }
});

test("quota failures preserve earlier in-memory saves", () => {
  const adapter = memory(); const store = new SessionStore(adapter);
  store.save(mergeSave("a", "easy"));
  adapter.setItem = () => { throw new Error("QuotaExceededError"); };
  assert.equal(store.save(mergeSave("b", "hard")), false);
  assert.equal(store.sessions.length, 1);
  assert.equal(store.sessions[0].id, "a");
});

test("removing a nonexistent completed session does not rewrite every save", () => {
  const adapter = memory(); let writes = 0;
  const write = adapter.setItem; adapter.setItem = (...args) => { writes += 1; write(...args); };
  const store = new SessionStore(adapter);
  store.save(mergeSave("a", "easy"));
  assert.equal(store.remove("missing"), true);
  assert.equal(writes, 1);
  assert.equal(store.sessions.length, 1);
});

test("all difficulties have distinct gameplay parameters", () => {
  assert.equal(new Set(DIFFICULTIES.map((level) => CONFIG[level].tetrisSpeed)).size, 4);
  assert.equal(new Set(DIFFICULTIES.map((level) => CONFIG[level].sandSpeed)).size, 4);
  assert.equal(new Set(DIFFICULTIES.map((level) => CONFIG[level].mines)).size, 4);
});

function countSolutions(board, limit = 2) {
  let target = -1; let candidates = null;
  for (let index = 0; index < 81; index += 1) if (!board[index]) {
    const row = Math.floor(index / 9); const column = index % 9; const used = new Set();
    for (let offset = 0; offset < 9; offset += 1) { used.add(board[row * 9 + offset]); used.add(board[offset * 9 + column]); }
    for (let dr = 0; dr < 3; dr += 1) for (let dc = 0; dc < 3; dc += 1) used.add(board[(Math.floor(row / 3) * 3 + dr) * 9 + Math.floor(column / 3) * 3 + dc]);
    const possible = [1,2,3,4,5,6,7,8,9].filter((value) => !used.has(value));
    if (!possible.length) return 0;
    if (!candidates || possible.length < candidates.length) { target = index; candidates = possible; }
  }
  if (target < 0) return 1;
  let count = 0;
  for (const value of candidates) { board[target] = value; count += countSolutions(board, limit - count); if (count >= limit) break; }
  board[target] = 0;
  return count;
}

test("generated Sudoku puzzles at all four difficulties have one solution", () => {
  for (const difficulty of ["easy", "medium", "hard", "expert"]) {
    const puzzle = getSudoku(difficulty);
    const board = [...puzzle.puzzle].map((value) => value === "-" ? 0 : Number(value));
    assert.equal(countSolutions(board), 1, difficulty);
    assert.ok(board.every((value, index) => value === 0 || value === Number(puzzle.solution[index])));
  }
});
