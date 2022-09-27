var H_MAX = 360;
var S_MAX = 100;
var V_MAX = 100;
var R_MAX = 100;
var G_MAX = 100;
var B_MAX = 100;

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

var COLORED = true;
var IQ_COLOR_SCHEME = true; 
var COLOR_MODE_RGB = true;

var DEFAULT_IQ_NUMGENS = 50;
var DEFAULT_IQ_COLOR_PALETTE = 10;//13;
var IQ_REVERSE_SPECTRUM = true;

var STROKE_WEIGHT = 0;
var STROKE_COLOR = [0,0,0]; //[R_MAX, G_MAX, B_MAX];

var H_DEFAULT = 0;
var S_DEFAULT = IQ_COLOR_SCHEME ? 0 : 100;
var V_DEFAULT = 0;

var H_ALIVE = 0;
var S_ALIVE = 0;
var V_ALIVE = 100;

var H_DELTA = 0;
var H_DECAY = 0.0;
var S_DECAY = 0.25; //0.25;
var V_DECAY = 0.25;

var DEFAULT_UPDATE_PER_SECOND = 1;
var MAX_UPDATE_PER_SECOND = 50;
var UPDATE_PER_SECOND_MAX = 30;
var UPDATE_PER_SECOND_MIN = 0.5;

var MOUSE_WHEEL_SMOOTHING_COEFF = 0.001;
var MOUSE_WHEEL_MAX_DELTA = 0.01;

var SAVE_FRAMES = false;
var SAVE_FRAMES_BLACKOUT_THRESHOLD = 1;

var PATTERN_PREVIEW = false;
var PATTERN_CURRENT_ID = 0;
var PATTERN_SHADOW_MODE = false;
var PATTERN_SHADOW_COLOR = [0, 0xf, 0xff];

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
var DEBUG_PALETTE = false;

var DEBUG_PALETTE_HEIGHT = WINDOW_HEIGHT / 10;

var AUTO_INPUT_ENABLED = false;
//var AUTO_INPUT_LIST_FRAME = [
                            //[0, "key", "c"], [0, "key", "o"], [0, "key", " "], 
                            //[0, "loop", "begin", 999],
                            //[20, "key", "c"], [20, "key", "z"],
                            //[1, "loop", "end"], 
                            //];

var AUTO_INPUT_LIST_FRAME = [
                            [0, "key", "C", 90+(WINDOW_WIDTH/2), WINDOW_HEIGHT/2], [0, "key", "o"], [0, "key", " "], 
                            [0, "loop", "begin", 999],
                            //[30, "key", "C", 90+(WINDOW_WIDTH/2), WINDOW_HEIGHT/2], 
                            [0, "key", "C", 200+(WINDOW_WIDTH/2), WINDOW_HEIGHT/2], 
                            [20, "key", "z"], [20, "key", "z"], [20, "key", "z"], 
                            [1, "loop", "end"], 
                            ];

var MOBILE = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  MOBILE = true;
  AUTO_INPUT_ENABLED = true;
}

////////////////////////

class GoLColorGen
{
  constructor(numGens)
  {
    this.t = 0;
    this.colorIdx = 0;
    this.numGens = (IQ_REVERSE_SPECTRUM) ? numGens * 2 : numGens;
    this.dt = 1/numGens;
    this.setColorPalette(DEFAULT_IQ_COLOR_PALETTE);
  }

  setColorPalette(i)
  {
    console.log("Using Palette idx:", i, KNOWN_NICE_PALETTES[i]);
    this.paletteIdx = i;
    this.palette = [KNOWN_NICE_PALETTES[i][1], KNOWN_NICE_PALETTES[i][2], KNOWN_NICE_PALETTES[i][3], KNOWN_NICE_PALETTES[i][4]];
    this.hsvPalette = [];
    this.rgbPalette = [];
    for (var i = 0; i < ((IQ_REVERSE_SPECTRUM) ? this.numGens / 2 : this.numGens); i++)
    {
      var rgb = IqPalette(i * (this.dt), this.palette[0], this.palette[1], this.palette[2], this.palette[3]);
      this.rgbPalette.push([rgb[0] * R_MAX, rgb[1] * G_MAX, rgb[2] * B_MAX]);
      var hsv = rgbToHsv([rgb[0] * R_MAX, rgb[1] * G_MAX, rgb[2] * B_MAX]);
      this.hsvPalette.push(hsv);
    }
    if (IQ_REVERSE_SPECTRUM)
    {
      for (var i = ((IQ_REVERSE_SPECTRUM) ? this.numGens / 2 : this.numGens); i > 0; i--)
      {
        var rgb = IqPalette(i * (this.dt), this.palette[0], this.palette[1], this.palette[2], this.palette[3]);
        this.rgbPalette.push([rgb[0] * R_MAX, rgb[1] * G_MAX, rgb[2] * B_MAX]);
        var hsv = rgbToHsv([rgb[0] * R_MAX, rgb[1] * G_MAX, rgb[2] * B_MAX]);
        this.hsvPalette.push(hsv);
      }
    }
  }

