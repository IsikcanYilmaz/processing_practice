var H_MAX = 360;
var S_MAX = 100;
var V_MAX = 100;

var DEFAULT_BACKGROUND = [0, 0, 0];
var DEFAULT_STROKE_COLOR = [250, 0, 100];

var DEBUGVISUALS = false;

var PI  = Math.PI;
var TAU = Math.PI * 2;

////////////////////////

var WINDOW_HEIGHT = 800;
var WINDOW_WIDTH  = 800;
var GRID_CELLS_Y = 50;
var GRID_CELLS_X = 50;

var INPUT_MIRROR = false;
var VISUAL_MIRROR = true;

var GRID_RENDER_CELL_WIDTH = (WINDOW_WIDTH/GRID_CELLS_X);
var GRID_RENDER_CELL_HEIGHT = (WINDOW_HEIGHT/GRID_CELLS_Y);
var GRID_HEIGHT = GRID_CELLS_Y * GRID_RENDER_CELL_WIDTH;
var GRID_WIDTH  = GRID_CELLS_X * GRID_RENDER_CELL_WIDTH;
if (VISUAL_MIRROR)
{
  GRID_RENDER_CELL_HEIGHT /= 2;
  GRID_RENDER_CELL_WIDTH /= 2;
  GRID_HEIGHT /= 2;
  GRID_WIDTH /= 2;
}

var DRAW_CIRCLE_GRANULARITY = 360;
var DRAW_CIRCLE_RAND_MAX = 200;
var DRAW_CIRCLE_RAND_MIN = 20;

var H_DEFAULT = 0;
var S_DEFAULT = 100;
var V_DEFAULT = 100;

var H_DELTA = 2;
var H_DECAY = 0;
var S_DECAY = 0.25;
var V_DECAY = 0;

var COLORED = false;
var STROKE_WEIGHT = 0;

var DEFAULT_UPDATE_PER_SECOND = 1;
var UPDATE_PER_SECOND_MAX = 30;
var UPDATE_PER_SECOND_MIN = 0.5;

var MOUSE_WHEEL_SMOOTHING_COEFF = 0.001;
var MOUSE_WHEEL_MAX_DELTA = 0.01;

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

class GoLCell
{
  constructor(x, y, board)
  {
    this.alive = false;
    this.x = x;
    this.y = y;
    this.board = board;
  }

  set(alive)
  {
    this.alive = alive;
  }
}

class GoLBoard
{
  constructor()
  {
    this.currentFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
    this.nextFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
    this.coloredFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => [0,0,100]));
    this.color = [H_DEFAULT, S_DEFAULT, V_DEFAULT];
    this.playing = false;
    this.showAliveCells = true;
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

  getFrameFrequency()
  {
    return this.frameFrequency;
  }

  reset()
  {
    this.currentFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
    this.nextFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
    this.coloredFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => [0,0,100]));
    this.color = [H_DEFAULT, S_DEFAULT, V_DEFAULT];
    this.playing = false;
    this.showAliveCells = true;
  }

  togglePause()
  {
    this.playing = !this.playing;
    if (this.playing)
    {
      console.log("UNPAUSED");
    }
    else
    {
      console.log("PAUSED");
    }
  }

  toggleShowAliveCells()
  {
    this.showAliveCells = !this.showAliveCells;
  }

  setCell(x, y)
  {
    //console.log("X", x, "Y", y);
    this.currentFrame[y][x] = 1;
    this.coloredFrame[y][x] = [0,0,0];
    if (INPUT_MIRROR)
    {
      this.currentFrame[y][GRID_CELLS_X - x] = 1;
      this.currentFrame[GRID_CELLS_Y-y][x] = 1;
      this.currentFrame[GRID_CELLS_Y-y][GRID_CELLS_X - x] = 1;
      this.coloredFrame[y][GRID_CELLS_X-x] = [0,0,0];
      this.coloredFrame[GRID_CELLS_Y-y][x] = [0,0,0];
      this.coloredFrame[GRID_CELLS_Y-y][GRID_CELLS_X-x] = [0,0,0];
    }
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
        if (xDir == 0 && yDir == 0)
        {
          continue;
        }
        if (xDir == -1 && x == 0)
        {
          continue;
        }
        if (xDir == 1 && x == GRID_CELLS_X - 1)
        {
          continue;
        }
        if (yDir == -1 && y == 0)
        {
          continue;
        }
        if (yDir == 1 && y == GRID_CELLS_Y - 1)
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
    for (var y = 0; y < GRID_CELLS_Y; y++)
    {
      console.log(this.currentFrame[GRID_CELLS_Y - y - 1], " | ", this.nextFrame[GRID_CELLS_Y - y - 1]);
    }
  }

  updateBoard()
  {
    if (!this.playing)
    {
      return;
    }

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
    this.nextFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));

    var newh = (this.color[0] + H_DELTA) % H_MAX;
    var news = this.color[1];
    var newv = this.color[2];
    this.color = [newh, news, newv];
  }

  drawBoard()
  {
    for (var y = 0; y < GRID_CELLS_Y; y++)
    {
      for (var x = 0; x < GRID_CELLS_X; x++)
      {
        var cellColor = [0, 0, 100];
        if (COLORED)
        {
          cellColor = this.coloredFrame[y][x];
        }
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
          fill(cellColor[0], cellColor[1], cellColor[2]);
        }
        
        strokeWeight(STROKE_WEIGHT);
        rect(x * GRID_RENDER_CELL_WIDTH, y * GRID_RENDER_CELL_HEIGHT, GRID_RENDER_CELL_WIDTH, GRID_RENDER_CELL_HEIGHT);
        if (VISUAL_MIRROR)
        {
          rect(GRID_WIDTH - GRID_RENDER_CELL_WIDTH + (GRID_CELLS_X-x) * GRID_RENDER_CELL_WIDTH, y * GRID_RENDER_CELL_HEIGHT, GRID_RENDER_CELL_WIDTH, GRID_RENDER_CELL_HEIGHT);
          rect(x * GRID_RENDER_CELL_WIDTH, GRID_HEIGHT - GRID_RENDER_CELL_HEIGHT + (GRID_CELLS_Y-y) * GRID_RENDER_CELL_HEIGHT, GRID_RENDER_CELL_WIDTH, GRID_RENDER_CELL_HEIGHT);
          rect(GRID_WIDTH - GRID_RENDER_CELL_WIDTH + (GRID_CELLS_X-x) * GRID_RENDER_CELL_WIDTH, GRID_HEIGHT - GRID_RENDER_CELL_HEIGHT + (GRID_CELLS_Y-y) * GRID_RENDER_CELL_HEIGHT, GRID_RENDER_CELL_WIDTH, GRID_RENDER_CELL_HEIGHT);
        }
        this.coloredFrame[y][x] = [(cellColor[0] - H_DECAY < 0) ? 0 : (cellColor[0] - H_DECAY), 
          (cellColor[1] - S_DECAY < 0) ? 0 : (cellColor[1] - S_DECAY), 
          (cellColor[2] - V_DECAY < 0) ? 0 : (cellColor[2] - V_DECAY)];
      }
    }
  }
}

