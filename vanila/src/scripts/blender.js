import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

const init = () => {
	//debug pannel
	const gui = new lil.GUI();

	// Canvas
	const canvas = document.getElementsByClassName('webgl')[0];

	// Scene
	const scene = new THREE.Scene();

	/**
	 * Objects
	 */

	const floor = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(10, 10, 10),
		new THREE.MeshStandardMaterial({
			side: THREE.DoubleSide,
			roughness: 0.5,
			metalness: 0,
			color: '#444444'
		})
	);
	floor.rotation.x = -Math.PI * 0.5;
	scene.add(floor);

	//models

	
	//light
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	const pointLight = new THREE.PointLight(0xffffff, 0.5);

	pointLight.position.set(2, 3, 4);
	scene.add(ambientLight, pointLight);
	/**
	 * Camera
	 */
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	camera.position.set(0.5, 0.5, 3);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
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

	const clock = new THREE.Clock();
	let currentTime = 0;
	//Animation
	const animate = () => {
		const elapsedTime = clock.getElapsedTime();
		const deltaTime = elapsedTime - currentTime;
	

		currentTime = elapsedTime;
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;
