// https://iquilezles.org/www/articles/palettes/palettes.htm

var WINDOW_HEIGHT = 400;
var WINDOW_WIDTH  = 800;

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

class ImpulsePanel
{
  constructor(osc, numPts, x, y, panelLen)
  {
    this.osc = osc;
    this.numPts = numPts;
    this.x = x;
    this.y = y;
    this.ptSpacing = panelLen/numPts;
    this.panelLen = panelLen;
    this.panelHeight = 30;
  }

  draw()
  {
    this.osc.reset();
    stroke([0, 0, 0]);
    strokeWeight(1);
    rect(this.x, this.y, this.panelLen, this.panelHeight);
    for (var i = 0; i < this.numPts; i++)
    {
      var val = this.osc.getVal() * -1; // -1 due to y starting at 0 at the top
      strokeWeight(2);
      var ptX = this.x + (this.ptSpacing * i);
      var ptY = this.y + this.panelHeight / 2 + ((this.panelHeight / 2) * val);
      point(ptX, ptY);
      this.osc.update();
    }
    this.osc.reset();
  }
}

class Canvas 
{
  constructor()
  {
    this.osc1 = new Oscillator(0, 1, 1/FRAME_PER_SECOND);
    this.pan1 = new ImpulsePanel(this.osc1, 200, 200, 0, WINDOW_WIDTH - 200);

    this.imp1 = new Impulse(1/FRAME_PERIOD_MS);
    this.pan2 = new ImpulsePanel(this.imp1, 200, 200, 30, WINDOW_WIDTH - 200);
  }

  getBoxInput()
  {
  }

  setBoxInput()
  {
  }

  updateCanvas()
  {
    this.osc1.update();
  }

  drawOnce()
  {
    this.pan1.draw();
    this.pan2.draw();
  }

  drawCanvas()
  {
    var val = this.osc1.getVal();
    var x = 100;
    var y = WINDOW_HEIGHT / 2;
    var r = 100;
    fill([0, 0, 100]);
    rect(x - 50, y - 150, 100, 350);
    stroke(DEFAULT_STROKE_COLOR);
    strokeWeight(STROKE_WEIGHT);
    point(x, y + (r * val));
  }

  saveFrame()
  {
    var filename = "iq-" + str(this.frameId).padStart(5, "0");
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
  if (!drawnPanels)
  {
    myCanvas.drawOnce();
    drawnPanels = !drawnPanels;
  }
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
    fpsAvgArr.push(fps);
    if (fpsAvgArr.length > 20)
    {
      fpsAvgArr.shift();
    }
    stroke([0, 0, 100]);
    textSize(20);
    text(fps, 0, WINDOW_HEIGHT - (WINDOW_HEIGHT/15));
    const average = (array) => array.reduce((a, b) => a + b) / array.length;
    avg = average(fpsAvgArr);
    text(avg, 60, WINDOW_HEIGHT - (WINDOW_HEIGHT/15));
  }
}
