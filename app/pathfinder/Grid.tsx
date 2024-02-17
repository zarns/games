// app/pathfinder/Grid.tsx

'use client'
import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import Heap from 'heap-js';
import './Pathfinder.css';

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
let current_location = start;

const Grid = () => {
  const [refresh, setRefresh] = useState(false);
  const [km, setKm] = useState<number>(0);
  const [algorithmRunning, setAlgorithmRunning] = useState<boolean>(false);
  const [grid, setGrid] = useState<Cell[][]>(initializeGrid);
  const [isDragging, setIsDragging] = useState(false);
  const priorityQueueRef = useRef<Heap<[[number, number], [number, number]]>>(initializeQueue());

  function initializeQueue(): Heap<[[number, number], [number, number]]> {
    const newPriorityQueue = new Heap<[[number, number], [number, number]]>((a, b) => {
      const primaryComparison = a[0][0] - b[0][0]; // Compare the primary keys
      if (primaryComparison !== 0) return primaryComparison;
      return a[0][1] - b[0][1]; // Compare the secondary keys
    });
    // Calculate the key for the start node
    const startKey = calculateKey(start[0], start[1]);
    // Add the start node to the queue
    newPriorityQueue.push([[startKey[0], startKey[1]], [start[0], start[1]]]);
    return newPriorityQueue;
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

  function calculateKey (rowIndex: number, colIndex: number) {
    const curr_cell: Cell = grid[rowIndex][colIndex];
    const min_g_rhs = Math.min(curr_cell.g, curr_cell.rhs);
    const h = GridUtility.getManhattanDistance(rowIndex, colIndex, end[0], end[1]);
    return [min_g_rhs + h + km, min_g_rhs];
  };

  function UpdateVertex(rowIndex: number, colIndex: number) {
    let cell = grid[rowIndex][colIndex];
    if (!(rowIndex === end[0] && colIndex === end[1])) return;
    
    // Find the minimum rhs value from successors
    cell.rhs = getSuccessors(rowIndex, colIndex).reduce((minRhs, [x, y]) => {
      const successor = grid[x][y];
      return Math.min(minRhs, successor.g + 1);
    }, Infinity);    {
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
    const isInQueue = priorityQueueRef.current.contains([[0, 0], [rowIndex, colIndex]], (element, needle) => {
      return element[1][0] === needle[1][0] && element[1][1] === needle[1][1];
    });
    
    if (cell.g !== cell.rhs) {
      if (isInQueue) {
        updateKeyOfItemInPriorityQueue(cellKey, rowIndex, colIndex);
      } else {
        priorityQueueRef.current.push([[cellKey[0],cellKey[1]], [rowIndex, colIndex]]);
      }
    } else if (isInQueue) {
      priorityQueueRef.current.remove([[0, 0], [rowIndex, colIndex]], (element, needle) => {
        return element[1][0] === needle[1][0] && element[1][1] === needle[1][1];
      });
    }
  }

  function updateKeyOfItemInPriorityQueue(newKey: number[], rowIndex: number, colIndex: number) {
    priorityQueueRef.current.remove([[0, 0], [rowIndex, colIndex]], (element, needle) => {
      return element[1][0] === needle[1][0] && element[1][1] === needle[1][1];
    });  
    priorityQueueRef.current.push([[newKey[0],newKey[1]], [rowIndex, colIndex]]);
  }

  function getSuccessors(rowIndex: number, colIndex: number): [number, number][] {
    const successors: [number, number][] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
  
    directions.forEach(([dx, dy]) => {
      const newX = rowIndex + dx;
      const newY = colIndex + dy;
  
      if (newX >= 0 && newX < numRows && newY >= 0 && newY < numCols) {
        successors.push([newX, newY]);
      }
    });
  
    return successors;
  }

  function computeShortestPath() { // Not finished
    console.log('computeShortestPath');

    while (shouldContinueUpdating()) {
      console.log('computeShortestPath');
      const topElement = priorityQueueRef.current.peek();
      if (!topElement) throw new Error('Priority queue is empty');
      const [[primaryKey, secondaryKey], [rowIndex, colIndex]] = topElement;
      const u = grid[rowIndex][colIndex];
      const kOld = [primaryKey, secondaryKey];
      const kNew = calculateKey(rowIndex, colIndex);

      if (kOld < kNew) {
        UpdateVertex(rowIndex, colIndex);
      } else if (u.g > u.rhs) {
        u.g = u.rhs;        
      } else {
        u.g = Infinity;
      }
      // Update this vertex, and all of its predecessors
      UpdateVertex(rowIndex, colIndex);
      getSuccessors(rowIndex, colIndex).forEach(([x, y]) => {
        UpdateVertex(x, y);
      });
    }
  }

  function shouldContinueUpdating(): boolean {
    const currentKey = calculateKey(current_location[0], current_location[1]);
    const topElementInQueue = priorityQueueRef.current.peek();
    if (!topElementInQueue) throw new Error('Priority queue is empty');
    const currCell = grid[current_location[0]][current_location[1]];
    console.log('topElementInQueue:',topElementInQueue[0][0], topElementInQueue[0][1], topElementInQueue[1][0], topElementInQueue[1][1]);
    console.log('rhs:',currCell.rhs, 'g:', currCell.g, 'currentKey:', currentKey[0])
    return currCell.rhs > currCell.g || 
          topElementInQueue[0][0] < currentKey[0] ||
          (topElementInQueue[0][0] === currentKey[0] && topElementInQueue[0][1] < currentKey[1]);
  }

  function moveForward(): void {
    
    setRefresh(!refresh);
  }

  function runComputeShortestPath() {
    setAlgorithmRunning(true);
    computeShortestPath();
    setAlgorithmRunning(false);
    setRefresh(!refresh);
  }

  const toggleObstacle = (rowIndex: number, colIndex: number) => {
    if (current_location[0] === rowIndex && current_location[1] === colIndex) return;
    if (end[0] === rowIndex && end[1] === colIndex) return;

    let cell = grid[rowIndex][colIndex];
    cell.distance = cell.distance === -2 ? -4 : -2;
    cell.isObstacle = true;
    setRefresh(!refresh);
  };

  const handleMouseDown = (rowIndex: number, colIndex: number) => (event: any) => {
    setIsDragging(true);
    toggleObstacle(rowIndex, colIndex);

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isDragging) {
      toggleObstacle(rowIndex, colIndex);
    }
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

  function handleReinitialize() {
    setGrid(initializeGrid());
    priorityQueueRef.current = initializeQueue();
    setRefresh(!refresh);
  };

  function handleComputeShortestPath() {
    runComputeShortestPath();
  };

  function handleMoveForward() {
    moveForward();
  };

  function handleRandomizeObstacles() {
    throw new Error('Function not implemented.');
  };

  type PriorityQueueDisplayProps = {
    priorityQueue: Heap<[[number, number], [number, number]]>;
  };

  const PriorityQueueDisplay = ({ priorityQueue }: PriorityQueueDisplayProps) => {
    if (!priorityQueue) return <div>No queue data available.</div>;
  
    const queueItems = priorityQueue.toArray();

    return (
      <table>
        <thead>
          <tr>
            <th>KeyA</th>
            <th>KeyB</th>
            <th>Row</th>
            <th>Col</th>
          </tr>
        </thead>
        <tbody>
          {queueItems.map(([[primaryKey, secondaryKey], [rowNum, colNum]], index) => (
            <tr key={index}>
              <td>{primaryKey}</td>
              <td>{secondaryKey}</td>
              <td>{rowNum}</td>
              <td>{colNum}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  

  return (
  <div>
    <div className="border-b border-orange-500 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-orange-500 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:border-orange-500 lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
      <div className='queue-and-grid-container'>
        <div className="queue-display-container">
          <PriorityQueueDisplay priorityQueue={priorityQueueRef.current} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 40px)` }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onMouseDown={handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
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
              >
                {cell.distance}
              </button>
            ))
          )}
        </div>
        <div className="queue-display-container">
          <PriorityQueueDisplay priorityQueue={priorityQueueRef.current} />
        </div>
      </div>
    </div>
    <div className="button-container">
      <button onClick={handleReinitialize} className="grid-button">
        <h2 className="mb-3 text-2xl font-semibold">
          Reinitialize
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">
          Reset grid to initial state
        </p>
      </button>
      <button onClick={handleComputeShortestPath} className="grid-button">
        <h2 className="mb-3 text-2xl font-semibold">
          ComputeShortestPath
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">
          Explore nodes on priorityQueue
        </p>
      </button>
      <button onClick={handleMoveForward}className="grid-button">
        <h2 className="mb-3 text-2xl font-semibold">
          Move Forward
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">
          One space at a time
        </p>
      </button>
      <button onClick={handleRandomizeObstacles} className="grid-button">
        <h2 className="mb-3 text-2xl font-semibold">
          Randomize Obstacles
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">
          Randomly generate obstacles
        </p>
      </button>
    </div>
  </div>
  );
};
  

export default Grid;
