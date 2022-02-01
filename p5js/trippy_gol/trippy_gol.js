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
var DEBUG_FPS = false;
var DEBUG_PAUSING = false;

////////////////////////

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
    var filename = "trippy_gol-" + str(this.frameId).padStart(5, "0");
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
