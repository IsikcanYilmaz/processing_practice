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
// I/O
// Mouse
function mouseClickedGeneric(arr)
{
  var [x, y] = arr;
  myCanvas.mouseInput(x, y);
}

function mouseDragged()
{
  mouseClickedGeneric([mouseX, mouseY]);
}

function mouseMoved()
{
}

function mouseWheel()
{
}

// Keyboard
function keyPressedGeneric(arr)
{
  var [k, x, y] = arr;
  var mx = x || 0;
  var my = y || 0;
  console.log("KEY PRESSED", k, "WITH", x, y, arr);
}

function keyPressed()
{
  keyPressedGeneric([key, mouseX, mouseY]);
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
  colorMode(HSB, H_MAX, S_MAX, V_MAX);
  background(DEFAULT_BACKGROUND);
  textSize(12);
  smooth(8);
}

var lastFrameTs = 0;
var fps = 0;
var timeSinceLastFrameMsMs = 0;
function draw()
{
  var frameTs = Date.now();
  if (lastFrameTs != 0)
  {
    timeSinceLastFrameMsMs = frameTs - lastFrameTs;
    fps = int(1000 / timeSinceLastFrameMsMs);

    if (FRAME_LIMITING && timeSinceLastFrameMsMs < FRAME_PERIOD_MS)
    {
      return;
    }
  }
  lastFrameTs = frameTs;
  myCanvas.updateCanvas();
  myCanvas.drawCanvas();
  myCanvas.drawDebugPanel();
}
