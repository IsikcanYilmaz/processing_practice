from random import randint
from math import *
import time

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

DEFAULT_FILL_COLOR = (0, 80, 100)
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
    def __init__(self, x, y, edgeLen, thickness=1, angle=0):
        self.x = x
        self.y = y
        self.edgeLen = edgeLen
        self.thickness = thickness
        self.angle = angle
        self.calculateCoords()
        self.fillColor = DEFAULT_FILL_COLOR
        self.strokeColor = DEFAULT_STROKE_COLOR

    def setFillColor(self, hsv):
        self.fillColor = hsv

    def setStrokeColor(self, hsv):
        self.strokeColor = hsv

    def setEdgeLen(self, edgeLen):
        self.edgeLen = edgeLen
        self.calculateCoords()

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

    def draw(self):
        # fill(self.fillColor[0], self.fillColor[1], self.fillColor[2])
        noFill()
        stroke(self.strokeColor[0], self.strokeColor[1], self.strokeColor[2])
        strokeWeight(self.thickness)
        quad(self.x1, self.y1, self.x2, self.y2, self.x3, self.y3, self.x4, self.y4)
        if (DEBUGVISUALS):
            circle(self.x, self.y, 1)

class Canvas:
    def __init__(self):
        self.a = 0
        self.s = 100
        self.initx = WINDOW_WIDTH*5/6

        # lets have a 4 by 4
        # lets have a larger area for each square
        self.s = CustomSquare(10, 10, 10, 1)

        self.squares = []
        self.numSquaresPerRow = 30
        self.squareEdgeLen = 10
        self.squareAreaEdgeLen = 20
        self.xOffset = self.yOffset = 10
        for i in range(0, self.numSquaresPerRow):
            for j in range(0, self.numSquaresPerRow):
                self.squares.append(CustomSquare(self.xOffset + (i * self.squareAreaEdgeLen), self.yOffset + (j * self.squareAreaEdgeLen), self.squareEdgeLen, 1))

        self.oscillators = []

    def reset(self):
        background(*DEFAULT_BACKGROUND_COLOR)

    def update(self):
        for o in self.oscillators:
            o.update()
        
        for sidx, s in enumerate(self.squares):
            # s.replace(self.initx - (WINDOW_WIDTH*2/6) - (WINDOW_WIDTH*2/6 * self.sizeOsc.getVal()), s.y)
            # s.resize(200 * self.sizeOsc.getVal())
            s.setStrokeColor(DEFAULT_FILL_COLOR)
            # s.rotate((sidx*4) + 360 * self.rotOsc.getVal())
            pass

    def drawCanvas(self):
        background(*DEFAULT_BACKGROUND_COLOR)
        for s in self.squares:
            s.draw()

    def mouseInput(self, x, y):
        for s in self.squares:
            d = dist(x, y, s.x, s.y)
            edgeLen = sqrt(d)
            # thickness = d/100
            # edgeLen = (50 if edgeLen > 50 else edgeLen)
            s.setEdgeLen(edgeLen)
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
    global framePeriod
    DEBUGPRINT("MOUSE WHEEL", event, event.getCount())
    canvas.rotateAll(event.getCount() * 10)

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
