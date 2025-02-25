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

var FRAME_LIMITING = false;
var FRAME_PER_SECOND = 60;
var SAVE_NUM_FRAMES = FRAME_PER_SECOND * 50;
if (SAVE_FRAMES)
{
  FRAME_LIMITING = true;
  FRAME_PER_SECOND = 15;
}
var FRAME_PERIOD_MS = 1000 / FRAME_PER_SECOND;

var TOGGLE_DEBUG_ALLOWED = false;
var DEBUG_LINES = false;
var DEBUG_FPS = false;

////////////////////////

class Oscillator 
{
  constructor(freq, phase=0, fps=30)
  {
  	this.freq = freq;
		this.fps = fps;
		this.phase = phase;
		this.effectivePhase = this.phase / this.fps;
  }
	
	setFreq(freq)
	{
		this.freq = freq;
	}

	setPhase(phase)
	{
		this.phase = phase;
		this.effectivePhase = this.phase / this.fps;
	}

  getVal(now)
  {
    return Math.sin(PI * this.freq * (now / this.fps) + this.effectivePhase);
  }
}

class Canvas 
{
  constructor()
  {
		this.config = {
										"h":-360, "hChange":3, 
										"s":0, "sChange":5,
										"v":100, "vChange":0,
										"l":WINDOW_WIDTH * 2, "lChange":100,
										"strokeWeight":0.8,
										"oscillators":true,
										"osc1Freq":0.1,
										"osc2Freq":1,
										"osc3Freq":1,
										"hueOscFreq":1,
										"baseHueOscFreq":1,
										"sOscFreq":1,
									};
		this.osc1 = new Oscillator(this.config.osc1Freq, 0, 30);
		this.osc2 = new Oscillator(this.config.osc2Freq, 0, 30);
		this.osc3 = new Oscillator(this.config.osc3Freq, 0, 30);
		this.hueOsc = new Oscillator(this.config.hueOscFreq, 0, 30);
		this.baseHueOsc = new Oscillator(this.config.baseHueOscFreq, 0, 30);
		this.sOsc = new Oscillator(this.config.sOscFreq, 0, 30);

		var variant = 2;
		if (variant == 1)
		{
			// Variant 1
			this.config = {
				"h": -340.9444856599074,
				"hChange": 3,
				"s": 0,
				"sChange": 5,
				"v": 100,
				"vChange": 0,
				"l": 1600,
				"lChange": 45.1051538922195,
				"strokeWeight": 24.882121128534102,
				"oscillators": true,
				"osc1Freq": 0.1,
				"osc2Freq": 0.04072282910565885,
				"osc3Freq": 0.8526691533921373,
				"hueOscFreq": 0.05390551828589592,
				"baseHueOscFreq": 1,
				"sOscFreq": 1
			}
		}
		else if (variant == 2)
		{
			// Variant 2
			this.config = {
				"h": -340.9444856599074,
				"hChange": 3,
				"s": 0,
				"sChange": 5,
				"v": 100,
				"vChange": 0,
				"l": 1600,
				"lChange": 100,
				"strokeWeight": 24.882121128534102,
				"oscillators": true,
				"osc1Freq": 0.1,
				"osc2Freq": 0.04072282910565885,
				"osc3Freq": 0.8526691533921373,
				"hueOscFreq": 0.05390551828589592,
				"baseHueOscFreq": 1,
				"sOscFreq": 1
			}
		}
  }

  updateCanvas(currFrame)
  {
		this.osc1.setFreq(this.config.osc1Freq);
		this.osc2.setFreq(this.config.osc2Freq);
		this.osc3.setFreq(this.config.osc3Freq);
		this.hueOsc.setFreq(this.config.hueOscFreq);
		this.baseHueOsc.setFreq(this.config.baseHueOscFreq);
		this.sOsc.setFreq(this.config.sOscFreq);
  }

