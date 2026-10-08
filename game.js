(() => {
  "use strict";

  const VERSION = "1.6.2";
  const { DIFFICULTIES, MODES, CONFIG, SandBoard, SessionStore } = window.BlockableCore;
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
      colorlink: "ColorLink", colorlinkSub: "Connect every matching color.", merge: "2048 Merging", mergeSub: "Slide and combine blocks.",
      lights: "Lights Out", lightsSub: "Turn every light off.", mines: "Minesweeper", minesSub: "Reveal the safe squares.",
      memory: "Memory Blocks", memorySub: "Find the matching pairs.", daily: "Daily Logic", dailySub: "Balance the grid in a few minutes.",
      levelName: "Arcade level", xp: "XP", streak: "Streak", moves: "Moves", reset: "Reset", congratulations: "Complete!", notes: "Notes", erase: "Erase", check: "Check", currentTime: "Time", bestTime: "Best time", mistakes: "Mistakes", rules: "Rules", memoryRules: "Reveal two cards at a time and find every matching pair.", dailyRules: "Fill each row and column with equal suns and moons. Never place three identical symbols in a row.", resetSettings: "Reset all settings", resetConfirm: "Reset all appearance, sound, wallpaper, and game preferences?", confirm: "Reset", cancel: "Cancel", locked: "Locked", level: "Level",
      choose: "Choose difficulty", easy: "Easy", medium: "Medium", hard: "Hard", extreme: "Extreme",
      score: "Score", best: "Best", lines: "Lines", level: "Level", pause: "Pause", paused: "Paused",
      running: "Running", gameOver: "Game over", again: "Play again", back: "Home", noMoves: "No more moves.",
      next: "Next", done: "Done", cleared: "cleared", reveal: "Reveal", flag: "Flag",
      updateAvailable: "Version {version} is available.", updateFailed: "Could not check for updates.", storageFailed: "Your changes could not be saved on this device.",
    },
    bg: {
      tagline: "Малка колекция от фокусирани игри.", settings: "Настройки", newGame: "Нова игра",
      sound: "Звук", glass: "Стъклен ефект", theme: "Изглед", language: "Език",
      wallpaper: "Фон", gameStyle: "Дизайн на блоковете", flat: "Минимален", glossy: "3D", customWallpaper: "Собствен фон",
      uploadWallpaper: "Избери изображение", removeWallpaper: "Премахни изображението", updates: "Актуализации", check: "Провери за актуализации", current: "Приложението е актуално.",
      block: "Blockable", blockSub: "Подреждай фигури и изчиствай линии.", tetris: "Тетрис",
      tetrisSub: "Класически падащи блокове.", sudoku: "Судоку", sudokuSub: "Спокойно логическо предизвикателство.",
      colorlink: "ColorLink", colorlinkSub: "Свържи всички еднакви цветове.", merge: "2048 Merging", mergeSub: "Плъзгай и сливай блокове.",
      lights: "Lights Out", lightsSub: "Изгаси всички светлини.", mines: "Minesweeper", minesSub: "Открий безопасните полета.",
      memory: "Memory Blocks", memorySub: "Открий еднаквите двойки.", daily: "Дневна логика", dailySub: "Балансирай решетката за минути.",
      levelName: "Ниво в аркадата", xp: "XP", streak: "Поредица", moves: "Ходове", reset: "Нулиране", congratulations: "Готово!", notes: "Бележки", erase: "Изтрий", check: "Провери", currentTime: "Време", bestTime: "Най-добро", mistakes: "Грешки", rules: "Правила", memoryRules: "Обръщай по две карти и открий всички еднакви двойки.", dailyRules: "Попълни редовете и колоните с равен брой слънца и луни. Не поставяй три еднакви символа поред.", resetSettings: "Нулирай настройките", resetConfirm: "Да се нулират ли всички настройки за изглед, звук, фон и игри?", confirm: "Нулирай", cancel: "Отказ", locked: "Заключено", level: "Ниво",
      choose: "Избери трудност", easy: "Лесно", medium: "Средно", hard: "Трудно", extreme: "Екстремно",
      score: "Резултат", best: "Рекорд", lines: "Линии", level: "Ниво", pause: "Пауза", paused: "На пауза",
      running: "Игра", gameOver: "Край на играта", again: "Играй пак", back: "Начало", noMoves: "Няма възможен ход.",
      next: "Следва", done: "Готово", cleared: "изчистени", reveal: "Откривай", flag: "Флаг",
      updateAvailable: "Налична е версия {version}.", updateFailed: "Проверката за актуализации не бе успешна.", storageFailed: "Промените не могат да бъдат запазени на това устройство.",
    },
  };
  Object.assign(COPY.en, {
    updateNow: "Update now", checkingUpdate: "Checking for updates...", installingUpdate: "Downloading update...", updateReady: "Version {version} is ready. Your game will be saved before restarting.", retryUpdate: "Try again", later: "Later", nativeUpdate: "Download the new desktop release, or rebuild your native phone app to install this update.", openRelease: "Open downloads",
    sand: "Sand Blocks", sandSub: "Turn falling blocks into flowing color.", veryHard: "Very Hard", continue: "Continue", unfinished: "Unfinished games", saveHome: "Save & home", delete: "Delete", deleteSave: "Delete this saved game?", mixedColors: "Mixed-color pieces", noSaved: "No unfinished games", checkUpdates: "Check for updates", difficulty: "Difficulty", pausedSaved: "Your game is saved.", resume: "Resume", moveLeft: "Move left", moveRight: "Move right", rotate: "Rotate", softDrop: "Soft drop", hardDrop: "Hard drop", saveFailed: "This game could not be saved. Free some device storage and try again.",
  });
  Object.assign(COPY.bg, {
    updateNow: "Актуализирай сега", checkingUpdate: "Проверка за актуализации...", installingUpdate: "Изтегляне на актуализация...", updateReady: "Версия {version} е готова. Играта ще бъде запазена преди рестарт.", retryUpdate: "Опитай пак", later: "По-късно", nativeUpdate: "Изтегли новата настолна версия или компилирай и инсталирай отново нативното приложение за телефон.", openRelease: "Отвори изтеглянията",
    sand: "Пясъчни блокове", sandSub: "Превърни падащите блокове в цветен пясък.", veryHard: "Много трудно", continue: "Продължи", unfinished: "Незавършени игри", saveHome: "Запази и начало", delete: "Изтрий", deleteSave: "Да се изтрие ли запазената игра?", mixedColors: "Многоцветни фигури", noSaved: "Няма незавършени игри", checkUpdates: "Провери за актуализации", difficulty: "Трудност", pausedSaved: "Играта е запазена.", resume: "Продължи", moveLeft: "Наляво", moveRight: "Надясно", rotate: "Завърти", softDrop: "Спусни", hardDrop: "Пусни долу", saveFailed: "Играта не може да бъде запазена. Освободи място и опитай пак.",
  });

  const $ = (selector, root = document) => root.querySelector(selector);
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
  const shuffle = (items) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  };
  const localDateKey = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  };

  const storage = {
    key: "blockable-settings-v2",
    defaults: {
      theme: "light", language: "en", sound: true, glass: false, wallpaper: "paper",
      gameStyle: "flat", customWallpaper: "", best: 0, xp: 0, streak: 0, dailyDate: "", dailyDone: false, modeBest: {}, colorlinkLevel: 1, sudokuBest: {},
    },
    value: null,
    error: null,
    load() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.key) || "{}");
        const allowed = (value, options, fallback) => options.includes(value) ? value : fallback;
        this.value = {
          ...this.defaults,
          ...(saved && typeof saved === "object" ? saved : {}),
          theme: allowed(saved?.theme, ["light", "dark"], this.defaults.theme),
          language: allowed(saved?.language, Object.keys(COPY), this.defaults.language),
          wallpaper: allowed(saved?.wallpaper, ["paper", "aurora", "kinetic", "blueprint", "comic", "custom"], this.defaults.wallpaper),
          gameStyle: allowed(saved?.gameStyle, ["flat", "glossy"], this.defaults.gameStyle),
          sound: typeof saved?.sound === "boolean" ? saved.sound : this.defaults.sound,
          glass: typeof saved?.glass === "boolean" ? saved.glass : this.defaults.glass,
          customWallpaper: typeof saved?.customWallpaper === "string" ? saved.customWallpaper : "",
          best: Number.isFinite(saved?.best) ? Math.max(0, saved.best) : 0,
          xp: Number.isFinite(saved?.xp) ? Math.max(0, saved.xp) : 0,
          streak: Number.isFinite(saved?.streak) ? Math.max(0, saved.streak) : 0,
          colorlinkLevel: Number.isFinite(saved?.colorlinkLevel) ? Math.max(1, Math.floor(saved.colorlinkLevel)) : 1,
          modeBest: saved?.modeBest && typeof saved.modeBest === "object" ? saved.modeBest : {},
          sudokuBest: saved?.sudokuBest && typeof saved.sudokuBest === "object" ? saved.sudokuBest : {},
        };
        if (!this.value.customWallpaper && this.value.wallpaper === "custom") this.value.wallpaper = "paper";
      } catch {
        this.value = { ...this.defaults };
      }
    },
    save() {
      try {
        localStorage.setItem(this.key, JSON.stringify(this.value));
        this.error = null;
        return true;
      } catch (error) {
        this.error = error;
        return false;
      }
    },
  };

  class App {
    constructor(root) {
      this.root = root;
      this.game = null;
      this.audioContext = null;
      this.currentSession = null;
      this.userPaused = false;
      this.backgrounded = document.hidden;
      this.sessions = new SessionStore({ getItem: (key) => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) });
      this.pressControls = new Set();
      this.boundVisibilityChange = () => this.setActive(!document.hidden);
    }

    t(key) {
      return COPY[storage.value.language][key] || key;
    }

    init() {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      storage.load();
      this.applySettings();
      this.showHome();
      document.addEventListener("visibilitychange", this.boundVisibilityChange);
      window.addEventListener("pagehide", () => this.setActive(false));
      window.addEventListener("pageshow", () => { this.setActive(!document.hidden); if (!this.game) window.scrollTo(0, 0); });
      window.addEventListener("beforeunload", () => this.saveSession());
      this.autosaveTimer = window.setInterval(() => this.saveSession(), 5000);
      this.updater = new window.BlockableUpdates.Updater({ version: VERSION, native: window.Capacitor?.isNativePlatform?.() === true, onState: (state) => this.renderUpdate(state), save: () => this.saveSession(), reload: () => location.reload() });
      this.modalObserver = new MutationObserver(() => this.syncGameActivity());
      this.modalObserver.observe(this.root, { childList: true });
    }

    setActive(active) {
      this.backgrounded = !active;
      this.syncGameActivity();
      if (!active) this.saveSession();
      if (!this.audioContext) return;
      if (active && storage.value.sound) this.audioContext.resume().catch(() => {});
      if (!active) this.audioContext.suspend().catch(() => {});
    }

    syncGameActivity() {
      const active = !this.isGameBlocked();
      this.root.dataset.paused = String(!active);
      if (!active) this.stopInputs();
      this.game?.setActive?.(active);
    }

    stopInputs() {
      this.game?.cleanupDrag?.();
      this.game?.cancelGesture?.();
      for (const control of this.pressControls) control.cancel();
    }

    applySettings() {
      this.root.dataset.theme = storage.value.theme;
      this.root.dataset.wallpaper = storage.value.wallpaper;
      this.root.dataset.glass = String(storage.value.glass);
      this.root.dataset.gameStyle = storage.value.gameStyle;
      this.root.style.setProperty("--custom-wallpaper", storage.value.customWallpaper ? `url(${JSON.stringify(storage.value.customWallpaper)})` : "none");
      document.documentElement.lang = storage.value.language;
      const iconPath = "./Assets/BlockableDesktopIcon.png";
      const touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
      const manifest = document.querySelector('link[rel="manifest"]');
      if (touchIcon) touchIcon.href = "./Assets/pwa/apple-touch-icon.png";
      if (manifest) manifest.href = "./manifest.webmanifest";
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.content = storage.value.theme === "dark" ? "#191919" : "#f7f7f5";
      this.root.querySelectorAll(".brand-logo").forEach((logo) => { logo.src = iconPath; });
    }

    setSetting(key, value) {
      storage.value[key] = value;
      if (!storage.save()) this.toast(this.t("storageFailed"));
      this.applySettings();
    }

    clear() {
      this.saveSession();
      this.stopInputs();
      for (const control of this.pressControls) control.destroy();
      this.pressControls.clear();
      this.game?.destroy();
      this.game = null;
      this.currentSession = null;
      this.userPaused = false;
      this.root.replaceChildren();
      window.scrollTo(0, 0);
    }

    isGameBlocked() { return this.userPaused || this.backgrounded || Boolean(this.root.querySelector(".modal")); }

    saveSession() {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
      if (!this.game || !this.currentSession || !this.game.serialize) return true;
      if (this.game.over || this.game.done || this.game.complete) return this.sessions.remove(this.currentSession.id);
      const state = this.game.serialize();
      return this.sessions.save({ ...this.currentSession, updatedAt: Date.now(), state });
    }

    requestSave() {
      if (this.saveTimer) return;
      this.saveTimer = setTimeout(() => { if (!this.saveSession()) this.toast(this.t("saveFailed")); }, 350);
    }

    pauseGame() {
      if (!this.game || this.game.over || this.game.done || this.game.complete) return;
      this.userPaused = true;
      this.stopInputs();
      this.game.setActive?.(false);
      const saved = this.saveSession();
      const modal = create("div", "modal");
      const sheet = create("section", "sheet");
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-modal", "true");
      sheet.setAttribute("aria-label", this.t("paused"));
      sheet.append(create("h2", null, this.t("paused")), create("p", null, this.t(saved ? "pausedSaved" : "saveFailed")));
      const resume = create("button", "primary", this.t("continue"));
      resume.addEventListener("click", () => { modal.remove(); this.userPaused = false; this.game?.setActive?.(!document.hidden); });
      const home = create("button", "secondary", this.t("saveHome"));
      home.addEventListener("click", () => this.showHome());
      const actions = create("div", "sheet-footer");
      actions.append(home, resume); sheet.append(actions); modal.append(sheet); this.root.append(modal);
    }

    openGame(mode) {
      this.clear();
      const screen = create("main", "screen game-picker");
      screen.append(this.header(this.t(mode)), create("h2", null, this.t("choose")));
      const levels = create("div", "level-grid difficulty-grid");
      let mixedColors = false;
      DIFFICULTIES.forEach((difficulty) => {
        const button = create("button", "mode-button", this.t(difficulty));
        button.type = "button";
        button.dataset.difficulty = difficulty;
        button.addEventListener("click", () => this.launchGame(mode, difficulty, null, { mixedColors: ["hard", "veryHard"].includes(difficulty) && mixedColors }));
        levels.append(button);
      });
      screen.append(levels);
      if (mode === "sand") {
        const row = create("label", "mixed-setting", this.t("mixedColors"));
        const toggle = create("input", "switch");
        toggle.type = "checkbox";
        toggle.setAttribute("aria-label", this.t("mixedColors"));
        toggle.addEventListener("change", () => { mixedColors = toggle.checked; });
        row.append(toggle, create("span", "hint", `${this.t("hard")} / ${this.t("veryHard")}`)); screen.append(row);
      }
      const saves = this.sessions.list(mode);
      if (saves.length) {
        screen.append(create("h2", "saved-heading", this.t("unfinished")));
        const list = create("div", "saved-list");
        saves.forEach((session) => {
          const row = create("div", "saved-row");
          const resume = create("button", "saved-resume");
          resume.type = "button";
          const date = new Date(session.updatedAt).toLocaleString(storage.value.language, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
          resume.append(create("strong", null, this.t("continue")), create("span", "difficulty-tag", this.t(session.difficulty)), create("small", null, date));
          resume.addEventListener("click", () => this.launchGame(mode, session.difficulty, session));
          const remove = this.iconButton(this.t("delete"), "×", () => this.confirmDelete(session));
          row.append(resume, remove); list.append(row);
        });
        screen.append(list);
      }
      this.root.append(screen);
    }

    confirmDelete(session) {
      const modal = create("div", "modal");
      const sheet = create("section", "sheet");
      sheet.append(create("h2", null, this.t("deleteSave")));
      const cancel = create("button", "secondary", this.t("cancel"));
      const confirm = create("button", "primary danger-action", this.t("delete"));
      cancel.addEventListener("click", () => modal.remove());
      confirm.addEventListener("click", () => { if (this.sessions.remove(session.id)) this.openGame(session.mode); else { modal.remove(); this.toast(this.t("saveFailed")); } });
      const actions = create("div", "sheet-footer"); actions.append(cancel, confirm); sheet.append(actions); modal.append(sheet); this.root.append(modal);
    }

    launchGame(mode, difficulty, saved = null, options = {}) {
      this.clear();
      this.currentSession = saved ? JSON.parse(JSON.stringify(saved)) : { id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`, mode, difficulty, options, createdAt: Date.now() };
      const state = this.currentSession.state || null;
      const constructors = { block: BlockGame, tetris: TetrisGame, sand: SandGame, sudoku: SudokuGame, merge: MergeGame, mines: MinesGame };
      this.game = new constructors[mode](this, difficulty, state, this.currentSession.options || {});
      const toolbar = create("div", "session-toolbar");
      toolbar.append(create("span", "difficulty-tag", this.t(difficulty)), this.iconButton(this.t("pause"), "⏸", () => this.pauseGame()));
      const header = this.root.querySelector(".game-header");
      header.after(toolbar);
      if (!this.saveSession()) this.toast(this.t("saveFailed"));
    }

    sound(frequency = 320, duration = 0.06) {
      if (!storage.value.sound) return;
      if (!window.AudioContext && !window.webkitAudioContext) return;
      this.audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioContext.state === "suspended") this.audioContext.resume().catch(() => {});
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.025;
      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);
      oscillator.stop(this.audioContext.currentTime + duration);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }

    bindPress(button, handler, repeat = false) {
      let pointer = null; let timer = null; let suppressUntil = 0;
      const events = new AbortController();
      const cancel = () => {
        clearTimeout(timer); timer = null;
        if (pointer !== null && button.hasPointerCapture(pointer)) button.releasePointerCapture(pointer);
        pointer = null; button.classList.remove("pressed");
      };
      button.addEventListener("pointerdown", (event) => {
        if (event.isPrimary === false || event.button !== 0 || pointer !== null || this.isGameBlocked()) return;
        event.preventDefault(); pointer = event.pointerId; suppressUntil = performance.now() + 700;
        button.setPointerCapture(pointer); button.classList.add("pressed"); handler();
        if (repeat) {
          const step = () => {
            if (pointer === null || this.isGameBlocked()) { cancel(); return; }
            handler(); timer = setTimeout(step, 80);
          };
          timer = setTimeout(step, 280);
        }
      }, { signal: events.signal });
      for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) button.addEventListener(name, (event) => { if (event.pointerId === pointer) { suppressUntil = performance.now() + 700; cancel(); } }, { signal: events.signal });
      button.addEventListener("click", (event) => { if (event.detail > 0 && performance.now() < suppressUntil) return; if (!this.isGameBlocked()) handler(); }, { signal: events.signal });
      window.addEventListener("blur", cancel, { signal: events.signal });
      const control = { cancel, destroy: () => { cancel(); events.abort(); } };
      this.pressControls.add(control);
      return button;
    }

    iconButton(label, symbol, handler, press = null) {
      const button = create("button", "icon-button", symbol);
      button.type = "button";
      button.title = label;
      button.setAttribute("aria-label", label);
      if (press) this.bindPress(button, handler, press.repeat);
      else button.addEventListener("click", handler);
      return button;
    }

    bindBoardGesture(board, game, units, getX, setX) {
      let gesture = null;
      const events = new AbortController();
      const cancel = () => {
        const id = gesture?.id; gesture = null;
        if (id !== undefined && board.hasPointerCapture(id)) board.releasePointerCapture(id);
      };
      board.addEventListener("pointerdown", (event) => {
        if (gesture || event.isPrimary === false || event.button !== 0 || game.over || this.isGameBlocked()) return;
        gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, start: getX(), piece: game.current };
        board.setPointerCapture(event.pointerId);
      }, { signal: events.signal });
      board.addEventListener("pointermove", (event) => {
        if (!gesture || event.pointerId !== gesture.id) return;
        if (game.current !== gesture.piece || this.isGameBlocked()) { cancel(); return; }
        const dx = event.clientX - gesture.x;
        setX(Math.round(gesture.start + dx * units / board.getBoundingClientRect().width));
      }, { signal: events.signal });
      board.addEventListener("pointerup", (event) => {
        if (!gesture || event.pointerId !== gesture.id) return;
        const { x, y, piece } = gesture; cancel();
        if (game.current !== piece || this.isGameBlocked()) return;
        const dx = event.clientX - x; const dy = event.clientY - y;
        if (dy > 45 && dy > Math.abs(dx)) game.hardDrop();
        else if (Math.hypot(dx, dy) < 8) game.rotate();
      }, { signal: events.signal });
      for (const name of ["pointercancel", "lostpointercapture"]) board.addEventListener(name, (event) => { if (event.pointerId === gesture?.id) cancel(); }, { signal: events.signal });
      const control = { cancel, destroy: () => { cancel(); events.abort(); } };
      this.pressControls.add(control);
      return cancel;
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
      const mark = create("img", "brand-logo");
      mark.alt = "";
      mark.src = "./Assets/BlockableDesktopIcon.png";
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
        ["block", "▦", () => this.openGame("block")],
        ["tetris", "▤", () => this.openGame("tetris")],
        ["sand", "⏳", () => this.openGame("sand")],
        ["sudoku", "#", () => this.openGame("sudoku")],
        ["merge", "＋", () => this.openGame("merge")],
        ["mines", "⚑", () => this.openGame("mines")],
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
      const update = create("button", "choice update-check", this.t("checkUpdates"));
      update.addEventListener("click", () => this.checkForUpdates());
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

    async checkForUpdates() {
      await this.updater.check();
    }

    renderUpdate(state) {
      const pending = ["checking", "updating"].includes(state.status);
      this.root.querySelectorAll(".update-check").forEach((button) => { button.disabled = pending; button.textContent = this.t(pending ? "checkingUpdate" : "checkUpdates"); });
      if (state.status === "current") { this.root.querySelector(".update-modal")?.remove(); this.toast(this.t("current")); return; }
      if (state.status === "idle") return;
      let modal = this.root.querySelector(".update-modal");
      if (!modal) {
        this.stopInputs();
        modal = create("div", "modal update-modal");
        modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); modal.setAttribute("aria-label", this.t("updates"));
        modal.append(create("section", "sheet")); this.root.append(modal);
      }
      const sheet = modal.firstElementChild; sheet.replaceChildren(create("h2", null, this.t("updates")));
      const messages = { checking: "checkingUpdate", updating: "installingUpdate", available: "updateReady", native: "nativeUpdate", error: "updateFailed", saveError: "saveFailed" };
      const message = create("p", "update-status", this.t(messages[state.status]).replace("{version}", state.version || ""));
      message.setAttribute("role", "status"); message.setAttribute("aria-live", "polite"); sheet.append(message);
      const actions = create("div", "sheet-footer");
      if (!pending) {
        const later = create("button", "secondary", this.t("later")); later.addEventListener("click", () => modal.remove()); actions.append(later);
        const action = create("button", "primary", this.t(state.status === "available" || state.status === "saveError" ? "updateNow" : state.status === "native" ? "openRelease" : "retryUpdate"));
        action.addEventListener("click", () => {
          if (state.status === "native") window.open("https://github.com/AdSaver-Labs/Blockable/releases/latest", "_blank", "noopener");
          else if (state.status === "available" || state.status === "saveError") this.updater.apply();
          else this.updater.check();
        }); actions.append(action);
      }
      sheet.append(actions);
    }

    openSettings(scrollTop = 0) {
      this.saveSession();
      this.stopInputs();
      const modal = create("div", "modal");
      const sheet = create("section", "sheet");
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-label", this.t("settings"));
      sheet.append(create("h2", null, this.t("settings")));

      const addSetting = (label, control, hint = "") => {
        const row = create("div", "setting");
        const labelNode = create("label", null, label);
        if (control.matches("input")) { control.id ||= `setting-${sheet.children.length}`; labelNode.htmlFor = control.id; }
        row.append(labelNode, create("span", "hint", hint), control);
        sheet.append(row);
      };
      const choices = (values, current, onChange) => {
        const row = create("div", "choice-row");
        values.forEach(([value, label]) => {
          const button = create("button", `choice ${value === current ? "active" : ""}`, label);
          button.type = "button";
          button.addEventListener("click", () => {
            onChange(value);
            const position = sheet.scrollTop;
            modal.remove();
            this.openSettings(position);
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
      const wallpaperChoices = [["paper", "Paper"], ["aurora", "Aurora"], ["kinetic", "Kinetic"], ["blueprint", "Blueprint"], ["comic", "Comic"]];
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
          const position = sheet.scrollTop;
          modal.remove();
          this.openSettings(position);
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

      const check = create("button", "secondary update-check", this.t("checkUpdates"));
      check.addEventListener("click", () => this.checkForUpdates());
      addSetting(this.t("updates"), check, `v${VERSION}`);

      const footer = create("div", "sheet-footer");
      const reset = create("button", "secondary danger-action", this.t("resetSettings"));
      reset.addEventListener("click", () => this.openResetConfirmation(modal));
      const done = create("button", "primary", this.t("done"));
      done.addEventListener("click", () => modal.remove());
      footer.append(reset, done);
      sheet.append(footer);
      modal.append(sheet);
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.remove();
      });
      this.root.append(modal);
      sheet.scrollTop = scrollTop;
    }

    saveCustomWallpaper(file, modal) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const image = new Image();
        image.addEventListener("load", () => {
          const maximum = 1280;
          const scale = Math.min(1, maximum / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          const previousWallpaper = storage.value.customWallpaper;
          storage.value.customWallpaper = canvas.toDataURL("image/jpeg", 0.78);
          storage.value.wallpaper = "custom";
          if (!storage.save()) {
            storage.value.customWallpaper = previousWallpaper;
            storage.value.wallpaper = previousWallpaper ? "custom" : "paper";
            this.toast(this.t("storageFailed"));
            return;
          }
          this.applySettings();
          const position = modal.firstElementChild.scrollTop;
          modal.remove();
          this.openSettings(position);
        });
        image.src = reader.result;
      });
      reader.readAsDataURL(file);
    }

    openResetConfirmation(settingsModal) {
      const modal = create("div", "modal");
      const sheet = create("section", "sheet");
      sheet.append(create("h2", null, this.t("resetSettings")), create("p", null, this.t("resetConfirm")));
      const actions = create("div", "sheet-footer");
      const cancel = create("button", "secondary", this.t("cancel"));
      const confirm = create("button", "primary danger-action", this.t("confirm"));
      cancel.addEventListener("click", () => modal.remove());
      confirm.addEventListener("click", () => { storage.value = { ...storage.defaults }; storage.save(); this.applySettings(); modal.remove(); settingsModal.remove(); this.openSettings(); });
      actions.append(cancel, confirm); sheet.append(actions); modal.append(sheet); this.root.append(modal);
    }


    award(mode, amount, daily = false) {
      storage.value.xp += amount;
      storage.value.modeBest[mode] = Math.max(storage.value.modeBest[mode] || 0, amount);
      if (daily) {
        const today = localDateKey();
        if (storage.value.dailyDate !== today) {
          storage.value.dailyDate = today;
          storage.value.dailyDone = true;
          storage.value.streak += 1;
        }
      }
      storage.save();
    }

  }

  class BlockGame {
    constructor(app, difficulty = "medium", state = null) {
      this.app = app;
      this.difficulty = difficulty;
      this.grid = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
      this.cells = [];
      this.pieces = [];
      this.score = 0;
      this.selected = null;
      this.locked = false;
      this.drag = null;
      this.renderShell();
      if (state) {
        this.grid = state.grid; this.pieces = state.pieces; this.score = state.score;
        if (this.pieces.every((piece) => piece.used)) this.pieces = this.makePieces();
        this.draw();
      } else this.newGame();
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
          cell.addEventListener("pointerenter", (event) => { if (event.pointerType !== "touch" && !this.drag) this.preview(row, column); });
          this.cells[row][column] = cell;
          this.board.append(cell);
        }
      }

      this.tray = create("div", "tray");
      this.slots = Array.from({ length: 3 }, (_, index) => {
        const slot = create("button", "piece-slot");
        slot.type = "button"; slot.dataset.pieceIndex = String(index);
        slot.setAttribute("aria-label", `${this.app.t("block")} ${index + 1}`);
        slot.addEventListener("click", () => { if (performance.now() >= (this.suppressClickUntil || 0)) this.select(index); });
        slot.addEventListener("pointerdown", (event) => this.beginDrag(event, index));
        this.tray.append(slot); return slot;
      });
      this.notice = create("div", "notice");
      const actions = create("div", "game-actions");
      const restart = create("button", "secondary", this.app.t("newGame"));
      restart.addEventListener("click", () => this.app.launchGame("block", this.difficulty));
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
      this.over = false;
      this.notice.textContent = "";
      this.pieces = this.makePieces();
      this.draw();
    }

    makePieces() {
      const config = CONFIG[this.difficulty];
      const shapes = [...SHAPES, [[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 0, 0], [1, 0, 0], [1, 1, 1]]];
      const allowed = shapes.filter((shape) => { const blocks = shape.flat().filter(Boolean).length; return blocks >= config.blockMin && blocks <= config.blockMax; });
      return Array.from({ length: 3 }, () => ({
        shape: randomItem(allowed),
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

      if (this.score > storage.value.best) { storage.value.best = this.score; storage.save(); }
      this.scoreNode.textContent = String(this.score);
      this.bestNode.textContent = String(storage.value.best);

      this.pieces.forEach((piece, index) => {
        const unavailable = piece.used || !this.hasMove(piece);
        const slot = this.slots[index];
        slot.className = `piece-slot${index === this.selected ? " selected" : ""}${unavailable ? " dead" : ""}`;
        if (slot.renderedPiece !== piece || slot.renderedUsed !== piece.used) {
          slot.replaceChildren(); if (!piece.used) slot.append(this.pieceNode(piece));
          slot.renderedPiece = piece; slot.renderedUsed = piece.used;
        }
      });
    }

    select(index) {
      if (this.app.isGameBlocked() || this.over) return;
      if (this.drag?.moved) return;
      const piece = this.pieces[index];
      if (!piece || piece.used || this.locked) return;
      this.selected = index;
      this.slots.forEach((slot, target) => slot.classList.toggle("selected", target === index));
    }

    beginDrag(event, index) {
      if (this.app.isGameBlocked() || this.over) return;
      if (event.isPrimary === false || this.drag) return;
      if (event.button !== undefined && event.button !== 0) return;
      const piece = this.pieces[index];
      if (!piece || piece.used || this.locked) return;
      event.preventDefault();
      this.selected = index;
      this.slots.forEach((slot, target) => slot.classList.toggle("selected", target === index));
      const ghost = this.pieceNode(piece);
      ghost.classList.add("drag-ghost");
      const first = this.cells[0][0].getBoundingClientRect();
      const second = this.cells[0][1].getBoundingClientRect();
      const pitch = second.left - first.left;
      const width = (piece.shape[0].length - 1) * pitch + first.width;
      const height = (piece.shape.length - 1) * pitch + first.height;
      ghost.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, ${first.width}px)`;
      ghost.style.gap = `${pitch - first.width}px`;
      ghost.style.width = `${width}px`; ghost.style.height = `${height}px`;
      document.body.append(ghost);
      event.currentTarget.setPointerCapture(event.pointerId);
      this.drag = {
        index,
        piece,
        ghost,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
        target: null,
        source: event.currentTarget, pitch, width, height,
        lift: event.pointerType === "touch" ? 56 : 0,
        originX: first.left + first.width / 2, originY: first.top + first.height / 2,
      };
      this.moveGhost(event.clientX, event.clientY);
      window.addEventListener("pointermove", this.onDragMove, { passive: false });
      window.addEventListener("pointerup", this.onDragEnd);
      window.addEventListener("pointercancel", this.onDragCancel);
      this.drag.source.addEventListener("lostpointercapture", this.onDragCancel);
    }

    onDragMove = (event) => {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      event.preventDefault();
      if (Math.hypot(event.clientX - this.drag.startX, event.clientY - this.drag.startY) > 5) this.drag.moved = true;
      this.moveGhost(event.clientX, event.clientY);
      const pointX = event.clientX - (this.drag.piece.shape[0].length - 1) * this.drag.pitch / 2;
      const pointY = event.clientY - this.drag.lift - (this.drag.piece.shape.length - 1) * this.drag.pitch / 2;
      this.drag.target = this.cellAtPoint(pointX, pointY);
      if (!this.previewFrame) this.previewFrame = requestAnimationFrame(() => {
        this.previewFrame = null;
        if (!this.drag) return;
        if (this.drag.target) this.preview(this.drag.target.row, this.drag.target.column, this.drag.piece);
        else this.clearPreview();
      });
    };

    onDragEnd = (event) => {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      const { index, target, moved } = this.drag;
      this.suppressClickUntil = performance.now() + 700;
      this.cleanupDrag();
      if (moved && target && this.canPlace(this.pieces[index].shape, target.row, target.column)) {
        this.place(index, target.row, target.column);
      } else if (!moved) {
        this.selected = index;
        this.slots.forEach((slot, targetIndex) => slot.classList.toggle("selected", targetIndex === index));
      }
    };

    onDragCancel = (event) => { if (event.pointerId === this.drag?.pointerId) this.cleanupDrag(); };

    cleanupDrag() {
      const drag = this.drag;
      this.drag = null;
      if (drag) {
        drag.source.removeEventListener("lostpointercapture", this.onDragCancel);
        if (drag.source.hasPointerCapture(drag.pointerId)) drag.source.releasePointerCapture(drag.pointerId);
        drag.ghost.remove();
      }
      cancelAnimationFrame(this.previewFrame); this.previewFrame = null;
      this.clearPreview();
      window.removeEventListener("pointermove", this.onDragMove);
      window.removeEventListener("pointerup", this.onDragEnd);
      window.removeEventListener("pointercancel", this.onDragCancel);
    }

    moveGhost(x, y) {
      if (!this.drag) return;
      this.drag.ghost.style.left = `${x - this.drag.width / 2}px`;
      this.drag.ghost.style.top = `${y - this.drag.lift - this.drag.height / 2}px`;
    }

    cellAtPoint(x, y) {
      const geometry = this.drag;
      if (!geometry) return null;
      const row = Math.round((y - geometry.originY) / geometry.pitch);
      const column = Math.round((x - geometry.originX) / geometry.pitch);
      return row >= 0 && column >= 0 && row < BOARD_SIZE && column < BOARD_SIZE ? { row, column } : null;
    }

  clearPreview() {
      for (const cell of this.previewCells || []) {
        cell.classList.remove("preview-good", "preview-bad");
        cell.style.removeProperty("--preview-color");
      }
      this.previewCells = [];
    }

    preview(row, column, explicitPiece = null) {
      this.clearPreview();
      const piece = explicitPiece || this.pieces[this.selected];
      if (!piece || piece.used) return;
      const valid = this.canPlace(piece.shape, row, column);
      this.forEachBlock(piece.shape, row, column, (targetRow, targetColumn) => {
        const cell = this.cells[targetRow]?.[targetColumn];
        if (!cell) return;
        this.previewCells.push(cell);
        cell.classList.add(valid ? "preview-good" : "preview-bad");
        if (valid) cell.style.setProperty("--preview-color", piece.color);
      });
    }

    placeSelected(row, column) {
      if (this.selected === null) return;
      this.place(this.selected, row, column);
    }

    place(index, row, column) {
      if (this.app.isGameBlocked() || this.over) return;
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
      lines.forEach(({ type, index: lineIndex }) => {
        for (let offset = 0; offset < BOARD_SIZE; offset += 1) {
          this.grid[type === "row" ? lineIndex : offset][type === "row" ? offset : lineIndex] = null;
        }
      });
      this.clearTimer = window.setTimeout(() => {
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
        this.over = true;
        this.notice.textContent = this.app.t("noMoves");
        this.overTimer = window.setTimeout(() => this.showGameOver(), 300);
      }
      this.app.requestSave();
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

    serialize() { return { grid: this.grid, pieces: this.pieces, score: this.score }; }

    destroy() {
      window.clearTimeout(this.clearTimer);
      window.clearTimeout(this.overTimer);
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


  class MergeGame extends ArcadeGridGame {
    constructor(app, difficulty = "medium", state = null) {
      super(app, app.t("merge"), CONFIG[difficulty].mergeSize, "merge-screen");
      this.difficulty = difficulty;
      this.grid = state?.grid || Array.from({ length: this.size }, () => Array(this.size).fill(0));
      this.score = state?.score || 0;
      this.scoreNode = this.stat(app.t("score"), create("strong", null, String(this.score)));
      if (!state) { this.addRandom(); this.addRandom(); }
      this.render();
      [["←", "left"], ["↑", "up"], ["↓", "down"], ["→", "right"]].forEach(([label, direction]) => {
        const button = this.button(label, () => this.move(direction), "arcade-control");
        button.setAttribute("aria-label", direction);
      });
      this.button(app.t("newGame"), () => app.launchGame("merge", difficulty));
      this.boundKeyDown = (event) => {
        const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
        if (map[event.key] && !app.isGameBlocked()) { event.preventDefault(); this.move(map[event.key]); }
      };
      this.board.addEventListener("pointerdown", (event) => {
        if (app.isGameBlocked() || event.isPrimary === false || event.button !== 0 || this.swipeStart) return;
        this.swipeStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
        this.board.setPointerCapture(event.pointerId);
      });
      this.board.addEventListener("pointerup", (event) => {
        if (!this.swipeStart || event.pointerId !== this.swipeStart.id) return;
        const { x: startX, y: startY } = this.swipeStart;
        this.swipeStart = null;
        const dx = event.clientX - startX; const dy = event.clientY - startY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        this.move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
      });
      this.board.addEventListener("pointercancel", (event) => { if (event.pointerId === this.swipeStart?.id) this.cancelGesture(); });
      this.board.addEventListener("lostpointercapture", () => this.cancelGesture());
      window.addEventListener("keydown", this.boundKeyDown);
    }
    addRandom() {
      const empty = [];
      this.grid.forEach((row, r) => row.forEach((value, c) => { if (!value) empty.push([r, c]); }));
      if (empty.length) { const [r, c] = randomItem(empty); this.grid[r][c] = Math.random() < CONFIG[this.difficulty].fourChance ? 4 : 2; }
    }
    render() {
      if (!this.cells) {
        this.cells = Array.from({ length: this.size ** 2 }, () => create("div", "arcade-cell merge-cell"));
        this.board.append(...this.cells);
      }
      this.grid.flat().forEach((value, index) => {
        const cell = this.cells[index];
        cell.className = `arcade-cell merge-cell value-${value || 0}`;
        cell.textContent = value ? String(value) : "";
        cell.style.setProperty("--tile-level", String(Math.log2(value || 1)));
      });
      this.scoreNode.textContent = String(this.score);
    }
    move(direction) {
      if (this.done || this.app.isGameBlocked()) return;
      const before = JSON.stringify(this.grid); const vertical = direction === "up" || direction === "down";
      const reverse = direction === "right" || direction === "down";
      let lines = vertical ? this.grid[0].map((_, c) => this.grid.map((row) => row[c])) : this.grid.map((row) => [...row]);
      if (reverse) lines = lines.map((line) => line.reverse());
      lines = lines.map((line) => {
        const packed = line.filter(Boolean); const merged = [];
        for (let i = 0; i < packed.length; i += 1) {
          if (packed[i] === packed[i + 1]) { merged.push(packed[i] * 2); this.score += packed[i] * 2; i += 1; }
          else merged.push(packed[i]);
        }
        while (merged.length < this.size) merged.push(0);
        return reverse ? merged.reverse() : merged;
      });
      this.grid = vertical ? this.grid.map((_, r) => lines.map((line) => line[r])) : lines;
      if (JSON.stringify(this.grid) === before) return;
      this.addRandom(); this.render(); this.app.sound(280);
      if (this.grid.flat().some((value) => value >= 2048)) this.finish("merge", Math.max(20, this.score));
      else if (!this.grid.some((row, r) => row.some((value, c) => !value || value === this.grid[r + 1]?.[c] || value === row[c + 1]))) {
        this.done = true; this.notice.textContent = this.app.t("gameOver");
      }
      this.app.requestSave();
    }
    serialize() { return { grid: this.grid, score: this.score }; }
    cancelGesture() { const id = this.swipeStart?.id; this.swipeStart = null; if (id !== undefined && this.board.hasPointerCapture(id)) this.board.releasePointerCapture(id); }
    destroy() { this.cancelGesture(); window.removeEventListener("keydown", this.boundKeyDown); }
  }

  class MinesGame extends ArcadeGridGame {
    constructor(app, difficulty = "medium", state = null) {
      super(app, app.t("mines"), CONFIG[difficulty].mineSize, "mines-screen");
      this.difficulty = difficulty; this.mineCount = CONFIG[difficulty].mines;
      this.action = state?.action || "reveal";
      this.mines = new Set(state?.mines || []);
      if (!state) while (this.mines.size < this.mineCount) this.mines.add(Math.floor(Math.random() * this.size ** 2));
      this.revealed = new Set(state?.revealed || []); this.flags = new Set(state?.flags || []);
      this.started = state?.started || false; this.elapsed = state?.elapsed || 0;
      this.timeNode = this.stat(app.t("currentTime"), create("strong", null, String(this.elapsed)));
      this.flagNode = this.stat(app.t("flag"), create("strong", null, "0"));
      this.render();
      this.button(app.t("newGame"), () => app.launchGame("mines", difficulty));
      this.modeButton = this.button(app.t(this.action === "reveal" ? "flag" : "reveal"), () => this.toggleAction());
      this.modeButton.classList.toggle("active", this.action === "flag");
      this.timer = window.setInterval(() => { if (this.started && !this.done && !app.isGameBlocked()) { this.elapsed += 1; this.timeNode.textContent = String(this.elapsed); } }, 1000);
    }
    toggleAction() { if (this.app.isGameBlocked()) return; this.action = this.action === "reveal" ? "flag" : "reveal"; this.modeButton.textContent = this.app.t(this.action === "reveal" ? "flag" : "reveal"); this.modeButton.classList.toggle("active", this.action === "flag"); this.app.requestSave(); }
    toggleFlag(index) { if (this.done || this.app.isGameBlocked() || this.revealed.has(index)) return; this.flags.has(index) ? this.flags.delete(index) : this.flags.add(index); this.render(); this.app.requestSave(); }
    neighbors(index) {
      const r = Math.floor(index / this.size); const c = index % this.size; const out = [];
      for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) if (dr || dc) {
        const rr = r + dr; const cc = c + dc;
        if (rr >= 0 && rr < this.size && cc >= 0 && cc < this.size) out.push(rr * this.size + cc);
      }
      return out;
    }
    count(index) { return this.neighbors(index).filter((neighbor) => this.mines.has(neighbor)).length; }
    render() {
      if (!this.cells) {
        this.cells = Array.from({ length: this.size ** 2 }, (_, index) => {
          const cell = create("button", "arcade-cell mine-cell");
          cell.type = "button";
          cell.setAttribute("aria-label", `${Math.floor(index / this.size) + 1}, ${index % this.size + 1}`);
          cell.addEventListener("click", () => this.action === "flag" ? this.toggleFlag(index) : this.reveal(index));
          cell.addEventListener("contextmenu", (event) => { event.preventDefault(); this.toggleFlag(index); });
          return cell;
        });
        this.board.append(...this.cells);
      }
      for (let index = 0; index < this.size ** 2; index += 1) {
        const revealed = this.revealed.has(index);
        const cell = this.cells[index];
        cell.className = `arcade-cell mine-cell${revealed ? " revealed" : ""}${this.flags.has(index) ? " flagged" : ""}`;
        cell.textContent = this.flags.has(index) ? "⚑" : revealed && this.mines.has(index) ? "💣" : revealed ? String(this.count(index) || "") : "";
      }
      this.flagNode.textContent = `${this.flags.size} / ${this.mineCount}`;
    }
    reveal(index) {
      if (this.done || this.app.isGameBlocked() || this.flags.has(index) || this.revealed.has(index)) return;
      if (!this.started) {
        const safe = new Set([index, ...this.neighbors(index)]);
        for (const mine of safe) this.mines.delete(mine);
        while (this.mines.size < this.mineCount) { const candidate = Math.floor(Math.random() * this.size ** 2); if (!safe.has(candidate)) this.mines.add(candidate); }
        this.started = true;
      }
      if (this.mines.has(index)) {
        this.revealed = new Set([...this.revealed, ...this.mines]); this.done = true;
        this.render(); this.notice.textContent = this.app.t("gameOver"); this.app.saveSession(); return;
      }
      const queue = [index];
      for (let cursor = 0; cursor < queue.length; cursor += 1) {
        const current = queue[cursor];
        if (this.revealed.has(current) || this.flags.has(current)) continue;
        this.revealed.add(current);
        if (!this.count(current)) queue.push(...this.neighbors(current).filter((neighbor) => !this.mines.has(neighbor)));
      }
      this.render();
      if (this.revealed.size >= this.size ** 2 - this.mineCount) this.finish("mines", 60);
      this.app.requestSave();
    }
    serialize() { return { mines: [...this.mines], revealed: [...this.revealed], flags: [...this.flags], started: this.started, elapsed: this.elapsed, action: this.action }; }
    destroy() { window.clearInterval(this.timer); }
  }


  class TetrisGame {
    constructor(app, difficulty = "medium", state = null) {
      this.app = app;
      this.difficulty = difficulty;
      this.rows = 20;
      this.columns = 10;
      this.dropInterval = CONFIG[difficulty].tetrisSpeed;
      this.lastTick = performance.now();
      this.elapsed = 0;
      this.animationFrame = null;
      this.backgrounded = document.hidden;
      this.paused = false;
      this.over = false;
      this.resetState();
      if (state) {
        this.grid = state.grid; this.score = state.score; this.lines = state.lines;
        this.current = state.current; this.next = state.next; this.elapsed = state.elapsed || 0;
        this.dropInterval = Math.max(100, CONFIG[difficulty].tetrisSpeed - Math.floor(this.lines / 10) * 55);
      }
      this.renderShell();
      this.boundKeyDown = (event) => this.keyDown(event);
      window.addEventListener("keydown", this.boundKeyDown);
      this.animationFrame = window.requestAnimationFrame((time) => this.tick(time));
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
      const screen = create("main", "screen tetris-screen");
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
        ["←", "moveLeft", () => this.move(-1), true], ["↻", "rotate", () => this.rotate(), false], ["→", "moveRight", () => this.move(1), true],
        ["↓", "softDrop", () => this.softDrop(), true], ["⏸", "pause", () => this.app.pauseGame(), null], ["⤓", "hardDrop", () => this.hardDrop(), false],
        ["↺", "newGame", () => this.app.launchGame("tetris", this.difficulty), null],
      ];
      definitions.forEach(([symbol, label, handler, repeat]) => {
        const button = create("button", null, symbol);
        button.type = "button";
        button.setAttribute("aria-label", this.app.t(label));
        if (repeat === null) button.addEventListener("click", handler);
        else this.app.bindPress(button, handler, repeat);
        controls.append(button);
      });
      screen.append(stats, layout, controls);
      this.app.root.append(screen);
      this.cancelGesture = this.app.bindBoardGesture(this.board, this, this.columns, () => this.current.column, (target) => {
        target = Math.max(0, Math.min(this.columns - this.current.shape[0].length, target));
        const direction = Math.sign(target - this.current.column);
        while (direction && this.current.column !== target && this.valid(this.current, 0, direction)) this.current.column += direction;
        this.draw();
      });
      this.draw();
    }

    stat(label, value) {
      const node = create("div", "stat");
      node.append(create("span", null, label), value);
      return node;
    }

    tick(now) {
      this.animationFrame = null;
      const delta = Math.min(Math.max(0, now - this.lastTick), 250);
      this.lastTick = now;
      if (!this.paused && !this.over && !this.backgrounded && !this.app.isGameBlocked()) {
        this.elapsed += delta;
        if (this.elapsed >= this.dropInterval) {
          this.elapsed %= this.dropInterval;
          this.stepDown();
        }
      }
      if (!this.backgrounded && !this.over) this.animationFrame = window.requestAnimationFrame((time) => this.tick(time));
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
        const y = row - this.current.row; const x = column - this.current.column;
        const active = Boolean(this.current.shape[y]?.[x]);
        const displayed = active ? this.current.color : color || "";
        const className = `tet-cell${displayed ? " filled" : ""}${active ? " active" : ""}`;
        if (cell.className !== className) cell.className = className;
        if (cell.renderedColor !== displayed) {
          cell.style.setProperty("--cell-color", displayed); cell.renderedColor = displayed;
        }
      });
      this.board.dataset.activeRow = String(this.current.row);
      this.scoreNode.textContent = String(this.score);
      this.linesNode.textContent = String(this.lines);
      this.levelNode.textContent = String(Math.floor(this.lines / 10) + 1);
      this.stateNode.textContent = this.over ? this.app.t("gameOver") : this.paused ? this.app.t("paused") : this.app.t("running");
      this.drawNext();
    }

    drawNext() {
      if (this.renderedNext === this.next) return;
      this.renderedNext = this.next;
      this.nextNode.replaceChildren();
      const preview = create("div", "mini-tetromino");
      preview.style.gridTemplateColumns = `repeat(${this.next.shape[0].length}, 11px)`;
      preview.style.setProperty("--piece-color", this.next.color);
      this.next.shape.flat().forEach((filled) => preview.append(create("b", filled ? "" : "empty")));
      this.nextNode.append(preview);
    }

    move(direction) {
      if (this.paused || this.over || this.app.isGameBlocked()) return;
      if (this.valid(this.current, 0, direction)) this.current.column += direction;
      this.draw();
    }

    rotate() {
      if (this.paused || this.over || this.app.isGameBlocked()) return;
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
      if (this.paused || this.over || this.app.isGameBlocked()) return;
      this.score += 1;
      this.stepDown();
      this.elapsed = 0;
    }

    hardDrop() {
      if (this.paused || this.over || this.app.isGameBlocked()) return;
      let distance = 0;
      while (this.valid(this.current, 1, 0)) { this.current.row += 1; distance += 1; }
      this.score += distance * 2;
      this.lockPiece();
      this.draw();
    }

    lockPiece() {
      this.cancelGesture?.();
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
        this.dropInterval = Math.max(100, CONFIG[this.difficulty].tetrisSpeed - Math.floor(this.lines / 10) * 55);
        this.app.sound(520, 0.1);
      } else {
        this.score += 10;
      }
      this.current = this.next;
      this.next = this.randomPiece();
      if (!this.valid(this.current)) {
        this.over = true;
        this.stateNode.textContent = this.app.t("gameOver");
        this.overTimer = window.setTimeout(() => this.showGameOver(), 180);
      }
      this.app.requestSave();
    }

    togglePause() {
      this.app.pauseGame();
    }

    keyDown(event) {
      if (this.app.isGameBlocked()) return;
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
        this.app.launchGame("tetris", this.difficulty);
      });
      sheet.append(again);
      modal.append(sheet);
      this.app.root.append(modal);
    }

    setActive(active) {
      this.backgrounded = !active;
      this.lastTick = performance.now();
      if (!active) { cancelAnimationFrame(this.animationFrame); this.animationFrame = null; }
      else if (this.animationFrame === null && !this.over) this.animationFrame = requestAnimationFrame((time) => this.tick(time));
    }

    serialize() { return { grid: this.grid, current: this.current, next: this.next, score: this.score, lines: this.lines, elapsed: this.elapsed }; }

    destroy() {
      window.cancelAnimationFrame(this.animationFrame);
      window.clearTimeout(this.overTimer);
      window.removeEventListener("keydown", this.boundKeyDown);
    }
  }

  class SandGame {
    constructor(app, difficulty = "medium", state = null, options = {}) {
      this.app = app;
      this.difficulty = difficulty;
      this.mixedColors = ["hard", "veryHard"].includes(difficulty) && Boolean(options.mixedColors);
      this.blockSize = 8;
      this.simulation = new SandBoard(80, 144, state?.cells);
      this.score = state?.score || 0;
      this.clears = state?.clears || 0;
      this.current = state?.current || this.randomPiece();
      this.next = state?.next || this.randomPiece();
      this.backgrounded = document.hidden;
      this.over = false;
      this.lastFrame = performance.now();
      this.accumulator = 0;
      this.clearClock = 0;
      this.flash = 0;
      this.renderShell();
      this.boundKeyDown = (event) => {
        if (this.app.isGameBlocked()) return;
        const actions = { ArrowLeft: () => this.move(-1), ArrowRight: () => this.move(1), ArrowUp: () => this.rotate(), ArrowDown: () => this.softDrop(), " ": () => this.hardDrop(), p: () => app.pauseGame(), P: () => app.pauseGame() };
        if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
      };
      window.addEventListener("keydown", this.boundKeyDown);
      this.frame = requestAnimationFrame((time) => this.tick(time));
    }

    randomPiece() {
      const shape = randomItem(TETROMINOES).map((row) => [...row]);
      const color = 1 + Math.floor(Math.random() * CONFIG[this.difficulty].sandColors);
      const colors = shape.map((row) => row.map((filled) => filled ? (this.mixedColors ? 1 + Math.floor(Math.random() * CONFIG[this.difficulty].sandColors) : color) : 0));
      return { shape, colors, x: Math.floor((80 - shape[0].length * this.blockSize) / 2), y: 0 };
    }

    renderShell() {
      const screen = create("main", "screen sand-screen");
      screen.append(this.app.header(this.app.t("sand")));
      const stats = create("div", "score-strip");
      this.scoreNode = create("strong", null, String(this.score));
      this.clearsNode = create("strong", null, String(this.clears));
      for (const [label, node] of [["score", this.scoreNode], ["lines", this.clearsNode]]) {
        const stat = create("div", "stat"); stat.append(create("span", null, this.app.t(label)), node); stats.append(stat);
      }
      const layout = create("div", "sand-layout");
      const frame = create("div", "sand-board");
      this.canvas = create("canvas", "sand-canvas");
      this.canvas.width = 80; this.canvas.height = 144;
      this.canvas.setAttribute("aria-label", this.app.t("sand"));
      this.canvas.setAttribute("role", "img");
      this.context = this.canvas.getContext("2d", { alpha: true });
      this.pixels = this.context.createImageData(80, 144);
      this.palette = COLORS.map((color) => [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16)));
      frame.append(this.canvas);
      const side = create("aside", "tetris-side");
      this.nextNode = create("div", "next-preview");
      side.append(create("span", "side-label", this.app.t("next")), this.nextNode);
      this.stateNode = create("div", "pause-state", this.app.t("running")); side.append(this.stateNode);
      layout.append(frame, side);
      const controls = create("div", "tetris-controls sand-controls");
      for (const [symbol, label, action, repeat] of [
        ["←", "moveLeft", () => this.move(-1), true], ["↻", "rotate", () => this.rotate(), false], ["→", "moveRight", () => this.move(1), true],
        ["↓", "softDrop", () => this.softDrop(), true], ["⤓", "hardDrop", () => this.hardDrop(), false], ["↺", "newGame", () => this.app.launchGame("sand", this.difficulty, null, { mixedColors: this.mixedColors }), null],
      ]) controls.append(this.app.iconButton(this.app.t(label), symbol, action, repeat === null ? null : { repeat }));
      this.cancelGesture = this.app.bindBoardGesture(this.canvas, this, 80, () => this.current.x, (target) => {
        target = Math.max(0, Math.min(80 - this.current.shape[0].length * this.blockSize, target));
        const direction = Math.sign(target - this.current.x);
        while (direction && this.current.x !== target && this.simulation.fits(this.current.shape, this.current.x + direction, this.current.y, this.blockSize)) this.current.x += direction;
        this.draw();
      });
      screen.append(stats, layout, controls); this.app.root.append(screen);
      this.draw();
    }

    tick(time) {
      this.frame = null;
      const delta = Math.min(50, Math.max(0, time - this.lastFrame));
      this.lastFrame = time;
      if (!this.over && !this.backgrounded && !this.app.isGameBlocked()) {
        this.accumulator += delta;
        let stepped = false;
        while (this.accumulator >= 1000 / 60) {
          stepped = true;
          this.accumulator -= 1000 / 60;
          this.simulation.step(); this.simulation.step();
          this.clearClock += 1;
          if (this.clearClock % 6 === 0) {
            const cleared = this.simulation.clearConnections();
            if (cleared.groups) {
              this.score += cleared.pixels * 2; this.clears += cleared.groups;
              this.flash = 160; this.app.sound(560, 0.08);
            }
          }
          this.advance((CONFIG[this.difficulty].sandSpeed + Math.min(30, this.clears * 1.5)) / 60);
          if (this.over) break;
        }
        this.flash = Math.max(0, this.flash - delta);
        if (stepped) this.draw();
      }
      if (!this.backgrounded && !this.over) this.frame = requestAnimationFrame((nextTime) => this.tick(nextTime));
    }

    advance(distance) {
      const target = this.current.y + distance;
      while (this.current.y < target) {
        const nextY = Math.min(target, this.current.y + 1);
        if (!this.simulation.fits(this.current.shape, this.current.x, nextY, this.blockSize)) { this.lockPiece(); return; }
        this.current.y = nextY;
      }
    }

    lockPiece() {
      this.cancelGesture?.();
      this.simulation.deposit(this.current.shape, this.current.colors, this.current.x, this.current.y, this.blockSize);
      this.score += 10;
      this.current = this.next; this.next = this.randomPiece();
      if (!this.simulation.fits(this.current.shape, this.current.x, this.current.y, this.blockSize)) {
        this.over = true;
        this.stateNode.textContent = this.app.t("gameOver");
      }
      this.app.requestSave();
    }

    move(direction) {
      if (this.over || this.app.isGameBlocked()) return;
      for (let pixel = 0; pixel < 4; pixel += 1) {
        if (this.simulation.fits(this.current.shape, this.current.x + direction, this.current.y, this.blockSize)) this.current.x += direction;
      }
      this.draw();
    }

    rotate() {
      if (this.over || this.app.isGameBlocked()) return;
      const rotateMatrix = (matrix) => matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
      const shape = rotateMatrix(this.current.shape); const colors = rotateMatrix(this.current.colors);
      for (const offset of [0, -4, 4, -8, 8]) if (this.simulation.fits(shape, this.current.x + offset, this.current.y, this.blockSize)) {
        this.current.shape = shape; this.current.colors = colors; this.current.x += offset; break;
      }
      this.draw();
    }

    softDrop() { if (!this.over && !this.app.isGameBlocked()) { this.advance(5); this.draw(); } }
    hardDrop() {
      if (this.over || this.app.isGameBlocked()) return;
      while (this.simulation.fits(this.current.shape, this.current.x, this.current.y + 1, this.blockSize)) this.current.y += 1;
      this.lockPiece(); this.draw();
    }

    draw() {
      const { data } = this.pixels;
      let grains = 0;
      for (let index = 0; index < this.simulation.cells.length; index += 1) {
        const color = this.simulation.cells[index]; const offset = index * 4;
        if (!color) { data[offset + 3] = 0; continue; }
        grains += 1;
        const shade = ((index * 37 + Math.floor(index / 80) * 11) % 7 - 3) * 3;
        const rgb = this.palette[color - 1];
        data[offset] = Math.max(0, Math.min(255, rgb[0] + shade));
        data[offset + 1] = Math.max(0, Math.min(255, rgb[1] + shade));
        data[offset + 2] = Math.max(0, Math.min(255, rgb[2] + shade)); data[offset + 3] = 255;
      }
      this.context.putImageData(this.pixels, 0, 0);
      this.current.shape.forEach((row, y) => row.forEach((filled, x) => {
        if (!filled) return;
        const color = COLORS[this.current.colors[y][x] - 1];
        const px = this.current.x + x * this.blockSize; const py = Math.floor(this.current.y) + y * this.blockSize;
        this.context.fillStyle = color;
        this.context.fillRect(px, py, this.blockSize, this.blockSize);
        if (storage.value.gameStyle === "glossy") {
          this.context.fillStyle = "rgba(255,255,255,0.4)"; this.context.fillRect(px + 1, py, this.blockSize - 2, 2);
          this.context.fillStyle = "rgba(0,0,0,0.16)"; this.context.fillRect(px, py + this.blockSize - 1, this.blockSize, 1);
        }
      }));
      if (this.flash > 0) { this.context.fillStyle = `rgba(255,255,255,${this.flash / 160 * 0.18})`; this.context.fillRect(0, 0, 80, 144); }
      if (this.canvas.dataset.grains !== String(grains)) this.canvas.dataset.grains = String(grains);
      if (this.canvas.dataset.activeRow !== String(Math.floor(this.current.y))) this.canvas.dataset.activeRow = String(Math.floor(this.current.y));
      if (this.scoreNode.textContent !== String(this.score)) this.scoreNode.textContent = String(this.score);
      if (this.clearsNode.textContent !== String(this.clears)) this.clearsNode.textContent = String(this.clears);
      if (this.renderedNext !== this.next) {
        this.renderedNext = this.next;
        const preview = create("div", "mini-tetromino");
        preview.style.gridTemplateColumns = `repeat(${this.next.shape[0].length}, 11px)`;
        this.next.shape.forEach((row, y) => row.forEach((filled, x) => {
          const cell = create("b", filled ? "" : "empty");
          cell.style.background = COLORS[this.next.colors[y][x] - 1] || "transparent"; preview.append(cell);
        }));
        this.nextNode.replaceChildren(preview);
      }
    }

    setActive(active) {
      this.backgrounded = !active; this.lastFrame = performance.now();
      if (!active) { this.cancelGesture?.(); cancelAnimationFrame(this.frame); this.frame = null; }
      else if (this.frame === null && !this.over) this.frame = requestAnimationFrame((time) => this.tick(time));
    }
    serialize() { return { cells: this.simulation.serialize(), current: this.current, next: this.next, score: this.score, clears: this.clears }; }
    destroy() { cancelAnimationFrame(this.frame); window.removeEventListener("keydown", this.boundKeyDown); }
  }

  class SudokuGame {
    constructor(app, level, state = null) {
      this.app = app;
      this.level = level;
      const puzzle = state ? null : window.SudokuGen.getSudoku(level === "veryHard" ? "expert" : level);
      this.solution = state?.solution || [...puzzle.solution].map(Number);
      this.board = state?.board || [...puzzle.puzzle].map((cell) => cell === "-" ? 0 : Number(cell));
      this.given = new Set(state?.given || this.board.flatMap((value, index) => value ? [index] : []));
      this.selected = state?.selected ?? null;
      this.notes = state ? state.notes.map((notes) => new Set(notes)) : Array.from({ length: 81 }, () => new Set());
      this.wrong = new Set(state?.wrong || []); this.noteMode = state?.noteMode || false; this.mistakes = state?.mistakes || 0; this.elapsed = state?.elapsed || 0;
      this.renderShell();
      this.backgrounded = document.hidden;
      this.timer = window.setInterval(() => { if (!this.complete && !this.backgrounded && !this.app.isGameBlocked()) { this.elapsed += 1; this.timeNode.textContent = this.formatTime(this.elapsed); } }, 1000);
    }

    renderShell() {
      const screen = create("main", "screen sudoku-screen");
      screen.append(this.app.header(this.app.t("sudoku")));
      const stats = create("div", "score-strip");
      this.timeNode = create("strong", null, this.formatTime(this.elapsed));
      this.bestNode = create("strong", null, this.formatTime(storage.value.sudokuBest[this.level] || 0));
      this.mistakeNode = create("strong", null, String(this.mistakes));
      stats.append(this.stat(this.app.t("currentTime"), this.timeNode), this.stat(this.app.t("bestTime"), this.bestNode), this.stat(this.app.t("mistakes"), this.mistakeNode));
      this.boardNode = create("div", "sudoku-board");
      const pad = create("div", "number-pad");
      for (let number = 1; number <= 9; number += 1) {
        const button = create("button", null, String(number));
        button.addEventListener("click", () => this.setNumber(number));
        pad.append(button);
      }
      const actions = create("div", "sudoku-actions");
      this.notesButton = create("button", "secondary", this.app.t("notes"));
      const erase = create("button", "secondary", this.app.t("erase"));
      const check = create("button", "primary", this.app.t("check"));
      this.notesButton.classList.toggle("active", this.noteMode);
      this.notesButton.addEventListener("click", () => { if (this.app.isGameBlocked()) return; this.noteMode = !this.noteMode; this.notesButton.classList.toggle("active", this.noteMode); this.app.requestSave(); });
      erase.addEventListener("click", () => this.setNumber(0)); check.addEventListener("click", () => this.check());
      actions.append(this.notesButton, erase, check);
      screen.append(stats, this.boardNode, pad, actions);
      this.app.root.append(screen);
      this.draw();
    }

    stat(label, value) {
      const node = create("div", "stat");
      node.append(create("span", null, label), value);
      return node;
    }

    formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }

    draw() {
      if (!this.cells) {
        this.cells = Array.from({ length: 81 }, (_, index) => {
          const button = create("button", "sudoku-cell"); button.type = "button";
          button.addEventListener("click", () => { if (!this.app.isGameBlocked()) { this.selected = index; this.draw(); } });
          return button;
        });
        this.boardNode.append(...this.cells);
      }
      this.board.forEach((value, index) => {
        const selectedRow = this.selected !== null && Math.floor(this.selected / 9) === Math.floor(index / 9);
        const selectedColumn = this.selected !== null && this.selected % 9 === index % 9;
        const sameNumber = value && this.selected !== null && value === this.board[this.selected];
        const classes = `sudoku-cell${this.given.has(index) ? " given" : ""}${index === this.selected ? " selected" : ""}${selectedRow ? " row-highlight" : ""}${selectedColumn ? " column-highlight" : ""}${sameNumber ? " same-number" : ""}${this.wrong.has(index) ? " wrong" : ""}`;
        const display = value || (this.notes[index].size ? [...this.notes[index]].sort().join(" ") : "");
        const button = this.cells[index];
        if (button.className !== classes) button.className = classes;
        if (button.textContent !== String(display)) button.textContent = String(display);
        if (this.notes[index].size) button.classList.add("notes-cell");
        button.setAttribute("aria-label", `${Math.floor(index / 9) + 1}, ${index % 9 + 1}${value ? `: ${value}` : ""}`);
      });
    }

    setNumber(number) {
      if (this.complete || this.app.isGameBlocked()) return;
      if (this.selected === null || this.given.has(this.selected)) return;
      if (this.noteMode && number) {
        this.notes[this.selected].has(number) ? this.notes[this.selected].delete(number) : this.notes[this.selected].add(number);
      } else {
        this.notes[this.selected].clear(); this.board[this.selected] = number; this.wrong.delete(this.selected);
        if (number && number !== this.solution[this.selected]) { this.wrong.add(this.selected); this.mistakes += 1; }
      }
      this.mistakeNode.textContent = String(this.mistakes);
      this.draw();
      this.checkComplete();
      this.app.requestSave();
    }

    check() { if (this.complete || this.app.isGameBlocked()) return; this.board.forEach((value, index) => { if (!this.given.has(index) && value && value !== this.solution[index]) this.wrong.add(index); }); this.mistakes += this.wrong.size ? 1 : 0; this.mistakeNode.textContent = String(this.mistakes); this.draw(); this.checkComplete(); this.app.saveSession(); }
    checkComplete() {
      if (this.complete || !this.board.every(Boolean) || !this.board.every((value, index) => value === this.solution[index])) return;
      this.complete = true; window.clearInterval(this.timer); const previous = storage.value.sudokuBest[this.level] || Infinity; if (this.elapsed < previous) storage.value.sudokuBest[this.level] = this.elapsed; storage.save(); this.bestNode.textContent = this.formatTime(storage.value.sudokuBest[this.level]); this.notice = create("div", "notice", `${this.app.t("congratulations")} ${this.formatTime(this.elapsed)}`); this.boardNode.after(this.notice); this.app.award("sudoku", Math.max(20, 120 - this.elapsed));
      this.app.saveSession();
    }
    setActive(active) { this.backgrounded = !active; }
    serialize() { return { board: this.board, solution: this.solution, given: [...this.given], notes: this.notes.map((notes) => [...notes]), wrong: [...this.wrong], selected: this.selected, noteMode: this.noteMode, mistakes: this.mistakes, elapsed: this.elapsed }; }
    destroy() { window.clearInterval(this.timer); }
  }

  new App($("#app")).init();
})();
