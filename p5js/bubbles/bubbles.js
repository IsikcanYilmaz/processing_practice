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

var COLUMNS = 30;
var DEFAULT_SQUARE_WIDTH = 1;
var DEFAULT_SQUARE_AREA_WIDTH = 20;
var DEFAULT_X_OFFSET = 100;
var DEFAULT_Y_OFFSET = 100;
var DEFAULT_WIDTH_UP_SPEED = 0.3;
var DEFAULT_WIDTH_DOWN_SPEED = 0.3;
var DEFAULT_SQUARE_THICKNESS = 3;
var DEFAULT_LOW_SQUARE_WIDTH_THRESHOLD = 10;

var SMALLEST_ELLIPSE_WIDTH = 1;

////////////////////////

var BLACK_BUBBLE = true;


////////////////////////

class Oscillator 
{
  constructor(increment, phase=0)
  {
    this.increment = increment;
    this.phase = phase;
    this.val = Math.sin(this.phase * PI);
  }

  update()
  {
    this.phase += this.increment;
    this.val = Math.sin(this.phase * PI);
  }

  setIncrement(increment)
  {
    this.increment = increment;
  }

  getPhase()
  {
    return this.phase;
  }

  getVal()
  {
    return this.val;
  }
}

class Canvas 
{
  constructor()
  {
    this.bubbleWidth = 0;
    this.h = 0;
    this.s = 100;
    this.v = 100;

    this.sLowerLimit = 60;
    this.sUpperLimit = 80;
    this.sVariable = this.sUpperLimit - this.sLowerLimit;

    this.sizeChangeRate = 0.0025;

    this.oscW = new Oscillator(this.sizeChangeRate);
    this.oscH = new Oscillator(0.0001, 0.8);
    this.oscS = new Oscillator(0.0005);
    this.oscX = new Oscillator(0);
    this.oscY = new Oscillator(this.sizeChangeRate);

    this.lastTimestamp = 0;

    this.blackingOut = false;
    this.halfPeriodsTilBlackingOut = 8;
    this.numHalfPeriods = 0;

    this.bubbleHDifference = 0;
  }

  updateCanvas()
  {
    this.oscW.update();
    this.oscH.update();
    this.oscS.update();
    this.oscX.update();
    this.oscY.update();
 
    this.h = Math.abs(this.oscH.getVal()) * H_MAX;
    this.s = (this.oscS.getVal() * this.sVariable) + this.sLowerLimit;

    this.bubbleWidth = this.oscW.getVal() * 300;
    if (this.blackingOut)
    {
      if (this.oscY.getVal() < 0)
      {
        this.bubbleWidth -= 3;
      }
      else
      {
        this.bubbleWidth += 3;
      }
    }
  }

  drawCanvas()
  {
    var x = (WINDOW_WIDTH / 2) + (this.oscX.getVal() * 300);
    var y = (WINDOW_HEIGHT / 2) + (this.oscY.getVal() * 300);
    if (this.oscY.getVal() > 0)
    {
      x -= 200;
      y -= 300;
    }
    
    var xoffset = Math.abs((WINDOW_WIDTH / 2) - 500);
    var yoffset = Math.abs((WINDOW_HEIGHT / 2) - 520);

    if (this.blackingOut)
    {
      this.v = 0;
    }
    else
    {
      this.v = V_MAX;
    }

    noStroke();
    
    if (this.oscW.getVal() < 0 && this.bubbleHDifference > 0)
    {
      this.h += this.bubbleHDifference;
      this.h = this.h % H_MAX;
    }
    fill(this.h, this.s, this.v);
    ellipse(x + xoffset, y + yoffset, this.bubbleWidth, this.bubbleWidth);
  
    var beat = Math.abs(this.oscW.getVal());
    if (beat == 1)
    {
      var d = new Date();
      var thisTimestamp = d.getTime();
      if (this.lastTimestamp != 0)
      {
        console.log("BEAT 1", beat);
      }
      this.lastTimestamp = thisTimestamp;
    }

    if (beat < 0.001)
    {
      this.numHalfPeriods++;
      console.log("BEAT 0", beat, "NUM HALF PERIODS", this.numHalfPeriods);
    }

    if (this.numHalfPeriods > 0 && (this.numHalfPeriods % this.halfPeriodsTilBlackingOut) == 0 && !this.blackingOut)
    {
      console.log("BLACKING OUT");
      this.blackingOut = true;
    }

    if (this.numHalfPeriods > 0 && (this.numHalfPeriods % (this.halfPeriodsTilBlackingOut + 2)) == 0 && this.blackingOut)
    {
      console.log("DONE BLACKING OUT");
      this.blackingOut = false;
      this.numHalfPeriods = 0;
    }
  }
}

////////////////////////

function mouseMoved()
{
}

function mouseWheel()
{
}

////////////////////////

myCanvas = new Canvas();
function setup()
{
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  colorMode(HSB, H_MAX, S_MAX, V_MAX);
  background(DEFAULT_BACKGROUND);
  textSize(12);
  smooth(8);
}

function draw()
{
  //background(DEFAULT_BACKGROUND);
  myCanvas.updateCanvas();
  myCanvas.drawCanvas();
}
