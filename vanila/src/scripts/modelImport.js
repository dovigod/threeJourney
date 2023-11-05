import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Mesh, Object3D, PerspectiveCamera } from 'three';

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
	let mixer = null;
	const dracoLoader = createDRACOLoader();
	const gltfLoader = createGLTFLoader(); //can use loading manager if u need

	conectGltfAndDraco(gltfLoader, dracoLoader);

	// gltfLoader.load('/models/Duck/glTF/Duck.gltf', (gltf) => {
	// 	console.dir(gltf);
	// 	addGLTFModelToScene(scene, gltf);
	// });

	// gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
	// 	addGLTFModelToScene(scene, gltf);
	// });

	// gltfLoader.load('/models/Duck/glTF-Draco/Duck.gltf', (gltf) => {
	// 	console.dir(gltf);
	// 	addGLTFModelToScene(scene, gltf);
	// });
	gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) => {
		mixer = new THREE.AnimationMixer(gltf.scene);
		const action = mixer.clipAction(gltf.animations[0]);
		action.play();

		addGLTFModelToScene(scene, gltf, true);
	});

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
		//update mixer
		if (mixer) {
			mixer.update(deltaTime);
		}

		currentTime = elapsedTime;
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;

//Format
/*
fucking many...
diffent criteria
dedicated to one software
very light but might lack specific data
almost all data but heavy
open source
not open 
binary
ascii

popular
OBJ
FBX
STL
PLY
COLLADA
#DS
GLTF -- becoming standard..


GLTF - GL Transimission Format
1.supports different sets of data like geometries , material , camera , light , scene graph , anumation , skeletons , morphing , etc
2.various formats like , json , binary , embed textures


-gltf
.gltf = JSON that contains cameras, lights ,scenes, ..tec ,but no geometries nor textures
.bin = binary that usually contains data like geomtries , uv coordinates ,normals , colors , etc.. == geometry
.png = texture of model

when load gltf , automatically loads other 2, on buffers , images

-gltf-binary-
only one files ,
contains all data upper one , usually more lighter , easier to load becuz only one file , hard to alter its data...= cons

-gltf- draco
like gltf , but mush lighter , -> buffer data r compressed(draco algorithm)

-gltf- embedded-
one file , that can read , JSON
-heavier-


pbr = phisically base rendering

 */

const createGLTFLoader = () => {
	const loader = new GLTFLoader();

	return loader;
};

//ways to add to scene
/*
1. add whole scene in out scene,
2.add children of scene to our scene and ignore perpective cam
3. filter children before adding to scene
4. addd only mesh and end up with a duck with wrong scale , position and rotation
 */

const addGLTFModelToScene = (scene, gltf, fox) => {
	console.dir([...gltf.scene.children]);

	if (fox) {
		// gltf.scene.scale.set(0.025, 0.025, 0.025);

		const mesh = gltf.scene.children.filter((child) => !(child instanceof PerspectiveCamera));
		mesh[0].scale.set(0.025, 0.025, 0.025);
		scene.add(...mesh);
	} else {
		const mesh = gltf.scene.children.filter((child) => !(child instanceof PerspectiveCamera));
		scene.add(...mesh);
	}

	// for(const child of gltf.scene.children){
	//     scene.add(child)
	// } -> scene간 이동시 children 삭제되어서 while을쓰자
	// while(gltf.scene.children.length){
	//     scene.add(gltf.scene.children[0])
	// }
};

//for draco(made by google, open source),  need to get draco Loader for it, it works on buffer data , geometry
// it also avails in web assembly , and it can run in a worker ,
//ex ) three/examples/js/libs

const createDRACOLoader = () => {
	return new DRACOLoader();
};

const conectGltfAndDraco = (gltfLoader, dracoLoader, fox) => {
	//avails drackloader much faster with worker and webassembly
	dracoLoader.setDecoderPath('/draco/');
	gltfLoader.setDRACOLoader(dracoLoader);

	//draco loader will only be used when its used, if not used, draco directory not accessed
	// large geometry , use it else dont

	//when loading , draco takes time , and resource..
};

//animation

//animation clip!!

const createMixer = (gltf) => {
	const mixer = new THREE.AnimationMixer(gltf.scene);
	const action = mixer.clipAction(gltf.animations[0]);

	//upadte mixer each frame

	action.play();
};
