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

var X_CLOSENESS_MODIFIER = 5;
var Y_CLOSENESS_MODIFIER = 20;

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

////////////////////////

class Oscillator 
{
  constructor(increment, phase=0)
  {
    this.increment = increment;
    this.phase = phase;
    this.val = Math.sin(this.phase * PI);
    this.prevVal = this.val;
    this.goingUp = true;
    this.prevGoingUp = this.goingUp;
  }

  update()
  {
    this.prevVal = this.val;
    this.prevGoingUp = this.goingUp;
    this.phase += this.increment;
    this.val = Math.sin(this.phase * PI);
    this.goingUp = (this.val > this.prevVal);
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

    this.sizeChangeRate = 0.0028;

    this.oscW = new Oscillator(this.sizeChangeRate);
    this.oscH = new Oscillator(0.00015, 0.15);
    this.oscS = new Oscillator(0.0005);
    this.oscX = new Oscillator(0);
    this.oscY = new Oscillator(this.sizeChangeRate);

    this.lastTimestamp = 0;

    this.blackingOut = false;
    this.halfPeriodsTilBlackingOut = DEFAULT_NUM_HALF_PERIODS_TIL_BLACKING_OUT;
    this.numHalfPeriods = 0;
    this.numBlackoutBeats = 0;

    this.bubbleHDifference = 0;

    this.xoffset = Math.abs((WINDOW_WIDTH / 2) - (500 - X_CLOSENESS_MODIFIER));
    this.yoffset = Math.abs((WINDOW_HEIGHT / 2) - (520 + Y_CLOSENESS_MODIFIER));

    this.maxTopDistance = 0;
    this.maxBotDistance = 0;

    this.paused = true;

    this.frameId = 0;

    this.numBlackouts = 0;
  }

  updateCanvas()
  {
    if (DEBUG_PAUSING && this.paused)
    {
      return;
    }

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
      this.x = this.x - (200 - 2*X_CLOSENESS_MODIFIER);
      this.y = this.y - (240 + 2*Y_CLOSENESS_MODIFIER);
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
  
    var beat = (this.oscW.goingUp != this.oscW.prevGoingUp);
    if (beat)
    {
      console.log("BEAT 1.");
      var d = new Date();
      var thisTimestamp = d.getTime();
      if (this.lastTimestamp != 0)
      {
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
          this.numBlackouts++;
        }
      }
      this.lastTimestamp = thisTimestamp;
    }

    if (Math.abs(this.oscW.getVal()) < 0.005)
    {
      this.numHalfPeriods++;
      console.log("BEAT 0. NUM HALF PERIODS", this.numHalfPeriods);
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

    // INFO WE USE FOR DEBUGGING
    var topDist = int(this.y + this.yoffset);
    this.maxTopDistance = (topDist > this.maxTopDistance ? topDist : this.maxTopDistance);

    var botDist = int(WINDOW_HEIGHT - (this.y + this.yoffset));
    this.maxBotDistance = (botDist > this.maxBotDistance ? botDist : this.maxBotDistance);

    if (SAVE_FRAMES && this.numBlackouts < SAVE_FRAMES_BLACKOUT_THRESHOLD)
    {
      this.saveFrame();
    }
    
    this.frameId++;
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
      background(0, 0, 0);
      stroke(0, 0, 100);
      strokeWeight(1);
      line(this.x + this.xoffset, 0, this.x + this.xoffset, WINDOW_HEIGHT);
      //line(0, this.y + this.yoffset, WINDOW_WIDTH, this.y + this.yoffset);
      fill(0, 0, 100);
      rect(0, WINDOW_HEIGHT - 40, 120, 20);
      fill(0, 0, 0);
      text("x:" + str(this.x + this.xoffset) + " y:" + str(int(this.y+this.yoffset)), 0, WINDOW_HEIGHT - 25);

      // CENTER POINT
      strokeWeight(10);
      point(this.x + this.xoffset, this.y+this.yoffset); // center point

      // TOP LINE
      strokeWeight(1);
      line(this.x + this.xoffset - 30, this.y + this.yoffset - 5, this.x + this.xoffset - 30, 0);

      // BOTTOM LINE
      strokeWeight(1);
      line(this.x + this.xoffset - 30, this.y + this.yoffset + 5, this.x + this.xoffset - 30, WINDOW_HEIGHT);

      // TOP LINE INFO TEXT
      fill(0, 0, 100);
      textSize(20);
      text("len:" + str(int(this.y + this.yoffset)) + "\nmax:" + str(this.maxTopDistance), this.x + this.xoffset - 130, (this.y + this.yoffset)/2);

      // BOTTOM LINE INFO TEXT
      fill(0, 0, 100);
      textSize(20);
      text("len:" + str(int(WINDOW_HEIGHT - this.y - this.yoffset)) + "\nmax:" + str(this.maxBotDistance), this.x + this.xoffset - 130, (this.y + this.yoffset) + ((this.y + this.yoffset)/2));

      // ELLIPSE TOP POINT
      strokeWeight(10);
      point(this.x+this.xoffset, this.y+this.yoffset-this.bubbleWidth/2);

      // ELLIPSE BOTTOM POINT
      strokeWeight(10);
      point(this.x+this.xoffset, this.y+this.yoffset+this.bubbleWidth/2); 

      // LEFT LINE
      strokeWeight(1);
      line(0, this.y + this.yoffset, this.x + this.xoffset, this.y + this.yoffset);

      // RIGHT LINE
      strokeWeight(1);
      line(this.x + this.xoffset, this.y + this.yoffset, WINDOW_WIDTH, this.y + this.yoffset);

      // LEFT LINE INFO TEXT
      fill(0, 0, 100);
      textSize(20);
      text(str("len:" + str(this.x + this.xoffset)), (this.x + this.xoffset) / 2, this.y + this.yoffset);

      // RIGHT LINE INFO TEXT
      fill(0, 0, 100);
      textSize(20);
      text(str("len:" + str(WINDOW_WIDTH - this.x - this.xoffset)), this.x + this.xoffset + ((WINDOW_WIDTH - this.x - this.xoffset) / 2) , this.y + this.yoffset);

      // X Y OFFSET TEXTS
      fill(0, 0, 100);
      rect(0, WINDOW_HEIGHT - 100, 80, 50);
      fill(0, 0, 0);
      text("xoff:" + str(this.xoffset) + "\nyoff:" + str(this.yoffset), 0, WINDOW_HEIGHT - 85);
    }
  }

  saveFrame()
  {
    var filename = "bubbles-" + str(this.frameId).padStart(5, "0");
    saveCanvas(p5jsCanvas, filename, "jpg");
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
