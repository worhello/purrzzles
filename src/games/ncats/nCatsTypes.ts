export type CellType = 'empty' | 'blocked' | 'error' | 'cat';

export type Cell = {
  value: CellType,
  userValue: CellType,
  color: string
}

export type GameState = 'won' | 'lost' | 'in-progress';

export type Status = {
  gameState: GameState
  wrongAttemptsLeft: number,
  squareSize: number
}

export type CellActionResult = {
  cell: Cell,
  status: Status
}

export type Game = {
  cells: Cell[],
  status: Status
}