  update()
  {
    this.t = (this.t + this.dt) % 1;
    this.colorIdx = (this.colorIdx + 1) % this.numGens;
  }

  getCurrColor()
  {
    return this.hsvPalette[this.colorIdx];
  }

  getCurrHsvColor()
  {
    return this.hsvPalette[this.colorIdx];
  }

  getCurrRgbColor()
  {
    return this.rgbPalette[this.colorIdx];
  }

  getColor(i)
  {
    return this.hsvPalette[i % this.numGens];
  }

  getColorPalette()
  {
    return this.paletteIdx;
  }

  drawDebugPalette()
  {
    var rectW = WINDOW_WIDTH/this.numGens;
    var rectH = DEBUG_PALETTE_HEIGHT/2;
    for (var i = 0; i < this.rgbPalette.length; i++)
    {
      var x = i * rectW;
      var y = WINDOW_HEIGHT - rectH;
      var hsvc = this.hsvPalette[i];
      var rgbc = this.rgbPalette[i];
      if (i == this.colorIdx)
      {
        strokeWeight(1);
      }
      else
      {
        strokeWeight(0);
      }
      colorMode(RGB, R_MAX, G_MAX, B_MAX);
      fill(rgbc[0], rgbc[1], rgbc[2]);
      rect(x, y - rectH, rectW, rectH);
      colorMode(HSB, H_MAX, S_MAX, V_MAX);
      fill(hsvc[0], hsvc[1], hsvc[2]);
      rect(x, y, rectW, rectH);
      if (COLOR_MODE_RGB)
      {
        colorMode(RGB, R_MAX, G_MAX, B_MAX);
      }
      else
      {
        colorMode(HSB, H_MAX, S_MAX, V_MAX);
      }
      strokeWeight(0);
    }
  }
}

