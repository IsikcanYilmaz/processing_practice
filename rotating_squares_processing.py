from random import randint
from math import *
import time
import traceback

# Config
WINDOW_WIDTH = 64 * 10
WINDOW_HEIGHT = 64 * 10
GRID_WIDTH = 32
GRID_HEIGHT = 32
UPDATE_PER_SECOND = 30
UPDATE_PER_SECOND_MAX = 1000
DEBUGPRINTS = True
DEBUGVISUALS = False 

H_MAX = 360
S_MAX = 100
V_MAX = 100

tau = 2 * pi

DEFAULT_FILL_COLOR = (100, 40, 100)
DEFAULT_STROKE_COLOR = (0, 0, 0)
DEFAULT_BACKGROUND_COLOR = (0, 0, 0) # WHITE

def DEBUGPRINT(*argv):
    if (DEBUGPRINTS):
        print(argv)

class Oscillator:
    def __init__(self, increment, phase = 0):
        self.increment = increment
        self.phase = phase
        self.val = sin(self.phase * pi)

    def update(self):
        self.phase += self.increment
        self.val = sin(self.phase * pi)

    def setIncrement(self, increment):
        self.increment = increment

    def getPhase(self):
        return self.phase

    def getVal(self):
        return self.val

# Square that is centered at x, y, with each edge being edgeLen length.
class CustomSquare:
    def __init__(self, x, y, edgeLen, thickness=1, angle=0, edgeLenUpSpeed=999, edgeLenDownSpeed=999):
        self.x = x
        self.y = y
        self.edgeLen = self.edgeLenTarget = edgeLen
        self.thickness = thickness
        self.angle = angle
        self.calculateCoords()
        self.fillColor = DEFAULT_FILL_COLOR
        self.strokeColor = DEFAULT_STROKE_COLOR
        self.edgeLenUpSpeed = edgeLenUpSpeed
        self.edgeLenDownSpeed = edgeLenDownSpeed

    def setFillColor(self, hsv):
        self.fillColor = hsv

    def setStrokeColor(self, hsv):
        self.strokeColor = hsv

    def setSaturation(self, s):
        self.strokeColor = (self.strokeColor[0], s, self.strokeColor[2])

    def setEdgeLen(self, edgeLen):
        self.edgeLen = self.setEdgeLenTarget = edgeLen
        self.calculateCoords()

    def setEdgeLenTarget(self, edgeLenTarget):
        self.edgeLenTarget = edgeLenTarget

    def setThickness(self, thickness):
        self.thickness = thickness
        
    def calculateCoords(self):
        self.phase = self.angle / 360.0
        radius = (self.edgeLen / 2.0) * sqrt(2)

        self.x1 = self.x + radius * sin((self.phase + 1.0/8) * tau) #x - (edgeLen/2)
        self.y1 = self.y + radius * cos((self.phase + 1.0/8) * tau) #y - (edgeLen/2)

        self.x2 = self.x + radius * sin((self.phase + 3.0/8) * tau) #x - (edgeLen/2)
        self.y2 = self.y + radius * cos((self.phase + 3.0/8) * tau) #y - (edgeLen/2)

        self.x3 = self.x + radius * sin((self.phase + 5.0/8) * tau) #x - (edgeLen/2)
        self.y3 = self.y + radius * cos((self.phase + 5.0/8) * tau) #y - (edgeLen/2)

        self.x4 = self.x + radius * sin((self.phase + 7.0/8) * tau) #x - (edgeLen/2)
        self.y4 = self.y + radius * cos((self.phase + 7.0/8) * tau) #y - (edgeLen/2)

    def replace(self, x, y):
        self.x = x
        self.y = y
        self.calculateCoords()

    def rotate(self, angle):
        self.angle = angle
        self.calculateCoords()

    def resize(self, edgeLen):
        self.edgeLen = edgeLen
        self.calculateCoords()

    def rotateBy(self, angle):
        self.angle += angle
        self.calculateCoords()

    def resizeBy(self, edgeLen):
        self.edgeLen += edgeLen
        if (self.edgeLen < 0):
            self.edgeLen = 0
        self.calculateCoords()

    def update(self):
        global DEFAULT_FILL_COLOR
        if (self.edgeLen != self.edgeLenTarget):
            direction = (-1 if self.edgeLenTarget < self.edgeLen else 1)
            if (direction == 1):
                self.edgeLen += self.edgeLenUpSpeed
            else:
                self.edgeLen -= self.edgeLenDownSpeed
            if ((self.edgeLen > self.edgeLenTarget and direction == 1) or \
                (self.edgeLen < self.edgeLenTarget and direction == -1)):
                self.edgeLen = self.edgeLenTarget
            self.calculateCoords()
        # coeff = self.edgeLen/100 #d/WINDOW_WIDTH
        coeff = self.edgeLen * 30
        self.rotate((coeff if coeff <= 360 else 360))
        c = ((DEFAULT_FILL_COLOR[0]+coeff/6), (DEFAULT_FILL_COLOR[1]+(4*self.edgeLen)), DEFAULT_FILL_COLOR[2])
        self.setStrokeColor(c)

    def draw(self):
        # fill(self.fillColor[0], self.fillColor[1], self.fillColor[2])
        noFill()
        stroke(self.strokeColor[0], self.strokeColor[1], self.strokeColor[2])
        strokeWeight(self.thickness)
        quad(self.x1, self.y1, self.x2, self.y2, self.x3, self.y3, self.x4, self.y4)
        if (DEBUGVISUALS):
            circleWidth = 1 #(1 if self.edgeLen/10 < 1 else self.edgeLen)
            circle(self.x, self.y, circleWidth)

