const KNOWN_NICE_PALETTES = [
  ["Blue metallic", [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 1.0], [0.30, 0.20, 0.20]],
  ["Pinkish", [1.938, 0.105, 1.812], [1.200, 1.057, 1.122], [0.523, 0.189, 0.293], [0.770, 0.073, 1.340]],
  ["Pink lemonade", [0.461, 1.645, 0.949], [1.930, 1.162, 0.709], [0.054, 0.412, 0.109], [0.823, 1.519, 1.271]],
  ["Warm blue and orange to white", [0.995, 1.109, 0.868], [1.376, 1.029, 0.368], [1.585, 0.151, 1.083], [1.580, 1.648, 0.244]],
  ["Pastel, lowsat blue, pink, orange, tan", [0.192, 1.469, 0.886], [1.442, 0.921, 0.357], [0.206, 0.677, 1.119], [1.827, 0.234, 1.036]],
  ["Neat fiery and purp", [1.839, 0.318, 0.253], [1.145, 0.510, 0.254], [0.855, 1.199, 1.221], [1.797, 0.306, 0.992]], 
  ["Nice blues and some yeller", [0.292, 0.838, 0.913], [0.706, 0.636, 0.885], [1.223, 0.641, 1.926], [1.576, 0.934, 0.874]],
  ["Warm orange, blue, green", [0.735,0.051,0.382],[0.552,0.755,0.518],[1.387,0.014,0.896],[0.973,1.948,0.529]], 
  ["Blue and purp", [0.373,0.330,1.430],[0.489,0.226,0.753],[1.651,1.445,1.887],[0.894,0.531,0.240]],
  ["Dark blue and green", [0.978,0.700,0.795],[0.595,0.480,0.282],[0.241,0.632,0.592],[0.338,0.237,1.949]], 
  ["Warm pastelle green to pink", [0.814,1.880,0.768],[0.316,1.429,0.200],[0.479,0.055,0.532],[1.539,0.365,0.740]], 
  ["Dark green to beige", [0.698,1.439,0.082],[1.572,1.053,0.903],[0.466,0.259,0.205],[0.561,0.571,1.790]],
  ["Neat solarized", [0.142, 0.703, 0.359], [1.173, 0.335, 0.665], [1.217, 1.716, 1.690], [1.594, 1.135, 1.031]],
  ["Neat bit less solarized", [0.142,0.703,0.359],[1.173,0.335,0.665],[1.217,1.716,1.690],[1.594,1.000,1.031]],
];

var CG_HMAX = 360;
var CG_SMAX = 100;
var CG_VMAX = 100;
var CG_RMAX = 255;
var CG_GMAX = 255;
var CG_BMAX = 255;
function initColorGen(hmax, smax, vmax, rmax, gmax, bmax)
{
  CG_HMAX = hmax;
  CG_SMAX = smax;
  CG_VMAX = vmax;
  CG_RMAX = rmax;
  CG_GMAX = gmax;
  CG_BMAX = bmax;
}

// t runs from 0 to 1. a, b, c, d are rgb vectors
function IqPalette(t, a, b, c, d)
{
  var rgb = [0, 0, 0];
  for (var i = 0; i < rgb.length; i++)
  {
    rgb[i] = a[i] + b[i] * Math.cos(2 * PI * (c[i] * t + d[i]));
  }
  return rgb;
}

// Takes r,g,b in 0-255
function rgbToHsv(rgb)
{
  r = rgb[0];
  g = rgb[1];
  b = rgb[2];
  var h;
  var s;
  var v;
  var maxColor = Math.max(r, g, b);
  var minColor = Math.min(r, g, b);
  var delta = maxColor - minColor;
  // Calculate hue
  // To simplify the formula, we use 0-6 range.
  if(delta == 0) {
    h = 0;
  }
  else if(r == maxColor) {
    h = (6 + (g - b) / delta) % 6;
  }
  else if(g == maxColor) {
    h = 2 + (b - r) / delta;
  }
  else if(b == maxColor) {
    h = 4 + (r - g) / delta;
  }
  else {
    h = 0;
  }
  // Then adjust the range to be 0-1
  h = h/6;
  // Calculate saturation
  if(maxColor != 0) {
    s = delta / maxColor;
  }
  else {
    s = 0;
  }
  // Calculate value
  v = maxColor / 255;
  return [h * CG_HMAX, s * CG_SMAX, v * CG_VMAX];
}

function hsvToRgb(hsv)
{
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return [r * CG_RMAX, g * CG_GMAX, b * CG_BMAX];
}
