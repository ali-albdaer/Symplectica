import { getConfig, updateConfig } from "../../config.js";

export class FidelityMenu {
    constructor(element) {
        this.element = element;
        this.visible = false;
        this.buildUI();
    }

    buildUI() {
        this.element.innerHTML = "";
        const header = document.createElement("h3");
        header.textContent = "Visual Fidelity";
        this.element.appendChild(header);

        const fidelityRow = document.createElement("div");
        fidelityRow.classList.add("control-field");
        const label = document.createElement("label");
        label.textContent = "Preset";
        const select = document.createElement("select");
        ["low", "medium", "ultra"].forEach((level) => {
            const option = document.createElement("option");
            option.value = level;
            option.textContent = level.charAt(0).toUpperCase() + level.slice(1);
            select.appendChild(option);
        });
        select.value = getConfig().simulation.fidelity;
        select.addEventListener("change", () => {
            updateConfig("simulation.fidelity", select.value);
        });
        fidelityRow.appendChild(label);
        fidelityRow.appendChild(select);
        this.element.appendChild(fidelityRow);

        const metricsRow = document.createElement("div");
        metricsRow.classList.add("control-field");
        const metricsLabel = document.createElement("label");
        metricsLabel.textContent = "Metrics";
        const metricsToggle = document.createElement("input");
        metricsToggle.type = "checkbox";
        metricsToggle.checked = getConfig().ui.metricsDisplay;
        metricsToggle.addEventListener("change", () => {
            updateConfig("ui.metricsDisplay", metricsToggle.checked);
        });
        metricsRow.appendChild(metricsLabel);
        metricsRow.appendChild(metricsToggle);
        this.element.appendChild(metricsRow);
    }

    show() {
        this.visible = true;
        this.element.classList.remove("hidden");
    }

    hide() {
        this.visible = false;
        this.element.classList.add("hidden");
    }

    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }
}
