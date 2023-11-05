import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Sizes of renderer
 */
const sizes = {
	width: 800,
	height: 600
};

//cursor

const cursor = {
	x: undefined,
	y: undefined
};
const handleMousemovement = (e) => {
	cursor.x = e.clientX / sizes.width - 0.5;
	cursor.y = -(e.clientY / sizes.height - 0.5);
};

window.addEventListener('mousemove', handleMousemovement);

const init = () => {
	// Canvas
	const canvas = document.getElementsByClassName('webgl')[0];

	// Scene
	const scene = new THREE.Scene();

	/**
	 * Objects
	 */

	const group = new THREE.Group();

	const cubeConfig = {
		color: 0xff0000,
		width: 1,
		height: 1,
		depth: 1
	};
	const { color } = cubeConfig;

	const material = new THREE.MeshBasicMaterial({ color });
	const geometry = new THREE.BoxGeometry(cubeConfig.width, cubeConfig.height, cubeConfig.depth);
	const mesh = new THREE.Mesh(geometry, material);

	group.add(mesh);

	scene.add(group);

	//axisHelper

	const AxisHelper = new THREE.AxesHelper();
	group.add(AxisHelper);

	/**
	 * Camera
	 */

	const perspectiveCameraConfig = {
		fov: 75,
		ratio: sizes.width / sizes.height,
		near: 0.1,
		far: 100
	};
	const orthographicCameraConfig = {
		left: -1,
		right: 1,
		top: 1,
		bottom: -1,
		near: 0.1,
		far: 100
	};

	const camera = createPerspectiveCam(mesh, perspectiveCameraConfig);
	// const camera = createOrthgraphicCamera(mesh, orthographicCameraConfig);
	scene.add(camera);

	//controls

	const controls = new OrbitControls(camera, canvas);
	//damping :: 관성 같은것
	controls.enableDamping = true;
	//후에 update를 animate 안에서 실행 필수
	/**
	 * Renderer
	 */

	const renderer = new THREE.WebGLRenderer({
		canvas: canvas
	});
	renderer.setSize(sizes.width, sizes.height);

	const clock = new THREE.Clock();

	const animate = () => {
		//update : custom  controller
		// camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
		// camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
		// camera.position.y = cursor.y * 3;
		// camera.lookAt(new THREE.Vector3(0, 0, 0));

		//orbit control
		controls.update();

		//render
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;

//Array camera 감시카메라 같은 느낌, 한 scene에 여러 renderer 스크린 스플릿
//stereo camera 두 눈처럼 2개의 렌더러 눈을 미믹한다 생각하자 , vr 에 유용
// cube camera => 6개의 renderer enviorment map만들때 유용
// orthographic camera = perspective 없이 렌더링

const createPerspectiveCam = (mesh, config) => {
	//vertical vision angle
	//45~75 is recommended
	//aspect ration , width of renderer
	//near , far -> extreme하게 쓰면 z fighting 일어남
	//
	const camera = new THREE.PerspectiveCamera(config.fov, config.ratio, config.near, config.far);

	camera.position.z = 3;

	camera.lookAt(mesh.position);

	return camera;
};

const createOrthgraphicCamera = (mesh, config) => {
	const aspectRatio = sizes.width / sizes.height;
	// 렌더러 사이즈 줄이면 큐브가 짜부되니까, 시점비에 맞춰서 연장
	const camera = new THREE.OrthographicCamera(
		config.left * aspectRatio,
		config.right * aspectRatio,
		config.top,
		config.bottom,
		config.near,
		config.far
	);

	camera.position.x = 2;
	camera.position.y = 2;
	camera.position.z = 2;

	camera.lookAt(mesh.position);

	return camera;
};

// flycontrol :: https://threejs.org/docs/#examples/en/controls/FlyControls
