import { type ReactNode, type CSSProperties, useRef } from 'react';
import './GameGrid.css';

interface GameGridProps {
  rows: number;
  cols: number;
  onCellClick: (row: number, col: number, dragStartIndex: {row: number, col: number} | null) => void;
  onCellDoubleClick: (row: number, col: number) => void;
  renderCell: (
    row: number,
    col: number,
    index: number,
  ) => ReactNode;
  getCellColor?: (row: number, col: number) => string;
}

export default function GameGrid({
  rows,
  cols,
  onCellClick,
  onCellDoubleClick,
  renderCell,
  getCellColor,
}: GameGridProps) {

  const handledTiles = useRef(new Array<string>());

  function handleTileOnce(row: number, col: number) {
    const tileId = `${row}_${col}`;
    if (handledTiles.current.find(tId => tId === tileId)) return;

    handledTiles.current.push(tileId);
    onCellClick(row, col, getFirstDragIndex());
  }

  function getFirstDragIndex(): {row: number, col: number } | null {
    if (handledTiles.current.length < 2) {
      return null;
    }

    const parsed = handledTiles.current[0]?.split('_').map(strVal => parseInt(strVal));
    if (!parsed || parsed.length !== 2) {
      return null;
    }

    return {
      row: parsed[0],
      col: parsed[1]
    }
  }

  const gridStyle = {
    '--grid-cols': cols,
    '--grid-rows': rows,
  } as CSSProperties;

  return (
     <div
       className={`game-grid`}
       style={gridStyle}
       role="group"
       aria-label="Game board"
     >
       {Array.from({ length: rows * cols }, (_, index) => {
         const row = Math.floor(index / cols);
         const col = index % cols;
         const color = getCellColor?.(row, col);

         return (
           <button
             key={index}
             type="button"
             className="game-grid__cell"
             style={color ? { backgroundColor: color } : undefined}
             onDoubleClick={() => onCellDoubleClick(row, col)}
             onPointerEnter={(e) => {
              if (e.buttons === 1) {
                handleTileOnce(row, col);
               }
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              handleTileOnce(row, col);
             }}
            onPointerUp={() => {
              handledTiles.current = [];
            }}
           >
             {renderCell(row, col, index)}
           </button>
         );
       })}
     </div>
   );
}
