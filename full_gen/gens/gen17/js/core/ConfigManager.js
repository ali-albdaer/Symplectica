import { Config, updateConfig } from "../../Config.js";

export class ConfigManager {
    constructor() {
        this.config = Config;
        this.listeners = new Map();
    }

    get(path = null) {
        if (!path) {
            return this.config;
        }
        const segments = path.split(".");
        let cursor = this.config;
        for (const segment of segments) {
            if (!(segment in cursor)) {
                throw new Error(`Invalid config lookup at ${segment}`);
            }
            cursor = cursor[segment];
        }
        return cursor;
    }

    set(path, value) {
        updateConfig(path, value);
        this.notify(path, value);
    }

    notify(path, value) {
        const callbacks = this.listeners.get(path);
        if (!callbacks) {
            return;
        }
        callbacks.forEach((fn) => fn(value));
    }

    onChange(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        return () => this.listeners.get(path).delete(callback);
    }
}
