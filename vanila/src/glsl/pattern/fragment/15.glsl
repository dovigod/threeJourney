precision mediump float;
varying vec2 vUv;


void main()
{


    //pattern 15 : decalcomany
    // float strength = vUv.x;
    // // strength = strength > 0.5 ? strength*2.0 -1.0 : 1.0 - strength*2.0;
    // strength = abs(vUv.x -0.5);

    //pattern 16 : xy symmetry
    
    // float strengthX = abs(vUv.x - 0.5);
    // float strengthY = abs(vUv.y - 0.5);
    // float strength = min(strengthX ,strengthY);

    //pattern 17 : reflect of 16
    // float strengthX = abs(vUv.x - 0.5);
    // float strengthY = abs(vUv.y - 0.5);
    // float strength = max(strengthX  , strengthY);

    //pattern 18 : rect donut
    // float strengthX = abs(vUv.x - 0.5);
    // strengthX = step(0.4 , strengthX * 2.0);
    //  float strengthY = abs(vUv.y - 0.5);
    // strengthY = step(0.4 , strengthY * 2.0);
    // // float strength = strengthX + strengthY;

    // //step ; limit of value
    // float strength = step(0.2 , max(abs(vUv.x - 0.5) , abs(vUv.y - 0.5)));

    //pattern 19 : thinner donut rect
    // float strength = step(0.8 , max( abs(vUv.x - 0.5) , abs(vUv.y -0.5)) * 2.0);
    float square1 = step(0.2 , max(abs(vUv.x - 0.5) , abs(vUv.y - 0.5)));
    float square2 = 1.0 - step(0.25 , max(abs(vUv.x - 0.5) , abs(vUv.y - 0.5)));
    float strength = square1 * square2;


    gl_FragColor = vec4(vec3(strength),1.0);
}