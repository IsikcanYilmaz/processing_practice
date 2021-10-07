var WINDOW_HEIGHT = 900;
var WINDOW_WIDTH  = 900;

var H_MAX = 100;
var S_MAX = 100;
var V_MAX = 100;

var DEFAULT_BACKGROUND = [0, 0, 100];
var DEFAULT_STROKE_COLOR = [250, 0, 100];

var PI  = Math.PI;
var TAU = Math.PI * 2;

////////////////////////

var DEFAULT_UPDATE_PER_SECOND = 999;
var UPDATE_PER_SECOND_MAX = 999;
var UPDATE_PER_SECOND_MIN = 0.5;

var GRID_WIDTH = 200;
var GRID_HEIGHT = 200;

var CELL_WIDTH_PX = WINDOW_WIDTH / GRID_WIDTH;
var CELL_HEIGHT_PX = WINDOW_HEIGHT / GRID_HEIGHT;

var DEBUG_ALLOWED_CELLS = false;
var DEBUG_DIRECTION = false;

var ONLY_DRAW_HEAD = true;
var NUM_UPDATES_PER_FRAME = (ONLY_DRAW_HEAD ? 1 : 100);

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

// DIRECTIONS
var WEST = 0;
var NORTH = 1;
var EAST = 2;
var SOUTH = 3;
var LEFT_TURN = -1;
var RIGHT_TURN = 1;
var directions = [WEST, NORTH, EAST, SOUTH];

class Line
{
  constructor(x, y, gridReference, dir=NORTH, color=null)
  {
    this.x = x;
    this.y = y;
    this.length = 1;
    this.occupiedCells = [[x,y]];
    this.head = [x,y];
    this.tail = [x,y];
    this.initialDirection = dir;
    this.direction = dir;
    this.blocked = false;
    this.reversed = false;
    this.drawnCells = 0;

    this.turnChance = 0.3;
    this.rightTurnChance = 0.5;
    this.turningRight = true;

    this.gridReference = gridReference;
    this.gridReference.setCell(x, y, this);

    if (color == null)
    {
      var h = int(Math.random() * H_MAX);
      var s = int((Math.random() * 0.7 + 0.2) * S_MAX);
      var v = int(Math.random() * V_MAX/2 + V_MAX/2);
      this.color = [h, s, v];
    }
    else
    {
      this.color = color;
    }
    this.drawLine();
  }

  canMoveForward()
  {
    var c = this.gridReference.getCellWithDirection(this.head[0], this.head[1], this.direction);
    return c == 0;
  }

  reverseLine()
  {
    var tmp = this.tail;
    this.head = [this.tail[0], this.tail[1]];
    this.tail = [tmp[0], tmp[1]];
    this.x = this.head[0];
    this.y = this.head[1];
    this.occupiedCells.reverse();
    this.direction = (this.initialDirection - 2 >= 0) ? (this.initialDirection - 2) : (directions.length + (this.initialDirection - 2));
    this.reversed = true;
  }

  moveForward()
  {
    // See if we can move forward. if not, return -1
    var c = this.gridReference.getCellWithDirection(this.head[0], this.head[1], this.direction);

    if (c == 0)
    {
      var coords = this.gridReference.getCellWithDirectionCoords(this.head[0], this.head[1], this.direction);
      this.head = coords;
      this.occupiedCells.push(coords);
      this.x = coords[0];
      this.y = coords[1];
      this.gridReference.setCell(this.x, this.y, this);
      return [this.x, this.y];
    }
    return -1;
  }

  turn(t)
  {
    if (t != LEFT_TURN && t != RIGHT_TURN)
    {
      return -1;
    }
    var movableCells = this.getMovableCells();
    var relativeTargetDir = (this.direction + t >= 0) ? (this.direction + t) : (directions.length + (this.direction + t));
    relativeTargetDir = relativeTargetDir % directions.length;
    var relativeTargetCoord = this.gridReference.getCellWithDirectionCoords(this.x, this.y, relativeTargetDir);
    var targetCoordTurnable = false;
    for (var i = 0; i < movableCells.length; i++)
    {
      if (movableCells[i][0] === relativeTargetCoord[0] && movableCells[i][1] === relativeTargetCoord[1])
      {
        targetCoordTurnable = true;
        break;
      }
    }

    if (targetCoordTurnable)
    {
      this.direction = relativeTargetDir;
      return this.direction;
    }
    return -1;
  }

