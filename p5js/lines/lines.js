var WINDOW_HEIGHT = 1000;
var WINDOW_WIDTH  = 1000;

var H_MAX = 100;
var S_MAX = 100;
var V_MAX = 100;

var DEFAULT_BACKGROUND = [0, 0, 100];
var DEFAULT_STROKE_COLOR = [250, 0, 100];

var PI  = Math.PI;
var TAU = Math.PI * 2;

////////////////////////

var SAVE_FRAMES = false;
var NUM_FULL_DRAWINGS_TO_SAVE = 4;

var DEFAULT_UPDATE_PER_SECOND = 999;
if (SAVE_FRAMES)
{
  DEFAULT_UPDATE_PER_SECOND = 8;
}
var UPDATE_PER_SECOND_MAX = 999;
var UPDATE_PER_SECOND_MIN = 0.5;

var GRID_WIDTH = 100;
var GRID_HEIGHT = 100;

var DEFAULT_LINE_SPAWN_CHANCE = 0.99;
var RANDOM_SPAWN_CHANCE_AFTER_RESET = false;
var LINE_SPAWN_CHANCE_CEIL = 0.99;
var LINE_SPAWN_CHANCE_FLOOR = 0.5;

var CELL_WIDTH_PX = WINDOW_WIDTH / GRID_WIDTH;
var CELL_HEIGHT_PX = WINDOW_HEIGHT / GRID_HEIGHT;

var DEBUG_ALLOWED_CELLS = false;
var DEBUG_DIRECTION = false;
var DEBUG_SINGLE_LINE = false;
var DEBUG_CELL_IDS = false;
var DEBUG_UNDO_CELL_IDS = false;

var ONLY_DRAW_HEAD = true;
var NUM_UPDATES_PER_FRAME = (ONLY_DRAW_HEAD ? 1 : 100);

var UNDO_AFTER_COMPLETION = true;
var NUM_CELLS_TO_UNDO_PER_ITER = 2;
var NUM_COMPLETIONS_TO_UNDO = 1;
var LATENCY_AFTER_UNDONE_MS = 1000;

var RESET_GRID_AFTER_COMPLETION = true;
var RESET_GRID_AFTER_COMPLETION_LATENCY_MS = 4000;

if (SAVE_FRAMES)
{
  LATENCY_AFTER_UNDONE_MS = 4000;
  RESET_GRID_AFTER_COMPLETION_LATENCY_MS = 10000;
}

var CHANGING_COLOR = false;
var DEFAULT_H_RANGE = 0.30;
var DEFAULT_H_BASE  = 0.53;
var DEFAULT_S_RANGE = 0.5;
var DEFAULT_S_BASE  = 0.4;
var DEFAULT_V_RANGE = V_MAX/2;
var DEFAULT_V_BASE  = V_MAX/2;

var H_CEIL = 1;
var H_FLOOR = 0;
var H_RANGE_CEIL = 0.3;
var S_CEIL = 0.9;
var S_FLOOR = 0.3;
var S_RANGE_CEIL = 0.8;
var V_CEIL = 1;
var V_FLOOR = 0;

////////////////////////

// DIRECTIONS
var WEST = 0;
var NORTH = 1;
var EAST = 2;
var SOUTH = 3;
var LEFT_TURN = -1;
var RIGHT_TURN = 1;
var directions = [WEST, NORTH, EAST, SOUTH];

// BEHAVIORS
var BEHAVIOR_BASIC = 0;
var BEHAVIOR_ZIG_ZAG = 1;
var BEHAVIOR_WHIRLY = 2;

var BEHAVIOR_CHANCES = [1, 0.0, 0.0];

class ColorGen
{
  // Range and Base variables are to be between 0 and 1
  constructor(hRange, hBase, sRange, sBase, vRange=DEFAULT_V_RANGE, vBase=DEFAULT_V_BASE)
  {
    this.hRange = hRange;
    this.hBase = hBase;
    this.sRange = sRange;
    this.sBase = sBase;
    this.vRange = vRange;
    this.vBase = vBase;
  }

  moveColor()
  {
    this.hBase = (this.hBase + 0.05) % 1;
  }

