

varying vec3 vColor;
void main(){
    
    float circle=distance(gl_PointCoord,vec2(.5));
    
    //diffusion
    // circle*=2.;
    // circle=1.-circle;
    
    //light point
    
    circle=1.-circle;
    circle=pow(circle,10.);
    
    //finall color
    vec3 color=mix(vec3(0.),vColor,circle);
    
    gl_FragColor=vec4(vec3(color),1.);
}