  getMovableCells()
  {
    var possibleDirections = [];
    var neighbors = [];
    var backidx = (this.direction - 2 >= 0) ? (this.direction - 2) : (directions.length + (this.direction - 2));

    // Get our possible directions
    for (var i = 0; i < directions.length; i++)
    {
      if (i != backidx)
      {
        possibleDirections.push(i);
      }
    }

    // Get our possible neighbor cells
    for (var i = 0; i < possibleDirections.length; i++)
    {
      var c = this.gridReference.getCellWithDirection(this.x, this.y, possibleDirections[i]);
      if (c == 0)
      {
        neighbors.push(this.gridReference.getCellWithDirectionCoords(this.x, this.y, possibleDirections[i]));
      }
    }
    
    // $neighbors now have the x,y coordinates of movable cells
    if (neighbors.length == 0 && this.reversed)
    {
      this.blocked = true;
    }
    return(neighbors);
  }

  updateLine()
  {
    if (this.moveForward() == -1)
    {
      if (this.turn(RIGHT_TURN) == -1)
      {
        if (this.turn(LEFT_TURN) == -1)
        {
          this.reverseLine();
        }
      }
    }
  }

  drawLine()
  {    
    if (ONLY_DRAW_HEAD)
    {
      var x = this.head[0];
      var y = this.head[1];
      fill(this.color[0], this.color[1], this.color[2]);
      strokeWeight(0);
      rect(x * CELL_WIDTH_PX, y * CELL_HEIGHT_PX, CELL_WIDTH_PX, CELL_HEIGHT_PX);
    }
    else
    {
      if (this.blocked && this.occupiedCells.length == this.drawnCells)
      {
        return -1;
      }
      // Draw all cells of the line
      for (var c = this.occupiedCells.length - 1; c >= 0; c--)
      {
        var x = this.occupiedCells[c][0];
        var y = this.occupiedCells[c][1];
        fill(this.color[0], this.color[1], this.color[2]);
        if (DEBUG_ALLOWED_CELLS)
        {
          strokeWeight(1);
        }
        else
        {
          strokeWeight(0);
        }
        rect(x * CELL_WIDTH_PX, y * CELL_HEIGHT_PX, CELL_WIDTH_PX, CELL_HEIGHT_PX); 
        this.drawnCells++;
      }
    }
    
    if (DEBUG_ALLOWED_CELLS)
    {
      // Draw movable cells
      var movableCells = this.getMovableCells();
      for (var c = 0; c < movableCells.length; c++)
      {
        var x = movableCells[c][0];
        var y = movableCells[c][1];
        fill(this.color[0], this.color[1]/2, this.color[2]);
        strokeWeight(0);
        rect(x * CELL_WIDTH_PX, y * CELL_HEIGHT_PX, CELL_WIDTH_PX, CELL_HEIGHT_PX); 
      }
    }

    if (DEBUG_DIRECTION)
    {
      // Draw direction indicator
      var x = this.head[0];
      var y = this.head[1];
      var xPix = x * CELL_WIDTH_PX + (CELL_WIDTH_PX / 2);
      var yPix = y * CELL_HEIGHT_PX + (CELL_HEIGHT_PX / 2);
      switch (this.direction)
      {
        case WEST:
          xPix -= CELL_WIDTH_PX/2;
          break;
        case NORTH:
          yPix -= CELL_HEIGHT_PX/2;
          break;
        case EAST:
          xPix += CELL_WIDTH_PX/2;
          break;
        case SOUTH:
          yPix += CELL_HEIGHT_PX/2;
          break;
        default:
      }
      strokeWeight(CELL_WIDTH_PX/4);
      fill(0, 0, 0);
      point(xPix, yPix);
    }
  return 1;
  }
}

class Grid
{
  constructor()
  {
    this.grid = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.lines = [];
    this.lineSpawnChance = 0.10;
    this.cellSettingsDuringThisIter = 0;
    this.allCellsFull = false;
  }

  getCell(x, y)
  {
    if (x > GRID_WIDTH - 1 || x < 0 || y > GRID_HEIGHT - 1 || y < 0)
    {
      return -1;
    }
    return this.grid[y][x];
  }

