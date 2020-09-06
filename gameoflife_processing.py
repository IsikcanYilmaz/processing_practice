from random import randint
import time

# Game of Life
'''
Any live cell with fewer than two live neighbours dies.
Any live cell with two or three live neighbours lives on.
Any live cell with more than three live neighbours dies.
Any dead cell with exactly three live neighbours becomes a live cell.
'''

WINDOW_WIDTH = 64 * 10
WINDOW_HEIGHT = 64 * 10
GRID_WIDTH = 8
GRID_HEIGHT = 8
GRID_RENDER_CELL_WIDTH = (WINDOW_WIDTH / GRID_WIDTH)
GRID_RENDER_CELL_HEIGHT = (WINDOW_HEIGHT / GRID_HEIGHT)
UPDATE_PER_SECOND = 100
DEBUGPRINTS = True

def DEBUGPRINT(*argv):
    if (DEBUGPRINTS):
        print(argv)

class GoLBoard:
    def __init__(self):
        self.currentFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
        self.nextFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]

    def reset(self):
        self.currentFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
        self.nextFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]

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

                if (len(aliveNeighbors) == 0):
                    continue

                cellLives = False

                # is alive and one or no neighbors
                if currentValue > 0 and len(aliveNeighbors) < 2:
                    cellLives = False

                # is alive and 2 or 3 alive neighbors
                if currentValue > 0 and (len(aliveNeighbors) == 2 or len(aliveNeighbors) == 3):
                    cellLives = True

                # is alive and more than 4 alive neighbors
                if currentValue > 0 and len(aliveNeighbors) >= 4:
                    cellLives = False

                # is dead cell and 3 alive neighbors
                if currentValue == 0 and len(aliveNeighbors) == 3:
                    cellLives = True

                self.nextFrame[y][x] = (1 if cellLives else 0)


        self.currentFrame = self.nextFrame
        self.nextFrame = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]

    def drawBoard(self):
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                if self.getCell(x, y):
                    fill(0, 0, 0)
                else:
                    fill(255, 255, 255)

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

    board.drawBoard()

def mouseClicked(event):
    DEBUGPRINT("MOUSE CLICKED", event, mouseX, mouseY)
    cellX = mouseX / GRID_RENDER_CELL_WIDTH
    cellY = mouseY / GRID_RENDER_CELL_HEIGHT
    DEBUGPRINT("CELL", cellX, cellY)
    board.setCell(cellX, cellY)

def mouseMoved(event):
    DEBUGPRINT("MOUSE MOVED", event, mouseX, mouseY)

def keyPressed(event):
    DEBUGPRINT("KEY PRESSED", key, keyCode)
    if (key == u' '):
        togglePause()

def draw():
    global lastFrameTimestamp, framePeriod
    if (playing):
        now = time.time()
        if (lastFrameTimestamp == 0 or now - lastFrameTimestamp > framePeriod):
            board.play()
            lastFrameTimestamp = now
            DEBUGPRINT("FRAME", now)
    board.drawBoard()
