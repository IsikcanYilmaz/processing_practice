from random import randint
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

def DEBUGPRINT(*argv):
    if (DEBUGPRINTS):
        print(argv)

class Canvas:
    def __init__(self):
        pass

    def reset(self):
        pass

    def update(self):
        pass

    def drawCanvas(self):
        pass


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
            canvasPlayRuntime = timeFunction(canvas.play, "canvas.play")
            lastFrameTimestamp = now
            #DEBUGPRINT("FRAME", now)
    canvasDrawRuntime = timeFunction(canvas.drawCanvas, "canvas.drawCanvas")
