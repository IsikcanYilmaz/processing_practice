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

class Canvas:
    def __init__(self):
        self.a = 0
        self.s = 30

        self.s1 = CustomSquare(WINDOW_WIDTH*1/6, WINDOW_HEIGHT, self.s, 1, self.a) 
        self.s2 = CustomSquare(WINDOW_WIDTH*2/6, WINDOW_HEIGHT, self.s, 1, self.a) 
        self.s3 = CustomSquare(WINDOW_WIDTH*3/6, WINDOW_HEIGHT, self.s, 1, self.a) 
        self.s4 = CustomSquare(WINDOW_WIDTH*4/6, WINDOW_HEIGHT, self.s, 1, self.a) 
        self.s5 = CustomSquare(WINDOW_WIDTH*5/6, WINDOW_HEIGHT, self.s, 1, self.a) 

        self.sizeOsc = Oscillator(0.01)
        self.rotOsc = Oscillator(0.005)
        self.yOsc = Oscillator(0.001)
        self.hOsc = Oscillator(0.001)

        self.squares = [
                # self.s1, 
                # self.s2, 
                self.s3, 
                # self.s4, 
                # self.s5
                ]
        self.oscillators = [self.sizeOsc, self.rotOsc, self.yOsc, self.hOsc]

    def reset(self):
        background(*DEFAULT_BACKGROUND_COLOR)

    def update(self):
        for o in self.oscillators:
            o.update()
        
        for sidx, s in enumerate(self.squares):
            s.replace(s.x, s.y - 10 * self.sizeOsc.getVal())
            s.resize(200 * self.sizeOsc.getVal())
            s.setStrokeColor(((self.hOsc.getVal()*360)%360, 50, 100))
            s.rotateBy(5 * self.rotOsc.getVal())

    def drawCanvas(self):
        for s in self.squares:
            s.draw()


        


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
    DEBUGPRINT("MOUSE MOVED", event, mouseX, mouseY)
    try:
        if (mousePressed):
            pass
    except Exception as e:
        DEBUGPRINT("Mouse drag out of bounds error", e)

def mouseWheel(event):
    global framePeriod
    DEBUGPRINT("MOUSE WHEEL", event, event.getCount())

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
