import '../../loading.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

/**
 * Loaders
 */

/**
 * Base
 */
// Debug
let sceneReady = false;
const loadingBar = document.querySelector('.loading-bar');
const init = () => {
	const loadingManager = new THREE.LoadingManager(
		() => {
			gsap.delayedCall(0.5, () => {
				gsap.to(overlayMaterial.uniforms.uAlpha, {
					value: 0,
					duration: 3
				});

				loadingBar.classList.add('ended');
				loadingBar.style.transform = ''; //js is stronger than css
			});
			// window.setTimeout(() => {
			// 	gsap.to(overlayMaterial.uniforms.uAlpha, {
			// 		value: 0,
			// 		duration: 3
			// 	});
			// 	loadingBar.classList.add('ended');
			// 	loadingBar.style.transform = ''; //js is stronger than css
			// }, 500);
			window.setTimeout(() => {
				sceneReady = true;
			}, 3000);
		},
		//progress : url of asset , how much assets were loaded , total numb of assets to load
		(itemUrl, itemLoaded, itemTotal) => {
			const ratio = itemLoaded / itemTotal;
			loadingBar.style.transform = `scaleX(${ratio})`;
		}
	);
	const gltfLoader = new GLTFLoader(loadingManager);
	const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

	const debugObject = {};

	// Canvas
	const canvas = document.querySelector('canvas.webgl');

	// Scene
	const scene = new THREE.Scene();

	//overlay
	const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
	const overlayMaterial = new THREE.ShaderMaterial({
		precision: 'lowp',
		transparent: true,
		uniforms: {
			uAlpha: { value: 1 }
		},
		vertexShader: `
            void main(){
                gl_Position = vec4(position ,1.0);
            }
        `,
		fragmentShader: `
            uniform float uAlpha;
            void main(){
                gl_FragColor = vec4(0.0 , 0.0 ,0.0 , uAlpha);
            }
        `
	});

	const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
	scene.add(overlay);

	/**
	 * Update all materials
	 */
	const updateAllMaterials = () => {
		scene.traverse((child) => {
			if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
				// child.material.envMap = environmentMap
				child.material.envMapIntensity = debugObject.envMapIntensity;
				child.material.needsUpdate = true;
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	};

	/**
	 * Environment map
	 */
	const environmentMap = cubeTextureLoader.load([
		'/environmentMaps/0/px.jpg',
		'/environmentMaps/0/nx.jpg',
		'/environmentMaps/0/py.jpg',
		'/environmentMaps/0/ny.jpg',
		'/environmentMaps/0/pz.jpg',
		'/environmentMaps/0/nz.jpg'
	]);

	environmentMap.encoding = THREE.sRGBEncoding;

	scene.background = environmentMap;
	scene.environment = environmentMap;

	debugObject.envMapIntensity = 2.5;

	/**
	 * Models
	 */
	gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
		gltf.scene.scale.set(10, 10, 10);
		gltf.scene.position.set(0, -4, 0);
		gltf.scene.rotation.y = Math.PI * 0.5;
		scene.add(gltf.scene);

		updateAllMaterials();
	});

	//Points of interest
	const raycaster = new THREE.Raycaster();
	const points = [
		{
			position: new THREE.Vector3(1.55, 0.3, -0.6),
			element: document.querySelector('.point-0')
		},
		{
			position: new THREE.Vector3(0.5, 0.8, -1.6),
			element: document.querySelector('.point-1')
		},
		{
			position: new THREE.Vector3(1.6, -1.3, -0.7),
			element: document.querySelector('.point-2')
		}
	];

	/**
	 * Lights
	 */
	const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
	directionalLight.castShadow = true;
	directionalLight.shadow.camera.far = 15;
	directionalLight.shadow.mapSize.set(1024, 1024);
	directionalLight.shadow.normalBias = 0.05;
	directionalLight.position.set(0.25, 3, -2.25);
	scene.add(directionalLight);

	/**
	 * Sizes
	 */
	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight
	};

	window.addEventListener('resize', () => {
		// Update sizes
		sizes.width = window.innerWidth;
		sizes.height = window.innerHeight;

		// Update camera
		camera.aspect = sizes.width / sizes.height;
		camera.updateProjectionMatrix();

		// Update renderer
		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	});

	/**
	 * Camera
	 */
	// Base camera
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
	camera.position.set(4, 1, -4);
	scene.add(camera);

	// Controls
	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;

	/**
	 * Renderer
	 */
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias: true
	});
	renderer.physicallyCorrectLights = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = 3;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	/**
	 * Animate
	 */
	const tick = () => {
		if (sceneReady) {
			// Update controls
			controls.update();

			//to do the magin make 3d coord to 2d
			for (const point of points) {
				const screenPosition = point.position.clone();
				screenPosition.project(camera);
				raycaster.setFromCamera(screenPosition, camera);
				//will auto select vec2 property
				const intersects = raycaster.intersectObjects(scene.children, true); // to check childrens recursive
				if (intersects.length === 0) {
					point.element.classList.add('visible');
				} else {
					const intersectionDistance = intersects[0].distance;
					const pointDistance = point.position.distanceTo(camera.position);

					if (intersectionDistance < pointDistance) {
						point.element.classList.remove('visible');
					} else {
						point.element.classList.add('visible');
					}
				}

				// console.log(screenPosition);
				const translateX = screenPosition.x * sizes.width * 0.5;
				const translateY = -screenPosition.y * sizes.height * 0.5;
				point.element.style.transform = `translate(${translateX}px , ${translateY}px)`;
			}
		}

		// Render
		renderer.render(scene, camera);

		// Call tick again on the next frame
		window.requestAnimationFrame(tick);
	};
	tick();
};
export default init;

//!! note mixing html & webgl is bad for performnace
