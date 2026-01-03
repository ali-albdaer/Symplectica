export class ErrorOverlay {
    constructor(panel) {
        this.panel = panel;
    }

    showError(message) {
        if (!this.panel) {
            return;
        }
        this.panel.textContent = message;
        this.panel.classList.remove("hidden");
    }

    clear() {
        if (!this.panel) {
            return;
        }
        this.panel.textContent = "";
        this.panel.classList.add("hidden");
    }
}
