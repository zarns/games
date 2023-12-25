// app/pathfinder/Grid.tsx

'use client'
import React, { useState } from 'react';


const Grid = () => {
  const numRows = 20;
  const numCols = 30;

  // const grid = Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => 0));
  const [grid, setGrid] = useState(() => {
    const rows = new Array(numRows).fill(null);
    return rows.map(() => new Array(numCols).fill({ color: 'defaultColor', number: null }));
  });
  
  return (
    <div 
      className="
        fixed left-0 top-0 
        flex w-full justify-center 
        border-b border-orange-500 
        bg-gradient-to-b from-zinc-200 
        pb-6 pt-8 backdrop-blur-2xl 
        dark:border-neutral-800 dark:border-orange-500 dark:bg-zinc-800/30 dark:from-inherit 
        lg:static lg:w-auto lg:rounded-xl lg:border lg:border-orange-500 lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30
      "
    >
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 40px)` }}>
      {grid.map((row, rowIndex) =>
        row.map((col, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: 40,
              height: 40,
              border: '1px solid black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Cell content goes here */}
          </div>
        ))
      )}
    </div>
  </div>
  );
};

export default Grid;
