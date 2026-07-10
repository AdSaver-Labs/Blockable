const SIZE = 8;
const STORAGE_KEY = "blockspark-best";
const COLORS = ["#ff7a59", "#19b6c9", "#f4b63f", "#7c6df2", "#38b269", "#eb4d7a", "#3c8cff"];

const SHAPES = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1, 1], [1, 0]],
  [[1, 1], [0, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 0], [1, 1], [1, 0]],
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  [[1, 1, 1], [1, 1, 1]],
  [[1, 1], [1, 1], [1, 1]],
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
];

const boardEl = document.querySelector("#board");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const trayEl = document.querySelector(".tray");
const comboEl = document.querySelector("#combo");
const modalEl = document.querySelector("#gameOver");
const finalScoreEl = document.querySelector("#finalScore");
const newGameBtn = document.querySelector("#newGame");
const restartBtn = document.querySelector("#restart");
const soundBtn = document.querySelector("#soundToggle");

let grid;
let pieces;
let score;
let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
let drag = null;
let selectedIndex = null;
let audioEnabled = true;
let audioCtx = null;
let lastPlaced = new Set();
let lastScore = 0;

function startGame() {
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  pieces = makePieces();
  score = 0;
  modalEl.hidden = true;
  updateScore();
  render();
}

function makePieces() {
  return Array.from({ length: 3 }, () => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      shape,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      used: false
    };
  });
}

function render() {
  renderBoard();
  renderTray();
  markUnplaceablePieces();
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.style.setProperty("--r", r);
      cell.style.setProperty("--c", c);
      cell.addEventListener("click", placeSelected);
      if (grid[r][c]) {
        cell.classList.add("filled");
        cell.style.setProperty("--piece-color", grid[r][c]);
      }
      if (lastPlaced.has(`${r},${c}`)) cell.classList.add("just-placed");
      boardEl.append(cell);
    }
  }
  if (lastPlaced.size) {
    setTimeout(() => {
      boardEl.querySelectorAll(".just-placed").forEach((cell) => cell.classList.remove("just-placed"));
      lastPlaced.clear();
    }, 520);
  }
}

function renderTray() {
  [...trayEl.children].forEach((slot, index) => {
    slot.innerHTML = "";
    slot.classList.toggle("used", !pieces[index] || pieces[index].used);
    const piece = pieces[index];
    if (!piece || piece.used) return;
    const node = pieceNode(piece, index);
    slot.append(node);
  });
}