  randomizeH()
  {
    this.hBase = Math.random() * (H_CEIL - H_FLOOR) + H_FLOOR;
    this.hRange = Math.random();
    if (this.hBase + this.hRange > H_CEIL)
    {
      this.hRange = H_CEIL - this.hBase;
    }
    if (this.hRange > H_RANGE_CEIL)
    {
      this.hRange = H_RANGE_CEIL;
    }
    console.log("Color Gen new hBase:", this.hBase, "new hRange:", this.hRange);
  }

  randomizeS()
  {
    this.sBase = Math.random() * (S_CEIL - S_FLOOR) + S_FLOOR;
    this.sRange = Math.random();
    if (this.sBase + this.sRange > S_CEIL)
    {
      this.sRange = S_CEIL - this.sBase;
    }
    if (this.sRange > S_RANGE_CEIL)
    {
      this.sRange = S_RANGE_CEIL;
    }
    console.log("Color Gen new sBase:", this.sBase, "new sRange:", this.sRange);
  }

  getRandomColor()
  {
    var h = int((Math.random() * this.hRange + this.hBase) * H_MAX);
    var s = int((Math.random() * this.sRange + this.sBase) * S_MAX);
    var v = int((Math.random() * this.vRange + this.vBase) * V_MAX);
    return [h, s, v];
  }
}

class Line
{
  constructor(x, y, gridReference, dir=NORTH, color=null, behaviorIdx=BEHAVIOR_BASIC)
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
      var h = int((Math.random() * 0.3 + 0.5) * H_MAX);
      var s = int((Math.random() * 0.7 + 0.1) * S_MAX);
      var v = int(Math.random() * V_MAX/2 + V_MAX/2);
      this.color = [h, s, v];
    }
    else
    {
      this.color = color;
    }

    this.behaviorIdx = behaviorIdx;
    this.behaviorArray = [this.behaviorBasicForwardRightLeft, this.behaviorZigZag, this.behaviorWhirly];
    this.behaviorFunction = this.behaviorArray[this.behaviorIdx];

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

  // BEHAVIOR UTILS ////
  setBehavior(idx)
  {
    if (idx < BEHAVIORS.length)
    {
      this.behaviorIdx = idx;
    }
  }

  // BEHAVIORS /////////
  behaviorBasicForwardRightLeft()
  {
    if (this.moveForward() == -1)
    {
      if (this.turn(RIGHT_TURN) == -1)
      {
        if (this.turn(LEFT_TURN) == -1)
        {
          if (!this.reversed)
          {
            this.reverseLine();
          }
          else
          {
            this.blocked = true;
          }
        }
      }
    }
  }

  behaviorZigZag()
  {
    if (this.zigZagStage == undefined)
    {
      this.zigZagStage = 0;
      this.lastTurnDirection = RIGHT_TURN;
    }

    switch(this.zigZagStage % 8)
    {
      case 1:
        {
          this.turn(LEFT_TURN);
          break;
        }
      case 3:
        {
          this.turn(RIGHT_TURN);
          break;
        }
      case 5:
        {
          this.turn(RIGHT_TURN);
          break;
        }
      case 7:
        {
          this.turn(LEFT_TURN);
          break;
        }
    }
    this.moveForward();
    this.zigZagStage++;
  }

  behaviorWhirly()
  {
    if (this.whirlyDirection == undefined)
    {
      this.whirlyDirection = ((Math.random() < 0.5) ? LEFT_TURN : RIGHT_TURN);
      this.whirlyStage = 0;
      this.whirlyForwardLength = 2;
      this.whirlyPitch = int(this.whirlyForwardLength / 2);
    }

    if (this.blocked)
    {
      return;
    }

    if (this.whirlyStage % this.whirlyForwardLength == 0 && this.whirlyStage != 0)
    {
      if (this.turn(this.whirlyDirection) == -1)
      {
        this.whirlyDirection = (this.whirlyDirection == LEFT_TURN ? RIGHT_TURN : LEFT_TURN); 
      }
      this.whirlyStage = 0;
      this.whirlyForwardLength += this.whirlyPitch;
    }
    else
    {
      if (this.canMoveForward())
      {
        this.moveForward();
      }
      else
      {
        //this.setBehavior(BEHAVIOR_BASIC);
        this.whirlyDirection = (this.whirlyDirection == LEFT_TURN ? RIGHT_TURN : LEFT_TURN); 
        this.whirlyStage = 0;
      }
    }
    this.whirlyStage++;
  }

  ///////////////////////

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

    return(neighbors);
  }

  updateLine()
  {
    if (!this.blocked)
    {
      this.behaviorFunction();
    }
  }

  undoAndErase(numCellsToErase = 1)
  {
    for (var c = 0; c < numCellsToErase; c++)
    {
      if (this.occupiedCells.length == 0)
      {
        return;
      }
      var cellToEraseIdx = this.occupiedCells.length - 1;
      var cellToErase = this.occupiedCells[cellToEraseIdx];
      var x = cellToErase[0];
      var y = cellToErase[1];
      fill(0, 0, 100); // WHITE
      strokeWeight(0);
      rect(x * CELL_WIDTH_PX, y * CELL_HEIGHT_PX, CELL_WIDTH_PX, CELL_HEIGHT_PX);
      this.occupiedCells = this.occupiedCells.splice(0, cellToEraseIdx);
      this.gridReference.numOccupiedCells--;

      if (DEBUG_UNDO_CELL_IDS)
      {
        fill(0, 100, 100);
        textSize(50);
        text(this.occupiedCells.length, x * CELL_WIDTH_PX + CELL_WIDTH_PX/2, y * CELL_HEIGHT_PX + CELL_HEIGHT_PX/2);
        textSize(20);
        text([x, y], x * CELL_WIDTH_PX + CELL_WIDTH_PX/2 + 30, y * CELL_HEIGHT_PX + CELL_HEIGHT_PX/2 + 30);
      }
    }
  }

  drawLine()
  {
    if (ONLY_DRAW_HEAD)
    {
      if (this.blocked)
      {
        return -1;
      }
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
        fill(this.color[0], this.color[1]/5, 0);
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

    if (DEBUG_CELL_IDS)
    {
      fill(0, 0, 0);
      textSize(50);
      text(this.occupiedCells.length, this.x * CELL_WIDTH_PX + CELL_WIDTH_PX/2, this.y * CELL_HEIGHT_PX + CELL_HEIGHT_PX/2);
      textSize(20);
      text([this.x, this.y], this.x * CELL_WIDTH_PX + CELL_WIDTH_PX/2 + 30, this.y * CELL_HEIGHT_PX + CELL_HEIGHT_PX/2 + 30);
    }
    return 1;
  }
}

