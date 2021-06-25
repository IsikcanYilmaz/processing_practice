var WINDOW_HEIGHT = 600
var WINDOW_WIDTH  = 600

var H_MAX = 360
var S_MAX = 100
var V_MAX = 100

var DEFAULT_BACKGROUND = [0, 0, 100]

////////////////////////



////////////////////////

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

////////////////////////

// a shader variable
let theShader;

function preload(){
  // load the shader
  theShader = loadShader('shader_practice.vert', 'shader_practice.frag');
}

function setup()
{
  createCanvas(WINDOW_HEIGHT, WINDOW_WIDTH, WEBGL);
  noStroke()
}

function draw()
{
  theShader.setUniform('u_resolution', [width, height]);

  // shader() sets the active shader with our shader
  shader(theShader);

  // rect gives us some geometry on the screen
  rect(0,0,width,height);
  
  // print out the framerate
  //  print(frameRate());
}

