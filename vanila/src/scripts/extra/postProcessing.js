import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {DotScreenPass} from 'three/examples/jsm/postprocessing/DotScreenPass';
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass';
import {RGBShiftShader} from 'three/examples/jsm/shaders/RGBShiftShader';
import {GammaCorrectionShader} from 'three/examples/jsm/shaders/GammaCorrectionShader';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {SMAAPass} from 'three/examples/jsm/postprocessing/SMAAPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { getUnit } from 'gsap';
/**
 * Base
 */

const init = () => {
    // Debug
    const gui = new dat.GUI()

    // Canvas
    const canvas = document.querySelector('canvas.webgl')

    // Scene
    const scene = new THREE.Scene()

    /**
     * Loaders
     */
    const gltfLoader = new GLTFLoader()
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    const textureLoader = new THREE.TextureLoader()

    /**
     * Update all materials
     */
    const updateAllMaterials = () =>
    {
        scene.traverse((child) =>
        {
            if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
            {
                child.material.envMapIntensity = 2.5
                child.material.needsUpdate = true
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    /**
     * Environment map
     */
    const environmentMap = cubeTextureLoader.load([
        'environmentMaps/0/px.jpg',
        'environmentMaps/0/nx.jpg',
        'environmentMaps/0/py.jpg',
        'environmentMaps/0/ny.jpg',
        'environmentMaps/0/pz.jpg',
        'environmentMaps/0/nz.jpg'
    ])
    environmentMap.encoding = THREE.sRGBEncoding

    scene.background = environmentMap
    scene.environment = environmentMap

    /**
     * Models
     */
    gltfLoader.load(
        '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
        (gltf) =>
        {
            gltf.scene.scale.set(2, 2, 2)
            gltf.scene.rotation.y = Math.PI * 0.5
            scene.add(gltf.scene)

            updateAllMaterials()
        }
    )

    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.camera.far = 15
    directionalLight.shadow.normalBias = 0.05
    directionalLight.position.set(0.25, 3, - 2.25)
    scene.add(directionalLight)

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


        //update effect composer
        effectComposer.setSize(sizes.width, sizes.height)
        effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    })

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.set(4, 1, - 4)
    scene.add(camera)

    // Controls
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.physicallyCorrectLights = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ReinhardToneMapping
    renderer.toneMappingExposure = 1.5
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    //tint pass

    //tDiffuse = get  texture from previouspass

    // in order to picj right pixel colors on texture , use texture 2D + uv coord
    const TintShader = {
        uniforms  :{
            tDiffuse : {value : null},
            uTint : { value : null}
        },
        vertexShader: `
            varying vec2 vUv;
            void main()
            {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position , 1.0);
                vUv = uv;
            }
        `,
        fragmentShader:`
            uniform sampler2D tDiffuse;
            uniform vec3 uTint;
            varying vec2 vUv;

            void main()
            {
                vec4 color = texture2D(tDiffuse , vUv);
                color.rgb += uTint;
                gl_FragColor = vec4(color);
            }
        `
    }
    const tintPass = new ShaderPass(TintShader);
    tintPass.material.uniforms.uTint.value = new THREE.Vector3(0,0,0);
    gui.add(tintPass.material.uniforms.uTint.value,'x',-1,1,0.001).name('red');
    gui.add(tintPass.material.uniforms.uTint.value,'y',-1,1,0.001).name('green');
    gui.add(tintPass.material.uniforms.uTint.value,'z',-1,1,0.001).name('blue');


    //displacement Pass
    const DisplacementPass = {
        uniforms  :{
            tDiffuse : {value : null},
            uNormalMap : {
                value : null
            }
            // uTime : {value : 0}
        },
        vertexShader: `
            varying vec2 vUv;
            void main()
            {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position , 1.0);
                vUv = uv;
            }
        `,
        fragmentShader:`
            uniform sampler2D tDiffuse;
            varying vec2 vUv;
            uniform sampler2D uNormalMap;

            void main()
            {
                vec3 normalColor = texture2D(uNormalMap , vUv).xyz * 2.0 - 1.0;
                vec2 newUv = vUv + normalColor.xy * 0.1;
                vec4 color = texture2D(tDiffuse , newUv);
                vec3 lightDirection = normalize(vec3(-1.0 , 1.0 , 0.0));
                float lightness = clamp(dot(normalColor , lightDirection),0.0,1.0);
                color.rgb += lightness * 2.0;
                gl_FragColor = vec4(color);
            }
        `
    }
    //newUv.y += 0.4;
    const disPlacementPass = new ShaderPass(DisplacementPass);
    disPlacementPass.enabled = true;
    disPlacementPass.material.uniforms.uNormalMap.value = textureLoader.load('/textures/interfaceNormalMap.png')


    // Post Processing

    //antialias : sample = higher = beter antialias, bad perfformance 
    //method 1
    const renderTarget = new THREE.WebGLRenderTarget(
        800,
        600,
        {
            samples : renderer.getPixelRatio() === 1 ? 2 : 0
        }
    )
    //method 2 : use antialias pass
    /*
    FXAA : performant , but result is just ok , can be blurry
    SMAA : better than FXAA but less performant
    SSAA : best quality ,worst performance
    TAA : performant , limitedd result
    etc ...
    //기본 렌더러에서 제공 : MSAA
     */

    const effectComposer = new EffectComposer(renderer,renderTarget);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(sizes.width, sizes.height)

    const renderPass = new RenderPass(scene,camera);
    effectComposer.addPass(renderPass);

    const dotScreenPass = new DotScreenPass();
    dotScreenPass.enabled = false;
    effectComposer.addPass(dotScreenPass);

    const glitchPass = new GlitchPass();
    glitchPass.goWild = false;
    glitchPass.enabled = false;
    effectComposer.addPass(glitchPass);

    const unRealBloomPass = new UnrealBloomPass();

    // strength , radius , threshold
    // how stroung is glow , how far brightness can spread , at what luminosity limit things start to glow
    unRealBloomPass.strength = 0.3;
    unRealBloomPass.radius = 1
    unRealBloomPass.threshold = 0.3;
    unRealBloomPass.enabled = false;
    effectComposer.addPass(unRealBloomPass);
    
    gui.add(unRealBloomPass,'enabled');
    gui.add(unRealBloomPass, 'strength' , 0, 2 , 0.001)
    gui.add(unRealBloomPass, 'radius' , 0, 2 , 0.001)
    gui.add(unRealBloomPass, 'threshold' , 0, 2 , 0.001)
    
    const rgbShiftPass = new ShaderPass(RGBShiftShader)
    rgbShiftPass.enabled = false;
    effectComposer.addPass(rgbShiftPass);
    //since we r using effectcomposer , colors are darker
    // renderer.outputEncoding doesnt work cuz we are rendering inside render target and those target dont support encoding
    // to fix , add gammacorrectionShader !! at last!!
    

    //custom pass
    effectComposer.addPass(tintPass);
    effectComposer.addPass(disPlacementPass);

    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    effectComposer.addPass(gammaCorrectionPass);

    //if resize , resolution brokes , handle resize is nessesary
    // + fix antialias
    // to see it, make sure to have one more pass than renderPass
    // effect composer is using rendertarget without antialias
    /*
        1. provide our own render target on which we add antialias but wont support on all modern browser
        2. use a pass to do the antialias but with lesser performances and a slightly different result
        3. combination of the two previous options
     */
    if(renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2){
        const smaaPass = new SMAAPass();
        effectComposer.addPass(smaaPass);
        console.log("use SMAA Pass");
    }
    

    /**
     * Animate
     */
    const clock = new THREE.Clock()

    const tick = () =>
    {
        const elapsedTime = clock.getElapsedTime()
        // disPlacementPass.material.uniforms.uTime.value = elapsedTime;
        // Update controls
        controls.update()

        // Render
        // renderer.render(scene, camera)
        effectComposer.render();

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }

    tick()
}


export default init;

//post-processing : adding effect on final effect
/* 
depth of field
bloom
god ray
motion blur
glitch effect
outlines
color variations
antialiasing
reflections and refraction
etc
*/

//1.render target : its like texture! 여기다가 이펙트 넣고 렌더러에 넣는다
/*
    instead of rendering in canvas, do it in render target(buffer)
    like rendering in a texture to be used later

    effects == called passes
    we can do multiple passes

    frame buffer 라고 생각하자
    while reading render target, cant write..
    so make 2 render target to switch

    after all effect added, pass to canvas
 */