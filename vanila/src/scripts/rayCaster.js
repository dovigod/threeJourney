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

     const object1 = new THREE.Mesh(
         new THREE.SphereBufferGeometry(.5,  16 ,16),
         new THREE.MeshBasicMaterial({
             color : '#ff0000'
         })
     )
     object1.position.x = -2;
     const object2 = new THREE.Mesh(
        new THREE.SphereBufferGeometry(.5,  16 ,16),
        new THREE.MeshBasicMaterial({
            color : '#ff0000'
        })
    )
    const object3 = new THREE.Mesh(
        new THREE.SphereBufferGeometry(.5,  16 ,16),
        new THREE.MeshBasicMaterial({
            color : '#ff0000'
        })
    )
    object3.position.x = 2
     scene.add(object1 , object2 , object3);
    //raycaster

    const raycaster = new THREE.Raycaster();
    // // set origin of ray , direction of ray
    // const rayOrigin = new THREE.Vector3(-3,0,0);
    // const rayDirection = new THREE.Vector3(10,0,0);
    // rayDirection.normalize();
    // raycaster.set(rayOrigin , rayDirection);

    // const intersect = raycaster.intersectObject(object2);
    // console.log(intersect);
    // const intersects = raycaster.intersectObjects([object1,object2,object3]);
    // console.dir(intersects);
    // //if didnt intersect , return empty array
    // //ray caster may intersect with object more than once , ex donut , 도넛 뚫으면 2번 인터섹트
    // //intersection is heavy




    
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
    const mouse = new THREE.Vector2();

    window.addEventListener('dblclick', requestFullScreen);
    window.addEventListener('mousemove' , (e) => {
        mouse.x = (e.clientX / sizes.width) * 2 - 1,
        mouse.y = -(e.clientY / sizes.height) * 2 + 1
    })
    window.addEventListener('click' , () => {
        if(currentIntersect){
            switch(currentIntersect.object){
                case object1:
                    console.log('click 1')
                    break;
                case object2:
                    console.log('click2');
                    break;
                case object3:
                    console.log('click 3');
                    break;
            }
        }
    })

    let currentIntersect = null;

    const clock = new THREE.Clock();
    console.dir(scene)
	//Animation
	const animate = () => {


        const elapsedTime = clock.getElapsedTime() ;

        //animate obj
        object1.position.y = Math.sin(elapsedTime * .3) * 1.5;
        object2.position.y = Math.sin(elapsedTime * .5) * 1.5;
        object3.position.y = Math.sin(elapsedTime * .1) * 1.5;
    
        //cast a ray
        // const rayOrigin = new THREE.Vector3(-3 , 0 ,0);
        // const rayDirection = new THREE.Vector3( 1, 0 , 0);
        // rayDirection.normalize();

        // raycaster.set(rayOrigin , rayDirection);
        // const objectsToTest = [object1, object2 ,object3];
        // const intersects = raycaster.intersectObjects(objectsToTest);

        // for(const object of objectsToTest){
        //     object.material.color.set('#ff0000');
        // }
        // for(const intersect of intersects){
        //     intersect.object.material.color.set('#0000ff');
        // }

        //ray with mouse

        raycaster.setFromCamera(mouse , camera);
         const objectsToTest = [object1, object2 ,object3];
        const intersects = raycaster.intersectObjects(objectsToTest);

        for(const object of objectsToTest){
            object.material.color.set('#ff0000');
        }
        for(const intersect of intersects){
            intersect.object.material.color.set('#0000ff');
        }

        if(intersects.length){
            if(currentIntersect === null){
                console.log('mouse enter');
            }
            currentIntersect = intersects[0];
        }else{
            console.log('mouse leave');
            currentIntersect = null;
        }






		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;

//cast a ray in specific direction and text objects intercest with it
//usage , detect if there is a wall
// 2 , test if laser gun hit smt
//3 , test if something is currently under the mouse to simulate mouse event
//show an alert message if spaceship is headeing toward a planet