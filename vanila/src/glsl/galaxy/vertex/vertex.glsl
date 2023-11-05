
attribute float aScale;
attribute vec3 aRandomness;

uniform float uPointSize;
uniform float uTime;

varying vec3 vColor;
void main(){
    
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    
    //spin
    // float angle=atan(modelPosition.x,modelPosition.z);
    // float distanceToCenter=length(modelPosition.xz);
    // float angleOffset=(1./distanceToCenter)*uTime*.2;
    
    // angle+=angleOffset;
    
    // modelPosition.x=cos(angle)*distanceToCenter;
    // modelPosition.z=sin(angle)*distanceToCenter;
    
    // modelPosition.xyz+=aRandomness.xyz;
    
    // 스핀 후 랜덤을 적용해야 리본 부작용 방지함
    
    // 요상태 이쁨
    float angle=atan(modelPosition.x,modelPosition.z);
    float distanceToCenter=length(modelPosition.xz);
    float angleOffset=(distanceToCenter)*uTime*.2;
    
    angle+=angleOffset;
    
    modelPosition.x=cos(angle);
    modelPosition.y=sin(angle);
    modelPosition.xyz+=aRandomness.xyz;
    vec4 viewPosition=viewMatrix*modelPosition;
    
    vec4 projectionPosition=projectionMatrix*viewPosition;
    
    gl_Position=projectionPosition;
    gl_PointSize=uPointSize*aScale;// two pixel , if high pixel ratio, increase it
    //control size
    gl_PointSize*=(1./-viewPosition.z);
    
    vColor=color;
    
}

// gl_PointSize *= ( 1.0 / - mvPosition.z );
// scale is a value related to the render height to make things manageable, we can replace it with 1.0
//반응형 생각하면됨

//how to draw pattern on point?  use uv , not varying , but gl_PointCoord
//because each vertex is particle