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

var TOGGLE_DEBUG_ALLOWED = false;
var DEBUG_LINES = false;
var DEBUG_FPS = false;
var DEBUG_PAUSING = false;

var BLACKOUTS_ENABLED = true;
var DEFAULT_NUM_HALF_PERIODS_TIL_BLACKING_OUT = 12;

var STROKE_WEIGHT_MAX = 20;
var CIRCLE_R = 600;
var NUM_NESTED_CIRCLES = 15;
////////////////////////

class NestedCircles
{
	constructor(centerX, centerY, maxRadius, numNests, initPhase, oscFreq, hBase, sBase, vBase)
	{
		this.centerX = centerX;
		this.centerY = centerY;
		this.maxRadius = maxRadius;
		this.numNests = numNests;
		this.initPhase = (initPhase === undefined) ? 0 : initPhase;
		this.oscFreq = oscFreq;
    this.hBase = hBase;
    this.sBase = sBase;
    this.vBase = vBase;
    this.strokeOscillators = [];
		this.strokeValues = [];
    this.strokeColors = [];
		for (var i = 0; i < this.numNests; i++)
		{
			this.strokeOscillators.push(new Oscillator(initPhase + i*2, this.oscFreq));
			this.strokeValues.push(0);
		}
	}

	update()
	{
		for (var i = 0; i < this.numNests; i++)
		{
			this.strokeOscillators[i].update();
			this.strokeValues[i] = 1 + (this.strokeOscillators[i].getVal() + 1) * STROKE_WEIGHT_MAX / 2;
		}
	}

	draw()
	{
		for (var i = this.numNests-1; i >= 0; i--)
		{
			strokeWeight(this.strokeValues[i]);
      stroke(this.hBase + (this.strokeOscillators[i].getVal() * 50), 
        this.sBase + (this.strokeOscillators[i].getVal() * (S_MAX-this.sBase)), 
        this.vBase + (this.strokeOscillators[i].getVal() * (V_MAX-this.vBase))
      );
			circle(this.centerX, this.centerY, this.maxRadius * i / this.numNests);
		}
	}

	setOscillatorFreq(freq)
	{
		this.oscFreq = freq;
		for (var i = 0; i < this.strokeOscillators.length; i++)
		{
			this.strokeOscillators[i].setFreq(this.oscFreq);
		}
	}

	getOscillatorFreq()
	{
		return this.oscFreq;
	}
}

class Canvas 
{
  constructor()
  {
		this.nests = [];
    this.overallOscFreq = 0.05;
    this.pulseOsc = new Oscillator()
    var numNests = 30;
    var maxRadius = 200;

    var hBase = 250;
    var sBase = 0;
    var vBase = 0;

		for (var i = 0; i < 10; i++)
		{
			for (var j = 0; j < 10; j++)
			{
				this.nests.push(new NestedCircles(i * 200 + ((j%2) * 100), 
          j * 100, 
          maxRadius, 
          numNests, 
          i * 30,
          this.overallOscFreq,
          hBase, sBase, vBase
        ));
			}
		}
  }

  updateCanvas()
  {
		for (var i = 0; i < this.nests.length; i++)
		{
			this.nests[i].update();
		}
  }

  drawCanvas()
  {
		background(DEFAULT_BACKGROUND);
		noFill();
		for (var i = 0; i < this.nests.length; i++)
		{
			this.nests[i].draw();
		}
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

function keyPressed()
{
  console.log("KEY PRESSED", key);
  if (key == ' ')
  {
    myCanvas.paused = false;
  }
}

function keyReleased()
{
  console.log("KEY RELEASED", key);
  if (key == ' ')
  {
    myCanvas.paused = true;
  }
  if (key == 'd' && TOGGLE_DEBUG_ALLOWED)
  {
    background(0, 0, 0);
    DEBUG_LINES = !DEBUG_LINES;
    DEBUG_FPS = !DEBUG_FPS;
  }
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
  console.log("SETUP", myCanvas.nests[0].strokeOscillators);
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
  // myCanvas.drawDebugPanel();
}

