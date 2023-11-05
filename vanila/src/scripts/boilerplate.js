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

	generateObjects(scene,gui)

    
    //light
    const ambientLight = new THREE.AmbientLight(0xffffff , 0.5);
    const pointLight = new THREE.PointLight(0xffffff , 0.5);

    pointLight.position.set(2,3,4);
    scene.add(ambientLight,pointLight)
	/**
	 * Camera
	 */
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	camera.position.set(0.5, 0.5, 3);
	camera.lookAt(new THREE.Vector3(0,0,0));
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

    const clock = new THREE.Clock();
    console.dir(scene)
	//Animation
	const animate = () => {

        const elapsedTime = clock.getElapsedTime();
        scene.children[0].rotation.x = elapsedTime
        scene.children[0].rotation.y = elapsedTime * 0.5

        scene.children[1].rotation.x = elapsedTime
        scene.children[1].rotation.y = elapsedTime * 0.5

        scene.children[2].rotation.x = elapsedTime
        scene.children[2].rotation.y = elapsedTime * 0.5
    
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;

const generateObjects = (scene , gui) => {
    const material = new THREE.MeshStandardMaterial()
    material.roughness = 0.1;
    material.metalness = 0;
    const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 32 ,32) , material);
    const torus = new THREE.Mesh(new THREE.TorusBufferGeometry(0.3,0.2,32,64) , material);
    const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(0.75,0.75,0.75) , material);
    const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(5,5,5) ,material);
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.65;
    plane.side = THREE.DoubleSide;


    setPosition(cube,-1.5,0,0);
    setPosition(sphere,0,0,0);
    setPosition(torus,1.5,0,0);
    scene.add(sphere,torus,cube,plane);
}

const setPosition = (mesh , x,y,z)=> {
    mesh.position.set(x,y,z);
}

//light