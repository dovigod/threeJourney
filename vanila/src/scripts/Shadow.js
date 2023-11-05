import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

//texture
const TextureLoader = new THREE.TextureLoader();
const bakedShadow = TextureLoader.load('/shadows/bakedShadow.jpg');
const simpleShadow = TextureLoader.load('/shadows/simpleShadow.jpg');

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
    generateLight(scene, gui);
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
	activateShadow(renderer);
	usePCFSoftShadowMap(renderer);


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

	const sphere = scene.children[0];
	const sphereShadow = scene.children[4];
	const animate = () => {

		const elapsedTime = clock.getElapsedTime();
		sphere.position.x = Math.cos(elapsedTime);
		sphere.position.z = Math.sin(elapsedTime);
		//bounce
		sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));


		sphereShadow.position.x = Math.cos(elapsedTime);
		sphereShadow.position.z = Math.sin(elapsedTime);
		//bounce
		sphereShadow.material.opacity = (1-sphere.position.y) * 0.3;

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

	window.addEventListener('keypress' , e => {
		if(e.key === 'z'){
			deactivateShadow(renderer);
		}else{
			renderer.shadowMap.enabled = true;
		}
	})
};

export default init;

const generateObjects = (scene , gui) => {
	const material = new THREE.MeshStandardMaterial()
	const bakedMaterial = new THREE.MeshBasicMaterial({
		map : bakedShadow
	})
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
	
	//shadow
	shadowCasting(sphere)
	shadowCasting(torus);
	shadowCasting(cube);
	plane.receiveShadow = true;


	///gui

	gui.add(material , 'roughness' , 0, 1 ,0.01);
	gui.add(material , 'metalness' , 0 ,1 ,0.01);
	scene.add(sphere,torus,cube,plane);
	
	generateFakeShadow(scene,plane)
}

const setPosition = (mesh , x,y,z)=> {
    mesh.position.set(x,y,z);
}

//shadow

//when there is light , the back-side of object already has core shadow , but missing drop shadow

//when on render , three will do a render for each light supporting shadow , those render will simulate what light see, when light renders , a meshDepthMaterial replaces all meshes..

//light renders are stored as textures called shadow maps
//they are used on every materials to receive shadows and project on geometry

//one light makes one shadow map, three use this to color meshes , like drop shadow


const generateLight = (scene,gui) => {

	//shadow map stored in light
	const directionalLight = new THREE.DirectionalLight(0xffffff , 0.3)
	const ambientLight = new THREE.AmbientLight(0xffffff,0.2)

	directionalLight.castShadow = true;

	resizeShadowMap(directionalLight);
	optimizeShadowCamera(directionalLight);
	optimzeBlur(directionalLight);
	// createShadowCameraHelper(scene,directionalLight);


	const spotLight = new THREE.SpotLight(0xffffff,0.3 , 10 ,Math.PI * 0.3);
	spotLight.castShadow = true;
	spotLight.position.set(0,2,2);

	optimizeSpotLightShadowCam(spotLight);
	// createShadowCameraHelper(scene,spotLight);

	const pointLight = new THREE.PointLight(0xffffff,  0.3);
	pointLight.castShadow = true;
	pointLight.position.set(-1,1,0);
	optimizePointLightShadowCam(pointLight)
	// createShadowCameraHelper(scene,pointLight);



	scene.add(directionalLight , ambientLight,spotLight,pointLight);
}

const activateShadow = (renderer) => {

	renderer.shadowMap.enabled =true;

}

const shadowCasting = (object) => {
	object.castShadow = true;
	object.receiveShadow = true;
}

//optimizing
//1. rendererSize , cuz shadow map has width height

const resizeShadowMap = (light) => {

	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;

}
//2. near , far (precision)
const createShadowCameraHelper = (scene,obj) => {

	const cameraHelper = new THREE.CameraHelper(obj.shadow.camera);

	// cameraHelper.visible =false;
	scene.add(cameraHelper)

}

const optimizeShadowCamera = (light) => {
	light.shadow.camera.near = 1;
	light.shadow.camera.far = 3;
	////amplitude
	light.shadow.camera.top  = 2;
	light.shadow.camera.bottom  = -2;
	light.shadow.camera.left = -2;
	light.shadow.camera.right  = 2;

}

const optimzeBlur = (light) => {
	light.shadow.radius = 10;
}

//optimze shadowMap algorithm
const usePCFShadowMap = (renderer) => {
	//default , less performance , but smoother edge
	renderer.shadowMap.type = THREE.PCFShadowMap;
}

const usePCFSoftShadowMap = (renderer) => {
	//default , more less performance , but smoother edge
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	//shadow radius doesnt work on this
}
const useBasicShadowMap = (renderer) => {
	//very performance  ,bad quality
	renderer.shadowMap.type = THREE.BasicShadowMap;
	//shadow radius doesnt work on this
}
const useVSMShadowMap = (renderer) => {
	//not rec
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	//shadow radius doesnt work on this
}

//optimzie spotLight shadow Cam 

const optimizeSpotLightShadowCam = (light) => {

	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	light.shadow.camera.fov = 60;
	light.shadow.camera.near = 1;
	light.shadow.camera.far = 6;
}

//optimzie point Light shadow Cam 

//pointlight는 전방향 빛이므로 헬퍼는 걍 마지막만 임의로 보여줌 , 6방향 고치기

const optimizePointLightShadowCam = (light) => {

	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 4;
}

//baking shadow

const deactivateShadow = (renderer) => {
	renderer.shadowMap.enabled = false;
}

//baking alternative

const generateFakeShadow = (scene,plane) => {
	const sphereShadow = new THREE.Mesh(new THREE.PlaneBufferGeometry(1.5,1.5) , new THREE.MeshBasicMaterial({
		color : 0x000000,
		alphaMap : simpleShadow,
		transparent : true
	}))
	sphereShadow.rotation.x = -Math.PI * 0.5;
	sphereShadow.position.y = plane.position.y + 0.001;
	scene.add(sphereShadow);
}