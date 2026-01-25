export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) {
            return;
        }
        this.listeners.get(event).delete(callback);
    }

    emit(event, payload) {
        if (!this.listeners.has(event)) {
            return;
        }
        for (const callback of this.listeners.get(event)) {
            callback(payload);
        }
    }
}