class GoLBoard
{
  constructor()
  {
    this.currentFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
    this.nextFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
    this.coloredFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => [H_DEFAULT, S_DEFAULT, V_DEFAULT]));
    this.shadowFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
    this.color = [H_DEFAULT, S_DEFAULT, V_DEFAULT];
    this.playing = false;
    this.showAliveCells = true;
    this.lastUpdateTimestamp = 0;
    this.speedImpulse = new Impulse(1/30, 0.1);
    this.golColorGen = new GoLColorGen(DEFAULT_IQ_NUMGENS);
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
    //console.log("NEW FREQ:", this.frameFrequency, "NEW PERIOD:", this.framePeriodMs);
  }

  getFrameFrequency()
  {
    return this.frameFrequency;
  }

  reset()
  {
    this.currentFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
    this.nextFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
    this.coloredFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => [H_DEFAULT,S_DEFAULT,V_DEFAULT]));
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

  setShadowCell(x, y)
  {
    this.shadowFrame[y][x] = 1;
  }

  getShadowCell(x, y)
  {
    return this.shadowFrame[y][x];
  }

  resetShadowCell()
  {
    this.shadowFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
  }

  getCell(x, y)
  {
    return this.currentFrame[y][x];
  }

  killAll()
  {
    this.currentFrame = Array.from({ length: GRID_CELLS_X }, () => Array.from({ length: GRID_CELLS_Y }, () => 0));
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

    // Update oscillators or signal sources
    this.speedImpulse.update();

    // Pipe from oscillators/signals to destinations
    this.setFrameFrequency(MAX_UPDATE_PER_SECOND * this.speedImpulse.getVal());

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
  
    if (IQ_COLOR_SCHEME)
    {
      this.golColorGen.update();
      this.color = this.golColorGen.getCurrHsvColor();
    }
    else
    {
      var newh = (this.color[0] + H_DELTA) % H_MAX;
      var news = this.color[1];
      var newv = this.color[2];
      this.color = [newh, news, newv];
    }
  }

  drawBoard()
  {
    for (var y = 0; y < GRID_CELLS_Y; y++)
    {
      for (var x = 0; x < GRID_CELLS_X; x++)
      {
        var cellColor = [0, 0, 0];
        if (COLORED)
        {
          cellColor = this.coloredFrame[y][x];
        }
        if (this.getCell(x, y) == 1)
        {
          if (this.showAliveCells)
          {
            if (COLOR_MODE_RGB)
            {
              var conv = hsvToRgb([H_ALIVE, S_ALIVE, V_ALIVE]);
              fill(conv[0], conv[1], conv[2]);
            }
            else
            {
              fill(H_ALIVE, S_ALIVE, V_ALIVE);
            }
          }
          else
          {
            if (COLOR_MODE_RGB)
            {
              var conv = hsvToRgb(cellColor);
              fill(conv[0], conv[1], conv[2]);
            }
            else
            {
              fill(cellColor[0], cellColor[1], cellColor[2]);
            }
          }
        }
        else
        {
          if (COLOR_MODE_RGB)
          {
            var conv = hsvToRgb(cellColor);
            fill(conv[0], conv[1], conv[2]);
          }
          else
          {
            fill(cellColor[0], cellColor[1], cellColor[2]);
          }
        }

        if (PATTERN_SHADOW_MODE && this.getShadowCell(x, y) == 1)
        {
          fill(PATTERN_SHADOW_COLOR[0], PATTERN_SHADOW_COLOR[1], PATTERN_SHADOW_COLOR[2]);
        }
        
        strokeWeight(STROKE_WEIGHT);
        stroke(STROKE_COLOR);
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
    if (DEBUG_PALETTE)
    {
      this.board.golColorGen.drawDebugPalette();
    }
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
    this.board.speedImpulse.reset();
  }

  drawPattern(pattern, mx, my)
  {
    for (var y = 0; y < pattern.length; y++)
    {
      for (var x = 0; x < pattern[0].length; x++)
      {
        if (pattern[y][x])
        {
          var cellX = int((mx + x * GRID_RENDER_CELL_WIDTH) / GRID_RENDER_CELL_WIDTH);
          var cellY = int((my + y * GRID_RENDER_CELL_HEIGHT) / GRID_RENDER_CELL_HEIGHT);
          if (cellX < GRID_CELLS_X && cellX >= 0 && cellY < GRID_CELLS_Y && cellY >= 0)
          {
            this.board.setCell(cellX, cellY);
          }
        }
      }
    }
  }

  drawPatternShadow(pattern, mx, my)
  {
    if (!PATTERN_SHADOW_MODE)
    {
      return;
    }
    for (var y = 0; y < pattern.length; y++)
    {
      for (var x = 0; x < pattern[0].length; x++)
      {
        if (pattern[y][x])
        {
          var cellX = int((mx + x * GRID_RENDER_CELL_WIDTH) / GRID_RENDER_CELL_WIDTH);
          var cellY = int((my + y * GRID_RENDER_CELL_HEIGHT) / GRID_RENDER_CELL_HEIGHT);
          if (cellX < GRID_CELLS_X && cellX >= 0 && cellY < GRID_CELLS_Y && cellY >= 0)
          {
            this.board.setShadowCell(cellX, cellY);
          }
        }
      }
    }
  }

  reset()
  {
    this.board.reset();
  }
}

////////////////////////

function mouseClickedGeneric(arr)
{
  var [x, y] = arr;
  myCanvas.mouseInput(x, y);
}

function keyPressedGeneric(arr)
{
  var [k, x, y] = arr;
  var mx = x || 0;
  var my = y || 0;
  console.log("KEY PRESSED", k, "WITH", x, y, arr);
  if (k == ' ')
  {
    myCanvas.togglePause();
  }
  if (k == 'r')
  {
    myCanvas.reset();
  }
  if (k == 'a')
  {
    myCanvas.board.toggleShowAliveCells();
  }
  if (k == 'c')
  {
    var centerx = WINDOW_WIDTH/2;
    var centery = WINDOW_HEIGHT/2;
    var r = Math.random() * (DRAW_CIRCLE_RAND_MAX - DRAW_CIRCLE_RAND_MIN) + DRAW_CIRCLE_RAND_MIN;
    myCanvas.drawCircle(centerx, centery, r);
  }
  if (k == 'C')
  {
    var centerx = WINDOW_WIDTH/2;
    var centery = WINDOW_HEIGHT/2;
    var centerDiffX = Math.abs(centerx - x);
    var centerDiffY = Math.abs(centery - y);
    var r = createVector(centerDiffX, centerDiffY).mag();
    myCanvas.drawCircle(centerx, centery, r);
  }
  if (k == 'p')
  {
    myCanvas.board.golColorGen.setColorPalette((myCanvas.board.golColorGen.getColorPalette() + 1) % KNOWN_NICE_PALETTES.length);
  }
  if (k == 'o')
  {
    COLORED = !COLORED;
    console.log("COLORED:", COLORED);
  }
  if (k == 'd')
  {
    DEBUG_PALETTE = !DEBUG_PALETTE;
  }
  if (k == 'k')
  {
    myCanvas.board.killAll();
  }
  if (k == 's')
  {
    STROKE_WEIGHT = (STROKE_WEIGHT == 1) ? 0 : 1;
  }
  if (k == 'X')
  {
    PATTERN_SHADOW_MODE = !PATTERN_SHADOW_MODE;
    console.log("Pattern shadow:", PATTERN_SHADOW_MODE);
  }
  if (k == 'x')
  {
    console.log("Draw pattern", PATTERN_CURRENT_ID, "at", mx, my);
    var pattern = patterns[PATTERN_CURRENT_ID];
    myCanvas.drawPattern(pattern, x, y);
  }
  if (k == 'z' || k == 'Z')
  {
    myCanvas.board.speedImpulse.reset();
  }
  if (k == '+')
  {
    PATTERN_CURRENT_ID = (PATTERN_CURRENT_ID + 1) % patterns.length;
  }
  if (k == '-')
  {
    PATTERN_CURRENT_ID = (PATTERN_CURRENT_ID - 1);
    PATTERN_CURRENT_ID = (PATTERN_CURRENT_ID < 0) ? patterns.length - 1 : PATTERN_CURRENT_ID;
  }
  if (k == 'i')
  {
    if (!AUTO_INPUT_ENABLED)
    {
      autoInput.reset();
      autoInput.start();
    }
    else
    {
      autoInput.stop();
    }
    AUTO_INPUT_ENABLED = ~AUTO_INPUT_ENABLED;
  }
}

function mouseClicked()
{
  console.log("MOUSE CLICKED", mouseX, mouseY);
  mouseClickedGeneric([mouseX, mouseY]);
}

function mouseMoved()
{
  if (PATTERN_SHADOW_MODE)
  {
    myCanvas.board.resetShadowCell();
    var pattern = patterns[PATTERN_CURRENT_ID];
    myCanvas.drawPatternShadow(pattern, mouseX, mouseY);
  }
}

function mouseDragged()
{
  mouseClickedGeneric([mouseX, mouseY]);
}

function mouseWheel(event)
{
  var smoothDelta = event.delta * MOUSE_WHEEL_SMOOTHING_COEFF;
  console.log("MOUSE WHEEL", event.delta, "CHANGE FREQ BY", smoothDelta);
  myCanvas.changeBoardSpeedBy(smoothDelta);
}

function keyPressed()
{
  keyPressedGeneric([key, mouseX, mouseY]);
}

function keyReleased()
{
}


////////////////////////

myCanvas = undefined; 
p5jsCanvas = undefined;
autoInput = undefined;
function setup()
{
  p5jsCanvas = createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  if (COLOR_MODE_RGB)
  {
    colorMode(RGB, R_MAX, G_MAX, B_MAX);
  }
  else
  {
    colorMode(HSB, H_MAX, S_MAX, V_MAX);
  }
  background(DEFAULT_BACKGROUND);
  textSize(12);
  smooth(8);
  myCanvas = new Canvas();

  autoInput = new AutoInput(AUTO_INPUT_LIST_FRAME);
  autoInput.setCallbackFunction("mouse", mouseClickedGeneric);
  autoInput.setCallbackFunction("key", keyPressedGeneric);
  autoInput.setCallbackFunction("mousekey", keyPressedGeneric);
  autoInput.setMode("frame");
  autoInput.setOverallLoopEnabled(false);
  if (AUTO_INPUT_ENABLED)
  {
    autoInput.start();
  }
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
  if (AUTO_INPUT_ENABLED)
  {
    autoInput.updateFrame();
  }
  myCanvas.updateCanvas();
  myCanvas.drawCanvas();
  myCanvas.drawDebugPanel();
}