function pieceNode(piece, index) {
  const node = document.createElement("div");
  node.className = "piece";
  node.dataset.index = index;
  node.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, 18px)`;
  node.style.setProperty("--piece-color", piece.color);

  piece.shape.forEach((row) => {
    row.forEach((filled) => {
      const mini = document.createElement("div");
      mini.className = filled ? "mini-cell" : "mini-cell empty";
      node.append(mini);
    });
  });

  node.addEventListener("click", selectPiece);
  node.addEventListener("pointerdown", beginDrag);
  return node;
}

function selectPiece(event) {
  const index = Number(event.currentTarget.dataset.index);
  const piece = pieces[index];
  if (!piece || piece.used) return;
  selectedIndex = index;
  updateSelectedPiece();
}

function beginDrag(event) {
  const index = Number(event.currentTarget.dataset.index);
  const piece = pieces[index];
  if (!piece || piece.used) return;

  drag = {
    index,
    piece,
    node: event.currentTarget,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    active: false
  };

  selectedIndex = index;
  updateSelectedPiece();
  drag.node.setPointerCapture(event.pointerId);
  clearPreview();
  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", endDrag, { once: true });
}

function moveDrag(event) {
  if (!drag) return;
  const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
  if (!drag.active && distance < 6) return;
  if (!drag.active) {
    drag.active = true;
    drag.node.classList.add("dragging");
    pulse(220, 0.025);
  }
  drag.node.style.left = `${event.clientX}px`;
  drag.node.style.top = `${event.clientY}px`;
  previewAt(event.clientX, event.clientY);
}

function endDrag(event) {
  if (!drag) return;
  const target = cellFromPoint(event.clientX, event.clientY);
  const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
  clearPreview();

  if (drag.active && target && canPlace(drag.piece.shape, target.row, target.col)) {
    placePiece(drag.index, target.row, target.col);
  } else if (!drag.active || distance < 10) {
    selectedIndex = drag.index;
    updateSelectedPiece();
  } else {
    pulse(120, 0.02);
  }

  drag.node.classList.remove("dragging");
  drag.node.style.left = "";
  drag.node.style.top = "";
  window.removeEventListener("pointermove", moveDrag);
  drag = null;
}

function placeSelected(event) {
  if (selectedIndex === null) return;
  const piece = pieces[selectedIndex];
  if (!piece || piece.used) return;
  const row = Number(event.currentTarget.dataset.row);
  const col = Number(event.currentTarget.dataset.col);
  if (canPlace(piece.shape, row, col)) {
    placePiece(selectedIndex, row, col);
  } else {
    pulse(120, 0.02);
  }
}

function previewAt(x, y) {
  clearPreview();
  const target = cellFromPoint(x, y);
  if (!target || !drag) return;
  const ok = canPlace(drag.piece.shape, target.row, target.col);
  eachShapeCell(drag.piece.shape, target.row, target.col, (r, c) => {
    const cell = getCell(r, c);
    if (cell) cell.classList.add(ok ? "preview-ok" : "preview-bad");
  });
}

function clearPreview() {
  boardEl.querySelectorAll(".preview-ok, .preview-bad").forEach((cell) => {
    cell.classList.remove("preview-ok", "preview-bad");
  });
}

function cellFromPoint(x, y) {
  const el = document.elementFromPoint(x, y)?.closest(".cell");
  if (!el) return null;
  return { row: Number(el.dataset.row), col: Number(el.dataset.col) };
}

function getCell(row, col) {
  return boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function eachShapeCell(shape, baseRow, baseCol, cb) {
  shape.forEach((row, r) => {
    row.forEach((filled, c) => {
      if (filled) cb(baseRow + r, baseCol + c);
    });
  });
}

function canPlace(shape, row, col) {
  let ok = true;
  eachShapeCell(shape, row, col, (r, c) => {
    if (r < 0 || c < 0 || r >= SIZE || c >= SIZE || grid[r][c]) ok = false;
  });
  return ok;
}

function hasAnyPlacement(piece) {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (canPlace(piece.shape, r, c)) return true;
    }
  }
  return false;
}

function placePiece(index, row, col) {
  const piece = pieces[index];
  let blocks = 0;
  lastPlaced = new Set();
  eachShapeCell(piece.shape, row, col, (r, c) => {
    grid[r][c] = piece.color;
    lastPlaced.add(`${r},${c}`);
    blocks += 1;
  });
  pieces[index].used = true;
  selectedIndex = null;
  score += blocks * 10;
  renderBoard();
  boardEl.classList.remove("placed");
  void boardEl.offsetWidth;
  boardEl.classList.add("placed");

  const cleared = findCompletedLines();
  if (cleared.length) {
    score += cleared.length * cleared.length * 120;
    showCombo(cleared.length);
    animateClear(cleared, () => {
      clearLines(cleared);
      afterMove();
    });
  } else {
    afterMove();
  }

  pulse(cleared.length ? 520 : 360, cleared.length ? 0.08 : 0.04);
}

function afterMove() {
  if (pieces.every((piece) => piece.used)) pieces = makePieces();
  updateScore();
  render();
  if (!pieces.some((piece) => !piece.used && hasAnyPlacement(piece))) {
    setTimeout(showGameOver, 240);
  }
}

function findCompletedLines() {
  const lines = [];
  for (let r = 0; r < SIZE; r += 1) {
    if (grid[r].every(Boolean)) lines.push({ type: "row", index: r });
  }
  for (let c = 0; c < SIZE; c += 1) {
    if (grid.every((row) => row[c])) lines.push({ type: "col", index: c });
  }
  return lines;
}

function animateClear(lines, done) {
  const cells = new Set();
  lines.forEach((line) => {
    for (let i = 0; i < SIZE; i += 1) {
      const r = line.type === "row" ? line.index : i;
      const c = line.type === "col" ? line.index : i;
      cells.add(`${r},${c}`);
    }
  });

  cells.forEach((key) => {
    const [r, c] = key.split(",").map(Number);
    getCell(r, c)?.classList.add("clearing");
  });
  setTimeout(done, 480);
}

function clearLines(lines) {
  lines.forEach((line) => {
    for (let i = 0; i < SIZE; i += 1) {
      if (line.type === "row") grid[line.index][i] = null;
      if (line.type === "col") grid[i][line.index] = null;
    }
  });
}

function showCombo(count) {
  comboEl.textContent = count === 1 ? "+ линия" : `+ ${count} линии`;
  comboEl.classList.remove("show");
  void comboEl.offsetWidth;
  comboEl.classList.add("show");
}

function updateScore() {
  const changed = score !== lastScore;
  best = Math.max(best, score);
  localStorage.setItem(STORAGE_KEY, String(best));
  scoreEl.textContent = score;
  bestEl.textContent = best;
  if (changed) {
    [scoreEl, bestEl].forEach((node) => {
      node.classList.remove("bump");
      void node.offsetWidth;
      node.classList.add("bump");
    });
  }
  lastScore = score;
}

function markUnplaceablePieces() {
  document.querySelectorAll(".piece").forEach((node) => {
    const piece = pieces[Number(node.dataset.index)];
    node.classList.toggle("unplaceable", piece && !hasAnyPlacement(piece));
  });
  updateSelectedPiece();
}

function updateSelectedPiece() {
  document.querySelectorAll(".piece").forEach((node) => {
    node.classList.toggle("selected", Number(node.dataset.index) === selectedIndex);
  });
}

function showGameOver() {
  finalScoreEl.textContent = score;
  modalEl.hidden = false;
}

function pulse(freq, gain) {
  if (!audioEnabled) return;
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const amp = audioCtx.createGain();
  osc.frequency.value = freq;
  amp.gain.value = gain;
  osc.connect(amp);
  amp.connect(audioCtx.destination);
  osc.start();
  amp.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.11);
  osc.stop(audioCtx.currentTime + 0.12);
}

newGameBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
soundBtn.addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  soundBtn.textContent = audioEnabled ? "Звук: вкл." : "Звук: изкл.";
  soundBtn.setAttribute("aria-pressed", String(audioEnabled));
});

startGame();
