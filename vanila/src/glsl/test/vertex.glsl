uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
// provided from three.js
// its uniform cuz its same for all vertice
//each matrix will transform position, until we get final clip space position
//matrix must have same size as vector , mat4 for vec4

//useful for having the same shader, but want different result.
//being able to tweak values
//animating the value
uniform vec2 uFrequency;
uniform float uTime;

//modelMatrix = apply transformations relative to Mesh(position , rotation , scale);
//viewMatrix = apply transformations relative to camera(position , rotation , fov , near , far)
// projectionMatrix = transform the coord into clipspace coordinates

//shorter version = modelViewMatrix ( model _ view)
attribute vec3 position;
// sent from geometry , Float32Array
attribute float aRandom; // float because we assigned only one
attribute vec2 uv;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main() //called automatically
{
  

    //vec4(position,1.) need to convert to vec4
    //  gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);
     //gl_Position: already exist , need to assign it , will contain the position of the vertex on the screen
    // gl_Position.x +=0.5; // can do it, but dont do this..

    //base position transform to model position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);


       //add more shadow depending on elevation
    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * .1;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
    modelPosition.z += elevation;

    // modelPosition.y += 1.0;

    //사인 함수 내부가 커질수록 빈도수 상승
  

    // modelPosition += aRandom * 0.1;



    vec4 viewPosition = viewMatrix * modelPosition;



    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    vRandom = aRandom;
    vUv = uv;
    vElevation = elevation;
    vFrequency = uFrequency;
    vTime = uTime;
}


//why vec4 needed on gl_position
/*
 our coordinates , is in fact clip space ( liike a box);
so, x , y , z is about coordinates in clip space,  4th val is for perspective..?(homogenius coordinate)

*/

// no console,  since this isn't handled by CPU
// glsl is typed  Language, so specify variable type == better for memory
// operation + - * / works

//types
/*
 float
 int
 bool
 vec2 : store 2coordinates
 vec3 : convinent for 3d , instead of using x,y,z <=> r,g,b also avail 
 vec4 : member w added , a is alias of w
 mat2
 mat3
 mat4
 sampler2D


 
*/

/*
    we can't mix different types
    ex) float a =1.0;
        int b= 2;
        float c = a* b;
        so , convert , float(b)
*/

/*
function

classic : sin ,cos ,max ,min, pow , exp ,mod, clamp

practical : cross , dot , mix , step , smoothstep,  length , distance , reflect , refract , normalize

*/





/*
session 1


float leremIpsum()
{
    float a = 1.0;
    float b = 2.0;

    return a + b;
}



  float a = 1.;
    int b = 2;
    float c = a * float(b);

    vec2 foo = vec2(-1.0 , 2.0);
    // vec2 errorv2 = vec2();
    // vec2 init0v2 = vec2(0.0);
    foo.x = 1.0;
    foo.y = 1.0;
    foo *= 2.0; // ==> 2.0 , 2.0

    vec3 bar = vec3(0.0);
    vec3 initbar = vec3(1.0,2.0,3.0);
    bar.z = 4.0;
    vec3 purpleCololr = vec3(0.0);
    purpleCololr.r = 0.5;
    purpleCololr.g = 0.5;
    purpleCololr.b = 1.0;

    vec2 partialVec = vec2(1.0,1.0);
    vec3 realVec3 = vec3(partialVec , 5.0); // === swizzle
    vec2 swizzling = realVec3.yx;

    float result = leremIpsum();
*/