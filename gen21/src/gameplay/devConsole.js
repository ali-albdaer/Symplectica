// Developer console: live editing of Config via "/" key

import { Config, ConfigSchema, getConfigValue, setConfigValue, FidelityLevel } from "../core/config.js";
import { Debug } from "../core/debug.js";

const devConsoleEl = document.getElementById("devConsole");

export function setupDevConsole({ physics, rendererSystem }) {
  if (!devConsoleEl) {
    Debug.error("Dev console element missing");
    return;
  }

  devConsoleEl.innerHTML = "";
  const title = document.createElement("h2");
  title.textContent = "Developer Console";
  devConsoleEl.appendChild(title);

  const group = document.createElement("div");
  devConsoleEl.appendChild(group);

  function createControl(key, schema) {
    const label = document.createElement("label");
    label.textContent = schema.label;

    const input = document.createElement("input");
    input.type = "range";
    input.min = schema.min;
    input.max = schema.max;
    input.step = schema.step;
    input.value = getConfigValue(schema.path);

    const number = document.createElement("input");
    number.type = "number";
    number.min = schema.min;
    number.max = schema.max;
    number.step = schema.step;
    number.value = input.value;

    input.addEventListener("input", () => {
      number.value = input.value;
      setConfigValue(schema.path, parseFloat(input.value));
    });

    number.addEventListener("change", () => {
      input.value = number.value;
      setConfigValue(schema.path, parseFloat(number.value));
    });

    label.appendChild(input);
    label.appendChild(number);
    group.appendChild(label);
  }

  for (const [key, schema] of Object.entries(ConfigSchema)) {
    createControl(key, schema);
  }

  const fidelityLabel = document.createElement("label");
  fidelityLabel.textContent = "Fidelity";
  const fidelitySelect = document.createElement("select");
  [FidelityLevel.LOW, FidelityLevel.MEDIUM, FidelityLevel.ULTRA].forEach((lvl) => {
    const opt = document.createElement("option");
    opt.value = lvl;
    opt.textContent = lvl;
    if (Config.rendering.fidelity === lvl) opt.selected = true;
    fidelitySelect.appendChild(opt);
  });
  fidelitySelect.addEventListener("change", () => {
    Config.rendering.fidelity = fidelitySelect.value;
    Debug.log(`Fidelity set to ${Config.rendering.fidelity}`);
  });
  fidelityLabel.appendChild(fidelitySelect);
  group.appendChild(fidelityLabel);

  function toggleVisible(force) {
    const visible = force !== undefined ? force : devConsoleEl.style.display === "none";
    devConsoleEl.style.display = visible ? "block" : "none";
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "/") {
      e.preventDefault();
      const shouldShow = devConsoleEl.style.display !== "block";
      toggleVisible(shouldShow);
      if (shouldShow) {
        document.exitPointerLock?.();
      }
    }
  });

  devConsoleEl.style.display = "none";
  Debug.log("Dev console initialized");
}
