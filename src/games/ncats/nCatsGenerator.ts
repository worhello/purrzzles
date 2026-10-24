import { canPlaceCat } from "./nCatsEngine";
import type { Cell, Game } from "./nCatsTypes";

type GeneratedGameCells = {
  size: number,
  positions: number[],
  regionByCell: number[],
};

export function generateNewGame(squareSize: number): Game {

  const gameCells = generateGameCells(squareSize);

  if (!gameCells) {
    throw new Error("Game could not be generated...");
  }

  return {
    cells: mapGameCells(gameCells),
    status: {
      gameState: 'in-progress',
      wrongAttemptsLeft: 3,
      squareSize: squareSize
    }
  };
}

function mapGameCells({
  size,
  positions,
  regionByCell,
}: GeneratedGameCells): Cell[] {
  const regionColors = [
    '#C65D0B', // Burnt orange
    '#4F772D', // Olive green
    '#315A7D', // Steel blue
    '#C44536', // Brick red
    '#7651A8', // Deep purple
    '#147D64', // Forest teal
    '#D4A017', // Mustard yellow
    '#5359A6', // Indigo
    '#AD5269', // Dusty rose
    '#168AAD', // Deep cyan
  ];

  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const col = index % size;

    const isCat = positions[row] === col;
    const region = regionByCell[index];

    return {
      value: isCat ? 'cat' : 'empty',
      userValue: 'empty',
      color: regionColors[region % regionColors.length],
    };
  });
}

function generateGameCells(size: number): GeneratedGameCells | undefined {
  const maxAttempts = 100000;
  console.log("starting generation...");

  for (let i = 0; i < maxAttempts; i++) {
    const positions = generateCatPositions(size);

    if (hasDiagonalTouches(positions)) {
      continue;
    }

    const regionByCell = generateRegions(size, positions);

    const solutions = countSolutions(size, regionByCell, 2)
    if (solutions.length !== 1) {
      continue;
    }

    const originalIsValid = positions.every(
      (col, row) => regionByCell[row * size + col] === row
    );

    console.log({
      attempt: i + 1,
      positions,
      originalIsValid,
      solutions,
    });
    if (solutions.length === 1 &&
        solutions[0].every((col, row) => col === positions[row])) {
      return {
        size,
        positions,
        regionByCell,
      };
    }
  }
}

function hasDiagonalTouches(positions: number[]): boolean {
  for (let row = 1; row < positions.length; row++) {
    if (
      Math.abs(positions[row] - positions[row - 1]) === 1
    ) {
      return true;
    }
  }

  return false;
}


function generateCatPositions(
  size: number,
  random: () => number = Math.random,
): number[] {
  const columns = Array.from(
    { length: size },
    (_, col) => col,
  );

  // Fisher-Yates shuffle
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [columns[i], columns[j]] = [
      columns[j],
      columns[i],
    ];
  }

  // Index = row, value = column
  return columns;
}

export function generateRegions(
  size: number,
  positions: number[],
  random: () => number = Math.random
): number[] {
  // -1 means the cell has not been assigned a region.
  const regionByCell = Array(size * size).fill(-1);

  // Seed one region at each cat.
  // Region ID = row containing its cat.
  positions.forEach((col, row) => {
    regionByCell[row * size + col] = row;
  });

  // Grow the regions until every cell is assigned.
  while (regionByCell.some(region => region === -1)) {
    const frontier: {
      index: number;
      regions: number[];
    }[] = [];

    for (let index = 0; index < size * size; index++) {
      if (regionByCell[index] !== -1) continue;

      const row = Math.floor(index / size);
      const col = index % size;

      // Find adjacent cells, using orthogonal adjacency only.
      const neighbours = [
        ...(row > 0 ? [index - size] : []),
        ...(row < size - 1 ? [index + size] : []),
        ...(col > 0 ? [index - 1] : []),
        ...(col < size - 1 ? [index + 1] : []),
      ];

      const adjacentRegions = [
        ...new Set(
          neighbours
            .map(i => regionByCell[i])
            .filter(region => region !== -1),
        ),
      ];

      if (adjacentRegions.length > 0) {
        frontier.push({
          index,
          regions: adjacentRegions,
        });
      }
    }

    // There should always be a frontier for a non-empty,
    // partially assigned rectangular grid.
    if (frontier.length === 0) {
      throw new Error('Unable to grow regions');
    }

    // Randomly choose a cell on the frontier.
    const candidate =
      frontier[Math.floor(random() * frontier.length)];

    // Assign it to one of its neighbouring regions.
    const region =
      candidate.regions[
        Math.floor(random() * candidate.regions.length)
      ];

    regionByCell[candidate.index] = region;
  }

  return regionByCell;
}


function countSolutions(
  size: number,
  regionByCell: number[],
  maxSolutions = 2,
): number[][] {
  const solutions: number[][] = [];
  const positions: number[] = [];

  const getRegion = (row: number, col: number) =>
    regionByCell[row * size + col];

  function search(row: number): void {
    if (solutions.length >= maxSolutions) return;

    if (row === size) {
      solutions.push([...positions]);
      return;
    }

    for (let col = 0; col < size; col++) {
      if (!canPlaceCat(getRegion, row, col, positions)) {
        continue;
      }

      positions.push(col);
      search(row + 1);
      positions.pop();

      if (solutions.length >= maxSolutions) return;
    }
  }

  search(0);
  return solutions;
}

function measureGeneration(size: number, samples: number) {
  let unique = 0;
  let multiple = 0;
  let noSolutions = 0;
  let diagonalConflicts = 0;

  for (let i = 0; i < samples; i++) {
    const positions = generateCatPositions(size);

    // Skip cat arrangements that violate the diagonal rule.
    if (hasDiagonalTouches(positions)) {
      diagonalConflicts++;
      i--; // Retry so we still measure `samples` valid arrangements.
      continue;
    }

    const regions = generateRegions(size, positions);
    const solutions = countSolutions(size, regions, 2);

    if (solutions.length === 0) {
      noSolutions++;
    } else if (solutions.length === 1) {
      unique++;
    } else {
      multiple++;
    }
  }

  return {
    size,
    samples,
    unique,
    multiple,
    noSolutions,
    diagonalConflicts,
    uniqueRate: `${(unique / samples * 100).toFixed(2)}%`,
  };
}

console.log(measureGeneration(7, 1000));
