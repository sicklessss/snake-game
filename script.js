const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');

// Game Settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 100; // ms

let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

let snake = [];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let gameLoop;
let isGameRunning = false;

// Initialize
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    score = 0;
    dx = 1;
    dy = 0;
    scoreElement.textContent = score;
    spawnFood();
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Don't spawn on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        spawnFood();
    }
}

function draw() {
    // Clear screen
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = '#FF5252';
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#FF5252";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#4CAF50'; // Head
        } else {
            ctx.fillStyle = '#388E3C'; // Body
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function move() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall Collision (Wrap around or Die? Let's die for classic feel)
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Self Collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check Food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        spawnFood();
        // Speed up slightly
        clearInterval(gameLoop);
        speed = Math.max(50, 100 - Math.floor(score / 50));
        gameLoop = setInterval(update, speed);
    } else {
        snake.pop();
    }
}

function update() {
    move();
    draw();
}

function gameOver() {
    clearInterval(gameLoop);
    isGameRunning = false;
    alert(`Game Over! Score: ${score}`);
    startBtn.style.display = 'inline-block';
}

function startGame() {
    if (isGameRunning) return;
    initGame();
    isGameRunning = true;
    startBtn.style.display = 'none';
    clearInterval(gameLoop);
    gameLoop = setInterval(update, speed);
}

// Input Handling
document.addEventListener('keydown', (e) => {
    // Prevent scrolling
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    
    changeDirection(e.code);
});

// Mobile Controls
document.querySelectorAll('.d-btn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // prevent mouse emulation
        changeDirection(btn.dataset.dir);
    });
    btn.addEventListener('click', (e) => {
        changeDirection(btn.dataset.dir);
    });
});

function changeDirection(key) {
    if (!isGameRunning) return;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if ((key === 'ArrowLeft' || key === 'KeyA') && !goingRight) {
        dx = -1; dy = 0;
    }
    if ((key === 'ArrowUp' || key === 'KeyW') && !goingDown) {
        dx = 0; dy = -1;
    }
    if ((key === 'ArrowRight' || key === 'KeyD') && !goingLeft) {
        dx = 1; dy = 0;
    }
    if ((key === 'ArrowDown' || key === 'KeyS') && !goingUp) {
        dx = 0; dy = 1;
    }
}

startBtn.addEventListener('click', startGame);

// Initial Draw
draw();
