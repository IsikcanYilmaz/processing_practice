var WINDOW_HEIGHT = 800;
var WINDOW_WIDTH  = 800;

var H_MAX = 360;
var S_MAX = 100;
var V_MAX = 100;

var DEFAULT_BACKGROUND = [0, 0, 0];
var DEFAULT_STROKE_COLOR = [250, 0, 100];

var DEBUGVISUALS = false;

var PI  = Math.PI;
var TAU = Math.PI * 2;

////////////////////////

var SAVE_FRAMES = false;
var SAVE_FRAMES_BLACKOUT_THRESHOLD = 1;

var FRAME_LIMITING = false;
var FRAME_PER_SECOND = 60;
if (SAVE_FRAMES)
{
  FRAME_LIMITING = true;
  FRAME_PER_SECOND = 15;
}
var FRAME_PERIOD_MS = 1000 / FRAME_PER_SECOND;

let capture;

////////////////////////

class Canvas 
{
  constructor()
  {
  }

  updateCanvas()
  {
  }

  drawCanvas()
  {
  }

  drawDebugPanel()
  {
  }

  saveFrame()
  {
  }
}

////////////////////////

function mouseMoved()
{
}

function mouseWheel()
{
}

function mousePressed()
{
  console.log("MOUSE CLICK", mouseX, mouseY, (mouseX/WINDOW_WIDTH)%1, (mouseY/WINDOW_HEIGHT)%1);
}

function keyPressed()
{
  console.log("KEY PRESSED", key);
}

function keyReleased()
{
  console.log("KEY RELEASED", key);
}


////////////////////////

myCanvas = new Canvas();
p5jsCanvas = undefined;
function setup()
{
  p5jsCanvas = createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  capture = createCapture(VIDEO);
  capture.hide();
}

var lastFrameTs = 0;
var fps = 0;
var timeSinceLastFrameMsMs = 0;
function draw()
{
  image(capture, 0, 0, WINDOW_HEIGHT, WINDOW_WIDTH * capture.height / capture.width);
  filter(THRESHOLD, (mouseX/WINDOW_WIDTH)%1);
}
