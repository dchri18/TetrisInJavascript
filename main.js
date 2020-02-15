// ----------IMPORTS---------------------------------------------------------------------



// ----------CONSTS----------------------------------------------------------------------
const FPS = 60;
// CREATED FOR CANVAS SIZE 500 x 1000
// Cavnas grid size must always be 10X20 based on normal Tetris rules.
// GRID_SQUARE_SIZE represents the pixel width and height to fix within the canvas.
const GRID_SQUARE_SIZE = 50;
const GRID_X = 10;
const GRID_Y = 20;
const BLOCKS = {
    lBlock: "lBlock",
    TBlock: "OBlock",
    OBlock: "TBlock",
    LBlock: "LBlock",
    JBlock: "JBlock",
    ZBlock: "ZBlock",
    SBlock: "SBlock"
}


// ----------CORE CODE-------------------------------------------------------------------
var canv = document.getElementById("gameCanvas"); // The canvas element from html
var ctx = canv.getContext("2d"); // the 2d context of the canvas element
document.addEventListener("keydown", readInput); // Event listener for keyboard inputs

var grid; // 2d array of gridSections (VERY IMPORTANT)
initialiseGrid(); // Initialises the grid varaible

setInterval(run, 1000 / FPS); // Sets the game loop
setInterval(blockDrop, 1000);

var currentBlock; // The current block to be controlled by the player

spawnNewBlock(); // Spawn the first block of the game
// If this function is not run then currentBlock will remain undefined

// Run the game
function run() {
    drawBackground(); // Draw Normal Background
    drawGrid(); // Draw background grid
    checkBorder(currentBlock); // prevent currentBlock from leaving left/right borders
    drawBlock(currentBlock); // draw currentBlock
    drawGridSections(); // draw all squres within the gridSections (previous blocks)
}


// ----------OBJECTS---------------------------------------------------------------------
// Object containing x and y coorindates for a grid square
function coordinate(x, y) {
    this.x = x;
    this.y = y;
}

function square(/**@type {coordinate} */ coor, /**@type {string} */ colour) {
    this.coor = coor;
    this.colour = colour;
}

// Object containing x and y coordinates and if the section is empty or not
function gridSection(/**@type {number} */ x, /**@type {number} */ y, /**@type {square} */ sq) {
    this.x = x;
    this.y = y;
    this.sq = sq;
}

function block(/**@type {coordinate} */ coor, /**@type {BLOCKS} */ type) {
    this.dir = "up"
    this.type = type;

    // Set positions of square a b c d based on block type.
    // All blocks rotate on A hence why its in the middle.
    /*
    lBlock: [B][A][C][D]

    TBlock:        [C]
                [B][A][D]

    OBlock:     [A][C]
                [B][D]

    LBlock:           [D]     
                [C][B][A]

    JBlock:     [D]
                [A][B][C]

    ZBlock:     [D][A]
                   [B][C]

    SBlock:        [B][C]
                [D][A]
    */
    switch (this.type) {
        case BLOCKS.lBlock:
            this.a = new square(coor, "blue");
            this.b = new square(new coordinate(this.a.coor.x - GRID_SQUARE_SIZE, this.a.coor.y), "blue");
            this.c = new square(new coordinate(this.a.coor.x + GRID_SQUARE_SIZE, this.a.coor.y), "blue");
            this.d = new square(new coordinate(this.c.coor.x + GRID_SQUARE_SIZE, this.c.coor.y), "blue");
            break;
        case BLOCKS.OBlock:
            this.a = new square(coor, "yellow");
            this.b = new square(new coordinate(this.a.coor.x, this.a.coor.y + GRID_SQUARE_SIZE), "yellow");
            this.c = new square(new coordinate(this.a.coor.x + GRID_SQUARE_SIZE, this.a.coor.y), "yellow");
            this.d = new square(new coordinate(this.a.coor.x + GRID_SQUARE_SIZE, this.a.coor.y + GRID_SQUARE_SIZE), "yellow");
            break;
        case BLOCKS.TBlock:
            this.a = new square(coor, "orange");
            this.b = new square(new coordinate(this.a.coor.x - GRID_SQUARE_SIZE, this.a.coor.y), "orange");
            this.c = new square(new coordinate(this.a.coor.x, this.a.coor.y - GRID_SQUARE_SIZE), "orange");
            this.d = new square(new coordinate(this.a.coor.x + GRID_SQUARE_SIZE, this.a.coor.y), "orange");
            break;
        case BLOCKS.LBlock:
            this.a = new square(coor, "green");
            this.b = new square(new coordinate(this.a.coor.x - GRID_SQUARE_SIZE, this.a.coor.y), "green");
            this.c = new square(new coordinate(this.b.coor.x - GRID_SQUARE_SIZE, this.b.coor.y), "green");
            this.d = new square(new coordinate(this.a.coor.x, this.a.coor.y - GRID_SQUARE_SIZE), "green");
            break;
        case BLOCKS.JBlock:
            this.a = new square(coor, "purple");
            this.b = new square(new coordinate(this.a.coor.x + GRID_SQUARE_SIZE, this.a.coor.y), "purple");
            this.c = new square(new coordinate(this.b.coor.x + GRID_SQUARE_SIZE, this.b.coor.y), "purple");
            this.d = new square(new coordinate(this.a.coor.x, this.a.coor.y - GRID_SQUARE_SIZE), "purple");
            break;
        case BLOCKS.ZBlock:
            this.a = new square(coor, "red");
            this.b = new square(new coordinate(this.a.coor.x, this.a.coor.y + GRID_SQUARE_SIZE), "red");
            this.c = new square(new coordinate(this.a.coor.x + GRID_SQUARE_SIZE, this.a.coor.y + GRID_SQUARE_SIZE), "red");
            this.d = new square(new coordinate(this.a.coor.x - GRID_SQUARE_SIZE, this.a.coor.y), "red");
            break;
        case BLOCKS.SBlock:
            this.a = new square(coor, "cyan");
            this.b = new square(new coordinate(this.a.coor.x, this.a.coor.y - GRID_SQUARE_SIZE), "cyan");
            this.c = new square(new coordinate(this.a.coor.x + GRID_SQUARE_SIZE, this.a.coor.y - GRID_SQUARE_SIZE), "cyan");
            this.d = new square(new coordinate(this.a.coor.x - GRID_SQUARE_SIZE, this.a.coor.y), "cyan");
            break;
    }
}

