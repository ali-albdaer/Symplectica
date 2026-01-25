export class StateStore {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.watchers = new Map();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const prev = this.state[key];
    if (prev === value) return;
    this.state[key] = value;
    this.emit(key, value, prev);
  }

  emit(key, value, prev) {
    const callbacks = this.watchers.get(key);
    if (!callbacks) return;
    callbacks.forEach((cb) => {
      try {
        cb(value, prev);
      } catch (error) {
        console.error(`StateStore watcher error for ${key}`, error);
      }
    });
  }

  watch(key, callback) {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }
    this.watchers.get(key).add(callback);
    return () => this.watchers.get(key)?.delete(callback);
  }
}
