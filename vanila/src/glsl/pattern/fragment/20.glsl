precision mediump float;


#define PI 3.1415926535897932
varying vec2 vUv;



vec2 rotate(vec2 uv ,float rotation , vec2 pivot)
{
    return vec2(
        cos(rotation) * (uv.x - pivot.x) + sin(rotation) * (uv.y - pivot.y) + pivot.x,
        cos(rotation) * (uv.y - pivot.y) - sin(rotation) * (uv.x - pivot.x) + pivot.y
    );
}

float random(vec2 st){
    return fract(sin(dot(st.xy , vec2(12.9898,78233))) * 437558.5453123); 
}

void main(){


    //pattern 20 :: grid

    // float strengthX = floor(vUv.x* 10.0 ) / 10.0;
    // float strengthY = floor(vUv.y* 10.0 ) / 10.0;
    // float strength = strengthX * strengthY ;

    //pattern 21
    // float strength = random(vUv);

    //pattern 22
    // 중요
    // vec2 gridUv = vec2(
    //     floor(vUv.x* 10.0 ) / 10.0,
    //     floor(vUv.y* 10.0 ) / 10.0
    // );
    // float strength = random(gridUv);


    //pattern 23 cell shape
    //     vec2 gridUv = vec2(
    //     floor(vUv.x* 10.0 ) / 10.0,
    //     floor((vUv.y + vUv.x * 0.5)* 10.0 ) / 10.0 
    // );
    // float strength = random(gridUv);

    //pattern 24 : shading , length of vector
    // float strength = length(vUv);

    //pattern 25 : shade oncenter

    // vec2 vector = vec2( abs(vUv.x-0.5) , abs(vUv.y - 0.5));

    // float strength = distance(vUv , vec2(0.5,0.5));

    // strength = 1.0 - strength;

    //pattern 26 : spot light

    // float strength =  0.015 / distance(vUv, vec2(0.5)); //dropping really fast , when + number , ==> ambient light


    //pattern 27 : stretched spot light
    // float strength = 0.015 / distance(vec2(vUv.x *0.1 + 0.45 , vUv.y * 0.5 + 0.25) , vec2(0.5));


    //pattern 28 : star
    // vec2 lightX = vec2(vUv.x*0.1 + 0.45 , vUv.y* 0.5 + 0.25);
    // vec2 lightY = vec2(vUv.x * 0.5 + 0.25, vUv.y*0.1 + 0.45);

    // float strength = (0.01 / distance(lightX , vec2(0.5) )) * (0.01 / distance(lightY , vec2(0.5)));
    //pattern 29 : rotate star

    vec2 rotatedUv = rotate(vUv , PI * 0.25 , vec2(0.5)); // pivot point at last
    vec2 lightX = vec2(rotatedUv.x*0.1 + 0.45 , rotatedUv.y* 0.5 + 0.25);
    vec2 lightY = vec2(rotatedUv.x * 0.5 + 0.25, rotatedUv.y*0.1 + 0.45);

    float strength = (0.01 / distance(lightX , vec2(0.5) )) * (0.01 / distance(lightY , vec2(0.5)));

    

    gl_FragColor = vec4(vec3(strength),1.0);
}
