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

var COLUMNS = 60;
var DEFAULT_SQUARE_WIDTH = 1;
var DEFAULT_SQUARE_AREA_WIDTH = 20;
var DEFAULT_X_OFFSET = 100;
var DEFAULT_Y_OFFSET = 100;
var DEFAULT_WIDTH_UP_SPEED = 0.3;
var DEFAULT_WIDTH_DOWN_SPEED = 0.6;
var DEFAULT_SQUARE_THICKNESS = 3;
var DEFAULT_LOW_SQUARE_WIDTH_THRESHOLD = 10;
var COLORED = true;
var ROTATE = false;

inputs = [[999,999]];

////////////////////////

class CustomSquare {
  constructor(x, y, width, thickness=1, angle=0, widthUpSpeed=999, widthDownSpeed=999)
  {
    this.x = x;
    this.y = y;
    this.width = this.widthTarget = width;
    this.thickness = thickness;
    this.angle = angle;
    this.widthUpSpeed = widthUpSpeed;
    this.widthDownSpeed = widthDownSpeed;
    this.strokeColor = DEFAULT_STROKE_COLOR.slice();
    this.weight = 0;
    this.calculateCoords();
  }

  calculateCoords()
  {
    this.phase = this.angle / 360.0;
    var radius = (this.width / 2.0) * Math.sqrt(2);

    this.x1 = this.x + radius * Math.sin((this.phase + 1.0/8) * TAU); //x - (edgeLen/2)
    this.y1 = this.y + radius * Math.cos((this.phase + 1.0/8) * TAU); //y - (edgeLen/2)

    this.x2 = this.x + radius * Math.sin((this.phase + 3.0/8) * TAU); //x - (edgeLen/2)
    this.y2 = this.y + radius * Math.cos((this.phase + 3.0/8) * TAU); //y - (edgeLen/2)

    this.x3 = this.x + radius * Math.sin((this.phase + 5.0/8) * TAU); //x - (edgeLen/2)
    this.y3 = this.y + radius * Math.cos((this.phase + 5.0/8) * TAU); //y - (edgeLen/2)

    this.x4 = this.x + radius * Math.sin((this.phase + 7.0/8) * TAU); //x - (edgeLen/2)
    this.y4 = this.y + radius * Math.cos((this.phase + 7.0/8) * TAU); //y - (edgeLen/2)
  }

  calculateColor()
  {
    var widthPercent = this.width / DEFAULT_SQUARE_AREA_WIDTH;
    this.strokeColor[0] = DEFAULT_STROKE_COLOR[0] + (90 * widthPercent);
    this.strokeColor[1] = (DEFAULT_STROKE_COLOR[1] + (200 * widthPercent)) % H_MAX;
  }

  rotate(angle)
  {
    this.angle = angle;
    this.calculateCoords();
  }

  rotateBy(angle)
  {
    this.angle = this.angle + angle;
    this.calculateCoords();
  }

  update()
  {
    // Calculate distance based weight
    this.weight = 0;
    for (var i = 0; i < inputs.length; i++)
    {
      var inputX = inputs[i][0];
      var inputY = inputs[i][1];
      var d = dist(inputX, inputY, this.x, this.y);
      this.weight += 100/Math.sqrt(d);
    }
    this.weight = this.weight / inputs.length;
    var w = this.weight;
    var w = (w > DEFAULT_SQUARE_AREA_WIDTH ? DEFAULT_SQUARE_AREA_WIDTH : w);
    w = (w < DEFAULT_LOW_SQUARE_WIDTH_THRESHOLD ? 0 : w);
    this.setWidthTarget(w);

    if (this.width != this.widthTarget)
    {
      var direction = (this.widthTarget < this.width ? -1 : 1);
      if (direction === 1)
      {
        this.width += this.widthUpSpeed;
      }
      else
      {
        this.width -= this.widthUpSpeed;
      }
      if (((this.width > this.widthTarget) && (direction === 1)) || ((this.width < this.widthTarget) && (direction === 1)))
      {
        this.width = this.widthTarget;
      }

      if (ROTATE)
      {
        this.rotate(this.width*360/DEFAULT_SQUARE_AREA_WIDTH);
      }

      this.calculateCoords();
    }

    if (COLORED)
    {
      this.calculateColor();
    }
  }

  draw()
  {
    noFill();
    stroke(this.strokeColor[0], this.strokeColor[1], this.strokeColor[2]);
    strokeWeight(this.thickness);
    quad(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3, this.x4, this.y4);
    if (DEBUGVISUALS)
    {
      var circleWidth = 1; //(1 if this.edgeLen/10 < 1 else this.edgeLen)
      circle(this.x, this.y, circleWidth);
      //text(int(this.weight), this.x, this.y);
    }
  }

  setWidth(w)
  {
    this.width = w;
    self.calculateCoords();
  }

  setWidthTarget(w)
  {
    this.widthTarget = w;
  }

}

class AutoInput
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
  }

  update()
  {

  }

}

class Canvas
{
  constructor()
  {
    this.squares = [];
    for (var i = 0; i < COLUMNS; i++)
    {
      for (var j = 0; j < COLUMNS; j++)
      {
        this.squares.push(new CustomSquare(DEFAULT_X_OFFSET + (i * DEFAULT_SQUARE_AREA_WIDTH), 
                                      DEFAULT_Y_OFFSET + (j * DEFAULT_SQUARE_AREA_WIDTH), 
                                      DEFAULT_SQUARE_WIDTH, 
                                      DEFAULT_SQUARE_THICKNESS, 
                                      DEFAULT_WIDTH_UP_SPEED, 
                                      DEFAULT_WIDTH_DOWN_SPEED));
      }
    }
  }

  update()
  {

    // update squares
    for (var idx = 0; idx < this.squares.length; idx++)
    {
      this.squares[idx].update();
    }
  }

  draw()
  {

    //draw squares
    for (var idx = 0; idx < this.squares.length; idx++)
    {
      this.squares[idx].draw();
    }
  }
}

////////////////////////

function mouseMoved()
{
  inputs[0] = [mouseX, mouseY];
  //inputs[1] = [WINDOW_WIDTH-mouseX, WINDOW_HEIGHT-mouseY];
  //inputs[2] = [mouseX, WINDOW_HEIGHT-mouseY];
  //inputs[3] = [WINDOW_WIDTH-mouseX, mouseY];
}

function touchMoved()
{
  //inputs[0] = [touches[0][0], touches[0][1]];
}

function mouseWheel()
{
  DEFAULT_STROKE_COLOR[0] += (event.delta > 0 ? 10 : -10) % H_MAX;
}

////////////////////////

canvas = undefined;
function setup()
{
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  colorMode(HSB, H_MAX, S_MAX, V_MAX);
  background(DEFAULT_BACKGROUND);
  textSize(12);
  canvas = new Canvas();
}

function draw()
{
  background(DEFAULT_BACKGROUND);
  canvas.update();
  canvas.draw();
}