// ----------DRAW FUNCTIONS--------------------------------------------------------------
// Draw the background of the game
function drawBackground() {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, canv.width, canv.height);
}

// Draw a singular grid square.
function drawGridSquare(x, y) {
    ctx.strokeStyle = "#303030";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + GRID_SQUARE_SIZE, y);
    ctx.lineTo(x + GRID_SQUARE_SIZE, y + GRID_SQUARE_SIZE);
    ctx.lineTo(x, y + GRID_SQUARE_SIZE);
    ctx.closePath();
    ctx.stroke();
}

// Fill the background by drawing all grid squares.
function drawGrid() {
    for (var i = 0; i < GRID_X; i++) {
        for (var j = 0; j < GRID_Y; j++) {
            drawGridSquare(i * GRID_SQUARE_SIZE, j * GRID_SQUARE_SIZE);
        }
    }
}

// Draw a singular square based on a coodinate and colour
function drawSquare(/** @type {square}*/ sq) {
    ctx.fillStyle = sq.colour;
    ctx.fillRect(sq.coor.x, sq.coor.y, GRID_SQUARE_SIZE, GRID_SQUARE_SIZE);
}

// Draw all squares within a block to the screen
function drawBlock(/**@type {block} */ bl) {
    drawSquare(bl.a);
    drawSquare(bl.b);
    drawSquare(bl.c);
    drawSquare(bl.d);
}

// Draw all squares on the grid from each gridSection
function drawGridSections() {
    for (var i = 0; i < GRID_X; i++) {
        for (var j = 0; j < GRID_Y; j++) {
            if (grid[i][j].sq !== null) {
                drawSquare(grid[i][j].sq);
            }
        }
    }
}

// ----------GAME MECHANICS--------------------------------------------------------------
// Initialise the grid 2d array with all gridSections
function initialiseGrid() {
    // Initialise 2D array
    grid = new Array(GRID_X);
    for (var i = 0; i < GRID_X; i++) {
        grid[i] = new Array(GRID_Y);
    }

    // Fill array with gridSections objects
    for (var i = 0; i < GRID_X; i++) {
        for (var j = 0; j < GRID_Y; j++) {
            grid[i][j] = new gridSection(i * GRID_SQUARE_SIZE, j * GRID_SQUARE_SIZE, null);
        }
    }
}

function moveSquareUp(/**@type {square} */ sq) {
    sq.coor.y -= GRID_SQUARE_SIZE;
}

function moveSquareDown(/**@type {square} */ sq) {
    sq.coor.y += GRID_SQUARE_SIZE;
}

function moveSquareLeft(/**@type {square} */ sq) {
    sq.coor.x -= GRID_SQUARE_SIZE;
}

