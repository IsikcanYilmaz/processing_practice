from random import randint
from math import *
import time

# Config
WINDOW_WIDTH = 64 * 8
WINDOW_HEIGHT = 64 * 8
GRID_WIDTH = 32
GRID_HEIGHT = 32
UPDATE_PER_SECOND = 30
UPDATE_PER_SECOND_MAX = 1000
DEBUGPRINTS = True

H_MAX = 360
S_MAX = 100
V_MAX = 100

DEFAULT_NUM_CELLS = 0
DEFAULT_CELL_WIDTH = 10
DEFAULT_DRAW_RANGE = 9999
DEFAULT_H = randint(0, H_MAX)

DEBUG = True

def DEBUGPRINT(*argv):
    if (DEBUGPRINTS):
        print(argv)


def distanceFunction(x1, y1, x2, y2):
    return sqrt(((x1-x2) * (x1-x2)) + ((y1-y2) * (y1-y2)))

class Cell:
    def __init__(self, x, y, width=DEFAULT_CELL_WIDTH):
        self.x = x
        self.y = y
        self.width = width
        self.color = (DEFAULT_H, 100*y/WINDOW_HEIGHT, 100)

    def update(self):
        pass
    
    def draw(self):
        fill(0, 0, 0)
        ellipse(self.x, self.y, self.width, self.width)

class Canvas:
    def __init__(self):
        self.cells = [Cell(randint(0, WINDOW_WIDTH), randint(0, WINDOW_HEIGHT)) for c in range(0, DEFAULT_NUM_CELLS)]
        self.drawRange = DEFAULT_DRAW_RANGE

    def reset(self):
        self.cells = []

    def update(self):
        pass

    def drawCanvas(self):
        if (len(self.cells) == 0):
            background(0, 0, 100)
            return 
        t1 = time.time()
        for i in range(0, WINDOW_WIDTH):
            for j in range(0, WINDOW_HEIGHT):
                # idx = (j * WINDOW_WIDTH) + i
                shortestDist = 0xffff 
                shortestDistCellIdx = 0 
                for cidx, c in enumerate(self.cells):
                    d = distanceFunction(i, j, c.x, c.y)
                    if (d < shortestDist):
                        shortestDist = d
                        shortestDistCellIdx = cidx
                if (shortestDist < self.drawRange):
                    cellColor = color(*self.cells[shortestDistCellIdx].color)
                else:
                    cellColor = color(*(0, 0, 100))    
                set(i, j, cellColor)
        for c in self.cells:
            c.draw()
        t2 = time.time()
        print(t2-t1)


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
    background(0, 0, 100) # WHITE BACKGROUND

    canvasPlayRuntime = timeFunction(canvas.update, "canvas.update")
    canvasDrawRuntime = timeFunction(canvas.drawCanvas, "canvas.drawCanvas")

def mouseClicked(event):
    DEBUGPRINT("MOUSE CLICKED", event, mouseX, mouseY)
    canvas.cells.append(Cell(mouseX, mouseY))
    canvasPlayRuntime = timeFunction(canvas.update, "canvas.update")
    canvasDrawRuntime = timeFunction(canvas.drawCanvas, "canvas.drawCanvas")

def mouseDragged(event):
    DEBUGPRINT("MOUSE MOVED", event, mouseX, mouseY)
    try:
        if (mousePressed):
            pass
    except Exception as e:
        DEBUGPRINT("Mouse drag out of bounds error", e)

def mouseWheel(event):
    global framePeriod
    if (event.getCount() > 0):
        canvas.drawRange += 10
    else:
        canvas.drawRange -= 10
    canvasPlayRuntime = timeFunction(canvas.update, "canvas.update")
    canvasDrawRuntime = timeFunction(canvas.drawCanvas, "canvas.drawCanvas")
    DEBUGPRINT("MOUSE WHEEL", event, event.getCount())

def keyPressed(event):
    global DEFAULT_H
    DEBUGPRINT("KEY PRESSED", key, keyCode)
    if (key == u' '):
        togglePause()
    if (key == u'a'):
        DEFAULT_H = randint(0, H_MAX)
    if (key == u'r'):
        canvas.reset()
        canvasPlayRuntime = timeFunction(canvas.update, "canvas.update")
        canvasDrawRuntime = timeFunction(canvas.drawCanvas, "canvas.drawCanvas")

def timeFunction(fn, desc=""):
    begin = time.time()
    fn()
    end = time.time()
    return (end - begin)

def draw():
    global lastFrameTimestamp, framePeriod
