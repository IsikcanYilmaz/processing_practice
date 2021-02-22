from random import randint
from math import pi, sin
import time

# Config
WINDOW_WIDTH = 64 * 15
WINDOW_HEIGHT = 64 * 15
GRID_WIDTH = 32
GRID_HEIGHT = 32
UPDATE_PER_SECOND = 30
UPDATE_PER_SECOND_MAX = 1000
DEBUGPRINTS = True
SAVEFRAMES = False
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

    def reset(self):
        background(BACKGROUND) # WHITE BACKGROUND

    def update(self):
        self.osc1.update()
        self.osc2.update()
        self.osc3.update()
        self.oscX.update()
        self.oscY.update()

        self.bubbleWidth = self.osc1.getVal() * 300
        self.h = abs(self.osc2.getVal()) * 100
        self.s = (self.osc3.getVal() * 50) + 50

    def drawCanvas(self):
        # Draw ellipse of random size
        x = (WINDOW_WIDTH / 2) + (self.oscX.getVal() * 300) #mouseX
        y = (WINDOW_WIDTH / 2) + (self.oscY.getVal() * 300) #mouseY

        if (self.oscY.getVal() > 0):
            x -= 200
            y -= 300

        # i want 386, 339 to be the center. so do some offsetting
        # normally center is 480, 480. 480 - xoffset = 386. xoffset = 94
        #                              480 - yoffset = 339. yoffset = 141
        # this is when window height and width is 960
        xoffset = abs((WINDOW_WIDTH / 2) - 386)
        yoffset = abs((WINDOW_HEIGHT / 2) - 339)

        # ELLIPSE 1
        noStroke()
        fill(self.h, self.s, self.v)
        ellipse(x + xoffset, y + yoffset, self.bubbleWidth, self.bubbleWidth)



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
