var WINDOW_HEIGHT = 1000;
var WINDOW_WIDTH  = 1000;

var DEFAULT_BACKGROUND = [0, 0, 0];
var DEFAULT_STROKE_COLOR = [250, 0, 100];

var DEBUGVISUALS = false;

var PI  = Math.PI;
var TAU = Math.PI * 2;

////////////////////////

var SAVE_FRAMES = false;
var SAVE_FRAMES_BLACKOUT_THRESHOLD = 3;

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

var GRID_DIMENSION = 50;
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
var DEFAULT_DAMPENING_FACTOR = 0.95;
var DEFAULT_CLICK_MAGNITUDE = 100;

var H_MAX = 360;
var S_MAX = 1000;
var V_MAX = 100;

var H_BASE = 180;
var H_MULT = -0.5;

var S_BASE = 800;
var S_MULT = 20;

var V_BASE = 30;
var V_MULT = 1;

var MIRROR_CLICKS = false;

////////////////////////

class Grid
{
  constructor()
  {
    this.current = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.prev = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.dampeningFactor = DEFAULT_DAMPENING_FACTOR;
    this.flowFactor = DEFAULT_FLOW_FACTOR;
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
    nextVal = (2 * (flow * this.flowFactor + currVal) / (this.flowFactor + 1) - prevVal) * this.dampeningFactor;
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
      }
    }
    this.prev = this.current;
    this.current = newIterGrid;
  }

  drawGrid()
  {
    for (var y = 0; y < GRID_HEIGHT; y++)
    {
      for (var x = 0; x < GRID_WIDTH; x++)
      {
        if (HIDDEN_ROW)
        {
          if (x == GRID_WIDTH - 1 || y == GRID_HEIGHT - 1)
          {
            continue;
          }
        }
        fill(H_BASE + (this.current[y][x] * H_MULT), S_BASE + this.current[y][x] * S_MULT, V_BASE + (this.current[y][x] * V_MULT));
        strokeWeight((DEBUG_STROKE ? 1 : 0));
        rect(x * CELL_WIDTH_PX, y * CELL_HEIGHT_PX, CELL_WIDTH_PX, CELL_HEIGHT_PX);

        if (DEBUG_VALS)
        {
          fill(0, 100, 0);
          text(int(this.current[y][x] * 20 + 300), x * CELL_WIDTH_PX + CELL_WIDTH_PX/4, y * CELL_HEIGHT_PX + CELL_HEIGHT_PX/2, CELL_WIDTH_PX, CELL_HEIGHT_PX);
        }
      }
    }
  }

}

class Canvas 
{
  constructor()
  {
    this.reset();
  }

  updateCanvas()
  {
    this.grid.updateGrid();
  }

  drawCanvas()
  {
    this.grid.drawGrid();
  }

  drawDebugPanel()
  {
  }

  saveFrame()
  {
    var filename = "bubbles-" + str(this.frameId).padStart(5, "0");
    saveCanvas(p5jsCanvas, filename, "jpg");
  }

  reset()
  {
    this.grid = new Grid();
  }

  mouseInput(xPx, yPx)
  {
    var cellX = int(xPx / CELL_WIDTH_PX);
    var cellY = int(yPx / CELL_HEIGHT_PX); 
    if (cellX < GRID_WIDTH && cellX >= 0 && cellY < GRID_HEIGHT && cellY >= 0)
    {
      myCanvas.grid.setCellVal(cellX, cellY, DEFAULT_CLICK_MAGNITUDE);
    }

    if (MIRROR_CLICKS)
    {
      myCanvas.grid.setCellVal(GRID_WIDTH - cellX, GRID_HEIGHT - cellY, DEFAULT_CLICK_MAGNITUDE);
    }
  }
}

////////////////////////

function mouseClicked()
{
  console.log("MOUSE CLICKED", mouseX, mouseY, cellX, cellY);
  myCanvas.mouseInput(mouseX, mouseY);
}

function mouseDragged()
{
  myCanvas.mouseInput(mouseX, mouseY);
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
  if (key == 's')
  {
    DEBUG_STROKE = !DEBUG_STROKE;
  }
  if (key == 'm')
  {
    MIRROR_CLICKS = !MIRROR_CLICKS;
  }
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