function moveSquareRight(/**@type {square} */ sq) {
    sq.coor.x += GRID_SQUARE_SIZE;
}

function moveBlockUp(/**@type {block} */ bl) {
    moveSquareUp(bl.a);
    moveSquareUp(bl.b);
    moveSquareUp(bl.c);
    moveSquareUp(bl.d);
}

function moveBlockDown(/**@type {block} */ bl) {
    moveSquareDown(bl.a);
    moveSquareDown(bl.b);
    moveSquareDown(bl.c);
    moveSquareDown(bl.d);
}

function moveBlockLeft(/**@type {block} */ bl) {
    moveSquareLeft(bl.a);
    moveSquareLeft(bl.b);
    moveSquareLeft(bl.c);
    moveSquareLeft(bl.d);
}

function moveBlockRight(/**@type {block} */ bl) {
    moveSquareRight(bl.a);
    moveSquareRight(bl.b);
    moveSquareRight(bl.c);
    moveSquareRight(bl.d);
}

function rotateBlock(/**@type {block} */ bl) {
    // Select based on block type.
    switch (bl.type) {
        case BLOCKS.lBlock:
            // Select based on dir value.
            switch (bl.dir) {
                case "up":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x -= GRID_SQUARE_SIZE, bl.c.coor.y -= GRID_SQUARE_SIZE;
                    bl.d.coor.x -= (GRID_SQUARE_SIZE * 2), bl.d.coor.y -= (GRID_SQUARE_SIZE * 2);
                    break;
                case "left":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x -= GRID_SQUARE_SIZE, bl.c.coor.y += GRID_SQUARE_SIZE;
                    bl.d.coor.x -= (GRID_SQUARE_SIZE * 2), bl.d.coor.y += (GRID_SQUARE_SIZE * 2);
                    break;
                case "down":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x += GRID_SQUARE_SIZE, bl.c.coor.y += GRID_SQUARE_SIZE;
                    bl.d.coor.x += (GRID_SQUARE_SIZE * 2), bl.d.coor.y += (GRID_SQUARE_SIZE * 2);
                    break;
                case "right":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x += GRID_SQUARE_SIZE, bl.c.coor.y -= GRID_SQUARE_SIZE;
                    bl.d.coor.x += (GRID_SQUARE_SIZE * 2), bl.d.coor.y -= (GRID_SQUARE_SIZE * 2);
                    break;
            }
            break;
        case BLOCKS.TBlock:
            // Select based on dir value.
            switch (bl.dir) {
                case "up":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x -= GRID_SQUARE_SIZE, bl.c.coor.y += GRID_SQUARE_SIZE;
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
                case "left":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x += GRID_SQUARE_SIZE, bl.c.coor.y += GRID_SQUARE_SIZE;
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
                case "down":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x += GRID_SQUARE_SIZE, bl.c.coor.y -= GRID_SQUARE_SIZE;
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
                case "right":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x -= GRID_SQUARE_SIZE, bl.c.coor.y -= GRID_SQUARE_SIZE;
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
            }
            break;
        case BLOCKS.LBlock:
            // Select based on dir value.
            switch (bl.dir) {
                case "up":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x += (GRID_SQUARE_SIZE * 2), bl.c.coor.y += (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
                case "left":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x += (GRID_SQUARE_SIZE * 2), bl.c.coor.y -= (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
                case "down":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x -= (GRID_SQUARE_SIZE * 2), bl.c.coor.y -= (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
                case "right":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x -= (GRID_SQUARE_SIZE * 2), bl.c.coor.y += (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
            }
            break;
        case BLOCKS.JBlock:
            // Select based on dir value.
            switch (bl.dir) {
                case "up":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x -= (GRID_SQUARE_SIZE * 2), bl.c.coor.y -= (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
                case "left":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x -= (GRID_SQUARE_SIZE * 2), bl.c.coor.y += (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
                case "down":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x += (GRID_SQUARE_SIZE * 2), bl.c.coor.y += (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
                case "right":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x += (GRID_SQUARE_SIZE * 2), bl.c.coor.y -= (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
            }
            break;
        case BLOCKS.ZBlock:
            // Select based on dir value.
            switch (bl.dir) {
                case "up":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.y -= (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
                case "left":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x -= (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
                case "down":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.y += (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
                case "right":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x += (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
            }
            break;
        case BLOCKS.SBlock:
            // Select based on dir value.
            switch (bl.dir) {
                case "up":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.x -= (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
                case "left":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y += GRID_SQUARE_SIZE;
                    bl.c.coor.y += (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x += GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
                case "down":
                    bl.b.coor.x += GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.x += (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y -= GRID_SQUARE_SIZE;
                    break;
                case "right":
                    bl.b.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.y -= GRID_SQUARE_SIZE;
                    bl.c.coor.y -= (GRID_SQUARE_SIZE * 2);
                    bl.d.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.y += GRID_SQUARE_SIZE;
                    break;
            }
            break;
    }

    // Rotate dir value;
    switch (bl.dir) {
        case "up":
            bl.dir = "left";
            break;
        case "left":
            bl.dir = "down";
            break;
        case "down":
            bl.dir = "right";
            break;
        case "right":
            bl.dir = "up";
            break;
    }
}

function readInput(/** @type {KeyboardEvent} */ ev) {
    switch (ev.keyCode) {
        case 38: // Up Arrow
            rotateBlock(currentBlock);
            break;
        case 37: // Left Arrow
            blockCollision(currentBlock, "left");
            break;
        case 39: // Right Arrow
            blockCollision(currentBlock, "right");
            break;
        case 40: // Down Arrow
            blockCollision(currentBlock, "down");
            moveBlockDown(currentBlock);
            break;
    }
}

// Checks whether the current block is beyond the left and right border and moves it back
function checkBorder(/**@type {block} */ bl) {
    var gridWidth = GRID_SQUARE_SIZE * GRID_X;
    if (bl.a.coor.x < 0 || bl.b.coor.x < 0 || bl.c.coor.x < 0 || bl.d.coor.x < 0) {
        bl.a.coor.x += GRID_SQUARE_SIZE, bl.b.coor.x += GRID_SQUARE_SIZE,
            bl.c.coor.x += GRID_SQUARE_SIZE, bl.d.coor.x += GRID_SQUARE_SIZE;
    } else if (bl.a.coor.x >= gridWidth || bl.b.coor.x >= gridWidth || bl.c.coor.x >= gridWidth || bl.d.coor.x >= gridWidth) {
        bl.a.coor.x -= GRID_SQUARE_SIZE, bl.b.coor.x -= GRID_SQUARE_SIZE,
            bl.c.coor.x -= GRID_SQUARE_SIZE, bl.d.coor.x -= GRID_SQUARE_SIZE;
    }
}

// Get grid location based off of the coordinates
function getGridLocationOfSquare(/**@type {square} */ sq) {
    for (var i = 0; i < GRID_X; i++) {
        for (var j = 0; j < GRID_Y; j++) {
            if (grid[i][j].x === sq.coor.x && grid[i][j].y === sq.coor.y) {
                return {
                    gridX: i,
                    gridY: j
                };
            }
        }
    }
}

// Checks whether any square from a block has collided with any square from a grid section
function blockCollision(/**@type {block} */ bl, /**@type {string} */ dir) {
    // These varaibles hold the GRID locations of each square in the block, not the coordinate values.
    var sqGridA = getGridLocationOfSquare(bl.a);
    var sqGridB = getGridLocationOfSquare(bl.b);
    var sqGridC = getGridLocationOfSquare(bl.c);
    var sqGridD = getGridLocationOfSquare(bl.d);

    if (sqGridA !== undefined && sqGridB !== undefined && sqGridC !== undefined && sqGridD !== undefined) {
        switch (dir) {
            case "down":
                // First check if the block has touched the bottom of the screen based on GRID values no coordinates
                if (sqGridA.gridY === GRID_Y - 1 || sqGridB.gridY === GRID_Y - 1 || sqGridC.gridY === GRID_Y - 1 || sqGridD.gridY === GRID_Y - 1) {
                    grid[sqGridA.gridX][sqGridA.gridY].sq = bl.a;
                    grid[sqGridB.gridX][sqGridB.gridY].sq = bl.b;
                    grid[sqGridC.gridX][sqGridC.gridY].sq = bl.c;
                    grid[sqGridD.gridX][sqGridD.gridY].sq = bl.d;
                    spawnNewBlock();
                    return;
                }
                // If the block tries to move into a position where one of eats blocks will touch a gridSection that is not null
                // The block will not move, have it squares moved into the grid 2d array and a new block will generate
                if (grid[sqGridA.gridX][sqGridA.gridY + 1].sq !== null || grid[sqGridB.gridX][sqGridB.gridY + 1].sq !== null ||
                    grid[sqGridC.gridX][sqGridC.gridY + 1].sq !== null || grid[sqGridD.gridX][sqGridD.gridY + 1].sq !== null) {
                    grid[sqGridA.gridX][sqGridA.gridY].sq = bl.a;
                    grid[sqGridB.gridX][sqGridB.gridY].sq = bl.b;
                    grid[sqGridC.gridX][sqGridC.gridY].sq = bl.c;
                    grid[sqGridD.gridX][sqGridD.gridY].sq = bl.d;
                    spawnNewBlock();
                }
                break;
            // TODO Stop TypeError when hitting left and right boundry
            case "left":
                // If the block tries to move into a position where one of eats blocks will touch a gridSection that is not null
                // The block will not move, have it squares moved into the grid 2d array and a new block will generate
                if (grid[sqGridA.gridX - 1][sqGridA.gridY].sq !== null || grid[sqGridB.gridX - 1][sqGridB.gridY].sq !== null ||
                    grid[sqGridC.gridX - 1][sqGridC.gridY].sq !== null || grid[sqGridD.gridX - 1][sqGridD.gridY].sq !== null) {
                    //grid[sqGridA.gridX][sqGridA.gridY].sq = bl.a;
                    //grid[sqGridB.gridX][sqGridB.gridY].sq = bl.b;
                    //grid[sqGridC.gridX][sqGridC.gridY].sq = bl.c;
                    //grid[sqGridD.gridX][sqGridD.gridY].sq = bl.d;
                    //spawnNewBlock();
                } else {
                    moveBlockLeft(currentBlock);
                }
                break;
            case "right":
                // If the block tries to move into a position where one of eats blocks will touch a gridSection that is not null
                // The block will not move, have it squares moved into the grid 2d array and a new block will generate
                if (grid[sqGridA.gridX + 1][sqGridA.gridY].sq !== null || grid[sqGridB.gridX + 1][sqGridB.gridY].sq !== null ||
                    grid[sqGridC.gridX + 1][sqGridC.gridY].sq !== null || grid[sqGridD.gridX + 1][sqGridD.gridY].sq !== null) {
                    //grid[sqGridA.gridX][sqGridA.gridY].sq = bl.a;
                    //grid[sqGridB.gridX][sqGridB.gridY].sq = bl.b;
                    //grid[sqGridC.gridX][sqGridC.gridY].sq = bl.c;
                    //grid[sqGridD.gridX][sqGridD.gridY].sq = bl.d;
                    //spawnNewBlock();
                } else {
                    moveBlockRight(currentBlock);
                }
                break;
        }
    }
}

// Spawns a new block at the top of the screen
function spawnNewBlock() {
    // TODO Change spawning location per block just outside top of the screen
    var decider = Math.round(Math.random() * 6 + 1);
    switch (decider) {
        case 1:
            currentBlock = new block(new coordinate(200, -50), BLOCKS.lBlock);
            break;
        case 2:
            currentBlock = new block(new coordinate(200, -50), BLOCKS.TBlock);
            break;
        case 3:
            currentBlock = new block(new coordinate(200, -100), BLOCKS.OBlock);
            break;
        case 4:
            currentBlock = new block(new coordinate(200, -50), BLOCKS.LBlock);
            break;
        case 5:
            currentBlock = new block(new coordinate(200, -50), BLOCKS.JBlock);
            break;
        case 6:
            currentBlock = new block(new coordinate(200, -100), BLOCKS.ZBlock);
            break;
        case 7:
            currentBlock = new block(new coordinate(200, -50), BLOCKS.SBlock);
            break;
    }
    tetris();
}

// Checks the grid sections for a tetris
function tetris() {
    var count = 0; // counts the amount of blocks on a row
    for (var j = 0; j < GRID_Y; j++) {
        for (var i = 0; i < GRID_X; i++) {
            if (grid[i][j].sq !== null) { count++ };
            if (count === 10) { clearGridSectionRow(j), moveRowDown(j) };
        }
        count = 0;
    }
}

// Clears all squares from a grid section on a given y 
function clearGridSectionRow(y) {
    for (var i = 0; i < GRID_X; i++) {
        grid[i][y].sq = null;
    }
}

// All squares aboce the line that achieved a tetris will be push down
function moveRowDown(y) {
    for (var i = 0; i < GRID_X; i++) {
        for (var j = 0; j < y; j++) {
            if (grid[i][j].sq !== null) { 
                moveSquareDown(grid[i][j].sq);
                grid[i][j + 1].sq = grid[i][j].sq;
                grid[i][j].sq = null;
            }
        }
    }
}

// Drop the block by 1 square. used in seperate interval to game loop.
function blockDrop() {
    blockCollision(currentBlock, "down");
    moveBlockDown(currentBlock);
}