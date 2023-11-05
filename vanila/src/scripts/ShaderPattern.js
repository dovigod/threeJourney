import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import vertexShader from '../glsl/pattern/vertex/2.glsl'

//frag
import fragmentShader from '../glsl/pattern/fragment/30.glsl'
/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};
let time = 0;
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

    const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent : true,
        side: THREE.DoubleSide,
        uniforms : {
            uFrequency : {
                value :10.0
            },
            uTime : {
                value : time
            }
        }
    });

    const geometry = new THREE.PlaneBufferGeometry(1,1,32,32);

    const plane = new THREE.Mesh(geometry,material);

    scene.add(plane);


    
 
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


    const clock = new THREE.Clock();

	//Animation
	const animate = () => {

        const elapsedTime = clock.getElapsedTime();
        material.uniforms.uFrequency.value = elapsedTime * 50.0;
        time = elapsedTime;
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;
