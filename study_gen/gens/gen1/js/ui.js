// ui.js
// Handles UI creation and interaction for celestial mechanics simulator

export function createUI(system) {
    const ui = document.getElementById('ui-container');
    ui.innerHTML = '';
    // Title
    const title = document.createElement('h2');
    title.textContent = 'Celestial Mechanics Simulator';
    ui.appendChild(title);
    // Presets
    const presetLabel = document.createElement('label');
    presetLabel.textContent = 'Presets:';
    ui.appendChild(presetLabel);
    const presetSelect = document.createElement('select');
    presetSelect.innerHTML = `
        <option value="solar">Solar System</option>
        <option value="sun-earth-moon">Sun-Earth-Moon</option>
        <option value="3suns">3 Suns</option>
    `;
    ui.appendChild(presetSelect);
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load Preset';
    ui.appendChild(loadBtn);
    loadBtn.onclick = () => {
        const preset = presetSelect.value;
        window.loadPreset(preset);
    };
    // Spawn menu
    const spawnLabel = document.createElement('label');
    spawnLabel.textContent = 'Spawn Object:';
    ui.appendChild(spawnLabel);
    const spawnSelect = document.createElement('select');
    spawnSelect.innerHTML = `
        <option value="star">Star</option>
        <option value="planet">Planet</option>
        <option value="comet">Comet</option>
        <option value="spaceship">Spaceship</option>
        <option value="blackhole">Blackhole</option>
        <option value="neutron">Neutron Star</option>
    `;
    ui.appendChild(spawnSelect);
    const spawnBtn = document.createElement('button');
    spawnBtn.textContent = 'Spawn';
    ui.appendChild(spawnBtn);
    spawnBtn.onclick = () => {
        window.spawnBody(spawnSelect.value);
    };
    // Settings
    const settingsBtn = document.createElement('button');
    settingsBtn.textContent = 'Settings';
    ui.appendChild(settingsBtn);
    settingsBtn.onclick = () => {
        window.showSettings();
    };
}
