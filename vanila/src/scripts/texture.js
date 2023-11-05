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
// texture

// const image = new Image();
// const texture = new THREE.Texture(image);

// image.onload = () => {
// 	texture.needsUpdate = true;
// 	// when image loaded , update texture
// };
// image.src = '/textures/door/color.jpg';
// //may use texture loader

// const texture = textureLoader.load(
// 	'/textures/door/color.jpg',
// 	() => {
// 		console.log('load');
// 	},
// 	() => {
// 		console.log('progress');
// 	},
// 	() => {
// 		console.log('error');
// 	}
// );

// substitude
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
	console.log('start');
};
loadingManager.onLoad = () => {
	console.log('load');
};
loadingManager.onProgress = () => {
	console.log('progree');
};
loadingManager.onError = () => {
	console.log('error');
};
const textureLoader = new THREE.TextureLoader(loadingManager);
const filterTester = textureLoader.load('/textures/checkerboard-1024x1024.png');
const filterTester2 = textureLoader.load('/textures/minecraft.png');
const colorTexture = textureLoader.load('/textures/door/color.jpg');
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const heightTexture = textureLoader.load('/textures/door/height.jpg');
const normalTexture = textureLoader.load('/textures/door/normal.jpg');
const ambientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

const testingUVUnwrapping = () => {
	// when applying textures via cube, cone , etc, textures r not applied randomly but depends on uvCoordination
	// each vertext will have 2d coordination 전개도를 생각하면 됨
	// can access by geometry.attributes.uv
};

const transformingTextureRepeat = (texture) => {
	//just vector2
	texture.repeat.x = 2; // half of origin
	texture.repeat.y = 3; // 1/3 of origin
	//so last pixel of texture is repeating to right , top
	//can solve this with repeat wrap

	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	// THREE.MirroredRepeatWrapping == 대칭해서 반복
};
const textureRepeatOffset = (texture) => {
	texture.repeat.x = 2;
	texture.repeat.y = 3;
	texture.wrapS = THREE.MirroredRepeatWrapping;
	texture.wrapT = THREE.MirroredRepeatWrapping;

	texture.offset.x = 0.5;
	texture.offset.y = 0.5;
	//좌측으로 반 짤려서 렌더링
};
const textureRotation = (texture) => {
	//rotation in 2d space
	//move rotation origin
	texture.center.x = 0.5;
	texture.center.y = 0.5;
	texture.rotation = Math.PI / 4;
};
const minFiltering = (texture) => {
	//특정 면이 거의 안보이게끔 구도 잡을때, 그 텍스쳐가 블러하게 모호하게 보이는데, 이걸 mip mapping
	// mipmapping ==texture을 2의 배수로 계속 작게 축소해서 반복해서 텍스쳐를 갖고있는것,
	// gpu가 면을 렌더링할때 보여지는 픽셀 수에 따라 알아서 텍스쳐를 꺼내옴
	// 2가지 알고리즘 있음
	//minificationFilter => texture의 pixel < renderer의 pixel 일때
	//6 option exist
	texture.minFilter = THREE.NearestFilter;
	// moire pattern 발생

	//** nearestfilter쓴다면 mipmaping 필요없음 , 최적화를 위해 밉맵핑 끄자 */
	texture.generateMipmaps = false;
};
const magFiltering = (texture) => {
	//when texture is not big enough , we will get blurry result
	// 늘려져서 블러하게 보임

	//nearestFilter , lineaerFilter 2개존재 , linear = default

	//nearest filter == better performance
	texture.magFilter = THREE.NearestFilter;
};
magFiltering(filterTester2);
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

	const geometry = new THREE.BoxGeometry(1, 1, 1);
	const material = new THREE.MeshBasicMaterial({ map: filterTester2 });
	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	//axisHelper

	const AxisHelper = new THREE.AxesHelper();
	scene.add(AxisHelper);

	//debug
	//gui only avail on object ,1 : object , 2: tweak target
	gui.add(mesh.position, 'y', -3, 3, 0.01);

	/**
	 * Camera
	 */
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	camera.position.set(0.5, 0.5, 3);
	camera.lookAt(mesh.position);
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

	//Animation
	const animate = () => {
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

export default init;

//texture
//albedo  = color
//alpha = black not visible , white visible
//height , displasment =? grayscale image , if white , vertices move up , black down
//normal => add detail , like light , most of lighting , dont need subdivision  , vertice not move , better performance, than height

//abient occlusion , faking shadow, not physically accurate , help create contrast
//metalness => greyscale , white = metal , create things reflection
