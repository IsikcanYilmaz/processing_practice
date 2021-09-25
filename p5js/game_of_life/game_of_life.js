var WINDOW_HEIGHT = 64 * 10;
var WINDOW_WIDTH  = 64 * 10;

var H_MAX = 100;
var S_MAX = 100;
var V_MAX = 100;

var DEFAULT_BACKGROUND = [0, 0, 100];
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

var GRID_HEIGHT = 4;
var GRID_WIDTH = 4;

var H_DEFAULT = 0;
var S_DEFAULT = 100;
var V_DEFAULT = 100;

var H_DELTA = 1;
var H_DECAY = 0;
var S_DECAY = 0.5;
var V_DECAY = 0;

var COLORED = true;

var UPDATE_PER_SECOND = 30;
var UPDATE_PER_SECOND_MAX = 1000;

var GRID_RENDER_CELL_WIDTH = (WINDOW_WIDTH/GRID_WIDTH);
var GRID_RENDER_CELL_HEIGHT = (WINDOW_HEIGHT/GRID_HEIGHT);

////////////////////////

class GoLBoard
{
  constructor()
  {
    this.currentFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.nextFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.coloredFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => [0,0,100]));
    this.color = [H_DEFAULT, S_DEFAULT, V_DEFAULT];
    this.playing = true;
    this.showAliveCells = true;
  }

  reset()
  {
    this.currentFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.nextFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.coloredFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => [0,0,100]));
    this.color = [H_DEFAULT, S_DEFAULT, V_DEFAULT];
    this.playing = true;
    this.showAliveCells = true;
  }

  togglePause()
  {
    this.playing != this.playing;
  }

  toggleShowAliveCells()
  {
    this.showAliveCells != this.showAliveCells;
  }

  setCell(x, y)
  {
    console.log("X", x, "Y", y);
    console.log(this.currentFrame);
    console.log(this.currentFrame[y]);
    console.log(this.currentFrame[y][x]);
    this.currentFrame[y][x] = 1;
    this.coloredFrame[y][x] = [0,0,0];
  }

  getCell(x, y)
  {
    return this.currentFrame[y][x];
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
    console.log(x, y, "ALIVE NEIGHBORS:", numAliveNeighbors);
    return numAliveNeighbors;
  }

  printFrame()
  {
    for (var y = 0; y < GRID_HEIGHT; y++)
    {
      console.log(this.currentFrame[GRID_HEIGHT - y - 1], " | ", this.nextFrame[GRID_HEIGHT - y - 1]);
    }
  }

  updateBoard()
  {
    if (!this.playing)
    {
      return;
    }
    
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
        if (currentValue > 0 && (numAliveNeighbors == 2 || numAliveNeighbors == 3))
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
    this.nextFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    
    var newh = (this.color[0] + H_DELTA) % H_MAX;
    var news = this.color[1];
    var newv = this.color[2];
    this.color = [newh, news, newv];
  }

  drawBoard()
  {
    for (var y = 0; y < GRID_HEIGHT; y++)
    {
      for (var x = 0; x < GRID_WIDTH; x++)
      {
        var cellColor = this.coloredFrame[y][x];
        if (this.getCell(x, y) == 1)
        {
          if (this.showAliveCells)
          {
            fill(0, 0, 0);
          }
          else
          {
            fill(cellColor[0], cellColor[1], cellColor[2]);
          }
        }
        else
        {
          if (COLORED)
          {
            fill(cellColor[0], cellColor[1], cellColor[2]);
          }
          else
          {
            fill(0, 0, 100);
          }
        }

        rect(x * GRID_RENDER_CELL_WIDTH, y * GRID_RENDER_CELL_HEIGHT, GRID_RENDER_CELL_WIDTH, GRID_RENDER_CELL_HEIGHT);
        this.coloredFrame[y][x] = [(cellColor[0] - H_DECAY < 0) ? 0 : (cellColor[0] - H_DECAY), 
                                   (cellColor[1] - S_DECAY < 0) ? 0 : (cellColor[1] - S_DECAY), 
                                   (cellColor[2] - V_DECAY < 0) ? 0 : (cellColor[2] - V_DECAY)];
      }
    }
  }
}

////////////////////////

board = new GoLBoard();

function mouseMoved()
{
}

function mouseWheel()
{
}

function mouseClicked()
{
  console.log("MOUSE CLICKED", mouseX, mouseY);
  var cellX = int(mouseX / GRID_RENDER_CELL_WIDTH);
  var cellY = int(mouseY / GRID_RENDER_CELL_HEIGHT); 
  board.setCell(cellX, cellY);
}

function mouseDragged()
{
  console.log("MOUSE MOVED", mouseX, mouseY);
  try
  {
    if (mousePressed)
    {
      var cellX = int(mouseX / GRID_RENDER_CELL_WIDTH);
      var cellY = int(mouseY / GRID_RENDER_CELL_HEIGHT); 
      board.setCell(cellX, cellY);
    }
  }
  catch
  {
    console.log("Mouse drag out of bounds error!");
  }
}

function keyPressed()
{
  console.log("KEY PRESSED", key);
  if (key == ' ')
  {
    board.togglePause();
  }
  if (key == 'r')
  {
    board.reset();
  }
  if (key == 'a')
  {
    board.toggleShowAliveCells();
  }
  if (key == 'q')
  {
    board.updateBoard();
  }
  if (key == 'p')
  {
    board.printFrame();
  }
}

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
  background(DEFAULT_BACKGROUND);
  //board.updateBoard();
  board.drawBoard();
}
