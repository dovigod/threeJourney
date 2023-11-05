precision mediump float;
varying vec2 vUv;


void main()
{
    //pattern 3
    // float strength = 1.0 - vUv.y;

    //pattern 4
    // float strength = vUv.y * 10.0;

    //pattern 5 : stair 
    // float strength = mod(vUv.y , 0.1) * 10.0;

    //pattern 6: descrete stair
    // float strength = sign(mod(vUv.y * 10.0 , 1.0)  - 0.5);
    // float strength = mod(vUv.y* 10.0 , 1.0);
    // strength = step(0.5, strength);

    //pattern 7 : smaller stair
    // float strength = mod(vUv.y* 10.0 , 1.0);
    // strength = step(0.8, strength);

    //pattern 8 : cross stair
    // float strength = mod(vUv.x* 10.0 , 1.0);
    // strength = step(0.8, strength);

    //pattern 9 : grid

    // float strengthX = mod(vUv.x* 10.0 , 1.0);
    // strengthX = step(0.8, strengthX);
    // float strengthY = mod(vUv.y * 10.0 , 1.0);
    // strengthY = step(0.8 , strengthY);

    // float strength = strengthX + strengthY;

    //pattern 10 : dots

    // float strengthX = mod(vUv.x* 10.0 , 1.0);
    // strengthX = step(0.8, strengthX);
    // float strengthY = mod(vUv.y * 10.0 , 1.0);
    // strengthY = step(0.8 , strengthY);

    // float strength = strengthX * strengthY;

    //pattern 13 : little bit long line
    //   float strengthX = mod(vUv.x* 10.0 , 1.0);
    // strengthX = step(0.8, strengthX);
    // float strengthY = mod(vUv.y * 10.0 , 1.0);
    // strengthY = step(0.8 , strengthY);

    // float strength = strengthY - strengthX;


    // float strengthX = mod(vUv.x* 10.0 , 1.0);
    // strengthX = step(0.4, strengthX);
    // float strengthY = mod(vUv.y * 10.0 , 1.0);
    // strengthY = step(0.8 , strengthY);

    // float strength = strengthY * strengthX;

    //pattern 14 : ㄱ자


    //modulo for changing x , y coordinate로 활용!
    float strengthX = mod(vUv.x* 10.0 -0.2 , 1.0);
    strengthX = step(0.4, strengthX) ;
    strengthX *= step(0.8 , mod(vUv.y *10.0  , 1.0));

    float strengthY = mod(vUv.y * 10.0 -0.2 , 1.0);
    strengthY = step(0.4 , strengthY);
    strengthY *= step(0.8 , mod(vUv.x * 10.0 , 1.0));

    float strength = strengthX + strengthY;
    




    gl_FragColor = vec4(vec3(strength),1.0);
}