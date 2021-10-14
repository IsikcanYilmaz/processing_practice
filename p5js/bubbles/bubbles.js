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

var SAVE_FRAMES = false;

var FRAME_LIMITING = true;
var FRAME_PER_SECOND = 30;
var FRAME_PERIOD_MS = 1000 / FRAME_PER_SECOND;

var DEBUG_LINES = true;
var DEBUG_FPS = true;

var BLACKOUTS_ENABLED = true;

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
    this.oscH = new Oscillator(0.00015, 0.27);
    this.oscS = new Oscillator(0.0005);
    this.oscX = new Oscillator(0);
    this.oscY = new Oscillator(this.sizeChangeRate);

    this.lastTimestamp = 0;

    this.blackingOut = false;
    this.halfPeriodsTilBlackingOut = 12;
    this.numHalfPeriods = 0;
    this.numBlackoutBeats = 0;

    this.bubbleHDifference = 0;

    this.xoffset = Math.abs((WINDOW_WIDTH / 2) - 500);
    this.yoffset = Math.abs((WINDOW_HEIGHT / 2) - 520);
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
    this.x = (WINDOW_WIDTH / 2) + (this.oscX.getVal() * 300);
    this.y = (WINDOW_HEIGHT / 2) + (this.oscY.getVal() * 300);
    if (this.oscY.getVal() > 0)
    {
      this.x -= 200;
      this.y -= 300;
    }
    
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
    ellipse(this.x + this.xoffset, this.y + this.yoffset, this.bubbleWidth, this.bubbleWidth);
  
    var beat = Math.abs(this.oscW.getVal());
    if (beat == 1)
    {
      var d = new Date();
      var thisTimestamp = d.getTime();
      if (this.lastTimestamp != 0)
      {
        console.log("BEAT 1", beat);
        if (this.blackingOut)
        {
          this.oscW.phase = 1;
          this.oscY.phase = 1;
          this.numBlackoutBeats++;
        }
        if (this.numBlackoutBeats == 2)
        {
          this.numBlackoutBeats = 0;
          this.blackingOut = false;
          console.log("BLACKING OUT DONE");
          this.oscW.phase = 0;
          this.oscY.phase = 0;
          this.numHalfPeriods = 0;
        }
      }
      this.lastTimestamp = thisTimestamp;
    }

    if (beat < 0.001)
    {
      this.numHalfPeriods++;
      console.log("BEAT 0", beat, "NUM HALF PERIODS", this.numHalfPeriods);
    }

    if (this.numHalfPeriods > 0 && (this.numHalfPeriods % this.halfPeriodsTilBlackingOut) == 0 && !this.blackingOut && BLACKOUTS_ENABLED)
    {
      console.log("BLACKING OUT");
      this.blackingOut = true;
    }

    if (this.numHalfPeriods > 0 && (this.numHalfPeriods % (this.halfPeriodsTilBlackingOut + 2)) == 0 && this.blackingOut)
    {
      console.log("BLACKING OUT DONE");
      this.blackingOut = false;
      this.numHalfPeriods = 0;
    }
  }

  drawDebugPanel()
  {
    if (DEBUG_FPS)
    {
      fill(0, 0, 100);
      rect(0, WINDOW_HEIGHT - 20, 20, 20);
      fill(0, 0, 0);
      text(str(fps), 0, WINDOW_HEIGHT - 5);
    }

    if (DEBUG_LINES)
    {
      stroke(0, 0, 100);
      line(this.x + this.xoffset, 0, this.x + this.xoffset, WINDOW_HEIGHT);
      //line(0, this.y + this.yoffset, WINDOW_WIDTH, this.y + this.yoffset);
      fill(0, 0, 100);
      rect(0, WINDOW_HEIGHT - 40, 50, 20);
      fill(0, 0, 0);
      text(str(this.x+this.xoffset) + " " + str(this.y+this.yoffset), 0, WINDOW_HEIGHT - 30);
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
