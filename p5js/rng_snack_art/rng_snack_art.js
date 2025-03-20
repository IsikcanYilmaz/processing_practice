var WINDOW_HEIGHT = 800;
var WINDOW_WIDTH  = 800;

var H_MAX = 360;
var S_MAX = 100;
var V_MAX = 100;

var DEFAULT_BACKGROUND = [0, 0, 100];
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

var GRID_LEN = 4;
var CELL_LEN_PX = (WINDOW_WIDTH / GRID_LEN);

// https://stackoverflow.com/questions/63163468/generate-a-256-bit-random-number
function rnd64() 
{
  const bytes = new Uint8Array(32);
  
  // load cryptographically random bytes into array
  window.crypto.getRandomValues(bytes);
  
  // convert byte array to hexademical representation
  const bytesHex = bytes.reduce((o, v) => o + ('00' + v.toString(16)).slice(-2), '');
  
  // convert hexademical value to a decimal string
  return BigInt('0x' + bytesHex);
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) 
{ 
  return Math.floor(Math.random() * max);
}

// JS cannot shift more than 31 bits for some reason. Do what shifting would to in Math functions
function shift(num, shift)
{
  return (num * Math.pow(2, shift));
}

class Grid
{
  constructor(len)
  {
    this.len = len;
    this.num = 0;
  }

  // 
  setNumber(num)
  {
    this.num = num;
  }

  draw()
  {
    stroke(0, 100, 0);
    noFill();
    strokeWeight(1);

    var count = 0;
    for (var j = 0; j < GRID_LEN; j++)
    {
      for (var i = 0; i < GRID_LEN; i++)
      {
        var toFill = (this.num & shift(1, count)) > 0;
        if (toFill)
        {
          fill([0, 0, 0]);
        }
        else
        {
          noFill();
        }
        rect(i * CELL_LEN_PX, j * CELL_LEN_PX, CELL_LEN_PX, CELL_LEN_PX);

        fill("red");
        text(count, i*CELL_LEN_PX + CELL_LEN_PX/2, j*CELL_LEN_PX + CELL_LEN_PX/2);

        count++;
      }
    }

  }
}

////////////////////////

class Canvas 
{
  constructor()
  {
		this.config = {
									};
    this.grid = new Grid(GRID_LEN);
    this.grid.setNumber(2);
  }

  updateCanvas(currFrame)
  {
  }

  drawCanvas(currFrame)
  {
    background(DEFAULT_BACKGROUND);
    this.grid.draw();
  }
  

  drawDebugPanel()
  {
  }

  saveFrame()
  {
		var filename = "rng_snack-" + str(currFrame).padStart(5, "0");
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
//folder1.add(myCanvas.config, "h", -H_MAX, H_MAX);
//folder1.add(myCanvas.config, "s", -S_MAX, S_MAX);
//folder1.add(myCanvas.config, "v", -V_MAX, V_MAX);
//folder1.add(myCanvas.config, "l", 0, 50);
//folder1.add(myCanvas.config, "hChange", -H_MAX, H_MAX);
//folder1.add(myCanvas.config, "sChange", -10, 10);
//folder1.add(myCanvas.config, "vChange", -10, 10);
//folder1.add(myCanvas.config, "lChange", 1, 100);
//folder1.add(myCanvas.config, "strokeWeight", 0, 30);

var folder2 = gui.addFolder("Oscillators");
//folder2.add(myCanvas.config, "oscillators", false, true);
//folder2.add(myCanvas.config, "osc1Freq", 0.01, 2);
//folder2.add(myCanvas.config, "osc2Freq", 0.01, 2);
//folder2.add(myCanvas.config, "osc3Freq", 0.01, 2);
//folder2.add(myCanvas.config, "hueOscFreq", 0.001, 2);

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
