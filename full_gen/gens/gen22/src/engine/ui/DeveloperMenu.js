import { getConfig, updateConfig, serializeConfig } from "../../config.js";

export class DeveloperMenu {
    constructor(element, onConfigChanged) {
        this.element = element;
        this.visible = false;
        this.inputs = new Map();
        this.onConfigChanged = onConfigChanged;
        this.buildUI();
    }

    buildUI() {
        this.element.innerHTML = "";
        const header = document.createElement("h3");
        header.textContent = "Developer Console";
        this.element.appendChild(header);

        const description = document.createElement("p");
        description.textContent = "Adjust simulation parameters in real-time. Values persist for this session.";
        description.style.fontSize = "0.8rem";
        description.style.opacity = "0.75";
        this.element.appendChild(description);

        this.createSection("Simulation", [
            this.createNumberField("Time Scale", "simulation.timeScale", 60, 86400, 60),
            this.createNumberField("Gravity Constant", "simulation.gravitationalConstant", 1e-11, 1e-9, 1e-12),
            this.createToggleField("LOD Enabled", "simulation.enableLOD"),
            this.createSelectField("Fidelity", "simulation.fidelity", ["low", "medium", "ultra"])
        ]);

        this.createSection("Rendering", [
            this.createNumberField("Exposure", "rendering.exposure", 0.1, 5, 0.05),
            this.createNumberField("Star Density", "rendering.starfieldDensity", 0.1, 1.0, 0.05)
        ]);

        this.createBodiesSection();
    }

    createSection(title, fields) {
        const section = document.createElement("div");
        section.classList.add("dev-menu-section");
        const heading = document.createElement("h4");
        heading.textContent = title;
        section.appendChild(heading);
        fields.forEach((field) => section.appendChild(field));
        this.element.appendChild(section);
    }

    createNumberField(labelText, configPath, min, max, step) {
        const container = document.createElement("div");
        container.classList.add("control-field");
        const label = document.createElement("label");
        label.textContent = labelText;
        const input = document.createElement("input");
        input.type = "number";
        input.step = step;
        if (typeof min !== "undefined") input.min = min;
        if (typeof max !== "undefined") input.max = max;
        input.value = this.getValue(configPath);
        input.addEventListener("change", () => {
            const value = parseFloat(input.value);
            this.setValue(configPath, Number.isFinite(value) ? value : this.getValue(configPath));
        });
        container.appendChild(label);
        container.appendChild(input);
        this.inputs.set(configPath, input);
        return container;
    }

    createToggleField(labelText, configPath) {
        const container = document.createElement("div");
        container.classList.add("control-field");
        const label = document.createElement("label");
        label.textContent = labelText;
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = Boolean(this.getValue(configPath));
        input.addEventListener("change", () => {
            this.setValue(configPath, input.checked);
        });
        container.appendChild(label);
        container.appendChild(input);
        this.inputs.set(configPath, input);
        return container;
    }

    createSelectField(labelText, configPath, options) {
        const container = document.createElement("div");
        container.classList.add("control-field");
        const label = document.createElement("label");
        label.textContent = labelText;
        const select = document.createElement("select");
        options.forEach((option) => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
        select.value = this.getValue(configPath);
        select.addEventListener("change", () => {
            this.setValue(configPath, select.value);
        });
        container.appendChild(label);
        container.appendChild(select);
        this.inputs.set(configPath, select);
        return container;
    }

    createBodiesSection() {
        const data = serializeConfig();
        const section = document.createElement("div");
        section.classList.add("dev-menu-section");
        const heading = document.createElement("h4");
        heading.textContent = "Celestial Bodies";
        section.appendChild(heading);
        Object.entries(data.celestialBodies).forEach(([key, body]) => {
            const block = document.createElement("div");
            block.classList.add("dev-menu-body-block");
            const title = document.createElement("strong");
            title.textContent = body.name;
            block.appendChild(title);
            block.appendChild(this.createNumberField(`${body.name} Mass`, `celestialBodies.${key}.mass`, body.mass * 0.1, body.mass * 10, body.mass * 0.01));
            block.appendChild(this.createNumberField(`${body.name} Radius`, `celestialBodies.${key}.radius`, body.radius * 0.1, body.radius * 10, body.radius * 0.05));
            if (body.semiMajorAxis) {
                block.appendChild(this.createNumberField(`${body.name} Orbit Radius`, `celestialBodies.${key}.semiMajorAxis`, body.semiMajorAxis * 0.1, body.semiMajorAxis * 10, body.semiMajorAxis * 0.01));
            }
            section.appendChild(block);
        });
        this.element.appendChild(section);
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

    getValue(path) {
        const segments = path.split(".");
        let target = getConfig();
        for (const key of segments) {
            target = target[key];
        }
        return target;
    }

    setValue(path, value) {
        updateConfig(path, value);
        const input = this.inputs.get(path);
        if (input) {
            if (input.type === "checkbox") {
                input.checked = Boolean(value);
            } else {
                input.value = value;
            }
        }
        if (this.onConfigChanged) {
            this.onConfigChanged(path, value);
        }
    }
}
