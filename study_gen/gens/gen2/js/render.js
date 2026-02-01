// js/render.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
let scene, camera, renderer, controls, physics, animationId;
let viewMode = 'TOP'; // 'TOP' or 'FREE'
let moveState = { forward: false, back: false, left: false, right: false, up: false, down: false };
let moveSpeed = 2e9;
let bodyMeshes = new Map();
let dragState = {
    dragging: false,
    mesh: null,
    offset: new THREE.Vector3(),
    plane: new THREE.Plane(),
    intersection: new THREE.Vector3(),
};

export function initScene(physicsEngine) {
    // Drag and drop logic (after renderer is initialized)
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
}

function getIntersectedMesh(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const meshes = Array.from(bodyMeshes.values());
    const intersects = raycaster.intersectObjects(meshes);
    return intersects.length > 0 ? intersects[0] : null;
}

function onMouseDown(event) {
    if (event.button !== 0) return; // Only left click
    const hit = getIntersectedMesh(event);
    if (hit) {
        dragState.dragging = true;
        dragState.mesh = hit.object;
        // Plane parallel to camera up, through hit point
        dragState.plane.setFromNormalAndCoplanarPoint(camera.up, hit.point);
        dragState.offset.copy(hit.point).sub(dragState.mesh.position);
        controls.enabled = false;
        event.preventDefault();
    }
}

function onMouseMove(event) {
    if (!dragState.dragging || !dragState.mesh) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    if (raycaster.ray.intersectPlane(dragState.plane, dragState.intersection)) {
        dragState.mesh.position.copy(dragState.intersection.sub(dragState.offset));
        // Update physics body position
        for (const [body, mesh] of bodyMeshes.entries()) {
            if (mesh === dragState.mesh) {
                body.position.copy(dragState.mesh.position);
                break;
            }
        }
    }
}

function onMouseUp(event) {
    if (dragState.dragging) {
        dragState.dragging = false;
        dragState.mesh = null;
        controls.enabled = true;
    }
}

function onKeyDown(e) {
    if (viewMode !== 'FREE') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'KeyW') moveState.forward = true;
    if (e.code === 'KeyS') moveState.back = true;
    if (e.code === 'KeyA') moveState.left = true;
    if (e.code === 'KeyD') moveState.right = true;
    if (e.code === 'Space') moveState.up = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') moveState.down = true;
}

function onKeyUp(e) {
    if (e.code === 'KeyW') moveState.forward = false;
    if (e.code === 'KeyS') moveState.back = false;
    if (e.code === 'KeyA') moveState.left = false;
    if (e.code === 'KeyD') moveState.right = false;
    if (e.code === 'Space') moveState.up = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') moveState.down = false;
    physics = physicsEngine;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10131a);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1e13);
    camera.position.set(0, 0, 3e11);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('main-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.maxDistance = 1e13;
    controls.minDistance = 1e6;
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(1, 1, 2);
    scene.add(dirLight);
    setViewMode('TOP');
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function animate() {
    animationId = requestAnimationFrame(animate);
    try {
        physics.step();
        updateBodies();
        if (viewMode === 'FREE') {
            controls.enabled = false;
            moveCamera();
        } else {
            controls.enabled = true;
            controls.update();
        }
        renderer.render(scene, camera);
    } catch (e) {
        showError(e.message || 'Simulation error.');
        cancelAnimationFrame(animationId);
    }
function moveCamera() {
    // Move camera in local axes
    let dir = new THREE.Vector3();
    if (moveState.forward) dir.z -= 1;
    if (moveState.back) dir.z += 1;
    if (moveState.left) dir.x -= 1;
    if (moveState.right) dir.x += 1;
    if (moveState.up) dir.y += 1;
    if (moveState.down) dir.y -= 1;
    if (dir.lengthSq() === 0) return;
    dir.normalize();
    // Move relative to camera orientation
    let move = new THREE.Vector3();
    camera.getWorldDirection(move);
    move.y = 0; // flatten for horizontal movement
    move.normalize();
    let right = new THREE.Vector3().crossVectors(move, camera.up).normalize();
    let up = new THREE.Vector3(0, 1, 0);
    let moveVec = new THREE.Vector3();
    moveVec.addScaledVector(move, dir.z);
    moveVec.addScaledVector(right, dir.x);
    moveVec.addScaledVector(up, dir.y);
    moveVec.normalize().multiplyScalar(moveSpeed);
    camera.position.add(moveVec);
}
}

function updateBodies() {
    // Remove meshes for deleted bodies
    for (const [body, mesh] of bodyMeshes.entries()) {
        if (!physics.bodies.includes(body)) {
            scene.remove(mesh);
            bodyMeshes.delete(body);
        }
    }
    // Log all bodies for debugging
    console.log('Bodies:', physics.bodies.map(b => ({ name: b.name, type: b.type, pos: b.position, radius: b.radius })));
    // Add or update meshes for all bodies
    for (const body of physics.bodies) {
        let mesh = bodyMeshes.get(body);
        if (!mesh) {
            // Choose color/texture by type
            let color = 0xffffff;
            if (body.type === 'star') color = 0xffee88;
            else if (body.type === 'planet') color = 0x88aaff;
            else if (body.type === 'comet') color = 0xaaffff;
            else if (body.type === 'spaceship') color = 0xcccccc;
            else if (body.type === 'blackhole') color = 0x000000;
            else if (body.type === 'neutron') color = 0xddddff;
            let mat = new THREE.MeshPhongMaterial({ color });
            if (body.type === 'blackhole') mat.emissive = new THREE.Color(0x222222);
            // Increase minimum sphere size for visibility
            let geom = new THREE.SphereGeometry(Math.max(body.radius, 2e9), 32, 32);
            mesh = new THREE.Mesh(geom, mat);
            scene.add(mesh);
            bodyMeshes.set(body, mesh);
        }
        mesh.position.copy(body.position);
    }
}

export function setViewMode(mode) {
    viewMode = mode;
    if (mode === 'TOP') {
        camera.position.set(0, 0, 3e11);
        camera.up.set(0, 1, 0);
        controls.enableRotate = false;
    } else {
        camera.position.set(0, 0, 3e11);
        camera.up.set(0, 1, 0);
        controls.enableRotate = true;
    }
    controls.update();
    document.getElementById('view-mode').textContent = mode + ' VIEW';
}

export function showError(msg) {
    const bar = document.getElementById('error-bar');
    bar.textContent = msg;
    bar.style.display = 'block';
    setTimeout(() => { bar.style.display = 'none'; }, 5000);
}
