import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import VertexShader from '../glsl/wave/vertex.glsl';
import FragmentShader from '../glsl/wave/fragment.glsl'

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

    const planeConfig = {
		wireframe : false,
		bigWaveElevation : 0.2,
		depthColor : '#186691',
		surfaceColor : '#9bd8ff'
    }

    const planeMaterial = new THREE.ShaderMaterial({
		side : THREE.DoubleSide,
		vertexShader :VertexShader,
		fragmentShader : FragmentShader,
		uniforms :{
			uBigWaveElevation : {
				value : planeConfig.bigWaveElevation
			},
			uBigWaveFrequency : {
				value : new THREE.Vector2(4, 1.5)
			},
			uTime :{
				value :  0
			},
			uBigWaveVelocity : {
				value : new THREE.Vector2(1, 1)
			},

			uDepthColor :  {
				value : new THREE.Color(planeConfig.depthColor)
			},
			uSurfaceColor : {
				value : new THREE.Color(planeConfig.surfaceColor)
			},
			uWaveColorMultiplier : {
				value : 5
			},
			uWaveColorOffset : {
				value : 0.06
			},
			uSmallWaveFrequency : {
				value : 3
			},
			uSmallWaveElevation : {
				value : 0.15
			},
			uSmallWaveLeaver: {
				value : 0.2
			},
			uPerlinAppender:{
				value :3.0
			}
		}
    })
    planeMaterial.wireframe = planeConfig.wireframe;
    const planeGeometry = new THREE.PlaneBufferGeometry(5,5,512,512);
    const plane = new THREE.Mesh(planeGeometry,planeMaterial);
    plane.rotation.x = -Math.PI * 0.5;
    scene.add(plane);


    const plane_debug = gui.addFolder('plane');

    plane_debug.add(planeConfig , 'wireframe').onChange(()=>{
        planeMaterial.wireframe = planeConfig.wireframe
	});
	plane_debug.add(planeConfig , 'bigWaveElevation' , 0 , 1 , 0.001).onChange(()=>{
		planeMaterial.uniforms.uBigWaveElevation.value = planeConfig.bigWaveElevation
	});
	plane_debug.add(planeMaterial.uniforms.uBigWaveFrequency.value , 'x').name('Frequency X').min(0).max(10).step(0.001);
	plane_debug.add(planeMaterial.uniforms.uBigWaveFrequency.value , 'y').name('Frequency Y').min(0).max(10).step(0.001);
	plane_debug.add(planeMaterial.uniforms.uBigWaveVelocity.value , 'x').name('Bigwave speed X').min(0).max(10).step(0.001);
	plane_debug.add(planeMaterial.uniforms.uBigWaveVelocity.value , 'y').name('Bigwave speed Y').min(0).max(10).step(0.001);
	plane_debug.addColor(planeConfig,'depthColor').onChange(()=>{
		planeMaterial.uniforms.uDepthColor.value.set(planeConfig.depthColor);
	});;
	plane_debug.addColor(planeConfig,'surfaceColor').onChange(()=>{
		planeMaterial.uniforms.uSurfaceColor.value = new THREE.Color(planeConfig.surfaceColor);
	});
	plane_debug.add(planeMaterial.uniforms.uWaveColorMultiplier , 'value' , 1 , 10 ,0.001).name('color multiplier')
	plane_debug.add(planeMaterial.uniforms.uWaveColorOffset , 'value' , 0 , 1 ,0.001).name('color offset')
	plane_debug.add(planeMaterial.uniforms.uSmallWaveElevation , 'value' , 0 , 5 ,0.0001).name('smallWave Elevation')
	plane_debug.add(planeMaterial.uniforms.uSmallWaveFrequency , 'value' , 0 , 5 ,0.001).name('smallWave Frequency')
	plane_debug.add(planeMaterial.uniforms.uSmallWaveLeaver , 'value' , 0 , 5 ,0.001).name('smallWave Leaver')
	plane_debug.add(planeMaterial.uniforms.uPerlinAppender , 'value' , 0 , 10 ,1).name('Perlin Append')

    
  
	/**
	 * Camera
	 */
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	camera.position.set(0, -1.7, 0);
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
    console.dir(scene)
	//Animation
	const animate = () => {

        const elapsedTime = clock.getElapsedTime();
		planeMaterial.uniforms.uTime.value = elapsedTime;
    
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;
