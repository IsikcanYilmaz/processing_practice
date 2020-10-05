from random import randint
import time

# Game of Life
'''
Any live cell with fewer than two live neighbours dies.
Any live cell with two or three live neighbours lives on.
Any live cell with more than three live neighbours dies.
Any dead cell with exactly three live neighbours becomes a live cell.
'''

# Config
WINDOW_WIDTH = 64 * 4
WINDOW_HEIGHT = 64 * 4
GRID_WIDTH = 32
GRID_HEIGHT = 32
UPDATE_PER_SECOND = 30
UPDATE_PER_SECOND_MAX = 1000
DEBUGPRINTS = True
COLORED = True
SHOW_ALIVE_CELLS = True

H_DEFAULT = 0
S_DEFAULT = 100
V_DEFAULT = 100

H_MAX = 100
S_MAX = 100
V_MAX = 100

H_DELTA = 1
H_DECAY = 0
S_DECAY = 0.5
V_DECAY = 0



GRID_RENDER_CELL_WIDTH = (WINDOW_WIDTH / GRID_WIDTH)
GRID_RENDER_CELL_HEIGHT = (WINDOW_HEIGHT / GRID_HEIGHT)

def DEBUGPRINT(*argv):
    if (DEBUGPRINTS):
        print(argv)

class GoLBoard:
    def __init__(self):
        self.currentFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
        self.nextFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
        self.coloredFrame = [[(0,0,100) for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
        self.color = (H_DEFAULT,S_DEFAULT,V_DEFAULT) # HSV form

    def reset(self):
        self.__init__()
        DEBUGPRINT("Board reset")

    def setCell(self, x, y):
        self.currentFrame[y][x] = 1
        self.coloredFrame[y][x] = (0,0,0)

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
        newh = (self.color[0] + H_DELTA) % H_MAX
        news = self.color[1]
        newv = self.color[2]
        self.color = (newh, news, newv)

    def drawBoard(self):
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                if self.getCell(x, y):
                    if (SHOW_ALIVE_CELLS):
                        fill(0, 0, 0)
                    else:
                        fill(*self.coloredFrame[y][x])
                else:
                    if (COLORED):
                        fill(*self.coloredFrame[y][x])
                    else:
                        fill(0, 0, 100)

                rect(x * GRID_RENDER_CELL_WIDTH, y * GRID_RENDER_CELL_HEIGHT,
                        GRID_RENDER_CELL_WIDTH, GRID_RENDER_CELL_HEIGHT)
                tmp = self.coloredFrame[y][x]
                self.coloredFrame[y][x] = ( 0 if tmp[0] - H_DECAY < 0 else tmp[0] - H_DECAY, \
                                            0 if tmp[1] - S_DECAY < 0 else tmp[1] - S_DECAY, \
                                            0 if tmp[2] - V_DECAY < 0 else tmp[2] - V_DECAY)

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

    colorMode(HSB, H_MAX, S_MAX, V_MAX)

    board.drawBoard()

def mouseClicked(event):
    DEBUGPRINT("MOUSE CLICKED", event, mouseX, mouseY)
    cellX = mouseX / GRID_RENDER_CELL_WIDTH
    cellY = mouseY / GRID_RENDER_CELL_HEIGHT
    DEBUGPRINT("CELL", cellX, cellY)
    board.setCell(cellX, cellY)

def mouseDragged(event):
    DEBUGPRINT("MOUSE MOVED", event, mouseX, mouseY)
    try:
        if (mousePressed):
            cellX = mouseX / GRID_RENDER_CELL_WIDTH
            cellY = mouseY / GRID_RENDER_CELL_HEIGHT
            board.setCell(cellX, cellY)
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
    global SHOW_ALIVE_CELLS
    DEBUGPRINT("KEY PRESSED", key, keyCode)
    if (key == u' '):
        togglePause()
    if (key == u'r'):
        board.reset()
    if (key == u'a'):
        SHOW_ALIVE_CELLS = not SHOW_ALIVE_CELLS

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
            boardPlayRuntime = timeFunction(board.play, "board.play") # 0.194000 seconds @ 128x128
            lastFrameTimestamp = now
            #DEBUGPRINT("FRAME", now)
    boardDrawRuntime = timeFunction(board.drawBoard, "board.drawBoard") # 0.058000 seconds @ 128x128
