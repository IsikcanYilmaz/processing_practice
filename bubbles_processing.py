from random import randint
from math import pi, sin
import time
import sys

# Config
WINDOW_WIDTH = 64 * 12
WINDOW_HEIGHT = 64 * 12
GRID_WIDTH = 32
GRID_HEIGHT = 32
UPDATE_PER_SECOND = 30
UPDATE_PER_SECOND_MAX = 1000
SMALLEST_ELLIPSE_WIDTH = 1
DEBUGPRINTS = True
SAVEFRAMES = True
SAVEFRAMESDIR = "bubbles_frames"

H_MAX = 100
S_MAX = 100
V_MAX = 100

BACKGROUND = 0x00

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

class Bubble:
    def __init__(self, x, y, direction="down", id=0):
        self.id = id
        self.x = x
        self.y = y
        self.xOffset = 0
        self.yOffset = 0
        self.w = SMALLEST_ELLIPSE_WIDTH
        self.direction = direction
        self.h = 0
        self.s = 100
        self.v = 100
        self.widthOscillator = Oscillator(0.005, phase=0)
        self.xOscillator = Oscillator(0)
        if (direction == "down"):
            self.yOscillator = Oscillator(0.005, phase=4)
        else:
            self.yOscillator = Oscillator(0.005, phase=4)
        self.hOscillator = Oscillator(0.001, phase = id * 0.005)
        self.sOscillator = Oscillator(0.005)

    def update(self):
        self.widthOscillator.update()
        self.hOscillator.update()
        self.sOscillator.update()
        self.xOscillator.update()
        self.yOscillator.update()
        self.w = self.widthOscillator.getVal() * 50
        self.h = (self.hOscillator.getPhase() * 100) % H_MAX
        self.s = self.sOscillator.getVal() * 20 + 60
        self.xOffset = self.xOscillator.getVal() * 50
        self.yOffset = self.yOscillator.getVal() * (-50 if self.direction == "down" else 50)
        if (self.yOffset < 0):
            self.xOffset += 75/2
            self.yOffset += 30

    def draw(self):
        noStroke()
        fill(self.h, self.s, self.v)
        ellipse(self.x + self.xOffset, self.y + self.yOffset, self.w, self.w)
    

class Canvas:
    def __init__(self):
        self.bubbleWidth = 0
        self.h = 0
        self.s = 100
        self.v = 100

        self.osc1 = Oscillator(0.005)
        self.osc2 = Oscillator(0.0005)
        self.osc3 = Oscillator(0.001)

        self.oscX = Oscillator(0)
        self.oscY = Oscillator(0.005)

        self.bubbles = []
        rows = 10
        columns = 12
        for j in range(0, rows):
            for i in range(0, columns):
                id = j
                if (i % 2):
                    self.bubbles.append(Bubble(i * 75 , j * 125, "down", id))
                else:
                    self.bubbles.append(Bubble(i * 75 , j * 125 , "up", id))


    def reset(self):
        background(BACKGROUND) # WHITE BACKGROUND

    def update(self):
        for b in self.bubbles:
            b.update()

    def drawCanvas(self):
        for b in self.bubbles:
            b.draw()
      

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
    colorMode(HSB, H_MAX, S_MAX, V_MAX)
    background(BACKGROUND)

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
    canvas.bubbleWidth += event.getCount()
    if (canvas.bubbleWidth < 0):
        canvas.bubbleWidth = 0
    print(canvas.bubbleWidth)

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
            canvasPlayRuntime = timeFunction(canvas.play, "canvas.play")
            lastFrameTimestamp = now
    canvasUpdateRuntime = timeFunction(canvas.update, "canvas.update")
    canvasDrawRuntime = timeFunction(canvas.drawCanvas, "canvas.drawCanvas")

    if (SAVEFRAMES):
        saveFrame("%s/output-####.png" % SAVEFRAMESDIR)
