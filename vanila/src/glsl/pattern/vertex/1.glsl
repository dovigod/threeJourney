uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec2 uv;


varying vec2 vUv;

// uv 는 좌측 하단에서 우측하단으로 원점 -> 끝 , 이걸 이용해 모든걸 다함
void main(){

    
    vec4 modelPosition = modelMatrix * vec4(position , 1.0);

    vec4 viewPosition = viewMatrix * modelPosition;

    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vUv = uv;
}