import test from "node:test";
import assert from "node:assert/strict";

import {
  advanceGame,
  createGameState,
  getNextFoodPosition,
  setDirection
} from "../src/snakeLogic.js";

test("snake moves one cell in the current direction", () => {
  const state = createGameState({
    width: 8,
    height: 8,
    snake: [
      { x: 3, y: 4 },
      { x: 2, y: 4 },
      { x: 1, y: 4 }
    ],
    direction: "right",
    food: { x: 7, y: 7 },
    status: "running"
  });

  const nextState = advanceGame(state);

  assert.deepEqual(nextState.snake, [
    { x: 4, y: 4 },
    { x: 3, y: 4 },
    { x: 2, y: 4 }
  ]);
  assert.equal(nextState.score, 0);
});

test("snake grows and increments score after eating food", () => {
  const state = createGameState({
    width: 8,
    height: 8,
    snake: [
      { x: 3, y: 4 },
      { x: 2, y: 4 },
      { x: 1, y: 4 }
    ],
    direction: "right",
    food: { x: 4, y: 4 },
    foodSeed: 5,
    status: "running"
  });

  const nextState = advanceGame(state);

  assert.deepEqual(nextState.snake, [
    { x: 4, y: 4 },
    { x: 3, y: 4 },
    { x: 2, y: 4 },
    { x: 1, y: 4 }
  ]);
  assert.equal(nextState.score, 1);
  assert.notDeepEqual(nextState.food, { x: 4, y: 4 });
});

test("wall collisions end the game", () => {
  const state = createGameState({
    width: 4,
    height: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 }
    ],
    direction: "right",
    food: { x: 0, y: 0 },
    status: "running"
  });

  const nextState = advanceGame(state);

  assert.equal(nextState.status, "game-over");
});

test("self collisions end the game", () => {
  const state = createGameState({
    width: 6,
    height: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    direction: "down",
    food: { x: 5, y: 5 },
    status: "running"
  });

  const nextState = advanceGame(state);

  assert.equal(nextState.status, "game-over");
});

test("food placement scans deterministically for the next open cell", () => {
  const result = getNextFoodPosition(
    3,
    3,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 }
    ],
    0
  );

  assert.deepEqual(result.position, { x: 1, y: 1 });
});

test("reverse direction requests are ignored", () => {
  assert.equal(setDirection("left", "right"), "left");
  assert.equal(setDirection("up", "left"), "left");
});
