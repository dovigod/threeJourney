import * as THREE from 'three';
import gsap from 'gsap';

const init = () => {
	// Canvas
	const canvas = document.getElementsByClassName('webgl')[0];

	// Scene
	const scene = new THREE.Scene();

	/**
	 * Objects
	 */

	const cubeConfig = {
		color: 0xff0000,
		width: 1,
		height: 1,
		depth: 1
	};
	const { color, position } = cubeConfig;

	const material = new THREE.MeshBasicMaterial({ color });
	const geometry = new THREE.BoxGeometry(cubeConfig.width, cubeConfig.height, cubeConfig.depth);
	const mesh = new THREE.Mesh(geometry, material);
	console.dir(mesh);
	scene.add(mesh);

	//axisHelper

	const AxisHelper = new THREE.AxesHelper();
	scene.add(AxisHelper);

	/**
	 * Sizes
	 */
	const sizes = {
		width: 800,
		height: 600
	};

	/**
	 * Camera
	 */
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	camera.position.set(0.5, 0.5, 3);
	camera.lookAt(mesh.position);
	scene.add(camera);

	/**
	 * Renderer
	 */

	const renderer = new THREE.WebGLRenderer({
		canvas: canvas
	});
	renderer.setSize(sizes.width, sizes.height);

	// let time = Date.now();
	// const clock = new THREE.Clock();
	//Animation

	gsap.to(mesh.position, { delay: 1, duration: 1, x: 2 });
	const animate = () => {
		//Time
		//by vanilla
		// const currentTime = Date.now();
		// const deltaTime = currentTime - time;
		// time = currentTime;

		// const elapsedTime = clock.getElapsedTime();

		//update

		// mesh.position.y = Math.sin(elapsedTime);
		// mesh.position.x = Math.cos(elapsedTime);
		// camera.lookAt(mesh.position);

		//render
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;
