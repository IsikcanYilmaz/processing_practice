from random import randint
from math import *
import time

# Config
WINDOW_WIDTH = 64 * 4
WINDOW_HEIGHT = 64 * 4
GRID_WIDTH = 32
GRID_HEIGHT = 32
UPDATE_PER_SECOND = 30
UPDATE_PER_SECOND_MAX = 1000
DEBUGPRINTS = True

H_MAX = 100
S_MAX = 100
V_MAX = 100

tau = 2 * pi

def DEBUGPRINT(*argv):
    if (DEBUGPRINTS):
        print(argv)

class CustomSquare:
    def __init__(self, x, y, edgeLen, thickness=1, angle=0):
        self.x = x
        self.y = y
        self.edgeLen = edgeLen
        self.thickness = thickness
        self.angle = angle
        self.calculateCoords()
        
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

    def draw(self):
        strokeWeight(self.thickness)
        quad(self.x1, self.y1, self.x2, self.y2, self.x3, self.y3, self.x4, self.y4)

class Canvas:
    def __init__(self):
        self.a = 0
        self.s = 30
        self.test = CustomSquare(100, 100, self.s, 1, self.a)

    def reset(self):
        pass

    def update(self):
        pass

    def drawCanvas(self):
        self.test.draw()
        self.a += 1
        self.test.resize(self.s)
        self.test.rotate(self.a)
        self.test.replace(mouseX, mouseY)
        


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
    background(0xff) # WHITE BACKGROUND
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
    if (playing):
        now = time.time()
        if (lastFrameTimestamp == 0 or now - lastFrameTimestamp > framePeriod):
            canvasPlayRuntime = timeFunction(canvas.update, "canvas.update")
            lastFrameTimestamp = now
            #DEBUGPRINT("FRAME", now)
    canvasDrawRuntime = timeFunction(canvas.drawCanvas, "canvas.drawCanvas")
