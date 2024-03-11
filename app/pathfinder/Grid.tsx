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
  isUnknown: boolean;
  g: number;
  rhs: number;
};

class CellUtility {
  static colorScale = d3.scaleSequential<string>((t) => d3
  .interpolateRgb("rgba(255, 165, 0, .9)", "rgba(128, 0, 13, .9)")(t))
    .domain([1, 10]);

  static getColorForCell(cell: Cell): string {
    if (cell.isStart) return 'green';
    if (cell.isFinish) return 'red';
    if (cell.isObstacle) return 'black';
    if (cell.isUnknown) return 'gray';
    return CellUtility.colorScale(cell.g % 10);
  }

  // static getColorForDistance(distance: number): string {
  //   switch (distance) {
  //     case -4:
  //       return 'gray'; // unknown
  //     case -3:
  //       return 'blue'; // user
  //     case -2:
  //       return 'black'; // obstacle
  //     case -1:
  //       return 'green'; // start
  //     case 0:
  //       return 'red'; // end
  //     default:
  //       return CellUtility.colorScale(distance) || 'white';
  //   }
  // }
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
    // Calculate the key for the goal node
    const endKey = calculateKey(end[0], end[1]);
    // Add the start node to the queue
    newPriorityQueue.push([[endKey[0], endKey[1]], [end[0], end[1]]]);
    return newPriorityQueue;
  };

  function initializeGrid(): Cell[][] {
    let initialGrid = Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => ({
        distance: 27,
        isObstacle: false,
        isStart: false,
        isFinish: false,
        isUnknown: true,
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
      rhs: 0, 
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
    console.log('UpdateVertex:', rowIndex, colIndex);
    let cell = grid[rowIndex][colIndex];
    // Calculate the minimum rhs value for all vertices except for the goal
    if (!(rowIndex === end[0] && colIndex === end[1])) {
      let minRhs = Infinity;
      const successors = getSuccessors(rowIndex, colIndex);
      successors.forEach(([succRow, succCol]) => {
        const successor = grid[succRow][succCol];
        minRhs = Math.min(minRhs, successor.g + 1); // Assuming the cost from cell to successor is 1
      });
      cell.rhs = minRhs;
      cell.isUnknown = false;
    }
    const cellKey = calculateKey(rowIndex, colIndex);
    const isInQueue = priorityQueueRef.current.contains([[0, 0], [rowIndex, colIndex]], (element, needle) => {
      return element[1][0] === needle[1][0] && element[1][1] === needle[1][1];
    });
    

    // Update the vertex in the priority queue based on the D* Lite logic
    if (cell.g !== cell.rhs) {
      if (!isInQueue) {
        // If the cell is not in the queue, insert it
        priorityQueueRef.current.push([[cellKey[0], cellKey[1]], [rowIndex, colIndex]]);
        console.log('pushed', cellKey[0], cellKey[1], rowIndex, colIndex);
      } else {
        // If the cell is in the queue, update its key using updateKeyOfItemInPriorityQueue
        updateKeyOfItemInPriorityQueue(cellKey, rowIndex, colIndex);
      }
    } else {
      if (isInQueue) {
        // If the cell's g and rhs are equal and it's in the queue, remove it from the queue
        priorityQueueRef.current.remove([[0, 0], [rowIndex, colIndex]], (element, needle) => {
          return element[1][0] === needle[1][0] && element[1][1] === needle[1][1];
        });
      }
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
  
      // Check bounds and obstacle status
      if (newX >= 0 && newX < numRows && newY >= 0 && newY < numCols && !grid[newX][newY].isObstacle) {
        successors.push([newX, newY]);
      }
    });
  
    return successors;
  }  

  function computeShortestPath() { // Not finished
    console.log('computeShortestPath');

    while (shouldContinueUpdating()) {
      const topElement = priorityQueueRef.current.peek();
      if (!topElement) throw new Error('Priority queue is empty');
      const [[primaryKey, secondaryKey], [rowIndex, colIndex]] = topElement;
      const u = grid[rowIndex][colIndex];
      const kOld = [primaryKey, secondaryKey];
      const kNew = calculateKey(rowIndex, colIndex);

      if (kOld < kNew) {
        updateKeyOfItemInPriorityQueue(kNew, rowIndex, colIndex);
      } else if (u.g > u.rhs) {
        u.g = u.rhs;
        priorityQueueRef.current.pop();
        getSuccessors(rowIndex, colIndex).forEach(([x, y]) => UpdateVertex(x, y)); // Update successors since u's g-value has decreased.
      } else {
        let oldG = u.g;
        u.g = Infinity;
        getSuccessors(rowIndex, colIndex).concat([[rowIndex, colIndex]]).forEach(([x, y]) => UpdateVertex(x, y)); // Include u in the update if g is set to Infinity.
      }
    }
  }

  function shouldContinueUpdating(): boolean {
    const currentKey = calculateKey(current_location[0], current_location[1]);
    const topElementInQueue = priorityQueueRef.current.peek();
    if (!topElementInQueue) throw new Error('Priority queue is empty');
    const currCell = grid[current_location[0]][current_location[1]];
    console.log('topElementInQueue:',topElementInQueue[0][0], topElementInQueue[0][1], topElementInQueue[1][0], topElementInQueue[1][1]);
    console.log('rhs:',currCell.rhs, 'g:', currCell.g, 'currentKey:', currentKey[0])
    console.log('currentKey', currentKey[0], currentKey[1]);
    const shouldContinue: boolean = currCell.rhs > currCell.g || 
          topElementInQueue[0][0] < currentKey[0] ||
          (topElementInQueue[0][0] === currentKey[0] && topElementInQueue[0][1] < currentKey[1]);
    console.log('shouldContinue:', shouldContinue);
    return shouldContinue;
  }

  function moveForward(): void {
    console.log('moveForward');
    const successors = getSuccessors(current_location[0], current_location[1]);

    let minGValue = Infinity;
    let nextLocation: [number, number] | null = null;
    console.log('successors:', successors);
    successors.forEach(([x, y]) => {
      console.log('x:', x, 'y:', y, 'g:', grid[x][y].g, 'minGValue:', minGValue);
      if (grid[x][y].g < minGValue) {
        minGValue = grid[x][y].g;
        nextLocation = [x, y];
      }
    });
  
    // Update the current location if a next location is found
    if (nextLocation) {
      updateCurrentLocation(nextLocation[0], nextLocation[1]);
    } else {
      console.log("No accessible successor found. Cannot move forward.");
    }
  }

  function updateCurrentLocation(rowIndex: number, colIndex: number) {
    console.log(`Moving to next location: (${rowIndex}, ${colIndex})`);
    let currentCell = grid[current_location[0]][current_location[1]];
    let nextCell = grid[rowIndex][colIndex];
    currentCell.isStart = false;
    // maybe need to update currentCell g value?
    nextCell.isStart = true;
    current_location = [rowIndex, colIndex];
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
    if (!cell.isObstacle) {
      // Making the cell an obstacle
      cell.isObstacle = true;
      cell.g = Infinity;
      cell.rhs = Infinity;
      const successors = getSuccessors(rowIndex, colIndex);
      successors.forEach(([x, y]) => placeOnPriorityQueueOrUpdate(x, y));
    } else {
      // Reverting the cell from being an obstacle (if needed in your application)
      cell.isObstacle = false;
      cell.isUnknown = true;
      cell.g = Infinity;
      cell.rhs = RHS_ValueAfterTogglingObstacle(rowIndex, colIndex);
    }
    placeOnPriorityQueueOrUpdate(rowIndex, colIndex);
    setRefresh(!refresh);
  };

  function placeOnPriorityQueueOrUpdate(rowIndex: number, colIndex: number) {
    const cellKey = calculateKey(rowIndex, colIndex);
    const isInQueue = priorityQueueRef.current.contains([[0, 0], [rowIndex, colIndex]], (element, needle) => {
      return element[1][0] === needle[1][0] && element[1][1] === needle[1][1];
    });
    if (!isInQueue) {
      // If the cell is not in the queue, insert it
      priorityQueueRef.current.push([[cellKey[0], cellKey[1]], [rowIndex, colIndex]]);
      console.log('pushed', cellKey[0], cellKey[1], rowIndex, colIndex);
    } else {
      // If the cell is in the queue, update its key using updateKeyOfItemInPriorityQueue
      updateKeyOfItemInPriorityQueue(cellKey, rowIndex, colIndex);
    }  
  }

  function RHS_ValueAfterTogglingObstacle(rowIndex: number, colIndex: number): number {
    let minRHS = Infinity;
    getSuccessors(rowIndex, colIndex).forEach(([x, y]) => {
      const successor = grid[x][y];
      const cost = 1;
      minRHS = Math.min(minRHS, successor.g + cost);
    });
    return minRHS;
  }

  const randomizeObstacles = () => {
    const selectedCells = new Set<string>();
  
    while (selectedCells.size < 5) { // Adjusted to 5 for uniqueness
      const rowIndex = Math.floor(Math.random() * numRows);
      const colIndex = Math.floor(Math.random() * numCols);
  
      const isStart = rowIndex === start[0] && colIndex === start[1];
      const isEnd = rowIndex === end[0] && colIndex === end[1];
      const isCurrent = rowIndex === current_location[0] && colIndex === current_location[1];
  
      if (!isStart && !isEnd && !isCurrent) {
        const cellKey = `${rowIndex},${colIndex}`;
        selectedCells.add(cellKey);
      }
    }
  
    selectedCells.forEach((cellKey) => {
      const [rowIndex, colIndex] = cellKey.split(',').map(Number);
      toggleObstacle(rowIndex, colIndex);
    });
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

  const handleRandomizeObstacles = () => {
    randomizeObstacles();
  };  

  type PriorityQueueDisplayProps = {
    priorityQueue: Heap<[[number, number], [number, number]]>;
  };

  const PriorityQueueDisplay = ({ priorityQueue }: PriorityQueueDisplayProps) => {
    if (!priorityQueue) return <div>No queue data available.</div>;
    
    // Clone the priority queue to ensure the original is not modified.
    const tempQueue: Heap<[[number, number], [number, number]]> = priorityQueue.clone();
    const queueItemsInOrder: [[number, number], [number, number]][] = [];

    while (!tempQueue.isEmpty()) {
      const item = tempQueue.pop() as [[number, number], [number, number]];
      queueItemsInOrder.push(item);
    }
  
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
          {queueItemsInOrder.map(([[primaryKey, secondaryKey], [rowNum, colNum]], index) => (
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
        {/* <div className="queue-display-container">
          <PriorityQueueDisplay priorityQueue={priorityQueueRef.current} />
        </div> */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 60px)` }}> {/* Adjusted width for additional info */}
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onMouseDown={handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                style={{
                  width: 60,
                  height: 60,
                  border: '1px solid white',
                  backgroundColor: CellUtility.getColorForCell(cell),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  padding: '0',
                  cursor: 'pointer',
                }}
              >
                <div>G: {cell.g === Infinity ? '∞' : cell.g.toFixed(0)}</div>
                <div>R: {cell.rhs === Infinity ? '∞' : cell.rhs.toFixed(0)}</div>
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
