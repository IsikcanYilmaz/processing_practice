#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 resolution; // This is passed in as a uniform from the sketch.js file
uniform float time;
uniform vec2 mouse;
uniform vec2 gridSize;
uniform vec2 cellSize;

// this is a function that turns an rgb value that goes from 0 - 255 into 0.0 - 1.0
vec3 rgb(float r, float g, float b){
  return vec3(r / 255.0, g / 255.0, b / 255.0);
}

void main()
{
  vec2 st = gl_FragCoord.xy / resolution;
  vec2 mo = mouse / resolution;
  
  float x = st.x;
  float y = st.y;

  gl_FragColor = vec4(st.x * mo.x, 0.0, st.y * mo.y, 1);



}
