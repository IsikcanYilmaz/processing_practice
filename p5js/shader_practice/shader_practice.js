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
  createCanvas(width, height, WEBGL);
  noStroke()
}

function draw()
{
  // shader() sets the active shader with our shader
  shader(theShader);

  theShader.setUniform('resolution', [width, height]);
  //theShader.setUniform('mouse', map(mouseX, 0, width, 0, 7)); // map processing function. remaps number from one range to another. map(value, start1, stop1, start2, stop2)
  var x = (30 * mouseX / width);
  var y = (30 * mouseY / height);
  theShader.setUniform('mouseX', x);
  theShader.setUniform('mouseY', y);
  console.log(x, y);
  theShader.setUniform('time', frameCount * 0.01);

  // rect gives us some geometry on the screen
  rect(0,0,width,height);
  
  // print out the framerate
  //  print(frameRate());
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
