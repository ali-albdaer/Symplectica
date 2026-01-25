import * as THREE from 'three';

export function createStarfield({ count, radius, twinkle }) {
	const geom = new THREE.BufferGeometry();
	const positions = new Float32Array(count * 3);
	const colors = new Float32Array(count * 3);
	const sizes = new Float32Array(count);
	const phases = new Float32Array(count);

	for (let i = 0; i < count; i++) {
		const u = Math.random();
		const v = Math.random();
		const theta = 2 * Math.PI * u;
		const phi = Math.acos(2 * v - 1);
		const r = radius;

		const x = r * Math.sin(phi) * Math.cos(theta);
		const y = r * Math.cos(phi);
		const z = r * Math.sin(phi) * Math.sin(theta);

		positions[i * 3 + 0] = x;
		positions[i * 3 + 1] = y;
		positions[i * 3 + 2] = z;

		const c = 0.7 + 0.3 * Math.random();
		colors[i * 3 + 0] = c;
		colors[i * 3 + 1] = c;
		colors[i * 3 + 2] = c;
		sizes[i] = 1.0 + 1.5 * Math.random();
		phases[i] = Math.random() * Math.PI * 2;
	}

	geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
	geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	geom.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

	const mat = new THREE.ShaderMaterial({
		vertexShader: `
			attribute float size;
			attribute float phase;
			varying vec3 vColor;
			uniform float uTime;
			uniform float uTwinkle;
			void main(){
				vColor = color;
				vec4 mv = modelViewMatrix * vec4(position, 1.0);
				float tw = 1.0 + uTwinkle * sin(uTime + phase);
				gl_PointSize = size * tw * (300.0 / -mv.z);
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			varying vec3 vColor;
			void main(){
				vec2 p = gl_PointCoord * 2.0 - 1.0;
				float d = dot(p,p);
				float a = smoothstep(1.0, 0.0, d);
				gl_FragColor = vec4(vColor, a);
			}
		`,
		transparent: true,
		depthWrite: false,
		vertexColors: true,
		uniforms: {
			uTime: { value: 0 },
			uTwinkle: { value: twinkle }
		}
	});

	const points = new THREE.Points(geom, mat);
	points.frustumCulled = false;
	points.renderOrder = -10;

	return {
		object: points,
		update(dt, elapsed) {
			mat.uniforms.uTime.value = elapsed;
			mat.uniforms.uTwinkle.value = twinkle;
		}
	};
}
