var WINDOW_HEIGHT = 8 * 120;
var WINDOW_WIDTH  = 8 * 120;

var DEFAULT_BACKGROUND = [0, 0, 0];
var DEFAULT_STROKE_COLOR = [250, 0, 100];

var DEBUGVISUALS = false;

var PI  = Math.PI;
var TAU = Math.PI * 2;

////////////////////////

var SAVE_FRAMES = false;
var SAVE_NUM_FRAMES = 30 * 20;

var FRAME_LIMITING = false;
var FRAME_PER_SECOND = 10;
if (SAVE_FRAMES)
{
  FRAME_LIMITING = true;
  FRAME_PER_SECOND = 15;
}
var FRAME_PERIOD_MS = 1000 / FRAME_PER_SECOND;

var TOGGLE_DEBUG_ALLOWED = false;
var DEBUG_STROKE = false;
var DEBUG_VALS = false;
var DEBUG_FPS = false;

var GRID_DIMENSION = 120;
var GRID_WIDTH = GRID_DIMENSION;
var GRID_HEIGHT = GRID_DIMENSION;

var HIDDEN_ROW = true;
if (HIDDEN_ROW)
{
  GRID_DIMENSION++;
}

var CELL_WIDTH_PX = WINDOW_WIDTH / GRID_WIDTH;
var CELL_HEIGHT_PX = WINDOW_HEIGHT / GRID_HEIGHT;

var DEFAULT_FLOW_FACTOR = 0.4;
var DEFAULT_DAMPENING_FACTOR = 0.96;
var DEFAULT_CLICK_MAGNITUDE = 120;

var H_MAX = 360;
var S_MAX = 1000;
var V_MAX = 100;

var H_BASE = 320;
var H_MULT = 4;
var H_MAG_THRESH = 2;
var H_ALTERNATE_BASE = H_BASE;//200;

var S_BASE = 800;
var S_MULT = 20;

var V_BASE = 0;
var V_MULT = 80;//20;

var MIRROR_CLICKS = false;
var RAIN = false;
var LONG_INPUT = false;

var RAIN_CHANCE = 0.05;
var LONG_INPUT_LENGTH_CELLS = 20;
var LONG_INPUT_CLICKABLE_AREA = Math.floor((GRID_WIDTH - LONG_INPUT_LENGTH_CELLS) * CELL_WIDTH_PX);
var LONG_INPUT_CLICKABLE_UL = (GRID_WIDTH * CELL_WIDTH_PX / 2) + (LONG_INPUT_CLICKABLE_AREA / 2);
var LONG_INPUT_CLICKABLE_LL = (GRID_WIDTH * CELL_WIDTH_PX / 2) - (LONG_INPUT_CLICKABLE_AREA / 2);
var LONG_INPUT_MAGNITUDE = DEFAULT_CLICK_MAGNITUDE / 8;

var IMAGE_DRAW_METHOD = true;

var MOVEMENT_METHOD_MOVER = 0;
var MOVEMENT_METHOD_MOUSE = 1;
var CURRENT_MOVEMENT_METHOD = MOVEMENT_METHOD_MOVER;

var NUM_MOVERS = 4;
var ACTIVE_MOVER = 0;

////////////////////////

function timeIt(fn, str)
{
  var start = new Date().getTime();
  fn();
  var end = new Date().getTime();
  console.log(str, end - start);
  return end - start;
}

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

class Grid
{
  constructor()
  {
    this.current = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.prev = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.dampeningFactor = DEFAULT_DAMPENING_FACTOR;
    this.flowFactor = DEFAULT_FLOW_FACTOR;
    this.currentImg = createImage(GRID_WIDTH, GRID_HEIGHT);
  }

  getCellVal(x, y)
  {
    return this.current[y][x];
  }

  getPrevCellVal(x, y)
  {
    return this.prev[y][x];
  }

  setCellVal(x, y, val)
  {
    this.current[y][x] = val;
  }

  calculateNextCellVal(x, y)
  {
    /* 
     * Algo straight up pulled from here: https://www.ixm-ibrahim.com/explanations/simulating-water-ripples
     * who seems to have pulled from here: https://web.archive.org/web/20160116150939/http://freespace.virgin.net/hugo.elias/graphics/x_water.htm
     */
    var currVal = this.getCellVal(x, y);
    var nextVal = currVal;
    var prevVal = this.getPrevCellVal(x, y);
    var flow = 0;
    var numNeighbors = 0;
    if (x + 1 < GRID_WIDTH - 1)
    {
      flow += this.getCellVal(x + 1, y);
      numNeighbors++;
    }
    if (x - 1 >= 0)
    {
      flow += this.getCellVal(x - 1, y);
      numNeighbors++;
    }
    if (y + 1 < GRID_HEIGHT - 1)
    {
      flow += this.getCellVal(x, y + 1);
      numNeighbors++;
    }
    if (y - 1 >= 0)
    {
      flow += this.getCellVal(x, y - 1);
      numNeighbors++;
    }
    flow = flow / numNeighbors;
    nextVal = ((2 * (flow * this.flowFactor + currVal) / (this.flowFactor + 1) - prevVal) * this.dampeningFactor);
    return nextVal;
  }

