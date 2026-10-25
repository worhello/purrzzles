import { type ReactNode, type CSSProperties, useRef } from 'react';
import './GameGrid.css';

interface GameGridProps {
  rows: number;
  cols: number;
  onCellClick: (row: number, col: number) => void;
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

  const handledTiles = useRef(new Set<string>());

  function handleTileOnce(row: number, col: number) {
    const tileId = `${row}_${col}`;
    if (handledTiles.current.has(tileId)) return;

    handledTiles.current.add(tileId);
    onCellClick(row, col);
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
              handledTiles.current.clear();
            }}
           >
             {renderCell(row, col, index)}
           </button>
         );
       })}
     </div>
   );
}
