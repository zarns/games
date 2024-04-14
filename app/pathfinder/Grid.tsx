// app/pathfinder/Grid.tsx

'use client'
import React, { useState, useRef, useEffect } from 'react';
import Heap from 'heap-js';
import './Pathfinder.css';
import Legend from './Legend';
import { Cell, CellUtility, GridUtility } from './Types';

let numRows = 18;
let numCols = 30;
let displayHeight = 120;
let start = [2, 2];
let end = [numRows - 3, numCols - 3];
let current_location = start;

const Grid = () => {
  const [refreshCount, setRefreshCount] = useState(0);
  const [km, setKm] = useState<number>(0);
  const isAlgorithmRunningRef = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);

  const [delayTime, setDelayTime] = useState(1);
  const [numRandomized, setNumRandomized] = useState(50);
  const [grid, setGrid] = useState<Cell[][]>(initializeGrid);
  const priorityQueueRef = useRef<Heap<[[number, number], [number, number]]>>(initializeQueue());

  useEffect(() => {
    numRows = Math.floor(window.innerHeight / 48);
    numCols = Math.floor(window.innerWidth / 56);
    displayHeight = numRows * 60;
    start = [2, 2];
    end = [numRows - 3, numCols - 3];
    setGrid(initializeGrid());
    priorityQueueRef.current = initializeQueue();
    current_location = start;
  }, []);

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
        isObstacle: false,
        isStart: false,
        isFinish: false,
        isUnknown: true,
        g: Infinity,
        rhs: Infinity,
      }))
    );

    initialGrid[start[0]][start[1]] = {
      ...initialGrid[start[0]][start[1]], 
      isStart: true, 
      g: Infinity,
      rhs: Infinity,
    };

    initialGrid[end[0]][end[1]] = {
      ...initialGrid[end[0]][end[1]], 
      isFinish: true,
      g: Infinity,
      rhs: 0, 
    };

    start = [2, 2];
    end = [numRows - 3, numCols - 3];
    current_location = start;

    return initialGrid;
  };

  useEffect(() => {
    start = [2, 2];
    end = [numRows - 3, numCols - 3];
    setGrid(initializeGrid());
    priorityQueueRef.current = initializeQueue();
    current_location = start;
  }, [numRows, numCols]);

  function calculateKey (rowIndex: number, colIndex: number) {
    const s: Cell = grid[rowIndex][colIndex];
    const min_g_rhs = Math.min(s.g, s.rhs);
    const h = GridUtility.getManhattanDistance(rowIndex, colIndex, current_location[0], current_location[1]);
    // const h = getBFS(rowIndex, colIndex, current_location[0], current_location[1]);
    return [min_g_rhs + h + km, min_g_rhs];
  };

  async function UpdateVertex(rowIndex: number, colIndex: number) {
    let u = grid[rowIndex][colIndex];
    const u_key = calculateKey(rowIndex, colIndex);
    const isInQueue = priorityQueueRef.current.contains([[0, 0], [rowIndex, colIndex]], (element, needle) => {
      return element[1][0] === needle[1][0] && element[1][1] === needle[1][1];
    });

    if (u.g !== u.rhs) {
      if (!isInQueue) {
        priorityQueueRef.current.push([[u_key[0], u_key[1]], [rowIndex, colIndex]]);
        return;
      } else {
        updateKeyOfItemInPriorityQueue(u_key, rowIndex, colIndex);
        return;
      }
    } else {
      if (isInQueue) {
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

  async function computeShortestPath() {
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
        await updateGAndRhsValues(rowIndex, colIndex, u.rhs, u.rhs);
        priorityQueueRef.current.pop();
        const successors = getSuccessors(rowIndex, colIndex);
        for (const [x, y] of successors) {
          const s_cell = grid[x][y];
          if (x !== end[0] || y !== end[1]) {
            const newRhs = Math.min(s_cell.rhs, u.g + 1);
            await updateGAndRhsValues(x, y, s_cell.g, newRhs);
          }
          await UpdateVertex(x, y);
        }
      } else {
        const g_old = u.g;
        await updateGAndRhsValues(rowIndex, colIndex, Infinity, u.rhs);
        const successors = getSuccessors(rowIndex, colIndex).concat([[rowIndex, colIndex]]);
        for (const [x, y] of successors) {
          const s_cell = grid[x][y];
          if (s_cell.rhs === g_old + 1) {
            if (x !== end[0] || y !== end[1]) {
              const newRhs = Math.min(...getSuccessors(x, y).map(([x1, y1]) => grid[x1][y1].g + 1));
              await updateGAndRhsValues(x, y, s_cell.g, newRhs);
            }
          }
          await UpdateVertex(x, y);
        }
      }
    }
  }
    

  function shouldContinueUpdating(): boolean {
    // console.log(isAlgorithmRunningRef.current.valueOf());
    if (!isAlgorithmRunningRef.current) {
      return false;
    }
    const currentKey = calculateKey(current_location[0], current_location[1]);
    const topElementInQueue = priorityQueueRef.current.peek();
    if (!topElementInQueue) throw new Error('Priority queue is empty');
    const currCell = grid[current_location[0]][current_location[1]];
    let shouldContinue: boolean = false;
    if (currCell.rhs !== currCell.g) shouldContinue = true;
    if (topElementInQueue[0][0] < currentKey[0]) shouldContinue = true;
    if (topElementInQueue[0][0] === currentKey[0] && topElementInQueue[0][1] < currentKey[1]) shouldContinue = true;
    return shouldContinue;
  }

  function moveForward(): void {
    console.log('moveForward');

    if (current_location[0] === end[0] && current_location[1] === end[1]) {
      console.log('Already at the goal.');
      return;
    }

    const successors = getSuccessors(current_location[0], current_location[1]);

    let minGValue = Infinity;
    let nextLocation: [number, number] | null = null;
    // console.log('successors:', successors);
    successors.forEach(([x, y]) => {
      // console.log('x:', x, 'y:', y, 'g:', grid[x][y].g, 'minGValue:', minGValue);
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
    nextCell.isStart = true;
    current_location = [rowIndex, colIndex];
    setRefreshCount(prev => prev + 1);
  }

  async function runComputeShortestPath() {
    console.log('runComputeShortestPath', isAlgorithmRunningRef.current.valueOf());
    isAlgorithmRunningRef.current = !isAlgorithmRunningRef.current;
    // setAlgorithmRunning((prev: boolean) => !prev);
    if (isAlgorithmRunningRef.current) {
      console.log('Starting ComputeShortestPath');
      await computeShortestPath();
      // setAlgorithmRunning(false);
      isAlgorithmRunningRef.current = false;
      setRefreshCount(prev => prev + 1);  
    } else {
      console.log('Stopping ComputeShortestPath.');
    }
  }

  // useEffect(() => {
  //   async function handlePathfinding() {
  //     if (isAlgorithmRunningRef.current) {
  //       console.log('Starting ComputeShortestPath');
  //       await computeShortestPath();
  //       // setAlgorithmRunning(false);
  //       isAlgorithmRunningRef.current = false;
  //       setRefreshCount(prev => prev + 1);  
  //     } else {
  //       console.log('Stopping ComputeShortestPath.');
  //     }
  //   }
  //   handlePathfinding();
  // }, [algorithmRunning]);
  
  async function updateGAndRhsValues(rowIndex: number, colIndex: number, newG: number, newRhs: number) {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const curr_cell = grid[rowIndex][colIndex];
    curr_cell.g = newG;
    curr_cell.rhs = newRhs;
    curr_cell.isUnknown = false;

    await delay(delayTime);
    setRefreshCount(prev => prev + 1);
    // await delay(1);
    return;
  }

  // function getBFS(startRow: number, startCol: number, endRow: number, endCol: number): number {
  //   let start = grid[startRow][startCol];
  //   let end = grid[endRow][endCol];
  
  //   let queue = [[startRow, startCol]];
  //   let cameFrom = new Map();
  //   let distance = new Map();
  //   distance.set(start, 0);
  
  //   while (queue.length > 0) {
  //     let currentCell = queue.shift();
  //     if (!currentCell) {
  //       continue;
  //     }
  //     let [currentRow, currentCol] = currentCell;
  //     let current = grid[currentRow][currentCol];
  
  //     if (current === end) {
  //       // We have reached the end
  //       return distance.get(current);
  //     }
  
  //     let successors = getSuccessors(currentRow, currentCol);
  //     for (let [neighborRow, neighborCol] of successors) {
  //       let neighbor = grid[neighborRow][neighborCol];
  //       if (!cameFrom.has(neighbor)) {
  //         queue.push([neighborRow, neighborCol]);
  //         cameFrom.set(neighbor, current);
  //         distance.set(neighbor, distance.get(current) + 1);
  //       }
  //     }
  //   }
  
  //   return Infinity;
  // }

  const toggleObstacle = (rowIndex: number, colIndex: number) => {
    console.log("toggleObstacle")
    if (current_location[0] === rowIndex && current_location[1] === colIndex) return;
    if (end[0] === rowIndex && end[1] === colIndex) return;

    setKm(km + 1);
  
    let cell = grid[rowIndex][colIndex];
    if (!cell.isObstacle) {
      // Making the cell an obstacle
      cell.isObstacle = true;
      updateGAndRhsValues(rowIndex, colIndex, Infinity, Infinity);
    } else {
      // Reverting the cell from being an obstacle
      cell.isObstacle = false;
      cell.isUnknown = true;
      updateGAndRhsValues(rowIndex, colIndex, Infinity, RHS_ValueAfterTogglingObstacle(rowIndex, colIndex));
      UpdateVertex(rowIndex, colIndex);
    }
    const successors = getSuccessors(rowIndex, colIndex);
    successors.forEach(([x1, y1]) => {
      if (x1 === end[0] && y1 === end[1]) return;
      // placeOnPriorityQueueOrUpdate(x, y);
      let newRhsForX1 = Infinity;
      const secondarySuccessors = getSuccessors(x1, y1);
      secondarySuccessors.forEach(([x2, y2]) => {
        newRhsForX1 = Math.min(newRhsForX1, grid[x2][y2].g + 1);
      });
      updateGAndRhsValues(x1, y1, grid[x1][y1].g, newRhsForX1);
      UpdateVertex(x1, y1);
      console.log('updating successors');
    });
    setRefreshCount(prev => prev + 1);
  };

  function placeOnPriorityQueueOrUpdate(rowIndex: number, colIndex: number) {
    const cellKey = calculateKey(rowIndex, colIndex);
    const isInQueue = priorityQueueRef.current.contains([[0, 0], [rowIndex, colIndex]], (element, needle) => {
      return element[1][0] === needle[1][0] && element[1][1] === needle[1][1];
    });
    if (!isInQueue) {
      // If the cell is not in the queue, insert it
      priorityQueueRef.current.push([[0, 0], [rowIndex, colIndex]]);
      // console.log('pushed', cellKey[0], cellKey[1], rowIndex, colIndex);
    } else {
      // If the cell is in the queue, update its key using updateKeyOfItemInPriorityQueue
      updateKeyOfItemInPriorityQueue(cellKey, rowIndex, colIndex);
    }  
  }

  function RHS_ValueAfterTogglingObstacle(rowIndex: number, colIndex: number): number {
    let minRHS = Infinity;
    const cost = 1;
    getSuccessors(rowIndex, colIndex).forEach(([x, y]) => {
      const successor = grid[x][y];
      if (successor.g + cost < minRHS) {
        minRHS = successor.g + cost;
      }
    });
    return minRHS;
  }

  const randomizeObstacles = () => {
    const selectedCells = new Set<string>();
  
    while (selectedCells.size < numRandomized) {
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
    event.preventDefault();
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

  const handleTouchStart = (rowIndex: number, colIndex: number) => (event: any) => {
    event.preventDefault();
    setIsDragging(true);
    // toggleObstacle(rowIndex, colIndex);
  };

  const lastToggledCell = useRef<[number, number]>([-1, -1]);

  const handleTouchMove = (event: any) => {
    if (!isDragging) return;
    event.preventDefault();
    const touch = event.touches[0];
    const gridElement = event.currentTarget.parentNode;
    const rect = gridElement.getBoundingClientRect();
    const rowIndex = Math.floor((touch.clientY - rect.top) / (rect.height / numRows));
    const colIndex = Math.floor((touch.clientX - rect.left) / (rect.width / numCols));
    if (rowIndex >= 0 && rowIndex < numRows && colIndex >= 0 && colIndex < numCols) {
      if (rowIndex !== lastToggledCell.current[0] || colIndex !== lastToggledCell.current[1]) {
        lastToggledCell.current = [rowIndex, colIndex];
        toggleObstacle(rowIndex, colIndex);
      }
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false); // Reset dragging state when touch ends
  };
  

  function handleReinitialize() {
    // setAlgorithmRunning(false);
    isAlgorithmRunningRef.current = false;
    setGrid(initializeGrid());
    priorityQueueRef.current = initializeQueue();
    current_location = start;
    setRefreshCount(0);
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
      <div>
        <div className="scrollable-body" style={{maxHeight: `${displayHeight}px`}}>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>KeyA</th>
              <th style={{ textAlign: 'center' }}>KeyB</th>
              <th style={{ textAlign: 'center' }}>Row</th>
              <th style={{ textAlign: 'center' }}>Col</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {queueItemsInOrder.map(([[primaryKey, secondaryKey], [rowNum, colNum]], index) => (
              <tr key={index}>
              <td style={{ textAlign: 'center' }}>{primaryKey === Infinity ? '∞' : primaryKey}</td>
              <td style={{ textAlign: 'center' }}>{secondaryKey === Infinity ? '∞' : secondaryKey}</td>
              <td style={{ textAlign: 'center' }}>{rowNum}</td>
                <td style={{ textAlign: 'center' }}>{colNum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    );
  };

  return (
  <div>
    <div className="border-b border-orange-500 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-orange-500 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:border-orange-500 lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
      <div className='queue-and-grid-container'>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 60px)` }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onMouseDown={handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onTouchStart={handleTouchStart(rowIndex, colIndex)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
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
          Compute Path
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
          Randomize
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">
          Randomly generate obstacles
        </p>
      </button>
    </div>
    <Legend
        setDelayTime={setDelayTime}
        setNumRandomized={setNumRandomized}
      />
  </div>
  );
};
  

export default Grid;
