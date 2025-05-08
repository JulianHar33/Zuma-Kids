// Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreBoard = document.getElementById('scoreBoard');
const menuOverlay = document.getElementById('menuOverlay');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');

// Images
const frogImage = new Image();
frogImage.src = 'frog.png';

const backgroundImage = new Image();
backgroundImage.src = 'background.png';

// Game Variables
let gameRunning = false;
let score = 0;
let level = 1;
let lives = 3;
let easyMode = true;

const colors = ['red', 'blue', 'green', 'yellow', 'purple'];

let shooter = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  angle: Math.PI / 2
};

let balls = [];
let ballSpeed = easyMode ? 0.5 : 1.5;
let pendulumAngle = 0;

let currentShot = null;
let shotSpeed = easyMode ? 5 : 8;
let nextBallColor = colors[Math.floor(Math.random() * colors.length)];

// Initialize Game
backgroundImage.onload = function () {
  menuOverlay.style.display = 'flex'; // Show menu overlay when the background loads
};

// Spawn Balls
function spawnBalls() {
  balls = [];
  for (let i = 0; i < level; i++) {
    balls.push({
      x: 250 + i * 50,
      y: 250,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: 0
    });
  }
}

// Move Balls
function moveBalls() {
  for (let ball of balls) {
    ball.x += Math.sin(pendulumAngle) * ballSpeed;
  }

  const firstBall = balls[0];
  const lastBall = balls[balls.length - 1];

  if ((firstBall && firstBall.x <= 0) || (lastBall && lastBall.x >= canvas.width)) {
    pendulumAngle += Math.PI;

    for (let ball of balls) {
      ball.y += 35;
    }

    if (balls[0].y > canvas.height - 100) {
      gameOver();
    }
  }
}

// Draw Balls
function drawBalls() {
  for (let ball of balls) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, easyMode ? 25 : 15, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
  }
}

// Draw Shooter
function drawShooter() {
  const shooterSize = 80;
  ctx.save();
  ctx.translate(shooter.x, shooter.y);
  ctx.rotate(shooter.angle);
  ctx.drawImage(frogImage, -shooterSize / 2, -shooterSize / 2, shooterSize, shooterSize);
  ctx.restore();

  if (!currentShot) {
    const offsetX = 40 * Math.cos(shooter.angle);
    const offsetY = 40 * Math.sin(shooter.angle);
    ctx.beginPath();
    ctx.arc(shooter.x + offsetX, shooter.y + offsetY - 30, easyMode ? 25 : 15, 0, Math.PI * 2);
    ctx.fillStyle = nextBallColor;
    ctx.fill();
  }
}

// Draw Shot Ball
function drawShotBall() {
  if (currentShot) {
    ctx.beginPath();
    ctx.arc(currentShot.x, currentShot.y, easyMode ? 25 : 15, 0, Math.PI * 2);
    ctx.fillStyle = currentShot.color;
    ctx.fill();
  }
}

// Move Shot Ball
function moveShotBall() {
  if (currentShot) {
    currentShot.x += currentShot.dx * shotSpeed;
    currentShot.y += currentShot.dy * shotSpeed;

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      const dx = currentShot.x - b.x;
      const dy = currentShot.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 20) {
        if (currentShot.color !== b.color) {
          lives -= 1;
          if (lives <= 0) {
            gameOver();
          } else {
            currentShot = null;
          }
        } else {
          balls.splice(i, 1);
          score += 10;

          if (balls.length === 0) {
            level++;
            spawnBalls();
          }

          currentShot = null;
        }
        break;
      }
    }

    if (currentShot && (currentShot.x < 0 || currentShot.x > canvas.width || currentShot.y < 0 || currentShot.y > canvas.height)) {
      currentShot = null;
    }
  }
}

// Shoot Ball
function shootBall() {
  if (!currentShot) {
    const angle = shooter.angle;
    currentShot = {
      x: shooter.x + 40 * Math.cos(angle),
      y: shooter.y + 40 * Math.sin(angle),
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      color: nextBallColor
    };

    nextBallColor = colors[Math.floor(Math.random() * colors.length)];
  }
}

// Game Over
function gameOver() {
  gameRunning = false;
  finalScore.textContent = score;
  gameOverScreen.style.display = 'flex';
}

// Restart Game
function restartGame() {
  gameOverScreen.style.display = 'none';
  startGame();
}

// Update Game
function update() {
  pendulumAngle += 0.01;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    moveBalls();
    drawShooter();
    drawBalls();
    moveShotBall();
    drawShotBall();
    scoreBoard.textContent = `Score: ${score} | Level: ${level} | Lives: ${lives}`;
  }
  requestAnimationFrame(update);
}

// Start Game
function startGame() {
  gameRunning = true;
  score = 0;
  level = 1;
  lives = 3;
  currentShot = null;
  spawnBalls();
  menuOverlay.style.display = 'none';
  gameOverScreen.style.display = 'none';
  update();
}

// Event Listeners
canvas.addEventListener('mousemove', function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  shooter.angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
});

canvas.addEventListener('click', function () {
  if (gameRunning) shootBall();
});

document.addEventListener('keydown', function (event) {
  if (event.code === 'Space') {
    if (!gameRunning) startGame();
    else shootBall();
  }
});
