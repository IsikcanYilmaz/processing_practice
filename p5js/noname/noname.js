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

class Canvas 
{
  constructor()
  {
    this.osc1 = new Oscillator(0.01, 0, SIN);
    this.osc2 = new Oscillator(0.01, 0, TRIANGLE);
  }

  updateCanvas()
  {
    this.osc1.update();
    //this.osc2.setIncrement(Math.abs(this.osc1.getVal()) * 0.01);
    this.osc2.update();
  }

  drawCanvas()
  {
    background(DEFAULT_BACKGROUND);
    var x = WINDOW_WIDTH / 2;
    var y = WINDOW_HEIGHT / 2;
    stroke(300);
    line(x, y - 50, x, y + 50);
    
    // OSC Ellipse
    var x1 = x;
    var y1 = y - 30;
    ellipse(x1 + this.osc1.getVal() * 100, y1, 10, 10);
    text([this.osc1.getVal(), ' ', this.osc1.phase, ' ', this.osc1.phase % 2].join(''), x1 - 300, y1);

    // Modulated OSC Ellipse
    var x2 = x;
    var y2 = y - 10;
    ellipse(x2 + this.osc2.getVal() * 100, y2, 10, 10);
    var sign = '+';
    if ((this.osc2.phase % 4 > 0 && this.osc2.phase % 4 <= 1) || (this.osc2.phase % 4 >= 3 && this.osc2.phase % 4 <= 4))
    {
      sign = '+';
    }
    else
    {
      sign = '-';
    }
    text([this.osc2.getVal(), ' ', this.osc2.phase, ' ', this.osc2.phase % 1, ' ', sign].join(''), x2 - 300, y2);

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
