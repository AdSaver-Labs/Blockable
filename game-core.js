(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.BlockableCore = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";

  const DIFFICULTIES = ["easy", "medium", "hard", "veryHard"];
  const MODES = ["block", "tetris", "sand", "sudoku", "merge", "mines"];
  const CONFIG = {
    easy: { blockMin: 1, blockMax: 4, tetrisSpeed: 900, sandSpeed: 24, sandColors: 3, mergeSize: 5, fourChance: 0.08, mineSize: 8, mines: 8 },
    medium: { blockMin: 1, blockMax: 6, tetrisSpeed: 620, sandSpeed: 34, sandColors: 4, mergeSize: 4, fourChance: 0.1, mineSize: 8, mines: 12 },
    hard: { blockMin: 3, blockMax: 6, tetrisSpeed: 420, sandSpeed: 46, sandColors: 5, mergeSize: 4, fourChance: 0.25, mineSize: 10, mines: 22 },
    veryHard: { blockMin: 4, blockMax: 9, tetrisSpeed: 260, sandSpeed: 60, sandColors: 5, mergeSize: 3, fourChance: 0.35, mineSize: 12, mines: 36 },
  };

  // Gravity rules adapted from Marllon Freitas's MIT-licensed sand-simulation-js.
  // An in-place bottom-up pass conserves grains and removes competing writes.
  class SandBoard {
    constructor(width = 80, height = 144, cells = null) {
      this.width = width;
      this.height = height;
      this.cells = cells ? Uint8Array.from(cells) : new Uint8Array(width * height);
      this.visited = new Uint8Array(width * height);
      this.queue = new Int32Array(width * height);
      this.frame = 0;
    }

    step(random = Math.random) {
      let moved = false;
      const { width, height, cells } = this;
      this.frame += 1;
      for (let y = height - 2; y >= 0; y -= 1) {
        const reverse = (y + this.frame) % 2 === 0;
        for (let offset = 0; offset < width; offset += 1) {
          const x = reverse ? width - 1 - offset : offset;
          const index = y * width + x;
          const color = cells[index];
          if (!color) continue;
          const below = index + width;
          const direction = random() < 0.5 ? -1 : 1;
          let target = -1;
          if (!cells[below]) target = below;
          else for (let attempt = 0; attempt < 2; attempt += 1) {
            const dx = attempt === 0 ? direction : -direction;
            if (x + dx >= 0 && x + dx < width && !cells[below + dx] && !cells[index + dx]) {
              target = below + dx;
              break;
            }
          }
          if (target >= 0) {
            cells[target] = color;
            cells[index] = 0;
            moved = true;
          }
        }
      }
      return moved;
    }

    clearConnections() {
      const { width, height, cells, visited, queue } = this;
      visited.fill(0);
      const cleared = [];
      let groups = 0;
      for (let row = 0; row < height; row += 1) {
        const start = row * width;
        if (!cells[start] || visited[start]) continue;
        const color = cells[start];
        let count = 1;
        let cursor = 0;
        let touchesRight = false;
        queue[0] = start;
        visited[start] = 1;
        while (cursor < count) {
          const index = queue[cursor++];
          const x = index % width;
          const y = Math.floor(index / width);
          if (x === width - 1) touchesRight = true;
          for (let side = 0; side < 4; side += 1) {
            if (side === 0 && x === 0 || side === 1 && x === width - 1 || side === 2 && y === 0 || side === 3 && y === height - 1) continue;
            const next = side === 0 ? index - 1 : side === 1 ? index + 1 : side === 2 ? index - width : index + width;
            if (!visited[next] && cells[next] === color) {
              visited[next] = 1;
              queue[count++] = next;
            }
          }
        }
        if (touchesRight) {
          groups += 1;
          for (let index = 0; index < count; index += 1) cleared.push(queue[index]);
        }
      }
      for (const index of cleared) cells[index] = 0;
      return { groups, pixels: cleared.length, indices: cleared };
    }

    fits(shape, x, y, blockSize) {
      x = Math.round(x);
      y = Math.floor(y);
      for (let row = 0; row < shape.length; row += 1) for (let column = 0; column < shape[row].length; column += 1) {
        if (!shape[row][column]) continue;
        for (let dy = 0; dy < blockSize; dy += 1) for (let dx = 0; dx < blockSize; dx += 1) {
          const px = x + column * blockSize + dx;
          const py = y + row * blockSize + dy;
          if (px < 0 || px >= this.width || py >= this.height || (py >= 0 && this.cells[py * this.width + px])) return false;
        }
      }
      return true;
    }

    deposit(shape, colors, x, y, blockSize) {
      if (!this.fits(shape, x, y, blockSize)) return false;
      x = Math.round(x);
      y = Math.floor(y);
      for (let row = 0; row < shape.length; row += 1) for (let column = 0; column < shape[row].length; column += 1) {
        if (!shape[row][column]) continue;
        const color = colors[row][column];
        for (let dy = 0; dy < blockSize; dy += 1) for (let dx = 0; dx < blockSize; dx += 1) {
          const px = x + column * blockSize + dx;
          const py = y + row * blockSize + dy;
          if (py >= 0) this.cells[py * this.width + px] = color;
        }
      }
      return true;
    }

    serialize() { return Array.from(this.cells); }
  }

  const matrix = (value, rows, columns, test) => Array.isArray(value) && value.length === rows && value.every((row) => Array.isArray(row) && row.length === columns && row.every(test));
  const number = (value) => Number.isFinite(value) && value >= 0;
  const piece = (value) => Boolean(value && Array.isArray(value.shape) && value.shape.length > 0 && value.shape.length <= 4 && Array.isArray(value.shape[0]) && value.shape[0].length > 0 && value.shape[0].length <= 4 && matrix(value.shape, value.shape.length, value.shape[0].length, (cell) => cell === 0 || cell === 1) && value.shape.flat().some(Boolean));
  const indices = (items, size) => Array.isArray(items) && items.length <= size && new Set(items).size === items.length && items.every((index) => Number.isInteger(index) && index >= 0 && index < size);
  const sandPiece = (value) => piece(value) && matrix(value.colors, value.shape.length, value.shape[0].length, (color) => Number.isInteger(color) && color >= 0 && color <= 5) && value.shape.every((row, y) => row.every((filled, x) => Boolean(filled) === Boolean(value.colors[y][x]))) && Number.isInteger(value.x) && value.x >= 0 && value.x + value.shape[0].length * 8 <= 80 && number(value.y) && Math.floor(value.y) + value.shape.length * 8 <= 144;
  const validState = (mode, difficulty, state) => {
    if (!state || typeof state !== "object" || !DIFFICULTIES.includes(difficulty)) return false;
    const config = CONFIG[difficulty];
    if (mode === "block") return matrix(state.grid, 8, 8, (cell) => cell === null || typeof cell === "string") && Array.isArray(state.pieces) && state.pieces.length === 3 && state.pieces.every((value) => piece(value) && typeof value.color === "string" && typeof value.used === "boolean") && number(state.score);
    if (mode === "tetris") return matrix(state.grid, 20, 10, (cell) => cell === null || typeof cell === "string") && piece(state.current) && piece(state.next) && typeof state.current.color === "string" && typeof state.next.color === "string" && number(state.score) && number(state.lines) && number(state.elapsed) && Number.isInteger(state.current.row) && state.current.row >= 0 && state.current.row + state.current.shape.length <= 20 && Number.isInteger(state.current.column) && state.current.column >= 0 && state.current.column + state.current.shape[0].length <= 10;
    if (mode === "sand") return Array.isArray(state.cells) && state.cells.length === 80 * 144 && state.cells.every((cell) => Number.isInteger(cell) && cell >= 0 && cell <= 5) && sandPiece(state.current) && sandPiece(state.next) && number(state.score) && number(state.clears);
    if (mode === "merge") return matrix(state.grid, config.mergeSize, config.mergeSize, (cell) => Number.isInteger(cell) && cell >= 0 && (cell === 0 || Math.log2(cell) % 1 === 0)) && number(state.score);
    if (mode === "mines") return [state.mines, state.revealed, state.flags].every((items) => indices(items, config.mineSize ** 2)) && state.mines.length === config.mines && number(state.elapsed) && typeof state.started === "boolean" && ["reveal", "flag"].includes(state.action);
    if (mode === "sudoku") return Array.isArray(state.board) && state.board.length === 81 && state.board.every((cell) => Number.isInteger(cell) && cell >= 0 && cell <= 9) && Array.isArray(state.solution) && state.solution.length === 81 && state.solution.every((cell) => Number.isInteger(cell) && cell >= 1 && cell <= 9) && indices(state.given, 81) && indices(state.wrong, 81) && (state.selected === null || Number.isInteger(state.selected) && state.selected >= 0 && state.selected < 81) && Array.isArray(state.notes) && state.notes.length === 81 && state.notes.every((notes) => Array.isArray(notes) && notes.length <= 9 && notes.every((value) => Number.isInteger(value) && value >= 1 && value <= 9)) && number(state.elapsed) && number(state.mistakes) && typeof state.noteMode === "boolean";
    return false;
  };

  class SessionStore {
    constructor(adapter) {
      this.adapter = adapter;
      this.key = "blockable-sessions-v1";
      this.error = null;
      this.sessions = [];
      try {
        const saved = JSON.parse(adapter.getItem(this.key) || "[]");
        if (Array.isArray(saved)) this.sessions = saved.filter((session) => session && typeof session.id === "string" && number(session.updatedAt) && MODES.includes(session.mode) && DIFFICULTIES.includes(session.difficulty) && validState(session.mode, session.difficulty, session.state));
      } catch (error) { this.error = error; }
    }
    list(mode) { return this.sessions.filter((session) => session.mode === mode).sort((a, b) => b.updatedAt - a.updatedAt); }
    save(session) {
      if (!validState(session.mode, session.difficulty, session.state)) return false;
      const next = this.sessions.filter((saved) => saved.id !== session.id);
      next.push(JSON.parse(JSON.stringify(session)));
      return this.persist(next);
    }
    remove(id) { return !this.sessions.some((saved) => saved.id === id) || this.persist(this.sessions.filter((saved) => saved.id !== id)); }
    persist(next) {
      try { this.adapter.setItem(this.key, JSON.stringify(next)); this.sessions = next; this.error = null; return true; }
      catch (error) { this.error = error; return false; }
    }
  }

  return { DIFFICULTIES, MODES, CONFIG, SandBoard, SessionStore, validState };
});
