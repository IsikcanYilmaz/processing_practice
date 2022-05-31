class CustomSquare 
{
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

      this.rotate(this.width*360/DEFAULT_SQUARE_AREA_WIDTH);
      
      this.calculateCoords();
    }
    this.calculateColor();
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
