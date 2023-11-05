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
const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')

const brickColorTexture = textureLoader.load('/bricks/color.jpg')
const brickNormalTexture = textureLoader.load('/bricks/normal.jpg')
const brickAmbientOcclusionTexture = textureLoader.load('/bricks/ambientOcclusion.jpg')
const brickRoughnessTexture = textureLoader.load('/bricks/roughness.jpg')


const grassColorTexture = textureLoader.load('/grass/color.jpg')
const grassAmbientOcclusionTexture = textureLoader.load('/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('/grass/roughness.jpg');

grassColorTexture.repeat.set(8,8);
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;

grassAmbientOcclusionTexture.repeat.set(8,8);
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;

grassRoughnessTexture.repeat.set(8,8);
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

grassNormalTexture.repeat.set(8,8);
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
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

     const house = new THREE.Group();
     scene.add(house);

     //walls
     const walls = new THREE.Mesh(new THREE.BoxBufferGeometry(4,2.5,4) , new THREE.MeshStandardMaterial({color : '#ac8e82',
     map : brickColorTexture,
     transparent : true,
     aoMap : brickAmbientOcclusionTexture,
     normalMap : brickNormalTexture,
     roughnessMap : brickRoughnessTexture
    }));
    walls.geometry.setAttribute('uv2' , 
    new THREE.Float32BufferAttribute(
        walls.geometry.attributes.uv.array,2
    )
    )
     walls.position.y = 1.25;
     house.add(walls);

     //roof
     const roof = new THREE.Mesh(
         new THREE.ConeBufferGeometry(3.5,1,4),
         new THREE.MeshStandardMaterial({color : '#b35f45'})
     )

     //bush
     const bushGeometry = new THREE.SphereBufferGeometry(1,16,16);
     const bushMaterial = new THREE.MeshStandardMaterial({color : 
    '#89c854'}
    );

    const bush1 = new THREE.Mesh(bushGeometry , bushMaterial);
    bush1.scale.set(0.5,0.5,0.5);
    setPosition(bush1 ,0.5,0.2,2.2)
    const bush2 = new THREE.Mesh(bushGeometry , bushMaterial);
    bush2.scale.set(0.25,0.25,0.25);
    setPosition(bush2 ,1.4,0.1,2.1);

    const bush3 = new THREE.Mesh(bushGeometry , bushMaterial);
    bush3.scale.set(0.4,0.4,0.4);
    setPosition(bush3 ,-0.8,0.1,2.2);
    const bush4 = new THREE.Mesh(bushGeometry , bushMaterial);
    bush4.scale.set(0.15,0.15,0.15);
    setPosition(bush4 ,-1,0.05,2.6);

    house.add(bush1,bush2,bush3,bush4)

     //door
     const door = new THREE.Mesh(
         new THREE.PlaneBufferGeometry(2.2,2.2 , 100 ,100),
         new THREE.MeshStandardMaterial({
             color : '#aa7b7b',
             map : doorColorTexture,
             transparent : true,
             alphaMap : doorAlphaTexture,
             aoMap : doorAmbientOcclusionTexture,
             displacementMap : doorHeightTexture,
             normalMap : doorNormalTexture,
             displacementScale :0.1,
             metalnessMap : doorMetalnessTexture,
             roughnessMap : doorRoughnessTexture
        
        })
     )
     door.geometry.setAttribute('uv2' ,
      new THREE.Float32BufferAttribute(
          door.geometry.attributes.uv.array,2
      ))
     door.position.y = 1;
     door.position.z = 2.01;
     house.add(door);
     roof.rotation.y = Math.PI * 0.25;
     roof.position.y = 2.5 + 0.5;
     house.add(roof); 

     //floor
     const floor = new THREE.Mesh(
         new THREE.PlaneBufferGeometry(20,20),
         new THREE.MeshStandardMaterial({color : '#a9c388',
         map : grassColorTexture,
         transparent: true,
         normalMap : grassNormalTexture,
         roughnessMap : grassRoughnessTexture
        })
     )

     floor.geometry.setAttribute('uv2',
     new THREE.Float32BufferAttribute(
         floor.geometry.attributes.uv.array,2
     ))
     setPosition(floor ,-Math.PI * 0.5 , 0)
     floor.rotation.x = -Math.PI * 0.5;
     scene.add(floor);

     //grave

     const graves = new THREE.Group();
     const graveGeometry = new THREE.BoxBufferGeometry(0.6,0.8,0.2);
     const graveMaterial = new THREE.MeshStandardMaterial({color: '#b2b6b1'});

     for(let i = 0 ; i < 50 ; i++){
         const angle = Math.random() * Math.PI * 2;
         const radius = 3 + (Math.random()) * 5.5;
         const x = Math.sin(angle)  *radius;
         const z = Math.cos(angle) * radius;

         const grave = new THREE.Mesh(graveGeometry,graveMaterial);
         grave.position.set(x,0.3,z);
         grave.rotation.y = (Math.random() - 0.5) * 0.4
         grave.rotation.z = (Math.random() - 0.5) * 0.4
         grave.castShadow = true;
         graves.add(grave);
     }
     scene.add(graves);
    
    //light
    const ambientLight = new THREE.AmbientLight(0xb9d5ff , 0.12);
    const moonLight = new THREE.DirectionalLight(0xb9d5ff , 0.12);
    scene.add(ambientLight,moonLight);

    //doorlight
    const doorlight = new THREE.PointLight('#ff7d46' , 1 ,7);
    doorlight.position.set(0,2.2,2.7);
    house.add(doorlight);

    //fog
    const fog = new THREE.Fog('#262837' , 1, 15);
    scene.fog = fog;

    //ghost
    const ghost1 = new THREE.PointLight('#ff00ff' , 2, 3);
    const ghost2 = new THREE.PointLight('#ff00ff' , 2, 3);
    const ghost3 = new THREE.PointLight('#ff00ff' , 2, 3);
    scene.add(ghost1,ghost2,ghost3);


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
    
    //shadow

    moonLight.castShadow = true;
    doorlight.castShadow = true;
    ghost1.castShadow = true;
    ghost2.castShadow = true;
    ghost3.castShadow = true;

    walls.castShadow =true;
    bush1.castShadow = true;
    bush2.castShadow = true;
    bush3.castShadow = true;
    bush4.castShadow = true;

    floor.receiveShadow = true;



	/**
	 * Renderer
	 */

	const renderer = new THREE.WebGLRenderer({
		canvas: canvas
	});
	renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio = Math.min(2, window.devicePixelRatio);
    renderer.setClearColor('#262837');
    renderer.shadowMap.enabled =true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

        //update ghost
        const ghostAngle1 = elapsedTime * .5;
        ghost1.position.set(Math.cos(ghostAngle1) * 4,Math.sin(elapsedTime * 3),Math.sin(ghostAngle1) * 4)

        const ghostAngle2 =  - elapsedTime * .32;
        ghost2.position.set(Math.cos(ghostAngle2) * 5,Math.sin(elapsedTime * 3),Math.sin(ghostAngle2) * 5)

        const ghostAngle3 = elapsedTime * .1;
        ghost3.position.set(Math.cos(ghostAngle3) * (7 + Math.sin(elapsedTime)),Math.sin(elapsedTime * 2.5) * (7 + Math.sin(elapsedTime)),Math.sin(ghostAngle3) * 4)
       
    
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;


const setPosition = (mesh , x,y,z)=> {

    if(x !== undefined){
        mesh.position.x = x    
    }
    if(y !== undefined){
        mesh.position.y = y    
    }
    if(z !== undefined){
        mesh.position.z = z    
    }
}

//light