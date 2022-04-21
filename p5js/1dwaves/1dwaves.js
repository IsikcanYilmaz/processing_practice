var WINDOW_HEIGHT = 600;
var WINDOW_WIDTH  = 600;

var R_MAX = 100;
var G_MAX = 100;
var B_MAX = 100;

var H_MAX = 360;
var S_MAX = 100;
var V_MAX = 100;

var DEFAULT_BACKGROUND = [0, 0, 0];
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
    this.magOsc = new Oscillator(0, 0.01, 1/FRAME_PER_SECOND);
    this.freqOsc = new Oscillator(0, 0.005, 1/FRAME_PER_SECOND);
    this.oscillators = [];
    this.initFreq = 0.05;
    this.numOscillators = 70;
    for (var i = 0; i < this.numOscillators; i++)
    {
      this.oscillators.push(new Oscillator(i * 0.2, this.initFreq, 1/FRAME_PER_SECOND));
    }
  }

  updateCanvas()
  {
    this.magOsc.update();
    this.freqOsc.update();
    for (var i = 0; i < this.oscillators.length; i++)
    {
      this.oscillators[i].setFreq(this.freqOsc.getVal()/4);
      this.oscillators[i].update();
    }
  }

  drawCanvas()
  {
    background(DEFAULT_BACKGROUND);
    var x = 0;
    var y = WINDOW_HEIGHT/4;
    var r = 4;
    var mag = WINDOW_HEIGHT/4;// * this.magOsc.getVal();
    var pointDist = WINDOW_WIDTH / this.numOscillators;
    noStroke();
    for (var i = 0; i < this.oscillators.length; i++)
    {
      var val = this.oscillators[i].getVal();
      var phase = this.oscillators[i].getPhase();
      var phaseFactorBase = 0.5;
      var phaseFactor = phase;
      if (phase > 0.5)
      {
        phaseFactor = 1 - phase;
      }
      phaseFactor += phaseFactorBase;
      fill([80 + (230 * phaseFactor), 100 * phaseFactor, 100 * phaseFactor]);
      rect(x + (i * pointDist), y - (val * mag), r);
      fill([100 + (160 * phaseFactor), 100 * phaseFactor, 100 * phaseFactor]);
      rect(x + (i * pointDist) + r, 2 * y - ((1 - val) * mag), r);
      fill([200 + (160 * phaseFactor), 100 * phaseFactor, 100 * phaseFactor]);
      rect(x + (i * pointDist) + 2 * r, 0.5 * y + ((1 - val) * mag/2), r);
      fill([300 + (160 * phaseFactor), 100 * phaseFactor, 100 * phaseFactor]);
      rect(x + (i * pointDist) + 2 * r, 1.5 * y - ((1 - val) * mag/2), r);
    }
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
}

function keyPressedGeneric(k)
{
  if (k == 'r')
  {
    background(DEFAULT_BACKGROUND);
  }
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
  keyPressedGeneric(key);
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
