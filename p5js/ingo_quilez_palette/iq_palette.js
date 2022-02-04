// https://iquilezles.org/www/articles/palettes/palettes.htm

var WINDOW_HEIGHT = 400;
var WINDOW_WIDTH  = 800;

var R_MAX = 100;
var G_MAX = 100;
var B_MAX = 100;

var DEFAULT_BACKGROUND = [100, 100, 100];
var DEFAULT_STROKE_COLOR = [250, 0, 100];

var PI  = Math.PI;
var TAU = Math.PI * 2;

////////////////////////

var INIT_A = [0.5,0.5,0.5];
var INIT_B = [0.5,0.5,0.5];
var INIT_C = [1.0,1.0,1.0];
var INIT_D = [0.0,0.33,0.67];
var INIT_T0 = 0
var INIT_T1 = 10
var INIT_NUMGENS = 10
var INIT_COLORS = 4;

var KNOWN_NICE_PALETTES = [
  [[0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 1.0], [0.30, 0.20, 0.20]], // Blue, metallic
  [[1.938, 0.105, 1.812], [1.200, 1.057, 1.122], [0.523, 0.189, 0.293], [0.770, 0.073, 1.340]], // Pinkish
  [[0.461, 1.645, 0.949], [1.930, 1.162, 0.709], [0.054, 0.412, 0.109], [0.823, 1.519, 1.271]], // Pink lemonade
  [[0.995, 1.109, 0.868], [1.376, 1.029, 0.368], [1.585, 0.151, 1.083], [1.580, 1.648, 0.244]], // Warm blue and orange to white
  [[0.192, 1.469, 0.886], [1.442, 0.921, 0.357], [0.206, 0.677, 1.119], [1.827, 0.234, 1.036]], // Pastel, lowsat blue, pink, orange, tan
  [[1.839, 0.318, 0.253], [1.145, 0.510, 0.254], [0.855, 1.199, 1.221], [1.797, 0.306, 0.992]], // Neat fiery and purp
  [[0.292, 0.838, 0.913], [0.706, 0.636, 0.885], [1.223, 0.641, 1.926], [1.576, 0.934, 0.874]], // Nice blues and some yeller
];

var RAND_MAX = 2.0;
var RAND_MIN = 0.0;

var STROKE_WEIGHT = 0;

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

// t runs from 0 to 1. a, b, c, d are rgb vectors
function IqPalette(t, a, b, c, d)
{
  var rgb = [0, 0, 0];
  for (var i = 0; i < rgb.length; i++)
  {
    rgb[i] = a[i] + b[i] * Math.cos(2 * PI * (c[i] * t + d[i]));
  }
  return rgb;
}

class Canvas 
{
  constructor()
  {
    this.a = INIT_A;
    this.b = INIT_B;
    this.c = INIT_C; 
    this.d = INIT_D;
    this.numGens = INIT_NUMGENS;
    this.setBoxInput();
  }

  getBoxInput()
  {
    var rgb = ['r', 'g', 'b'];
    for (var i = 0; i < rgb.length; i++)
    {
      var a = document.getElementById("a" + rgb[i] + "box").value;
      var b = document.getElementById("b" + rgb[i] + "box").value;
      var c = document.getElementById("c" + rgb[i] + "box").value;
      var d = document.getElementById("d" + rgb[i] + "box").value;
      try
      {
        this.a[i] = float(a);
        this.b[i] = float(b);
        this.c[i] = float(c);
        this.d[i] = float(d);
      }
      catch(e)
      {
        console.log("ONE OR MORE INPUT(S) NOT A NUMBER!\n");
      }
    }

    try
    {
      this.numGens = document.getElementById("numGens").value;
    }
    catch(e)
    {
      console.log("T0,1 or NUMGENS INPUT ERROR\n");
    }

    console.log("a", this.a, "b", this.b, "c", this.c, "d", this.d);
    console.log("numGens", this.numGens);
    this.generateColors();
    this.setBoxInput();
  }

  setBoxInput()
  {
    var rgb = ['r', 'g', 'b'];
    for (var i = 0; i < rgb.length; i++)
    {
      document.getElementById("a" + rgb[i] + "box").value = this.a[i];
      document.getElementById("b" + rgb[i] + "box").value = this.b[i];
      document.getElementById("c" + rgb[i] + "box").value = this.c[i];
      document.getElementById("d" + rgb[i] + "box").value = this.d[i];
    }
    document.getElementById("numGens").value = this.numGens;
  }

  generateColors()
  {
    var rectLen = WINDOW_WIDTH / this.numGens;
    var tInterval = float(1 / this.numGens);
    for (var i = 0; i < this.numGens; i++)
    {
      var x = i * rectLen;
      var t = float(i * tInterval);
      var color = IqPalette(t, this.a, this.b, this.c, this.d);
      strokeWeight(STROKE_WEIGHT);
      fill(color[0] * R_MAX, color[1] * G_MAX, color[2] * B_MAX);
      rect(x, 0, rectLen, 400);
    }
  }

  updateCanvas()
  {
  }

  drawCanvas()
  {

  }

  saveFrame()
  {
    var filename = "iq-" + str(this.frameId).padStart(5, "0");
    saveCanvas(p5jsCanvas, filename, "jpg");
  }
}

////////////////////////

function randRange(min, max)
{
  return float(Math.random() * (max - min) + min);
}

function randomizeButtonPressed()
{
  var rgb = ['r', 'g', 'b'];
  for (var i = 0; i < rgb.length; i++)
  {
    document.getElementById("a" + rgb[i] + "box").value = randRange(RAND_MIN, RAND_MAX);
    document.getElementById("b" + rgb[i] + "box").value = randRange(RAND_MIN, RAND_MAX);
    document.getElementById("c" + rgb[i] + "box").value = randRange(RAND_MIN, RAND_MAX);
    document.getElementById("d" + rgb[i] + "box").value = randRange(RAND_MIN, RAND_MAX);
  }
  myCanvas.getBoxInput();
}

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
  colorMode(RGB, R_MAX, G_MAX, B_MAX);
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
}
