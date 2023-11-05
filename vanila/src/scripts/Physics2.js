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

//sound
const hitSound = new Audio('/sounds/hit.mp3');

const playHitSound = (collision) => {
	console.dir(collision);
	const impactStrength = collision.contact.getImpactVelocityAlongNormal();

	if (impactStrength > 1.5) {
		hitSound.volume = Math.random();
		hitSound.currentTime = 0;
		hitSound.play();
	}
};
const cubeMapLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeMapLoader.load([
	'/environmentMaps/2/px.jpg',
	'/environmentMaps/2/nx.jpg',
	'/environmentMaps/2/py.jpg',
	'/environmentMaps/2/ny.jpg',
	'/environmentMaps/2/pz.jpg',
	'/environmentMaps/2/nz.jpg'
]);
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
	const material = new THREE.MeshStandardMaterial();
	material.roughness = 0.1;
	material.metalness = 0.4;

	const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10, 10), material);
	plane.rotation.x = -Math.PI * 0.5;
	plane.side = THREE.DoubleSide;

	plane.receiveShadow = true;

	scene.add(plane);

	gui.add(material, 'roughness', 0, 1, 0.01);
	gui.add(material, 'metalness', 0, 1, 0.01);

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

	const world = new CANNON.World();
	world.broadphase = new CANNON.SAPBroadphase(world);
	world.allowSleep = true;
	// world.sleepSpeedLimit , sleep TimeLimit
	const [concreteMaterial, plasticMaterial, concretePlasticContactMaterial] = createMaterial();
	const floor = createPlane(concreteMaterial);

	world.gravity.set(0, -9.82, 0); // vec3 class
	world.defaultContactMaterial = concretePlasticContactMaterial;
	// world.addContactMaterial(concretePlasticContactMaterial);
	world.addBody(floor);

	const [defaultMaterial, defaultContactMaterial] = createMaterial();
	//utils

	const objectsToUpdate = [];
	const sphereMaterial = new THREE.MeshStandardMaterial({
		metalness: 0.3,
		roughness: 0.4,
		envMap: environmentMapTexture
	});

	const sphereGeometry = new THREE.SphereBufferGeometry(0.5, 20, 20);
	const createSphere = (radius, position) => {
		const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

		//****** very usefuk */

		mesh.scale.set(radius, radius, radius);
		mesh.castShadow = true;
		mesh.position.copy(position);
		scene.add(mesh);

		const shape = new CANNON.Sphere(radius);
		const body = new CANNON.Body({
			mass: 1,
			position: new CANNON.Vec3(0, 3, 0),
			shape,
			material: defaultMaterial
		});
		body.position.copy(position);
		world.add(body);

		objectsToUpdate.push({
			mesh,
			body
		});
	};

	const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
	const boxMaterial = new THREE.MeshStandardMaterial({
		metalness: 0.5,
		roughness: 0.3,
		envMap: environmentMapTexture
	});

	const createBox = (size, position) => {
		const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
		mesh.castShadow = true;
		mesh.scale.set(size.width, size.height, size.depth);
		scene.add(mesh);

		const shape = new CANNON.Box(new CANNON.Vec3(size.width * 0.5, size.height * 0.5, size.depth * 0.5));
		const body = new CANNON.Body({
			mass: 1,
			position: new CANNON.Vec3(0, 3, 0),
			shape,
			material: defaultMaterial
		});
		body.position.copy(position);
		body.addEventListener('collide', playHitSound);
		world.add(body);
		objectsToUpdate.push({
			mesh,
			body
		});
	};

	const debugObject = {
		createSphere: () =>
			createSphere(Math.random(), {
				x: (Math.random() - 0.5) * 5,
				y: 3,
				z: (Math.random() - 0.5) * 5
			}),
		createBox: () => {
			createBox(
				{
					width: Math.random(),
					height: Math.random(),
					depth: Math.random()
				},
				{
					x: (Math.random() - 0.5) * 5,
					y: 3,
					z: (Math.random() - 0.5) * 5
				}
			);
		},
		reset: () => {
			for (const object of objectsToUpdate) {
				//remove
				object.body.removeEventListener('collide', playHitSound);
				world.removeBody(object.body);

				//remove mesh
				scene.remove(object.mesh);
			}
			// empty arrays
			objectsToUpdate.splice(0, objectsToUpdate.length);
		}
	};

	createSphere(0.5, { x: 0, y: 3, z: 0 });
	// createSphere(0.5, { x: 2, y: 3, z: 0 });
	// createSphere(0.5, { x: 0, y: 3, z: 1 });
	gui.add(debugObject, 'createSphere');
	gui.add(debugObject, 'createBox');
	gui.add(debugObject, 'reset');
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

	const clock = new THREE.Clock();
	let currentTime = 0;

	//Animation
	const animate = () => {
		const elapsedTime = clock.getElapsedTime();

		const deltaTime = elapsedTime - currentTime;
		currentTime = elapsedTime;

		world.step(1 / 60, deltaTime, 3);

		for (const object of objectsToUpdate) {
			object.mesh.position.copy(object.body.position);
			object.mesh.quaternion.copy(object.body.quaternion);
		}

		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;

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

	const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
		friction: 0.1,
		restitution: 0.7
	});

	return [defaultMaterial, defaultMaterial, defaultContactMaterial];
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

///cannon on cpu..

//when testing colllision, cannon test every body against every other body , fucked performance
//even if objects are to far, cannon test.. -> bradphse!!

//default naive broadphase ,
// grid broadphase , -> dived scene in a grid every axis , when testing one object , this object willbe tested on every object in cell , problen , if object is traveling too fast , it will not collide... because it pass cell twice more ,
//sweep and prune , SAPBroadphase , (better) , test bodies on arbitary axis during multiples steps

//event appling broadcast , there are sleeping objects that doesnt move.
//when velocity gets really slow , body fall asleep
//very effective , performance improved dramatically

//event  , sleep colide wakeup

//constraints ,
// hingeConstraint - acts like a door hinge
// distance constraint , forces the bodies to keep a distance ,keep distance betwwen

//lock constraints , merge bodies like if they were on piece
//pint to point constraint , glue the bodies to a specific point

// use workers , cuz its on cpu

//cannon -es , -> updated

//ammo.js , webassembly support , most better performances
// more poplura ,portage of bullet , c++ engine

//phtsi.js support workker natively , better ui