  updateGrid()
  {
    var newIterGrid = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    for (var y = 0; y < GRID_HEIGHT; y++)
    {
      for (var x = 0; x < GRID_WIDTH; x++)
      {
        newIterGrid[y][x] = this.calculateNextCellVal(x, y);

        if (IMAGE_DRAW_METHOD && x < GRID_WIDTH - 1 && x > 0 && y < GRID_HEIGHT - 1 && y > 0)
        {
          var h = ((Math.abs(this.current[y][x]) > H_MAG_THRESH) ? H_BASE : H_ALTERNATE_BASE)+ (this.current[y][x] * H_MULT);
          var s = S_BASE + (this.current[y][x] * S_MULT);
          var v = V_BASE + (this.current[y][x] * V_MULT);
          var c = color(h, s, v);
          this.currentImg.set(x, y, c);
        }
      }
    }
    this.prev = this.current;
    this.current = newIterGrid;
  }

  drawGridImageMethod()
  {
    image(this.currentImg, 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    this.currentImg.updatePixels();
  }

  drawGrid()
  {
    for (var y = 0; y < GRID_HEIGHT; y++)
    {
      for (var x = 0; x < GRID_WIDTH; x++)
      {
        if (HIDDEN_ROW)
        {
          if (x == GRID_WIDTH - 1 || y == GRID_HEIGHT - 1 || x == 0 || y == 0)
          {
            continue;
          }
        }
        var h = ((Math.abs(this.current[y][x]) > H_MAG_THRESH) ? H_BASE : H_ALTERNATE_BASE)+ (this.current[y][x] * H_MULT);
        var s = S_BASE + (this.current[y][x] * S_MULT);
        var v = V_BASE + (this.current[y][x] * V_MULT);
        var c = color(h, s, v);
        fill(c);
        strokeWeight((DEBUG_STROKE ? 1 : 0));
        rect(x * CELL_WIDTH_PX, y * CELL_HEIGHT_PX, CELL_WIDTH_PX, CELL_HEIGHT_PX);

        if (DEBUG_VALS)
        {
          fill(0, 100, 100);
          textSize(10);
          text((this.current[y][x]), x * CELL_WIDTH_PX + CELL_WIDTH_PX/4, y * CELL_HEIGHT_PX + CELL_HEIGHT_PX/2, CELL_WIDTH_PX, CELL_HEIGHT_PX);
        }
      }
    }
  }

  getCurrent()
  {
    return this.current;
  }

  get1DCurrent()
  {
    return [].concat(...this.current);
  }
}

// BEHAVIORS
var BEHAVIOR_NONE = 0;
var BEHAVIOR_Y_SIN = 1;
var BEHAVIOR_X_SIN = 2;
var BEHAVIOR_WHIRLY = 3;
var BEHAVIOR_MAX = 4;

var BEHAVIOR_DEFAULT = BEHAVIOR_NONE; 

class Canvas 
{
  constructor(beh=BEHAVIOR_DEFAULT)
  {
    this.reset();
    this.behavior = beh;
  }

  behaviorSet(beh)
  {
    if (beh >= BEHAVIOR_MAX)
    {
      console.log("BAD BEH VALUE", beh);
      return;
    }
    this.behavior = beh;
    this.resetOscillators();
    console.log("SET BEHAVIOR", beh);
  }

  behaviorGet()
  {
    return this.behavior;
  }

  behaviorSetNext()
  {
    this.behaviorSet((this.behaviorGet() + 1) % BEHAVIOR_MAX);
  }
  