class Canvas:
    def __init__(self):
        self.a = 0
        self.s = 100
        self.initx = WINDOW_WIDTH*5/6

        # SQUARES
        self.squares = []
        self.numSquaresPerRow = 30
        self.squareEdgeLen = 10
        self.squareAreaEdgeLen = 20
        self.xOffset = self.yOffset = 30
        for i in range(0, self.numSquaresPerRow):
            for j in range(0, self.numSquaresPerRow):
                self.squares.append(CustomSquare(self.xOffset + (i * self.squareAreaEdgeLen), self.yOffset + (j * self.squareAreaEdgeLen), self.squareEdgeLen, 2, edgeLenUpSpeed=1, edgeLenDownSpeed=0.1))

        # OSCILLATORS
        self.oscillators = []
        self.oscillators.append(Oscillator(0.01))

    def reset(self):
        background(*DEFAULT_BACKGROUND_COLOR)

    def update(self):
        global DEFAULT_FILL_COLOR
        for o in self.oscillators:
            o.update()
        
        for sidx, s in enumerate(self.squares):
            s.update()

        # DEFAULT_FILL_COLOR = ((DEFAULT_FILL_COLOR[0]+1)%H_MAX, DEFAULT_FILL_COLOR[1], DEFAULT_FILL_COLOR[2])

    def drawCanvas(self):
        background(*DEFAULT_BACKGROUND_COLOR)
        for s in self.squares:
            s.draw()

    def mouseInput(self, x, y):
        for s in self.squares:
            d = dist(x, y, s.x, s.y)
            edgeLen = 100/sqrt(d)
            # thickness = d/100
            edgeLen = (self.squareAreaEdgeLen if edgeLen > self.squareAreaEdgeLen else edgeLen)
            s.setEdgeLenTarget(edgeLen)
            # s.setThickness(thickness)
    
    def rotateAll(self, rotate):
        for s in self.squares:
            s.rotateBy(rotate)


###########################################
canvas = Canvas()
playing = False
lastFrameTimestamp = 0
framePeriod = 1.0/UPDATE_PER_SECOND

def togglePause():
    global playing
    playing = ~playing
    DEBUGPRINT("Playing" if playing else "Paused")

###########################################

def setup():
    size(WINDOW_WIDTH, WINDOW_HEIGHT)
    background(*DEFAULT_BACKGROUND_COLOR)
    colorMode(HSB, H_MAX, S_MAX, V_MAX)

def mouseClicked(event):
    DEBUGPRINT("MOUSE CLICKED", event, mouseX, mouseY)

def mouseDragged(event):
    DEBUGPRINT("MOUSE DRAGGED", event, mouseX, mouseY)
    try:
        if (mousePressed):
            canvas.mouseInput(mouseX, mouseY)
    except Exception as e:
        DEBUGPRINT("Mouse drag out of bounds error", e)

def mouseMoved(event):
    DEBUGPRINT("MOUSE MOVED", event, mouseX, mouseY)
    try:
        canvas.mouseInput(mouseX, mouseY)
    except Exception as e:
        DEBUGPRINT("Mouse drag out of bounds error", e)

def mouseWheel(event):
    global framePeriod, DEFAULT_FILL_COLOR
    DEBUGPRINT("MOUSE WHEEL", event, event.getCount())
    DEFAULT_FILL_COLOR = (DEFAULT_FILL_COLOR[0]+(10*event.getCount()), DEFAULT_FILL_COLOR[1], DEFAULT_FILL_COLOR[2])
    print(DEFAULT_FILL_COLOR)

def keyPressed(event):
    DEBUGPRINT("KEY PRESSED", key, keyCode)
    if (key == u' '):
        togglePause()
    if (key == u'r'):
        canvas.reset()

def timeFunction(fn, desc=""):
    begin = time.time()
    fn()
    end = time.time()
    return (end - begin)

def draw():
    global lastFrameTimestamp, framePeriod
    canvasPlayRuntime = timeFunction(canvas.update, "canvas.update")
    canvasDrawRuntime = timeFunction(canvas.drawCanvas, "canvas.drawCanvas")
