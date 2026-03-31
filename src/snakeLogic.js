export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function createGameState({
  width = 16,
  height = 16,
  snake = [
    { x: 6, y: 8 },
    { x: 5, y: 8 },
    { x: 4, y: 8 }
  ],
  direction = "right",
  food = null,
  foodSeed = 0,
  score = 0,
  status = "idle"
} = {}) {
  const nextFood =
    food ?? getNextFoodPosition(width, height, snake, foodSeed).position;

  return {
    width,
    height,
    snake,
    direction,
    food: nextFood,
    foodSeed,
    score,
    status
  };
}

export function setDirection(currentDirection, requestedDirection) {
  if (!DIRECTIONS[requestedDirection]) {
    return currentDirection;
  }

  if (OPPOSITE_DIRECTIONS[currentDirection] === requestedDirection) {
    return currentDirection;
  }

  return requestedDirection;
}

export function advanceGame(state) {
  if (state.status === "game-over") {
    return state;
  }

  const vector = DIRECTIONS[state.direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y
  };

  const ateFood = state.food && positionsEqual(nextHead, state.food);
  const nextSnake = ateFood
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)];

  if (hitsBoundary(nextHead, state.width, state.height) || hitsSnake(nextHead, nextSnake.slice(1))) {
    return {
      ...state,
      snake: nextSnake,
      status: "game-over"
    };
  }

  if (!ateFood) {
    return {
      ...state,
      snake: nextSnake,
      status: "running"
    };
  }

  const nextSeed = state.foodSeed + 1;
  const foodResult = getNextFoodPosition(state.width, state.height, nextSnake, nextSeed);

  return {
    ...state,
    snake: nextSnake,
    food: foodResult.position,
    foodSeed: nextSeed,
    score: state.score + 1,
    status: foodResult.position ? "running" : "game-over"
  };
}

export function getNextFoodPosition(width, height, snake, startIndex = 0) {
  const totalCells = width * height;
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));

  for (let offset = 0; offset < totalCells; offset += 1) {
    const index = (startIndex + offset) % totalCells;
    const x = index % width;
    const y = Math.floor(index / width);
    const key = `${x},${y}`;

    if (!occupied.has(key)) {
      return {
        position: { x, y },
        seed: index
      };
    }
  }

  return {
    position: null,
    seed: startIndex
  };
}

export function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function hitsBoundary(position, width, height) {
  return position.x < 0 || position.y < 0 || position.x >= width || position.y >= height;
}

export function hitsSnake(position, snake) {
  return snake.some((segment) => positionsEqual(segment, position));
}
