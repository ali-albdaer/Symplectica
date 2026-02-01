// js/ui.js
// Minimal UI logic for controls and menus
export function setupUI({ onViewSwitch, onError, physics }) {
    // Helper to close all menus
    function closeMenus() {
        document.getElementById('spawn-menu').style.display = 'none';
        document.getElementById('presets-menu').style.display = 'none';
        document.getElementById('settings-menu').style.display = 'none';
    }

    // SPAWN MENU
    document.getElementById('spawn-btn').onclick = () => {
        closeMenus();
        const menu = document.getElementById('spawn-menu');
        menu.innerHTML = `
            <h2>Spawn Celestial Object</h2>
            <label>Type
                <select id="spawn-type">
                    <option value="star">Star</option>
                    <option value="planet">Planet</option>
                    <option value="comet">Comet</option>
                    <option value="spaceship">Spaceship</option>
                    <option value="blackhole">Blackhole</option>
                    <option value="neutron">Neutron Star</option>
                </select>
            </label>
            <label>Name <input id="spawn-name" value="Body" /></label>
            <label>Mass (kg) <input id="spawn-mass" type="number" value="1e24" /></label>
            <label>Radius (m) <input id="spawn-radius" type="number" value="1e6" /></label>
            <label>Luminosity <input id="spawn-lum" type="number" value="0" /></label>
            <label>Position (x, y, z) <input id="spawn-pos" value="0,0,0" /></label>
            <label>Velocity (x, y, z) <input id="spawn-vel" value="0,0,0" /></label>
            <div>
                <button id="spawn-confirm">Spawn</button>
                <button id="spawn-cancel">Cancel</button>
            </div>
        `;
        menu.style.display = 'flex';
        document.getElementById('spawn-cancel').onclick = closeMenus;
        // Click to set position
        let spawnPos = [0, 0, 0];
        let canvas = document.getElementById('main-canvas');
        let clickHandler = (e) => {
            // Get normalized device coordinates
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            // Raycast from camera
            const raycaster = new window.THREE.Raycaster();
            raycaster.setFromCamera({ x, y }, window.camera || window._camera || window.THREE_CAMERA);
            // Intersect with z=0 plane
            const planeZ = new window.THREE.Plane(new window.THREE.Vector3(0, 0, 1), 0);
            const pos = new window.THREE.Vector3();
            raycaster.ray.intersectPlane(planeZ, pos);
            spawnPos = [pos.x, pos.y, pos.z];
            document.getElementById('spawn-pos').value = `${pos.x.toFixed(2)},${pos.y.toFixed(2)},${pos.z.toFixed(2)}`;
        };
        canvas.addEventListener('click', clickHandler);
        document.getElementById('spawn-confirm').onclick = () => {
            try {
                const type = document.getElementById('spawn-type').value;
                const name = document.getElementById('spawn-name').value;
                const mass = parseFloat(document.getElementById('spawn-mass').value);
                const radius = parseFloat(document.getElementById('spawn-radius').value);
                const luminosity = parseFloat(document.getElementById('spawn-lum').value);
                const pos = document.getElementById('spawn-pos').value.split(',').map(Number);
                const vel = document.getElementById('spawn-vel').value.split(',').map(Number);
                const body = {
                    name,
                    mass,
                    radius,
                    luminosity,
                    position: new window.THREE.Vector3(...pos),
                    velocity: new window.THREE.Vector3(...vel),
                    type,
                    texture: null
                };
                if (physics.addBody) physics.addBody(body);
                canvas.removeEventListener('click', clickHandler);
                closeMenus();
            } catch (e) {
                onError('Invalid input: ' + e.message);
            }
        };
        document.getElementById('spawn-cancel').onclick = () => {
            canvas.removeEventListener('click', clickHandler);
            closeMenus();
        };
    };

    // PRESETS MENU
    document.getElementById('presets-btn').onclick = () => {
        closeMenus();
        const menu = document.getElementById('presets-menu');
        menu.innerHTML = `
            <h2>Presets</h2>
            <button id="preset-solar">Accurate Solar System</button>
            <button id="preset-sunearthmoon">Sun-Earth-Moon</button>
            <button id="preset-3suns">3 Suns</button>
            <button id="preset-clear">Clear All</button>
            <button id="presets-cancel">Cancel</button>
        `;
        menu.style.display = 'flex';
        // Attach event listeners after DOM update
        requestAnimationFrame(() => {
            document.getElementById('presets-cancel').onclick = closeMenus;
            document.getElementById('preset-clear').onclick = () => { if (physics.reset) physics.reset(); closeMenus(); };
            document.getElementById('preset-solar').onclick = () => {
                if (physics.reset) physics.reset();
                // Sun
                physics.addBody({
                    name: 'Sun',
                    mass: 1.9885e30,
                    radius: 6.9634e8,
                    luminosity: 3.828e26,
                    position: new window.THREE.Vector3(0, 0, 0),
                    velocity: new window.THREE.Vector3(0, 0, 0),
                    type: 'star',
                    texture: null
                });
                // Mercury
                physics.addBody({
                    name: 'Mercury',
                    mass: 3.3011e23,
                    radius: 2.4397e6,
                    luminosity: 0,
                    position: new window.THREE.Vector3(5.79e10, 0, 0),
                    velocity: new window.THREE.Vector3(0, 4.79e4, 0),
                    type: 'planet',
                    texture: null
                });
                // Venus
                physics.addBody({
                    name: 'Venus',
                    mass: 4.8675e24,
                    radius: 6.0518e6,
                    luminosity: 0,
                    position: new window.THREE.Vector3(1.082e11, 0, 0),
                    velocity: new window.THREE.Vector3(0, 3.5e4, 0),
                    type: 'planet',
                    texture: null
                });
                // Earth
                physics.addBody({
                    name: 'Earth',
                    mass: 5.972e24,
                    radius: 6.371e6,
                    luminosity: 0,
                    position: new window.THREE.Vector3(1.496e11, 0, 0),
                    velocity: new window.THREE.Vector3(0, 2.98e4, 0),
                    type: 'planet',
                    texture: null
                });
                // Mars
                physics.addBody({
                    name: 'Mars',
                    mass: 6.4171e23,
                    radius: 3.3895e6,
                    luminosity: 0,
                    position: new window.THREE.Vector3(2.279e11, 0, 0),
                    velocity: new window.THREE.Vector3(0, 2.41e4, 0),
                    type: 'planet',
                    texture: null
                });
                // Jupiter
                physics.addBody({
                    name: 'Jupiter',
                    mass: 1.8982e27,
                    radius: 6.9911e7,
                    luminosity: 0,
                    position: new window.THREE.Vector3(7.785e11, 0, 0),
                    velocity: new window.THREE.Vector3(0, 1.31e4, 0),
                    type: 'planet',
                    texture: null
                });
                // Saturn
                physics.addBody({
                    name: 'Saturn',
                    mass: 5.6834e26,
                    radius: 5.8232e7,
                    luminosity: 0,
                    position: new window.THREE.Vector3(1.433e12, 0, 0),
                    velocity: new window.THREE.Vector3(0, 9.7e3, 0),
                    type: 'planet',
                    texture: null
                });
                // Uranus
                physics.addBody({
                    name: 'Uranus',
                    mass: 8.6810e25,
                    radius: 2.5362e7,
                    luminosity: 0,
                    position: new window.THREE.Vector3(2.877e12, 0, 0),
                    velocity: new window.THREE.Vector3(0, 6.8e3, 0),
                    type: 'planet',
                    texture: null
                });
                // Neptune
                physics.addBody({
                    name: 'Neptune',
                    mass: 1.02413e26,
                    radius: 2.4622e7,
                    luminosity: 0,
                    position: new window.THREE.Vector3(4.503e12, 0, 0),
                    velocity: new window.THREE.Vector3(0, 5.4e3, 0),
                    type: 'planet',
                    texture: null
                });
                closeMenus();
            };
            document.getElementById('preset-sunearthmoon').onclick = () => {
                if (physics.reset) physics.reset();
                // Sun
                physics.addBody({
                    name: 'Sun',
                    mass: 1.9885e30,
                    radius: 6.9634e8,
                    luminosity: 3.828e26,
                    position: new window.THREE.Vector3(0, 0, 0),
                    velocity: new window.THREE.Vector3(0, 0, 0),
                    type: 'star',
                    texture: null
                });
                // Earth
                physics.addBody({
                    name: 'Earth',
                    mass: 5.972e24,
                    radius: 6.371e6,
                    luminosity: 0,
                    position: new window.THREE.Vector3(1.496e11, 0, 0),
                    velocity: new window.THREE.Vector3(0, 2.98e4, 0),
                    type: 'planet',
                    texture: null
                });
                // Moon
                physics.addBody({
                    name: 'Moon',
                    mass: 7.342e22,
                    radius: 1.737e6,
                    luminosity: 0,
                    position: new window.THREE.Vector3(1.496e11 + 3.844e8, 0, 0),
                    velocity: new window.THREE.Vector3(0, 2.98e4 + 1.022e3, 0),
                    type: 'planet',
                    texture: null
                });
                closeMenus();
            };
            document.getElementById('preset-3suns').onclick = () => {
                if (physics.reset) physics.reset();
                // Three stars in a triangle
                const d = 2e11;
                const v = 2e4;
                physics.addBody({
                    name: 'Star A',
                    mass: 1.9885e30,
                    radius: 6.9634e8,
                    luminosity: 3.828e26,
                    position: new window.THREE.Vector3(-d, 0, 0),
                    velocity: new window.THREE.Vector3(0, v, 0),
                    type: 'star',
                    texture: null
                });
                physics.addBody({
                    name: 'Star B',
                    mass: 1.9885e30,
                    radius: 6.9634e8,
                    luminosity: 3.828e26,
                    position: new window.THREE.Vector3(d, 0, 0),
                    velocity: new window.THREE.Vector3(0, -v, 0),
                    type: 'star',
                    texture: null
                });
                physics.addBody({
                    name: 'Star C',
                    mass: 1.9885e30,
                    radius: 6.9634e8,
                    luminosity: 3.828e26,
                    position: new window.THREE.Vector3(0, d, 0),
                    velocity: new window.THREE.Vector3(-v, 0, 0),
                    type: 'star',
                    texture: null
                });
                closeMenus();
            };
        });
    };

    // SETTINGS MENU
    document.getElementById('settings-btn').onclick = () => {
        closeMenus();
        const menu = document.getElementById('settings-menu');
        menu.innerHTML = `
            <h2>Settings</h2>
            <label>Physics Timestep (s) <input id="settings-timestep" type="number" value="1" /></label>
            <label><input id="settings-visuals" type="checkbox" /> Enable Advanced Visuals</label>
            <div>
                <button id="settings-apply">Apply</button>
                <button id="settings-cancel">Cancel</button>
            </div>
        `;
        menu.style.display = 'flex';
        document.getElementById('settings-cancel').onclick = closeMenus;
        document.getElementById('settings-apply').onclick = () => {
            const timestep = parseFloat(document.getElementById('settings-timestep').value);
            if (!isNaN(timestep) && physics.timeStep !== undefined) physics.timeStep = timestep;
            // Advanced visuals toggle can be handled here
            closeMenus();
        };
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'T' || e.key === 't') {
            physics.toggleRun();
        } else if (e.key === 'V' || e.key === 'v') {
            const newMode = document.getElementById('view-mode').textContent.startsWith('TOP') ? 'FREE' : 'TOP';
            onViewSwitch(newMode);
        } else if (e.key === 'Z' || e.key === 'z') {
            const ui = document.getElementById('ui-container');
            ui.style.display = ui.style.display === 'none' ? '' : 'none';
        } else if (e.key === 'Escape') {
            closeMenus();
        }
    });
}