  behaviorFunction()
  {
    switch(this.behavior)
    {
      case BEHAVIOR_NONE:
        {
          break;
        }
      case BEHAVIOR_Y_SIN:
        {
          this.yOsc.update();
          this.heightOsc.update();
          var newSpeed = 0.02 + (0.1 * (1 - Math.abs(this.heightOsc.getVal())));
          //var mag = Math.abs(this.heightOsc.getVal()) * 200;
          var mag = 50;
          this.yOsc.setIncrement(newSpeed);
          var oscLen = this.heightOsc.getVal() * ((WINDOW_HEIGHT/2) - 15*CELL_HEIGHT_PX);
          var x = WINDOW_WIDTH / 2;
          var y = (WINDOW_HEIGHT / 2) + (this.yOsc.getVal() * oscLen);
          this.input(x, y, mag);
          break;
        }
      case BEHAVIOR_X_SIN:
        {
          this.xOsc.update();
          this.heightOsc.update();
          var newSpeed = 0.02 + (0.1 * (1 - Math.abs(this.heightOsc.getVal())));
          //var mag = Math.abs(this.heightOsc.getVal()) * 200;
          var mag = 50;
          this.xOsc.setIncrement(newSpeed);
          var oscLen = this.heightOsc.getVal() * ((WINDOW_WIDTH/2) - 15*CELL_HEIGHT_PX);
          var x = (WINDOW_WIDTH / 2) + (this.xOsc.getVal() * oscLen);
          var y = WINDOW_HEIGHT / 2;
          this.input(x, y, mag);
          break;
        }
      case BEHAVIOR_WHIRLY:
        {
          break;
        }
      default:
    }
  }

  updateCanvas()
  {
    this.updateMovers();
    this.grid.updateGrid();
    if (RAIN)
    {
      if (Math.random() < RAIN_CHANCE)
      {
        this.raindrop();
      }
    }
    this.behaviorFunction();
  }

  drawCanvas()
  {
    if (IMAGE_DRAW_METHOD)
    {
      this.grid.drawGridImageMethod();
    }
    else
    {
      this.grid.drawGrid();
    }
    this.drawDebugPanel();
    if (SAVE_FRAMES && this.frameId < SAVE_NUM_FRAMES)
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
      rect(0, WINDOW_HEIGHT - 50, 50, 50);
      fill(0, 100, 0);
      textSize(30);
      text(fps, 0, WINDOW_HEIGHT - 25);
    }
  }

  saveFrame()
  {
    var filename = "ripples-" + str(this.frameId).padStart(5, "0");
    saveCanvas(p5jsCanvas, filename, "jpg");
  }

  reset()
  {
    this.grid = new Grid();
    this.resetOscillators();
    this.frameId = 0;
    this.activeMover = ACTIVE_MOVER;
    this.resetMovers();
  }

  setActiveMover(num)
  {
    if (num < NUM_MOVERS)
    {
      console.log("ACTIVE MOVER", num);
      this.activeMover = num;
    }
  }

  updateMovers()
  {
    if (CURRENT_MOVEMENT_METHOD == MOVEMENT_METHOD_MOVER)
    {
      for (var m = 0; m < NUM_MOVERS; m++)
      {
        this.movers[m].movementCalculateLocation();
        this.movers[m].move();
        if (this.movers[m].velocity.mag() > 0.5)
        {
          this.input(this.movers[m].location.x, this.movers[m].location.y);
        }
      }
    }
  }

  resetMovers()
  {
    this.movers = [];
    for (var i = 0; i < NUM_MOVERS; i++)
    {
      var target = createVector(WINDOW_WIDTH/2, WINDOW_HEIGHT/2);
      var ball = new MovingBall(target.x, target.y);
      this.movers.push(ball);
    }
  }

  resetOscillators()
  {
    this.yOsc = new Oscillator(0.02, 0);
    this.xOsc = new Oscillator(0.02, 0);
    this.heightOsc = new Oscillator(0.0005, 0);
  }

  raindrop()
  {
    this.input(int(Math.random() * GRID_WIDTH), int(Math.random() * GRID_HEIGHT), mag);
  }

  moverInput(xPx, yPx)
  {
    if (CURRENT_MOVEMENT_METHOD == MOVEMENT_METHOD_MOVER)
    {
      this.movers[this.activeMover].setTarget(xPx, yPx);
    }
  }

  input(xPx, yPx, mag=DEFAULT_CLICK_MAGNITUDE)
  {
    var cellX = int(xPx / CELL_WIDTH_PX);
    var cellY = int(yPx / CELL_HEIGHT_PX);
    if (cellX < GRID_WIDTH && cellX >= 0 && cellY < GRID_HEIGHT && cellY >= 0)
    {
      myCanvas.grid.setCellVal(cellX, cellY, mag);
    }

    if (MIRROR_CLICKS && GRID_WIDTH - cellX < GRID_WIDTH && GRID_WIDTH - cellX >= 0 && GRID_HEIGHT - cellY < GRID_HEIGHT && GRID_HEIGHT - cellY >= 0)
    {
      myCanvas.grid.setCellVal(GRID_WIDTH - cellX, GRID_HEIGHT - cellY, DEFAULT_CLICK_MAGNITUDE);
    }
  }

