class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.colors = [
            '#000000', // 0: empty
            '#FF0000', // 1: I piece
            '#00FF00', // 2: O piece
            '#0000FF', // 3: T piece
            '#FFFF00', // 4: S piece
            '#FF00FF', // 5: Z piece
            '#00FFFF', // 6: J piece
            '#FFA500'  // 7: L piece
        ];
        
        this.pieces = [
            [], // 0: empty
            [   // 1: I piece
                [0,0,0,0],
                [1,1,1,1],
                [0,0,0,0],
                [0,0,0,0]
            ],
            [   // 2: O piece
                [2,2],
                [2,2]
            ],
            [   // 3: T piece
                [0,3,0],
                [3,3,3],
                [0,0,0]
            ],
            [   // 4: S piece
                [0,4,4],
                [4,4,0],
                [0,0,0]
            ],
            [   // 5: Z piece
                [5,5,0],
                [0,5,5],
                [0,0,0]
            ],
            [   // 6: J piece
                [6,0,0],
                [6,6,6],
                [0,0,0]
            ],
            [   // 7: L piece
                [0,0,7],
                [7,7,7],
                [0,0,0]
            ]
        ];
        
        this.initGame();
    }
    
    createBoard() {
        return Array(this.BOARD_HEIGHT).fill(0).map(() => Array(this.BOARD_WIDTH).fill(0));
    }
    
    createPiece() {
        const pieceType = Math.floor(Math.random() * 7) + 1;
        return {
            type: pieceType,
            shape: this.pieces[pieceType],
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.pieces[pieceType][0].length / 2),
            y: 0
        };
    }
    
    initGame() {
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        this.setupControls();
        this.gameLoop();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case 'Space':
                    this.hardDrop();
                    break;
            }
        });
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
        } else if (dy > 0) {
            this.placePiece();
        }
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        if (this.isValidPosition(rotated, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = rotated;
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill(0).map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    hardDrop() {
        if (!this.currentPiece) return;
        
        while (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
        }
        this.placePiece();
    }
    
    isValidPosition(shape, x, y) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const boardX = x + col;
                    const boardY = y + row;
                    
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || 
                        boardY >= this.BOARD_HEIGHT ||
                        (boardY >= 0 && this.board[boardY][boardX] !== 0)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        if (!this.currentPiece) return;
        
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col] !== 0) {
                    const boardY = this.currentPiece.y + row;
                    const boardX = this.currentPiece.x + col;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.type;
                    }
                }
            }
        }
        
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                row++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.lines;
    }
    
    gameOver() {
        alert('ゲームオーバー！\nスコア: ' + this.score);
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = 1000;
        this.updateDisplay();
        this.initGame();
    }
    
    draw() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBoard();
        this.drawCurrentPiece();
    }
    
    drawBoard() {
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                if (this.board[row][col] !== 0) {
                    this.ctx.fillStyle = this.colors[this.board[row][col]];
                    this.ctx.fillRect(
                        col * this.BLOCK_SIZE,
                        row * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    );
                    
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(
                        col * this.BLOCK_SIZE,
                        row * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    );
                }
            }
        }
    }
    
    drawCurrentPiece() {
        if (!this.currentPiece) return;
        
        this.ctx.fillStyle = this.colors[this.currentPiece.type];
        
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col] !== 0) {
                    const x = (this.currentPiece.x + col) * this.BLOCK_SIZE;
                    const y = (this.currentPiece.y + row) * this.BLOCK_SIZE;
                    
                    this.ctx.fillRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }
    }
    
    update(deltaTime) {
        this.dropTime += deltaTime;
        
        if (this.dropTime >= this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = 0;
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - (this.lastTime || 0);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

new Tetris();