class Grid
{
  constructor()
  {
    this.reset();
    this.colorGen = new ColorGen(DEFAULT_H_RANGE, DEFAULT_H_BASE, DEFAULT_S_RANGE, DEFAULT_S_BASE);
    this.lineSpawnChance = DEFAULT_LINE_SPAWN_CHANCE;
    this.numCompletions = 0;
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
    this.numOccupiedCells++;
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
    if (DEBUG_SINGLE_LINE && this.lines.length == 1)
    {
      return;
    }
    var cellFound = false;
    var randX = int(Math.random() * GRID_WIDTH);
    var randY = int(Math.random() * GRID_HEIGHT);
    var dir = int(Math.random() * directions.length);
    var color = this.colorGen.getRandomColor();
    var behDiceRoll = Math.random();
    var beh = BEHAVIOR_WHIRLY;
    for (var b = 0; b < BEHAVIOR_CHANCES.length; b++)
    {
      if (behDiceRoll > BEHAVIOR_CHANCES[b])
      {
        behDiceRoll -= BEHAVIOR_CHANCES[b];
        continue;
      }
      else if (BEHAVIOR_CHANCES[b] != 0)
      {
        beh = b;
        break;
      }
      beh = b;
    }

    if (this.getCell(randX, randY) == 0)
    {
      this.lines.push(new Line(randX, randY, this, dir, color, beh));
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
            this.lines.push(new Line(x, y, this, dir, color, beh));
            return 0;
          }
        }
      }
      this.allCellsFull = true;
      this.completionTimestamp = Date.now();
      this.numCompletions++;
      console.log("Drawing complete. Num completions", this.numCompletions);
    }
  }

  updateGrid()
  {
    if (UNDO_AFTER_COMPLETION && this.numCompletions == NUM_COMPLETIONS_TO_UNDO && (Date.now() - this.completionTimestamp > RESET_GRID_AFTER_COMPLETION_LATENCY_MS))
    {
      this.undoingPhase = true;
      this.numCompletions = 0;
      console.log("Beginning undo phase");
    }
    if (this.undoingPhase)
    {
      var numBlankLines = 0;
      for (var l = 0; l < this.lines.length; l++)
      {
        if (this.lines[l].occupiedCells.length == 0)
        {
          numBlankLines++;
        }
        else
        {
          this.lines[l].undoAndErase(NUM_CELLS_TO_UNDO_PER_ITER);
        }
      }

      // Check if undo phase is done
      if (this.numOccupiedCells == 0 && !this.undoingPhaseComplete)
      {
        console.log("Undoing phase done");
        this.undoingPhaseComplete = true;
        this.undoCompletionTimestamp = Date.now();
        if (NUM_FULL_DRAWINGS_TO_SAVE > 0)
          NUM_FULL_DRAWINGS_TO_SAVE--;
      }

      // Wait LATENCY_AFTER_UNDONE_MS
      if (this.undoingPhaseComplete && Date.now() - this.undoCompletionTimestamp > LATENCY_AFTER_UNDONE_MS)
      {
        myCanvas.reset();
      }
    }
    else
    {
      if (this.allCellsFull)
      {
        if ((RESET_GRID_AFTER_COMPLETION) && (Date.now() - this.completionTimestamp > RESET_GRID_AFTER_COMPLETION_LATENCY_MS))
        {
          if (CHANGING_COLOR)
          {
            this.colorGen.randomizeS();
          }
          this.reset();
        }
        else
        {
          return 0;
        }
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
  
  reset()
  {
    this.grid = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.lines = [];
    if (RANDOM_SPAWN_CHANCE_AFTER_RESET)
    {
      this.lineSpawnChance = Math.random() * (LINE_SPAWN_CHANCE_CEIL - LINE_SPAWN_CHANCE_FLOOR) + LINE_SPAWN_CHANCE_FLOOR;
      console.log("New line spawn chance", this.lineSpawnChance);
    }
    this.cellSettingsDuringThisIter = 0;
    this.allCellsFull = false;
    this.undoingPhase = false;
    this.undoingPhaseComplete = false;
    this.numOccupiedCells = 0;
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

  saveFrame()
  {
    var filename = "lines-" + str(frameId).padStart(5, "0");
    saveCanvas(p5jsCanvas, filename, "jpg");
  }
  
  updateAndDrawCanvas()
  {
    // Frame per second limiting
    var now = Date.now();
    if (now - this.lastUpdateTimestamp < this.framePeriodMs)
    {
      // Pass
    }
    else
    {
      if (SAVE_FRAMES && NUM_FULL_DRAWINGS_TO_SAVE > 0)
      {
        this.saveFrame();
      }

      this.lastUpdateTimestamp = now;
      for (var i = 0; i < NUM_UPDATES_PER_FRAME; i++)
      {
        this.grid.updateGrid();
      }

      if (!this.grid.undoingPhase)
      {
        this.grid.drawLines();
      }

      frameId++;
    }
  }

  reset()
  {
    this.grid.reset();
    background(DEFAULT_BACKGROUND);
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
  switch(key)
  {
    case 'r':
      {
        myCanvas.reset();
        break;
      }
    case ' ':
      {
        myCanvas.grid.undoingPhase = true;
        break;
      }
  }
}

myCanvas = new Canvas();
var p5jsCanvas = undefined;
var frameId = 0;
function setup()
{
  p5jsCanvas = createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  colorMode(HSB, H_MAX, S_MAX, V_MAX);
  background(DEFAULT_BACKGROUND);
  textSize(12);
  smooth(8);
}

function draw()
{
  //background(DEFAULT_BACKGROUND);
  myCanvas.updateAndDrawCanvas();
}
