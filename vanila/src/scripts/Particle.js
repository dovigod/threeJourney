import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import { getUnit } from 'gsap';

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

//texture

const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/particles/2.png');

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

     const particleGeometry = new THREE.BufferGeometry();
     const particleMaterial = new THREE.PointsMaterial({
         size : 0.02,
         sizeAttenuation : true,
         alphaMap : particleTexture,
         transparent : true,
     });
     //edges hide backside particle

    //  particleMaterial.alphaTest = 0.001;
     //tell gpu not to render pixel according to that pixel;s transparency , default = 0


    //  particleMaterial.depthTest = false;
     //just draw, do not test whether it is front or back
     //but may cause bugs, if other objects have different color

     const cube = new THREE.Mesh(
         new THREE.BoxBufferGeometry(1,1,1),
         new THREE.MeshBasicMaterial()
     )
     scene.add(cube)
     // this code , shows that particles behind cube will drawn
     //the depth drawn is stored in depth buffer
     particleMaterial.depthWrite = false

     //blending
     particleMaterial.blending = THREE.AdditiveBlending;
     //   뒤에 꺼랑 색상 합해짐
     particleMaterial.color = new THREE.Color('#f345e5');
     //base color affects vertexcolor
     particleMaterial.vertexColors = true;


     const count = 50000;

     const positions = new Float32Array(count * 3);
     const colors =new Float32Array(count * 3);
    for(let i = 0 ; i < count * 3 ; i++){
        positions[i] = (Math.random() -.5) * 2;
        colors[i] = Math.random();
    }
    particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions,3)
    )
    particleGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors,3)
    )

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

   
    
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
        // particles.rotation.y = elapsedTime * 0.3;
        // particles.position.y = -elapsedTime * 0.02;

        particleGeometry.attributes.position.needsUpdate = true;
        for(let i = 0 ; i < count ; i ++){
            const i3 = i * 3;
            const x = particles.geometry.attributes.position.array[i3];

            particleGeometry.attributes.position.array[i3+1] = Math.sin(elapsedTime + x);
            
            //need to say three.js that attributes have been updated
            //this is very bad , updating whole attribue in each frame has badd performance

            

        }
        
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;

//particle
//very performance

const createSphereParticle = (scene) => {

    //size , sizeAttenuation = minimnum distance between particles

    const geomtry = new THREE.SphereBufferGeometry(1,32,32);
    const material = new THREE.PointsMaterial();
    material.size = 0.02;
    material.sizeAttenuation = true;

    const particle = new THREE.Points(geomtry , material);

    scene.add(particle);
}