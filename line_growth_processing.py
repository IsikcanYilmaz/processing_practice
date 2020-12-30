import random
import time

# Config
WINDOW_WIDTH = 64 * 8
WINDOW_HEIGHT = 64 * 8
GRID_WIDTH = 32
GRID_HEIGHT = 32
UPDATE_PER_SECOND = 30
UPDATE_PER_SECOND_MAX = 1000
DEBUGPRINTS = True

H_MAX = 100
S_MAX = 100
V_MAX = 100

NUM_INITIAL_POINTS = 30
INITIAL_Y = WINDOW_HEIGHT / 2
INITIAL_SPACING = 10
INITIAL_X_OFFSET = 50

POINT_RADIUS = 10

def DEBUGPRINT(*argv):
    if (DEBUGPRINTS):
        print(argv)

class Canvas:
    def __init__(self):
        # Random
        # self.points = [(random.randrange(0, WINDOW_WIDTH), random.randrange(0, WINDOW_HEIGHT)) for i in range(0, NUM_INITIAL_POINTS)]
        # Straight line
        # self.points = [(INITIAL_X_OFFSET + (i * INITIAL_SPACING), INITIAL_Y) for i in range(0, NUM_INITIAL_POINTS)]
        self.points = []
        pass

    def reset(self):
        self.points = []

    def update(self):
        # Check for collisions between points. if there is a collision, move the point
        for i in range(0, len(self.points)):
            thisPt = self.points[i]
            thisPtMoveX = 0
            thisPtMoveY = 0
            for j in range(0, len(self.points)):
                if (j != i):
                    xdiff = thisPt[0] - self.points[j][0]
                    ydiff = thisPt[1] - self.points[j][1]

                    # Collision between thisPt and point j:
                    if (abs(xdiff) < POINT_RADIUS and abs(ydiff) < POINT_RADIUS):
                        thisPtMoveX += (1 if xdiff > 0 else -1)
                        thisPtMoveY += (1 if ydiff > 0 else -1)
            self.points[i][0] += thisPtMoveX
            self.points[i][1] += thisPtMoveY

    def drawCanvas(self):
        background(0, 0, 100) # WHITE BACKGROUND
        if len(self.points) == 2:
            pass
        elif len(self.points) > 2:
            noFill()
            beginShape()
            for pt in self.points:
                strokeWeight(1)
                circle(pt[0], pt[1], POINT_RADIUS)
                strokeWeight(8)
                curveVertex(pt[0], pt[1])
            endShape()

    def addPoint(self, x, y):
        self.points.append([x,y])



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
    canvas.addPoint(mouseX, mouseY)

def mouseDragged(event):
    DEBUGPRINT("MOUSE MOVED", event, mouseX, mouseY)
    try:
        if (mousePressed):
            canvas.addPoint(mouseX, mouseY)
    except Exception as e:
        DEBUGPRINT("Mouse drag out of bounds error", e)

def mouseWheel(event):
    global UPDATE_PER_SECOND, framePeriod
    DEBUGPRINT("MOUSE WHEEL", event, event.getCount())
    UPDATE_PER_SECOND += event.getCount()
    if (UPDATE_PER_SECOND < 1):
        UPDATE_PER_SECOND = 1
    if (UPDATE_PER_SECOND > UPDATE_PER_SECOND_MAX):
        UPDATE_PER_SECOND = UPDATE_PER_SECOND_MAX
    framePeriod = 1.0/UPDATE_PER_SECOND
    DEBUGPRINT("UPDATE FREQ %d", UPDATE_PER_SECOND)

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
            canvasPlayRuntime = timeFunction(canvas.update, "canvas.play")
            lastFrameTimestamp = now
            DEBUGPRINT("FRAME", now)
    canvasDrawRuntime = timeFunction(canvas.drawCanvas, "canvas.drawCanvas")
