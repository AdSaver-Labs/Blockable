(() => {
  "use strict";

  const VERSION = "1.3.0";
  const BOARD_SIZE = 8;
  const COLORS = ["#2383e2", "#0f9d76", "#e89a3c", "#d45d79", "#8b78e6"];
  const SHAPES = [
    [[1]],
    [[1, 1]],
    [[1], [1]],
    [[1, 1, 1]],
    [[1], [1], [1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
    [[1, 0], [1, 1]],
    [[0, 1], [1, 1]],
    [[1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 1, 1]],
  ];
  const TETROMINOES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[0, 1], [0, 1], [1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
  ];

  const COPY = {
    en: {
      tagline: "A small collection of focused games.", settings: "Settings", newGame: "New game",
      sound: "Sound", glass: "Glass effect", theme: "Appearance", language: "Language",
      wallpaper: "Background", gameStyle: "Block design", flat: "Minimal", glossy: "3D", customWallpaper: "Custom wallpaper",
      uploadWallpaper: "Choose image", removeWallpaper: "Remove custom image", updates: "Updates", check: "Check for updates", current: "You are up to date.",
      block: "Blockable", blockSub: "Place pieces and clear complete lines.", tetris: "Tetris",
      tetrisSub: "Classic falling blocks.", sudoku: "Sudoku", sudokuSub: "A quiet logic challenge.",
      colorlink: "ColorLink", colorlinkSub: "Connect every matching color.", merge: "Merge", mergeSub: "Slide and combine blocks.",
      lights: "Lights Out", lightsSub: "Turn every light off.", mines: "Minesweeper", minesSub: "Reveal the safe squares.",
      memory: "Memory Blocks", memorySub: "Remember every pair.", daily: "Daily challenge", dailySub: "A fresh puzzle every day.",
      levelName: "Arcade level", xp: "XP", streak: "Streak", moves: "Moves", reset: "Reset", congratulations: "Complete!",
      choose: "Choose difficulty", easy: "Easy", medium: "Medium", hard: "Hard", extreme: "Extreme",
      score: "Score", best: "Best", lines: "Lines", level: "Level", pause: "Pause", paused: "Paused",
      running: "Running", gameOver: "Game over", again: "Play again", back: "Home", noMoves: "No more moves.",
      next: "Next", done: "Done", cleared: "cleared",
    },
    bg: {
      tagline: "Малка колекция от фокусирани игри.", settings: "Настройки", newGame: "Нова игра",
      sound: "Звук", glass: "Стъклен ефект", theme: "Изглед", language: "Език",
      wallpaper: "Фон", gameStyle: "Дизайн на блоковете", flat: "Минимален", glossy: "3D", customWallpaper: "Собствен фон",
      uploadWallpaper: "Избери изображение", removeWallpaper: "Премахни изображението", updates: "Актуализации", check: "Провери за актуализации", current: "Приложението е актуално.",
      block: "Blockable", blockSub: "Подреждай фигури и изчиствай линии.", tetris: "Тетрис",
      tetrisSub: "Класически падащи блокове.", sudoku: "Судоку", sudokuSub: "Спокойно логическо предизвикателство.",
      colorlink: "ColorLink", colorlinkSub: "Свържи всички еднакви цветове.", merge: "Merge", mergeSub: "Плъзгай и сливай блокове.",
      lights: "Lights Out", lightsSub: "Изгаси всички светлини.", mines: "Minesweeper", minesSub: "Открий безопасните полета.",
      memory: "Memory Blocks", memorySub: "Запомни всички двойки.", daily: "Дневно предизвикателство", dailySub: "Нова загадка всеки ден.",
      levelName: "Ниво в аркадата", xp: "XP", streak: "Поредица", moves: "Ходове", reset: "Нулиране", congratulations: "Готово!",
      choose: "Избери трудност", easy: "Лесно", medium: "Средно", hard: "Трудно", extreme: "Екстремно",
      score: "Резултат", best: "Рекорд", lines: "Линии", level: "Ниво", pause: "Пауза", paused: "На пауза",
      running: "Игра", gameOver: "Край на играта", again: "Играй пак", back: "Начало", noMoves: "Няма възможен ход.",
      next: "Следва", done: "Готово", cleared: "изчистени",
    },
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

  const storage = {
    key: "blockable-settings-v2",
    defaults: {
      theme: "light", language: "en", sound: true, glass: false, wallpaper: "paper",
      gameStyle: "flat", customWallpaper: "", best: 0, xp: 0, streak: 0, dailyDate: "", dailyDone: false, modeBest: {},
    },
    value: null,
    load() {
      try {
        this.value = { ...this.defaults, ...JSON.parse(localStorage.getItem(this.key) || "{}") };
      } catch {
        this.value = { ...this.defaults };
      }
    },
    save() {
      localStorage.setItem(this.key, JSON.stringify(this.value));
    },
  };

  class App {
    constructor(root) {
      this.root = root;
      this.game = null;
      this.audioContext = null;
    }

    t(key) {
      return COPY[storage.value.language][key] || key;
    }

    init() {
      storage.load();
      this.applySettings();
      this.showHome();
    }

    applySettings() {
      this.root.dataset.theme = storage.value.theme;
      this.root.dataset.wallpaper = storage.value.wallpaper;
      this.root.dataset.glass = String(storage.value.glass);
      this.root.dataset.gameStyle = storage.value.gameStyle;
      this.root.style.setProperty("--custom-wallpaper", storage.value.customWallpaper ? `url(${JSON.stringify(storage.value.customWallpaper)})` : "none");
      document.documentElement.lang = storage.value.language;
    }

    setSetting(key, value) {
      storage.value[key] = value;
      storage.save();
      this.applySettings();
    }

    clear() {
      this.game?.destroy();
      this.game = null;
      this.root.replaceChildren();
    }

    sound(frequency = 320, duration = 0.06) {
      if (!storage.value.sound) return;
      this.audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.025;
      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);
      oscillator.stop(this.audioContext.currentTime + duration);
    }

    iconButton(label, symbol, handler) {
      const button = create("button", "icon-button", symbol);
      button.type = "button";
      button.title = label;
      button.setAttribute("aria-label", label);
      button.addEventListener("click", handler);
      return button;
    }

    header(title) {
      const header = create("header", "game-header");
      header.append(
        this.iconButton(this.t("back"), "‹", () => this.showHome()),
        create("div", "game-title", title),
        this.iconButton(this.t("settings"), "⚙", () => this.openSettings()),
      );
      return header;
    }

    showHome() {
      this.clear();
      const screen = create("main", "screen");
      const top = create("div", "topline");
      const brand = create("div", "brand");
      const mark = create("span", "brand-mark");
      for (let i = 0; i < 4; i += 1) mark.append(create("i"));
      brand.append(mark, document.createTextNode("Blockable"));
      top.append(brand, this.iconButton(this.t("settings"), "⚙", () => this.openSettings()));

      const hero = create("section", "hero");
      hero.append(
        create("p", "eyebrow", "Game collection"),
        create("h1", null, "Blockable"),
        create("p", null, this.t("tagline")),
      );

      const grid = create("section", "game-grid");
      const games = [
        ["block", "▦", () => this.startBlock()],
        ["tetris", "▤", () => this.startTetris()],
        ["sudoku", "#", () => this.openSudokuLevels()],
        ["colorlink", "⌁", () => this.startColorLink()],
        ["merge", "＋", () => this.startMerge()],
        ["lights", "✦", () => this.startLights()],
        ["mines", "⚑", () => this.startMines()],
        ["memory", "◈", () => this.startMemory()],
        ["daily", "✧", () => this.startColorLink(true)],
      ];
      games.forEach(([name, icon, handler]) => {
        const button = create("button", "game-card");
        button.type = "button";
        button.append(
          create("span", "game-icon", icon),
          create("strong", null, this.t(name)),
          create("span", null, this.t(`${name}Sub`)),
        );
        button.addEventListener("click", handler);
        grid.append(button);
      });

      const footer = create("footer", "home-footer");
      const update = create("button", "choice", this.t("check"));
      update.addEventListener("click", () => this.toast(this.t("current")));
      const level = Math.floor(storage.value.xp / 100) + 1;
      footer.append(create("span", null, `v${VERSION} · ${this.t("levelName")} ${level} · ${storage.value.xp} ${this.t("xp")}`), update);
      screen.append(top, hero, grid, footer);
      this.root.append(screen);
    }

    toast(message) {
      const notice = create("div", "notice", message);
      this.root.querySelector(".screen")?.append(notice);
      window.setTimeout(() => notice.remove(), 2200);
    }

    openSettings() {
      const modal = create("div", "modal");
      const sheet = create("section", "sheet");
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-label", this.t("settings"));
      sheet.append(create("h2", null, this.t("settings")));

      const addSetting = (label, control, hint = "") => {
        const row = create("div", "setting");
        row.append(create("label", null, label), create("span", "hint", hint), control);
        sheet.append(row);
      };
      const choices = (values, current, onChange) => {
        const row = create("div", "choice-row");
        values.forEach(([value, label]) => {
          const button = create("button", `choice ${value === current ? "active" : ""}`, label);
          button.type = "button";
          button.addEventListener("click", () => {
            onChange(value);
            modal.remove();
            this.openSettings();
          });
          row.append(button);
        });
        return row;
      };

      addSetting(this.t("theme"), choices(
        [["light", "Light"], ["dark", "Dark"]], storage.value.theme,
        (value) => this.setSetting("theme", value),
      ));
      addSetting(this.t("language"), choices(
        [["en", "English"], ["bg", "Български"]], storage.value.language,
        (value) => this.setSetting("language", value),
      ));
      const wallpaperChoices = [["paper", "Paper"], ["aurora", "Aurora"], ["kinetic", "Kinetic"], ["blueprint", "Blueprint"]];
      if (storage.value.customWallpaper) wallpaperChoices.push(["custom", "Custom"]);
      addSetting(this.t("wallpaper"), choices(
        wallpaperChoices, storage.value.wallpaper, (value) => this.setSetting("wallpaper", value),
      ));
      addSetting(this.t("gameStyle"), choices(
        [["flat", this.t("flat")], ["glossy", this.t("glossy")]],
        storage.value.gameStyle,
        (value) => this.setSetting("gameStyle", value),
      ));

      const uploadRow = create("div", "upload-row");
      const upload = create("input", "wallpaper-input");
      upload.type = "file";
      upload.accept = "image/png,image/jpeg,image/webp,image/heic,image/heif";
      upload.setAttribute("aria-label", this.t("uploadWallpaper"));
      const uploadButton = create("button", "secondary", this.t("uploadWallpaper"));
      uploadButton.type = "button";
      uploadButton.addEventListener("click", () => upload.click());
      upload.addEventListener("change", () => {
        if (upload.files?.[0]) this.saveCustomWallpaper(upload.files[0], modal);
      });
      uploadRow.append(uploadButton, upload);
      if (storage.value.customWallpaper) {
        const remove = create("button", "secondary", this.t("removeWallpaper"));
        remove.type = "button";
        remove.addEventListener("click", () => {
          storage.value.customWallpaper = "";
          storage.value.wallpaper = "paper";
          storage.save();
          this.applySettings();
          modal.remove();
          this.openSettings();
        });
        uploadRow.append(remove);
      }
      addSetting(this.t("customWallpaper"), uploadRow);

      [["sound", this.t("sound")], ["glass", this.t("glass")]].forEach(([key, label]) => {
        const toggle = create("input", "switch");
        toggle.type = "checkbox";
        toggle.checked = storage.value[key];
        toggle.setAttribute("aria-label", label);
        toggle.addEventListener("change", () => this.setSetting(key, toggle.checked));
        addSetting(label, toggle);
      });

      const check = create("button", "secondary", this.t("check"));
      check.addEventListener("click", () => this.toast(this.t("current")));
      addSetting(this.t("updates"), check, `v${VERSION}`);

      const footer = create("div", "sheet-footer");
      const done = create("button", "primary", this.t("done"));
      done.addEventListener("click", () => modal.remove());
      footer.append(done);
      sheet.append(footer);
      modal.append(sheet);
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.remove();
      });
      this.root.append(modal);
    }

    saveCustomWallpaper(file, modal) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const image = new Image();
        image.addEventListener("load", () => {
          const maximum = 1600;
          const scale = Math.min(1, maximum / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          storage.value.customWallpaper = canvas.toDataURL("image/jpeg", 0.84);
          storage.value.wallpaper = "custom";
          storage.save();
          this.applySettings();
          modal.remove();
          this.openSettings();
        });
        image.src = reader.result;
      });
      reader.readAsDataURL(file);
    }

    openSudokuLevels() {
      const modal = create("div", "modal");
      const sheet = create("section", "sheet");
      sheet.append(create("h2", null, this.t("sudoku")), create("p", null, this.t("choose")));
      const levels = create("div", "level-grid");
      ["easy", "medium", "hard", "extreme"].forEach((level) => {
        const button = create("button", "mode-button", this.t(level));
        button.addEventListener("click", () => {
          modal.remove();
          this.startSudoku(level);
        });
        levels.append(button);
      });
      sheet.append(levels);
      modal.append(sheet);
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.remove();
      });
      this.root.append(modal);
    }

    award(mode, amount, daily = false) {
      storage.value.xp += amount;
      storage.value.modeBest[mode] = Math.max(storage.value.modeBest[mode] || 0, amount);
      if (daily) {
        const today = new Date().toISOString().slice(0, 10);
        if (storage.value.dailyDate !== today) {
          storage.value.dailyDate = today;
          storage.value.dailyDone = true;
          storage.value.streak += 1;
        }
      }
      storage.save();
    }

    startBlock() { this.clear(); this.game = new BlockGame(this); }
    startTetris() { this.clear(); this.game = new TetrisGame(this); }
    startSudoku(level) { this.clear(); this.game = new SudokuGame(this, level); }
    startColorLink(daily = false) { this.clear(); this.game = new ColorLinkGame(this, daily); }
    startMerge() { this.clear(); this.game = new MergeGame(this); }
    startLights() { this.clear(); this.game = new LightsGame(this); }
    startMines() { this.clear(); this.game = new MinesGame(this); }
    startMemory() { this.clear(); this.game = new MemoryGame(this); }
  }

  class BlockGame {
    constructor(app) {
      this.app = app;
      this.grid = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
      this.cells = [];
      this.pieces = [];
      this.score = 0;
      this.selected = null;
      this.locked = false;
      this.drag = null;
      this.renderShell();
      this.newGame();
    }

    renderShell() {
      const screen = create("main", "screen");
      screen.classList.add("block-screen");
      screen.append(this.app.header(this.app.t("block")));

      const stats = create("div", "score-strip");
      this.scoreNode = create("strong", null, "0");
      this.bestNode = create("strong", null, String(storage.value.best));
      stats.append(this.stat(this.app.t("score"), this.scoreNode), this.stat(this.app.t("best"), this.bestNode));

      this.board = create("div", "block-board");
      this.board.setAttribute("aria-label", this.app.t("block"));
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        this.cells[row] = [];
        for (let column = 0; column < BOARD_SIZE; column += 1) {
          const cell = create("button", "block-cell");
          cell.type = "button";
          cell.dataset.row = String(row);
          cell.dataset.column = String(column);
          cell.setAttribute("aria-label", `${row + 1}, ${column + 1}`);
          cell.addEventListener("click", () => this.placeSelected(row, column));
          cell.addEventListener("pointerenter", () => this.preview(row, column));
          this.cells[row][column] = cell;
          this.board.append(cell);
        }
      }

      this.tray = create("div", "tray");
      this.notice = create("div", "notice");
      const actions = create("div", "game-actions");
      const restart = create("button", "secondary", this.app.t("newGame"));
      restart.addEventListener("click", () => this.newGame());
      actions.append(restart);
      screen.append(stats, this.board, this.tray, this.notice, actions);
      this.app.root.append(screen);
    }

    stat(label, value) {
      const node = create("div", "stat");
      node.append(create("span", null, label), value);
      return node;
    }

    newGame() {
      this.grid.forEach((row) => row.fill(null));
      this.score = 0;
      this.selected = null;
      this.locked = false;
      this.notice.textContent = "";
      this.pieces = this.makePieces();
      this.draw();
    }

    makePieces() {
      return Array.from({ length: 3 }, () => ({
        shape: randomItem(SHAPES),
        color: randomItem(COLORS),
        used: false,
      }));
    }

    forEachBlock(shape, baseRow, baseColumn, callback) {
      shape.forEach((row, y) => row.forEach((filled, x) => {
        if (filled) callback(baseRow + y, baseColumn + x);
      }));
    }

    canPlace(shape, row, column) {
      let valid = true;
      this.forEachBlock(shape, row, column, (targetRow, targetColumn) => {
        if (
          targetRow < 0 || targetColumn < 0 || targetRow >= BOARD_SIZE || targetColumn >= BOARD_SIZE ||
          this.grid[targetRow][targetColumn]
        ) valid = false;
      });
      return valid;
    }

    hasMove(piece) {
      if (piece.used) return false;
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let column = 0; column < BOARD_SIZE; column += 1) {
          if (this.canPlace(piece.shape, row, column)) return true;
        }
      }
      return false;
    }

    pieceNode(piece) {
      const node = create("div", "piece");
      node.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, auto)`;
      node.style.setProperty("--piece-color", piece.color);
      piece.shape.flat().forEach((filled) => node.append(create("b", filled ? "" : "empty")));
      return node;
    }

    draw() {
      this.grid.forEach((row, rowIndex) => row.forEach((color, columnIndex) => {
        const cell = this.cells[rowIndex][columnIndex];
        cell.className = `block-cell${color ? " filled" : ""}`;
        cell.style.setProperty("--cell-color", color || "");
      }));

      storage.value.best = Math.max(storage.value.best, this.score);
      storage.save();
      this.scoreNode.textContent = String(this.score);
      this.bestNode.textContent = String(storage.value.best);

      this.tray.replaceChildren();
      this.pieces.forEach((piece, index) => {
        const unavailable = piece.used || !this.hasMove(piece);
        const slot = create("button", `piece-slot${index === this.selected ? " selected" : ""}${unavailable ? " dead" : ""}`);
        slot.type = "button";
        slot.dataset.pieceIndex = String(index);
        slot.setAttribute("aria-label", `${this.app.t("block")} ${index + 1}`);
        if (!piece.used) {
          slot.append(this.pieceNode(piece));
          slot.addEventListener("click", () => this.select(index));
          slot.addEventListener("pointerdown", (event) => this.beginDrag(event, index));
        }
        this.tray.append(slot);
      });
    }

    select(index) {
      if (this.drag?.moved) return;
      const piece = this.pieces[index];
      if (!piece || piece.used || this.locked) return;
      this.selected = index;
      this.draw();
    }

    beginDrag(event, index) {
      if (event.button !== undefined && event.button !== 0) return;
      const piece = this.pieces[index];
      if (!piece || piece.used || this.locked) return;
      event.preventDefault();
      this.selected = index;
      const ghost = this.pieceNode(piece);
      ghost.classList.add("drag-ghost");
      document.body.append(ghost);
      this.drag = {
        index,
        piece,
        ghost,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
        target: null,
      };
      this.moveGhost(event.clientX, event.clientY);
      window.addEventListener("pointermove", this.onDragMove, { passive: false });
      window.addEventListener("pointerup", this.onDragEnd, { once: true });
      window.addEventListener("pointercancel", this.onDragCancel, { once: true });
    }

    onDragMove = (event) => {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      event.preventDefault();
      if (Math.hypot(event.clientX - this.drag.startX, event.clientY - this.drag.startY) > 5) this.drag.moved = true;
      this.moveGhost(event.clientX, event.clientY);
      const pointY = event.pointerType === "touch" ? event.clientY - 52 : event.clientY;
      this.drag.target = this.cellAtPoint(event.clientX, pointY);
      if (this.drag.target) this.preview(this.drag.target.row, this.drag.target.column, this.drag.piece);
      else this.clearPreview();
    };

    onDragEnd = (event) => {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      const { index, target, moved } = this.drag;
      this.cleanupDrag();
      if (moved && target && this.canPlace(this.pieces[index].shape, target.row, target.column)) {
        this.place(index, target.row, target.column);
      } else if (!moved) {
        this.selected = index;
        this.draw();
      }
    };

    onDragCancel = () => this.cleanupDrag();

    cleanupDrag() {
      this.drag?.ghost.remove();
      this.drag = null;
      this.clearPreview();
      window.removeEventListener("pointermove", this.onDragMove);
      window.removeEventListener("pointerup", this.onDragEnd);
      window.removeEventListener("pointercancel", this.onDragCancel);
    }

    moveGhost(x, y) {
      if (!this.drag) return;
      this.drag.ghost.style.left = `${x}px`;
      this.drag.ghost.style.top = `${y}px`;
    }

    cellAtPoint(x, y) {
      const cell = document.elementFromPoint(x, y)?.closest(".block-cell");
      if (!cell || !this.board.contains(cell)) return null;
      return { row: Number(cell.dataset.row), column: Number(cell.dataset.column) };
    }

  clearPreview() {
      this.cells.flat().forEach((cell) => {
        cell.classList.remove("preview-good", "preview-bad");
        cell.style.removeProperty("--preview-color");
      });
    }

    preview(row, column, explicitPiece = null) {
      this.clearPreview();
      const piece = explicitPiece || this.pieces[this.selected];
      if (!piece || piece.used) return;
      const valid = this.canPlace(piece.shape, row, column);
      this.forEachBlock(piece.shape, row, column, (targetRow, targetColumn) => {
        const cell = this.cells[targetRow]?.[targetColumn];
        if (!cell) return;
        cell.classList.add(valid ? "preview-good" : "preview-bad");
        if (valid) cell.style.setProperty("--preview-color", piece.color);
      });
    }

    placeSelected(row, column) {
      if (this.selected === null) return;
      this.place(this.selected, row, column);
    }

    place(index, row, column) {
      const piece = this.pieces[index];
      if (this.locked || !piece || piece.used || !this.canPlace(piece.shape, row, column)) return;
      this.locked = true;
      this.clearPreview();
      let blocks = 0;
      const placedCells = [];
      this.forEachBlock(piece.shape, row, column, (targetRow, targetColumn) => {
        this.grid[targetRow][targetColumn] = piece.color;
        placedCells.push(this.cells[targetRow][targetColumn]);
        blocks += 1;
      });
      piece.used = true;
      this.selected = null;
      this.score += blocks * 10;
      this.draw();
      placedCells.forEach((cell) => cell.classList.add("placed"));
      this.app.sound(300);

      const lines = this.completedLines();
      if (!lines.length) {
        this.finishMove();
        return;
      }

      this.score += lines.length * lines.length * 120;
      this.notice.textContent = `${lines.length} ${this.app.t("cleared")}`;
      const clearingCells = this.cellsForLines(lines);
      clearingCells.forEach((cell) => cell.classList.add("clearing"));
      this.app.sound(520, 0.1);
      window.setTimeout(() => {
        lines.forEach(({ type, index: lineIndex }) => {
          for (let offset = 0; offset < BOARD_SIZE; offset += 1) {
            this.grid[type === "row" ? lineIndex : offset][type === "row" ? offset : lineIndex] = null;
          }
        });
        this.finishMove();
      }, 220);
    }

    completedLines() {
      const lines = [];
      this.grid.forEach((row, index) => { if (row.every(Boolean)) lines.push({ type: "row", index }); });
      for (let column = 0; column < BOARD_SIZE; column += 1) {
        if (this.grid.every((row) => row[column])) lines.push({ type: "column", index: column });
      }
      return lines;
    }

    cellsForLines(lines) {
      const set = new Set();
      lines.forEach(({ type, index }) => {
        for (let offset = 0; offset < BOARD_SIZE; offset += 1) {
          set.add(this.cells[type === "row" ? index : offset][type === "row" ? offset : index]);
        }
      });
      return set;
    }

    finishMove() {
      if (this.pieces.every((piece) => piece.used)) this.pieces = this.makePieces();
      this.draw();
      this.locked = false;
      if (!this.pieces.some((piece) => this.hasMove(piece))) {
        this.notice.textContent = this.app.t("noMoves");
        window.setTimeout(() => this.showGameOver(), 300);
      }
    }

    showGameOver() {
      const modal = create("div", "modal");
      const sheet = create("section", "sheet");
      sheet.append(create("h2", null, this.app.t("gameOver")), create("p", null, `${this.app.t("score")}: ${this.score}`));
      const again = create("button", "primary", this.app.t("again"));
      again.addEventListener("click", () => { modal.remove(); this.newGame(); });
      sheet.append(again);
      modal.append(sheet);
      this.app.root.append(modal);
    }

    destroy() {
      this.cleanupDrag();
    }
  }

  class ArcadeGridGame {
    constructor(app, title, size, className = "arcade-screen") {
      this.app = app;
      this.size = size;
      this.done = false;
      this.screen = create("main", `screen ${className}`);
      this.screen.append(app.header(title));
      this.stats = create("div", "score-strip");
      this.board = create("div", "arcade-board");
      this.board.style.setProperty("--grid-size", size);
      this.notice = create("div", "notice");
      this.controls = create("div", "arcade-controls");
      this.screen.append(this.stats, this.board, this.notice, this.controls);
      app.root.append(this.screen);
    }

    stat(label, value) {
      const node = create("div", "stat");
      node.append(create("span", null, label), value);
      this.stats.append(node);
      return value;
    }

    button(label, handler, className = "secondary") {
      const button = create("button", className, label);
      button.type = "button";
      button.addEventListener("click", handler);
      this.controls.append(button);
      return button;
    }

    finish(mode, amount, daily = false) {
      if (this.done) return;
      this.done = true;
      this.app.award(mode, amount, daily);
      this.notice.textContent = `${this.app.t("congratulations")} +${amount} ${this.app.t("xp")}`;
      this.app.sound(660, 0.14);
    }

    destroy() {}
  }

  class ColorLinkGame extends ArcadeGridGame {
    constructor(app, daily = false) {
      super(app, app.t("colorlink"), 6, "colorlink-screen");
      this.daily = daily;
      this.colors = COLORS.slice(0, 6);
      this.grid = Array.from({ length: 6 }, () => Array(6).fill(null));
      this.completed = new Set();
      this.active = null;
      this.path = [];
      this.colors.forEach((color, row) => { this.grid[row][0] = color; this.grid[row][5] = color; });
      this.scoreNode = this.stat(this.app.t("moves"), create("strong", null, "0"));
      this.render();
      this.button(this.app.t("reset"), () => this.reset());
    }

    reset() {
      this.grid = Array.from({ length: 6 }, () => Array(6).fill(null));
      this.completed.clear(); this.active = null; this.path = []; this.moves = 0; this.done = false;
      this.colors.forEach((color, row) => { this.grid[row][0] = color; this.grid[row][5] = color; });
      this.notice.textContent = ""; this.render();
    }

    render() {
      this.board.replaceChildren();
      for (let row = 0; row < 6; row += 1) for (let column = 0; column < 6; column += 1) {
        const cell = create("button", "arcade-cell color-cell");
        const color = this.grid[row][column];
        cell.style.setProperty("--cell-color", color || "transparent");
        cell.classList.toggle("endpoint", Boolean(color && (column === 0 || column === 5)));
        cell.classList.toggle("path-cell", Boolean(color && column !== 0 && column !== 5));
        cell.addEventListener("pointerdown", () => this.start(row, column));
        cell.addEventListener("pointerenter", () => this.extend(row, column));
        cell.addEventListener("click", () => this.extend(row, column));
        this.board.append(cell);
      }
      this.scoreNode.textContent = String(this.moves || 0);
    }

    start(row, column) {
      const color = this.grid[row][column];
      if (!color || this.completed.has(color)) return;
      this.active = color; this.path = [[row, column]];
      this.notice.textContent = ""; this.render();
    }

    extend(row, column) {
      if (!this.active || this.done) return;
      const last = this.path[this.path.length - 1];
      if (Math.abs(last[0] - row) + Math.abs(last[1] - column) !== 1) return;
      const cellColor = this.grid[row][column];
      if (cellColor && cellColor !== this.active) return;
      if (this.path.some(([r, c]) => r === row && c === column)) return;
      this.path.push([row, column]);
      if (column === 5 && cellColor === this.active) {
        this.path.forEach(([r, c]) => { this.grid[r][c] = this.active; });
        this.completed.add(this.active); this.moves += 1; this.active = null; this.path = [];
        this.render();
        if (this.completed.size === this.colors.length) this.finish("colorlink", 50, this.daily);
      } else {
        this.grid[row][column] = this.active;
        this.render();
      }
    }
  }

  class MergeGame extends ArcadeGridGame {
    constructor(app) {
      super(app, app.t("merge"), 4, "merge-screen");
      this.grid = Array.from({ length: 4 }, () => Array(4).fill(0));
      this.score = 0; this.scoreNode = this.stat(app.t("score"), create("strong", null, "0"));
      [0, 1].forEach(() => this.addRandom()); this.render();
      [["←", "left"], ["↑", "up"], ["↓", "down"], ["→", "right"]].forEach(([label, direction]) => this.button(label, () => this.move(direction), "arcade-control"));
      this.boundKeyDown = (event) => { const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" }; if (map[event.key]) { event.preventDefault(); this.move(map[event.key]); } };
      window.addEventListener("keydown", this.boundKeyDown);
    }

    addRandom() { const empty = []; this.grid.forEach((row, r) => row.forEach((value, c) => { if (!value) empty.push([r, c]); })); if (empty.length) { const [r, c] = randomItem(empty); this.grid[r][c] = Math.random() < 0.9 ? 2 : 4; } }
    render() { this.board.replaceChildren(); this.grid.flat().forEach((value) => { const cell = create("div", `arcade-cell merge-cell value-${value || 0}`, value ? String(value) : ""); cell.style.setProperty("--tile-level", String(Math.log2(value || 1))); this.board.append(cell); }); this.scoreNode.textContent = String(this.score); }
    move(direction) {
      if (this.done) return;
      const before = JSON.stringify(this.grid); const transpose = direction === "up" || direction === "down";
      let lines = transpose ? this.grid[0].map((_, c) => this.grid.map((row) => row[c])) : this.grid.map((row) => [...row]);
      if (direction === "right" || direction === "down") lines = lines.map((line) => line.reverse());
      lines = lines.map((line) => { const packed = line.filter(Boolean); const merged = []; for (let i = 0; i < packed.length; i += 1) { if (packed[i] === packed[i + 1]) { merged.push(packed[i] * 2); this.score += packed[i] * 2; i += 1; } else merged.push(packed[i]); } while (merged.length < 4) merged.push(0); return (direction === "right" || direction === "down") ? merged.reverse() : merged; });
      this.grid = transpose ? this.grid.map((_, r) => lines.map((line) => line[r])) : lines;
      if (JSON.stringify(this.grid) === before) return;
      this.addRandom(); this.render(); this.app.sound(280);
      if (this.grid.flat().some((value) => value >= 2048)) this.finish("merge", Math.max(20, this.score));
    }
    destroy() { window.removeEventListener("keydown", this.boundKeyDown); }
  }

  class LightsGame extends ArcadeGridGame {
    constructor(app) { super(app, app.t("lights"), 5, "lights-screen"); this.grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => Math.random() > 0.58)); this.moves = 0; this.movesNode = this.stat(app.t("moves"), create("strong", null, "0")); this.render(); this.button(app.t("reset"), () => this.reset()); }
    reset() { this.grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => Math.random() > 0.58)); this.moves = 0; this.done = false; this.notice.textContent = ""; this.render(); }
    render() { this.board.replaceChildren(); this.grid.forEach((row, r) => row.forEach((on, c) => { const cell = create("button", `arcade-cell light-cell${on ? " on" : ""}`); cell.addEventListener("click", () => this.toggle(r, c)); this.board.append(cell); })); this.movesNode.textContent = String(this.moves); }
    toggle(row, column) { [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => { const r = row + dr; const c = column + dc; if (this.grid[r]?.[c] !== undefined) this.grid[r][c] = !this.grid[r][c]; }); this.moves += 1; this.render(); if (this.grid.flat().every((on) => !on)) this.finish("lights", Math.max(20, 100 - this.moves)); }
  }

  class MinesGame extends ArcadeGridGame {
    constructor(app) { super(app, app.t("mines"), 8, "mines-screen"); this.mineCount = 10; this.reset(); this.button(app.t("reset"), () => this.reset()); }
    reset() { this.mines = new Set(); while (this.mines.size < this.mineCount) this.mines.add(Math.floor(Math.random() * 64)); this.revealed = new Set(); this.flags = new Set(); this.done = false; this.notice.textContent = ""; this.render(); }
    neighbors(index) { const r = Math.floor(index / 8); const c = index % 8; const out = []; for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) if (dr || dc) { const rr = r + dr; const cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) out.push(rr * 8 + cc); } return out; }
    count(index) { return this.neighbors(index).filter((neighbor) => this.mines.has(neighbor)).length; }
    render() { this.board.replaceChildren(); for (let index = 0; index < 64; index += 1) { const cell = create("button", `arcade-cell mine-cell${this.revealed.has(index) ? " revealed" : ""}${this.flags.has(index) ? " flagged" : ""}`, this.flags.has(index) ? "⚑" : this.revealed.has(index) && this.mines.has(index) ? "✦" : this.revealed.has(index) ? String(this.count(index) || "") : ""); cell.addEventListener("click", () => this.reveal(index)); cell.addEventListener("contextmenu", (event) => { event.preventDefault(); if (!this.revealed.has(index)) { this.flags.has(index) ? this.flags.delete(index) : this.flags.add(index); this.render(); } }); this.board.append(cell); } }
    reveal(index) { if (this.done || this.flags.has(index) || this.revealed.has(index)) return; if (this.mines.has(index)) { this.revealed = new Set(this.mines); this.render(); this.notice.textContent = this.app.t("gameOver"); this.done = true; return; } const queue = [index]; while (queue.length) { const current = queue.shift(); if (this.revealed.has(current)) continue; this.revealed.add(current); if (!this.count(current)) this.neighbors(current).filter((neighbor) => !this.mines.has(neighbor)).forEach((neighbor) => queue.push(neighbor)); } this.render(); if (this.revealed.size >= 64 - this.mineCount) this.finish("mines", 60); }
  }

  class MemoryGame extends ArcadeGridGame {
    constructor(app) { super(app, app.t("memory"), 4, "memory-screen"); this.reset(); this.button(app.t("reset"), () => this.reset()); }
    reset() { this.values = [...COLORS, "#f0c64b", "#4ca6e8", ...COLORS, "#f0c64b", "#4ca6e8"].sort(() => Math.random() - 0.5); this.open = []; this.matched = new Set(); this.moves = 0; this.locked = false; this.done = false; this.movesNode ||= this.stat(this.app.t("moves"), create("strong", null, "0")); this.render(); }
    render() { this.board.replaceChildren(); this.values.forEach((color, index) => { const cell = create("button", `arcade-cell memory-cell${this.open.includes(index) || this.matched.has(index) ? " shown" : ""}`); if (this.open.includes(index) || this.matched.has(index)) cell.style.setProperty("--cell-color", color); cell.addEventListener("click", () => this.pick(index)); this.board.append(cell); }); this.movesNode.textContent = String(this.moves); }
    pick(index) { if (this.locked || this.matched.has(index) || this.open.includes(index)) return; this.open.push(index); this.render(); if (this.open.length < 2) return; this.moves += 1; const [first, second] = this.open; if (this.values[first] === this.values[second]) { this.matched.add(first); this.matched.add(second); this.open = []; this.render(); if (this.matched.size === this.values.length) this.finish("memory", Math.max(20, 100 - this.moves)); } else { this.locked = true; window.setTimeout(() => { this.open = []; this.locked = false; this.render(); }, 650); } }
  }

  class TetrisGame {
    constructor(app) {
      this.app = app;
      this.rows = 20;
      this.columns = 10;
      this.dropInterval = 620;
      this.lastTick = Date.now();
      this.elapsed = 0;
      this.dropTimer = null;
      this.paused = false;
      this.over = false;
      this.resetState();
      this.renderShell();
      this.boundKeyDown = (event) => this.keyDown(event);
      window.addEventListener("keydown", this.boundKeyDown);
      this.dropTimer = window.setInterval(() => this.tick(), 50);
    }

    resetState() {
      this.grid = Array.from({ length: this.rows }, () => Array(this.columns).fill(null));
      this.score = 0;
      this.lines = 0;
      this.current = this.randomPiece();
      this.next = this.randomPiece();
      this.paused = false;
      this.over = false;
      this.elapsed = 0;
    }

    randomPiece() {
      const shape = randomItem(TETROMINOES).map((row) => [...row]);
      return { shape, color: randomItem(COLORS), row: 0, column: Math.floor((this.columns - shape[0].length) / 2) };
    }

    renderShell() {
      const screen = create("main", "screen");
      screen.append(this.app.header(this.app.t("tetris")));

      const stats = create("div", "score-strip");
      this.scoreNode = create("strong", null, "0");
      this.linesNode = create("strong", null, "0");
      this.levelNode = create("strong", null, "1");
      stats.append(this.stat(this.app.t("score"), this.scoreNode), this.stat(this.app.t("lines"), this.linesNode), this.stat(this.app.t("level"), this.levelNode));

      const layout = create("div", "tetris-layout");
      this.board = create("div", "tetris-board");
      this.board.setAttribute("aria-label", this.app.t("tetris"));
      this.cells = [];
      for (let index = 0; index < this.rows * this.columns; index += 1) {
        const cell = create("div", "tet-cell");
        this.cells.push(cell);
        this.board.append(cell);
      }

      const side = create("aside", "tetris-side");
      side.append(create("span", "side-label", this.app.t("next")));
      this.nextNode = create("div", "next-preview");
      this.stateNode = create("div", "pause-state", this.app.t("running"));
      side.append(this.nextNode, this.stateNode);
      layout.append(this.board, side);

      const controls = create("div", "tetris-controls");
      const definitions = [
        ["←", "Move left", () => this.move(-1)], ["↻", "Rotate", () => this.rotate()], ["→", "Move right", () => this.move(1)],
        ["↓", "Soft drop", () => this.softDrop()], ["⏸", this.app.t("pause"), () => this.togglePause()], ["⤓", "Hard drop", () => this.hardDrop()],
        ["↺", this.app.t("newGame"), () => { this.dropInterval = 620; this.resetState(); this.lastTick = Date.now(); this.draw(); }],
      ];
      definitions.forEach(([symbol, label, handler]) => {
        const button = create("button", null, symbol);
        button.type = "button";
        button.setAttribute("aria-label", label);
        button.addEventListener("click", handler);
        controls.append(button);
      });
      screen.append(stats, layout, controls);
      this.app.root.append(screen);
      this.draw();
    }

    stat(label, value) {
      const node = create("div", "stat");
      node.append(create("span", null, label), value);
      return node;
    }

    tick() {
      const now = Date.now();
      const delta = Math.min(now - this.lastTick, 250);
      this.lastTick = now;
      if (this.paused || this.over) return;
      this.elapsed += delta;
      if (this.elapsed >= this.dropInterval) {
        this.elapsed %= this.dropInterval;
        this.stepDown();
      }
    }

    valid(piece, rowOffset = 0, columnOffset = 0, shape = piece.shape) {
      return shape.every((row, y) => row.every((filled, x) => {
        if (!filled) return true;
        const targetRow = piece.row + y + rowOffset;
        const targetColumn = piece.column + x + columnOffset;
        return targetRow >= 0 && targetRow < this.rows && targetColumn >= 0 && targetColumn < this.columns &&
          !this.grid[targetRow][targetColumn];
      }));
    }

    draw() {
      this.cells.forEach((cell, index) => {
        const row = Math.floor(index / this.columns);
        const column = index % this.columns;
        const color = this.grid[row][column];
        cell.className = `tet-cell${color ? " filled" : ""}`;
        cell.style.setProperty("--cell-color", color || "");
      });
      this.current.shape.forEach((row, y) => row.forEach((filled, x) => {
        if (!filled) return;
        const index = (this.current.row + y) * this.columns + this.current.column + x;
        const cell = this.cells[index];
        if (cell) {
          cell.className = "tet-cell filled active";
          cell.style.setProperty("--cell-color", this.current.color);
        }
      }));
      this.board.dataset.activeRow = String(this.current.row);
      this.scoreNode.textContent = String(this.score);
      this.linesNode.textContent = String(this.lines);
      this.levelNode.textContent = String(Math.floor(this.lines / 10) + 1);
      this.stateNode.textContent = this.over ? this.app.t("gameOver") : this.paused ? this.app.t("paused") : this.app.t("running");
      this.drawNext();
    }

    drawNext() {
      this.nextNode.replaceChildren();
      const preview = create("div", "mini-tetromino");
      preview.style.gridTemplateColumns = `repeat(${this.next.shape[0].length}, 11px)`;
      preview.style.setProperty("--piece-color", this.next.color);
      this.next.shape.flat().forEach((filled) => preview.append(create("b", filled ? "" : "empty")));
      this.nextNode.append(preview);
    }

    move(direction) {
      if (this.paused || this.over) return;
      if (this.valid(this.current, 0, direction)) this.current.column += direction;
      this.draw();
    }

    rotate() {
      if (this.paused || this.over) return;
      const rotated = this.current.shape[0].map((_, index) => this.current.shape.map((row) => row[index]).reverse());
      if (this.valid(this.current, 0, 0, rotated)) this.current.shape = rotated;
      else if (this.valid(this.current, 0, -1, rotated)) { this.current.column -= 1; this.current.shape = rotated; }
      else if (this.valid(this.current, 0, 1, rotated)) { this.current.column += 1; this.current.shape = rotated; }
      this.draw();
    }

    stepDown() {
      if (this.valid(this.current, 1, 0)) this.current.row += 1;
      else this.lockPiece();
      this.draw();
    }

    softDrop() {
      if (this.paused || this.over) return;
      this.score += 1;
      this.stepDown();
      this.elapsed = 0;
    }

    hardDrop() {
      if (this.paused || this.over) return;
      let distance = 0;
      while (this.valid(this.current, 1, 0)) { this.current.row += 1; distance += 1; }
      this.score += distance * 2;
      this.lockPiece();
      this.draw();
    }

    lockPiece() {
      this.current.shape.forEach((row, y) => row.forEach((filled, x) => {
        if (filled) this.grid[this.current.row + y][this.current.column + x] = this.current.color;
      }));
      const remaining = this.grid.filter((row) => !row.every(Boolean));
      const cleared = this.rows - remaining.length;
      while (remaining.length < this.rows) remaining.unshift(Array(this.columns).fill(null));
      this.grid = remaining;
      if (cleared) {
        this.lines += cleared;
        this.score += [0, 100, 300, 500, 800][cleared];
        this.dropInterval = Math.max(160, 620 - Math.floor(this.lines / 10) * 55);
        this.app.sound(520, 0.1);
      } else {
        this.score += 10;
      }
      this.current = this.next;
      this.next = this.randomPiece();
      if (!this.valid(this.current)) {
        this.over = true;
        this.stateNode.textContent = this.app.t("gameOver");
        window.setTimeout(() => this.showGameOver(), 180);
      }
    }

    togglePause() {
      if (this.over) return;
      this.paused = !this.paused;
      this.elapsed = 0;
      this.lastTick = Date.now();
      this.draw();
    }

    keyDown(event) {
      const actions = {
        ArrowLeft: () => this.move(-1), ArrowRight: () => this.move(1), ArrowDown: () => this.softDrop(),
        ArrowUp: () => this.rotate(), " ": () => this.hardDrop(), p: () => this.togglePause(), P: () => this.togglePause(),
      };
      if (!actions[event.key]) return;
      event.preventDefault();
      actions[event.key]();
    }

    showGameOver() {
      const modal = create("div", "modal");
      const sheet = create("section", "sheet");
      sheet.append(create("h2", null, this.app.t("gameOver")), create("p", null, `${this.app.t("score")}: ${this.score}`));
      const again = create("button", "primary", this.app.t("again"));
      again.addEventListener("click", () => {
        modal.remove();
        this.dropInterval = 620;
        this.resetState();
        this.lastTick = Date.now();
        this.draw();
      });
      sheet.append(again);
      modal.append(sheet);
      this.app.root.append(modal);
    }

    destroy() {
      window.clearInterval(this.dropTimer);
      window.removeEventListener("keydown", this.boundKeyDown);
    }
  }

  class SudokuGame {
    constructor(app, level) {
      this.app = app;
      this.level = level;
      this.solution = [5,3,4,6,7,8,9,1,2,6,7,2,1,9,5,3,4,8,1,9,8,3,4,2,5,6,7,8,5,9,7,6,1,4,2,3,4,2,6,8,5,3,7,9,1,7,1,3,9,2,4,8,5,6,9,6,1,5,3,7,2,8,4,2,8,7,4,1,9,6,3,5,3,4,5,2,8,6,1,7,9];
      this.board = [...this.solution];
      this.given = new Set();
      this.selected = null;
      const holes = { easy: 30, medium: 40, hard: 50, extreme: 58 }[level];
      [...Array(81).keys()].sort(() => Math.random() - 0.5).slice(0, holes).forEach((index) => { this.board[index] = 0; });
      this.board.forEach((value, index) => { if (value) this.given.add(index); });
      this.renderShell();
    }

    renderShell() {
      const screen = create("main", "screen");
      screen.append(this.app.header(this.app.t("sudoku")));
      const stats = create("div", "score-strip");
      stats.append(this.stat(this.app.t("level"), create("strong", null, this.app.t(this.level))));
      this.boardNode = create("div", "sudoku-board");
      const pad = create("div", "number-pad");
      for (let number = 1; number <= 9; number += 1) {
        const button = create("button", null, String(number));
        button.addEventListener("click", () => this.setNumber(number));
        pad.append(button);
      }
      const erase = create("button", null, "×");
      erase.addEventListener("click", () => this.setNumber(0));
      pad.append(erase);
      screen.append(stats, this.boardNode, pad);
      this.app.root.append(screen);
      this.draw();
    }

    stat(label, value) {
      const node = create("div", "stat");
      node.append(create("span", null, label), value);
      return node;
    }

    draw() {
      this.boardNode.replaceChildren();
      this.board.forEach((value, index) => {
        const button = create("button", `sudoku-cell${this.given.has(index) ? " given" : ""}${index === this.selected ? " selected" : ""}`, value || "");
        button.disabled = this.given.has(index);
        button.addEventListener("click", () => { this.selected = index; this.draw(); });
        this.boardNode.append(button);
      });
    }

    setNumber(number) {
      if (this.selected === null || this.given.has(this.selected)) return;
      this.board[this.selected] = number;
      this.draw();
      if (this.board.every(Boolean) && this.board.every((value, index) => value === this.solution[index])) this.app.toast("Complete");
    }

    destroy() {}
  }

  new App($("#app")).init();
})();