  drawCanvas(currFrame)
  {
		noFill();

		// Triangles

		var l = WINDOW_WIDTH * 2;
		var h = 0;
		var s = 0;
		var v = 0;

		var lDecrement = 25;

		stroke(0, 0, 100);
		var tri = 0;
		while (l > 0)
		{
			var hEffective = Math.abs(h + this.config.h + this.hueOsc.getVal(currFrame + (tri * 30 * 3)) * 20) % H_MAX;
			var sEffective = s + this.config.s + this.sOsc.getVal(currFrame + (tri * 30 * 3) * 10);
			var vEffective = v + this.config.v;

			if (this.config.oscillators)
			{
				// this.config.lChange = Math.abs(this.osc1.getVal(currFrame)) * 25 + 25;
				// this.osc2.setFreq(this.osc3.getVal() * 3);
				this.config.strokeWeight = Math.abs(this.osc2.getVal(currFrame + (tri * 30 * 3))) * 25;
			}

			fill(hEffective, sEffective, vEffective);
			strokeWeight(this.config.strokeWeight);
			triangle(0, 0, 0, l, l, 0);
			l -= Math.abs(this.config.lChange);
			s += this.config.sChange;
			h += this.config.hChange;
			v += this.config.vChange;

			tri++;
		}
		
		// Frame
		stroke(0, 0, 100);
		noFill();
		strokeWeight(100);
		rect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

		strokeWeight(0);
		fill(0, 100, 0);

		var y = WINDOW_WIDTH/2; //+ this.osc1.getVal(currFrame) * 100;
		var x = WINDOW_WIDTH/2;
		// rect(WINDOW_WIDTH/2, y * 50 + WINDOW_WIDTH/2, 10, 10);
		// triangle(x+10, y-5, x-10, y-5, x, y-15);
		// triangle(x+10, y+5, x-10, y+5, x, y+15);

		triangle(x-15, y, x, y-15, x-15, y-15);
		triangle(x+15, y, x, y+15, x+15, y+15);

		if (SAVE_FRAMES && currFrame < SAVE_NUM_FRAMES)
		{
			this.saveFrame();
		}
  }

  drawDebugPanel()
  {
  }

  saveFrame()
  {
		var filename = "genuary_13_25_triangles_variant_2-" + str(currFrame).padStart(5, "0");
		saveCanvas(p5jsCanvas, filename, "svg");
		console.log("SAVED FRAME", this.frameId);
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
}

var lastFrameTs = 0;
var fps = 0;
var timeSinceLastFrameMsMs = 0;

var gui = new dat.GUI({hideable:true});

var folder1 = gui.addFolder("Knobs");
folder1.add(myCanvas.config, "h", -H_MAX, H_MAX);
folder1.add(myCanvas.config, "s", -S_MAX, S_MAX);
folder1.add(myCanvas.config, "v", -V_MAX, V_MAX);
folder1.add(myCanvas.config, "l", 0, 50);
folder1.add(myCanvas.config, "hChange", -H_MAX, H_MAX);
folder1.add(myCanvas.config, "sChange", -10, 10);
folder1.add(myCanvas.config, "vChange", -10, 10);
folder1.add(myCanvas.config, "lChange", 1, 100);
folder1.add(myCanvas.config, "strokeWeight", 0, 30);

var folder2 = gui.addFolder("Oscillators");
folder2.add(myCanvas.config, "oscillators", false, true);
folder2.add(myCanvas.config, "osc1Freq", 0.01, 2);
folder2.add(myCanvas.config, "osc2Freq", 0.01, 2);
folder2.add(myCanvas.config, "osc3Freq", 0.01, 2);
folder2.add(myCanvas.config, "hueOscFreq", 0.001, 2);

folder1.open();
folder2.open();

var currFrame = 0;

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
  myCanvas.updateCanvas(currFrame);
  myCanvas.drawCanvas(currFrame);
  myCanvas.drawDebugPanel();
	currFrame++;
}
