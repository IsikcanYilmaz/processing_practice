var WINDOW_HEIGHT = 800;
var WINDOW_WIDTH  = 800;

var H_MAX = 100;
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

////////////////////////

var GRID_HEIGHT = 16;
var GRID_WIDTH = 16;

var H_DEFAULT = 0;
var S_DEFAULT = 100;
var V_DEFAULT = 100;

var H_DELTA = 1;
var H_DECAY = 0;
var S_DECAY = 0.5;
var V_DECAY = 0;

var COLORED = true;
var SHOW_ALIVE_CELLS = true;

var UPDATE_PER_SECOND = 30;
var UPDATE_PER_SECOND_MAX = 1000;

var GRID_RENDER_CELL_WIDTH = (WINDOW_WIDTH/GRID_WIDTH);
var GRID_RENDER_CELL_HEIGHT = (WINDOW_HEIGHT/GRID_HEIGHT);

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

class GoLBoard
{
  constructor()
  {
    this.currentFrame = nestedArray = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => false));
    this.nextFrame = nestedArray = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => false));
    this.coloredFrame = nestedArray = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => false));
    this.color = (H_DEFAULT, S_DEFAULT, V_DEFAULT);
  }

  reset()
  {
    this.constructor();
  }

  setCell(x, y)
  {
    this.currentFrame[y][x] = 1;
    this.coloredFrame[y][x] = (0,0,0);
  }

  getCell(x, y)
  {
    return self.currentFrame[y][x];
  }

  getNumberOfAliveNeighbors(x, y)
  {
    var numAliveNeighbors = 0;
    for (var yDir = -1; yDir <= 1; yDir++)
    {
      for (var xDir = -1; xDir <= 1; xDir++)
      {
        if (xDir == yDir == 0)
        {
          continue;
        }
        if (xDir == -1 && yDir == 0)
        {
          continue;
        }
        if (xDir == 1 && x == GRID_WIDTH - 1)
        {
          continue;
        }
        if (yDir == -1 && y == 0)
        {
          continue;
        }
        if (yDir == 1 && y == GRID_HEIGHT - 1)
        {
          continue;
        }
        var neighborState = this.currentFrame[y+yDir][x+xDir];
        if (neighborState == 1)
        {
          numAliveNeighbors++;
        }
      }
    }
    return numAliveNeighbors;
  }

  printFrame()
  {
    for (var y = 0; y < GRID_HEIGHT; y++)
    {
      console.log(this.currentFrame[GRID_HEIGHT - y - 1], " | ", this.nextFrame[GRID_HEIGHT - y - 1]);
    }
  }

  play()
  {
    var counter = 0;
    for (var y = 0; y < this.currentFrame.length; y++)
    {
      for (var x = 0; x < this.currentFrame[y].length; x++)
      {
        var neighbors = [];
        var currentValue = this.getCell(x, y);
        var numAliveNeighbors = this.getNumberOfAliveNeighbors(x, y);
        
        var cellLives = false;
        // is alive and one or no neighbors
        if (currentValue > 0 && numAliveNeighbors < 2)
        {
          cellLives = false;
          this.coloredFrame[y][x] = this.color;
        }

        // is alive and 2 or 3 alive neighbors
        if (currentValue > 0 && (numAliveNeighbors == 2  || numAliveNeighbors == 3))
        {
          cellLives = true;
        }

        // is alive and more than 4 alive neighbors
        if (currentValue > 0 && numAliveNeighbors >= 4)
        {
          cellLives = false;
          this.coloredFrame[y][x] = this.color;
        }

        // is dead and 3 alive neighbors
        if (currentValue == 0 && numAliveNeighbors == 3)
        {
          cellLives = true;
        }

        this.nextFrame[y][x] = (cellLives ? 1 : 0);
      }
    }
    this.currentFrame = this.nextFrame;
    this.nextFrame = nestedArray = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => false));
    
    var newh = (this.color[0] + H_DELTA) % H_MAX;
    var news = self.color[1];
    var newv = self.color[2];
    this.color = (newh, news, newv);
  }

  drawBoard()
  {
    for (var y = 0; y < GRID_HEIGHT; y++)
    {
      for (var x = 0; x < GRID_WIDTH; x++)
      {
        if (this.getCell(x, y) == 1)
        {
          (SHOW_ALIVE_CELLS ? fill(0, 0, 0) : fill(this.coloredframe[y][x][0], this.coloredframe[y][x][1], this.coloredframe[y][x][2]));
        }
        else
        {
          (COLORED ? fill(this.coloredframe[y][x][0], this.coloredframe[y][x][1], this.coloredframe[y][x][2]) : fill(0, 0, 100));
        }

        rect(x * GRID_RENDER_CELL_WIDTH, y * GRID_RENDER_CELL_HEIGHT, GRID_RENDER_CELL_WIDTH, GRID_RENDER_CELL_HEIGHT);
        tmp = this.coloredFrame[y][x];
        this.coloredFrame[y][x] = ( (tmp[0] - H_DECAY < 0) ? 0 : tmp[0] - H_DECAY, \
                                    (tmp[1] - S_DECAY < 0) ? 0 : tmp[1] - S_DECAY, \
                                    (tmp[2] - V_DECAY < 0) ? 0 : tmp[2] - V_DECAY );
      }
    }
  }
}

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
