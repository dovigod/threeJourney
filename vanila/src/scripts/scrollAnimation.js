import '../style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('/gradients/3.jpg');
// 3pixel , light , white , no light ,black
//default , pick the mixed one between 
//to fix, set magfilterxr
gradientTexture.magFilter = THREE.NearestFilter;

const init = () => {
    const parameters = {
        materialColor: '#ffeded'
    }
    
    
    /**
     * Base
     */
    // Canvas
    const canvas = document.querySelector('canvas.webgl')
    
    // Scene
    const scene = new THREE.Scene()
    
    /**
     * Test cube
     */

    const material = new THREE.MeshToonMaterial({
        color : parameters.color,
        gradientMap : gradientTexture
    })

    const objectsDistance = 4;
    const mesh1 = new THREE.Mesh(
        new THREE.TorusBufferGeometry(1,0.4 ,16 , 100),
        material
    )
    const mesh2 = new THREE.Mesh(
        new THREE.ConeGeometry(1,0.4 ,16 , 100),
        material
    )
    const mesh3 = new THREE.Mesh(
        new THREE.TorusKnotBufferGeometry(0.8,0.35 ,100 , 16),
        material
    )

    mesh1.position.y = -objectsDistance * 0;
    mesh2.position.y = -objectsDistance * 1;
    mesh3.position.y = -objectsDistance * 2;

    mesh1.position.x = 2;
    mesh2.position.x = -2;
    mesh3.position.x = 2;

    scene.add(mesh1 , mesh2 ,mesh3);

    const sectionMeshes = [mesh1 , mesh2 ,mesh3];

    const count = 5000;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
        size : 0.02,
        sizeAttenuation : true,
        depthWrite : false,
        color : parameters.materialColor
    })
    const positions = new Float32Array(count * 3);

    for(let i = 0 ; i < count ; i++){
        const i3 = i * 3;

        positions[i3 + 0] = (Math.random()- 0.5) * 10
        
        //move half the size of each object 중심이 0 , 위로 반이 오브젝트 거리의 반 , 여기서 매쉬 개수 , 거리의 곱을 랜덤
        positions[i3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length;
        positions[i3 + 2] = (Math.random()- 0.5) * 10
    }

    particleGeometry.setAttribute('position' , new THREE.BufferAttribute(positions, 3));

    const particles = new THREE.Points(particleGeometry , particleMaterial);

    scene.add(particles)




    //light 
    const directionalLight = new THREE.DirectionalLight(0xffffff , 1);
    directionalLight.position.set(1,1,0);
    scene.add(directionalLight);

    gui.addColor(parameters, 'materialColor').onChange(()=>{
        material.color.set(parameters.materialColor)
    });

    
    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    
    window.addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
    
        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
    
        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    
    /**
     * Camera
     */
    // Base camera
    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup)
    const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
    camera.position.z = 6
    cameraGroup.add(camera)
    
    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha : true
    })
    renderer.setClearAlpha(0); // default
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //scroll
    let scrollY = window.scrollY;
    let currentSection = 0;
    window.addEventListener('scroll' , (e) => {
        scrollY = window.scrollY;
        const newSection =Math.round(scrollY / sizes.height);

        if(newSection != currentSection){
            currentSection = newSection;

            gsap.to(
                sectionMeshes[currentSection].rotation,
                {
                    duration : 1.5,
                    ease : 'power2.inOut',
                    x: '+=6',
                    y: '+=3'
                }
            )
        }
    })
    //cursor
    const cursor = {
      x: 0,
      y : 0  
    };

    window.addEventListener('mousemove' , (e) =>{
        cursor.x = e.clientX  / sizes.width - 0.5;
        cursor.y = e.clientY / sizes.height - 0.5;
        //by this independent to resolution
    })
    /**
     * Animate
     */
    const clock = new THREE.Clock()
    let previousTime = 0;
    const tick = () =>
    {
        const elapsedTime = clock.getElapsedTime()

        // 어느 모니터든간에 프레임 레이트 맞추기
        const deltaTime = elapsedTime - previousTime;
        previousTime = elapsedTime;
        //animate camera;
        camera.position.y = -scrollY / sizes.height * objectsDistance;

        const parallaxX = cursor.x * .5;
        const parallaxY = -cursor.y * .5;
        cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
        cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime; // smoothing , easing 관성
        //animate mesh
        for(const mesh of sectionMeshes){
            mesh.rotation.x += deltaTime * 0.1;
            mesh.rotation.y += deltaTime * 0.12;
        }
    
        // Render
        renderer.render(scene, camera)
    
        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }
    
    tick()

}


export default init;

