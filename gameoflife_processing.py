from random import randint
import time

# Game of Life
'''
Any live cell with fewer than two live neighbours dies.
Any live cell with two or three live neighbours lives on.
Any live cell with more than three live neighbours dies.
Any dead cell with exactly three live neighbours becomes a live cell.
'''

WINDOW_WIDTH = 64 * 12
WINDOW_HEIGHT = 64 * 12
GRID_WIDTH = 64
GRID_HEIGHT = 64
GRID_RENDER_CELL_WIDTH = (WINDOW_WIDTH / GRID_WIDTH)
GRID_RENDER_CELL_HEIGHT = (WINDOW_HEIGHT / GRID_HEIGHT)
UPDATE_PER_SECOND = 30
UPDATE_PER_SECOND_MAX = 500
DEBUGPRINTS = True
COLORED = True
H_MAX = 100
S_MAX = 100
V_MAX = 100

def DEBUGPRINT(*argv):
    if (DEBUGPRINTS):
        print(argv)

class GoLBoard:
    def __init__(self):
        self.currentFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
        self.nextFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
        self.coloredFrame = [[(0,0,100) for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
        self.color = (0,50,80) # HSV form

    def reset(self):
        self.__init__()

    def setCell(self, x, y):
        self.currentFrame[y][x] = 1

    def getCell(self, x, y):
        return self.currentFrame[y][x]

    def printFrame(self):
        for y in range(0, GRID_HEIGHT):
            DEBUGPRINT(self.currentFrame[GRID_HEIGHT - y - 1], " | " , self.nextFrame[GRID_HEIGHT - y - 1])

    def play(self):
        counter = 0
        for y in range(0, len(self.currentFrame)):
            for x in range(0, len(self.currentFrame[y])):
                neighbors = []
                currentValue = self.getCell(x, y)
                for yDir in ([-1, 0, 1]):
                    for xDir in ([-1, 0, 1]):
                        if (xDir == yDir == 0):
                            continue
                        if (xDir == -1 and x == 0):
                            continue
                        if (xDir == 1 and x == GRID_WIDTH-1):
                            continue
                        if (yDir == -1 and y == 0):
                            continue
                        if (yDir == 1 and y == GRID_HEIGHT-1):
                            continue
                        neighbors.append(self.currentFrame[y+yDir][x+xDir])

                aliveNeighbors = [n for n in neighbors if n > 0]

                cellLives = False

                # is alive and one or no neighbors
                if currentValue > 0 and len(aliveNeighbors) < 2:
                    cellLives = False
                    self.coloredFrame[y][x] = self.color

                # is alive and 2 or 3 alive neighbors
                if currentValue > 0 and (len(aliveNeighbors) == 2 or len(aliveNeighbors) == 3):
                    cellLives = True

                # is alive and more than 4 alive neighbors
                if currentValue > 0 and len(aliveNeighbors) >= 4:
                    cellLives = False
                    self.coloredFrame[y][x] = self.color

                # is dead cell and 3 alive neighbors
                if currentValue == 0 and len(aliveNeighbors) == 3:
                    cellLives = True

                self.nextFrame[y][x] = (1 if cellLives else 0)

        self.currentFrame = self.nextFrame
        self.nextFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
        self.color = ((self.color[0] + 1) % H_MAX, self.color[1], self.color[2])

    def drawBoard(self):
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                if self.getCell(x, y):
                    fill(0, 0, 0)
                else:
                    if (COLORED):
                        fill(*self.coloredFrame[y][x])
                    else:
                        fill(0, 0, 100)

                rect(x * GRID_RENDER_CELL_WIDTH, y * GRID_RENDER_CELL_HEIGHT,
                        GRID_RENDER_CELL_WIDTH, GRID_RENDER_CELL_HEIGHT)

###########################################
board = GoLBoard()
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
    background(0)

    for i in range(0, 500):
        fill(randint(0,255), randint(0, 255), randint(0, 255))
        ellipse(randint(0, WINDOW_WIDTH), randint(0, WINDOW_HEIGHT), 80, 80)

    colorMode(HSB, 100)

    board.drawBoard()

def mouseClicked(event):
    DEBUGPRINT("MOUSE CLICKED", event, mouseX, mouseY)
    cellX = mouseX / GRID_RENDER_CELL_WIDTH
    cellY = mouseY / GRID_RENDER_CELL_HEIGHT
    DEBUGPRINT("CELL", cellX, cellY)
    board.setCell(cellX, cellY)

def mouseDragged(event):
    DEBUGPRINT("MOUSE MOVED", event, mouseX, mouseY)
    if (mousePressed):
        cellX = mouseX / GRID_RENDER_CELL_WIDTH
        cellY = mouseY / GRID_RENDER_CELL_HEIGHT
        board.setCell(cellX, cellY)

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

def timeFunction(fn, desc=""):
    begin = time.time()
    fn()
    end = time.time()
    DEBUGPRINT("Fn %s Ran in %f seconds" % (desc, (end-begin)))

def draw():
    global lastFrameTimestamp, framePeriod
    if (playing):
        now = time.time()
        if (lastFrameTimestamp == 0 or now - lastFrameTimestamp > framePeriod):
            timeFunction(board.play, "board.play") # 0.194000 seconds @ 128x128
            lastFrameTimestamp = now
            #DEBUGPRINT("FRAME", now)
    timeFunction(board.drawBoard, "board.drawBoard") # 0.058000 seconds @ 128x128
