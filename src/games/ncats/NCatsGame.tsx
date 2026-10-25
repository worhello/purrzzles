import { useState } from 'react';
import GameGrid from "../../components/GameGrid";
import { getLatestLevelCompleted, saveLatestLevelCompleted } from '../../services/storage';
import { evaluateCellDoubleClick } from './nCatsEngine';
import { generateNewGame } from './nCatsGenerator';


function getSquareSizeFromLatestLevel(level: number) {
  const gridSquares = [7, 7, 7, 7, 7, 8, 8, 9, 9, 10];

  return gridSquares[(level - 1) % 10];
}

export function NCatsGame() {

  const currentLevel = (getLatestLevelCompleted() ?? 0) + 1;
  const squareSize = getSquareSizeFromLatestLevel(currentLevel);
  const { cells: initialCells, status: initialStatus } = generateNewGame(squareSize)

  const [cells, setCells] = useState(initialCells);
  const [status, setStatus] = useState(initialStatus);
  const [showNewGameButton, setShowNewGameButton] = useState(false);

  function handleCellClick(row: number, col: number, dragStartIndex: {row: number, col: number} | null) {
    const index = row * squareSize + col;

    setCells(current =>
      current.map((cell, i) => {
        if (i !== index || cell.userValue === 'cat') {
          return cell;
        }

        const updated = { ...cell };


        if (dragStartIndex) {
          updated.userValue = current[dragStartIndex.row * squareSize + dragStartIndex.col]!.userValue;
        } else if (cell.userValue === 'empty') {
          updated.userValue = 'blocked';
        } else {
          updated.userValue = 'empty';
        }

        return updated;
      }),
    );
  }

  function handleCellDoubleClick(row: number, col: number) {
    const result = evaluateCellDoubleClick({cells, status}, row, col);

    setCells(result.cells);
    setStatus(result.status);

    if (result.status.gameState !== 'in-progress') {
      saveLatestLevelCompleted(currentLevel);
      setShowNewGameButton(true);
    }

  }

  function handleNewGame() {
    setShowNewGameButton(false);

    window.location.reload();
  }

  function handleCloseModal() {
    setShowNewGameButton(false);
  }

  return (
    <div className="game-container">
      <span>Current level: {currentLevel}</span>
      <GameGrid
        rows={squareSize}
        cols={squareSize}
        onCellClick={handleCellClick}
        onCellDoubleClick={handleCellDoubleClick}
        renderCell={(_row, _col, index) => {
          const cell = cells[index];

          if (cell.userValue === 'cat') return '🐈';
          if (cell.userValue === 'blocked') return '×';
          if (cell.userValue === 'error') return '×';
          return null;
        }}
        getCellColor={(_row, _col) => {
          const index = _row * squareSize + _col;
          const cell = cells[index];
          return cell.color;
        }} />

      {showNewGameButton && (
        <div className="modal-overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-game-title"
          >
            <h2 id="new-game-title">{status.gameState === 'won' ? "You've won!" : "Better luck next time..."}</h2>
            <p>Would you like to play a new game?</p>

            <div className="modal-actions">
              <button onClick={handleNewGame}>
                New Game
              </button>
              <button onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
        )
      }
    </div>
  )
}
