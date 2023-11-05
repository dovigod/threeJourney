import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import CANNON from 'cannon';

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

	generateObjects(scene, gui);

	//light
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	const pointLight = new THREE.PointLight(0xffffff, 0.5);
	pointLight.position.set(1, 4, 0);
	pointLight.castShadow = true;
	pointLight.shadow.mapSize.width = 1024;
	pointLight.shadow.mapSize.height = 1024;
	pointLight.shadow.camera.fov = 50;
	pointLight.shadow.camera.near = 0.1;
	pointLight.shadow.camera.far = 10;

	const pointLightHelper = new THREE.CameraHelper(pointLight.shadow.camera);
	scene.add(ambientLight, pointLight, pointLightHelper);
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

	//physics

	const world = createPhysics();
	/**
	 * Renderer
	 */

	const renderer = new THREE.WebGLRenderer({
		canvas: canvas
	});
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio = Math.min(2, window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

	const clock = new THREE.Clock();
	let currentTime = 0;

	const sphere = scene.children[0];
	const sphereBody = world.bodies[0];

	//Animation
	const animate = () => {
		const elapsedTime = clock.getElapsedTime();

		const deltaTime = elapsedTime - currentTime;
		currentTime = elapsedTime;

		//update phsics world , fixed time step , how much time passedsince the last step , how mush iterations the world can apply to catch up with potential delay
		world.step(1 / 60, deltaTime, 3);
		//60 fps
		sphere.position.copy(sphereBody.position);
		// sphere.position.x = sphereBody.position.x;
		// sphere.position.y = sphereBody.position.y;
		// sphere.position.z = sphereBody.position.z;

		makeWind(sphereBody);

		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;

const generateObjects = (scene, gui) => {
	const material = new THREE.MeshStandardMaterial();
	material.roughness = 0.1;
	material.metalness = 0.4;
	const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 32, 32), material);
	const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10, 10), material);
	plane.rotation.x = -Math.PI * 0.5;
	plane.side = THREE.DoubleSide;

	sphere.castShadow = true;
	plane.receiveShadow = true;

	setPosition(sphere, 0, 0, 0);

	scene.add(sphere, plane);

	gui.add(material, 'roughness', 0, 1, 0.01);
	gui.add(material, 'metalness', 0, 1, 0.01);
};

const setPosition = (mesh, x, y, z) => {
	mesh.position.set(x, y, z);
};

//physics
//1. create physics world
//each frame , update phtsics world , apply to real world

//duplicate objects to phtsics world, each frame update it , put them back to real world
// you may use 2d library if u want , when physics only happen on 2d
// ammo.js , cannon , oimo
//2d , matter.js , p2 , planck , box2d

const createPhysics = () => {
	const world = createPhysicsWorld();
	const [concreteMaterial, plasticMaterial, concretePlasticContactMaterial] = createMaterial();
	const sphere = createSphere(plasticMaterial);
	const floor = createPlane(concreteMaterial);

	world.defaultContactMaterial = concretePlasticContactMaterial;
	// world.addContactMaterial(concretePlasticContactMaterial);
	world.addBody(sphere);
	world.addBody(floor);

	return world;
};

const createPhysicsWorld = () => {
	const world = new CANNON.World();
	world.gravity.set(0, -9.82, 0); // vec3 class
	return world;
};

const createSphere = (material) => {
	//create shape , ..box , cylinder plane , phere etc..active
	const sphereShape = new CANNON.Sphere(0.5); // same as buffer geometry
	const sphereBody = new CANNON.Body({
		mass: 1,
		position: new CANNON.Vec3(0, 3, 0),
		shape: sphereShape,
		material: material
	});

	applyLocalForceToSphere(sphereBody);
	return sphereBody;
};

const createPlane = (material) => {
	const floorShape = new CANNON.Plane();
	const floorBody = new CANNON.Body();
	floorBody.mass = 0;
	floorBody.addShape(floorShape);
	floorBody.material = material;
	// 하나의 바디가 여러 shape를 가질수 있음 ,예를들어 구, , 플레인의 조합 이런식으로
	//컵을 예시로 , 실린더 + 플레인 ,,,,

	//rotation , cannon only support quaternion
	floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
	//첫번째 인자로 꼬챙이 삼아 꽂고 회전

	return floorBody;
};

const createMaterial = () => {
	const defaultMaterial = new CANNON.Material('concrete');
	const plasticMaterial = new CANNON.Material('plastic');

	//create Contact MAterial , which will define what happens when collide

	const concretePlasticContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
		friction: 0.1,
		restitution: 0.7
	});

	return [defaultMaterial, defaultMaterial, concretePlasticContactMaterial];
};

//force
// applyForce = apply a force from a specified point in space , not nessesary on the bodt surface , like the wind, small push on domino , or strong force
// apply impulse , not like apply force , add to velocity

//apply local force , same as apply force , but coorduinates are local to the body 0, 0, 0 center
//apply local impulse

const applyLocalForceToSphere = (sphereBody) => {
	// force type , forcing point
	sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0));
};

const makeWind = (sphereBody) => {
	sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position);
};
