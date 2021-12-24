var WINDOW_HEIGHT = 800;
var WINDOW_WIDTH  = 800;

var H_MAX = 360;
var S_MAX = 100;
var V_MAX = 100;

var DEFAULT_BACKGROUND = [0, 0, 0];
var DEFAULT_STROKE_COLOR = [250, 0, 100];

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
var DEBUG_LINES = true;

var TARGET_ELLIPSE_SIZE = 13;
var TARGET_ELLIPSE_COLOR = [0, 0, 100];

var BALL_ELLIPSE_SIZE = 10;
var BALL_ELLIPSE_COLOR = [10, 100, 100];

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

var SIMPLE_MOVEMENT_FACTOR = 0.1;
var MAX_SPEED = 5;

class MovingBall
{
  constructor()
  {
    this.location = createVector(WINDOW_WIDTH/2, WINDOW_HEIGHT/2);
    this.velocity = createVector(0, 0);
    this.accel = createVector(0, 0);
    this.target = createVector(WINDOW_WIDTH/2, WINDOW_HEIGHT/2);
  }

  movementCalculateLocation()
  {
    this.movementSimpleFollow();
  }

  movementSimpleFollow()
  {
    var xdiff = this.location.x - this.target.x;
    var ydiff = this.location.y - this.target.y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.x += (xdiff > 0 ? -1 * Math.abs(xdiff * SIMPLE_MOVEMENT_FACTOR) : Math.abs(xdiff * SIMPLE_MOVEMENT_FACTOR));
    this.velocity.y += (ydiff > 0 ? -1 * Math.abs(ydiff * SIMPLE_MOVEMENT_FACTOR) : Math.abs(ydiff * SIMPLE_MOVEMENT_FACTOR));
  }

  movementAccel()
  {
    var xdiff = this.location.x - this.target.x;
    var ydiff = this.location.y - this.target.y;
    
    
  }

  move()
  {
    this.location.add(this.velocity);
  }

  drawBall()
  {
    fill(BALL_ELLIPSE_COLOR);
    ellipse(this.location.x, this.location.y, BALL_ELLIPSE_SIZE, BALL_ELLIPSE_SIZE);
  }

  drawDebug()
  {
    if (DEBUG_LINES)
    {
      stroke(TARGET_ELLIPSE_COLOR);
      line(this.location.x, this.location.y, this.location.x + this.velocity.x * 5, this.location.y + this.velocity.y * 5);
    }
  }

  setTarget(x, y)
  {
    this.target.x = x;
    this.target.y = y;
  }
}

class Canvas 
{
  constructor()
  {
    this.target = createVector(WINDOW_WIDTH/2, WINDOW_HEIGHT/2);
    this.ball = new MovingBall(this.target.x, this.target.y);
  }

  updateCanvas()
  {
    this.ball.movementCalculateLocation();
    this.ball.move();
  }

  drawCanvas()
  {
    background(DEFAULT_BACKGROUND);
    fill(TARGET_ELLIPSE_COLOR);
    ellipse(this.target.x, this.target.y, TARGET_ELLIPSE_SIZE, TARGET_ELLIPSE_SIZE);
    this.ball.drawBall();
    this.ball.drawDebug();
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
  }

  setTarget(x, y)
  {
    this.target.x = x;
    this.target.y = y;
    this.ball.setTarget(x, y);
  }
}

////////////////////////

function mouseMoved()
{
}

function mouseWheel()
{
}

function mouseClicked()
{
  console.log("MOUSE CLICKED", mouseX, mouseY);
  myCanvas.setTarget(mouseX, mouseY);
}

function mouseDragged()
{
  console.log("MOUSE DRAGGED", mouseX, mouseY);
  myCanvas.setTarget(mouseX, mouseY);
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
    DEBUG_FPS = !DEBUG_FPS;
  }
}


////////////////////////

myCanvas = undefined;
p5jsCanvas = undefined;
function setup()
{
  p5jsCanvas = createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  colorMode(HSB, H_MAX, S_MAX, V_MAX);
  background(DEFAULT_BACKGROUND);
  textSize(12);
  smooth(8);
  myCanvas = new Canvas();
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
