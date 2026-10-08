(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.BlockableUpdates = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";

  const newer = (next, current) => {
    if (!/^\d+\.\d+\.\d+$/.test(next)) return false;
    const a = next.split(".").map(Number); const b = current.split(".").map(Number);
    for (let index = 0; index < 3; index += 1) if (a[index] !== b[index]) return a[index] > b[index];
    return false;
  };
  const bounded = (promise, milliseconds = 15000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Update timed out")), milliseconds);
    Promise.resolve(promise).then(resolve, reject).finally(() => clearTimeout(timer));
  });

  class Updater {
    constructor({ version, onState, save, reload, native = false }) {
      this.version = version; this.onState = onState; this.save = save; this.reload = reload;
      this.native = native; this.state = { status: "idle" }; this.busy = false;
      this.web = !native && /^https?:$/.test(location.protocol) && "serviceWorker" in navigator;
      if (this.web) {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          // A downloaded worker may activate while a game is open. Never reload without consent.
          this.workerVersion(navigator.serviceWorker.controller).then((version) => {
            if (!this.busy && newer(version, this.version)) this.setState("available", version);
          }).catch(() => {});
        });
        this.registration = this.register();
        this.registration.catch(() => {});
      }
    }
    setState(status, version = this.state.version) {
      this.state = { status, version }; this.onState(this.state);
    }
    register() { return navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }); }
    async workerVersion(worker) {
      if (!worker) return null;
      const channel = new MessageChannel();
      try {
        return await bounded(new Promise((resolve) => {
          channel.port1.onmessage = (event) => resolve(event.data?.version || null);
          worker.postMessage({ type: "GET_VERSION" }, [channel.port2]);
        }), 1500);
      } finally { channel.port1.close(); channel.port2.close(); }
    }
    async check() {
      if (this.busy) return;
      this.busy = true; this.setState("checking");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const base = this.web ? new URL("./version.json", location.href) : new URL("https://adsaver-labs.github.io/Blockable/version.json");
        // The unique URL also escapes older workers that cached version.json forever.
        base.searchParams.set("check", String(Date.now()));
        const response = await fetch(base, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const release = await response.json();
        if (!/^\d+\.\d+\.\d+$/.test(release.version)) throw new Error("Invalid release version");
        if (!newer(release.version, this.version)) { this.setState("current"); return; }
        if (this.web) {
          this.registration = this.register();
          const registration = await bounded(this.registration);
          await bounded(registration.update());
        }
        this.setState(this.web ? "available" : "native", release.version);
      } catch { this.setState("error"); }
      finally { clearTimeout(timer); this.busy = false; }
    }
    async apply() {
      if (this.busy || !this.web || !this.state.version) return;
      this.busy = true;
      const target = this.state.version;
      try {
        if (!this.save()) { this.setState("saveError", target); return; }
        this.setState("updating", target);
        this.registration = this.register();
        const registration = await bounded(this.registration);
        await bounded(registration.update());
        await bounded(new Promise((resolve, reject) => {
          let inspecting = false;
          const inspect = async () => {
            if (inspecting) return;
            inspecting = true;
            try {
              if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
              const version = await this.workerVersion(navigator.serviceWorker.controller);
              if (version === target || newer(version, target)) { clearInterval(poll); resolve(); }
            } catch (error) {
              if (!registration.installing && !registration.waiting && !navigator.onLine) { clearInterval(poll); reject(error); }
            } finally { inspecting = false; }
          };
          const poll = setInterval(inspect, 200);
          this.stopPolling = () => clearInterval(poll);
          inspect();
        }), 20000);
        if (!this.save()) { this.setState("saveError", target); return; }
        this.reload();
      } catch { this.setState("error", target); }
      finally { this.stopPolling?.(); this.stopPolling = null; this.busy = false; }
    }
  }
  return { Updater, newer };
});
