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
const sphereConfig = {
	r: 0.5,
	s: 64,
	s2: 64
};
//texture

const loadingManager = new THREE.LoadingManager();
loadingManager.onError = () => console.log('error occur');
loadingManager.onStart = () => console.log('starting texture loading');
loadingManager.onLoad = () => console.log('Loading fin');
const textureLoader = new THREE.TextureLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

const colorTexture = textureLoader.load('/textures/door/color.jpg');
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const ambientTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const heightTexture = textureLoader.load('/textures/door/height.jpg');
const normalTexture = textureLoader.load('/textures/door/normal.jpg');
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg');
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
//matcaps
const matcap1 = textureLoader.load('/matcaps/1.png');
const matcap2 = textureLoader.load('/matcaps/2.png');
const matcap3 = textureLoader.load('/matcaps/3.png');
const matcap4 = textureLoader.load('/matcaps/4.png');
const matcap5 = textureLoader.load('/matcaps/5.png');
const matcap6 = textureLoader.load('/matcaps/6.png');
const matcap7 = textureLoader.load('/matcaps/7.png');
const matcap8 = textureLoader.load('/matcaps/8.png');
//gradients
const gradientTexture1 = textureLoader.load('/gradients/3.jpg');
const gradientTexture2 = textureLoader.load('/gradients/5.jpg');
gradientTexture1.minFilter = THREE.NearestFilter;
gradientTexture1.magFilter = THREE.NearestFilter;
gradientTexture1.generateMipmaps = false;

gradientTexture2.minFilter = THREE.NearestFilter;
gradientTexture2.magFilter = THREE.NearestFilter;
gradientTexture2.generateMipmaps = false;

const environmentMapTexture = cubeTextureLoader.load([
	'/environmentMaps/0/px.jpg',
	'/environmentMaps/0/nx.jpg',
	'/environmentMaps/0/py.jpg',
	'/environmentMaps/0/ny.jpg',
	'/environmentMaps/0/pz.jpg',
	'/environmentMaps/0/nz.jpg'
]);
//config

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
	const material = createEnvironmentMap({
		map: colorTexture,
		gui
	});
	applyDisplaceMap(material, heightTexture, gui);

	let sphere = new THREE.Mesh(
		new THREE.SphereBufferGeometry(sphereConfig.r, sphereConfig.s, sphereConfig.s2),
		material
	);
	const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 100, 100), material);
	const torus = new THREE.Mesh(new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128), material);

	plane.position.set(1.5, 0, 0);
	torus.position.x = -1.5;

	setUv2Coordinate(plane, material);
	setUv2Coordinate(torus, material);
	setUv2Coordinate(sphere, material);

	//aoMapping
	// material.aoMap = ambientTexture;
	// gui.add(material, 'aoMapIntensity', 0, 10, 0.1);

	//metalnessMap
	// applyMetalnessMap(material, metalnessTexture);
	// applyRoughnessMap(material, roughnessTexture);
	// applyNormalMap(material, normalTexture);
	// applyAlphaMap(material, alphaTexture);

	scene.add(sphere, plane, torus);

	//axisHelper

	const AxisHelper = new THREE.AxesHelper();
	scene.add(AxisHelper);
	//debug
	//gui only avail on object ,1 : object , 2: tweak target

	debugPanelConfig(gui, sphere, torus, plane, material);

	//light
	const light = createLight();
	scene.add(light.ambientLight, light.pointLight);
	/**
	 * Camera
	 */
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	camera.position.set(0.5, 0.5, 3);
	camera.lookAt(sphere.position);
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

		sphere.rotation.y = elapsedTime * Math.PI * 0.3;
		torus.rotation.y = elapsedTime * Math.PI * 0.3;
		plane.rotation.y = elapsedTime * Math.PI * 0.3;

		sphere.rotation.x = elapsedTime * Math.PI * 0.1;
		torus.rotation.x = elapsedTime * Math.PI * 0.1;
		plane.rotation.x = elapsedTime * Math.PI * 0.1;
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;

//marterial used to put a color on each visible pixel of geometries
// algorithms are called shaders

const debugPanelConfig = (gui, sphere, torus, plane, material) => {
	gui.add(sphere.position, 'y', -3, 3, 0.01);
	console.dir(sphere);

	gui.add(sphereConfig, 'r', 0, 1, 0.01).onChange(() => {
		const newGeo = new THREE.SphereBufferGeometry(sphereConfig.r, sphereConfig.s, sphereConfig.s2);
		sphere.geometry.dispose();
		sphere.geometry = newGeo;
	});
};

