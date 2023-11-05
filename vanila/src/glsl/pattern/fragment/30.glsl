precision mediump float;
#define PI 3.1415926535897932

varying float vFrequency;
varying float vTime;
varying vec2 vUv;

vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x + vFrequency / 100000.0, 289.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

void main(){

    //pattern 30 : hold

    // float strength = step(0.25 ,distance(vUv , vec2(0.5)));

    //pattern 31 : blur donut
    // float strength = abs(distance(vUv, vec2(0.5)) - 0.25);

    //pattern 32 : black circle
    // float strength = step(0.01 , abs(distance(vUv, vec2(0.5)) - 0.25));

    //pattern 33 : waved circle
    // vec2 wavedUv = vec2(
    //     vUv.x,
    //     vUv.y+sin(vUv.x * vFrequency) * 0.1
    // );
    // float strength = 1.0- step(0.01 , abs(distance(wavedUv, vec2(0.5)) - 0.25));


    //pattern 34 : weird flower
    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * vFrequency) * 0.1,
    //     vUv.y+sin(vUv.x * vFrequency) * 0.1
    // );
    // float strength = 1.0- step(0.01 , abs(distance(wavedUv, vec2(0.5)) - 0.25));

    //pattern 35 :  angle
    // float angle = atan(vUv.x , vUv.y);
    // float strength = angle
    
    //pattern 36 : starting from center;
    // float angle = atan(vUv.x -0.5 , vUv.y - 0.5);
    // float strength = angle;

    //pattern 37 : full circle gradient
    // float angle = atan(vUv.x -0.5 , vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float strength = angle;

    //pattern 38 : 일조기
    // float angle = atan(vUv.x -0.5 , vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // angle *= vFrequency;
    // angle = mod(angle , 1.0);
    // float strength = angle;

    //pattern 39 : 일조기 2
    //  float angle = atan(vUv.x -0.5 , vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float strength = sin(angle * 50.0);


    //pattern 40 : 꼬불꼬불 원
    // float angle = atan(vUv.x -0.5 , vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;


    // float sinusoid = sin( (angle) * 100.0) ;

    // float radius = 0.25 + sinusoid * 0.02  ;
    // float thickness = 0.01;
    // float circle = 1.0 -step(thickness, abs(distance(vUv, vec2(0.5)) - radius));


    // float strength = circle ;

    //pattern 41 : noise

    // float strength = cnoise(vUv * 4.0);

    //pattern 42 : descrete noise
    // float strength = step(0.10, cnoise(vUv * 10.0));

    //pattern 43 : displace map psedo

    // float strength =  1.0-abs(cnoise(vUv * 10.0));

    //pattern 44 : nice noise
    // float strength =  sin(cnoise(vUv * 10.0) * 11.0);
    //pattern 45 : sharper noise
    // float strength =  step(0.9 , sin(cnoise(vUv * 10.0) * 11.0));

    //pattern 46 : collor noise


    float strength =  step(0.9 , sin(cnoise(vUv * 10.0) * 11.0));

    vec3 blackColor = vec3(0.0);
    vec3 uvColor = vec3(vUv , 1.0);

//ex 격자 무늬 같은 경우 , 색감이 너무 높아 중첩 부위에 흰색으로 되는 부분이 있음 ,아래는 그에 대한 해결책
    strength = clamp(strength , 0.0, 1.0);
    vec3 mixedColor = mix(blackColor , uvColor , strength); //mix color depending on str

    
    gl_FragColor = vec4(mixedColor , 1.0);

}