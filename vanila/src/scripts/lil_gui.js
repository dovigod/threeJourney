import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import gsap from 'gsap';

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

const init = () => {
	//debug pannel
	const gui = new lil.GUI({ width: 400 });
	const parameters = {
		color: 0xff0000,
		spin: () => {
			gsap.to(mesh.rotation, { y: mesh.rotation.y + Math.PI * 4, duration: 1 });
		}
	};

	window.addEventListener('keydown', (e) => {
		if (e.key === 'h') {
			if (gui._hidden) {
				gui.show();
			} else {
				gui.hide();
			}
		}
	});

	// Canvas
	const canvas = document.getElementsByClassName('webgl')[0];

	// Scene
	const scene = new THREE.Scene();

	/**
	 * Objects
	 */

	const geometry = new THREE.BoxGeometry(1, 1, 1);
	const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	//axisHelper

	const AxisHelper = new THREE.AxesHelper();
	scene.add(AxisHelper);

	//debug
	//gui only avail on object ,1 : object , 2: tweak target
	gui.add(mesh.position, 'y', -3, 3, 0.01);
	gui.add(mesh.position, 'x').min(-3).max(3).step(0.01).name('x-trans');
	gui.add(mesh.position, 'z', -3, 3, 0.01);
	gui.add(mesh, 'visible');
	gui.add(material, 'wireframe');
	gui.addColor(parameters, 'color').onChange(() => {
		material.color.set(parameters.color);
	});
	gui.add(parameters, 'spin');

	/**
	 * Camera
	 */
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	camera.position.set(0.5, 0.5, 3);
	camera.lookAt(mesh.position);
	scene.add(camera);

	//controls

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;

	/**
	 * Renderer
	 */

	const renderer = new THREE.WebGLRenderer({
		canvas: canvas
	});
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio = Math.min(2, window.devicePixelRatio);

	//resize & fullscreen

	const handleResize = (e) => {
		sizes.width = window.innerWidth;
		sizes.height = window.innerHeight;

		camera.aspect = sizes.width / sizes.height;
		camera.updateProjectionMatrix();

		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio = Math.min(2, window.devicePixelRatio);
	};

	window.addEventListener('resize', handleResize);

	const requestFullScreen = () => {
		const fullscreenElement = window.fullscreenElement | window.webkitFullscreenElement;

		if (!fullscreenElement) {
			if (canvas.requestFullscreen) {
				canvas.requestFullscreen();
			} else if (canvas.webkitRequestFullscreen) {
				canvas.webkitRequestFullscreen();
			}
		} else {
			if (canvas.exitFullscreen) {
				canvas.exitFullscreen();
			} else if (canvas.webkitExitFullscreen) {
				canvas.webkitExitFullscreen();
			}
		}
	};

	window.addEventListener('dblclick', requestFullScreen);

	//Animation
	const animate = () => {
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;