////////////////////////

class Canvas 
{
  constructor()
  {
    this.board = new GoLBoard();
  }

  updateCanvas()
  {
    this.board.updateBoard();
  }

  drawCanvas()
  {
    this.board.drawBoard();
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

  saveFrame()
  {
    var filename = "trippy_gol-" + str(this.frameId).padStart(5, "0");
    saveCanvas(p5jsCanvas, filename, "jpg");
  }

  mouseInput(x, y)
  {
    if (VISUAL_MIRROR)
    {
      if (x > GRID_WIDTH)
      {
        x = GRID_WIDTH - (x - GRID_WIDTH);
      }
      if (y > GRID_HEIGHT)
      {
        y = GRID_HEIGHT - (y - GRID_HEIGHT);
      }
    }
    var cellX = int(x / GRID_RENDER_CELL_WIDTH);
    var cellY = int(y / GRID_RENDER_CELL_HEIGHT);
    if (cellX < GRID_CELLS_X && cellX >= 0 && cellY < GRID_CELLS_Y && cellY >= 0)
    {
      this.board.setCell(cellX, cellY);
    }
  }

  changeBoardSpeedBy(d)
  {
    if (d > MOUSE_WHEEL_MAX_DELTA)
    {
      d = MOUSE_WHEEL_MAX_DELTA;
    }
    this.board.setFrameFrequency(this.board.getFrameFrequency() + event.delta);
  }

  togglePause()
  {
    this.board.togglePause();
  }

  drawCircle(centerx, centery, radius)
  {
    var vec = createVector(centerx, centery);
    vec.setMag(radius);
    for (var i = 0; i < DRAW_CIRCLE_GRANULARITY; i++)
    {
      this.mouseInput(centerx + vec.x, centery + vec.y);
      vec.rotate(360 / DRAW_CIRCLE_GRANULARITY);
    }
  }

  reset()
  {
    this.board.reset();
  }
}

////////////////////////

function mouseClickedGeneric(mouseX, mouseY)
{
  myCanvas.mouseInput(mouseX, mouseY);
}

function keyPressedGeneric(k)
{
  console.log("KEY PRESSED", key);
  if (key == ' ')
  {
    myCanvas.togglePause();
  }
  if (key == 'r')
  {
    myCanvas.reset();
  }
  if (key == 'a')
  {
    myCanvas.board.toggleShowAliveCells();
  }
  if (key == 'c')
  {
    var centerx = WINDOW_WIDTH/2;
    var centery = WINDOW_HEIGHT/2;
    var r = Math.random() * (DRAW_CIRCLE_RAND_MAX - DRAW_CIRCLE_RAND_MIN) + DRAW_CIRCLE_RAND_MIN;
    myCanvas.drawCircle(centerx, centery, r);
  }
  if (key == 'C')
  {
    var centerx = WINDOW_WIDTH/2;
    var centery = WINDOW_HEIGHT/2;
    var centerDiffX = Math.abs(centerx - mouseX);
    var centerDiffY = Math.abs(centery - mouseY);
    var r = createVector(centerDiffX, centerDiffY).mag();
    myCanvas.drawCircle(centerx, centery, r);
  }
}

function mouseClicked()
{
  console.log("MOUSE CLICKED", mouseX, mouseY);
  mouseClickedGeneric(mouseX, mouseY);
}

function mouseDragged()
{
  mouseClickedGeneric(mouseX, mouseY);
}

function mouseWheel(event)
{
  var smoothDelta = event.delta * MOUSE_WHEEL_SMOOTHING_COEFF;
  console.log("MOUSE WHEEL", event.delta, "CHANGE FREQ BY", smoothDelta);
  myCanvas.changeBoardSpeedBy(smoothDelta);
}

function keyPressed()
{
  keyPressedGeneric(key);
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
  if (key == 'o')
  {
    COLORED = !COLORED;
    console.log("COLORED:", COLORED);
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
