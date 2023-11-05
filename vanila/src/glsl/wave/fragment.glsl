
uniform float uBigWaveElevation;
uniform vec3 uSurfaceColor;
uniform vec3 uDepthColor;
uniform float uWaveColorMultiplier;
uniform float uWaveColorOffset;

varying float vElevation;

void main(){
    
    float mixStrength=(uWaveColorOffset+vElevation)*uWaveColorMultiplier;
    vec3 color=mix(uDepthColor,uSurfaceColor,mixStrength);
    gl_FragColor=vec4(color,1.);
    
}