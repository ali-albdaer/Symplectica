function getByPath(root, path) {
  const parts = path.split('.');
  let cur = root;
  for (const p of parts) cur = cur?.[p];
  return cur;
}

function setByPath(root, path, value) {
  const parts = path.split('.');
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

export class ConfigStore {
  constructor(initial) {
    this._data = structuredClone(initial);
    this._listeners = new Set();
  }

  get data() {
    return this._data;
  }

  get(path) {
    return getByPath(this._data, path);
  }

  patch(path, value) {
    setByPath(this._data, path, value);
    this._emit(path, value);
  }

  onChange(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _emit(path, value) {
    for (const fn of this._listeners) fn(path, value, this._data);
  }
}
