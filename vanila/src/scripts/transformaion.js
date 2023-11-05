import * as THREE from 'three';

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
	group.position.y = 3;
	group.rotation.y = Math.PI * 1.3;

	const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
	const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));

	cube2.position.x = -2;
	const cube3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x0000ff }));

	cube3.position.x = 2;

	group.add(cube1);
	group.add(cube2);
	group.add(cube3);

	// const geometry = new THREE.BoxGeometry(1, 1, 1);
	// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	// const mesh = new THREE.Mesh(geometry, material);
	// mesh.position.z = 1;
	// mesh.position.x = 0.3;
	// mesh.position.y = -0.6;
	// mesh.position.set(-0.3, -0.5, -0.3);
	// mesh.scale.set(0.5, 2, 1);
	// mesh.rotation.y = Math.PI * 2.2;
	// mesh.rotation.x = Math.PI * 1;

	// mesh.rotation.reorder('YXZ');
	// scene.add(mesh);

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
	camera.position.set(-0.3, 0, 4); // so fucking shittttt!!!!
	camera.lookAt(cube1.position);
	scene.add(camera);

	/**
	 * Renderer
	 */
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas
	});
	renderer.setSize(sizes.width, sizes.height);
	renderer.render(scene, camera);
};

export default init;
