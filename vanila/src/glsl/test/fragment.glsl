precision mediump float;
// decide precision of float
/*
highp 0.000000000000~~1 : can have performance hit
mediump 0.00000001~
lowp 0.001~
*/

uniform vec3 uColor;
uniform sampler2D uTexture;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;
// get custom value from main script
void main()
{



    vec4 textureColor = texture2D(uTexture , vUv); // texture ,  coordinates of texture we want to take

    // gl_FragColor=vec4(vRandom,vRandom * 0.5,1.0,1.);
    //need transparent true to lower alpha more than 1.0
    //colors are interpolated
    // gl_FragColor = vec4(uColor,1.0);

    textureColor.rgb *= vElevation * 2.0 + 0.5;
    gl_FragColor = textureColor;
}