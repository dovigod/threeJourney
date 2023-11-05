import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Mesh, SphereBufferGeometry } from 'three';
/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

//gltf loader

const gltfLoader = new GLTFLoader();
const cubeTextureLoader =new THREE.CubeTextureLoader();


/*
 */


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



     // env map

     const environmentMap = cubeTextureLoader.load([
         '/environmentMaps/0/px.jpg',
         '/environmentMaps/0/nx.jpg',
         '/environmentMaps/0/py.jpg',
         '/environmentMaps/0/ny.jpg',
         '/environmentMaps/0/pz.jpg',
         '/environmentMaps/0/nz.jpg'
     ])
     environmentMap.encoding = THREE.sRGBEncoding;

     scene.background = environmentMap;
     scene.environment = environmentMap;

    /*
    model
    */

    // updater for materials

    const debugParams = {
        envMapIntensity : 10
    }

    //traverse!! 굉장히 유용
    const updateMaterials = () => {
        scene.traverse((child) => {
         
            if(child instanceof THREE.Mesh && child.material  instanceof THREE.MeshStandardMaterial){
            //    child.material.envMap = environmentMap; // scene.environment = envmap 하면 걍 안해도댐
               child.material.envMapIntensity = debugParams.envMapIntensity;
               child.material.needsUpdate = true;
               child.castShadow =true;
               child.receiveShadow = true;
    
            }
        })
    }


//'/models/FlightHelmet/glTF/FlightHelmet.gltf'


    gltfLoader.load(
        '/models/hamburger.glb',
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.3,0.3,0.3);
            model.position.set(0,-1,0);
            model.rotation.y = Math.PI * 0.5;
            scene.add(gltf.scene);
            updateMaterials()

            const gui_model = gui.addFolder('Helmet');
            gui_model.add(gltf.scene.rotation, 'y' , -Math.PI , Math.PI , 0.001 ).name('rotate Y');
            gui_model.add(model.position , 'x', -5 ,5 , 0.001)
            gui_model.add(model.position , 'y', -5 ,5 , 0.001)
            gui_model.add(model.position , 'z', -5 ,5 , 0.001)
            gui_model.add(debugParams , 'envMapIntensity' , 0 , 20 , 0.1).onChange(updateMaterials);
        }
    )
    
    //light
    const ambientLight = new THREE.AmbientLight(0xffffff , 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 10;
    directionalLight.shadow.mapSize.set(1024,1024);
    directionalLight.position.set(1.25 , 6.4 -2.25);
    directionalLight.shadow.normalBias = 0.05;
    scene.add(directionalLight)

    // const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);

    // scene.add(directionalLightCameraHelper)

    const gui_light = gui.addFolder('Light');
    const light_directional = gui_light.addFolder('Directional');
    light_directional.add(directionalLight, 'intensity' , 0 , 1 ,0.01).name('intensity');
    light_directional.add(directionalLight.position , 'x' , -5 ,5 , 0.001)
    light_directional.add(directionalLight.position , 'y' , -5 ,5 , 0.001)
    light_directional.add(directionalLight.position , 'z' , -5 ,5 , 0.001)
    light_directional.add(directionalLight.shadow , 'normalBias' , 0.02 ,0.05 , 0.001)
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
        canvas: canvas,
        antialias: true
	});
	renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio = Math.min(2, window.devicePixelRatio);
    renderer.physicallyCorrectLights = true; // 어떤 엔진과 상관없이 , 살제랑 비슷하게 , 여기에 베이스해서 빛량 조절
    //export 된 모델 가져올시 각 프로그램과 동일한 색채감
    renderer.outputEncoding = THREE.sRGBEncoding; // but envmap is still linear encoding.. so change when load
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;




    const gui_renderer = gui.addFolder('renderer');
    gui_renderer.add(renderer , 'toneMapping' , {
        No : THREE.NoToneMapping,
        Linear  :THREE.LinearToneMapping,
        Reinhard : THREE.ReinhardToneMapping,
        Cineon : THREE.CineonToneMapping,
        ACESFilmic : THREE.ACESFilmicToneMapping
       })
    .onFinishChange(()=> {
        // renderer.toneMapping = Number(renderer.toneMapping);
        updateMaterials()
    })
    gui_renderer.add(renderer , 'toneMappingExposure' , 0 , 10 , 1);

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

 
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;






/**
 outputEncoding = controls the output render encoding , default = THREE.LinearEncoding 

 use THREE.sRGBEncoding for realistic,
 others THREEE.GammaEncoding , play with gammaFactor , -> little like the brightness but not same



 linear encoding
 w ------------------- b
    0.75   0.5   0.25
eyes percive light differently.. 0 -> 0.1 까진 huge difference ,BUt 0.9 -> 1 , not much difference


srgb => instead of linear ,  it takes more time to increase value ,but more precision , and eyes can perceive

 w ------------------- b
                0.50.25 ,0 , 
our eyes cant perceive upper part much , so dont care
fallback = > image , texture ,color ,uses upper part value , need to convert back

thene use...gamma factor

srgb is like gamma factor 2.2 not same


do not apply srgb on normal textures... all other texture

models automatically use sRgb encoding
 */

 /*
 tone Mapping
intends to convert HDR ro LDR
HDR : color value can go up beyond 1 , so having limit 
so interpolate hdr value to ldr

options

THREE.NoToneMapping = defaul
LinaerToneMapping
ReinhardTimeMapping
CineonTimeMapping
ACESFilmicTimeMapping


toneMappingExposure = will handle algorithm how much light we let in

 */


 /*
 antialiasing : 모델 표면에 미세하게 울퉁불퉁, stair-like effect , usually on edge of geometries,
 렌더러가 지오메트리가 픽셀안에 드는지 아닌지 고를때 일어남


 1. increase size of renderer by 2 => cut pixel into 4
 ==> SSAA (super sampling) or fullscreen sampling (FSAA)
 but it take 4times work on renderer
 use if theree is less object
bad performance

 2. multi sampling(MSAA)  ==> only edges on geometry , apply 4 scaling 
 renderer => antialias =: true
 ** only work on when instantiate
 */


 /*
shadows

PCFSoftShadowMap
  */

  /*

    버거 표면에 사막 물결같은 문양 = shadow acen

    occurs on both smooth, flat surface => problem about precision of shadow map

    shadow of burger is happening on burger itself
> precision issue...active
    solutuins ==> shadow bias , shadow normal bias

    we will move object with normal vectors 살짝 아랫면으로 이동시키는거임 지운다 생각해도될듯
  */