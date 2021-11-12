#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 resolution; // This is passed in as a uniform from the sketch.js file
uniform float time;
uniform float mouseX;
uniform float mouseY;

// this is a function that turns an rgb value that goes from 0 - 255 into 0.0 - 1.0
vec3 rgb(float r, float g, float b){
  return vec3(r / 255.0, g / 255.0, b / 255.0);
}

void main()
{
  vec2 st = gl_FragCoord.xy / resolution;
  vec3 c = rgb(10.0, 10.0, 2.0);
  //if (gl_FragCoord.x > 40.0)
  //{
    //gl_FragColor = vec4(0, 1, 1, 1);
  //}
  //else if (gl_FragCoord.x < resolution.x - 10.0)
  //{
    //gl_FragColor = vec4(0, 0, 1, 1);
  //}
  //else
  //{
    //gl_FragColor = vec4(1, 0, 1, 1);
  //}

  gl_FragColor = vec4(mod(gl_FragCoord.x, 512.0)/256.0, 1, 1, 1);
}
