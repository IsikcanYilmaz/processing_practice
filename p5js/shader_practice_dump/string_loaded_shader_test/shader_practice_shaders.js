//Projname:  shader_practice Shader files:  shader_practice.vert shader_practice.frag 

vert = 
'precision mediump float;' + 
'attribute vec3 aPosition;' + 
'attribute vec2 aTexCoord;' + 
'void main() {' + 
'vec4 positionVec4 = vec4(aPosition, 1.0);' + 
'positionVec4.xy = positionVec4.xy * 2.0 - 1.0;' + 
'gl_Position = positionVec4;' + 
'}';

frag = 
'uniform vec2 resolution; ' + 
'uniform float time;' + 
'uniform vec2 mouse;' + 
'uniform vec2 gridSize;' + 
'uniform vec2 cellSize;' + 
'vec3 rgb(float r, float g, float b){' + 
'return vec3(r / 255.0, g / 255.0, b / 255.0);' + 
'}' + 
'void main()' + 
'{' + 
'vec2 st = gl_FragCoord.xy / resolution;' + 
'vec2 mo = mouse / resolution;' + 
'float x = st.x;' + 
'float y = st.y;' + 
'gl_FragColor = vec4(0.4, 0.2, 0.6, 1);' + 
'}';

