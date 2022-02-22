// PATTERNS http://game-of-life.daneaiulian.com/patterns
var glider =       [[1, 1, 1],
                    [1, 0, 0],
                    [0, 1, 0]];

var fig_eight =     [[1, 1, 0, 0, 0, 0],
                     [1, 1, 0, 1, 0, 0],
                     [0, 0, 0, 0, 1, 0],
                     [0, 1, 0, 0, 0, 0],
                     [0, 0, 1, 0, 1, 1],
                     [0, 0, 0, 0, 1, 1]];

var pentadechatlon = [[0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
                      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0]];

var patterns = [
  glider,
  fig_eight,
  pentadechatlon
];

// HELPER FUNCTIONS 
// Takes 2d array that is n by n
function rotatePattern(p, numRotations)
{
  numRotations = numRotations % 4;
  var cols = p.length;
  var rows = p[0].length;
  var rotated = [];
  for (var i = 0; i < rows; i++)
  {
    var row = [];
    for (var j = 0; j < cols; j++)
    {
      row.push(p[j][i]);
    }
    rotated.push(row.reverse());
  }
  numRotations -= 1;
  if (numRotations == 0)
  {
    return rotated;
  }
  else
  {
    return rotatePattern(rotated, numRotations);
  }
}

// Generate x by y rect pattern
function generateRect(x, y)
{
  var arr = Array.from({ length: x }, () => Array.from({ length: y }, () => 1));
  return arr;
}

// Generate n by n square pattern
function generateSquare(n)
{
  return generateRect(n, n);
}

function printPattern(p)
{
  for (var i = 0; i < p.length; i++)
  {
    console.log(p[i]);
  }
}
