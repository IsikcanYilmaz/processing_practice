var WINDOW_HEIGHT = 512
var WINDOW_WIDTH  = 512

var H_MAX = 360
var S_MAX = 100
var V_MAX = 100

var DEFAULT_BACKGROUND = [0, 0, 100]

////////////////////////



////////////////////////

var GRID_SIZE_X = 16;
var GRID_SIZE_Y = 16;

var CELL_SIZE_X = (WINDOW_WIDTH / GRID_SIZE_X); 
var CELL_SIZE_Y = (WINDOW_HEIGHT / GRID_SIZE_Y); 

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

////////////////////////

// a shader variable
let theShader;

function preload(){
  // load the shader
  //theShader = loadShader('shader_practice.vert', 'shader_practice.frag');
}

function setup()
{
  pixelDensity(1); // disable scaling for retina displays
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT, WEBGL);
  theShader = createShader(vs, fs);
  noStroke()
}

function draw()
{
  // shader() sets the active shader with our shader
  shader(theShader);

  theShader.setUniform('resolution', [WINDOW_WIDTH, WINDOW_HEIGHT]);
  theShader.setUniform('mouse', [mouseX, mouseY]);
  theShader.setUniform('gridSize', [GRID_SIZE_X, GRID_SIZE_Y]);
  theShader.setUniform('cellSize', [CELL_SIZE_X, CELL_SIZE_Y]);
  theShader.setUniform('time', frameCount * 0.01);

  // rect gives us some geometry on the screen
  rect(0,0,WINDOW_WIDTH,WINDOW_HEIGHT);
  
  // print out the framerate
  //  print(frameRate());
}

function mouseMoved()
{
  //console.log("X", mouseX/WINDOW_WIDTH, "Y", mouseY/WINDOW_HEIGHT);
}

function windowResized(){ // disable rescaling on window resizing
  resizeCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}
