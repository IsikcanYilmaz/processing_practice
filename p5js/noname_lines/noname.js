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

var GRID_WIDTH = 10;
var GRID_HEIGHT = 10;

var CELL_WIDTH_PX = WINDOW_WIDTH / GRID_WIDTH;
var CELL_HEIGHT_PX = WINDOW_HEIGHT / GRID_HEIGHT;

////////////////////////

// OSCILLATOR TYPES
var SIN = 1;
var TRIANGLE = 2;

class Oscillator 
{
  constructor(increment, phase=0, type=SIN)
  {
    this.increment = increment;
    this.phase = phase;
    this.type = type;
    this.val = 0;
    this.directionUp = true;
  }

  update()
  {
    switch(this.type){
      case SIN:
        {
          this.phase += this.increment;
          this.val = Math.sin(this.phase * PI);
          break;
        }
      case TRIANGLE:
        {
          this.phase += 2 * this.increment;

          // phase :0 +  1  -  2  -  3  +  4
          // val   :0    1     0    -1     0 
          var phaseNormalized = this.phase % 4;
          if (phaseNormalized >= 0 && phaseNormalized < 1)
          {
            this.val = this.phase % 1;
          }
          else if (phaseNormalized >= 1 && phaseNormalized < 2)
          {
            this.val = 1 - (this.phase % 1);
          }
          else if (phaseNormalized >= 2 && phaseNormalized < 3)
          {
            this.val = 0 - (this.phase % 1);
          }
          else
          {
            this.val = -1 + (this.phase % 1);
          }
          break;
        }
      default:
        {
          break;
        }
    }
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
    this.grid = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.lines = [];
  }

  getCell(x, y)
  {
    return this.grid[y][x];
  }

  updateGrid()
  {
  }

  drawGrid()
  {
    for (var y = 0; y < GRID_HEIGHT; y++)
    {
      for (var x = 0; x < GRID_WIDTH; x++)
      {
        stroke(0, 0, 0);
        rect(x * CELL_WIDTH_PX, y * CELL_HEIGHT_PX, CELL_WIDTH_PX, CELL_HEIGHT_PX); 
      }
    }
  }
}

class Line
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
    this.length = 1;
    this.occupiedCells = [[x,y]];
    this.head = [x,y];
    this.tail = [x,y];
  }

  moveForwardRandom()
  {
    
  }

  updateLine()
  {
  }
}

class Canvas 
{
  constructor()
  {
    this.grid = new Grid();
  }

  updateCanvas()
  {
    this.grid.updateGrid();
  }

  drawCanvas()
  {
    this.grid.drawGrid();
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
