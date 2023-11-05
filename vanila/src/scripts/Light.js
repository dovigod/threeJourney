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
    // scene.add(ambientLight)
    
    generateDirectionalLight(scene,gui);
    generateHemisphereLight(scene,gui);
    generatePointLight(scene,gui);
    rectAreaLight(scene,gui);
    generateSpotLight(scene,gui)
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

//ambient light => can use as light bouncing
//실생활에서 빛의 사각지대에  있는 부분을 표현가능


const generateDirectionalLight = (scene , gui) => {

    // 특정방향에서 오는 빛, 모든 빛은 평행, 비춰지는 면의 가장 외측은 빛량이 적고, 중심부로 갈수록 빛의 세기 쎔, Like sun

    //* 중요 , if we change the position of light , it will light the center of scene 
    const light = new THREE.DirectionalLight(0xff00ff , 0.3);
    
    light.position.set(1,0.25,0);
    
    gui.add(light.position , 'x' , 0 , 10 , 0.01);
    gui.add(light.position , 'y' , 0 , 10 , 0.01);
    gui.add(light.position , 'z' , 0 , 10 , 0.01);
    gui.add(light,'intensity' , 0 ,1 , 0.01).name('directional intensity');
    gui.addColor(light,'color');
    scene.add(light);
}

const generateHemisphereLight = ( scene, gui) => {

    //빛이 2개를 받는데, 서로 반대 방향에서 투영
    //ex, grass on the floor , sky on top , use it
    //realistic , cheap in performance
    const light = new THREE.HemisphereLight(0xff0000 , 0x0000ff , 0.2);

    scene.add(light);
}

const generatePointLight = ( scene , gui) => {
    //infinitly small point illuminate every surrounding
    //like bulb
    const light = new THREE.PointLight(0xff0000,0.3);

    //distance == fade distance
    //멀리 있으면 빛의 세기가 약해짐, 이걸 조절

    gui.add(light, 'distance',1, 30,1);
    gui.add(light.position , 'x' , 0 , 10 , 0.01);
    gui.add(light.position , 'y' , 0 , 10 , 0.01);
    gui.add(light.position , 'z' , 0 , 10 , 0.01);
    gui.add(light,'intensity' , 0 ,1 , 0.01).name('pointLoght intensity');
    gui.addColor(light,'color');
    scene.add(light)

}

const rectAreaLight = (scene,gui) => {
    //like phot shoots
    // 사진점 카메라 (키 크고 네모난 상자) width ,가 그 상자의 가로변
    //only works on standard , physical material
    const light = new THREE.RectAreaLight(0x4e00ff,2,1,1);

    light.lookAt(new THREE.Vector3())

    gui.add(light, 'intensity' , 0 , 10 , 0.01).name('rect intensity')
    gui.add(light, 'width' , 0 , 30 , 0.01).name('rect width')
    gui.add(light, 'height' , 0 , 30 , 0.01).name('rect height')
    gui.add(light.position , 'x', -1 , 10 , 0.1).name('rect x')
    gui.add(light.position , 'y', -1 , 10 , 0.1).name('rect y')

    gui.add(light.position , 'z', -1 , 10 , 0.1).name('rect z')

    scene.add(light)
}

const generateSpotLight = (scene , gui) => {
    //like flash light , makes circle area

    //color , intensity , distance(fading with distance)
    //angle(how wide is ur light) pi   하면 반원이 프로젝션됨
    //penumbra , dim of edge
    //decay how fast it goes to limit
    const light = new THREE.SpotLight(0x78ff00 , 0.5,10,Math.PI * 0.1 , 0.25,1);
    light.position.set(0,2,3);

    //to rotate , need to use target

    //1 add target to scene
    scene.add(light.target);
    light.target.position.x = -0.75;

    scene.add(light)
}


//light cost a lot , try to use few light as posible , try to use less cost light

//minimal cost , ambient , hemisphere
//moderate cost , directional , point
// high cost , spot light , rect area

//else baking  drawback = cannot move light


//helper ,
// when using spotlighthelper , need to update on next frame, since it has no size
//rectarea light helper => need to import on three