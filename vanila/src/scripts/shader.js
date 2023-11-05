import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import testVertexShader from '../glsl/test/vertex.glsl';
import testFragmentShader from '../glsl/test/fragment.glsl';
/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

//loader

const textureLoader = new THREE.TextureLoader();
const franceFlagTexture = textureLoader.load('/flag-french.jpg');

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
	const geometry = new THREE.PlaneBufferGeometry(1,1,32,32)
	 // properties like wirefframe, side , transparent , flatshading still works
	 const count = geometry.attributes.position.count; //exact count of vertices
	 const randoms = new Float32Array(count);

	 for(let i = 0 ; i < count ; i ++){
		 randoms[i] = Math.random();
	 }
	 geometry.setAttribute('aRandom' , new THREE.BufferAttribute(randoms,1))
	 
     const material = new THREE.RawShaderMaterial({
         vertexShader:testVertexShader,
		 fragmentShader:testFragmentShader,
		 uniforms:{
			 uFrequency : { value : new THREE.Vector2(10,5)}, //dont have to provide type anymore
			 uTime : {value : 0 },
			 uColor : {value : new THREE.Color('orange')},
			 uTexture : {value : franceFlagTexture}
			}
        })
     const plane = new THREE.Mesh(
		geometry,
         material
	 )
	 plane.scale.y = 2/3;
        scene.add(plane);

	gui.add(material.uniforms.uFrequency.value , 'x' , 0,30 ,0.01);
	gui.add(material.uniforms.uFrequency.value , 'y' , 0,30 ,0.01);
    
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


    const clock = new THREE.Clock();

	//Animation
	const animate = () => {


		const elapsedTime = clock.getElapsedTime();

		material.uniforms.uTime.value = elapsedTime;

    
    
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;


//s shader
/*
program written in GLSL , sent to GPU
position each vertex of a geometry , colorize each visible pixel of geometry.


pixel isnt accurate because each point in the rendder doesnt neccessarily match each pixel of the screen.

So, we are using fragment. fragment is like pixel, for renderer

we send datas to shader,
vertices coordinate
Mesh info
Camera info
colors
textures
light
fog
etc..

position vertices => colorize fragment

two types of shader.

1. vertex shader = position each vertex of the geometry
so , create vertex shader , send the shader to GPU with data , GPU follows the ins and position the vertices on render

the same vertex shader will be used for every vertices ==> this is the strength.

*Some data like position will be different for ech vertex. === called as attributes

we cant send attributes to fragment shader

varying = we can send to fragment shader , value get interpolated between the vertices *******!!!

uniform = data that doesn't change each of, like it could be position, color , camera position etc ==> same for every vertex

-----

once the vertices are placed by vertex shader , GPU knows what pixels of geometry are visible,and can proceed to fragment shadder 


2. fragment shader = color each visible pixel geometry.

same fragment shader will be used for every visible fragment of geometry.

create fragment shader -> send shader to GPU with data like color -> GPU follows ins and color the fragment

 */


 /*

 why learn ? 
 1. three materials are limited
 2. custom shader can be very simple and performant
 3. we can add custom post-processing

 */


 /*

 we can use shaderMaterial or RawShaderMaterial
 shadermaterial = code automatically added to shader
 raw = nothing 

 */