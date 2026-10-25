import type { Game } from "./nCatsTypes";


export function evaluateCellDoubleClick(
  currentGame: Game,
  row: number,
  col: number
): Game {
  const size = currentGame.status.squareSize;
  const index = row * size + col;

  const resultCells = [...currentGame.cells];
  const cellToEvaluate = resultCells[index];

  // Ignore clicks on cells that have already been marked correctly as cats
  if (cellToEvaluate.value === 'cat' && cellToEvaluate.userValue === 'cat') {
    return {
      cells: resultCells,
      status: currentGame.status,
    };
  }

  const validation = validateMove(
    currentGame,
    row,
    col
  );

  if (!validation.valid) {
    const wrongAttemptsLeft = Math.max(
      0,
      currentGame.status.wrongAttemptsLeft - 1,
    );

    resultCells[index] = {
      ...cellToEvaluate,
      userValue: 'error',
    };

    return {
      cells: resultCells,
      status: {
        ...currentGame.status,
        wrongAttemptsLeft,
        gameState:
          wrongAttemptsLeft === 0
            ? 'lost'
            : currentGame.status.gameState,
      },
    };
  }

  resultCells[index] = {
    ...cellToEvaluate,
    userValue: 'cat',
  };

  const allCatsFound = resultCells.filter(cell => cell.value === 'cat').every(cell => cell.value === cell.userValue);

  return {
    cells: resultCells,
    status: {
      ...currentGame.status,
      ...(allCatsFound && { gameState: 'won' }),
    }
  };
}

type MoveValidation = {
  valid: boolean;
  reason?: string;
};

function validateMove(
  game: Game,
  row: number,
  col: number,
): MoveValidation {
  const size = game.status.squareSize;
  const index = row * size + col;
  const targetCell = game.cells[index];

  if (!targetCell || targetCell.value === 'blocked') {
    return { valid: false, reason: 'Invalid cell.' };
  }

  const positions = Array.from({ length: size }, (_, r) =>
    game.cells
      .slice(r * size, (r + 1) * size)
      .findIndex(cell => cell.userValue === 'cat')
  );

  if (positions[row] !== -1) {
    return {
      valid: false,
      reason: 'This row already contains a cat.',
    };
  }

  const getRegion = (r: number, c: number) =>
    game.cells[r * size + c].color;

  if (!canPlaceCat(getRegion, row, col, positions)) {
    return {
      valid: false,
      reason: 'This move violates a cat placement rule.',
    };
  }

  return { valid: true };
}

export function canPlaceCat(
  getRegion: (row: number, col: number) => number | string,
  row: number,
  col: number,
  positions: number[],
): boolean {
  const region = getRegion(row, col);

  for (let otherRow = 0; otherRow < positions.length; otherRow++) {
    const otherCol = positions[otherRow];

    if (otherCol === -1) continue;

    // One cat per column.
    if (otherCol === col) return false;

    // One cat per region.
    if (getRegion(otherRow, otherCol) === region) return false;

    // Cats cannot touch diagonally.
    if (
      Math.abs(otherRow - row) === 1 &&
      Math.abs(otherCol - col) === 1
    ) {
      return false;
    }
  }

  return true;
}
