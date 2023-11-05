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
	const canvas = document.getElementsByClassName('webgl')[0];

	// Scene
	const scene = new THREE.Scene();

	/**
	 * Objects
	 */

	const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
	const geometry = createBunchofTriangle();
	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	//axisHelper

	const AxisHelper = new THREE.AxesHelper();
	scene.add(AxisHelper);

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

// vertices -> position , uv , normal , ... colors...etc
// all inherit from bufferGeometry

const createBoxGeometry = () => {
	// w , h ,d ,width seg , hieght seg ,depth seg
	//seg == subdivision in x,y,z- axis
	// 1 seg = 2 , 2seg = 8 cuz 1 face is conposed of 2 tri
	const width = 1;
	const height = 1;
	const depth = 1;
	const wSeg = 4;
	const hSeg = 4;
	const dSeg = 4;
	const geometry = new THREE.BoxBufferGeometry(width, height, depth, wSeg, hSeg, dSeg);
	return geometry;
};

const createCustomGeometry = () => {
	const geometry = new THREE.BufferGeometry();
	// store data with float32Array , typed array , fixed length , easy for computer to handle
	const positionsArray = new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 0]);
	//first vertex
	positionsArray[0] = 0;
	positionsArray[1] = 0;
	positionsArray[2] = 0;

	//second vertex
	positionsArray[3] = 0;
	positionsArray[4] = 1;
	positionsArray[5] = 0;

	//third vertex
	positionsArray[6] = 1;
	positionsArray[7] = 0;
	positionsArray[8] = 0;

	//now convert to bufferAttribut

	const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3); // 1vertex contain 3value
	geometry.setAttribute('position', positionsAttribute); // information that will be used inside the shader

	return geometry;
};

const createBunchofTriangle = () => {
	const geometry = new THREE.BufferGeometry();
	const count = 50;
	const positionsArray = new Float32Array(3 * count * 3);

	for (let i = 0; i < count * 3 * 3; i++) {
		positionsArray[i] = Math.random() - 0.5;
	}
	const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
	geometry.setAttribute('position', positionsAttribute);
	return geometry;

	//optimalization
	// 공통 vertice 쓰는 faces 같은 경우, 해당 정점을 기억해서 재활용가능 , 근데 헬일듯
	//https://threejs.org/docs/#api/en/core/BufferGeometry
};
