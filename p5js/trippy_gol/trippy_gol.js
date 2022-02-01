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
    this.currentFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.nextFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.coloredFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => [0,0,100]));
    this.color = [H_DEFAULT, S_DEFAULT, V_DEFAULT];
    this.playing = true;
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
    this.currentFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.nextFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => 0));
    this.coloredFrame = Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => [0,0,100]));
    this.color = [H_DEFAULT, S_DEFAULT, V_DEFAULT];
    this.playing = true;
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
    console.log("X", x, "Y", y);
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
        if (xDir == 0 && yDir == 0)
        {
          continue;
        }
        if (xDir == -1 && x == 0)
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