  longInput(xPx, yPx, mag=DEFAULT_CLICK_MAGNITUDE)
  {
    if (xPx < LONG_INPUT_CLICKABLE_LL)
    {
      xPx = LONG_INPUT_CLICKABLE_LL;
    }
    if (xPx > LONG_INPUT_CLICKABLE_UL)
    {
      xPx = LONG_INPUT_CLICKABLE_UL;
    }
    var cellX = int(xPx / CELL_WIDTH_PX);
    var cellY = int(yPx / CELL_HEIGHT_PX);

    if (cellX < GRID_WIDTH && cellX >= 0 && cellY < GRID_HEIGHT && cellY >= 0)
    {
      for (var i = cellX + (LONG_INPUT_LENGTH_CELLS/2); i > cellX - (LONG_INPUT_LENGTH_CELLS/2); i--)
      {
        myCanvas.grid.setCellVal(i, cellY, mag);
      }
    }
  }
}

////////////////////////

function autoInputClicked(x, y)
{
  console.log("AUTO INPUT", x, y);
  if (CURRENT_MOVEMENT_METHOD == MOVEMENT_METHOD_MOVER)
  {
    myCanvas.moverInput(x, y);
  }
  else
  {
    myCanvas.input(mouseX, mouseY);
  }
}

// This object expects an array of inputs, each element of which looks like
// [time, x, y]
class AutoInput
{
  constructor(inputList)
  {
    this.initTs = Date.now();
    this.inputList = inputList;
    this.idx = 0;
    this.playing = false;
  }

  start()
  {
    if (inputList.length == 0)
    {
      return;
    }
    this.playing = true;
    this.initiateNext();
  }

  stop()
  {
    this.playing = false;
  }

  initiateNext()
  {
    time = this.inputList[this.idx][0];
    x = this.inputList[this.idx][1];
    y = this.inputList[this.idx][2];
    setTimeout( function() { autoInputClicked(x, y); } , time);
  }

  fire()
  {
    
  }
}

////////////////////////

function mouseClicked()
{
  console.log("MOUSE CLICKED", mouseX, mouseY);
  if (CURRENT_MOVEMENT_METHOD == MOVEMENT_METHOD_MOVER)
  {
    myCanvas.moverInput(mouseX, mouseY);
  }
  else if (LONG_INPUT)
  {
    myCanvas.longInput(mouseX, mouseY);
  }
  else
  {
    myCanvas.input(mouseX, mouseY);
  }
}

function mouseDragged()
{
  if (CURRENT_MOVEMENT_METHOD == MOVEMENT_METHOD_MOVER)
  {
    myCanvas.moverInput(mouseX, mouseY);
  }
  else if (LONG_INPUT)
  {
    myCanvas.longInput(mouseX, mouseY, LONG_INPUT_MAGNITUDE);
  }
  else
  {
    myCanvas.input(mouseX, mouseY);
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
  if (key == 'r')
  {
    myCanvas.reset();
  }
  if (key == 'R')
  {
    myCanvas.resetMovers();
  }
  if (key == 's')
  {
    DEBUG_STROKE = !DEBUG_STROKE;
  }
  if (key == 'm')
  {
    MIRROR_CLICKS = !MIRROR_CLICKS;
  }
  if (key == 'b')
  {
    myCanvas.behaviorSetNext();
  }
  if (key == 'B')
  {
    myCanvas.behavior = BEHAVIOR_NONE;
  }
  if (key == 'd')
  {
    //DEBUG_VALS = !DEBUG_VALS;
  }
  if (key == 'f')
  {
    DEBUG_FPS = !DEBUG_FPS;
    background(0, 0, 0);
  }
  if (key == 'l')
  {
    LONG_INPUT = !LONG_INPUT;
    console.log("LONG INPUT ", LONG_INPUT);
  }
  if (key == 'i')
  {
    IMAGE_DRAW_METHOD = !IMAGE_DRAW_METHOD;
    console.log("DRAW METHOD FLIPPED");
  }
  if (key == '0' || key == '1' || key == '2' || key == '3' || key == '4' || key == '5')
  {
    var num = parseInt(key, 10);
    if (num < NUM_MOVERS)
    {
      myCanvas.setActiveMover(num);
    }
  }
}

function keyReleased()
{
  console.log("KEY RELEASED", key);
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
  smooth(0);
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
