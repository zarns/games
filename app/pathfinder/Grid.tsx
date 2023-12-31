// app/pathfinder/Grid.tsx

'use client'
import React, { useState, useRef } from 'react';
import * as d3 from 'd3';
import Heap from 'heap-js';

type Cell = {
  distance: number;
  isObstacle: boolean;
  isStart: boolean;
  isFinish: boolean;
  g: number;
  rhs: number;
};

class CellUtility {
  static colorScale = d3.scaleSequential<string>((t) => d3
  .interpolateRgb("rgba(255, 165, 0, .9)", "rgba(128, 0, 13, .9)")(t))
    .domain([1, 50]);

  static getColorForDistance(distance: number): string {
    switch (distance) {
      case -4:
        return 'gray'; // unknown
      case -3:
        return 'blue'; // user
      case -2:
        return 'black'; // obstacle
      case -1:
        return 'green'; // start
      case 0:
        return 'red'; // end
      default:
        return CellUtility.colorScale(distance) || 'white';
    }
  }
}

class GridUtility {
  static getManhattanDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
};

const numRows = 18;
const numCols = 30;
const start = [2, 2];
const end = [numRows - 3, numCols - 3];

const Grid = () => {
  const [refresh, setRefresh] = useState(false);
  const [km, setKm] = useState<number>(0);
  const [algorithmRunning, setAlgorithmRunning] = useState<boolean>(false);
  const [grid, setGrid] = useState<Cell[][]>(initializeGrid);
  const priorityQueueRef = useRef<Heap<[number, number]>>(initializeQueue());

  function initializeQueue(): Heap<[number, number]> {
    return new Heap<[number, number]>((a, b) => {
      const primaryComparison = a[0] - b[0]; // Compare the first elements of the tuples
      if (primaryComparison !== 0) return primaryComparison;
      return a[1] - b[1]; // Compare the second elements of the tuples
    });
  };

  function initializeGrid(): Cell[][] {
    let initialGrid = Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => ({
        distance: 27,
        isObstacle: false,
        isStart: false,
        isFinish: false,
        g: Infinity,
        rhs: Infinity,
      }))
    );

    initialGrid[start[0]][start[1]] = { // Set the start cell
      ...initialGrid[start[0]][start[1]], 
      distance: -1, 
      isStart: true, 
      g: Infinity,
      rhs: 0,
    };

    initialGrid[end[0]][end[1]] = { // Set the end cell
      ...initialGrid[end[0]][end[1]], 
      distance: 0, 
      isFinish: true,
      g: Infinity,
      rhs: Infinity, 
    };

    return initialGrid;
  };

  const calculateKey = (rowIndex: number, colIndex: number) => {
    const curr_cell: Cell = grid[rowIndex][colIndex];
    const min_g_rhs = Math.min(curr_cell.g, curr_cell.rhs);
    const h = GridUtility.getManhattanDistance(rowIndex, colIndex, end[0], end[1]);
    return [min_g_rhs + h + km, min_g_rhs];
  };

  function UpdateVertex(rowIndex: number, colIndex: number) {
    let cell = grid[rowIndex][colIndex];
    if (!(rowIndex === end[0] && colIndex === end[1])) {
      let minRhs = Infinity;

      // Find the minimum rhs value from 'successor' nodes
      const successors = getSuccessors(rowIndex, colIndex);
      successors.forEach(([x, y]) => {
        const successor = grid[x][y];
        minRhs = Math.min(minRhs, successor.g + 1);
      });
      cell.rhs = minRhs;
    }
    const cellKey = calculateKey(rowIndex, colIndex);
    const isInQueue = priorityQueueRef.current.contains([rowIndex, colIndex]);

    if (cell.g !== cell.rhs) {
      if (isInQueue) {
        priorityQueueRef.current.update(cellKey, [rowIndex, colIndex]);
      } else {
        priorityQueueRef.current.push(cellKey);
      }
    } else if (isInQueue) {
      priorityQueueRef.current.updateItem.remove(cellKey);
    }
  }

  function getSuccessors(rowIndex: number, colIndex: number): [number, number][] {
    return [[1,1]];
  }

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    let cell = grid[rowIndex][colIndex];
    cell.distance = cell.distance === -2 ? -4 : -2;
    cell.isObstacle = true;
    setRefresh(!refresh);
  };

  const handleResumeAlgorithm = () => {
    console.log('handleResumeAlgorithm');
    setAlgorithmRunning(true);
    grid.map((row, rowIndex) => {
      row.map((cell, colIndex) => {
        // implement something
      });
    });
    setAlgorithmRunning(false);
    setRefresh(!refresh);
  };

  const handleManhattan = () => {
    console.log('handleManhattan');
    setAlgorithmRunning(true);
    grid.map((row, rowIndex) => {
      row.map((cell, colIndex) => {
        const newDistance = GridUtility.getManhattanDistance(rowIndex, colIndex, end[0], end[1]);
        if (!cell.isObstacle && !cell.isStart && !cell.isFinish)
        cell.distance = newDistance;
      });
    });
    setAlgorithmRunning(false);
    setRefresh(!refresh);
  };

  const handleRandomizeObstacles = () => {
    throw new Error('Function not implemented.');
  }

  return (
  <div>
    <div 
      className="
        fixed left-0 top-0 
        flex w-full justify-center 
        border-b border-orange-500 
        bg-gradient-to-b from-zinc-200 
        pb-6 pt-8 backdrop-blur-2xl 
        dark:border-neutral-800 dark:border-orange-500 dark:bg-zinc-800/30 dark:from-inherit 
        lg:static lg:w-auto lg:rounded-xl lg:border lg:border-orange-500 lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
    >
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 40px)` }}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: 40,
                height: 40,
                border: '1px solid white',
                backgroundColor: CellUtility.getColorForDistance(cell.distance),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                cursor: 'pointer',
              }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell.distance}
            </button>
          ))
        )}
      </div>
    </div>
    <div className="grid gap-4 text-center lg:grid-cols-4 lg:text-left mt-2 mb-2">
      <button
        onClick={handleResumeAlgorithm}
        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
      >
        <h2 className="mb-3 text-2xl font-semibold">
          Resume Algorithm
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">
          Resume from current state
        </p>
      </button>
      <button
        onClick={handleManhattan} // Replace with appropriate function for each button
        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
      >
        <h2 className="mb-3 text-2xl font-semibold">
          Manhattan Time
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">
          Button Description
        </p>
      </button>
      <button
        onClick={handleResumeAlgorithm}
        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
      >
        <h2 className="mb-3 text-2xl font-semibold">
          Move forward
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">
          Button Description
        </p>
      </button>
      <button
        onClick={handleRandomizeObstacles}
        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
      >
        <h2 className="mb-3 text-2xl font-semibold">
          Randomize Obstacles
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">
          Button Description {/* Replace with each button's description */}
        </p>
      </button>
    </div>
  </div>
  );
};
  

export default Grid;