const createBasicMaterial = (config) => {
	const material = new THREE.MeshBasicMaterial();
	material.map = config.map;

	//materia.color = xxxxx color벡터형으로 써주자
	// material.color.set('#ff00ff');
	// material.color = new THREE.Color('pink');

	//opacity
	// material.transparent = true;
	// material.opacity = 0.5;

	//alphaMap
	material.transparent = true;
	material.alphaMap = config.alphaMap;

	//side
	material.side = THREE.DoubleSide; //double side performance high

	return material;
};

const createNormalMaterial = (config) => {
	//normals == information that contains direction of outside
	//lighting reflection, refraction 에 사용됨
	//great performance
	const material = new THREE.MeshNormalMaterial();
	material.side = THREE.DoubleSide;
	material.flatShading = true; //사각형 보임
	config.gui.add(material, 'wireframe');

	return material;
};

const createMatCapMaterial = (config) => {
	//display color by using normals as reference to pick the right color ona texture
	//색을 뽑아서 대응되는 normal에 맞춰서 빛 없이도 빛을 유사하게 구현가능!! 효율적
	const material = new THREE.MeshMatcapMaterial();
	material.side = THREE.DoubleSide;
	material.matcap = config.map;

	return material;
};
const createDepthMaterial = (config) => {
	//white if close , else black
	//fog , preprocessing ,,. etc
	//not affected by light
	const material = new THREE.MeshDepthMaterial();

	return material;
};
const createLambertMaterial = (config) => {
	//will react to light
	//with no setting , can see blur lines..problem
	// very performance!!
	const material = new THREE.MeshLambertMaterial();
	return material;
};

const createPhongMaterial = (config) => {
	//less performance than lambert
	const material = new THREE.MeshPhongMaterial();
	material.shininess = 1000;
	material.specular = new THREE.Color(0xff00ff); // 반사광 링현상
	config.gui.addColor(material, 'specular');
	config.gui.add(material, 'shininess', 0, 1000, 1);
	return material;
};

const createToonMaterial = (config) => {
	//lamert 와 유사
	const material = new THREE.MeshToonMaterial();

	material.gradientMap = config.gradientMap;
	//적용했더니 카투니쉬한게 없어짐
	//magfilter가  gradient가 작으니까 mipmapping이용해서 해결하려고함
	//아래가 해결
	// material.minFilter = THREE.NearestFilter;
	// material.magFilter = THREE.NearestFilter;
	// config.gradientMap.generateMipmaps = false;
	return material;
};

const createStandardMaterial = (config) => {
	//best result, but fucked performance
	const material = new THREE.MeshStandardMaterial();

	material.map = config.map;
	material.side = THREE.DoubleSide;

	//AO map = abientocclusion map , add details
	//need to add uv coordinates , how textures should be applied to mesh

	config.gui.add(material, 'metalness', 0, 1, 0.001);
	config.gui.add(material, 'roughness', 0, 1, 0.001);

	return material;
};
const createPhysicalMaterial = (config) => {
	// support clear coat , very realistic , less performance
	const material = new THREE.MeshPhysicalMaterial();

	material.map = config.map;
	material.side = THREE.DoubleSide;

	return material;
};

const createPointsMaterial = (config) => {
	// points
	const material = new THREE.PointsMaterial();

	return material;
};

const createEnvironmentMap = (config) => {
	//surrounding image;
	//hard to load
	const material = new THREE.MeshStandardMaterial();
	const cubemap = null;
	material.metalness = 0.7;
	material.roughness = 0.2;
	material.envMap = environmentMapTexture;

	config.gui.add(material, 'metalness', 0, 1, 0.01);
	config.gui.add(material, 'roughness', 0, 1, 0.01);

	return material;
};
const createLight = () => {
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	const pointLight = new THREE.PointLight(0xffffff, 0.5);
	pointLight.position.set(2, 3, 4);
	return {
		ambientLight,
		pointLight
	};
};

const setUv2Coordinate = (geometries, material) => {
	geometries.geometry.setAttribute('uv2', new THREE.BufferAttribute(geometries.geometry.attributes.uv.array, 2));
};

const applyDisplaceMap = (material, map, gui) => {
	//1st , do not have enough vertices so messed
	// add more segment of geometry
	material.displacementMap = map;
	//since displacement is too strong, reduce it
	material.displacementScale = 0.05;
};

const applyMetalnessMap = (material, map) => {
	//** when using metalness, roughness , never combine */
	material.metalnessMap = map;
};

const applyRoughnessMap = (material, map) => {
	material.roughnessMap = map;
};
const applyNormalMap = (material, map) => {
	material.normalMap = map;
	material.normalScale.set(0.5, 0.5);
};

const applyAlphaMap = (material, map) => {
	material.alphaMap = map;
	material.transparent = true;
};
