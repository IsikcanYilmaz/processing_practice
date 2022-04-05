// https://iquilezles.org/www/articles/palettes/palettes.htm

var WINDOW_HEIGHT = 600;
var WINDOW_WIDTH  = 600;

var R_MAX = 100;
var G_MAX = 100;
var B_MAX = 100;

var H_MAX = 360;
var S_MAX = 100;
var V_MAX = 100;

var DEFAULT_BACKGROUND = [0, 0, 100];
var DEFAULT_STROKE_COLOR = [250, 100, 100];

var STROKE_WEIGHT = 10;

var PI  = Math.PI;
var TAU = Math.PI * 2;

////////////////////////

var SAVE_FRAMES = false;
var SAVE_FRAMES_BLACKOUT_THRESHOLD = 1;

var FRAME_LIMITING = true;
var FRAME_PER_SECOND = 60;
if (SAVE_FRAMES)
{
  FRAME_LIMITING = true;
  FRAME_PER_SECOND = 15;
}
var FRAME_PERIOD_MS = 1000 / FRAME_PER_SECOND;

var DEBUG_FPS = true;

class WavePanel
{
  constructor(x, y, height, pts)
  {
    this.x = x;
    this.y = y;
    this.height = height;
    this.pts = pts;
  }

  update()
  {

  }

  draw()
  {

  }
}

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

  saveFrame()
  {
    var filename = "waves-" + str(this.frameId).padStart(5, "0");
    saveCanvas(p5jsCanvas, filename, "jpg");
  }
}

////////////////////////

function refreshButtonPressed()
{
  myCanvas.getBoxInput();
}

function mouseMoved()
{
}

function mouseWheel()
{
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
  colorMode(HSB, H_MAX, S_MAX, V_MAX);
  background(DEFAULT_BACKGROUND);
  textSize(12);
  smooth(8);
}

var lastFrameTs = 0;
var fps = 0;
var timeSinceLastFrameMsMs = 0;
var fpsAvgArr = [];
var drawnPanels = false;
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

  if (DEBUG_FPS)
  {
  }
}
