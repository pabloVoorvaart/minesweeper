

class Cell {

    constructor(posX, posY, size) {
        this.posX = posX;
        this.posY = posY;
        this.size = size;
        this.clicked = false;
        this.bomb = false;
        this.flagged = false;
        this.bombCounter = 0;
    }

    drawCell() {
        rect(this.posX * this.size, this.posY * this.size, this.size, this.size);
    }

    setAsBomb() {
        this.bomb = true;
        //fill(0);
        //this.drawCell();
    }

    setAsNotBomb() {
        this.bomb = false;
    }

    setCounterColor() {
        if (this.bomb) {
            fill(0);
        }
        else if (this.bombCounter == 1) {
            fill(color('green'))
        } else if (this.bombCounter == 2) {
            fill(color('yellow'))
        } else if (this.bombCounter == 3) {
            fill(color('orange'))
        } else if (this.bombCounter == 4) {
            fill(color('purple'))
        } else if (this.bombCounter == 5) {
            fill(color('brown'))
        } else {
            fill(color('gray'))
        }
        this.drawCell();
    }

    increaseBombCounter() {
        if (!this.bomb) {
            this.bombCounter++;
     
        }
    }

    flag() {
        this.flagged = !this.flagged;
        this.clicked = !this.clicked;
        if (this.flagged) {
            fill(color('pink'));
            this.drawCell();
        } else {
            fill(color('white'));
            this.drawCell();
        }
    }

    reveal() {
        this.clicked = true;
        if (this.bomb) {
            fill(color('red'))
            this.drawCell();
        } else {
            this.setCounterColor();
        }
    }
}


class Board {

    constructor(width, height, cellDimension, bombRatio) {
        this.bombRatio = bombRatio;
        this.cellDimension = cellDimension;
        this.width = Math.floor(width / cellDimension) * cellDimension;
        this.height = Math.floor(height / cellDimension) * cellDimension;
        this.cols = this.width / this.cellDimension;
        this.rows = this.height / this.cellDimension;

        createCanvas(this.width, this.height);
        background(100);
    }

    drawCells() {
        this.cells = [];
        for (let i = 0; i < this.cols; i++) {
            this.cells[i] = [];
            for (let j = 0; j < this.rows; j++) {
                this.cells[i][j] = new Cell(i, j, this.cellDimension);
                this.cells[i][j].drawCell();
            }
        }
    }

    calculateBombs() {
        this.bombs = [];
        this.maxBombs = (this.cols * this.rows) / this.bombRatio;
        let i = 0;
        while (i < this.maxBombs) {
            let x = Math.floor(Math.random() * this.cols);
            let y = Math.floor(Math.random() * this.rows);
            if (this.cells[x][y].bomb == false) {
                this.bombs.push(this.cells[x][y]);
                this.cells[x][y].setAsBomb();
                i++;
            }
        }
        return this.bombs;
    }

    calculateNoBombs() {
        for (let i = 0; i < this.bombs.length; i++) {
            let x = this.bombs[i].posX;
            let y = this.bombs[i].posY;

            var xInit = x - 1
            var yInit = y - 1
            for (let y = yInit; y < yInit + 3; y++) {
                for (let x = xInit; x < xInit + 3; x++) {
                    if ((x >= 0 && x < this.cols) && (y >= 0 && y < this.rows)) {
                        this.cells[x][y].increaseBombCounter()
                    }
                }
            }
        }
    }

    showSolvedBoard() {
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                this.cells[i][j].setCounterColor();
            }
        }
    }
}


class Game {

    gameOver = false;
    flaggedArray = []
    bombsArray = []

    constructor(type="expert") { 
        
        switch(type) {
            case "expert":
                this.board = new Board(1500, 950, 50, 6);
                break
            case "medium":
                this.board = new Board(1000, 700, 50, 10);
                break
            case "easy":
                this.board = new Board(500, 500, 50, 15);
                break
            default:
                this.board = new Board(1500, 950, 50, 4);
        }

        this.board.drawCells();
        this.bombsArray = this.board.calculateBombs();
        this.maxFlags = this.bombsArray.length;
        this.board.calculateNoBombs();
    }

    calculateReveal(x, y) {
        console.log(x, y)
        //base case
        if (this.board.cells[x][y].clicked) {
            return
        }
        if (this.board.cells[x][y].bomb) {
            this.lost();
            return;
        }
        this.board.cells[x][y].reveal();
        if (this.board.cells[x][y].bombCounter > 0){
            return
        }

        // Start looking top left corner
        var xInit = x - 1
        var yInit = y - 1
        //iterate all cells surrounding target cell
        for (let y = yInit; y < yInit + 3; y++) {
            for (let x = xInit; x < xInit + 3; x++) {
                if ((x >= 0 && x < this.board.cols) && (y >= 0 && y < this.board.rows)) {
                    if (this.board.cells[x][y].bombCounter == 0 && !this.board.cells[x][y].clicked) {
                        this.calculateReveal(x, y)
                    } else {
                        this.board.cells[x][y].reveal();
                    }
                }
            }
        }
    }

    leftCick(xCoord, yCoord) {
    
        if(this.board.width < xCoord || this.board.height < yCoord) {
            return
        }
        if( this.gameOver ) { return }
        this.calculateReveal(Math.floor(xCoord / this.board.cellDimension), Math.floor(yCoord / this.board.cellDimension))
    }

    rightClick(xCoord, yCoord) {
        if(this.board.width < xCoord || this.board.height < yCoord) {
            return
        }
        let cell = this.board.cells[Math.floor(xCoord / this.board.cellDimension)][Math.floor(yCoord / this.board.cellDimension)]
        cell.flag();
        if(cell.flagged) {
            this.flaggedArray.push(cell)
        }else {
            this.flaggedArray.splice(this.flaggedArray.indexOf(cell), 1)
        }
        console.log(this.flaggedArray)

        if(this.flaggedArray.length == this.bombsArray.length) {
            this.calculateVictory();
        }
    }

    calculateVictory() {
        let count = 0
        for (let i = 0; i < this.flaggedArray.length; i++) {
            if (this.flaggedArray[i].bomb) {
                count++
            }
        }
        if (count == this.bombsArray.length) {
            this.won()
        }
    }

    won() {
        this.gameOver = true;
        fill(color('pink'));
        textSize(50);
        text("You Won!", this.board.width / 3  , this.board.height / 2);
    }
    
    lost() {
        this.gameOver = true;
        this.board.showSolvedBoard()
        fill(color('red'));
        textSize(50);
        text("You lost!", this.board.width / 3  , this.board.height / 2);
        
    }
}

document.addEventListener('contextmenu', event => event.preventDefault()); 
let game;
function setup() {
    game = new Game();
    expert = createButton('Expert Mode');
    medium = createButton('Medium Mode');
    easy = createButton('Easy Mode');
    expert.mousePressed(() => { game = new Game("expert")} );
    medium.mousePressed(() => { game = new Game("medium")} );
    ea.mousePressed(() => { game = new Game("easy")} );
    //gam = new Game();
    //game.board.showSolvedBoard();
}

function mousePressed(event) {
    if(event.button === 2){ 
        game.rightClick(mouseX, mouseY)
    } else { 
        game.leftCick(mouseX, mouseY)
    }
}