  setCell(x, y, lineReference)
  {
    this.cellSettingsDuringThisIter++;
    this.grid[y][x] = lineReference; // TODO is this a good idea?
  }

  getCellWithDirection(x, y, dir)
  {
    if (dir < 0 || dir >= 4)
    {
      return -1;
    }
    else
    {
      var coords = this.getCellWithDirectionCoords(x, y, dir);
      return this.getCell(coords[0], coords[1]);
    }
  }

  getCellWithDirectionCoords(x, y, dir)
  {
    switch(dir)
    {
      case WEST:
        {
          return [x-1, y];
        }
      case NORTH:
        {
          return [x, y-1];
        }
      case EAST:
        {
          return [x+1, y];
        }
      case SOUTH:
        {
          return [x, y+1];
        }
      default:
        {
          return -1;
        }
    }
  }

  spawnLineInRandomCoord(force=false)
  {
    var cellFound = false;
    var randX = int(Math.random() * GRID_WIDTH);
    var randY = int(Math.random() * GRID_HEIGHT);
    var dir = int(Math.random() * directions.length);
    if (this.getCell(randX, randY) == 0)
    {
      this.lines.push(new Line(randX, randY, this, dir));
      cellFound = true;
    }

    if (force && !cellFound)
    {
      // If we couldnt randomly find an empty cell and are being forced, go thru all the cells and pick the first empty cell
      for (var x = 0; x < GRID_WIDTH; x++)
      {
        for (var y = 0; y < GRID_HEIGHT; y++)
        {
          if (this.getCell(x, y) == 0)
          {
            this.lines.push(new Line(x, y, this, dir));
            return 0;
          }
        }
      }
      this.allCellsFull = true;
      console.log("All cells are occupied");
    }
  }

  updateGrid()
  { 
    if (this.allCellsFull)
    {
      return 0;
    }
    if (this.lines.length == 0)
    {
      this.spawnLineInRandomCoord();
    }
    else
    {
      // By chance spawn a new line
      for (var l = 0; l < this.lines.length; l++)
      {
        this.lines[l].updateLine();
      }
      if (Math.random() < this.lineSpawnChance)
      {
        var force = (this.cellSettingsDuringThisIter == 0);
        this.spawnLineInRandomCoord(force);
      }
    }
    this.cellSettingsDuringThisIter = 0;
  }

  drawGrid()
  {
    for (var y = 0; y < GRID_HEIGHT; y++)
    {
      for (var x = 0; x < GRID_WIDTH; x++)
      {
        stroke(0, 0, 0);
        strokeWeight(0);
        fill(0, 0, 100);
        rect(x * CELL_WIDTH_PX, y * CELL_HEIGHT_PX, CELL_WIDTH_PX, CELL_HEIGHT_PX); 
      }
    }
  }

  drawLines()
  {
    for (var l = 0; l < this.lines.length; l++)
    {
      this.lines[l].drawLine();
    }
  }
}

class Canvas 
{
  constructor()
  {
    this.grid = new Grid();
    this.lastUpdateTimestamp = 0;
    this.setFrameFrequency(DEFAULT_UPDATE_PER_SECOND);
  }

  setFrameFrequency(hz)
  {
    if (hz > UPDATE_PER_SECOND_MAX)
    {
      hz = UPDATE_PER_SECOND_MAX;
    }
    if (hz < UPDATE_PER_SECOND_MIN)
    {
      hz = UPDATE_PER_SECOND_MIN;
    }
    this.frameFrequency = hz;
    this.framePeriod = 1.0/hz;
    this.framePeriodMs = this.framePeriod * 1000;
    console.log("NEW FREQ:", this.frameFrequency, "NEW PERIOD:", this.framePeriodMs);
  }

  updateDrawCanvas()
  {
    // Frame per second limiting
    var now = Date.now();
    if (now - this.lastUpdateTimestamp < this.framePeriodMs)
    {
      return;
    }
    else
    {
      this.lastUpdateTimestamp = now;
    }

    //background(DEFAULT_BACKGROUND);
    for (var i = 0; i < NUM_UPDATES_PER_FRAME; i++)
    {
      this.grid.updateGrid();
    }
    //this.grid.drawGrid();
    this.grid.drawLines();
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
  myCanvas.updateDrawCanvas();
}
