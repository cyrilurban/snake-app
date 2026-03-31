import { advanceGame, createGameState, setDirection } from "./snakeLogic.js";

const GRID_SIZE = 16;
const TICK_MS = 140;

const canvas = document.querySelector("#game-board");
const context = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#game-status");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createGameState({
  width: GRID_SIZE,
  height: GRID_SIZE
});

let directionQueue = state.direction;
let lastTickAt = 0;
let animationFrameId = 0;

function resetGame() {
  state = createGameState({
    width: GRID_SIZE,
    height: GRID_SIZE
  });
  directionQueue = state.direction;
  lastTickAt = 0;
  render();
}

function startGame() {
  if (state.status === "game-over") {
    resetGame();
  }

  state = {
    ...state,
    status: "running"
  };
  render();
}

function togglePause() {
  if (state.status === "running") {
    state = {
      ...state,
      status: "paused"
    };
  } else if (state.status === "paused" || state.status === "idle") {
    state = {
      ...state,
      status: "running"
    };
  }

  render();
}

function queueDirection(nextDirection) {
  directionQueue = setDirection(state.direction, nextDirection);

  if (state.status === "idle") {
    startGame();
  }
}

function handleKeydown(event) {
  const keyMap = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right"
  };

  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  const nextDirection = keyMap[event.key];

  if (!nextDirection) {
    return;
  }

  event.preventDefault();
  queueDirection(nextDirection);
}

function update(timestamp) {
  if (!lastTickAt) {
    lastTickAt = timestamp;
  }

  if (state.status === "running" && timestamp - lastTickAt >= TICK_MS) {
    state = {
      ...state,
      direction: directionQueue
    };
    state = advanceGame(state);
    lastTickAt = timestamp;
    render();
  }

  animationFrameId = window.requestAnimationFrame(update);
}

function drawCell(position, color, inset = 2) {
  const cellSize = canvas.width / state.width;
  const x = position.x * cellSize + inset;
  const y = position.y * cellSize + inset;
  const size = cellSize - inset * 2;

  context.fillStyle = color;
  context.fillRect(x, y, size, size);
}

function renderBoard() {
  const cellSize = canvas.width / state.width;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fdf9f3";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#d6cfbf";
  context.lineWidth = 1;

  for (let index = 0; index <= state.width; index += 1) {
    const offset = index * cellSize;
    context.beginPath();
    context.moveTo(offset, 0);
    context.lineTo(offset, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, offset);
    context.lineTo(canvas.width, offset);
    context.stroke();
  }

  if (state.food) {
    drawCell(state.food, "#c84b31", 5);
  }

  state.snake.forEach((segment, index) => {
    drawCell(segment, index === 0 ? "#1e4f2b" : "#2f6f3e");
  });
}

function render() {
  renderBoard();
  scoreElement.textContent = String(state.score);

  if (state.status === "idle") {
    statusElement.textContent = "Press Start or use an arrow key to begin.";
  } else if (state.status === "paused") {
    statusElement.textContent = "Paused.";
  } else if (state.status === "game-over") {
    statusElement.textContent = "Game over. Press Restart or Start to try again.";
  } else {
    statusElement.textContent = "Collect food and avoid walls or your tail.";
  }

  pauseButton.textContent = state.status === "paused" ? "Resume" : "Pause";
}

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", resetGame);

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    queueDirection(button.dataset.direction);
  });
});

window.addEventListener("keydown", handleKeydown);

render();
animationFrameId = window.requestAnimationFrame(update);

window.addEventListener("beforeunload", () => {
  window.cancelAnimationFrame(animationFrameId);
});
