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
	const gui = new lil.GUI({width : 400});

	// Canvas
	const canvas = document.getElementsByClassName('webgl')[0];

	// Scene
	const scene = new THREE.Scene();

	/**
	 * Objects
	 */
    const parameters ={
        count : 10000,
        size : 0.02,
        radius : 5,
        branches : 3,
        spin : 1,
        randomness : 0.2,
        branchIntensity : 3,
        insideColor : '#e14d3d',
        outsideColor : '#1457ff'
    }

    let geometry = null;
    let material = null;
    let points = null;

    const generateGalaxy = (scene, parameters) => {
 //************ very important */
        if(points !== null){
            geometry.dispose();
            material.dispose();
            scene.remove(points);

        }


        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(parameters.count * 3);
        const colors = new Float32Array(parameters.count * 3);



        const colorInside = new THREE.Color(parameters.insideColor);
        const colorOutside = new THREE.Color(parameters.outsideColor);


        for(let i = 0 ; i < parameters.count ; i++){
            const i3 = i * 3;

            const radius = Math.random() * parameters.radius;

            //0 , 1, 2 , 3, 4, 5 
            const branchAngle = ( i % parameters.branches) / parameters.branches * Math.PI * 2;
            const spinAngle = radius * parameters.spin;


            const randomX =Math.pow(Math.random() , parameters.branchIntensity) * (Math.random() < 0.5 ? 1 : -1);
            const randomY =Math.pow(Math.random() , parameters.branchIntensity) * (Math.random() < 0.5 ? 1 : -1);
            const randomZ =Math.pow(Math.random() , parameters.branchIntensity) * (Math.random() < 0.5 ? 1 : -1);


            positions[i3 + 0] = Math.cos(branchAngle + spinAngle )* radius + randomX;
            positions[i3 + 1] = 0 + randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle ) * radius + randomZ;

        

            //color
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside , radius / parameters.radius); 
            // lerp의 두번째 파라미터로 인터폴레이션하는데, 지금 정규화시키는중
            colors[i3 + 0] = mixedColor.r
            colors[i3 + 1] = mixedColor.g
            colors[i3 + 2] = mixedColor.b
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        material = new THREE.PointsMaterial({
            size : parameters.size,
            sizeAttenuation : true,
            depthWrite : false,
            blending : THREE.AdditiveBlending,
            vertexColors : true
        })

        points = new THREE.Points(geometry , material);
        scene.add(points);


        ///1step , place particles on a single line
    }

    generateGalaxy(scene , parameters)

    //debug
     //debugs
     gui.add(parameters , 'size' , 0 , 0.1 , 0.0001).name('particle size').onChange(() => {
        points.material.dispose();
        const newMaterial = new THREE.PointsMaterial({
            size : parameters.size,
            sizeAttenuation : true,
            depthWrite : false,
            blending : THREE.AdditiveBlending
        })
        points.material = newMaterial;
    }) // bad idea...


    gui.add(parameters, 'count' , 1000 , 50000 , 100).name('particle number').onFinishChange(() => {
        generateGalaxy(scene, parameters)
    })

    gui.add(parameters, 'radius' , 0.01 , 20 ,0.01).onFinishChange(()=> generateGalaxy(scene , parameters));

    gui.add(parameters, 'branches' , 2 , 20 , 1).onFinishChange(()=> generateGalaxy(scene , parameters));
    
    gui.add(parameters, 'spin' , -5 , 5 , 0.001).onFinishChange(()=> generateGalaxy(scene , parameters));
    
    gui.add(parameters, 'randomness' , 0 , 2 , 0.001).onFinishChange(()=> generateGalaxy(scene , parameters));
    
    gui.add(parameters, 'branchIntensity' , 1 , 10 , 0.001).onFinishChange(()=> generateGalaxy(scene , parameters));

    gui.addColor(parameters, 'insideColor').onFinishChange(()=> generateGalaxy(scene , parameters));
    gui.addColor(parameters, 'outsideColor').onFinishChange(()=> generateGalaxy(scene , parameters));
    
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
	//Animation
	const animate = () => {

        const elapsedTime = clock.getElapsedTime();
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;


/*
arrow
            const branchAngle = ( i % parameters.branches) / parameters.branches * Math.PI * 2;
            const spinAngle = radius * parameters.spin;


            const randomX =Math.pow(Math.random() , parameters.branchIntensity) * (Math.random() < 0.5 ? 1 : -1);
            const randomY =Math.pow(Math.random() , parameters.branchIntensity) * (Math.random() < 0.5 ? 1 : -1);
            const randomZ =Math.pow(Math.random() , parameters.branchIntensity) * (Math.random() < 0.5 ? 1 : -1);


            positions[i3 + 0] = Math.cos(branchAngle )* Math.cos(spinAngle)* radius + randomX;
            positions[i3 + 1] = 0 + randomY;
            positions[i3 + 2] = Math.sin(branchAngle ) * radius + randomZ;
*/