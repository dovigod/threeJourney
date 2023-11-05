import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

const init = () => {
	// Canvas
	const canvas = document.querySelector('canvas.webgl');

	// Scene
	const scene = new THREE.Scene();

	/**
	 * Objects
	 */

	const group = new THREE.Group();
	scene.add(group);
	group.position.y = 0.5;
	group.rotation.y = Math.PI * 1.3;

	const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));

	group.add(cube1);

	//axisHelper

	const AxisHelper = new THREE.AxesHelper();
	group.add(AxisHelper);

	/**
	 * Camera
	 */
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
	camera.position.set(3, 3, 3);
	camera.lookAt(cube1.position);
	scene.add(camera);

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	/**
	 * Renderer
	 */
	const handleThreeResize = (e) => {
		sizes.width = window.innerWidth;
		sizes.height = window.innerHeight;
		//update camera
		camera.aspect = sizes.width / sizes.height;
		//when update aspect , need to notice projection matrix
		camera.updateProjectionMatrix();

		//update renderer
		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		//handle blurry pixel by pixel ratio
	};
	const handleFullscreen = (e) => {
		const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

		if (!fullscreenElement) {
			if (canvas.requestFullscreen) {
				canvas.requestFullscreen();
			} else if (canvas.webkitRequestFullscreen) {
				canvas.webkitRequestFullscreen();
			}
			//handle for safari
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
	};
	window.addEventListener('resize', handleThreeResize);
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas
	});

	window.addEventListener('dblclick', handleFullscreen);
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	const animate = () => {
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;
