import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import { getUnit } from 'gsap';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'
import { Vector2, Vector3 } from 'three';
/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

const TextureLoader = new THREE.TextureLoader();
const matcapTexture = TextureLoader.load('/matcaps/1.png');

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

     createText('Hello Three.JS' , scene , gui)
     console.time('donuts')
     createDonuts(100,scene);
     console.timeEnd('donuts')

	/**
	 * Camera
	 */
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	camera.position.set(0.5, 0.5, 3);
	camera.lookAt(new THREE.Vector3(1,0,0));
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
    window.addEventListener('keydown' , (e) => {
       if(e.key === 'd'){
           camera.position.x += 0.1;
           camera.lookAt(new THREE.Vector3(camera.position.x , 0, 0))
       }else if(e.key === 'a'){
           camera.position.x -= 0.1;
           camera.lookAt(new THREE.Vector3(camera.position.x , 0, 0))
       }
    })

	//Animation
	const animate = () => {
		controls.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(animate);
	};

	animate();
};

const createText = (text , scene , gui) => {

    const fontLoader = new FontLoader();
    const textConfig = {
        size : 0.5,
        height : 0.2,
        curveSegments : 12,
        bevelEnabled : true,
        bevelThickness : 0.03,
        bevelSize : 0.02,
        bevelOffset: 0,
        bevelSegments : 5

    }
    fontLoader.load('/fonts/helvetiker_regular.typeface.json',
        (font) => {
            const textGeometry = new TextGeometry(text,
            {
                font,
                size : textConfig.size,
                height : textConfig.height,
                curveSegments : textConfig.curveSegments,
                bevelEnabled : textConfig.bevelEnabled,
                bevelThickness : textConfig.bevelThickness,
                bevelSize : textConfig.bevelSize,
                bevelOffset: textConfig.bevelOffset,
                bevelSegments : textConfig.bevelSegments
            })
            const textMaterial = new THREE.MeshMatcapMaterial({
                matcap : matcapTexture
            })
            const textMesh = new THREE.Mesh(textGeometry, textMaterial)
            centerText(textGeometry);
            console.dir(textMesh)
            scene.add(textMesh)
            // gui.add(textMaterial, 'wireframe').name('wire')
            gui.addColor(textMaterial,'color')
            gui.add(textConfig , 'bevelSegments' , 0, 30,1).onChange(() => {
                regenerateGeometry(textMesh , text  ,{font , ...textConfig})
            })
            gui.add(textConfig , 'bevelOffset' , 0, 1,0.01).onChange(() => {
                regenerateGeometry(textMesh , text  ,{font , ...textConfig})
            })
            gui.add(textConfig , 'bevelSize' , 0, 1,0.01).onChange(() => {
                regenerateGeometry(textMesh , text  ,{font , ...textConfig})
            })
            gui.add(textConfig , 'bevelThickness' , 0, 1,0.01).onChange(() => {
                regenerateGeometry(textMesh , text  ,{font , ...textConfig})
            })
            gui.add(textConfig , 'curveSegments' , 0, 20,1).onChange(() => {
                regenerateGeometry(textMesh , text  ,{font , ...textConfig})
            })
            gui.add(textConfig , 'size' , 0, 1,0.01).onChange(() => {
                regenerateGeometry(textMesh , text  ,{font , ...textConfig})
            })
            gui.add(textConfig , 'height' , 0, 1,0.01).onChange(() => {
                regenerateGeometry(textMesh , text  ,{font , ...textConfig})
            })
        }
    )
}
//bevel == > 테두리 둥근 정도
//creating text geometry cost a lot , keep geometry as low poly as possible ==> curve seg , bevel seg
export default init;

const regenerateGeometry = (mesh ,text,  config) => {
    mesh.geometry.dispose();
    mesh.geometry = new TextGeometry(text , {...config})
}
const centerText = (geometry) => {
    //1st solution == bounding == information associated with geometry that what space is taken by geomtry
    //can be box or sphere ==> called frustrum culling ( if object is onthe screen, calculate)
    //by default  three use sphere bounding , so use computeBooundingBox()
    geometry.computeBoundingBox();
    console.dir(geometry);
    //because of bevel, its min is not 0
    const {bevelSize , bevelThickness} = geometry.parameters.options
    //because of bevel size,  need to compute them too
    geometry.translate(
        -(geometry.boundingBox.max.x - bevelSize ) * 0.5,
        -(geometry.boundingBox.max.y - bevelSize ) * 0.5,
        -(geometry.boundingBox.max.z - bevelThickness )* 0.5
    )

    ///fuck!!! use center() method

    geometry.center();
}


const createDonut = (scene , material,geometry) => {
    
    const donut = new THREE.Mesh(geometry , material);
    donut.position.set(Math.random() *50 -25,Math.random() *50 -25,Math.random() *50 -25);
    donut.rotation.x = Math.random()*2*Math.PI;
    donut.rotation.y = Math.random()*2*Math.PI;
    donut.rotation.z = Math.random()*2*Math.PI;
    scene.add(donut)

}

const createDonuts =(number , scene) => {
    const material = new THREE.MeshMatcapMaterial({matcap : matcapTexture});
    const geometry = new THREE.TorusBufferGeometry(0.3,0.2,20,45);
    for(let i = 0 ; i < number ; i++){
        createDonut(scene  , material, geometry);
    }

}

//FTP client에 올리기